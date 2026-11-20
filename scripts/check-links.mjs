/**
 * Every internal link and asset in the built site, checked against the files
 * that were built. Run after `pnpm build`:
 *
 *   node scripts/check-links.mjs
 *
 * An address resolves the way Cloudflare Pages serves it: /x → x.html, then
 * x/index.html, then the file itself. Only the prerendered HTML is read, so a
 * link that exists only after the client-side app fetches piece detail is not
 * seen here.
 */
import { readdir, readFile, stat } from 'node:fs/promises'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIST = join(dirname(fileURLToPath(import.meta.url)), '../apps/web/dist')
const exists = (p) => stat(p).then((s) => s.isFile(), () => false)

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) yield* walk(p)
    else if (e.name.endsWith('.html')) yield p
  }
}

// Served by a Pages Function, not a file.
const FUNCTIONS = new Set(['/api/inquiries'])

async function resolves(url) {
  const path = decodeURIComponent(url.split(/[?#]/)[0]).replace(/\/+$/, '') || '/'
  if (FUNCTIONS.has(path)) return true
  if (path === '/') return exists(join(DIST, 'index.html'))
  return (
    (await exists(join(DIST, `${path}.html`))) ||
    (await exists(join(DIST, path, 'index.html'))) ||
    (await exists(join(DIST, path)))
  )
}

const broken = new Map()
let checked = 0
for await (const file of walk(DIST)) {
  const html = await readFile(file, 'utf8')
  const urls = new Set()
  for (const m of html.matchAll(/\b(?:href|src|content)="(\/[^"/][^"]*|\/)"/g)) urls.add(m[1])
  for (const m of html.matchAll(/\b(?:srcset|imageSrcSet)="([^"]+)"/gi))
    for (const part of m[1].split(',')) {
      const u = part.trim().split(/\s+/)[0]
      if (u.startsWith('/')) urls.add(u)
    }
  for (const u of urls) {
    checked++
    if (!(await resolves(u))) {
      const from = relative(DIST, file)
      broken.set(u, [...(broken.get(u) ?? []), from])
    }
  }
}

if (broken.size) {
  console.error(`links: ${broken.size} broken of ${checked} checked`)
  for (const [u, from] of broken) console.error(`  ✗ ${u}  ← ${from.slice(0, 3).join(', ')}${from.length > 3 ? ` +${from.length - 3}` : ''}`)
  process.exitCode = 1
} else console.log(`links: ${checked} checked, none broken`)
