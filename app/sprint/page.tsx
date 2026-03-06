import Link from 'next/link'

const HATS = [
  { id: 'white', label: 'White', description: 'Facts & data', color: 'bg-zinc-100 text-zinc-700 border-zinc-300' },
  { id: 'yellow', label: 'Yellow', description: 'Benefits', color: 'bg-yellow-50 text-yellow-700 border-yellow-300' },
  { id: 'black', label: 'Black', description: 'Risks', color: 'bg-zinc-800 text-zinc-100 border-zinc-700' },
  { id: 'red', label: 'Red', description: 'Feelings', color: 'bg-red-50 text-red-700 border-red-300' },
  { id: 'green', label: 'Green', description: 'Ideas', color: 'bg-green-50 text-green-700 border-green-300' },
  { id: 'blue', label: 'Blue', description: 'Process', color: 'bg-blue-50 text-blue-700 border-blue-300' },
]

export default function Sprint() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <span className="text-sm font-semibold text-zinc-900">FlowCoach</span>
          <span className="text-sm text-zinc-400">Step 3 of 4</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-6 py-6">
        <div className="flex gap-1.5">
          <div className="h-1 flex-1 rounded-full bg-zinc-900" />
          <div className="h-1 flex-1 rounded-full bg-zinc-900" />
          <div className="h-1 flex-1 rounded-full bg-zinc-900" />
          <div className="h-1 flex-1 rounded-full bg-zinc-200" />
        </div>

        {/* Coaching mode — Six Hats */}
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-400">Coaching mode</p>
          <div className="grid grid-cols-3 gap-2">
            {HATS.map((hat) => (
              <button
                key={hat.id}
                className={`rounded-lg border px-3 py-2 text-left transition-opacity hover:opacity-80 ${hat.color} ${hat.id === 'white' ? 'ring-2 ring-zinc-900 ring-offset-1' : ''}`}
              >
                <p className="text-xs font-semibold">{hat.label}</p>
                <p className="text-xs opacity-70">{hat.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Coach response area */}
        <div className="flex flex-1 flex-col rounded-xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-zinc-400">Your coach</p>
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-zinc-400">Your sprint will appear here.</p>
          </div>
        </div>

        {/* Difficulty signal */}
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-400">How was that?</p>
          <div className="grid grid-cols-3 gap-2">
            {['Too easy', 'Just right', 'Too hard'].map((label) => (
              <button
                key={label}
                className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-50"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Link href="/goal" className="text-sm text-zinc-400 hover:text-zinc-600">
            Back
          </Link>
          <Link
            href="/progress"
            className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
          >
            Finish Sprint
          </Link>
        </div>
      </footer>
    </div>
  )
}
