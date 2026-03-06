import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get('session_id')?.value

  if (!sessionId) {
    return NextResponse.json({ error: 'No session ID' }, { status: 400 })
  }

  const { topic, win_condition, confidence } = await req.json()

  if (!topic) {
    return NextResponse.json({ error: 'Topic required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Clear message history so the new sprint starts fresh
  await supabase.from('messages').delete().eq('session_id', sessionId)

  const { error } = await supabase.from('goals').upsert({
    session_id: sessionId,
    topic,
    win_condition: win_condition ?? null,
    confidence: confidence ?? null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'session_id' })

  if (error) {
    console.error('Goal save error:', error)
    return NextResponse.json({ error: 'Failed to save goal' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
