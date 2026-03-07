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
    cardClass:   'border-emerald-500 bg-emerald-500 shadow-sm',
    nameClass:   'text-white',
    taglineClass:'text-emerald-50',
    descClass:   'text-emerald-100',
    badgeClass:  '',
    buttonClass: 'bg-white text-emerald-600 hover:bg-emerald-50',
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
    cardClass:   'border-amber-200 bg-amber-50',
    nameClass:   'text-amber-900',
    taglineClass:'text-amber-700',
    descClass:   'text-amber-600',
    badgeClass:  'bg-amber-100 text-amber-700',
    buttonClass: '',
  },
  {
    id: 'deep-dive',
    name: 'Deep Dive',
    icon: '🤿',
    tagline: 'A structured descent into mastery — one topic, start to finish',
    description:
      'Tell the Instructor what you want to master. They map the dive plan — surface concepts to deep-water expertise — and guide every session until you certify.',
    href: null,
    live: false,
    cardClass:   'border-teal-200 bg-teal-50',
    nameClass:   'text-teal-900',
    taglineClass:'text-teal-700',
    descClass:   'text-teal-600',
    badgeClass:  'bg-teal-100 text-teal-700',
    buttonClass: '',
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
    cardClass:   'border-rose-200 bg-rose-50',
    nameClass:   'text-rose-900',
    taglineClass:'text-rose-700',
    descClass:   'text-rose-600',
    badgeClass:  'bg-rose-100 text-rose-700',
    buttonClass: '',
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
    cardClass:   'border-fuchsia-200 bg-fuchsia-50',
    nameClass:   'text-fuchsia-900',
    taglineClass:'text-fuchsia-700',
    descClass:   'text-fuchsia-600',
    badgeClass:  'bg-fuchsia-100 text-fuchsia-700',
    buttonClass: '',
  },
]

const TOTAL_SECTIONS = 7

const TIER_LABELS: Record<number, { label: string; tagline: string; pillClass: string; topAccent: string; bandBg: string }> = {
  0: { label: 'Basic',       tagline: 'Generic coaching — same for everyone',                   pillClass: 'bg-zinc-600 text-zinc-200',      topAccent: 'border-t-zinc-400',    bandBg: 'bg-zinc-800' },
  1: { label: 'Good',        tagline: 'Claude knows your goal and background',                  pillClass: 'bg-blue-900 text-blue-300',       topAccent: 'border-t-blue-400',    bandBg: 'bg-blue-950' },
  2: { label: 'Good',        tagline: 'Claude knows your goal and background',                  pillClass: 'bg-blue-900 text-blue-300',       topAccent: 'border-t-blue-400',    bandBg: 'bg-blue-950' },
  3: { label: 'Great',       tagline: 'Claude skips what you know, fills actual gaps',          pillClass: 'bg-indigo-900 text-indigo-300',   topAccent: 'border-t-indigo-400',  bandBg: 'bg-indigo-950' },
  4: { label: 'Great',       tagline: 'Claude skips what you know, fills actual gaps',          pillClass: 'bg-indigo-900 text-indigo-300',   topAccent: 'border-t-indigo-400',  bandBg: 'bg-indigo-950' },
  5: { label: 'Exceptional', tagline: 'Fully adaptive — Claude knows how you think and learn', pillClass: 'bg-emerald-900 text-emerald-300', topAccent: 'border-t-emerald-400', bandBg: 'bg-emerald-950' },
  6: { label: 'Exceptional', tagline: 'Fully adaptive — Claude knows how you think and learn', pillClass: 'bg-emerald-900 text-emerald-300', topAccent: 'border-t-emerald-400', bandBg: 'bg-emerald-950' },
  7: { label: 'Exceptional', tagline: 'Fully adaptive — Claude knows how you think and learn', pillClass: 'bg-emerald-900 text-emerald-300', topAccent: 'border-t-emerald-400', bandBg: 'bg-emerald-950' },
}

interface LastGoal {
  topic: string
  win_condition: string | null
  confidence: number | null
}

function TierBadge({ label, size = 48 }: { label: string; size?: number }) {
  if (label === 'Basic') return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="21" stroke="#e4e4e7" strokeWidth="2.5"/>
      <circle cx="24" cy="24" r="13" stroke="#e4e4e7" strokeWidth="1.5" strokeDasharray="3 2"/>
      <circle cx="24" cy="24" r="4" fill="#d4d4d8"/>
    </svg>
  )
  if (label === 'Good') return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 4L7 11v13C7 33 15 41 24 44c9-3 17-11 17-20V11L24 4z" fill="#3b82f6"/>
      <path d="M15 24l7 7 11-13" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  if (label === 'Great') return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 2L42 13v22L24 46 6 35V13L24 2z" fill="#6366f1"/>
      <path d="M27 12L19 25h7L22 36l11-15h-7l1-9z" fill="white"/>
    </svg>
  )
  // Exceptional
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="22" fill="#f59e0b"/>
      <circle cx="24" cy="24" r="22" fill="none" stroke="#fbbf24" strokeWidth="1.5"/>
      <path d="M13 34V24l7 5 4-10 4 10 7-5v10H13z" fill="white"/>
      <rect x="12" y="35" width="24" height="3" rx="1.5" fill="white"/>
      <circle cx="13" cy="24" r="2" fill="white"/>
      <circle cx="24" cy="14" r="2" fill="white"/>
      <circle cx="35" cy="24" r="2" fill="white"/>
    </svg>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)
  const [sectionsComplete, setSectionsComplete] = useState<number | null>(null)
  const [lastGoal, setLastGoal] = useState<LastGoal | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setEmail(user.email ?? null)
      Promise.all([
        supabase.from('profiles').select('profile_data').eq('user_id', user.id).single(),
        supabase.from('goals').select('topic, win_condition, confidence').eq('user_id', user.id).single(),
      ]).then(([{ data: profile }, { data: goal }]) => {
        const pd = (profile?.profile_data as Record<string, string | null>) ?? {}
        setSectionsComplete(Object.values(pd).filter(Boolean).length)
        if (goal?.topic) setLastGoal(goal as LastGoal)
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
        <div className="mx-auto flex max-w-3xl items-center justify-between">
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

      <main className="mx-auto max-w-3xl px-6 py-10">
        {/* Page opening — identity + status, no box */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-zinc-900">Welcome back.</h1>
              <div className="mt-4 flex items-center gap-3">
                <TierBadge label={tier.label} size={36} />
                <div>
                  <p className="text-sm font-semibold text-zinc-800">{tier.label} coaching</p>
                  <p className="text-xs text-zinc-500">{tier.tagline}</p>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2 pt-1">
              {lastGoal ? (
                <Link
                  href={`/learn?topic=${encodeURIComponent(lastGoal.topic)}${lastGoal.win_condition ? `&win=${encodeURIComponent(lastGoal.win_condition)}` : ''}${lastGoal.confidence ? `&confidence=${lastGoal.confidence}` : ''}`}
                  className="max-w-[200px] truncate text-right text-sm font-medium text-zinc-700 hover:text-zinc-900"
                  title={lastGoal.topic}
                >
                  Continue: {lastGoal.topic} →
                </Link>
              ) : (
                <span className="text-sm text-zinc-400">No topic yet</span>
              )}
              <span className="cursor-default select-none text-xs text-zinc-400">
                Pick a topic{' '}
                <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400">
                  🚧 soon
                </span>
              </span>
            </div>
          </div>
          <div className="mt-5 border-b border-zinc-200" />
        </div>

        {/* Profile — featured card */}
        <div className="mb-4">
          <p className="mb-2 border-l-2 border-zinc-300 pl-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Step 1 — Build your profile
          </p>
          <div className="rounded-xl border-2 border-indigo-300 bg-indigo-100 px-5 py-4">
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
        <div className="mt-2">
          <p className="mb-2 border-l-2 border-zinc-300 pl-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Step 2 — Start learning
          </p>
          <div className="flex flex-col gap-3">
            {/* Live modes — full width */}
            {LEARNING_MODES.filter(m => m.live).map((mode) => (
              <div
                key={mode.id}
                className={`rounded-xl border px-5 py-4 transition-all ${mode.cardClass}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{mode.icon}</span>
                      <span className={`text-sm font-bold ${mode.nameClass}`}>{mode.name}</span>
                    </div>
                    <p className={`text-sm font-medium ${mode.taglineClass}`}>{mode.tagline}</p>
                    <p className={`mt-1 text-xs leading-relaxed ${mode.descClass}`}>{mode.description}</p>
                  </div>
                  {mode.href && (
                    <Link
                      href={mode.href}
                      className={`shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${mode.buttonClass}`}
                    >
                      Start →
                    </Link>
                  )}
                </div>
              </div>
            ))}
            {/* Coming soon — 2-column grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {LEARNING_MODES.filter(m => !m.live).map((mode) => (
                <div
                  key={mode.id}
                  className={`rounded-xl border px-5 py-4 transition-all ${mode.cardClass}`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{mode.icon}</span>
                      <span className={`text-sm font-bold ${mode.nameClass}`}>{mode.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${mode.badgeClass}`}>
                        🚧 Coming soon
                      </span>
                    </div>
                    <p className={`text-sm font-medium ${mode.taglineClass}`}>{mode.tagline}</p>
                    <p className={`mt-1 text-xs leading-relaxed ${mode.descClass}`}>{mode.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-zinc-400">
          Built for neurodivergent and self-directed learners.
        </p>
      </main>
    </div>
  )
}
