export default function MapDemo() {
  return (
    <div
      className="relative w-full min-h-screen overflow-hidden"
      style={{
        backgroundImage: "url('/map-bg-1k.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay to soften the map and keep cards readable */}
      <div className="absolute inset-0 bg-amber-950/20" />

      {/* Dashboard overlay preview */}
      <div className="relative z-10 flex flex-col gap-6 p-8 max-w-4xl mx-auto">

        {/* Header row */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-amber-950 drop-shadow-sm">
              Welcome back, Wanderer.
            </h1>
            <p className="text-amber-900 mt-1 text-sm font-medium">Your learning journey continues.</p>
          </div>
          <div className="bg-amber-100/75 backdrop-blur-sm border-2 border-amber-600/60 rounded-xl px-4 py-2 text-amber-900 font-semibold text-sm shadow">
            ◎ Wanderer
          </div>
        </div>

        {/* Profile card */}
        <div className="bg-amber-50/82 backdrop-blur-sm border-2 border-amber-600/60 rounded-2xl p-6 shadow-lg">
          <div className="text-xs font-bold text-amber-700 tracking-widest mb-1">STEP 1</div>
          <div className="text-xl font-bold text-zinc-800 mb-1">Build Your Profile</div>
          <p className="text-zinc-600 text-sm mb-4">Tell us who you are so coaching adapts to you.</p>
          <button className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg px-5 py-2 shadow">
            Start Here →
          </button>
        </div>

        {/* Mode cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "LEARN MODE",   name: "Learn",      border: "border-emerald-600/60", btn: "bg-emerald-600" },
            { label: "PRACTICE",     name: "Practice",   border: "border-amber-600/50",   btn: "bg-amber-600"   },
            { label: "FLASHCARDS",   name: "Flashcards", border: "border-amber-500/45",   btn: "bg-amber-500"   },
          ].map(({ label, name, border, btn }) => (
            <div key={name} className={`bg-amber-50/80 backdrop-blur-sm border-2 ${border} rounded-2xl p-5 shadow-lg`}>
              <div className="text-xs font-bold text-amber-700 tracking-widest mb-1">{label}</div>
              <div className="text-lg font-bold text-zinc-800 mb-3">{name}</div>
              <button className={`w-full ${btn} text-white text-sm font-semibold rounded-lg py-2 shadow`}>
                Start
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
