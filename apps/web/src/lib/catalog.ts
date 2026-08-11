import raw from '~/data/catalog.json'

export type Img = {
  src: string
  w: number
  h: number
  widths: number[]
  lqip: string
  editorial: boolean
  /** Shot on a white sweep, with its own margin — shown whole, never cropped. */
  studio?: boolean
}

export type CollectionId =
  | 'sectionals'
  | 'sofas'
  | 'beds'
  | 'armchairs'
  | 'hallway'
  | 'nightstands'
  | 'seating'

export type Collection = {
  id: CollectionId
  ro: string
  en: string
  count: number
  /** Small cover, used on cards and in the index preview. */
  cover: Img | null
  /** Full-bleed image behind the collection page headline. */
  header: Img | null
}

export type Dimension = { w: number; d: number; h: number }

/** The workshop's dimensioned plan drawing, processed to ink on transparent. */
export type Schematic = {
  src: string
  w: number
  h: number
  cm: { width: number; depth: number; depthBack: number } | null
}

/** The same piece photographed in another textile. See data/curation.json. */
export type Variant = {
  src: string
  chip: string
  swatch: string
  tone: { ro: string; en: string }
}

export type Piece = {
  id: number
  slug: string
  name: string
  collection: CollectionId
  price: number | null
  currency: string
  lead: string
  summary: string
  body: string
  dimensions: Dimension[]
  images: Img[]
  cover: Img
  editorial: boolean
  source: string
  variants?: Variant[]
  schematic?: Schematic
}

type Catalog = {
  generatedAt: string
  collections: Collection[]
  products: Piece[]
  hero: Img[]
}

const catalog = raw as unknown as Catalog

export const collections = catalog.collections
export const pieces = catalog.products.filter((p) => p.cover)
export const heroFrames = catalog.hero

export const bySlug = (slug: string) => pieces.find((p) => p.slug === slug)

export const inCollection = (id: CollectionId) =>
  pieces.filter((p) => p.collection === id)

export const collection = (id: string) => collections.find((c) => c.id === id)

/** Editorial-grade pieces first — the ones whose photography can carry a hero. */
export const featured = pieces.filter((p) => p.cover.editorial).slice(0, 10)

export const related = (piece: Piece, count = 4) =>
  pieces
    .filter((p) => p.slug !== piece.slug && p.collection === piece.collection)
    .sort((a, b) => Number(b.cover.editorial) - Number(a.cover.editorial))
    .slice(0, count)

export const priceRange = (list: Piece[]) => {
  const prices = list.map((p) => p.price ?? 0).filter(Boolean)
  return prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : null
}

const formatters = new Map<string, Intl.NumberFormat>()

export function formatPrice(value: number | null, locale: 'ro' | 'en') {
  if (!value) return null
  const tag = locale === 'ro' ? 'ro-RO' : 'en-GB'
  if (!formatters.has(tag)) {
    formatters.set(
      tag,
      new Intl.NumberFormat(tag, {
        style: 'currency',
        currency: 'RON',
        maximumFractionDigits: 0,
      }),
    )
  }
  return formatters.get(tag)!.format(value)
}

export const srcSet = (img: Img) =>
  img.widths.map((w) => `/media/${img.src}-${w}.webp ${w}w`).join(', ')

export const srcFor = (img: Img, width = 1200) => {
  const best = img.widths.find((w) => w >= width) ?? img.widths.at(-1) ?? 700
  return `/media/${img.src}-${best}.webp`
}
