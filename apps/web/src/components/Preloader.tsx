import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { expo, quint } from '~/lib/motion'
import { stopScroll } from '~/lib/scroll'
import { heroClip } from '~/lib/hero'

/** Floor on how long the curtain is held. Anything more is self-inflicted. */
const MIN_MS = 280
/**
 * Ceiling on the wait for the opening clip. Past this, a slow connection gets
 * the page and the clip catches up; the curtain is not worth more than this to
 * anyone, least of all to the page's paint timings.
 */
const CLIP_MS = 1800

/**
 * First paint: hold the page until the fonts and enough of the opening clip are
 * buffered that scrubbing it does not stall on the first drag of the scroll.
 */
export function Preloader() {
  // Only the home page opens on the film the curtain buffers for. Any other
  // address opening behind it would hold its content back for nothing — and
  // that content, prerendered, is what search and the visitor came for.
  const { pathname } = useLocation()
  const [film] = useState(() => pathname === '/')
  const [done, setDone] = useState(!film)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!film) return
    stopScroll(true)
    const started = performance.now()
    let ticking = true

    const tick = () => {
      if (!ticking) return
      setProgress((p) => Math.min(p + (95 - p) * 0.04 + 0.6, 95))
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)

    // Warm the cache with a plain ranged fetch rather than a second <video>.
    // iOS allows very few simultaneous video decoders, and a hidden element
    // holding one starves the hero's own element — the clip then never paints.
    const clip = Promise.race([
      fetch(heroClip(), { headers: { range: 'bytes=0-262143' } })
        .then(() => undefined)
        .catch(() => undefined),
      new Promise<void>((resolve) => setTimeout(resolve, CLIP_MS)),
    ])

    Promise.all([clip, document.fonts?.ready ?? Promise.resolve()]).then(() => {
      const wait = Math.max(0, MIN_MS - (performance.now() - started))
      setTimeout(() => {
        ticking = false
        setProgress(100)
        setTimeout(() => {
          setDone(true)
          stopScroll(false)
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
