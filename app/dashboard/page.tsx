'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

const MODES = [
  {
    id: 'learn',
    name: 'Learn',
    icon: '🎓',
    tagline: 'Six thinking lenses, one concept',
    description:
      'Explore any topic through Edward de Bono\'s Six Thinking Hats. Switch perspectives mid-session. Stay in Flow.',
    href: '/goal',
    live: true,
  },
  {
    id: 'practice',
    name: 'Practice',
    icon: '🔁',
    tagline: 'Retrieval practice + Socratic method',
    description:
      'Your coach asks you to retrieve, explain, and apply what you\'ve learned. Feynman technique built in.',
    href: null,
    live: false,
  },
  {
    id: 'flashcards',
    name: 'Flashcards',
    icon: '⚡',
    tagline: 'Spaced repetition from your own history',
    description:
      'Cards generated from your learning sessions, scheduled when your brain is ready to consolidate.',
    href: null,
    live: false,
  },
  {
    id: 'quiz',
    name: 'Quiz',
    icon: '🎯',
    tagline: 'Adaptive diagnostic assessment',
    description:
      'Find exactly where you are and what to tackle next. No generic tests — calibrated to your level.',
    href: null,
    live: false,
  },
  {
    id: 'profile',
    name: 'Profile',
    icon: '🧠',
    tagline: 'Your cognitive fingerprint',
    description:
      'A deep model of how you think, focus, and get stuck — built from your sessions over time.',
    href: null,
    live: false,
  },
]

export default function Dashboard() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null)
    })
  }, [])

  async function signOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <span className="text-sm font-bold text-zinc-900">FlowCoach</span>
          <div className="flex items-center gap-4">
            {email && (
              <span className="text-xs text-zinc-400">{email}</span>
            )}
            <button
              onClick={signOut}
              disabled={signingOut}
              className="text-xs text-zinc-500 hover:text-zinc-800 disabled:opacity-40"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900">What would you like to do?</h1>
          <p className="mt-1 text-sm text-zinc-500">
            FlowCoach adapts to your energy, thinking style, and focus — keeping you in Flow state while you learn.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {MODES.map((mode) => (
            <div
              key={mode.id}
              className={`rounded-xl border px-5 py-4 transition-all ${
                mode.live
                  ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
                  : 'border-zinc-200 bg-white text-zinc-400'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{mode.icon}</span>
                    <span className={`text-sm font-bold ${mode.live ? 'text-white' : 'text-zinc-400'}`}>
                      {mode.name}
                    </span>
                    {!mode.live && (
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
                        Coming soon
                      </span>
                    )}
                  </div>
                  <p className={`text-xs font-medium ${mode.live ? 'text-zinc-300' : 'text-zinc-400'}`}>
                    {mode.tagline}
                  </p>
                  <p className={`mt-1 text-xs leading-relaxed ${mode.live ? 'text-zinc-400' : 'text-zinc-300'}`}>
                    {mode.description}
                  </p>
                </div>

                {mode.live && mode.href && (
                  <Link
                    href={mode.href}
                    className="shrink-0 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-zinc-900 transition-colors hover:bg-zinc-100"
                  >
                    Start →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-zinc-400">
          Built for neurodivergent and self-directed learners.
        </p>
      </main>
    </div>
  )
}
