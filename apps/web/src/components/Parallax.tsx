import { useRef, type ReactNode } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import clsx from 'clsx'

/** Vertical drift as the element crosses the viewport. Distance in pixels. */
export function Parallax({
  children,
  distance = 80,
  className,
}: {
  children: ReactNode
  distance?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance])

  return (
    <div ref={ref} className={clsx('relative', className)}>
      <motion.div className="h-full w-full" style={reduced ? undefined : { y }}>
        {children}
      </motion.div>
    </div>
  )
}
