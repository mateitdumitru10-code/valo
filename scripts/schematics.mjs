/**
 * Turn a dimensioned plan drawing into artwork the page can own.
 *
 *   node scripts/schematics.mjs
 *
 * The source drawings arrive as dark shapes on a flat grey field. Dropped onto
 * the site as-is, that grey rectangle reads as a screenshot. This converts
 * lightness into alpha — the field falls away, the shape keeps its weight, the
 * dimension lines stay solid — and recolours the whole thing in ink, so what
 * lands on the page is a plan printed on paper.
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { emit } from './emit.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'media-src')
const OUT = join(ROOT, 'apps/web/public/media/schema')
const CATALOG = join(ROOT, 'data/catalog.json')
const CURATION = join(ROOT, 'data/curation.json')

const INK = { r: 0x14, g: 0x12, b: 0x0f }
/** Anything at least this light is treated as the background field. */
const FIELD = 0.82
const PAD = 40

const catalog = JSON.parse(await readFile(CATALOG, 'utf8'))
const curation = JSON.parse(await readFile(CURATION, 'utf8'))
const schematics = { ...(curation.schematics ?? {}) }
delete schematics._note

await mkdir(OUT, { recursive: true })
const sources = await readdir(SRC)
const find = (name) =>
  sources.find((f) => f.replace(/\.(webp|jpe?g|png)$/i, '') === name)

let count = 0
for (const [slug, entry] of Object.entries(schematics)) {
  const { file: name, cm } = typeof entry === 'string' ? { file: entry } : entry
  const product = catalog.products.find((p) => p.slug === slug)
  const file = find(name)
  if (!product || !file) continue

  const { data, info } = await sharp(join(SRC, file))
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const pixels = Buffer.alloc(info.width * info.height * 4)
  let minX = info.width
  let minY = info.height
  let maxX = 0
  let maxY = 0

  for (let i = 0, p = 0; i < data.length; i += info.channels, p += 4) {
    const luma =
      (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255
    // Light field → transparent, dark line → opaque, grey mass → in between.
    const alpha = Math.max(0, Math.min(1, (FIELD - luma) / FIELD))
    pixels[p] = INK.r
    pixels[p + 1] = INK.g
    pixels[p + 2] = INK.b
    pixels[p + 3] = Math.round(alpha * 255)

    if (alpha > 0.08) {
      const px = (i / info.channels) % info.width
      const py = Math.floor(i / info.channels / info.width)
      if (px < minX) minX = px
      if (px > maxX) maxX = px
      if (py < minY) minY = py
      if (py > maxY) maxY = py
    }
  }

  // Trim to the drawing itself — this also drops any watermark sitting alone
  // in a corner of the original field.
  const left = Math.max(0, minX - PAD)
  const top = Math.max(0, minY - PAD)
  const width = Math.min(info.width - left, maxX - minX + PAD * 2)
  const height = Math.min(info.height - top, maxY - minY + PAD * 2)

  const image = sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).extract({ left, top, width, height })

  const meta = await image.clone().metadata()
  await image.webp({ quality: 92, alphaQuality: 100 }).toFile(join(OUT, `${slug}.webp`))

  product.schematic = {
    src: `/media/schema/${slug}.webp`,
    w: meta.width ?? width,
    h: meta.height ?? height,
    // Figures as printed on the drawing, so the page can set them as type
    // rather than leaving them locked inside the image.
    cm: cm ?? null,
  }
  count++
}

for (const product of catalog.products) {
  if (!schematics[product.slug]) delete product.schematic
}

await emit(catalog, ROOT)
console.log(`schematics: ${count} drawing(s)`)
