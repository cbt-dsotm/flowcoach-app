import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase'

const anthropic = new Anthropic()

const TURN_LIMIT = 200
const TURN_WARNING = 175

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get('session_id')?.value

  if (!sessionId) {
    return NextResponse.json({ error: 'No session ID' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Check turn count
  const { data: session, error } = await supabase
    .from('sessions')
    .select('turn_count')
    .eq('id', sessionId)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: 'Session error' }, { status: 500 })
  }

  const turnCount = session?.turn_count ?? 0

  if (turnCount >= TURN_LIMIT) {
    return NextResponse.json(
      { error: 'Session limit reached', limitReached: true },
      { status: 429 }
    )
  }

  const { message, systemPrompt } = await req.json()

  if (!message) {
    return NextResponse.json({ error: 'Message required' }, { status: 400 })
  }

  // Ensure session row exists before inserting messages (foreign key requirement)
  await supabase.from('sessions').upsert({
    id: sessionId,
    turn_count: turnCount,
    updated_at: new Date().toISOString(),
  })

  // Save user message
  await supabase.from('messages').insert({
    session_id: sessionId,
    role: 'user',
    content: message,
  })

  // Call Claude
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt ?? 'You are FlowCoach, an adaptive AI learning companion.',
    messages: [{ role: 'user', content: message }],
  })

  const reply = response.content[0].type === 'text' ? response.content[0].text : ''

  // Save assistant message
  await supabase.from('messages').insert({
    session_id: sessionId,
    role: 'assistant',
    content: reply,
  })

  // Update turn count
  await supabase
    .from('sessions')
    .update({ turn_count: turnCount + 1, updated_at: new Date().toISOString() })
    .eq('id', sessionId)

  const newCount = turnCount + 1
  const warning = newCount >= TURN_WARNING && newCount < TURN_LIMIT

  return NextResponse.json({
    reply,
    turnCount: newCount,
    warning: warning ? `You've used ${newCount} of ${TURN_LIMIT} turns this session.` : null,
  })
}
