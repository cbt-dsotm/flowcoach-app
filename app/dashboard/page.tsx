'use client'

import { useEffect, useRef, useState } from 'react'
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
    cardClass:   'border-2 border-amber-500 bg-[#eef0e8] shadow-sm',
    nameClass:   'text-[#3d4a2a]',
    taglineClass:'text-[#4e5e35]',
    descClass:   'text-[#5a6640]',
    badgeClass:  '',
    buttonClass: 'bg-[#4a5e2a] hover:bg-[#3d4f22] text-[#f5f0e0]',
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
    cardClass:   'border border-amber-400 bg-amber-100/70',
    nameClass:   'text-amber-900',
    taglineClass:'text-amber-800',
    descClass:   'text-amber-700',
    badgeClass:  'bg-amber-100 text-amber-800 border border-amber-400',
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
    cardClass:   'border border-teal-600/50 bg-[#e8f0ee]',
    nameClass:   'text-teal-900',
    taglineClass:'text-teal-800',
    descClass:   'text-teal-700',
    badgeClass:  'bg-[#e8f0ee] text-teal-900 border border-teal-600/60',
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
    cardClass:   'border border-rose-400/60 bg-[#f2e8e8]',
    nameClass:   'text-rose-950',
    taglineClass:'text-rose-900',
    descClass:   'text-rose-800',
    badgeClass:  'bg-[#f2e8e8] text-rose-900 border border-rose-400/70',
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
    cardClass:   'border border-purple-400/60 bg-[#ede8f2]',
    nameClass:   'text-purple-950',
    taglineClass:'text-purple-900',
    descClass:   'text-purple-800',
    badgeClass:  'bg-[#ede8f2] text-purple-900 border border-purple-400/70',
    buttonClass: '',
  },
]

const TOTAL_SECTIONS = 7

const TIER_LABELS: Record<number, { label: string; tagline: string; pillClass: string }> = {
  0: { label: 'Wanderer',    tagline: 'You showed up. That\'s the whole first step.',                              pillClass: 'bg-zinc-100 text-zinc-600' },
  1: { label: 'Seeker',      tagline: 'Claude knows what you\'re chasing. The coaching gets sharper from here.',  pillClass: 'bg-blue-100 text-blue-700' },
  2: { label: 'Seeker',      tagline: 'Claude knows what you\'re chasing. The coaching gets sharper from here.',  pillClass: 'bg-blue-100 text-blue-700' },
  3: { label: 'Pathfinder',  tagline: 'You\'ve shared enough that Claude can get out of your way and go deeper.', pillClass: 'bg-indigo-100 text-indigo-700' },
  4: { label: 'Pathfinder',  tagline: 'You\'ve shared enough that Claude can get out of your way and go deeper.', pillClass: 'bg-indigo-100 text-indigo-700' },
  5: { label: 'Cartographer',tagline: 'Claude knows how you think. This is what fully fitted feels like.',        pillClass: 'bg-amber-100 text-amber-700' },
  6: { label: 'Cartographer',tagline: 'Claude knows how you think. This is what fully fitted feels like.',        pillClass: 'bg-amber-100 text-amber-700' },
  7: { label: 'Cartographer',tagline: 'Claude knows how you think. This is what fully fitted feels like.',        pillClass: 'bg-amber-100 text-amber-700' },
}

interface LastGoal {
  topic: string
  win_condition: string | null
  confidence: number | null
}

function TierBadge({ label, size = 48 }: { label: string; size?: number }) {
  // Wanderer: outline-only compass star, zinc gray — potential not yet awakened
  if (label === 'Wanderer') return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon
        points="24,4 26,19 33,16 30,22 44,24 30,26 33,32 26,29 24,44 22,29 15,32 18,26 4,24 18,22 15,16 22,19"
        stroke="#d97706" strokeWidth="1.5" fill="none"
      />
      <circle cx="24" cy="24" r="2.5" stroke="#d97706" strokeWidth="1.5" fill="none"/>
    </svg>
  )
  // Seeker: star lightly filled zinc, north petal lit in amber — direction found
  if (label === 'Seeker') return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon
        points="24,4 26,19 33,16 30,22 44,24 30,26 33,32 26,29 24,44 22,29 15,32 18,26 4,24 18,22 15,16 22,19"
        fill="#f4f4f5" stroke="#d4d4d8" strokeWidth="1"
      />
      {/* North petal: from center (24,24) up to tip (24,4) via (26,19) and (22,19) */}
      <polygon points="24,4 26,19 24,24 22,19" fill="#f59e0b"/>
      <circle cx="24" cy="24" r="2.5" fill="#a1a1aa"/>
    </svg>
  )
  // Pathfinder: cardinal petals lit amber, partial arc trail — charting the way
  if (label === 'Pathfinder') return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon
        points="24,4 26,19 33,16 30,22 44,24 30,26 33,32 26,29 24,44 22,29 15,32 18,26 4,24 18,22 15,16 22,19"
        fill="#fef3c7" stroke="#f59e0b" strokeWidth="1"
      />
      {/* N petal */}
      <polygon points="24,4 26,19 24,24 22,19" fill="#f59e0b"/>
      {/* E petal */}
      <polygon points="44,24 29,22 24,24 29,26" fill="#f59e0b"/>
      {/* S petal */}
      <polygon points="24,44 26,29 24,24 22,29" fill="#f59e0b"/>
      {/* W petal */}
      <polygon points="4,24 19,26 24,24 19,22" fill="#f59e0b"/>
      {/* Partial arc trail ~270° (skipping NW quadrant) */}
      <path d="M24 2 A22 22 0 1 1 2 24" stroke="#f59e0b" strokeWidth="1.5" fill="none" strokeDasharray="2 2"/>
      <circle cx="24" cy="24" r="2.5" fill="#f59e0b"/>
    </svg>
  )
  // Cartographer: fully lit amber rose, complete circle trail, white center — the map is made
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="22" stroke="#f59e0b" strokeWidth="1.5" fill="none"/>
      <polygon
        points="24,4 26,19 33,16 30,22 44,24 30,26 33,32 26,29 24,44 22,29 15,32 18,26 4,24 18,22 15,16 22,19"
        fill="#f59e0b" stroke="#d97706" strokeWidth="0.5"
      />
      <circle cx="24" cy="24" r="3" fill="white"/>
    </svg>
  )
}

const TOOLTIP_TIERS = [
  {
    label: 'Wanderer',
    desc: 'No personalization yet. Same content and examples for every learner.',
  },
  {
    label: 'Seeker',
    desc: 'Claude knows your goal and background. Analogies that fit your world, depth calibrated to your level.',
  },
  {
    label: 'Pathfinder',
    desc: 'Claude knows your real gaps and what\'s blocked you before. Fills actual holes, avoids what hasn\'t worked.',
  },
  {
    label: 'Cartographer',
    desc: 'Fully fitted. Claude knows how you think across every mode — Learn, Practice, Flashcards.',
  },
]

function TierBadgeWithTooltip({ label, size = 44 }: { label: string; size?: number }) {
  const [open, setOpen] = useState(false)
  const [hoveredTier, setHoveredTier] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleEnter() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpen(true)
  }

  function handleLeave() {
    closeTimer.current = setTimeout(() => {
      setOpen(false)
      setHoveredTier(null)
    }, 120)
  }

  return (
    <div
      className="relative shrink-0 cursor-pointer"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <TierBadge label={label} size={size} />
      {open && (
        <div
          className="absolute left-0 top-full z-20 mt-1 w-72 rounded-xl border border-amber-300/60 bg-amber-50 p-3 shadow-xl"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
            Coaching levels
          </p>
          <div className="flex flex-col gap-3">
            {TOOLTIP_TIERS.map((t) => {
              const isCurrent = t.label === label
              const isHovered = hoveredTier === t.label
              return (
                <div
                  key={t.label}
                  className={`flex cursor-default items-start gap-2.5 rounded-lg px-1 py-0.5 transition-opacity ${isCurrent ? '' : 'opacity-40'} ${isHovered ? 'opacity-100' : ''}`}
                  onMouseEnter={() => setHoveredTier(t.label)}
                  onMouseLeave={() => setHoveredTier(null)}
                >
                  <div className="mt-0.5 shrink-0">
                    <TierBadge label={t.label} size={32} />
                  </div>
                  <div>
                    <p className={`text-xs transition-all ${isCurrent || isHovered ? 'font-bold text-amber-950' : 'font-semibold text-amber-700/50'}`}>
                      {t.label}
                    </p>
                    <p className="text-[11px] leading-snug text-amber-800/60">{t.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function TopicSelector({ lastGoal }: { lastGoal: LastGoal | null }) {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleEnter() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpen(true)
  }

  function handleLeave() {
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }

  const learnHref = lastGoal
    ? `/learn?topic=${encodeURIComponent(lastGoal.topic)}${lastGoal.win_condition ? `&win=${encodeURIComponent(lastGoal.win_condition)}` : ''}${lastGoal.confidence ? `&confidence=${lastGoal.confidence}` : ''}`
    : '/goal'

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {lastGoal ? (
        <Link
          href={learnHref}
          className="text-sm font-bold text-zinc-800 hover:text-zinc-600 truncate max-w-[280px] block"
          title={lastGoal.topic}
        >
          {lastGoal.topic}
        </Link>
      ) : (
        <Link
          href="/goal"
          className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 shadow-sm transition-colors hover:border-amber-400 hover:text-amber-800"
        >
          <span className="text-amber-400">+</span>
          Set a topic
        </Link>
      )}

      {open && (
        <div
          className="absolute left-0 top-full z-20 mt-1 w-68 min-w-[260px] rounded-xl border border-zinc-200 bg-white p-3 shadow-xl"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          {lastGoal ? (
            <>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Topics
              </p>
              <Link
                href={learnHref}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-50"
              >
                <span className="text-[10px] text-zinc-500">●</span>
                <span className="truncate text-xs font-semibold text-zinc-900">{lastGoal.topic}</span>
              </Link>
              <div className="mt-2 flex items-center gap-2 px-2 py-1">
                <span className="text-[10px] text-zinc-300">+</span>
                <span className="text-xs text-zinc-300">New topic</span>
                <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-300">
                  🚧 soon
                </span>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold text-zinc-700">No topics yet</p>
              <p className="mt-1 text-[11px] leading-snug text-zinc-400">
                Topics you explore in Learn mode appear here. Pick up where you left off or switch between subjects.
              </p>
              <Link
                href="/goal"
                className="mt-2.5 block text-xs font-medium text-indigo-600 hover:text-indigo-800"
              >
                Start your first session →
              </Link>
            </>
          )}
        </div>
      )}
    </div>
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
    <div className="relative min-h-screen overflow-x-hidden" style={{ backgroundImage: "url('/map-bg-1k.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="absolute inset-0 bg-amber-950/50 pointer-events-none" />
      <header className="relative border-b border-amber-700/30 bg-amber-100/85 backdrop-blur-sm px-6 py-4">
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

      <main className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="absolute inset-x-0 bottom-0 top-16 rounded-2xl bg-amber-50/30 backdrop-blur-sm border border-amber-700/20" />
        {/* Identity row: rank greeting left, profile status right */}
        <div className="relative mb-8 pt-20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            {/* Left: badge + rank as the greeting — cream pill backdrop, links to profile */}
            <Link href="/profile" className="flex items-center gap-3 rounded-3xl bg-amber-100 px-5 py-3 shadow-sm border border-amber-300/60 hover:bg-amber-200/70 transition-colors">
              <TierBadgeWithTooltip label={tier.label} size={44} />
              <div>
                <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">
                  Welcome back, {tier.label}.
                </h1>
                <p className="mt-0.5 text-xs text-zinc-600">{tier.tagline}</p>
              </div>
            </Link>

            {/* Right: profile button — pill/capsule */}
            <Link
              href="/profile"
              className="flex flex-col items-center rounded-3xl bg-violet-600 px-6 py-3 text-center shadow-sm transition-all hover:bg-violet-700 hover:shadow-md sm:shrink-0"
            >
              <span className="text-sm font-bold text-white">
                {completed === 0 ? 'Build Your Profile' : completed < 7 ? 'Continue Profile' : 'Your Profile'}
              </span>
              <span className="mt-0.5 text-[11px] text-violet-200">
                {completed === 0
                  ? '5 min → unlocks Seeker coaching'
                  : completed < 3
                  ? `${3 - completed} more section${3 - completed === 1 ? '' : 's'} → Pathfinder`
                  : completed < 5
                  ? `${5 - completed} more section${5 - completed === 1 ? '' : 's'} → Cartographer`
                  : 'Fully fitted coaching'}
              </span>
              {profileLoaded && completed > 0 && completed < 7 && (
                <span className="mt-0.5 text-[10px] text-violet-300">
                  {completed} of {TOTAL_SECTIONS} sections
                </span>
              )}
            </Link>
          </div>
          <div className="mt-5 border-b border-zinc-200" />
        </div>

        {/* Topic row — below the rule, above mode cards */}
        <div className="relative mb-4">
          <TopicSelector lastGoal={lastGoal} />
        </div>

        {/* Learning modes */}
        <div className="relative">
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
