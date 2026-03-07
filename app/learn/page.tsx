'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

type Hat = 'white' | 'yellow' | 'black' | 'red' | 'green' | 'blue'
type Difficulty = 'Too easy' | 'Just right' | 'Too hard'

const HATS: { id: Hat; label: string; description: string; activeClass: string }[] = [
  { id: 'white',  label: 'White',  description: 'Facts',     activeClass: 'border-zinc-900 bg-zinc-900 text-white' },
  { id: 'yellow', label: 'Yellow', description: 'Benefits',  activeClass: 'border-yellow-500 bg-yellow-400 text-yellow-900' },
  { id: 'black',  label: 'Black',  description: 'Risks',     activeClass: 'border-zinc-800 bg-zinc-800 text-zinc-100' },
  { id: 'red',    label: 'Red',    description: 'Feelings',  activeClass: 'border-red-500 bg-red-500 text-white' },
  { id: 'green',  label: 'Green',  description: 'Ideas',     activeClass: 'border-green-500 bg-green-500 text-white' },
  { id: 'blue',   label: 'Blue',   description: 'Process',   activeClass: 'border-blue-500 bg-blue-500 text-white' },
]

const HAT_DESCRIPTIONS: Record<Hat, string> = {
  white:  'Facts, data, and verifiable information — no opinion.',
  yellow: 'Benefits, value, and why this topic matters.',
  black:  'Risks, misconceptions, and what can go wrong.',
  red:    'Your gut reaction and emotional experience.',
  green:  'Creative analogies, metaphors, and lateral thinking.',
  blue:   'How to think about learning this topic — the process.',
}

function LearnContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const topic = searchParams.get('topic') ?? ''
  const winCondition = searchParams.get('win') ?? null
  const confidence = searchParams.get('confidence') ? Number(searchParams.get('confidence')) : null

  const [activeHat, setActiveHat] = useState<Hat>('white')
  const [cache, setCache] = useState<Partial<Record<Hat, string>>>({})
  const [loading, setLoading] = useState<Hat | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty>('Just right')
  const contentRef = useRef<HTMLDivElement>(null)

  // Auto-generate white hat on mount
  useEffect(() => {
    if (topic) generateContent('white', null)
  }, [topic]) // eslint-disable-line react-hooks/exhaustive-deps

  async function generateContent(hat: Hat, difficultyInstruction: string | null) {
    setLoading(hat)
    try {
      const res = await fetch('/api/hat-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hat,
          topic,
          win_condition: winCondition,
          confidence,
          difficulty_instruction: difficultyInstruction,
        }),
      })
      const data = await res.json()
      if (data.content) {
        setCache(prev => ({ ...prev, [hat]: data.content }))
        contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch {
      // fail silently — show error in content area
      setCache(prev => ({ ...prev, [hat]: '_Failed to load. Try again._' }))
    } finally {
      setLoading(null)
    }
  }

  function selectHat(hat: Hat) {
    setActiveHat(hat)
    setDifficulty('Just right')
    if (!cache[hat]) {
      generateContent(hat, null)
    }
  }

  function applyDifficulty(d: Difficulty) {
    setDifficulty(d)
    if (d === 'Just right') return
    const instruction = d === 'Too easy'
      ? 'Go deeper: increase specificity, add nuance, assume stronger prior knowledge'
      : 'Simplify: reduce scope, use more basic examples, assume less prior knowledge'
    // Clear cache for this hat and regenerate
    setCache(prev => ({ ...prev, [activeHat]: undefined }))
    generateContent(activeHat, instruction)
  }

  const activeHatMeta = HATS.find(h => h.id === activeHat)!
  const content = cache[activeHat]
  const isLoading = loading === activeHat

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
            {HATS.map(h => (
              <button
                key={h.id}
                onClick={() => selectHat(h.id)}
                disabled={loading !== null}
                className={`flex flex-1 flex-col items-center rounded-lg border px-1 py-1.5 text-center transition-colors disabled:opacity-60 ${
                  activeHat === h.id
                    ? h.activeClass
                    : 'border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:bg-zinc-50'
                } ${loading === h.id ? 'animate-pulse' : ''}`}
              >
                <span className="text-xs font-semibold leading-none">{h.label}</span>
                <span className="text-[10px] leading-none opacity-70">{h.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content area */}
      <main
        ref={contentRef}
        className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-6 py-6"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="text-sm text-zinc-400">
              Generating {activeHatMeta.label} Hat perspective…
            </div>
          </div>
        ) : content ? (
          <div className="prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-headings:my-3">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-sm text-zinc-500 text-center max-w-xs">
              {HAT_DESCRIPTIONS[activeHat]}
            </p>
            <button
              onClick={() => generateContent(activeHat, null)}
              className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700"
            >
              Generate {activeHatMeta.label} Hat
            </button>
          </div>
        )}
      </main>

      {/* Difficulty + footer */}
      {content && !isLoading && (
        <div className="border-t border-zinc-100 bg-white px-6 py-3 shrink-0">
          <div className="mx-auto max-w-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 shrink-0">How does this feel?</span>
              <div className="flex gap-1.5">
                {(['Too easy', 'Just right', 'Too hard'] as Difficulty[]).map(d => (
                  <button
                    key={d}
                    onClick={() => applyDifficulty(d)}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      difficulty === d
                        ? 'border-zinc-900 bg-zinc-900 text-white'
                        : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <Link
              href="/dashboard"
              className="text-xs font-medium text-zinc-500 hover:text-zinc-800"
            >
              Done →
            </Link>
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
