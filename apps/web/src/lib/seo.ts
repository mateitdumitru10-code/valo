/**
 * What each address tells search engines and link previews: title,
 * description, canonical address, preview image and structured data.
 *
 * One function decides it for every URL, and two things read it: the
 * prerenderer (scripts/prerender.mjs), which writes it into each page's static
 * HTML, and <App/>, which keeps document.head in step as the visitor moves
 * around without a reload. They can never disagree.
 *
 * Search sees the Romanian site only. English is a reading aid the visitor
 * switches on in the browser, on the same addresses; the product prose stays
 * Romanian in it anyway, so it is not offered to search as a second site.
 */
import {
  bySlug,
  cachedPiece,
  categories,
  category,
  collection,
  collectionName,
  collections,
  inCollection,
  pieces,
  srcFor,
  type Img,
  type Piece,
  type PieceDetail,
} from './catalog'
import { horeca } from './horeca'
import { translate, type Key } from './i18n'
import { locations, mainPhoneHref } from './showrooms'

/** The production address. Canonicals, the sitemap and preview images are built on it. */
export const SITE_URL = 'https://vallo.ro'

const BRAND = 'VALLO'
const DEFAULT_IMAGE = '/media/coltar-sam-1-1200.webp'

type JsonLd = Record<string, unknown>

export type Meta = {
  title: string
  description: string
  /** Path without query or trailing slash, `/` for home. */
  path: string
  image: string
  imageAlt: string
  type: 'website' | 'product'
  /** Kept out of the index — the not-found page. */
  noindex?: boolean
  jsonLd: JsonLd[]
}

export const absolute = (path: string) => (path.startsWith('http') ? path : `${SITE_URL}${path}`)

/** The largest rendition of a photograph, which is what a preview card or a search result wants. */
const largest = (img: Img) => absolute(srcFor(img, Math.max(...img.widths)))

/**
 * A description is cut by search engines at around 155 characters, so it is
 * cut here first, at a word, rather than mid-word by them.
 */
function clip(text: string, max = 158) {
  const flat = text.replace(/\s+/g, ' ').trim()
  if (flat.length <= max) return flat
  // Whole sentences where they fit, so the snippet ends on a full stop…
  let whole = ''
  for (const sentence of flat.match(/[^.!?]+[.!?]+(\s|$)/g) ?? []) {
    const next = `${whole}${sentence}`.trim()
    if (next.length > max) break
    whole = `${next} `
  }
  if (whole.trim().length >= 70) return whole.trim()
  // …and only a sentence too long for that is cut, at a word.
  const cut = flat.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:—–-]$/, '')}…`
}

/** Romanian counts: 1 model, 2–19 modele, 20 de modele and up. */
export const count = (n: number, one: string, many: string) =>
  n === 1 ? `1 ${one}` : n % 100 >= 1 && n % 100 <= 19 ? `${n} ${many}` : `${n} de ${many}`

const ro = (key: Key) => translate(key, 'ro')

// ------------------------------------------------------------- shared nodes --

const factory = locations.find((l) => l.kind === 'factory')!

const organization: JsonLd = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: BRAND,
  url: `${SITE_URL}/`,
  telephone: mainPhoneHref,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Sat Ungureni',
    addressLocality: 'Vadu Săpat',
    addressRegion: 'Prahova',
    addressCountry: 'RO',
  },
}

const breadcrumbs = (trail: [string, string][]): JsonLd => ({
  '@type': 'BreadcrumbList',
  itemListElement: trail.map(([name, path], i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name,
    item: absolute(path),
  })),
})

const graph = (...nodes: JsonLd[]): JsonLd[] => [{ '@context': 'https://schema.org', '@graph': nodes }]

// ---------------------------------------------------------------- products --

/** Masculine and neuter nouns take `extensibil`; a canapea is feminine. */
const extending = (name: string) => (/^canapea/i.test(name) ? 'extensibilă' : 'extensibil')

const rows = (detail: PieceDetail | null) => detail?.specs?.flatMap((g) => g.rows) ?? []

/**
 * A title in the words people search with — "colțar extensibil cu ladă" — taken
 * only from what the piece's technical sheet confirms. A piece without one
 * keeps its name and says what VALLO makes.
 */
function pieceTitle(piece: Piece, detail: PieceDetail | null) {
  const sheet = rows(detail)
  const extends_ = sheet.some(
    (r) => r.label.ro === 'Extensie' || (r.label.ro === 'Configurație standard' && /^extensibil/i.test(r.value.ro)),
  )
  // Only where the standard configuration has the box: Cubic Fix offers one
  // with its optional extension, and its standard row says "fără ladă".
  const storage = sheet.some(
    (r) =>
      (r.label.ro === 'Depozitare' && !/^fără/i.test(r.value.ro)) ||
      (r.label.ro === 'Configurație standard' && /cu ladă/i.test(r.value.ro)),
  )
  if (!extends_ && !storage) return `${piece.name} — mobilier tapițat la comandă | ${BRAND}`

  const name = extends_ && !/extensibil/i.test(piece.name) ? `${piece.name} ${extending(piece.name)}` : piece.name
  return `${name}${storage ? ', cu ladă de depozitare' : ''} | ${BRAND}`
}

const price = (value: number) => `${new Intl.NumberFormat('ro-RO').format(value)} lei`

function pieceDescription(piece: Piece, detail: PieceDetail | null) {
  const figures = detail?.figures ?? []
  const size = figures.find((f) => /^(Lungime|Dimensiuni)/.test(f.ro))
  const sleep = figures.find((f) => f.ro === 'Suprafață de dormit')
  const measures = [size && `${size.ro.toLowerCase()} ${size.value}`, sleep && `suprafață de dormit ${sleep.value}`]
    .filter(Boolean)
    .join(', ')

  // Whole sentences, in order of use, for as long as they fit: a description
  // that ends mid-phrase reads as broken in a search result.
  const sentences = [
    `${piece.name}${measures ? `: ${measures}` : ''}.`,
    piece.price ? `${piece.priceFrom ? 'De la ' : ''}${price(piece.price)}, TVA inclus.` : '',
    'Produs la comandă în Prahova, în textilul ales.',
    detail?.lead ?? '',
  ].filter(Boolean)
  let text = ''
  for (const sentence of sentences) {
    const next = text ? `${text} ${sentence}` : sentence
    if (next.length > 158) continue
    text = next
  }
  return text || clip(sentences[0])
}

function productNode(piece: Piece, detail: PieceDetail | null, url: string): JsonLd {
  const images = (detail?.images?.length ? detail.images : [piece.cover]).slice(0, 6).map(largest)
  const prose = (detail?.body ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  const kind = category(piece.category)
  const frame = rows(detail).find((r) => r.label.ro === 'Structură')

  const priced = (detail?.options?.items ?? [])
    .map((i) => i.price)
    .filter((p): p is number => typeof p === 'number')
  const common = {
    priceCurrency: 'RON',
    availability: 'https://schema.org/MadeToOrder',
    itemCondition: 'https://schema.org/NewCondition',
    url,
    seller: { '@id': `${SITE_URL}/#organization` },
  }
  const offers =
    priced.length > 1 && Math.min(...priced) !== Math.max(...priced)
      ? {
          '@type': 'AggregateOffer',
          lowPrice: Math.min(...priced),
          highPrice: Math.max(...priced),
          offerCount: priced.length,
          ...common,
        }
      : piece.price
        ? { '@type': 'Offer', price: piece.price, ...common }
        : undefined

  return {
    '@type': 'Product',
    '@id': `${url}#product`,
    name: piece.name,
    url,
    sku: piece.slug,
    image: images,
    description: clip(prose.slice(1).join(' ') || detail?.lead || pieceDescription(piece, detail), 5000),
    brand: { '@type': 'Brand', name: BRAND },
    ...(kind ? { category: kind.ro } : {}),
    ...(frame ? { material: frame.value.ro } : {}),
    ...(detail?.figures?.length
      ? {
          additionalProperty: detail.figures.map((f) => ({
            '@type': 'PropertyValue',
            name: f.ro,
            value: f.value,
          })),
        }
      : {}),
    ...(offers ? { offers } : {}),
  }
}

// -------------------------------------------------------------- categories --

/** What each kind is searched as — confirmed by the category's own lede. */
const CATEGORY_TITLE: Record<string, string> = {
  sectionals: 'Colțare extensibile și fixe, la comandă',
  sofas: 'Canapele extensibile și fixe, la comandă',
  beds: 'Paturi tapițate cu ladă de depozitare',
  armchairs: 'Fotolii tapițate, fixe și extensibile',
  hallway: 'Ansambluri tapițate pentru hol și living',
  nightstands: 'Noptiere tapițate',
  seating: 'Scaune și taburete tapițate',
}

// -------------------------------------------------------------------- pages --

const page = (meta: Omit<Meta, 'image' | 'imageAlt' | 'type'> & Partial<Meta>): Meta => ({
  image: absolute(DEFAULT_IMAGE),
  imageAlt: `${BRAND} — mobilier tapițat`,
  type: 'website',
  ...meta,
})

const notFound = (path: string) =>
  page({
    title: `Pagina nu există | ${BRAND}`,
    description: ro('notFound.body'),
    path,
    noindex: true,
    jsonLd: [],
  })

/** Everything a URL tells search and link previews. `pathname` carries no query. */
export function pageMeta(pathname: string): Meta {
  const path = pathname.replace(/\/+$/, '') || '/'
  const [, section, id] = path.split('/')

  if (path === '/') {
    return page({
      title: `${BRAND} — Canapele, colțare și paturi tapițate, produse în România`,
      description:
        'VALLO distribuie mobilier tapițat produs în România de Samobi: canapele, colțare, paturi și fotolii, livrate în toată țara.',
      path,
      jsonLd: graph(organization, {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: BRAND,
        url: `${SITE_URL}/`,
        inLanguage: 'ro-RO',
        publisher: { '@id': `${SITE_URL}/#organization` },
      }),
    })
  }

  if (section === 'produse' && !id) {
    return page({
      title: `Produse — canapele, colțare, paturi și fotolii | ${BRAND}`,
      description: clip(
        `Catalogul complet VALLO: ${count(pieces.length, 'produs tapițat', 'produse tapițate')} — colțare, canapele, paturi, fotolii. Produse la comandă în Prahova, în textilul ales, cu 24 de luni garanție.`,
      ),
      path,
      jsonLd: graph(breadcrumbs([['Produse', path]])),
    })
  }

  if (section === 'produse' && id) {
    const piece = bySlug(id)
    if (!piece) return notFound(path)
    const detail = cachedPiece(id)
    const kind = category(piece.category)
    const url = absolute(path)
    return page({
      title: pieceTitle(piece, detail),
      description: pieceDescription(piece, detail),
      path,
      type: 'product',
      image: largest(piece.cover),
      imageAlt: piece.name,
      jsonLd: graph(
        organization,
        productNode(piece, detail, url),
        breadcrumbs([
          ['Produse', '/produse'],
          ...(kind ? [[kind.ro, `/categorii/${kind.id}`] as [string, string]] : []),
          [piece.name, path],
        ]),
      ),
    })
  }

  if (section === 'categorii' && !id) {
    return page({
      title: `Categorii de mobilier tapițat | ${BRAND}`,
      description: clip(
        `${categories
          .map((c, i) => (i ? c.ro.toLowerCase() : c.ro))
          .join(', ')
          .replace(/, ([^,]+)$/, ' și $1')} tapițate, la comandă. ${ro('categories.lede')}`,
      ),
      path,
      jsonLd: graph(breadcrumbs([['Categorii', path]])),
    })
  }

  if (section === 'categorii' && id) {
    const kind = category(id)
    if (!kind) return notFound(path)
    const lede = translate(`category.lede.${kind.id}` as Key, 'ro')
    return page({
      title: `${CATEGORY_TITLE[kind.id] ?? kind.ro} | ${BRAND}`,
      description: clip(`${lede} ${count(kind.count, 'model', 'modele')}, la comandă, din atelierul din Prahova.`),
      path,
      ...((kind.header ?? kind.cover) ? { image: largest((kind.header ?? kind.cover)!), imageAlt: kind.ro } : {}),
      jsonLd: graph(
        breadcrumbs([
          ['Categorii', '/categorii'],
          [kind.ro, path],
        ]),
      ),
    })
  }

  if (section === 'colectii' && !id) {
    return page({
      title: `Colecții — Aldo, Cubic, Soria și altele | ${BRAND}`,
      description: clip(ro('collections.lede')),
      path,
      jsonLd: graph(breadcrumbs([['Colecții', path]])),
    })
  }

  if (section === 'colectii' && id) {
    const range = collection(id)
    if (!range) return notFound(path)
    const name = collectionName(range.id)
    const lede = translate(`collection.lede.${range.id}` as Key, 'ro')
    const members = inCollection(range.id)
    return page({
      title: `Colecția ${name} — ${members.map((p) => p.name.split(' ')[0].toLowerCase()).filter((w, i, a) => a.indexOf(w) === i).join(', ')} | ${BRAND}`,
      description: clip(lede),
      path,
      ...(range.cover ? { image: largest(range.cover), imageAlt: `Colecția ${name}` } : {}),
      jsonLd: graph(
        breadcrumbs([
          ['Colecții', '/colectii'],
          [`Colecția ${name}`, path],
        ]),
      ),
    })
  }

  if (path === '/horeca') {
    const copy = horeca.ro
    return page({
      title: `Mobilier HoReCa la comandă: restaurante, hoteluri, terase | ${BRAND}`,
      description: clip(copy.lede),
      path,
      jsonLd: graph(breadcrumbs([['HoReCa', path]])),
    })
  }

  if (path === '/showroom-uri') {
    const cities = [...new Set(locations.filter((l) => l.kind === 'showroom').map((l) => l.city))]
    return page({
      title: `Showroom-uri în ${cities.join(', ')} | ${BRAND}`,
      description: clip(
        `Showroom-uri în ${cities.join(', ')} și fabrica din Vadu Săpat, Prahova. ${ro('showrooms.lede')}`,
      ),
      path,
      jsonLd: graph(
        {
          ...organization,
          location: locations.map((l) => ({
            '@type': 'Place',
            name: l.kind === 'factory' ? l.name : `${l.name}, ${l.city}`,
            telephone: `+4${l.phone.replace(/\s/g, '')}`,
            address: {
              '@type': 'PostalAddress',
              streetAddress: l.address,
              addressLocality: l.kind === 'factory' ? 'Vadu Săpat' : l.city,
              addressCountry: 'RO',
            },
            hasMap: l.map,
          })),
        },
        breadcrumbs([['Showroom-uri', path]]),
      ),
    })
  }

  if (path === '/contact') {
    return page({
      title: `Contact și cerere de ofertă | ${BRAND}`,
      description: clip(`${ro('contact.lede')} Telefon ${factory.phone}.`),
      path,
      jsonLd: graph(organization, breadcrumbs([['Contact', path]])),
    })
  }

  return notFound(path)
}

// ------------------------------------------------------------------ output --

const escapeAttr = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** `</script>` inside a string would end the block early; `<` is escaped so it never can. */
const serialise = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c')

type Tag =
  | { kind: 'meta'; attr: 'name' | 'property'; key: string; content: string }
  | { kind: 'link'; rel: string; href: string }

function tags(meta: Meta): Tag[] {
  const url = absolute(meta.path === '/' ? '/' : meta.path)
  const list: Tag[] = [
    { kind: 'meta', attr: 'name', key: 'description', content: meta.description },
    // A page that should not be indexed has no address to be canonical to.
    ...(meta.noindex ? [] : [{ kind: 'link', rel: 'canonical', href: url } as Tag]),
    { kind: 'meta', attr: 'property', key: 'og:site_name', content: BRAND },
    { kind: 'meta', attr: 'property', key: 'og:locale', content: 'ro_RO' },
    { kind: 'meta', attr: 'property', key: 'og:type', content: meta.type },
    { kind: 'meta', attr: 'property', key: 'og:title', content: meta.title },
    { kind: 'meta', attr: 'property', key: 'og:description', content: meta.description },
    ...(meta.noindex ? [] : [{ kind: 'meta', attr: 'property', key: 'og:url', content: url } as Tag]),
    { kind: 'meta', attr: 'property', key: 'og:image', content: meta.image },
    { kind: 'meta', attr: 'property', key: 'og:image:alt', content: meta.imageAlt },
    { kind: 'meta', attr: 'name', key: 'twitter:card', content: 'summary_large_image' },
  ]
  if (meta.noindex) list.push({ kind: 'meta', attr: 'name', key: 'robots', content: 'noindex' })
  return list
}

/** The tags as HTML, for the prerendered file. Each carries `data-seo` so the client can find and replace them. */
export function headHtml(meta: Meta) {
  const lines = [`<title>${escapeAttr(meta.title)}</title>`]
  for (const tag of tags(meta)) {
    lines.push(
      tag.kind === 'meta'
        ? `<meta ${tag.attr}="${tag.key}" content="${escapeAttr(tag.content)}" data-seo />`
        : `<link rel="${tag.rel}" href="${escapeAttr(tag.href)}" data-seo />`,
    )
  }
  for (const block of meta.jsonLd) {
    lines.push(`<script type="application/ld+json" data-seo>${serialise(block)}</script>`)
  }
  return lines.join('\n    ')
}

/** The same tags, applied to the live document after an in-app navigation. */
export function applyHead(meta: Meta) {
  document.title = meta.title
  document.head.querySelectorAll('[data-seo]').forEach((node) => node.remove())
  for (const tag of tags(meta)) {
    const node =
      tag.kind === 'meta' ? document.createElement('meta') : document.createElement('link')
    if (tag.kind === 'meta') {
      node.setAttribute(tag.attr, tag.key)
      node.setAttribute('content', tag.content)
    } else {
      node.setAttribute('rel', tag.rel)
      node.setAttribute('href', tag.href)
    }
    node.setAttribute('data-seo', '')
    document.head.appendChild(node)
  }
  for (const block of meta.jsonLd) {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(block)
    script.setAttribute('data-seo', '')
    document.head.appendChild(script)
  }
}

/** Every address the site serves, for the prerenderer and the sitemap. */
export function sitePaths() {
  return [
    '/',
    '/produse',
    ...pieces.map((p) => `/produse/${p.slug}`),
    '/categorii',
    ...categories.map((c) => `/categorii/${c.id}`),
    '/colectii',
    ...collections.map((c) => `/colectii/${c.id}`),
    '/horeca',
    '/showroom-uri',
    '/contact',
  ]
}

