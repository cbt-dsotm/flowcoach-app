import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase'
import { createAuthClient } from '@/lib/supabase-server'
import { buildHatContentPrompt, Hat } from '@/lib/prompts'

const anthropic = new Anthropic()

export async function POST(req: NextRequest) {
  const authClient = await createAuthClient()
  const { data: { user } } = await authClient.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { hat, topic, win_condition, confidence, difficulty_instruction } = await req.json()

  if (!hat || !topic) {
    return NextResponse.json({ error: 'hat and topic required' }, { status: 400 })
  }

  const prompt = buildHatContentPrompt(
    hat as Hat,
    topic,
    win_condition ?? null,
    confidence ?? null,
    difficulty_instruction ?? null
  )

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = response.content[0].type === 'text' ? response.content[0].text : ''

  return NextResponse.json({ content })
}
