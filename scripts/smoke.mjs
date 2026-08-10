/**
 * Runs apps/web's render check under jsdom.
 *   node scripts/smoke.mjs
 */
import { JSDOM } from 'jsdom'
import { createServer } from 'vite'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const WEB = join(dirname(fileURLToPath(import.meta.url)), '../apps/web')

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
})

for (const key of ['window', 'document', 'navigator', 'localStorage', 'HTMLElement', 'Image']) {
  // Node 24 defines `navigator` as a getter-only global; redefine rather than assign.
  Object.defineProperty(globalThis, key, {
    value: dom.window[key],
    configurable: true,
    writable: true,
  })
}
globalThis.window.matchMedia ??= () => ({
  matches: false,
  addEventListener() {},
  removeEventListener() {},
})

const server = await createServer({ root: WEB, server: { middlewareMode: true }, appType: 'custom' })
try {
  const { smoke } = await server.ssrLoadModule('/src/smoke.tsx')
  const { renders, failures } = smoke()
  if (failures.length) {
    console.error(`smoke: ${failures.length}/${renders} renders failed`)
    for (const f of failures) console.error(`  ✗ ${f}`)
    process.exitCode = 1
  } else {
    console.log(`smoke: ${renders} renders clean`)
  }
} finally {
  await server.close()
}
