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
import { Categories } from '~/pages/Categories'
import { CategoryPage } from '~/pages/Category'
import { Pieces } from '~/pages/Pieces'
import { PiecePage } from '~/pages/Piece'
import { Story } from '~/pages/Story'
import { Showrooms } from '~/pages/Showrooms'
import { Contact } from '~/pages/Contact'
import { NotFound } from '~/pages/NotFound'
import { categories, collections, pieces } from '~/lib/catalog'

const table = [
  { path: '/', element: <Home /> },
  { path: '/colectii', element: <Collections /> },
  { path: '/colectii/:id', element: <CollectionPage /> },
  { path: '/categorii', element: <Categories /> },
  { path: '/categorii/:id', element: <CategoryPage /> },
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
  '/categorii',
  ...categories.map((c) => `/categorii/${c.id}`),
  '/piese',
  ...pieces.slice(0, 6).map((p) => `/piese/${p.slug}`),
  // Detail — prose, gallery, drawing, textiles — is fetched at runtime and so
  // is absent here; these render the page's no-detail-yet path, which is what
  // every visitor sees on the first frame.
  `/piese/${pieces[pieces.length - 1].slug}`,
  '/atelier',
  '/showroom-uri',
  '/contact?piece=Canapea%20Toro',
  '/nu-exista',
]

/** One route rendered to HTML — the harness the check below is built from. */
export function renderPath(url: string, lang: Lang = 'ro') {
  localStorage.setItem('valo:lang', lang)
  return renderToString(
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
}

export function smoke() {
  const failures: string[] = []

  for (const lang of ['ro', 'en'] as Lang[]) {
    localStorage.setItem('valo:lang', lang)
    for (const url of urls) {
      try {
        const html = renderPath(url, lang)
        if (html.length < 2000) failures.push(`${lang} ${url}: rendered only ${html.length} chars`)
      } catch (error) {
        failures.push(`${lang} ${url}: ${(error as Error).message}`)
      }
    }
  }

  return { renders: urls.length * 2, failures }
}
