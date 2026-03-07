'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PROFILE_SECTIONS } from '@/lib/profile-sections'

type Message = { role: 'user' | 'assistant'; content: string }

function ProfileChatContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sectionId = searchParams.get('section') ?? 'quick'

  const section = PROFILE_SECTIONS.find((s) => s.id === sectionId)

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [savedSummary, setSavedSummary] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Open with Claude's first message
  useEffect(() => {
    if (section) {
      setMessages([{ role: 'assistant', content: section.openingMessage }])
    }
  }, [section]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!section) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-zinc-400">
        Unknown section. <Link href="/profile" className="ml-1 underline">Back to profile</Link>
      </div>
    )
  }

  const userTurns = messages.filter((m) => m.role === 'user').length
  const canSave = userTurns >= Math.floor(section.turnsBeforeSave * 0.6) && !saved

  async function sendMessage() {
    if (!input.trim() || streaming) return

    const userMessage = input.trim()
    setInput('')

    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setStreaming(true)

    // Build messages for API (exclude the opening assistant message from history
    // since it's already in the system prompt as openingMessage context)
    const apiMessages = newMessages.map((m) => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('/api/profile-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: sectionId, messages: apiMessages }),
      })

      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let content = ''

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        content += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content }
          return updated
        })
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '_Something went wrong. Please try again._' },
      ])
    } finally {
      setStreaming(false)
      setTimeout(() => textareaRef.current?.focus(), 50)
    }
  }

  async function finalize() {
    if (saving) return
    setSaving(true)

    const apiMessages = messages.map((m) => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('/api/profile-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: sectionId, messages: apiMessages, finalize: true }),
      })

      const data = await res.json()
      if (data.saved) {
        setSavedSummary(data.summary)
        setSaved(true)
      }
    } catch {
      // silent — show retry
    } finally {
      setSaving(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (saved && savedSummary) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-6">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Saved to your profile
            </p>
            <p className="text-sm font-bold text-zinc-900">{section.title}</p>
            <p className="mt-3 text-xs leading-relaxed text-zinc-600">{savedSummary}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/profile"
              className="flex-1 rounded-xl bg-zinc-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-zinc-700"
            >
              Back to my profile →
            </Link>
            <Link
              href="/goal"
              className="flex-1 rounded-xl border border-zinc-200 px-4 py-3 text-center text-sm font-semibold text-zinc-700 hover:border-zinc-400"
            >
              Start learning
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-zinc-50">
      {/* Header */}
      <header className="shrink-0 border-b border-zinc-200 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/profile" className="text-xs text-zinc-400 hover:text-zinc-600">
            ← Profile
          </Link>
          <div className="text-center">
            <p className="text-sm font-semibold text-zinc-900">{section.title}</p>
            <p className="text-[11px] text-zinc-400">{section.tagline}</p>
          </div>
          <div className="w-12" />
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-zinc-900 text-white'
                    : 'border border-zinc-200 bg-white text-zinc-800'
                }`}
              >
                {m.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none prose-p:my-1 prose-p:leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                    {streaming && i === messages.length - 1 && (
                      <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-zinc-400" />
                    )}
                  </div>
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* Save prompt — appears after enough turns */}
      {canSave && (
        <div className="shrink-0 border-t border-zinc-100 bg-zinc-50 px-6 py-3">
          <div className="mx-auto max-w-2xl flex items-center justify-between gap-4">
            <p className="text-xs text-zinc-500">
              Ready to save this section to your profile?
            </p>
            <button
              onClick={finalize}
              disabled={saving || streaming}
              className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-700 disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Save & Finish'}
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 border-t border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-2xl flex gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={streaming || saving}
            placeholder="Reply…"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || streaming || saving}
            className="shrink-0 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-30"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProfileChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-zinc-400">
          Loading…
        </div>
      }
    >
      <ProfileChatContent />
    </Suspense>
  )
}
