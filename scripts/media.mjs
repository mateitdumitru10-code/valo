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

/**
 * The staged frame studio shots are placed into. Sizes and positions refer to
 * the piece itself, not to the photograph around it — the sweeps have the
 * furniture sitting off-centre by varying amounts, so matching frames would
 * leave the pieces mismatched.
 */
const STAGE = { w: 2000, h: 1500, width: 0.78, cap: 0.72, baseline: 0.8 }

/**
 * Re-stage a studio shot: trim the sweep away, then set the piece back down on
 * a larger white field at a fixed size and position. Every studio frame then
 * shares one crop and one scale, so a grid of them reads as one shoot — and the
 * margin lives in the pixels rather than in a box drawn around them.
 */
async function stageStudio(input) {
  const source = sharp(input)
  const { width = 1, height = 1 } = await source.metadata()

  // Where the furniture actually is inside the frame. Measured on a small copy:
  // anything appreciably darker than the sweep is the piece or its shadow.
  const SCAN = 240
  const { data, info } = await source
    .clone()
    .resize(SCAN, null)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const lumaAt = (px) => {
    const i = px * info.channels
    return (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255
  }

  // The threshold is relative to each shot's own background, not fixed: some
  // sweeps are pure white, others a light grey. A fixed cut read the grey ones
  // as solid subject, so the piece came out smaller than the rest.
  const corners = [
    0,
    info.width - 1,
    (info.height - 1) * info.width,
    info.height * info.width - 1,
  ].map(lumaAt)
  const field = Math.max(...corners)
  const cut = Math.min(0.94, field - 0.05)

  let minX = info.width
  let minY = info.height
  let maxX = 0
  let maxY = 0
  for (let i = 0, px = 0; i < data.length; i += info.channels, px++) {
    if (lumaAt(px) > cut) continue
    const x = px % info.width
    const y = Math.floor(px / info.width)
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }

  const ratio = width / info.width
  let box = { left: 0, top: 0, width, height }
  if (maxX > minX && maxY > minY) {
    // Scaling the measured box back up can round past the edge of the frame,
    // which sharp rejects outright — clamp it to what actually exists.
    const left = Math.max(0, Math.round(minX * ratio))
    const top = Math.max(0, Math.round(minY * ratio))
    box = {
      left,
      top,
      width: Math.max(1, Math.min(width - left, Math.round((maxX - minX + 1) * ratio))),
      height: Math.max(1, Math.min(height - top, Math.round((maxY - minY + 1) * ratio))),
    }
  }

  // Width sets the scale, height only caps it. Taking the smaller of the two
  // made the apparent size depend on the subject's proportions: a bed shot with
  // its nightstands came out larger than one without, and a tall piece shrank.
  // Normalising on width means every piece occupies the same span of the frame.
  const scale = Math.min(
    (STAGE.w * STAGE.width) / box.width,
    (STAGE.h * STAGE.cap) / box.height,
  )
  const piece = await source
    .clone()
    .extract(box)
    .resize(Math.round(box.width * scale), Math.round(box.height * scale))
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
        // Every piece stands on the same line, with more floor beneath it than
        // headroom above.
        top: Math.max(0, Math.round(STAGE.h * STAGE.baseline - ph)),
      },
    ])
    .png()
    .toBuffer()
}

const base = (file) => file.replace(/\.(webp|jpe?g|png)$/i, '')

const catalog = JSON.parse(await readFile(CATALOG, 'utf8'))
const curation = JSON.parse(await readFile(CURATION, 'utf8'))
const editorial = new Set(curation.editorial)

// The catalogue used to call the six kinds of piece `collections`. That word
// now names the ranges — Aldo, Cubic, Soria — so the kinds became categories.
// Normalising here rather than in ingest.mjs keeps a stale catalogue readable.
if (!catalog.categories) {
  catalog.categories = catalog.collections ?? []
  delete catalog.collections
}
for (const product of catalog.products) {
  if (product.category === undefined) {
    product.category = product.collection
    delete product.collection
  }
}

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

// Pieces Valo has photographed that Samobi's catalogue does not list, and
// corrections to the ones it does. Handled here rather than in ingest.mjs,
// which only ever mirrors what the API returns.
for (const [slug, spec] of Object.entries(curation.products ?? {})) {
  if (slug === '_note') continue

  const existing = catalog.products.find((p) => p.slug === slug)
  if (existing) {
    // Only what the entry actually states — a missing price must not wipe one.
    for (const field of ['name', 'category', 'price', 'lead', 'summary', 'body']) {
      if (spec[field] !== undefined && spec[field] !== null) existing[field] = spec[field]
    }
    continue
  }

  catalog.products.push({
    id: `valo-${slug}`,
    slug,
    name: spec.name,
    category: spec.category,
    categories: [],
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

  // Captioned extra frames — the angle, the side, the piece opened out. A
  // colour picker turns the rest of the gallery into swatches, so without this
  // the only way to tell a side view from another colour is to look at it.
  const named = curation.views?.[product.slug]
  if (Array.isArray(named)) {
    const shown = new Set(images.map((i) => i.src))
    product.views = named.filter((v) => shown.has(v.src))
  } else {
    delete product.views
  }
}

// Dropped pieces, and any piece left without usable photography — the latter
// would otherwise render as an empty card.
const excluded = new Set(curation.exclude?.slugs ?? [])
catalog.products = catalog.products.filter((p) => p.cover && !excluded.has(p.slug))

// Counts come from ingest, which has seen neither the pieces created above nor
// the ones dropped here. A category left with nothing in it goes too.
for (const category of catalog.categories) {
  category.count = catalog.products.filter((p) => p.category === category.id).length
}
catalog.categories = catalog.categories.filter((c) => c.count > 0)

const byName = new Map([...meta.values()].map((m) => [m.src, m]))
catalog.hero = curation.hero.map((n) => byName.get(n)).filter(Boolean)
for (const category of catalog.categories) {
  category.cover = byName.get(curation.covers[category.id]) ?? null
  // The page header can differ from the card cover; it falls back to it.
  category.header = byName.get(curation.headers?.[category.id]) ?? category.cover
}

// The named ranges. A range is one design carried across several kinds of
// piece, so its order is the order it is listed in — largest piece first, which
// is the one that shows the language the rest of the range is written in.
const bySlug = new Map(catalog.products.map((p) => [p.slug, p]))
// Dropping a piece from a range has to unstamp it, or it keeps pointing at a
// range it is no longer in.
for (const product of catalog.products) delete product.collection
catalog.collections = Object.entries(curation.collections ?? {})
  .filter(([id]) => id !== '_note')
  .map(([id, spec]) => {
    const members = spec.pieces.map((slug) => bySlug.get(slug)).filter(Boolean)
    for (const piece of members) piece.collection = id
    return {
      id,
      count: members.length,
      pieces: members.map((p) => p.slug),
      // Naming a cover is optional: the first piece listed is the range's
      // lead anyway, so its cover is the honest default.
      cover: byName.get(spec.cover) ?? members[0]?.cover ?? null,
    }
  })
  // A range whose pieces have all been dropped would render as an empty page.
  .filter((c) => c.count > 0)

await emit(catalog, ROOT)

console.log(
  `media: ${meta.size} images, ${rendered} renditions written, ${catalog.hero.length} hero frames`,
)
