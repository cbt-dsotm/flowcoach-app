'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Hat = 'white' | 'yellow' | 'black' | 'red' | 'green' | 'blue'
type Difficulty = 'Too easy' | 'Just right' | 'Too hard'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const HATS: { id: Hat; label: string; description: string; style: string; activeStyle: string }[] = [
  { id: 'white',  label: 'White',  description: 'Facts',      style: 'border-zinc-200 text-zinc-600',       activeStyle: 'border-zinc-900 bg-zinc-900 text-white' },
  { id: 'yellow', label: 'Yellow', description: 'Benefits',   style: 'border-yellow-200 text-yellow-700',   activeStyle: 'border-yellow-500 bg-yellow-400 text-yellow-900' },
  { id: 'black',  label: 'Black',  description: 'Risks',      style: 'border-zinc-300 text-zinc-500',       activeStyle: 'border-zinc-800 bg-zinc-800 text-zinc-100' },
  { id: 'red',    label: 'Red',    description: 'Feelings',   style: 'border-red-200 text-red-600',         activeStyle: 'border-red-500 bg-red-500 text-white' },
  { id: 'green',  label: 'Green',  description: 'Ideas',      style: 'border-green-200 text-green-700',     activeStyle: 'border-green-500 bg-green-500 text-white' },
  { id: 'blue',   label: 'Blue',   description: 'Process',    style: 'border-blue-200 text-blue-600',       activeStyle: 'border-blue-500 bg-blue-500 text-white' },
]

export default function Sprint() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [hat, setHat] = useState<Hat>('white')
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
  const [turnCount, setTurnCount] = useState(0)
  const [warning, setWarning] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Auto-start: fire the first coaching turn on mount
  useEffect(() => {
    if (started.current) return
    started.current = true
    sendMessage('Start my sprint.', true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function sendMessage(text: string, isKickoff = false) {
    if (loading) return

    const userText = text.trim()
    if (!userText) return

    if (!isKickoff) {
      setMessages(prev => [...prev, { role: 'user', content: userText }])
      setInput('')
    }

    setLoading(true)

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          hat,
          difficulty: difficulty ?? undefined,
        }),
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}` }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
        setTurnCount(data.turnCount)
        setWarning(data.warning)
        setDifficulty(null) // reset after each send
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Network error. Try again.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const lastIsAssistant = messages.length > 0 && messages[messages.length - 1].role === 'assistant'

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <span className="text-sm font-semibold text-zinc-900">FlowCoach</span>
          <span className="text-sm text-zinc-400">
            {turnCount > 0 ? `${turnCount} turns` : 'Step 3 of 4'}
          </span>
        </div>
      </header>

      <div className="border-b border-zinc-200 bg-white px-6 py-3">
        <div className="mx-auto max-w-lg">
          <div className="flex gap-1.5">
            {HATS.map(h => (
              <button
                key={h.id}
                onClick={() => setHat(h.id)}
                className={`flex flex-1 flex-col items-center rounded-lg border px-1 py-1.5 transition-colors ${
                  hat === h.id ? h.activeStyle : `${h.style} hover:opacity-80`
                }`}
              >
                <span className="text-xs font-semibold leading-none">{h.label}</span>
                <span className="text-[10px] leading-none opacity-70">{h.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 overflow-y-auto px-6 py-6">
        {messages.length === 0 && !loading && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-zinc-400">Starting your sprint…</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'ml-8 bg-zinc-900 text-white'
                  : 'mr-4 bg-white text-zinc-800 shadow-sm ring-1 ring-zinc-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}

          {loading && (
            <div className="mr-4 rounded-xl bg-white px-4 py-3 text-sm text-zinc-400 shadow-sm ring-1 ring-zinc-200">
              Thinking…
            </div>
          )}

          {warning && (
            <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 ring-1 ring-amber-200">
              {warning}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Difficulty signal — shown after coach responds */}
      {lastIsAssistant && !loading && (
        <div className="border-t border-zinc-100 bg-white px-6 py-3">
          <div className="mx-auto max-w-lg">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 shrink-0">Last turn:</span>
              <div className="flex gap-2">
                {(['Too easy', 'Just right', 'Too hard'] as Difficulty[]).map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(prev => prev === d ? null : d)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
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
          </div>
        </div>
      )}

      <footer className="border-t border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-lg flex-col gap-3">
          <div className="flex gap-3">
            <textarea
              className="flex-1 resize-none rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none"
              rows={2}
              placeholder="Answer the exercise… (Enter to send)"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:opacity-40"
            >
              Send
            </button>
          </div>
          <div className="flex items-center justify-between">
            <Link href="/goal" className="text-xs text-zinc-400 hover:text-zinc-600">
              ← Change goal
            </Link>
            <Link
              href="/progress"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:border-zinc-500 hover:text-zinc-900"
            >
              Finish sprint →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
