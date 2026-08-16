import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Nav } from '~/components/Nav'
import { Footer } from '~/components/Footer'
import { Preloader } from '~/components/Preloader'
import { Home } from '~/pages/Home'

// The landing page ships in the main bundle; everything else arrives on demand.
const Collections = lazy(() => import('~/pages/Collections').then((m) => ({ default: m.Collections })))
const CollectionPage = lazy(() => import('~/pages/Collection').then((m) => ({ default: m.CollectionPage })))
const Categories = lazy(() => import('~/pages/Categories').then((m) => ({ default: m.Categories })))
const CategoryPage = lazy(() => import('~/pages/Category').then((m) => ({ default: m.CategoryPage })))
const Pieces = lazy(() => import('~/pages/Pieces').then((m) => ({ default: m.Pieces })))
const PiecePage = lazy(() => import('~/pages/Piece').then((m) => ({ default: m.PiecePage })))
const Story = lazy(() => import('~/pages/Story').then((m) => ({ default: m.Story })))
const Showrooms = lazy(() => import('~/pages/Showrooms').then((m) => ({ default: m.Showrooms })))
const Contact = lazy(() => import('~/pages/Contact').then((m) => ({ default: m.Contact })))
const NotFound = lazy(() => import('~/pages/NotFound').then((m) => ({ default: m.NotFound })))
import { useSmoothScroll, scrollToTop } from '~/hooks/useLenis'
import { expo } from '~/lib/motion'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    scrollToTop()
  }, [pathname])
  return null
}

export default function App() {
  useSmoothScroll()
  const location = useLocation()

  return (
    <>
      <Preloader />
      <Nav />
      <ScrollToTop />

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: expo }}
        >
          <Suspense fallback={<div className="min-h-[70svh]" />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/colectii" element={<Collections />} />
            <Route path="/colectii/:id" element={<CollectionPage />} />
            <Route path="/categorii" element={<Categories />} />
            <Route path="/categorii/:id" element={<CategoryPage />} />
            <Route path="/piese" element={<Pieces />} />
            <Route path="/piese/:slug" element={<PiecePage />} />
            <Route path="/atelier" element={<Story />} />
            <Route path="/showroom-uri" element={<Showrooms />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </motion.main>
      </AnimatePresence>

      <Footer />
    </>
  )
}
