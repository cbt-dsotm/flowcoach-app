import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase'
import { createAuthClient } from '@/lib/supabase-server'
import { PROFILE_SECTIONS } from '@/lib/profile-sections'

const anthropic = new Anthropic()

export async function POST(req: NextRequest) {
  const authClient = await createAuthClient()
  const { data: { user } } = await authClient.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { section, messages, finalize } = await req.json()

  const sectionDef = PROFILE_SECTIONS.find((s) => s.id === section)
  if (!sectionDef) {
    return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
  }

  if (finalize) {
    // Non-streaming: ask Claude to synthesize, save result to Supabase
    const summaryMessages = [
      ...(messages ?? []),
      {
        role: 'user' as const,
        content:
          'Please finalize my profile for this section. Write a summary using the SUMMARY: format described in your instructions. Be specific — use what I actually told you.',
      },
    ]

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: sectionDef.chatSystemPrompt,
      messages: summaryMessages,
    })

    const text =
      response.content[0].type === 'text' ? response.content[0].text : ''
    const summaryMatch = text.match(/SUMMARY:\s*([\s\S]+)/i)
    const summary = summaryMatch ? summaryMatch[1].trim() : text.trim()

    // Upsert into profiles.profile_data
    const supabase = createServiceClient()
    const { data: existing } = await supabase
      .from('profiles')
      .select('profile_data')
      .eq('user_id', user.id)
      .single()

    const profileData = (existing?.profile_data as Record<string, string>) ?? {}
    profileData[section] = summary

    await supabase
      .from('profiles')
      .upsert(
        { user_id: user.id, profile_data: profileData, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )

    return NextResponse.json({ summary, saved: true })
  }

  // Streaming response for regular conversation turns
  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: sectionDef.chatSystemPrompt,
    messages: messages ?? [],
  })

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          controller.enqueue(new TextEncoder().encode(chunk.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
