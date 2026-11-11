/**
 * Writes every address of the site as its own HTML file, after `vite build`.
 *
 *   node scripts/prerender.mjs        (run by `pnpm build`)
 *
 * The app renders in the browser, so the file every address used to receive was
 * the same empty index.html: one title, one description, no content. Search
 * engines that do not run JavaScript, and every link preview, saw only that.
 * This renders the real <App/> for each address and writes the result with that
 * page's own title, description, canonical, preview and structured data
 * (src/lib/seo.ts), next to the hashed assets Vite built.
 *
 * Files are written as `produse/coltar-sam.html`, not `produse/coltar-sam/
 * index.html`: Cloudflare Pages serves the first at /produse/coltar-sam as is,
 * where the second would be redirected to a trailing slash.
 *
 * Also written: 404.html (served with a real 404 status for anything else),
 * sitemap.xml and robots.txt.
 */
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'
import { createServer } from 'vite'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const WEB = join(ROOT, 'apps/web')
const DIST = join(WEB, 'dist')
const PIECES = join(WEB, 'public/data/pieces')

// ---------------------------------------------------------------- browser --
// The same stand-in window the smoke check uses: the app reads localStorage
// and matchMedia while rendering.
const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
})
for (const key of ['window', 'document', 'navigator', 'localStorage', 'HTMLElement', 'Image']) {
  Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true, writable: true })
}
globalThis.window.matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {} })

// ---------------------------------------------------------------- inputs --
const template = await readFile(join(DIST, 'index.html'), 'utf8')
const manifest = JSON.parse(await readFile(join(DIST, '.vite/manifest.json'), 'utf8'))

const SEO = /<!--\s*Between the two markers[\s\S]*?-->\s*<!--seo-->[\s\S]*?<!--\/seo-->/
if (!SEO.test(template)) throw new Error('prerender: index.html lost its <!--seo--> markers')
if (!template.includes('<div id="root"></div>')) throw new Error('prerender: index.html lost <div id="root">')

/** The page component each address renders — its chunk is preloaded in that page's HTML. */
function pageSource(path) {
  if (path === '/') return 'src/pages/Home.tsx'
  if (path === '/produse') return 'src/pages/Pieces.tsx'
  if (path.startsWith('/produse/')) return 'src/pages/Piece.tsx'
  if (path === '/categorii') return 'src/pages/Categories.tsx'
  if (path.startsWith('/categorii/')) return 'src/pages/Category.tsx'
  if (path === '/colectii') return 'src/pages/Collections.tsx'
  if (path.startsWith('/colectii/')) return 'src/pages/Collection.tsx'
  if (path === '/horeca') return 'src/pages/Horeca.tsx'
  if (path === '/showroom-uri') return 'src/pages/Showrooms.tsx'
  if (path === '/contact') return 'src/pages/Contact.tsx'
  return 'src/pages/NotFound.tsx'
}

const entry = Object.values(manifest).find((chunk) => chunk.isEntry)
/** Chunks the entry already pulls in — Vite links those itself. */
const entryKey = Object.keys(manifest).find((key) => manifest[key] === entry)
const fromEntry = new Set([entryKey])
;(function walk(key) {
  for (const dep of manifest[key]?.imports ?? []) {
    if (fromEntry.has(dep)) continue
    fromEntry.add(dep)
    walk(dep)
  }
})(entryKey)

/** A page's own chunk and the shared chunks it imports, minus what the entry already loads. */
function modulePreloads(source) {
  const files = new Set()
  ;(function walk(key) {
    const chunk = manifest[key]
    if (!chunk || fromEntry.has(key) || files.has(chunk.file)) return
    files.add(chunk.file)
    for (const dep of chunk.imports ?? []) walk(dep)
  })(source)
  return [...files].map((file) => `<link rel="modulepreload" crossorigin href="/${file}" />`)
}

/**
 * The text faces. Romanian needs the latin-ext subset for ă, â, î, ș and ț,
 * which appear in the navigation on every page, so both subsets of both
 * families are fetched from the first byte rather than after the stylesheet.
 */
const fontFiles = Object.values(manifest)
  .flatMap((chunk) => chunk.assets ?? [])
  .concat(Object.values(manifest).map((chunk) => chunk.file))
  .filter((file, i, all) => all.indexOf(file) === i)
  .filter((file) => /(bodoni-moda|inter-tight)-latin(-ext)?-wght-normal-[\w-]+\.woff2$/.test(file))
if (fontFiles.length !== 4) {
  console.warn(`prerender: expected 4 text-face files to preload, found ${fontFiles.length}`)
}
const fontPreloads = fontFiles.map(
  (file) => `<link rel="preload" as="font" type="font/woff2" crossorigin href="/${file}" />`,
)

const escapeJson = (data) => JSON.stringify(data).replace(/</g, '\\u003c')

// ---------------------------------------------------------------- render --
const server = await createServer({
  root: WEB,
  logLevel: 'error',
  server: { middlewareMode: true },
  appType: 'custom',
})

let written = 0
const problems = []
const titles = new Map()

try {
  // One module graph: catalog primed here is the catalog the render reads.
  const app = {
    ...(await server.ssrLoadModule('/src/lib/seo.ts')),
    ...(await server.ssrLoadModule('/src/lib/catalog.ts')),
    ...(await server.ssrLoadModule('/src/prerender.tsx')),
  }
  const paths = app.sitePaths()

  async function write(path, file, { detail } = {}) {
    const body = await app.render(path)
    const meta = app.pageMeta(path)

    if (!meta.noindex) {
      if (titles.has(meta.title)) problems.push(`${path}: same title as ${titles.get(meta.title)}`)
      titles.set(meta.title, path)
      if (!/<h1[\s>]/.test(body)) problems.push(`${path}: no <h1>`)
      if (meta.description.length < 50) problems.push(`${path}: description only ${meta.description.length} chars`)
    }

    const head = [
      app.headHtml(meta),
      ...fontPreloads,
      ...modulePreloads(pageSource(path)),
    ].join('\n    ')

    let html = template
      .replace(SEO, head)
      .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
    if (detail) {
      // The piece's detail, inline: the first client render draws the same page
      // instead of fetching it again. See main.tsx.
      html = html.replace(
        '</body>',
        `  <script type="application/json" id="piece-data">${escapeJson(detail)}</script>\n  </body>`,
      )
    }

    const out = join(DIST, file)
    await mkdir(dirname(out), { recursive: true })
    await writeFile(out, html)
    written++
  }

  for (const path of paths) {
    const slug = path.match(/^\/produse\/([^/]+)$/)?.[1]
    let detail
    if (slug) {
      const source = join(PIECES, `${slug}.json`)
      if (!existsSync(source)) {
        problems.push(`${path}: no detail file`)
      } else {
        detail = JSON.parse(await readFile(source, 'utf8'))
        app.primePiece(detail)
      }
    }
    await write(path, path === '/' ? 'index.html' : `${path.slice(1)}.html`, { detail })
  }

  // Anything the site does not serve. Cloudflare Pages and Netlify both answer
  // an unknown address with this file and a 404 status.
  await write('/404', '404.html')

  // ------------------------------------------------------------ sitemap --
  const site = app.SITE_URL
  const xml = (s) =>
    String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const urls = paths.map((path) => {
    const loc = path === '/' ? `${site}/` : `${site}${path}`
    const piece = path.startsWith('/produse/') ? app.bySlug(path.split('/')[2]) : null
    const image = piece
      ? `\n    <image:image><image:loc>${xml(app.absolute(app.srcFor(piece.cover, Math.max(...piece.cover.widths))))}</image:loc></image:image>`
      : ''
    return `  <url>\n    <loc>${xml(loc)}</loc>${image}\n  </url>`
  })
  await writeFile(
    join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
      `${urls.join('\n')}\n</urlset>\n`,
  )

  await writeFile(
    join(DIST, 'robots.txt'),
    [
      'User-agent: *',
      // The quote form posts here; nothing to index.
      'Disallow: /api/',
      // Netlify Forms' detection stub, not a page.
      'Disallow: /__forms.html',
      '',
      `Sitemap: ${site}/sitemap.xml`,
      '',
    ].join('\n'),
  )

  // The manifest is a build artefact for this script, not something to serve.
  await rm(join(DIST, '.vite'), { recursive: true, force: true })
} finally {
  await server.close()
}

if (problems.length) {
  console.error(`prerender: ${problems.length} problem(s)`)
  for (const p of problems) console.error(`  ✗ ${p}`)
  process.exitCode = 1
}
console.log(`prerender: ${written} pages, sitemap and robots.txt written`)
