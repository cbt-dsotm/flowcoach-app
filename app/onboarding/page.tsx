'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ChoiceQuestion {
  id: string
  question: string
  type: 'choice'
  options: string[]
}

interface TextQuestion {
  id: string
  question: string
  type: 'text'
  placeholder: string
}

type Question = ChoiceQuestion | TextQuestion

const QUESTIONS: Question[] = [
  {
    id: 'energy',
    question: "How's your energy right now?",
    type: 'choice',
    options: ['Running low', 'Somewhere in the middle', 'Fully charged'],
  },
  {
    id: 'learning_style',
    question: 'How do you learn best?',
    type: 'choice',
    options: [
      'Show me examples first',
      'Explain the concept, then show me',
      'Let me try it and figure it out',
      'Give me the big picture first',
    ],
  },
  {
    id: 'distraction_pattern',
    question: 'When you try to focus...',
    type: 'choice',
    options: [
      'I lose focus easily and need reminders',
      'I hyperfocus and lose track of time',
      'I stay pretty steady',
    ],
  },
  {
    id: 'feedback_style',
    question: 'How should your coach talk to you?',
    type: 'choice',
    options: [
      'Direct and honest, even if it stings',
      'Keep it encouraging',
      'Just give me the facts',
    ],
  },
  {
    id: 'session_length',
    question: 'How long do you want to sprint today?',
    type: 'choice',
    options: ['Quick (10–15 min)', 'Standard (20–25 min)', 'Deep dive (30+ min)'],
  },
  {
    id: 'notes',
    question: 'Anything your coach should know? (optional)',
    type: 'text',
    placeholder: 'e.g. I need lots of examples, I get frustrated when things are too abstract…',
  },
]

export default function Onboarding() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const question = QUESTIONS[current]
  const isLast = current === QUESTIONS.length - 1
  const answer = answers[question.id] ?? ''
  const canAdvance = question.type === 'text' || !!answer

  function selectChoice(value: string) {
    setAnswers(prev => ({ ...prev, [question.id]: value }))
  }

  function handleText(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))
  }

  async function advance() {
    if (!canAdvance) return

    if (!isLast) {
      setCurrent(c => c + 1)
      return
    }

    // Last question — save profile
    setSaving(true)
    try {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
        credentials: 'include',
      })
    } catch {
      // Non-blocking — navigate anyway
    } finally {
      setSaving(false)
      router.push('/dashboard')
    }
  }

  function back() {
    if (current > 0) setCurrent(c => c - 1)
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <span className="text-sm font-semibold text-zinc-900">FlowCoach</span>
          <span className="text-sm text-zinc-400">Step 1 of 4</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-10">
        {/* Screen progress bar */}
        <div className="mb-8 flex gap-1.5">
          <div className="h-1 flex-1 rounded-full bg-zinc-900" />
          <div className="h-1 flex-1 rounded-full bg-zinc-200" />
          <div className="h-1 flex-1 rounded-full bg-zinc-200" />
          <div className="h-1 flex-1 rounded-full bg-zinc-200" />
        </div>

        <div className="flex flex-col gap-6">
          {/* Question counter */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-zinc-400">
              {current + 1} of {QUESTIONS.length}
            </span>
            <div className="flex flex-1 gap-1">
              {QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  className={`h-0.5 flex-1 rounded-full transition-colors ${
                    i <= current ? 'bg-zinc-900' : 'bg-zinc-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Question card */}
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
            <p className="mb-4 text-base font-semibold text-zinc-900">{question.question}</p>

            {question.type === 'choice' && (
              <div className="flex flex-col gap-2">
                {question.options.map((opt) => {
                  const selected = answer === opt
                  return (
                    <button
                      key={opt}
                      onClick={() => selectChoice(opt)}
                      className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                        selected
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : 'border-zinc-200 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50'
                      }`}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
            )}

            {question.type === 'text' && (
              <textarea
                className="w-full resize-none rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none"
                rows={3}
                placeholder={(question as TextQuestion).placeholder}
                value={answer}
                onChange={handleText}
              />
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <button
            onClick={back}
            disabled={current === 0}
            className="text-sm text-zinc-400 hover:text-zinc-600 disabled:opacity-0"
          >
            Back
          </button>
          <button
            onClick={advance}
            disabled={!canAdvance || saving}
            className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:opacity-40"
          >
            {saving ? 'Saving…' : isLast ? 'Done' : 'Next'}
          </button>
        </div>
      </footer>
    </div>
  )
}
