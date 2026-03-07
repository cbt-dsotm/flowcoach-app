import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { createAuthClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const authClient = await createAuthClient()
  const { data: { user } } = await authClient.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { topic, win_condition, confidence } = await req.json()

  if (!topic) {
    return NextResponse.json({ error: 'Topic required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { error } = await supabase.from('goals').upsert({
    user_id: user.id,
    topic,
    win_condition: win_condition ?? null,
    confidence: confidence ?? null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })

  if (error) {
    console.error('Goal save error:', error)
    return NextResponse.json({ error: 'Failed to save goal' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
