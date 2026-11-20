import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { expo, quint } from '~/lib/motion'
import { stopScroll } from '~/lib/scroll'

/** Floor on how long the curtain is held. Anything more is self-inflicted. */
const MIN_MS = 280
/**
 * Ceiling on the wait for the opening clip. Past this, a slow connection gets
 * the page and the clip catches up. It was 1.8s; on a phone that was most of
 * the time anyone spent looking at the home page before seeing it.
 */
const CLIP_MS = 800
/** Set once the curtain has been seen; read by the inline script in index.html. */
const SEEN_KEY = 'valo:curtain'

/** Resolves once the hero's own <video> can play, or never if there is none. */
function clipReady() {
  return new Promise<void>((resolve) => {
    const el = document.querySelector<HTMLVideoElement>('video[data-hero]')
    if (!el) return
    if (el.readyState >= 3) return resolve()
    el.addEventListener('canplay', () => resolve(), { once: true })
  })
}

/**
 * First paint on the home page: hold it until the fonts and the start of the
 * opening clip are ready, so the first drag of the scroll does not stall. Once
 * per session — a visitor coming back to the home page goes straight to it.
 */
export function Preloader() {
  // Only the home page opens on the film the curtain buffers for. Any other
  // address opening behind it would hold its content back for nothing — and
  // that content, prerendered, is what search and the visitor came for.
  const { pathname } = useLocation()
  const [film] = useState(() => pathname === '/')
  // Starts the same on the server and in the browser, so hydration matches;
  // a visitor who has seen the curtain never sees it even so, because the
  // inline script hides it with CSS before the first paint.
  const [done, setDone] = useState(!film)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!film) return
    const root = document.documentElement
    const lift = () => {
      root.classList.remove('rv-curtain')
      try {
        sessionStorage.setItem(SEEN_KEY, '1')
      } catch {
        // Private mode: the curtain shows again next time. Harmless.
      }
    }
    if (root.classList.contains('rv-nocurtain')) {
      setDone(true)
      return
    }

    stopScroll(true)
    const started = performance.now()
    let ticking = true

    const tick = () => {
      if (!ticking) return
      setProgress((p) => Math.min(p + (95 - p) * 0.08 + 1, 95))
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)

    // Waits on the hero's own element rather than a separate fetch of the
    // clip: the browser did not reuse that fetch for the <video>, so the
    // first 256 KB were downloaded twice.
    const clip = Promise.race([clipReady(), new Promise<void>((resolve) => setTimeout(resolve, CLIP_MS))])
    const fonts = Promise.race([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise((resolve) => setTimeout(resolve, CLIP_MS)),
    ])

    Promise.all([clip, fonts]).then(() => {
      const wait = Math.max(0, MIN_MS - (performance.now() - started))
      setTimeout(() => {
        ticking = false
        setProgress(100)
        setTimeout(() => {
          setDone(true)
          stopScroll(false)
          lift()
        }, 180)
      }, wait)
    })

    return () => {
      ticking = false
      stopScroll(false)
    }
  }, [film])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          data-curtain=""
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-bone"
          exit={{ y: '-100%' }}
          transition={{ duration: 0.62, ease: quint }}
        >
          <div className="overflow-hidden">
            <motion.span
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 1.1, ease: expo }}
              // -mr cancels the trailing letter-space so the mark is truly centred.
              className="-mr-[0.3em] block font-display text-[clamp(3rem,12vw,9rem)] leading-none tracking-[0.3em]"
            >
              VALLO
            </motion.span>
          </div>

          <div className="mt-10 flex w-[min(22rem,60vw)] items-center gap-4">
            <span className="h-px flex-1 bg-ink/15">
              <motion.span
                className="block h-px bg-ink"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: 'linear' }}
              />
            </span>
            <span className="eyebrow tabular-nums opacity-60">
              {String(Math.round(progress)).padStart(3, '0')}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
