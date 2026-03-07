'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

const LEARNING_MODES = [
  {
    id: 'learn',
    name: 'Learn',
    icon: '🎓',
    tagline: 'Six thinking lenses, one concept',
    description:
      "Explore any topic through Edward de Bono's Six Thinking Hats. Switch perspectives mid-session. Stay in Flow.",
    href: '/goal',
    live: true,
  },
  {
    id: 'practice',
    name: 'Practice',
    icon: '🔁',
    tagline: 'Retrieval practice + Socratic method',
    description:
      "Your coach asks you to retrieve, explain, and apply what you've learned. Feynman technique built in.",
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
]

const TOTAL_SECTIONS = 7

const TIER_LABELS: Record<number, { label: string; tagline: string }> = {
  0: { label: 'Basic', tagline: 'Generic coaching — same for everyone' },
  1: { label: 'Good', tagline: 'Claude knows your goal and background' },
  2: { label: 'Good', tagline: 'Claude knows your goal and background' },
  3: { label: 'Great', tagline: 'Claude skips what you know, fills actual gaps' },
  4: { label: 'Great', tagline: 'Claude skips what you know, fills actual gaps' },
  5: { label: 'Exceptional', tagline: 'Fully adaptive — Claude knows how you think and learn' },
  6: { label: 'Exceptional', tagline: 'Fully adaptive — Claude knows how you think and learn' },
  7: { label: 'Exceptional', tagline: 'Fully adaptive — Claude knows how you think and learn' },
}

export default function Dashboard() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)
  const [sectionsComplete, setSectionsComplete] = useState<number | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setEmail(user.email ?? null)
      supabase
        .from('profiles')
        .select('profile_data')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          const pd = (data?.profile_data as Record<string, string | null>) ?? {}
          const count = Object.values(pd).filter(Boolean).length
          setSectionsComplete(count)
        })
    })
  }, [])

  async function signOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const completed = sectionsComplete ?? 0
  const tier = TIER_LABELS[Math.min(completed, 7)]
  const profileLoaded = sectionsComplete !== null

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <span className="text-sm font-bold text-zinc-900">FlowCoach</span>
          <div className="flex items-center gap-4">
            {email && <span className="text-xs text-zinc-400">{email}</span>}
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
          <h1 className="text-2xl font-bold text-zinc-900">Welcome back.</h1>
          <p className="mt-1 text-sm text-zinc-500">
            FlowCoach adapts to how you think and learn — keeping you in Flow state.
          </p>
        </div>

        {/* Profile — top card, featured */}
        <div className="mb-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Step 1 — Build your profile
          </p>
          <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">🧠</span>
                  <span className="text-sm font-bold text-indigo-900">Your Profile</span>
                  {profileLoaded && (
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                      {completed === 0
                        ? 'Not started'
                        : `${completed} of ${TOTAL_SECTIONS} sections`}
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium text-indigo-700">
                  {profileLoaded && completed > 0
                    ? `${tier.label} coaching — ${tier.tagline}`
                    : 'The more Claude knows about you, the better it teaches you'}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-indigo-600">
                  {completed === 0
                    ? 'Start with the 5-minute Quick Profile. Every section you complete unlocks more personalized coaching across Learn, Practice, and every other mode.'
                    : completed < 3
                    ? 'Good start. Complete 2 more sections to unlock Great coaching — Claude will know your actual gaps and what has blocked you before.'
                    : completed < 5
                    ? 'Great coaching unlocked. Complete 2 more sections to reach Exceptional — fully adaptive across every mode.'
                    : 'Exceptional coaching unlocked. You can always update sections as you grow.'}
                </p>
              </div>
              <Link
                href="/profile"
                className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                {completed === 0 ? 'Start here →' : 'Continue →'}
              </Link>
            </div>
          </div>
        </div>

        {/* Learning modes */}
        <div className="mt-6">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Step 2 — Start learning
          </p>
          <div className="flex flex-col gap-3">
            {LEARNING_MODES.map((mode) => (
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
                      <span
                        className={`text-sm font-bold ${
                          mode.live ? 'text-white' : 'text-zinc-400'
                        }`}
                      >
                        {mode.name}
                      </span>
                      {!mode.live && (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
                          Coming soon
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs font-medium ${
                        mode.live ? 'text-zinc-300' : 'text-zinc-400'
                      }`}
                    >
                      {mode.tagline}
                    </p>
                    <p
                      className={`mt-1 text-xs leading-relaxed ${
                        mode.live ? 'text-zinc-400' : 'text-zinc-300'
                      }`}
                    >
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
        </div>

        <p className="mt-8 text-center text-xs text-zinc-400">
          Built for neurodivergent and self-directed learners.
        </p>
      </main>
    </div>
  )
}
