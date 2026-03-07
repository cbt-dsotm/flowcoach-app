'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

type Hat = 'white' | 'yellow' | 'black' | 'red' | 'green' | 'blue'

const ALL_HATS: Hat[] = ['white', 'yellow', 'black', 'red', 'green', 'blue']
const LEVEL_MIN = -4
const LEVEL_MAX = 4

const HATS: { id: Hat; label: string; description: string; activeClass: string }[] = [
  { id: 'white',  label: 'White',  description: 'Facts',    activeClass: 'border-zinc-900 bg-zinc-900 text-white' },
  { id: 'yellow', label: 'Yellow', description: 'Benefits', activeClass: 'border-yellow-500 bg-yellow-400 text-yellow-900' },
  { id: 'black',  label: 'Black',  description: 'Risks',    activeClass: 'border-zinc-800 bg-zinc-800 text-zinc-100' },
  { id: 'red',    label: 'Red',    description: 'Feelings', activeClass: 'border-red-500 bg-red-500 text-white' },
  { id: 'green',  label: 'Green',  description: 'Ideas',    activeClass: 'border-green-500 bg-green-500 text-white' },
  { id: 'blue',   label: 'Blue',   description: 'Process',  activeClass: 'border-blue-500 bg-blue-500 text-white' },
]

const HAT_DESCRIPTIONS: Record<Hat, string> = {
  white:  'Facts, data, and verifiable information — no opinion.',
  yellow: 'Benefits, value, and why this topic matters.',
  black:  'Risks, misconceptions, and what can go wrong.',
  red:    'Your gut reaction and emotional experience.',
  green:  'Creative analogies, metaphors, and lateral thinking.',
  blue:   'How to think about learning this topic — the process.',
}

function levelInstruction(level: number): string | null {
  if (level === 0) return null
  const map: Record<number, string> = {
    '-4': 'Extremely basic — assume zero prior knowledge, use the simplest everyday language and analogies, no jargon whatsoever',
    '-3': 'Very simple — assume minimal prior knowledge, avoid jargon, use concrete everyday examples',
    '-2': 'Simple — assume little prior knowledge, keep it accessible with clear examples',
    '-1': 'Slightly simpler than default — use clearer examples and less technical language',
     '1': 'Slightly deeper than default — add more specificity and nuance',
     '2': 'Advanced — assume solid foundation, go into technical detail and edge cases',
     '3': 'Very advanced — assume strong prior knowledge, explore mechanisms and theory',
     '4': 'Expert level — assume deep expertise, explore frontier concepts and subtle distinctions',
  }
  return map[level] ?? (level < 0 ? 'Very simple — assume minimal prior knowledge' : 'Very advanced — assume expert-level knowledge')
}

function cacheKey(hat: Hat, level: number): string {
  return `${hat}:${level}`
}

function LearnContent() {
  const searchParams = useSearchParams()
  const topic = searchParams.get('topic') ?? ''
  const winCondition = searchParams.get('win') ?? null
  const confidence = searchParams.get('confidence') ? Number(searchParams.get('confidence')) : null

  const [activeHat, setActiveHat] = useState<Hat>('white')
  const [hatLevels, setHatLevels] = useState<Partial<Record<Hat, number>>>({})
  const [cache, setCache] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<Set<string>>(new Set())
  const contentRef = useRef<HTMLDivElement>(null)

  const activeLevel = hatLevels[activeHat] ?? 0

  // On mount: generate white at level 0
  useEffect(() => {
    if (topic) generate('white', 0)
  }, [topic]) // eslint-disable-line react-hooks/exhaustive-deps

  // After white level 0 loads: preload all other hat defaults + white adjacents
  useEffect(() => {
    if (!cache[cacheKey('white', 0)]) return
    ALL_HATS.slice(1).forEach(hat => maybeGenerate(hat, 0))
    maybeGenerate('white', -1)
    maybeGenerate('white', 1)
  }, [!!cache[cacheKey('white', 0)]]) // eslint-disable-line react-hooks/exhaustive-deps

  // After each non-white hat's level 0 loads: preload its adjacents
  useEffect(() => {
    ALL_HATS.slice(1).forEach(hat => {
      if (cache[cacheKey(hat, 0)]) {
        maybeGenerate(hat, -1)
        maybeGenerate(hat, 1)
      }
    })
  }, [ // eslint-disable-line react-hooks/exhaustive-deps
    !!cache[cacheKey('yellow', 0)],
    !!cache[cacheKey('black',  0)],
    !!cache[cacheKey('red',    0)],
    !!cache[cacheKey('green',  0)],
    !!cache[cacheKey('blue',   0)],
  ])

  function maybeGenerate(hat: Hat, level: number) {
    if (level < LEVEL_MIN || level > LEVEL_MAX) return
    const key = cacheKey(hat, level)
    if (!cache[key] && !loading.has(key)) generate(hat, level)
  }

  async function generate(hat: Hat, level: number) {
    const key = cacheKey(hat, level)
    setLoading(prev => new Set(prev).add(key))

    try {
      const res = await fetch('/api/hat-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hat,
          topic,
          win_condition: winCondition,
          confidence,
          difficulty_instruction: levelInstruction(level),
        }),
      })

      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let content = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        content += decoder.decode(value, { stream: true })
        setCache(prev => ({ ...prev, [key]: content }))
      }
    } catch {
      setCache(prev => ({ ...prev, [key]: '_Failed to load. Try again._' }))
    } finally {
      setLoading(prev => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }
  }

  function selectHat(hat: Hat) {
    setActiveHat(hat)
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    const level = hatLevels[hat] ?? 0
    maybeGenerate(hat, level)
    if (!cache[cacheKey(hat, 0)]) {
      // First visit — preload default + adjacents
      maybeGenerate(hat, 0)
      maybeGenerate(hat, -1)
      maybeGenerate(hat, 1)
    }
  }

  function changeLevel(direction: 'easier' | 'deeper') {
    const current = hatLevels[activeHat] ?? 0
    const next = direction === 'easier' ? current - 1 : current + 1
    if (next < LEVEL_MIN || next > LEVEL_MAX) return
    setHatLevels(prev => ({ ...prev, [activeHat]: next }))
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    maybeGenerate(activeHat, next)
    // Preload one more step in the same direction
    maybeGenerate(activeHat, direction === 'easier' ? next - 1 : next + 1)
  }

  const activeKey = cacheKey(activeHat, activeLevel)
  const content = cache[activeKey]
  const isActiveLoading = loading.has(activeKey)
  const activeHatMeta = HATS.find(h => h.id === activeHat)!
  const canGoEasier = activeLevel > LEVEL_MIN
  const canGoDeeper = activeLevel < LEVEL_MAX

  return (
    <div className="flex h-screen flex-col bg-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white px-6 py-3 shrink-0">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/dashboard" className="text-xs text-zinc-400 hover:text-zinc-600">
            ← Dashboard
          </Link>
          <span className="text-sm font-semibold text-zinc-900 truncate max-w-xs text-center">
            {topic}
          </span>
          <Link href="/goal" className="text-xs text-zinc-400 hover:text-zinc-600">
            Change topic
          </Link>
        </div>
      </header>

      {/* Hat tabs */}
      <div className="border-b border-zinc-200 bg-white px-6 py-3 shrink-0">
        <div className="mx-auto max-w-2xl">
          <div className="flex gap-1.5">
            {HATS.map(h => {
              const isDefaultLoading = loading.has(cacheKey(h.id, 0))
              const isDefaultCached = !!cache[cacheKey(h.id, 0)]
              return (
                <button
                  key={h.id}
                  onClick={() => selectHat(h.id)}
                  className={`flex flex-1 flex-col items-center rounded-lg border px-1 py-1.5 text-center transition-colors ${
                    activeHat === h.id
                      ? h.activeClass
                      : isDefaultCached
                      ? 'border-zinc-300 text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50'
                      : 'border-zinc-200 text-zinc-400 hover:border-zinc-300 hover:bg-zinc-50'
                  }`}
                >
                  <span className="text-xs font-semibold leading-none">{h.label}</span>
                  <span className="text-[10px] leading-none opacity-70">
                    {isDefaultLoading && activeHat !== h.id ? '…' : h.description}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content area */}
      <main
        ref={contentRef}
        className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6"
      >
        {content ? (
          <div className="prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-headings:my-3">
            <ReactMarkdown>{content}</ReactMarkdown>
            {isActiveLoading && (
              <span className="inline-block h-3 w-0.5 animate-pulse bg-zinc-400 ml-0.5" />
            )}
          </div>
        ) : isActiveLoading ? (
          <div className="flex items-center justify-center py-16">
            <span className="text-sm text-zinc-400">
              Generating {activeHatMeta.label} Hat perspective…
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-sm text-zinc-500 text-center max-w-xs">
              {HAT_DESCRIPTIONS[activeHat]}
            </p>
            <button
              onClick={() => generate(activeHat, activeLevel)}
              className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700"
            >
              Generate {activeHatMeta.label} Hat
            </button>
          </div>
        )}
      </main>

      {/* Difficulty + footer */}
      {(content || isActiveLoading) && (
        <div className="border-t border-zinc-100 bg-white px-6 py-3 shrink-0">
          <div className="mx-auto max-w-2xl flex items-center justify-between gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => changeLevel('easier')}
                disabled={!canGoEasier || isActiveLoading}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-400 disabled:opacity-30"
              >
                Make this easier
              </button>
              <button
                onClick={() => changeLevel('deeper')}
                disabled={!canGoDeeper || isActiveLoading}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-400 disabled:opacity-30"
              >
                Let's go deeper
              </button>
            </div>
            <div className="flex items-center gap-3">
              {activeLevel !== 0 && (
                <span className="text-[10px] text-zinc-400">
                  {activeLevel < 0 ? `${Math.abs(activeLevel)} simpler` : `${activeLevel} deeper`}
                </span>
              )}
              <Link
                href="/dashboard"
                className="text-xs font-medium text-zinc-500 hover:text-zinc-800"
              >
                Done →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function LearnPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-zinc-400">Loading…</div>}>
      <LearnContent />
    </Suspense>
  )
}
