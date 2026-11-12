/**
 * The site's pages, by route. Kept apart from <App/> so that file exports only
 * components, which is what lets the dev server hot-swap it.
 */
import { matchPath } from 'react-router-dom'
import { lazyPage } from '~/lib/lazyPage'

// Every page arrives on demand, the landing page included: a visitor who opens
// a product never downloads the home page's film and rails. The page being
// opened is fetched before the first render (see `preloadFor`) and its chunk is
// <link rel=modulepreload>ed by the prerendered HTML, so nothing waits on it.
const Home = lazyPage(() => import('~/pages/Home').then((m) => m.Home))
const Collections = lazyPage(() => import('~/pages/Collections').then((m) => m.Collections))
const CollectionPage = lazyPage(() => import('~/pages/Collection').then((m) => m.CollectionPage))
const Categories = lazyPage(() => import('~/pages/Categories').then((m) => m.Categories))
const CategoryPage = lazyPage(() => import('~/pages/Category').then((m) => m.CategoryPage))
const Pieces = lazyPage(() => import('~/pages/Pieces').then((m) => m.Pieces))
const PiecePage = lazyPage(() => import('~/pages/Piece').then((m) => m.PiecePage))
const Mattresses = lazyPage(() => import('~/pages/Mattresses').then((m) => m.Mattresses))
const Horeca = lazyPage(() => import('~/pages/Horeca').then((m) => m.Horeca))
const Showrooms = lazyPage(() => import('~/pages/Showrooms').then((m) => m.Showrooms))
const Contact = lazyPage(() => import('~/pages/Contact').then((m) => m.Contact))
export const NotFound = lazyPage(() => import('~/pages/NotFound').then((m) => m.NotFound))

/** The pages, by route — read by <App/> and by `preloadFor`. */
export const PAGES = [
  ['/', Home],
  ['/colectii', Collections],
  ['/colectii/:id', CollectionPage],
  ['/categorii', Categories],
  ['/categorii/:id', CategoryPage],
  ['/produse', Pieces],
  ['/produse/:slug', PiecePage],
  ['/saltele', Mattresses],
  ['/horeca', Horeca],
  ['/showroom-uri', Showrooms],
  ['/contact', Contact],
] as const

/** Fetches the page an address opens on, so the first render does not suspend. */
export function preloadFor(pathname: string) {
  const hit = PAGES.find(([pattern]) => matchPath(pattern, pathname))
  return (hit ? hit[1] : NotFound).preload()
}
