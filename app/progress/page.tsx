import Link from 'next/link'

export default function Progress() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <span className="text-sm font-semibold text-zinc-900">FlowCoach</span>
          <span className="text-sm text-zinc-400">Step 4 of 4</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-10">
        <div className="flex gap-1.5">
          <div className="h-1 flex-1 rounded-full bg-zinc-900" />
          <div className="h-1 flex-1 rounded-full bg-zinc-900" />
          <div className="h-1 flex-1 rounded-full bg-zinc-900" />
          <div className="h-1 flex-1 rounded-full bg-zinc-900" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Session complete</h1>
          <p className="mt-1 text-sm text-zinc-500">Here's how your Flow looked today.</p>
        </div>

        {/* Flow meter placeholder */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-zinc-400">Flow meter</p>
          <div className="flex items-end gap-2 h-24">
            {[3, 5, 4, 5, 5, 3, 4, 5].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-md bg-zinc-200"
                style={{ height: `${(h / 5) * 100}%` }}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-zinc-400">
            <span>Turn 1</span>
            <span>Turn 8</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Sprints', value: '1' },
            { label: 'Streak', value: '1 day' },
            { label: 'Avg difficulty', value: 'Just right' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 text-center">
              <p className="text-lg font-bold text-zinc-900">{value}</p>
              <p className="text-xs text-zinc-400">{label}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-600">
            Home
          </Link>
          <Link
            href="/goal"
            className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
          >
            Start New Sprint
          </Link>
        </div>
      </footer>
    </div>
  )
}
