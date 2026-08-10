/**
 * Ingest the Samobi (mobilasamobi.ro) WooCommerce catalogue and normalise it
 * into the Valo catalogue format.
 *
 *   node scripts/ingest.mjs            # fetch + download images
 *   node scripts/ingest.mjs --no-media # metadata only
 *
 * Output:
 *   data/catalog.json      normalised catalogue (image fields are bare filenames)
 *   media-src/<file>.webp  original imagery; run scripts/media.mjs to optimise
 */
import { mkdir, writeFile, readFile, access } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = 'https://mobilasamobi.ro/wp-json/wc/store/v1/products?per_page=100'
const MEDIA_DIR = join(ROOT, 'media-src')
const OUT = join(ROOT, 'data/catalog.json')
const WITH_MEDIA = !process.argv.includes('--no-media')
const MAX_IMAGES = 5

/** Samobi category -> Valo collection. Ordered by specificity. */
const COLLECTIONS = [
  { id: 'sectionals', match: 'Colțare', ro: 'Colțare', en: 'Sectionals' },
  { id: 'sofas', match: 'Canapele', ro: 'Canapele', en: 'Sofas' },
  { id: 'beds', match: 'Paturi', ro: 'Paturi', en: 'Beds' },
  { id: 'armchairs', match: 'Fotolii', ro: 'Fotolii', en: 'Armchairs' },
  { id: 'hallway', match: 'Holuri', ro: 'Holuri', en: 'Hallway' },
  { id: 'nightstands', match: 'Noptiere', ro: 'Noptiere', en: 'Nightstands' },
  { id: 'seating', match: 'Scaune', ro: 'Scaune', en: 'Seating' },
]

const ENTITIES = {
  '&#8211;': '–', '&#8212;': '—', '&#8217;': '’', '&#8216;': '‘',
  '&#8220;': '“', '&#8221;': '”', '&amp;': '&', '&nbsp;': ' ',
  '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#039;': "'", '&hellip;': '…',
}

const decode = (s = '') =>
  s.replace(/&#\d+;|&[a-z]+;/gi, (m) => ENTITIES[m] ?? m).trim()

const stripTags = (html = '') =>
  decode(
    html
      .replace(/<li[^>]*>/gi, '\n• ')
      .replace(/<\/(p|div|li|ul|h[1-6])>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ''),
  )
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

const slugify = (s) =>
  decode(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** Pull "2400 x 1900 x 850 mm" style measurements out of the RO copy. */
function parseDimensions(text) {
  const found = []
  const re = /(\d{3,4})\s*[x×]\s*(\d{3,4})\s*[x×]\s*(\d{3,4})\s*mm/gi
  let m
  while ((m = re.exec(text))) {
    const [w, d, h] = [m[1], m[2], m[3]].map(Number)
    const key = `${w}x${d}x${h}`
    if (!found.some((f) => f.key === key)) found.push({ key, w, d, h })
  }
  return found.map(({ w, d, h }) => ({ w, d, h }))
}

/** First sentence of the RO copy, used as the editorial lead-in. */
function lead(text) {
  const first = text.split('\n').find((l) => l.trim().length > 60) ?? ''
  const sentence = first.split(/(?<=[.!?])\s/)[0] ?? first
  return sentence.trim()
}

async function exists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

async function download(url, dest) {
  if (await exists(dest)) return true
  const res = await fetch(url, { headers: { 'user-agent': 'valo-ingest' } })
  if (!res.ok) return false
  await writeFile(dest, Buffer.from(await res.arrayBuffer()))
  return true
}

async function source() {
  const cache = join(ROOT, 'data/.source.json')
  if (await exists(cache)) return JSON.parse(await readFile(cache, 'utf8'))
  const res = await fetch(SOURCE, { headers: { 'user-agent': 'valo-ingest' } })
  if (!res.ok) throw new Error(`source responded ${res.status}`)
  const json = await res.json()
  await writeFile(cache, JSON.stringify(json))
  return json
}

const raw = await source()
await mkdir(MEDIA_DIR, { recursive: true })
await mkdir(dirname(OUT), { recursive: true })

const products = []
let downloaded = 0

for (const p of raw) {
  const names = (p.categories ?? []).map((c) => decode(c.name))
  const collection = COLLECTIONS.find((c) => names.includes(c.match))
  if (!collection) continue

  const name = decode(p.name)
  const slug = slugify(p.slug || name)
  const body = stripTags(p.description || '')
  const summary = stripTags(p.short_description || '') || body
  const price = Number(p.prices?.price ?? 0) || null

  const images = []
  for (const [i, img] of (p.images ?? []).slice(0, MAX_IMAGES).entries()) {
    const ext = (img.src.match(/\.(webp|jpe?g|png)(?:\?|$)/i)?.[1] ?? 'webp').toLowerCase()
    const file = `${slug}-${i + 1}.${ext}`
    if (WITH_MEDIA) {
      const ok = await download(img.src, join(MEDIA_DIR, file))
      if (!ok) continue
      downloaded++
    }
    images.push(file)
  }
  if (!images.length) continue

  products.push({
    id: p.id,
    slug,
    name,
    collection: collection.id,
    collections: names,
    price,
    currency: 'RON',
    lead: lead(summary),
    summary,
    body,
    dimensions: parseDimensions(`${summary}\n${body}`),
    images,
    source: p.permalink,
  })
}

// Stable, editorially useful order: hero-worthy pieces (rich galleries) first.
products.sort(
  (a, b) => b.images.length - a.images.length || (b.price ?? 0) - (a.price ?? 0),
)

const catalog = {
  generatedAt: new Date().toISOString(),
  source: 'mobilasamobi.ro',
  collections: COLLECTIONS.map(({ id, ro, en }) => ({
    id,
    ro,
    en,
    count: products.filter((p) => p.collection === id).length,
  })),
  products,
}

await writeFile(OUT, JSON.stringify(catalog, null, 2))
console.log(
  `catalog: ${products.length} products, ${catalog.collections.length} collections, ${downloaded} images downloaded`,
)
for (const c of catalog.collections) console.log(`  ${c.id.padEnd(12)} ${c.count}`)
