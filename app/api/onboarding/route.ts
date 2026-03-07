import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { createAuthClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const authClient = await createAuthClient()
  const { data: { user } } = await authClient.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const supabase = createServiceClient()

  const { error } = await supabase.from('profiles').upsert({
    user_id: user.id,
    energy: body.energy ?? null,
    learning_style: body.learning_style ?? null,
    distraction_pattern: body.distraction_pattern ?? null,
    feedback_style: body.feedback_style ?? null,
    session_length: body.session_length ?? null,
    notes: body.notes ?? null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })

  if (error) {
    console.error('Profile save error:', error)
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
