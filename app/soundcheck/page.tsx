'use client'

import { useState, useEffect, useRef } from 'react'

function getOrCreateSessionId(): string {
  const match = document.cookie.match(/session_id=([^;]+)/)
  if (match) return match[1]
  const id = `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  document.cookie = `session_id=${id}; path=/; max-age=86400`
  return id
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function Soundcheck() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [turnCount, setTurnCount] = useState(0)
  const [warning, setWarning] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getOrCreateSessionId()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}` }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
        setTurnCount(data.turnCount)
        setWarning(data.warning)
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
      sendMessage()
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <h1 className="text-lg font-semibold text-zinc-900">FlowCoach — Soundcheck</h1>
          <span className="text-sm text-zinc-400">
            {turnCount > 0 ? `${turnCount} / 200 turns` : 'Ready'}
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6">
        {messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-zinc-400">Send a message to test the full stack.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`rounded-lg px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'ml-8 bg-zinc-900 text-white'
                    : 'mr-8 bg-white text-zinc-800 shadow-sm ring-1 ring-zinc-200'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
            {loading && (
              <div className="mr-8 rounded-lg bg-white px-4 py-3 text-sm text-zinc-400 shadow-sm ring-1 ring-zinc-200">
                Thinking…
              </div>
            )}
            {warning && (
              <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700 ring-1 ring-amber-200">
                {warning}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-2xl gap-3">
          <textarea
            className="flex-1 resize-none rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none"
            rows={2}
            placeholder="Type a message… (Enter to send)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 hover:bg-zinc-700 transition-colors"
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  )
}
