import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import clsx from 'clsx'
import { expo, fadeUp, rise, unmask, viewport } from '~/lib/motion'

type Props = {
  children: ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'section' | 'li' | 'article' | 'header' | 'figure'
}

export function Reveal({ children, className, delay = 0, as = 'div' }: Props) {
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
    >
      {children}
    </Tag>
  )
}

/** Photography reveal: the frame uncovers, the image inside settles back. */
export function RevealImage({ children, className }: Props) {
  return (
    <motion.div
      className={clsx('overflow-hidden', className)}
      variants={unmask}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
    >
      <motion.div
        className="h-full w-full"
        initial={{ scale: 1.14 }}
        whileInView={{ scale: 1 }}
        viewport={viewport}
        transition={{ duration: 1.4, ease: expo }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

/** Line-by-line type reveal. Each line masks its own overflow. */
export function RevealLines({
  lines,
  className,
  lineClassName,
  delay = 0,
}: {
  lines: string[]
  className?: string
  lineClassName?: string
  delay?: number
}) {
  // The observer sits on the outer span, and the lines animate as its
  // variants. It cannot sit on the lines themselves: each is pushed a full
  // line below its own mask, so `overflow-hidden` clips it to nothing, the
  // intersection area is zero, and `whileInView` never fires. Every display
  // heading on the site stayed hidden that way.
  return (
    <motion.span
      className={clsx('block', className)}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
    >
      {lines.map((line, i) => (
        <span key={line} className="block overflow-hidden">
          <motion.span
            className={clsx('block', lineClassName)}
            variants={rise}
            custom={delay + i}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}
