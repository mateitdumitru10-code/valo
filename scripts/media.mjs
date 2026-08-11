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

// Own photography wins over the scraped set. Applied here rather than in
// ingest.mjs so that re-ingesting from Samobi never undoes it.
const fileByName = known
for (const [slug, names] of Object.entries(curation.images ?? {})) {
  const product = catalog.products.find((p) => p.slug === slug)
  if (!product || !Array.isArray(names)) continue
  const files = names.map((n) => fileByName.get(n)).filter(Boolean)
  if (files.length) product.images = files
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
  const input = join(SRC, file)
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

const byName = new Map([...meta.values()].map((m) => [m.src, m]))
catalog.hero = curation.hero.map((n) => byName.get(n)).filter(Boolean)
for (const collection of catalog.collections) {
  collection.cover = byName.get(curation.covers[collection.id]) ?? null
  // The page header can differ from the card cover; it falls back to it.
  collection.header =
    byName.get(curation.headers?.[collection.id]) ?? collection.cover
}

await writeFile(CATALOG, JSON.stringify(catalog, null, 2))
// The web app bundles the catalogue so it renders without the API running.
await writeFile(join(ROOT, 'apps/web/src/data/catalog.json'), JSON.stringify(catalog))
console.log(
  `media: ${meta.size} images, ${rendered} renditions written, ${catalog.hero.length} hero frames`,
)
