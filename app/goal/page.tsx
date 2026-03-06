import Link from 'next/link'

export default function Goal() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <span className="text-sm font-semibold text-zinc-900">FlowCoach</span>
          <span className="text-sm text-zinc-400">Step 2 of 4</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-10">
        <div className="mb-8 flex gap-1.5">
          <div className="h-1 flex-1 rounded-full bg-zinc-900" />
          <div className="h-1 flex-1 rounded-full bg-zinc-900" />
          <div className="h-1 flex-1 rounded-full bg-zinc-200" />
          <div className="h-1 flex-1 rounded-full bg-zinc-200" />
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">What do you want to learn today?</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Pick something small enough to win in 20–30 minutes.
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-700">Topic</label>
              <input
                type="text"
                placeholder="e.g. How does recursion work?"
                className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-700">What would feel like a win?</label>
              <input
                type="text"
                placeholder="e.g. I can explain it to someone else"
                className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-700">
                Confidence going in <span className="text-zinc-400 font-normal">(1 = no idea, 5 = I just need a refresher)</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-50"
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Link href="/onboarding" className="text-sm text-zinc-400 hover:text-zinc-600">
            Back
          </Link>
          <Link
            href="/sprint"
            className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
          >
            Start Sprint
          </Link>
        </div>
      </footer>
    </div>
  )
}
