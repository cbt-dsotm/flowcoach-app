'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

export default function Login() {
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      router.push('/dashboard')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      router.push('/dashboard')
    }
  }

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center px-6"
      style={{
        backgroundImage: "url('/map-bg-1k.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Map overlay */}
      <div className="absolute inset-0 bg-amber-950/50 pointer-events-none" />

      {/* Login card */}
      <div className="relative w-full max-w-sm rounded-2xl border border-amber-700/20 bg-amber-50/30 backdrop-blur-sm px-8 py-10 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-amber-950">FlowCoach</h1>
          <p className="mt-1 text-sm text-amber-800">
            {mode === 'signin' ? 'Sign in to continue your journey' : 'Begin your journey'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-amber-900">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="rounded-xl border border-amber-400/60 bg-amber-50/80 px-3 py-2.5 text-sm text-zinc-900 placeholder-amber-400 focus:border-amber-600 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-amber-900">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="rounded-xl border border-amber-400/60 bg-amber-50/80 px-3 py-2.5 text-sm text-zinc-900 placeholder-amber-400 focus:border-amber-600 focus:outline-none"
              placeholder="········"
              minLength={6}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-100/80 px-3 py-2 text-sm text-red-700 ring-1 ring-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[#4a5e2a] px-6 py-3 text-sm font-semibold text-[#f5f0e0] transition-colors hover:bg-[#3d4f22] disabled:opacity-40"
          >
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-amber-800">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null) }}
            className="font-medium text-amber-950 hover:underline"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
