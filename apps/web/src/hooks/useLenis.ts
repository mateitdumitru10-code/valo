import Lenis from 'lenis'
import { useEffect, useRef } from 'react'

let instance: Lenis | null = null

/** Mounted once, at the app root. */
export function useSmoothScroll() {
  const raf = useRef<number>(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.6,
    })
    instance = lenis

    const loop = (time: number) => {
      lenis.raf(time)
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf.current)
      lenis.destroy()
      instance = null
    }
  }, [])
}

export function scrollTo(target: string | number, offset = 0) {
  if (instance) {
    instance.scrollTo(target, { offset, duration: 1.4 })
    return
  }
  const el = typeof target === 'string' ? document.querySelector(target) : null
  if (el) el.scrollIntoView({ behavior: 'smooth' })
  else if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' })
}

/**
 * Locks the page. The inline style is always set — the preloader runs its effect
 * before the root has created Lenis, so relying on the instance alone would
 * leave the page locked once it lifts.
 */
export function stopScroll(stopped: boolean) {
  document.documentElement.style.overflow = stopped ? 'hidden' : ''
  if (!instance) return
  if (stopped) instance.stop()
  else instance.start()
}

export function scrollToTop() {
  if (instance) instance.scrollTo(0, { immediate: true })
  else window.scrollTo(0, 0)
}
