/**
 * Headless render check. Renders every page component to a string so a crash on
 * mount — a bad import, a missing slug, a component that touches the DOM during
 * render — fails loudly here instead of in someone's browser.
 *
 * Pages are imported eagerly rather than driven through <App/>, whose routes are
 * lazy: a router walk would only ever render the Suspense fallback.
 *
 *   pnpm smoke
 */
import { renderToString } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { I18nProvider, type Lang } from '~/lib/i18n'
import { Nav } from '~/components/Nav'
import { Footer } from '~/components/Footer'
import { Home } from '~/pages/Home'
import { Collections } from '~/pages/Collections'
import { CollectionPage } from '~/pages/Collection'
import { Pieces } from '~/pages/Pieces'
import { PiecePage } from '~/pages/Piece'
import { Story } from '~/pages/Story'
import { Showrooms } from '~/pages/Showrooms'
import { Contact } from '~/pages/Contact'
import { NotFound } from '~/pages/NotFound'
import { collections, pieces } from '~/lib/catalog'

const table = [
  { path: '/', element: <Home /> },
  { path: '/colectii', element: <Collections /> },
  { path: '/colectii/:id', element: <CollectionPage /> },
  { path: '/piese', element: <Pieces /> },
  { path: '/piese/:slug', element: <PiecePage /> },
  { path: '/atelier', element: <Story /> },
  { path: '/showroom-uri', element: <Showrooms /> },
  { path: '/contact', element: <Contact /> },
  { path: '*', element: <NotFound /> },
]

const urls = [
  '/',
  '/colectii',
  ...collections.map((c) => `/colectii/${c.id}`),
  '/piese',
  ...pieces.slice(0, 6).map((p) => `/piese/${p.slug}`),
  // Textile variants and plan drawings each take a different path through the page.
  ...pieces.filter((p) => p.variants?.length).map((p) => `/piese/${p.slug}`),
  ...pieces.filter((p) => p.schematic).map((p) => `/piese/${p.slug}`),
  `/piese/${pieces[pieces.length - 1].slug}`,
  '/atelier',
  '/showroom-uri',
  '/contact?piece=Canapea%20Toro',
  '/nu-exista',
]

export function smoke() {
  const failures: string[] = []

  for (const lang of ['ro', 'en'] as Lang[]) {
    localStorage.setItem('valo:lang', lang)
    for (const url of urls) {
      try {
        const html = renderToString(
          <MemoryRouter initialEntries={[url]}>
            <I18nProvider>
              <Nav />
              <main>
                <Routes>
                  {table.map((route) => (
                    <Route key={route.path} path={route.path} element={route.element} />
                  ))}
                </Routes>
              </main>
              <Footer />
            </I18nProvider>
          </MemoryRouter>,
        )
        if (html.length < 2000) failures.push(`${lang} ${url}: rendered only ${html.length} chars`)
      } catch (error) {
        failures.push(`${lang} ${url}: ${(error as Error).message}`)
      }
    }
  }

  return { renders: urls.length * 2, failures }
}
