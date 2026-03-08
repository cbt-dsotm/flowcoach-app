/**
 * Generate a dashboard background image using Gemini (Nano Banana 2).
 * Run: GEMINI_API_KEY=your_key node scripts/generate-bg.mjs
 * Output: public/map-bg.png
 */

import { writeFileSync } from "node:fs"

const KEY = process.env.GEMINI_API_KEY
if (!KEY) {
  console.error("Missing GEMINI_API_KEY. Run: GEMINI_API_KEY=your_key node scripts/generate-bg.mjs")
  process.exit(1)
}

const MODEL    = "gemini-3-pro-image-preview"
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

const PROMPT = `
An aged antique nautical exploration map on worn parchment, 16th century cartographic style.
Fictional continents and archipelagos with irregular coastlines rendered with fine hachure strokes.
A detailed compass rose with sixteen rhumb lines radiating across the ocean.
Latitude and longitude graticule grid lines in faded ink.
Decorative sea monsters and tall-masted sailing ships in the open ocean.
Ornate cartouche in the corner with Latin text.
Scattered depth soundings and coastal place names in italic serif lettering.
Ocean filled with fine horizontal hatching lines.
Warm amber, sepia, and aged cream tones throughout.
Double decorative border frame with degree markings.
Museum-quality reproduction, extremely detailed, high fidelity.
Landscape orientation, widescreen aspect ratio.
`.trim()

console.log("Calling Gemini API (Nano Banana 2)…")

const res = await fetch(`${ENDPOINT}?key=${KEY}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    contents: [{ parts: [{ text: PROMPT }] }],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio: "16:9",
        imageSize:   "4K",
      },
    },
  }),
})

if (!res.ok) {
  const err = await res.text()
  console.error(`API error ${res.status}:`, err)
  process.exit(1)
}

const json = await res.json()

let saved = false
for (const part of json.candidates?.[0]?.content?.parts ?? []) {
  if (part.inlineData?.data) {
    const buf = Buffer.from(part.inlineData.data, "base64")
    writeFileSync("public/map-bg.png", buf)
    console.log(`Saved public/map-bg.png (${(buf.length / 1024).toFixed(0)} KB)`)
    saved = true
  }
}

if (!saved) {
  console.error("No image in response. Full response:")
  console.error(JSON.stringify(json, null, 2))
  process.exit(1)
}
