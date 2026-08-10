import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

/**
 * A cursor ring that lags a beat behind the pointer and swells over anything
 * interactive. Desktop pointers only — it is decoration, never a control.
 */
export function Cursor() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const rx = useSpring(x, { stiffness: 700, damping: 45, mass: 0.4 })
  const ry = useSpring(y, { stiffness: 700, damping: 45, mass: 0.4 })
  const [state, setState] = useState<'idle' | 'active' | 'hidden'>('idle')
  const [label, setLabel] = useState('')
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    setEnabled(fine.matches && !reduced.matches)
  }, [])

  useEffect(() => {
    if (!enabled) return

    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)

      const target = (e.target as HTMLElement)?.closest?.(
        'a, button, [data-cursor], input, textarea, select',
      ) as HTMLElement | null

      if (!target) {
        setState('idle')
        setLabel('')
        return
      }
      const mode = target.dataset.cursor
      setLabel(target.dataset.cursorLabel ?? '')
      setState(mode === 'hide' ? 'hidden' : 'active')
    }

    const leave = () => setState('hidden')
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
    }
  }, [enabled, x, y])

  if (!enabled) return null

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-[60] mix-blend-difference"
      style={{ x: rx, y: ry }}
      aria-hidden
    >
      <motion.div
        className="flex items-center justify-center rounded-full border border-white/80 text-[0.625rem] tracking-[0.18em] text-white uppercase"
        animate={{
          width: label ? 92 : state === 'active' ? 46 : 12,
          height: label ? 92 : state === 'active' ? 46 : 12,
          opacity: state === 'hidden' ? 0 : 1,
          x: label ? -46 : state === 'active' ? -23 : -6,
          y: label ? -46 : state === 'active' ? -23 : -6,
          backgroundColor: state === 'active' ? 'rgba(255,255,255,0)' : 'rgba(255,255,255,0.9)',
        }}
        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      >
        {label}
      </motion.div>
    </motion.div>
  )
}
