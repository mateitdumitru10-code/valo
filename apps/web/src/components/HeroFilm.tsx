import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react'
import { useI18n, type Key } from '~/lib/i18n'
import { scrollTo } from '~/hooks/useLenis'
import { expo } from '~/lib/motion'

const CHAPTERS = [1, 2, 3, 4] as const

const CLIP = '/media/hero.mp4'
/** How much scroll the clip is stretched over, in viewport heights. */
const LENGTH = 5
/** How hard the playhead chases the scroll. Lower is smoother and laggier. */
const CHASE = 0.12

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/**
 * The hero is the clip itself, played by the scroll rather than by the clock:
 * the whole thing is stretched across five screens of scrolling. Stop scrolling
 * and the frame holds.
 *
 * The footage runs full bleed — it fills the stage and crops to it, rather than
 * sitting letterboxed inside it.
 */
export function HeroFilm() {
  const { t } = useI18n()
  const section = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const progress = useRef(0)
  const duration = useRef(5)
  const [ready, setReady] = useState(false)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: section,
    offset: ['start start', 'end end'],
  })

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    progress.current = clamp01(p)
  })

  // Chase the scroll position in a rAF loop. Assigning currentTime on every
  // scroll event instead would queue seeks faster than the decoder retires them.
  useEffect(() => {
    const el = video.current
    if (!el || reduced) return

    let frame = 0
    let playhead = 0

    const tick = () => {
      frame = requestAnimationFrame(tick)
      if (el.readyState < 2) return

      const target = progress.current * duration.current
      const delta = target - playhead
      if (Math.abs(delta) < 0.004) return
      playhead += delta * CHASE
      if (!el.seeking) el.currentTime = playhead
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [reduced])

  const [chapter, setChapter] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    setChapter(Math.min(CHAPTERS.length - 1, Math.floor(clamp01(p) * CHAPTERS.length)))
  })

  const titleScale = useTransform(scrollYProgress, [0, 0.18], [1, 0.86])
  const titleOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0])
  const veil = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.2, 0.44])
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  const elapsed = useTransform(scrollYProgress, (p) =>
    (clamp01(p) * duration.current).toFixed(1),
  )

  return (
    <div
      ref={section}
      style={{ height: reduced ? '100svh' : `${LENGTH * 100}svh` }}
      className="relative bg-night"
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden grain">
        {/* Full bleed: the clip fills the stage, cropping rather than letterboxing. */}
        <video
          ref={video}
          src={CLIP}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-hidden
          onLoadedMetadata={(e) => {
            duration.current = e.currentTarget.duration || 5
            e.currentTarget.currentTime = 0
          }}
          onLoadedData={() => setReady(true)}
        />

        {/* Until the first frame is decoded the section is simply dark. */}
        <motion.div
          className="absolute inset-0 bg-night"
          animate={{ opacity: ready ? 0 : 1 }}
          transition={{ duration: 0.6, ease: expo }}
          aria-hidden
        />

        <motion.div className="absolute inset-0 bg-night" style={{ opacity: veil }} aria-hidden />
        <div
          className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-night/85 to-transparent"
          aria-hidden
        />
        {/* Vignette: makes the letterbox edges read as framing, not as bars. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 85% at 50% 45%, transparent 45%, rgba(13,12,10,0.6) 100%)',
          }}
          aria-hidden
        />

        {/* Wordmark, held for the first screen only. */}
        <motion.div
          style={{ scale: titleScale, opacity: titleOpacity }}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-paper"
        >
          {/*
            Letter-spacing also lands after the final letter, so a centred
            wordmark sits half a space to the left of true centre. The negative
            margin cancels that trailing space, and is animated alongside the
            tracking so the mark stays centred for the whole entrance.
          */}
          <motion.span
            initial={{ opacity: 0, letterSpacing: '0.6em', marginRight: '-0.6em' }}
            animate={{ opacity: 1, letterSpacing: '0.34em', marginRight: '-0.34em' }}
            transition={{ duration: 1.8, ease: expo, delay: 0.15 }}
            className="font-display text-[clamp(3.5rem,17vw,17rem)] leading-none"
          >
            VALLO
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 0.75, y: 0 }}
            transition={{ duration: 1.2, ease: expo, delay: 0.9 }}
            className="eyebrow mt-6 text-paper/80"
          >
            {t('hero.kicker')}
          </motion.span>
        </motion.div>

        {/* Chapter captions, cut against the film. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 gutter pb-[max(2.5rem,env(safe-area-inset-bottom))]">
          <div className="flex items-end justify-between gap-8 text-paper">
            <div className="relative min-h-[6.5rem] max-w-xl">
              {CHAPTERS.map((n, i) => (
                <motion.div
                  key={n}
                  initial={false}
                  animate={{ opacity: chapter === i ? 1 : 0, y: chapter === i ? 0 : 18 }}
                  transition={{ duration: 0.7, ease: expo }}
                  className={chapter === i ? 'block' : 'pointer-events-none absolute inset-0'}
                >
                  <p className="eyebrow text-paper/60">
                    {String(n).padStart(2, '0')} — {t(`hero.chapter.${n}.label` as Key)}
                  </p>
                  <p className="mt-3 font-display text-[clamp(1.5rem,3.2vw,2.75rem)] leading-[1.05]">
                    {t(`hero.chapter.${n}.line` as Key)}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="hidden shrink-0 items-center gap-4 text-paper/70 md:flex">
              <motion.span className="eyebrow tabular-nums">{elapsed}</motion.span>
              <span className="h-px w-24 bg-paper/30">
                <motion.span className="block h-px bg-paper" style={{ width: bar }} />
              </span>
              <span className="eyebrow tabular-nums">{duration.current.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => scrollTo('#manifesto')}
          className="group absolute bottom-[max(2.5rem,env(safe-area-inset-bottom))] left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-paper/70 transition-colors hover:text-paper md:flex"
        >
          <span className="eyebrow">{t('common.scroll')}</span>
          <span className="relative h-10 w-px overflow-hidden bg-paper/25">
            <span className="absolute inset-x-0 top-0 h-4 animate-[drop_2.4s_cubic-bezier(0.83,0,0.17,1)_infinite] bg-paper" />
          </span>
        </button>
      </div>

      <style>{`@keyframes drop { 0% { transform: translateY(-100%) } 60%,100% { transform: translateY(1000%) } }`}</style>
    </div>
  )
}
