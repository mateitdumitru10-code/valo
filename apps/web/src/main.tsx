import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '~/styles/fonts.css'
import '~/styles/global.css'
import App from '~/App'
import { preloadFor } from '~/routes'
import { primePiece, type PieceDetail } from '~/lib/catalog'
import { I18nProvider } from '~/lib/i18n'

// A prerendered product page carries its detail inline, so the first render
// draws the whole page the HTML showed rather than fetching it again.
const inline = document.getElementById('piece-data')
if (inline?.textContent) {
  try {
    primePiece(JSON.parse(inline.textContent) as PieceDetail)
  } catch {
    // A malformed block only costs the fetch it was there to save.
  }
}

/**
 * After a failed hydration React draws the page afresh, and every entrance in
 * view would play a second time over content the visitor has already watched
 * arrive. Those already on screen are marked done instead.
 */
function settleVisibleEntrances() {
  const h = window.innerHeight
  for (const el of document.querySelectorAll<HTMLElement>('[data-rv]')) {
    const r = el.getBoundingClientRect()
    if (r.bottom > 0 && r.top < h) el.classList.add('rv-in', 'rv-done')
  }
}

// The prerendered HTML is hydrated, not replaced: its entrances are CSS
// (components/Reveal.tsx) and have already played, and replacing the DOM would
// play them again. Where the browser's first render differs from the HTML — an
// English reader, reduced motion, a wide screen on the home page — React
// recovers by rendering that page itself, as it used to every time. Fetching
// the page's chunk first means the first render draws the page, not a fallback.
preloadFor(window.location.pathname)
  .catch(() => undefined)
  .then(() => {
    hydrateRoot(
      document.getElementById('root')!,
      <StrictMode>
        <BrowserRouter>
          <I18nProvider>
            <App />
          </I18nProvider>
        </BrowserRouter>
      </StrictMode>,
      {
        onRecoverableError: () => settleVisibleEntrances(),
      },
    )
  })
