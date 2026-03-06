import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6">
      <div className="flex max-w-sm flex-col items-center gap-6 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">FlowCoach</h1>
          <p className="text-base text-zinc-500">
            Stay in Flow while you learn. Switch thinking modes on the fly.
          </p>
        </div>

        <Link
          href="/onboarding"
          className="w-full rounded-xl bg-zinc-900 px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
        >
          Start Learning
        </Link>

        <p className="text-xs text-zinc-400">
          For neurodivergent and self-directed learners
        </p>
      </div>
    </div>
  )
}
