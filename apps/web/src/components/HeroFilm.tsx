import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react'
import { useI18n, type Key } from '~/lib/i18n'
import { scrollTo } from '~/lib/scroll'
import { expo } from '~/lib/motion'
import { HERO_POSTER, heroClip } from '~/lib/hero'

const CHAPTERS = [1, 2, 3] as const

/** The clip's length. Only a fallback: the element's own duration wins. */
const CLIP_SECONDS = 1.03
/**
 * How much scroll the clip is stretched over, in viewport heights. The stage is
 * one screen of that and sticks, so the scrub itself runs over LENGTH - 1.
 *
 * The clip holds 141 distinct frames and no encoding raises that. Over the four
 * screens this used to scrub across, a frame had to last about 26px of scroll —
 * far enough apart to read as a slideshow rather than as motion. At one and a
 * half it is nearer 10px, which is inside the range where consecutive frames
 * read as movement.
 */
const LENGTH = 2.5
/**
 * Phones get one screen of scrub instead of one and a half. A flick on a phone
 * covers a screen or more, so at 2.5 the hero swallowed one to two flicks
 * before anything else appeared. One screen is ~850px on a typical phone —
 * still under 6px per frame, so the clip reads as motion, and each of the four
 * captions holds for about a fifth of a screen.
 */
const LENGTH_MOBILE = 2
const MOBILE = '(max-width: 767px)'
/**
 * How hard the playhead chases the scroll, per 60Hz frame. Lower is smoother
 * and laggier. Scrolling is native, so nothing upstream has smoothed it: a
 * mouse wheel arrives in steps of a hundred pixels or so, and touch momentum
 * in uneven ones. This is the only filter between those steps and the
 * decoder.
 */
const CHASE = 0.2

function useMedia(query: string) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}

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
  const sticky = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const progress = useRef(0)
  /**
   * The clip's length, in seconds. A ref for the playhead loop, which must not
   * re-render, and state for the readout, which must. The fallback is the
   * clip's real length, so the readout is right even before metadata lands.
   */
  const duration = useRef(CLIP_SECONDS)
  const [total, setTotal] = useState(CLIP_SECONDS)
  const learnDuration = (el: HTMLVideoElement) => {
    if (!Number.isFinite(el.duration) || el.duration <= 0) return
    duration.current = el.duration
    setTotal(el.duration)
  }

  // A cached clip can load its metadata before React attaches the handler,
  // and then the event never reaches it. Read it off the element as well.
  useEffect(() => {
    const el = video.current
    if (el && el.readyState >= 1) learnDuration(el)
  }, [])
  const reduced = useReducedMotion()
  // Chosen once: swapping sources on resize would restart the decoder mid-scrub.
  const [clip] = useState(heroClip)
  const mobile = useMedia(MOBILE)
  const length = mobile ? LENGTH_MOBILE : LENGTH

  const { scrollYProgress } = useScroll({
    target: section,
    offset: ['start start', 'end end'],
  })

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    progress.current = clamp01(p)
  })

  // iOS will not paint a seeked frame from a video that has never played, and
  // it ignores `preload` until then. A muted inline play, immediately paused,
  // starts the decoder without the clip ever visibly running. If the browser
  // refuses — Low Power Mode does — retry once the page is first touched.
  useEffect(() => {
    const el = video.current
    if (!el || reduced) return

    let cancelled = false
    const prime = () => {
      if (cancelled || !el) return
      el.muted = true
      void el
        .play()
        .then(() => {
          el.pause()
          el.currentTime = 0
        })
        .catch(() => {})
    }

    prime()
    window.addEventListener('touchstart', prime, { once: true, passive: true })
    window.addEventListener('pointerdown', prime, { once: true })
    return () => {
      cancelled = true
      window.removeEventListener('touchstart', prime)
      window.removeEventListener('pointerdown', prime)
    }
  }, [reduced])

  // Chase the scroll position in a rAF loop. Assigning currentTime on every
  // scroll event instead would queue seeks faster than the decoder retires them.
  useEffect(() => {
    const el = video.current
    const stage = sticky.current
    if (!el || !stage || reduced) return

    let frame = 0
    let playhead = 0
    let last = 0

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      if (el.readyState < 2) return

      // Frame-rate independent chase: a 120Hz display would otherwise run the
      // easing — and so the seeks — twice as fast as a 60Hz one.
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60
      last = now
      const ease = 1 - Math.pow(1 - CHASE, dt * 60)

      const target = progress.current * duration.current
      const delta = target - playhead
      if (Math.abs(delta) < 0.004) return
      playhead += delta * ease
      if (el.seeking) return
      // The clip is encoded all-intra, so every frame is a keyframe. That is
      // what makes both of these cheap, and it is the whole reason the hero
      // scrubs smoothly: fastSeek rounds to the nearest keyframe, which used to
      // mean the nearest of twenty-five over the entire clip — the playhead
      // could only ever land on one of twenty-five images. Chrome has never
      // implemented fastSeek and took the other branch, where an exact seek had
      // to decode forward from the preceding keyframe; the guard above then held
      // the playhead still until it finished. One steppy browser, one sluggish
      // one, the same cause. With every frame a keyframe, rounding is exact and
      // decoding is a single frame either way.
      if (typeof el.fastSeek === 'function') el.fastSeek(playhead)
      else el.currentTime = playhead
    }

    // Only run while the film is actually on screen. Left ungated, the loop
    // kept asking the decoder for frames for the rest of the visit, five
    // screens after anyone could see them.
    const watcher = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !frame) {
          last = 0
          frame = requestAnimationFrame(tick)
        } else if (!entry.isIntersecting && frame) {
          cancelAnimationFrame(frame)
          frame = 0
        }
      },
      { threshold: 0 },
    )
    watcher.observe(stage)

    return () => {
      watcher.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [reduced])

  // Only re-render when the chapter actually changes, not on every scroll event.
  const [chapter, setChapter] = useState(0)
  const chapterRef = useRef(0)
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const next = Math.min(CHAPTERS.length - 1, Math.floor(clamp01(p) * CHAPTERS.length))
    if (next === chapterRef.current) return
    chapterRef.current = next
    setChapter(next)
  })

  // Keyed to progress, which is a fraction of the scrub — so shortening the
  // scrub would have pulled the wordmark off the screen in a third of the
  // scrolling it used to take. Rescaled by the same factor the scrub shrank
  // by (four screens to one and a half), which holds the mark for the same
  // distance under the hand as before.
  const titleScale = useTransform(scrollYProgress, [0, 0.48], [1, 0.86])
  const titleOpacity = useTransform(scrollYProgress, [0, 0.32], [1, 0])
  const veil = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.2, 0.44])
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  const elapsed = useTransform(scrollYProgress, (p) =>
    (clamp01(p) * duration.current).toFixed(1),
  )

  return (
    <div
      ref={section}
      style={{ height: reduced ? '100svh' : `${length * 100}svh` }}
      className="relative bg-night"
    >
      <div ref={sticky} className="sticky top-0 h-[100svh] w-full overflow-hidden grain">
        {/* Full bleed: the clip fills the stage, cropping rather than letterboxing. */}
        <video
          ref={video}
          src={clip}
          poster={HERO_POSTER}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-hidden
          onLoadedMetadata={(e) => {
            learnDuration(e.currentTarget)
            e.currentTarget.currentTime = 0
          }}
        />

        <motion.div className="absolute inset-0 bg-night" style={{ opacity: veil }} aria-hidden />
        {/* Vignette and the caption gradient in one layer: each full-viewport
            overlay is another surface to composite on every scrubbed frame. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(13,12,10,0.85) 0%, transparent 40%),' +
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
          {/* The page's one heading. The wordmark is all that shows; the rest
              says to search and to screen readers what VALLO is. */}
          <motion.h1
            initial={{ opacity: 0, letterSpacing: '0.6em', marginRight: '-0.6em' }}
            animate={{ opacity: 1, letterSpacing: '0.34em', marginRight: '-0.34em' }}
            transition={{ duration: 1.2, ease: expo, delay: 0.1 }}
            className="font-display text-[clamp(3.5rem,17vw,17rem)] leading-none"
          >
            VALLO
            <span className="sr-only"> — canapele, colțare și paturi tapițate, produse în România</span>
          </motion.h1>
          <motion.span
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 0.75, y: 0 }}
            transition={{ duration: 0.8, ease: expo, delay: 0.35 }}
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
              <span className="eyebrow tabular-nums">{total.toFixed(1)}</span>
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
