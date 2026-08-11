/**
 * Optimise + colour-grade media-src into the web app's public folder and fold
 * the resulting metadata back into data/catalog.json.
 *
 * The source library is stitched together from several shoots (renders, studio
 * cut-outs, showroom phone photos). A single restrained grade — slight
 * desaturation, a warm lift, a touch of contrast — is what makes them read as
 * one brand rather than a scraped folder.
 *
 *   node scripts/media.mjs [--force]
 */
import { readFile, writeFile, mkdir, readdir, access } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { emit } from './emit.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'media-src')
const OUT = join(ROOT, 'apps/web/public/media')
const CATALOG = join(ROOT, 'data/catalog.json')
const CURATION = join(ROOT, 'data/curation.json')
const FORCE = process.argv.includes('--force')

const WIDTHS = [2000, 1200, 700]
const LQIP_WIDTH = 20

/** The house grade. Subtle on purpose — heavy filtering reads as a filter. */
const grade = (pipeline) =>
  pipeline
    .modulate({ saturation: 0.88, brightness: 1.015 })
    .linear(1.05, -6)
    .gamma(1.02)

const exists = (p) =>
  access(p).then(
    () => true,
    () => false,
  )

/** The staged frame studio shots are placed into: 4:3, piece at 68% height. */
const STAGE = { w: 2000, h: 1500, height: 0.68, width: 0.8 }

/**
 * Re-stage a studio shot: trim the sweep away, then set the piece back down on
 * a larger white field at a fixed size and position. Every studio frame then
 * shares one crop and one scale, so a grid of them reads as one shoot — and the
 * margin lives in the pixels rather than in a box drawn around them.
 */
async function stageStudio(input) {
  const source = sharp(input)
  const { width = 1, height = 1 } = await source.metadata()

  // The whole frame is scaled down and set into a larger field — no trimming.
  // These sweeps are vignetted, so cutting the piece out of one and dropping it
  // onto a flat colour leaves the original's corners showing as a box.
  const scale = Math.min((STAGE.h * STAGE.height) / height, (STAGE.w * STAGE.width) / width)
  const piece = await source
    .clone()
    .resize(Math.round(width * scale), Math.round(height * scale))
    .toBuffer()
  const placed = await sharp(piece).metadata()
  const pw = placed.width ?? 0
  const ph = placed.height ?? 0

  // These sweeps are vignetted: white behind the piece, grey towards the edges.
  // Lift the white point until the corners are white too, so the shot dissolves
  // into the field it is set into instead of sitting in a visible rectangle.
  const band = Math.max(4, Math.round(Math.min(pw, ph) * 0.03))
  const corner = await sharp(piece)
    .extract({ left: 0, top: 0, width: band * 4, height: band * 4 })
    .stats()
  const edge = Math.min(...corner.channels.slice(0, 3).map((c) => c.mean))
  const lift = Math.min(1.14, 255 / Math.max(edge, 200))

  const levelled = await sharp(piece).linear(lift, 0).toBuffer()

  return sharp({
    create: { width: STAGE.w, height: STAGE.h, channels: 3, background: '#ffffff' },
  })
    .composite([
      {
        input: levelled,
        left: Math.round((STAGE.w - pw) / 2),
        // A little above centre: furniture reads better with more floor beneath
        // it than headroom above.
        top: Math.round((STAGE.h - ph) * 0.45),
      },
    ])
    .png()
    .toBuffer()
}

const base = (file) => file.replace(/\.(webp|jpe?g|png)$/i, '')

const catalog = JSON.parse(await readFile(CATALOG, 'utf8'))
const curation = JSON.parse(await readFile(CURATION, 'utf8'))
const editorial = new Set(curation.editorial)

await mkdir(OUT, { recursive: true })

const sources = (await readdir(SRC)).filter((f) => /\.(webp|jpe?g|png)$/i.test(f))
const known = new Map(sources.map((f) => [base(f), f]))

// This script rewrites image entries from filenames into metadata objects, so
// running it twice would otherwise consume its own output and empty the
// catalogue. Normalise back to filenames first and the run is idempotent.
for (const product of catalog.products) {
  product.images = product.images
    .map((img) => (typeof img === 'string' ? img : known.get(img.src)))
    .filter(Boolean)
}

// Pieces Valo has photographed that Samobi's catalogue does not list. Created
// here rather than in ingest.mjs, which only ever mirrors what the API returns.
for (const [slug, spec] of Object.entries(curation.products ?? {})) {
  if (slug === '_note' || catalog.products.some((p) => p.slug === slug)) continue
  catalog.products.push({
    id: `valo-${slug}`,
    slug,
    name: spec.name,
    collection: spec.collection,
    collections: [],
    price: spec.price ?? null,
    currency: 'RON',
    lead: spec.lead ?? '',
    summary: spec.summary ?? '',
    body: spec.body ?? '',
    dimensions: spec.dimensions ?? [],
    images: [],
    source: '',
  })
}

// Own photography wins over the scraped set. Applied here rather than in
// ingest.mjs so that re-ingesting from Samobi never undoes it.
const fileByName = known
const studio = new Set()
for (const [slug, names] of Object.entries(curation.images ?? {})) {
  const product = catalog.products.find((p) => p.slug === slug)
  if (!product || !Array.isArray(names)) continue
  const files = names.map((n) => fileByName.get(n)).filter(Boolean)
  if (files.length) product.images = files
  // Studio frames are a piece on a white sweep, with margin already built into
  // the shot. Cropping them to fill a card cuts the legs off; the app shows
  // them whole instead, which is why they are flagged here.
  names.forEach((n) => studio.add(n))
}

// Hero frames and collection covers are curated independently of the product
// list, so they are rendered even when no product still references them —
// otherwise replacing a piece's photography silently empties a hero slot.
const used = new Set([
  ...catalog.products.flatMap((p) => p.images),
  ...[
    ...curation.hero,
    ...Object.values(curation.covers),
    ...Object.values(curation.headers ?? {}),
  ]
    .map((n) => fileByName.get(n))
    .filter(Boolean),
])
const meta = new Map()
let rendered = 0

for (const file of sources) {
  if (!used.has(file)) continue
  const name = base(file)
  const original = join(SRC, file)
  const input = studio.has(name) ? await stageStudio(original) : original
  const { width = 0, height = 0 } = await sharp(input).metadata()

  for (const w of WIDTHS) {
    if (w > width * 1.2) continue // never upscale beyond a hair
    const dest = join(OUT, `${name}-${w}.webp`)
    if (!FORCE && (await exists(dest))) continue
    await grade(sharp(input).resize(w, null, { withoutEnlargement: true }))
      .webp({ quality: 82, effort: 5 })
      .toFile(dest)
    rendered++
  }

  const lqip = await grade(sharp(input).resize(LQIP_WIDTH, null))
    .blur(1.2)
    .webp({ quality: 40 })
    .toBuffer()

  meta.set(file, {
    src: name,
    w: width,
    h: height,
    widths: WIDTHS.filter((w) => w <= width * 1.2),
    lqip: `data:image/webp;base64,${lqip.toString('base64')}`,
    editorial: editorial.has(name),
    studio: studio.has(name),
  })
}

for (const product of catalog.products) {
  const images = product.images
    .map((file) => meta.get(file))
    .filter(Boolean)
    .sort((a, b) => Number(b.editorial) - Number(a.editorial))
  product.images = images
  product.cover = images[0] ?? null
  product.editorial = images.some((i) => i.editorial)
}

// A piece with no usable photography would render as an empty card.
catalog.products = catalog.products.filter((p) => p.cover)

// Counts come from ingest, which has not seen the pieces created above.
for (const collection of catalog.collections) {
  collection.count = catalog.products.filter((p) => p.collection === collection.id).length
}

const byName = new Map([...meta.values()].map((m) => [m.src, m]))
catalog.hero = curation.hero.map((n) => byName.get(n)).filter(Boolean)
for (const collection of catalog.collections) {
  collection.cover = byName.get(curation.covers[collection.id]) ?? null
  // The page header can differ from the card cover; it falls back to it.
  collection.header =
    byName.get(curation.headers?.[collection.id]) ?? collection.cover
}

await emit(catalog, ROOT)

console.log(
  `media: ${meta.size} images, ${rendered} renditions written, ${catalog.hero.length} hero frames`,
)
