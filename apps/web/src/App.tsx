import { Suspense, useEffect } from 'react'
import { matchPath, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Nav } from '~/components/Nav'
import { Footer } from '~/components/Footer'
import { Preloader } from '~/components/Preloader'
import { NotFound, PAGES } from '~/routes'
import { applyHead, pageMeta } from '~/lib/seo'
import { cachedPiece, loadPiece } from '~/lib/catalog'
import { scrollToTop } from '~/lib/scroll'
import { markHydrated } from '~/components/Img'
import { expo } from '~/lib/motion'

/**
 * Keeps the title, description, canonical and structured data in step with
 * the address as the visitor moves around in-app. A direct visit already has
 * them in the prerendered HTML; this replaces them with the same.
 */
function Head() {
  const { pathname } = useLocation()
  useEffect(() => {
    let live = true
    applyHead(pageMeta(pathname))
    // A product's title and data use its technical sheet, which may still be
    // on its way — apply again once it lands.
    const slug = matchPath('/produse/:slug', pathname)?.params.slug
    if (slug && !cachedPiece(slug)) {
      loadPiece(slug).then(() => {
        if (live) applyHead(pageMeta(pathname))
      })
    }
    return () => {
      live = false
    }
  }, [pathname])
  return null
}

function OldPieceRedirect() {
  const { slug } = useParams()
  return <Navigate to={`/produse/${slug ?? ''}`} replace />
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    scrollToTop()
  }, [pathname])
  return null
}

export default function App() {
  // After the first commit — the hydration of the prerendered page — images
  // that mount from here on fade in (components/Img.tsx).
  useEffect(markHydrated, [])
  const location = useLocation()

  return (
    <>
      <Preloader />
      <Head />
      <Nav />
      <ScrollToTop />

      {/* initial={false}: the first page is the prerendered one, already on
          screen. Fading it in from opacity 0 hid every page's content until
          the JavaScript had loaded. Only later route changes cross-fade. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: expo }}
        >
          <Suspense fallback={<div className="min-h-[70svh]" />}>
          <Routes location={location}>
            {PAGES.map(([path, Page]) => (
              <Route key={path} path={path} element={<Page />} />
            ))}
            {/* The listing used to live at /piese; old links and bookmarks still arrive there. */}
            <Route path="/piese" element={<Navigate to="/produse" replace />} />
            <Route path="/piese/:slug" element={<OldPieceRedirect />} />
            <Route path="/atelier" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </motion.main>
      </AnimatePresence>

      <Footer />
    </>
  )
}
