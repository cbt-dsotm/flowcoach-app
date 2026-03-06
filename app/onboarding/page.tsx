import Link from 'next/link'

export default function Onboarding() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <span className="text-sm font-semibold text-zinc-900">FlowCoach</span>
          <span className="text-sm text-zinc-400">Step 1 of 4</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-10">
        <div className="mb-8 flex gap-1.5">
          <div className="h-1 flex-1 rounded-full bg-zinc-900" />
          <div className="h-1 flex-1 rounded-full bg-zinc-200" />
          <div className="h-1 flex-1 rounded-full bg-zinc-200" />
          <div className="h-1 flex-1 rounded-full bg-zinc-200" />
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Let's get to know you</h1>
            <p className="mt-1 text-sm text-zinc-500">
              A few quick questions so your coach can adapt to how you learn best.
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
            <p className="text-sm font-medium text-zinc-700">
              How's your energy right now?
            </p>
            <div className="flex flex-col gap-2">
              {['Running low', 'Somewhere in the middle', 'Fully charged'].map((label) => (
                <button
                  key={label}
                  className="rounded-lg border border-zinc-200 px-4 py-3 text-left text-sm text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-50"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-zinc-400">
            5 questions total — takes about 90 seconds
          </p>
        </div>
      </main>

      <footer className="border-t border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-lg justify-end">
          <Link
            href="/goal"
            className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
          >
            Next
          </Link>
        </div>
      </footer>
    </div>
  )
}
