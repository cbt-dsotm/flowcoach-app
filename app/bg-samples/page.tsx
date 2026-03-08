export default function BgSamples() {
  return (
    <div className="min-h-screen bg-zinc-900 p-8">
      <h1 className="text-white text-2xl font-bold mb-2">Dashboard Background Samples</h1>
      <p className="text-zinc-400 text-sm mb-8">Each panel is 100% CSS/SVG — no external assets.</p>

      <div className="grid grid-cols-1 gap-10">

        {/* Option A — Parchment + Grid Lines */}
        <section>
          <h2 className="text-white font-semibold mb-2">A — CSS Parchment + Grid Lines</h2>
          <p className="text-zinc-400 text-xs mb-3">Layered gradients on warm amber-cream. Faint coordinate grid. Feels like aged nautical chart paper.</p>
          <div
            className="relative w-full h-64 rounded-xl overflow-hidden"
            style={{
              background: `
                linear-gradient(rgba(180,150,90,0.08) 1px, transparent 1px),
                linear-gradient(90deg, rgba(180,150,90,0.08) 1px, transparent 1px),
                linear-gradient(rgba(180,150,90,0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(180,150,90,0.04) 1px, transparent 1px),
                radial-gradient(ellipse at 20% 50%, rgba(210,170,100,0.25) 0%, transparent 60%),
                radial-gradient(ellipse at 80% 20%, rgba(190,150,80,0.2) 0%, transparent 50%),
                linear-gradient(160deg, #f5e8c8 0%, #ead9a8 35%, #e2cc8e 65%, #d4b86a 100%)
              `,
              backgroundSize: '80px 80px, 80px 80px, 20px 20px, 20px 20px, 100% 100%, 100% 100%, 100% 100%',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-amber-900/20" />
            <SampleCard title="Learn" color="bg-amber-50/80 border-amber-300" />
          </div>
        </section>

        {/* Option B — SVG Topographic Contour */}
        <section>
          <h2 className="text-white font-semibold mb-2">B — SVG Contour Pattern</h2>
          <p className="text-zinc-400 text-xs mb-3">Repeating SVG tile: topographic contour lines on warm paper. Zero external deps, infinitely scalable.</p>
          <div
            className="relative w-full h-64 rounded-xl overflow-hidden"
            style={{
              backgroundColor: '#f0e6c8',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cellipse cx='60' cy='60' rx='55' ry='45' fill='none' stroke='%23c9a84c' stroke-width='0.6' stroke-opacity='0.35'/%3E%3Cellipse cx='60' cy='60' rx='42' ry='32' fill='none' stroke='%23c9a84c' stroke-width='0.6' stroke-opacity='0.35'/%3E%3Cellipse cx='60' cy='60' rx='28' ry='20' fill='none' stroke='%23c9a84c' stroke-width='0.6' stroke-opacity='0.35'/%3E%3Cellipse cx='60' cy='60' rx='15' ry='10' fill='none' stroke='%23c9a84c' stroke-width='0.6' stroke-opacity='0.35'/%3E%3Cellipse cx='20' cy='20' rx='18' ry='14' fill='none' stroke='%23c9a84c' stroke-width='0.6' stroke-opacity='0.25'/%3E%3Cellipse cx='20' cy='20' rx='10' ry='7' fill='none' stroke='%23c9a84c' stroke-width='0.6' stroke-opacity='0.25'/%3E%3Cellipse cx='100' cy='100' rx='18' ry='14' fill='none' stroke='%23c9a84c' stroke-width='0.6' stroke-opacity='0.25'/%3E%3Cellipse cx='100' cy='100' rx='10' ry='7' fill='none' stroke='%23c9a84c' stroke-width='0.6' stroke-opacity='0.25'/%3E%3C/svg%3E")`,
              backgroundSize: '120px 120px',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/40 to-amber-200/30" />
            <SampleCard title="Learn" color="bg-amber-50/85 border-amber-400" />
          </div>
        </section>

        {/* Option C — Blueprint */}
        <section>
          <h2 className="text-white font-semibold mb-2">C — Blueprint / Navigation Chart</h2>
          <p className="text-zinc-400 text-xs mb-3">Dark navy base + fine white grid. Technical drawing or navigation chart feel. Pairs well with the existing violet/indigo palette.</p>
          <div
            className="relative w-full h-64 rounded-xl overflow-hidden"
            style={{
              background: `
                linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px),
                linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px),
                linear-gradient(135deg, #0f1f4a 0%, #162248 40%, #1a2a5e 70%, #0f1a3d 100%)
              `,
              backgroundSize: '60px 60px, 60px 60px, 12px 12px, 12px 12px, 100% 100%',
            }}
          >
            <div className="absolute inset-0 bg-radial-[ellipse_at_center] from-indigo-900/20 to-transparent" />
            <SampleCard title="Learn" color="bg-indigo-950/70 border-indigo-400/50 text-white" dark />
          </div>
        </section>

        {/* Option D — Noise Texture + Vignette */}
        <section>
          <h2 className="text-white font-semibold mb-2">D — Noise Texture + Vignette</h2>
          <p className="text-zinc-400 text-xs mb-3">SVG noise filter over warm gradient simulates old paper grain. Subtle — works as a quiet floor under content cards.</p>
          <div className="relative w-full h-64 rounded-xl overflow-hidden">
            <svg className="absolute inset-0 w-0 h-0">
              <filter id="paper-noise">
                <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                <feColorMatrix type="saturate" values="0" />
                <feBlend in="SourceGraphic" mode="multiply" />
              </filter>
            </svg>
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(150deg, #f2e2b0 0%, #e8d490 40%, #dfc870 70%, #d4b855 100%)',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                filter: 'url(#paper-noise)',
                opacity: 0.18,
                background: '#8b6914',
              }}
            />
            {/* Vignette */}
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at center, transparent 40%, rgba(100,70,10,0.35) 100%)',
              }}
            />
            <SampleCard title="Learn" color="bg-yellow-50/80 border-yellow-600/50" />
          </div>
        </section>

        {/* Option E — Static image style (simulated with rich gradient) */}
        <section>
          <h2 className="text-white font-semibold mb-2">E — Photo Map Style (simulated)</h2>
          <p className="text-zinc-400 text-xs mb-3">Mimics a real antique map photo. In production this would be an image asset. Heavy overlay keeps cards readable.</p>
          <div
            className="relative w-full h-64 rounded-xl overflow-hidden"
            style={{
              background: `
                linear-gradient(rgba(180,140,70,0.08) 1px, transparent 1px),
                linear-gradient(90deg, rgba(180,140,70,0.08) 1px, transparent 1px),
                radial-gradient(ellipse at 30% 40%, rgba(210,160,60,0.5) 0%, transparent 50%),
                radial-gradient(ellipse at 70% 70%, rgba(160,120,40,0.4) 0%, transparent 45%),
                radial-gradient(ellipse at 60% 20%, rgba(230,200,120,0.35) 0%, transparent 40%),
                linear-gradient(120deg, #c8a850 0%, #b8923a 30%, #a07828 60%, #8a6420 100%)
              `,
              backgroundSize: '60px 60px, 60px 60px, 100% 100%, 100% 100%, 100% 100%, 100% 100%',
            }}
          >
            {/* Overlay to ensure card readability */}
            <div className="absolute inset-0 bg-amber-950/50" />
            <SampleCard title="Learn" color="bg-amber-50/80 border-amber-300" />
          </div>
        </section>

        {/* Bonus: A+B combined */}
        <section>
          <h2 className="text-white font-semibold mb-2">Bonus — A + B Combined (Parchment base + contour overlay)</h2>
          <p className="text-zinc-400 text-xs mb-3">Warm parchment gradient with SVG contour lines on top. Rich without being busy.</p>
          <div
            className="relative w-full h-64 rounded-xl overflow-hidden"
            style={{
              backgroundColor: '#eddea4',
              backgroundImage: `
                url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cellipse cx='60' cy='60' rx='55' ry='45' fill='none' stroke='%23a07828' stroke-width='0.7' stroke-opacity='0.3'/%3E%3Cellipse cx='60' cy='60' rx='42' ry='32' fill='none' stroke='%23a07828' stroke-width='0.7' stroke-opacity='0.3'/%3E%3Cellipse cx='60' cy='60' rx='28' ry='20' fill='none' stroke='%23a07828' stroke-width='0.7' stroke-opacity='0.3'/%3E%3Cellipse cx='60' cy='60' rx='15' ry='10' fill='none' stroke='%23a07828' stroke-width='0.7' stroke-opacity='0.3'/%3E%3Cellipse cx='20' cy='20' rx='18' ry='14' fill='none' stroke='%23a07828' stroke-width='0.7' stroke-opacity='0.2'/%3E%3Cellipse cx='20' cy='20' rx='10' ry='7' fill='none' stroke='%23a07828' stroke-width='0.7' stroke-opacity='0.2'/%3E%3Cellipse cx='100' cy='100' rx='18' ry='14' fill='none' stroke='%23a07828' stroke-width='0.7' stroke-opacity='0.2'/%3E%3Cellipse cx='100' cy='100' rx='10' ry='7' fill='none' stroke='%23a07828' stroke-width='0.7' stroke-opacity='0.2'/%3E%3C/svg%3E"),
                linear-gradient(rgba(160,120,40,0.06) 1px, transparent 1px),
                linear-gradient(90deg, rgba(160,120,40,0.06) 1px, transparent 1px),
                radial-gradient(ellipse at 20% 50%, rgba(210,170,100,0.3) 0%, transparent 60%),
                linear-gradient(160deg, #f5e8c8 0%, #ead9a8 35%, #e2cc8e 65%, #d4b86a 100%)
              `,
              backgroundSize: '120px 120px, 80px 80px, 80px 80px, 100% 100%, 100% 100%',
            }}
          >
            <div
              className="absolute inset-0"
              style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(100,70,10,0.2) 100%)' }}
            />
            <SampleCard title="Learn" color="bg-amber-50/85 border-amber-500/60" />
          </div>
        </section>

      </div>
    </div>
  )
}

function SampleCard({ title, color, dark = false }: { title: string; color: string; dark?: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6">
      <div className={`rounded-xl border-2 p-5 w-56 shadow-lg ${color}`}>
        <div className={`text-xs font-semibold mb-1 ${dark ? 'text-indigo-300' : 'text-amber-700'}`}>LEARN MODE</div>
        <div className={`text-lg font-bold mb-2 ${dark ? 'text-white' : 'text-zinc-800'}`}>{title}</div>
        <div className={`text-xs mb-3 ${dark ? 'text-zinc-300' : 'text-zinc-600'}`}>White Hat · Level 0</div>
        <div className={`text-xs rounded px-3 py-1.5 text-center font-medium ${dark ? 'bg-indigo-500 text-white' : 'bg-emerald-500 text-white'}`}>
          Start
        </div>
      </div>
    </div>
  )
}
