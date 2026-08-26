import type { Transition, Variants } from 'motion/react'

/** One easing everywhere: long tail, no bounce. Bounce reads cheap here. */
export const expo: Transition['ease'] = [0.16, 1, 0.3, 1]
export const quint: Transition['ease'] = [0.83, 0, 0.17, 1]

export const rise: Variants = {
  hidden: { y: '110%' },
  show: (i = 0) => ({
    y: '0%',
    transition: { duration: 1, ease: expo, delay: 0.06 * (i as number) },
  }),
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: expo, delay: 0.07 * (i as number) },
  }),
}

/** The landing statements, which are set alternately against the left and the
 *  right margin and read one at a time down a long column. Slower than
 *  `fadeUp` and carrying a little lateral drift: the entrance is meant to be
 *  noticed rather than got out of the way, and it comes from the side the
 *  paragraph is set on, so the alternation is legible before the text is. */
export const drift: Variants = {
  hidden: (from: 'left' | 'right' = 'left') => ({
    opacity: 0,
    y: 28,
    x: from === 'left' ? -24 : 24,
  }),
  show: { opacity: 1, y: 0, x: 0, transition: { duration: 1.6, ease: expo } },
}

/** Photography enters by uncovering, never by fading — it keeps weight. */
export const unmask: Variants = {
  hidden: { clipPath: 'inset(0 0 100% 0)' },
  show: {
    clipPath: 'inset(0 0 0% 0)',
    transition: { duration: 1.25, ease: expo },
  },
}

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

export const viewport = { once: true, margin: '-12% 0px -12% 0px' } as const
