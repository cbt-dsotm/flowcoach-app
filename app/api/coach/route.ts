import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase'
import { buildSystemPrompt, Hat } from '@/lib/prompts'

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
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('turn_count')
    .eq('id', sessionId)
    .single()

  if (sessionError && sessionError.code !== 'PGRST116') {
    return NextResponse.json({ error: 'Session error' }, { status: 500 })
  }

  const turnCount = session?.turn_count ?? 0

  if (turnCount >= TURN_LIMIT) {
    return NextResponse.json(
      { error: 'Session limit reached', limitReached: true },
      { status: 429 }
    )
  }

  const { message, hat = 'white', difficulty } = await req.json()

  if (!message) {
    return NextResponse.json({ error: 'Message required' }, { status: 400 })
  }

  // Ensure session row exists
  await supabase.from('sessions').upsert({
    id: sessionId,
    turn_count: turnCount,
    updated_at: new Date().toISOString(),
  })

  // Load profile + goal + message history in parallel
  const [{ data: profile }, { data: goal }, { data: history }] = await Promise.all([
    supabase.from('profiles').select('*').eq('session_id', sessionId).single(),
    supabase.from('goals').select('*').eq('session_id', sessionId).single(),
    supabase
      .from('messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(20),
  ])

  // Build system prompt from profile + goal
  const systemPrompt = goal
    ? buildSystemPrompt(hat as Hat, profile ?? {}, goal)
    : 'You are FlowCoach, an adaptive AI learning companion.'

  // Prepend difficulty signal from previous turn if provided
  const userContent = difficulty
    ? `[Difficulty signal from last turn: ${difficulty}]\n\n${message}`
    : message

  // Save user message
  await supabase.from('messages').insert({
    session_id: sessionId,
    role: 'user',
    content: userContent,
  })

  // Build full message history for Claude
  const claudeMessages: { role: 'user' | 'assistant'; content: string }[] = [
    ...(history ?? []).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: userContent },
  ]

  // Call Claude
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: claudeMessages,
  })

  const reply = response.content[0].type === 'text' ? response.content[0].text : ''

  // Save assistant message + update turn count
  await Promise.all([
    supabase.from('messages').insert({
      session_id: sessionId,
      role: 'assistant',
      content: reply,
    }),
    supabase
      .from('sessions')
      .update({ turn_count: turnCount + 1, updated_at: new Date().toISOString() })
      .eq('id', sessionId),
  ])

  const newCount = turnCount + 1
  const warning = newCount >= TURN_WARNING && newCount < TURN_LIMIT

  return NextResponse.json({
    reply,
    turnCount: newCount,
    warning: warning ? `You've used ${newCount} of ${TURN_LIMIT} turns this session.` : null,
  })
}
