/**
 * Raster icons from apps/web/public/favicon.svg, for the places an SVG icon
 * is not taken: iOS home screens (apple-touch-icon), Google's search results
 * and older browsers (32px PNG), and Android's install prompt (the manifest).
 *
 *   node scripts/icons.mjs
 *
 * Re-run when the favicon changes — e.g. once the client's vector logo
 * replaces the placeholder "V". The SVG sets its letter in a system serif, so
 * render on a Mac, where Didot is installed, to match the browser tab.
 */
import sharp from 'sharp'
import { readFile, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const PUBLIC = join(dirname(fileURLToPath(import.meta.url)), '../apps/web/public')
const svg = await readFile(join(PUBLIC, 'favicon.svg'))

const sizes = [
  ['favicon-32.png', 32],
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
]
for (const [name, size] of sizes) {
  await sharp(svg, { density: Math.ceil((72 * size) / 64) * 2 })
    .resize(size, size)
    .flatten({ background: '#EFEBE2' })
    .png({ compressionLevel: 9 })
    .toFile(join(PUBLIC, name))
}

await writeFile(
  join(PUBLIC, 'site.webmanifest'),
  JSON.stringify(
    {
      name: 'VALLO',
      short_name: 'VALLO',
      lang: 'ro',
      start_url: '/',
      display: 'browser',
      background_color: '#F3F0E9',
      theme_color: '#F3F0E9',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    null,
    2,
  ) + '\n',
)
console.log(`icons: ${sizes.length} PNGs and site.webmanifest written`)
