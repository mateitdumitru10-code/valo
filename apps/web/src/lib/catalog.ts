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

/** A kind of piece. What the catalogue is sorted into. */
export type CategoryId =
  | 'sectionals'
  | 'sofas'
  | 'beds'
  | 'armchairs'
  | 'hallway'
  | 'nightstands'
  | 'seating'

export type Category = {
  id: CategoryId
  ro: string
  en: string
  count: number
  /** Small cover, used on cards and in the index preview. */
  cover: Img | null
  /** Full-bleed image behind the category page headline. */
  header: Img | null
}

/**
 * A named range — one design carried across several kinds of piece. Aldo is a
 * corner, a sofa, a module and a bed; a category holds one of each from
 * everywhere. Membership is listed in data/curation.json, so a piece belongs to
 * a range because it was put there, not because its name happens to match.
 */
export type CollectionId =
  | 'aldo'
  | 'cubic'
  | 'soria'
  | 'torro'
  | 'linear'
  | 'bella'
  | 'ela'
  | 'vallo'

export type Collection = {
  id: CollectionId
  count: number
  /** Slugs, in the order the range should read — its largest piece first. */
  pieces: string[]
  cover: Img | null
}

export type Dimension = { w: number; d: number; h: number }

/** A mattress size, [width, length] in centimetres. */
export type Size = [number, number]

/** The workshop's dimensioned plan drawing, processed to ink on transparent. */
export type Schematic = {
  src: string
  w: number
  h: number
  cm: {
    width?: number
    /** Deepest point — over the chaise, where there is one. */
    depth?: number
    /** Depth of the sofa body, quoted only when a chaise makes them differ. */
    depthBack?: number
    seat?: number
  } | null
}

/** The same piece photographed in another textile. See data/curation.json. */
export type Variant = {
  src: string
  chip: string
  swatch: string
  tone: { ro: string; en: string }
}

/**
 * A frame of the piece beyond the colour shots — the angle, the side, the sofa
 * opened out, the storage box lifted. `in` is the colour it was photographed
 * in, so the caption can say so when another colour is selected.
 */
export type View = {
  src: string
  ro: string
  en: string
  in?: string
}

/**
 * What every card and listing needs, and nothing else. This is bundled, so it
 * is the part the browser parses before it can draw.
 */
export type Piece = {
  id: number
  slug: string
  name: string
  category: CategoryId
  /** The range it belongs to, where it belongs to one. Most pieces do not. */
  collection?: CollectionId
  price: number | null
  currency: string
  cover: Img
  editorial: boolean
}

/** The rest of a piece: fetched when that piece is opened. See scripts/emit.mjs. */
export type PieceDetail = {
  slug: string
  lead: string
  summary: string
  body: string
  dimensions: Dimension[]
  images: Img[]
  source: string
  variants?: Variant[]
  views?: View[]
  /** Mattress sizes this piece is offered in. Beds only, today. */
  sizes?: Size[]
  schematic?: Schematic
}

type Catalog = {
  generatedAt: string
  categories: Category[]
  collections: Collection[]
  products: Piece[]
  hero: Img[]
}

const details = new Map<string, Promise<PieceDetail | null>>()

/** Loads a piece's detail once and remembers it for the rest of the session. */
export function loadPiece(slug: string) {
  const cached = details.get(slug)
  if (cached) return cached

  const request = fetch(`/data/pieces/${slug}.json`)
    .then((res) => (res.ok ? (res.json() as Promise<PieceDetail>) : null))
    .catch(() => null)
  details.set(slug, request)
  return request
}

const catalog = raw as unknown as Catalog

export const categories = catalog.categories
export const collections = catalog.collections

/** Aldo, Cubic — the ranges read as a name, not as a translated noun. */
export const collectionName = (id: string) => id.charAt(0).toUpperCase() + id.slice(1)

/**
 * Own studio photography leads everywhere a list of pieces appears — grids,
 * collections, the featured rail, related. Those frames share one scale and one
 * white field, so putting them first makes a listing open on a coherent block
 * rather than on whatever the scrape happened to return first.
 */
export const pieces = catalog.products
  .filter((p) => p.cover)
  .sort((a, b) => Number(b.cover.studio ?? false) - Number(a.cover.studio ?? false))
export const heroFrames = catalog.hero

export const bySlug = (slug: string) => pieces.find((p) => p.slug === slug)

export const inCategory = (id: CategoryId) => pieces.filter((p) => p.category === id)

export const category = (id?: string) => categories.find((c) => c.id === id)

export const collection = (id?: string) => collections.find((c) => c.id === id)

/**
 * A range's pieces in the order the manifest lists them, rather than in the
 * catalogue's own order — a range is meant to be read largest piece first.
 */
export const inCollection = (id: CollectionId) => {
  const range = collection(id)
  if (!range) return []
  return range.pieces.map((slug) => bySlug(slug)).filter((p): p is Piece => Boolean(p))
}

/** Editorial-grade pieces first — the ones whose photography can carry a hero. */
export const featured = pieces.filter((p) => p.cover.editorial).slice(0, 10)

/**
 * The rest of the range, where the piece is in one — those are siblings in a
 * way that two unrelated sofas are not. Pieces outside a range fall back to
 * their category, which is the only kinship they have.
 */
export const related = (piece: Piece, count = 4) => {
  const family = piece.collection
    ? inCollection(piece.collection).filter((p) => p.slug !== piece.slug)
    : []
  if (family.length) return family.slice(0, count)

  return pieces
    .filter((p) => p.slug !== piece.slug && p.category === piece.category)
    .sort((a, b) => Number(b.cover.editorial) - Number(a.cover.editorial))
    .slice(0, count)
}

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
  // `widths` is stored largest-first, so a plain `find` returned the biggest
  // rendition for every request — a 430px panel was being served the 1200px
  // file, and an 80px thumbnail the same.
  const ascending = [...img.widths].sort((a, b) => a - b)
  const best = ascending.find((w) => w >= width) ?? ascending.at(-1) ?? 700
  return `/media/${img.src}-${best}.webp`
}
