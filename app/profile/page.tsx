'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import {
  PROFILE_SECTIONS,
  getTier,
  TIER_INFO,
  ProfileTier,
  SectionId,
} from '@/lib/profile-sections'

const TIER_ORDER: ProfileTier[] = ['basic', 'good', 'great', 'exceptional']

function TierBadge({ label, size = 32 }: { label: string; size?: number }) {
  if (label === 'Wanderer') return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="24,4 26,19 33,16 30,22 44,24 30,26 33,32 26,29 24,44 22,29 15,32 18,26 4,24 18,22 15,16 22,19" stroke="#a1a1aa" strokeWidth="1.5" fill="none"/>
      <circle cx="24" cy="24" r="2.5" stroke="#a1a1aa" strokeWidth="1.5" fill="none"/>
    </svg>
  )
  if (label === 'Seeker') return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="24,4 26,19 33,16 30,22 44,24 30,26 33,32 26,29 24,44 22,29 15,32 18,26 4,24 18,22 15,16 22,19" fill="#f4f4f5" stroke="#d4d4d8" strokeWidth="1"/>
      <polygon points="24,4 26,19 24,24 22,19" fill="#f59e0b"/>
      <circle cx="24" cy="24" r="2.5" fill="#a1a1aa"/>
    </svg>
  )
  if (label === 'Pathfinder') return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="24,4 26,19 33,16 30,22 44,24 30,26 33,32 26,29 24,44 22,29 15,32 18,26 4,24 18,22 15,16 22,19" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1"/>
      <polygon points="24,4 26,19 24,24 22,19" fill="#f59e0b"/>
      <polygon points="44,24 29,22 24,24 29,26" fill="#f59e0b"/>
      <polygon points="24,44 26,29 24,24 22,29" fill="#f59e0b"/>
      <polygon points="4,24 19,26 24,24 19,22" fill="#f59e0b"/>
      <path d="M24 2 A22 22 0 1 1 2 24" stroke="#f59e0b" strokeWidth="1.5" fill="none" strokeDasharray="2 2"/>
      <circle cx="24" cy="24" r="2.5" fill="#f59e0b"/>
    </svg>
  )
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="22" stroke="#f59e0b" strokeWidth="1.5" fill="none"/>
      <polygon points="24,4 26,19 33,16 30,22 44,24 30,26 33,32 26,29 24,44 22,29 15,32 18,26 4,24 18,22 15,16 22,19" fill="#f59e0b" stroke="#d97706" strokeWidth="0.5"/>
      <circle cx="24" cy="24" r="3" fill="white"/>
    </svg>
  )
}

function TierLadder({
  tier,
  profileData,
}: {
  tier: ProfileTier
  profileData: Record<string, string | null>
}) {
  const currentIndex = TIER_ORDER.indexOf(tier)
  const info = TIER_INFO[tier]

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
        Coaching quality
      </p>

      {/* Progress line */}
      <div className="flex items-center">
        {TIER_ORDER.map((t, i) => (
          <div key={t} className="flex flex-1 items-center">
            <div
              className={`h-2.5 w-2.5 shrink-0 rounded-full border-2 ${
                i <= currentIndex
                  ? 'border-zinc-900 bg-zinc-900'
                  : 'border-zinc-300 bg-white'
              }`}
            />
            {i < TIER_ORDER.length - 1 && (
              <div
                className={`h-0.5 flex-1 ${
                  i < currentIndex ? 'bg-zinc-900' : 'bg-zinc-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Labels */}
      <div className="mt-2 flex">
        {TIER_ORDER.map((t, i) => (
          <div key={t} className="flex-1">
            <p
              className={`text-[11px] font-semibold ${
                i === currentIndex
                  ? 'text-zinc-900'
                  : i < currentIndex
                  ? 'text-zinc-400'
                  : 'text-zinc-300'
              }`}
            >
              {TIER_INFO[t].label}
              {i === currentIndex && ' ★'}
            </p>
          </div>
        ))}
      </div>

      {/* What you get at this tier */}
      <div className="mt-4 rounded-lg bg-zinc-50 p-3">
        <p className="text-xs font-semibold text-zinc-800">
          {info.label} coaching — what this means
        </p>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">{info.what}</p>
        {info.nextHint && (
          <p className="mt-2 text-[11px] text-zinc-400">↑ {info.nextHint}</p>
        )}
      </div>

      {/* What each tier gets you — always visible */}
      <div className="mt-4 border-t border-zinc-100 pt-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          What you get at each level
        </p>
        <div className="flex flex-col gap-2">
          {TIER_ORDER.map((t) => (
            <div key={t} className="flex gap-2">
              <span
                className={`mt-0.5 shrink-0 text-[10px] ${
                  t === tier ? 'text-zinc-900' : 'text-zinc-300'
                }`}
              >
                {t === tier ? '●' : '○'}
              </span>
              <div>
                <span
                  className={`text-xs font-semibold ${
                    t === tier ? 'text-zinc-900' : 'text-zinc-400'
                  }`}
                >
                  {TIER_INFO[t].label}
                </span>
                <span className="text-xs text-zinc-400">
                  {' '}
                  — {TIER_INFO[t].what}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SectionCard({
  section,
  summary,
}: {
  section: (typeof PROFILE_SECTIONS)[number]
  summary: string | null
}) {
  const done = !!summary

  return (
    <div
      className={`rounded-xl border px-5 py-4 transition-all ${
        done
          ? 'border-zinc-200 bg-white'
          : 'border-zinc-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-900">
              {section.title}
            </span>
            {done ? (
              <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                Done ✓
              </span>
            ) : (
              <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
                {section.unlockBadge}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] font-medium text-zinc-500">
            {section.tagline}
          </p>
          {done ? (
            <p className="mt-2 text-xs leading-relaxed text-zinc-500 line-clamp-2">
              {summary}
            </p>
          ) : (
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              {section.description}
            </p>
          )}
        </div>

        <Link
          href={`/profile/chat?section=${section.id}`}
          className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
            done
              ? 'border border-zinc-200 text-zinc-600 hover:border-zinc-400'
              : 'bg-zinc-900 text-white hover:bg-zinc-700'
          }`}
        >
          {done ? 'Update' : "Let's talk →"}
        </Link>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const [profileData, setProfileData] = useState<Record<string, string | null>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login')
        return
      }
      supabase
        .from('profiles')
        .select('profile_data')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          setProfileData((data?.profile_data as Record<string, string | null>) ?? {})
          setLoading(false)
        })
    })
  }, [router])

  const tier = getTier(profileData)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-zinc-400">
        Loading…
      </div>
    )
  }

  // Quick Profile first, then the 6 deep dives
  const quickSection = PROFILE_SECTIONS.find((s) => s.id === 'quick')!
  const deepSections = PROFILE_SECTIONS.filter((s) => s.id !== 'quick')

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/dashboard" className="text-xs text-zinc-400 hover:text-zinc-600">
            ← Dashboard
          </Link>
          <span className="text-sm font-bold text-zinc-900">My Profile</span>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-zinc-900">Your Learning Profile</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Each conversation teaches FlowCoach something specific about how you think and learn.
            More sections = more personalized coaching across every mode.
          </p>
        </div>

        {/* Tier ladder */}
        <div className="mb-6">
          <TierLadder tier={tier} profileData={profileData} />
        </div>

        {/* Coaching levels — placeholder for design pass */}
        <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-5">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            What each level gets you
          </p>
          <div className="flex flex-col gap-4">
            {TIER_ORDER.map((t) => {
              const isCurrent = t === tier
              return (
                <div key={t} className={`flex items-start gap-3 ${isCurrent ? '' : 'opacity-40'}`}>
                  <div className="shrink-0">
                    <TierBadge label={TIER_INFO[t].label} size={32} />
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${isCurrent ? 'text-zinc-900' : 'text-zinc-500'}`}>
                      {TIER_INFO[t].label}
                      {isCurrent && <span className="ml-1.5 text-[10px] font-normal text-zinc-400">← you are here</span>}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-zinc-500">{TIER_INFO[t].what}</p>
                    {TIER_INFO[t].nextHint && isCurrent && (
                      <p className="mt-1 text-[10px] text-indigo-500">↑ {TIER_INFO[t].nextHint}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Profile — featured */}
        <div className="mb-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Fastest start
          </p>
          <SectionCard
            section={quickSection}
            summary={profileData['quick'] ?? null}
          />
        </div>

        {/* Deep dives */}
        <div className="mt-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Deep dives — go as far as you want
          </p>
          <div className="flex flex-col gap-3">
            {deepSections.map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                summary={profileData[section.id as SectionId] ?? null}
              />
            ))}
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-zinc-400">
          Your profile is private and only used to personalize your coaching.
        </p>
      </main>
    </div>
  )
}
