import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import clsx from 'clsx'
import { expo, fadeUp, unmask, viewport } from '~/lib/motion'

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
  return (
    <span className={clsx('block', className)}>
      {lines.map((line, i) => (
        <span key={line} className="block overflow-hidden">
          <motion.span
            className={clsx('block', lineClassName)}
            initial={{ y: '110%' }}
            whileInView={{ y: '0%' }}
            viewport={viewport}
            transition={{ duration: 1.1, ease: expo, delay: delay + i * 0.08 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  )
}
