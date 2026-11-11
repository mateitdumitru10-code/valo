import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/bodoni-moda'
import '@fontsource-variable/inter-tight'
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

// The prerendered HTML is replaced, not hydrated: the visitor's language and
// the animations' starting states are decided in the browser, and a hydration
// mismatch would cost more than the render. Fetching the page's chunk first
// means that render draws the page, not a blank fallback.
preloadFor(window.location.pathname)
  .catch(() => undefined)
  .then(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <BrowserRouter>
          <I18nProvider>
            <App />
          </I18nProvider>
        </BrowserRouter>
      </StrictMode>,
    )
  })
