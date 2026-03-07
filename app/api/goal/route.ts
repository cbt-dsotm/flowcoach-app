import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  let sessionId = req.cookies.get('session_id')?.value
  let setCookie = false

  if (!sessionId) {
    sessionId = crypto.randomUUID()
    setCookie = true
  }

  const { topic, win_condition, confidence } = await req.json()

  if (!topic) {
    return NextResponse.json({ error: 'Topic required' }, { status: 400 })
  }

  const supabase = createServiceClient()

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

  const response = NextResponse.json({ ok: true })
  if (setCookie) {
    response.cookies.set('session_id', sessionId, { path: '/', maxAge: 86400 })
  }
  return response
}
