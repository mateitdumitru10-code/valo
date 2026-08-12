/**
 * Derive a fabric swatch colour for each catalogue image.
 *
 *   node scripts/swatches.mjs            # write swatches into the catalogue
 *   node scripts/swatches.mjs <slug>     # print one product's swatches, no write
 *
 * Sharp's `dominant` returns the wall, not the sofa. This samples the middle
 * band of the frame — where the piece actually sits — drops near-white and
 * near-black pixels as background, and picks the most saturated colour cluster
 * that still covers a meaningful share of it.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { emit } from './emit.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'media-src')
const CATALOG = join(ROOT, 'data/catalog.json')
const only = process.argv[2]

const BUCKET = 26

function toHsl(r, g, b) {
  const [rr, gg, bb] = [r / 255, g / 255, b / 255]
  const max = Math.max(rr, gg, bb)
  const min = Math.min(rr, gg, bb)
  const l = (max + min) / 2
  const d = max - min
  if (!d) return { h: 0, s: 0, l }
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h
  if (max === rr) h = ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6
  else if (max === gg) h = ((bb - rr) / d + 2) / 6
  else h = ((rr - gg) / d + 4) / 6
  return { h: h * 360, s, l }
}

const hex = (r, g, b) =>
  `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`

export async function swatchOf(file) {
  const image = sharp(join(SRC, file))
  const { width = 0, height = 0 } = await image.metadata()
  if (!width || !height) return null

  // The middle band: furniture sits there in every shoot in this library.
  const region = {
    left: Math.round(width * 0.18),
    top: Math.round(height * 0.35),
    width: Math.round(width * 0.64),
    height: Math.round(height * 0.45),
  }

  const { data, info } = await image
    .extract(region)
    .resize(64, 64, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const buckets = new Map()
  for (let i = 0; i < data.length; i += info.channels) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]]
    const { s, l } = toHsl(r, g, b)
    if (l > 0.93 || l < 0.06) continue // blown-out wall, or shadow
    const key = [r, g, b].map((v) => Math.round(v / BUCKET)).join(',')
    const hit = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0, s: 0 }
    hit.r += r
    hit.g += g
    hit.b += b
    hit.s += s
    hit.n++
    buckets.set(key, hit)
  }
  if (!buckets.size) return null

  const total = [...buckets.values()].reduce((sum, h) => sum + h.n, 0)
  const best = [...buckets.values()]
    .map((h) => {
      const share = h.n / total
      const saturation = h.s / h.n
      // Coverage matters, but a saturated cluster beats a slightly larger grey.
      return { h, score: share * (0.25 + saturation * 1.9) }
    })
    .sort((a, b) => b.score - a.score)[0].h

  return hex(best.r / best.n, best.g / best.n, best.b / best.n)
}

/** A plain tone name, derived from the colour itself — not a Samobi swatch code. */
export function toneOf(value) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16))
  const { h, s, l } = toHsl(r, g, b)

  if (s < 0.12) {
    if (l > 0.78) return { ro: 'Crem', en: 'Cream' }
    if (l > 0.55) return { ro: 'Gri deschis', en: 'Light grey' }
    if (l > 0.3) return { ro: 'Gri', en: 'Grey' }
    return { ro: 'Grafit', en: 'Graphite' }
  }
  if (h < 18 || h >= 345) return l < 0.4 ? { ro: 'Bordo', en: 'Burgundy' } : { ro: 'Roșu', en: 'Red' }
  if (h < 45) return l < 0.45 ? { ro: 'Cognac', en: 'Cognac' } : { ro: 'Nisip', en: 'Sand' }
  if (h < 70) return { ro: 'Muștar', en: 'Mustard' }
  if (h < 160) return l < 0.4 ? { ro: 'Verde pădure', en: 'Forest green' } : { ro: 'Verde salvie', en: 'Sage' }
  if (h < 200) return { ro: 'Petrol', en: 'Teal' }
  if (h < 255) return l < 0.4 ? { ro: 'Bleumarin', en: 'Navy' } : { ro: 'Albastru', en: 'Blue' }
  if (h < 290) return { ro: 'Prună', en: 'Plum' }
  return { ro: 'Roz', en: 'Rose' }
}

const source = async (name) => {
  for (const ext of ['webp', 'jpeg', 'jpg', 'png']) {
    try {
      await readFile(join(SRC, `${name}.${ext}`))
      return `${name}.${ext}`
    } catch {}
  }
  return null
}

const catalog = JSON.parse(await readFile(CATALOG, 'utf8'))
const curation = JSON.parse(await readFile(join(ROOT, 'data/curation.json'), 'utf8'))
const variants = curation.variants ?? {}

if (only) {
  const product = catalog.products.find((p) => p.slug === only)
  console.log(product.name)
  for (const img of product.images) {
    const file = await source(img.src)
    if (!file) continue
    const swatch = await swatchOf(file)
    console.log(`  ${swatch}  ${toneOf(swatch).ro}  ${img.src}`)
  }
} else {
  let count = 0
  for (const product of catalog.products) {
    const list = variants[product.slug]
    if (!Array.isArray(list)) {
      // Removing a slug from the manifest must remove the picker too.
      delete product.variants
      continue
    }

    product.variants = []
    for (const entry of list) {
      // An entry may name its own colour; otherwise the tone is derived.
      const name = typeof entry === 'string' ? entry : entry.src
      const file = await source(name)
      if (!file) continue
      const swatch = await swatchOf(file)
      product.variants.push({
        src: name,
        // The swatch is the piece itself in that colour — a crop of cloth says
        // less here than seeing the whole thing upholstered.
        chip: `/media/${name}-700.webp`,
        swatch,
        tone:
          typeof entry === 'string'
            ? toneOf(swatch)
            : { ro: entry.ro, en: entry.en },
      })
      count++
    }
  }

  await emit(catalog, ROOT)
  console.log(`swatches: ${count} colour variants across ${Object.keys(variants).length - 1} product(s)`)
}
