import type { CSSProperties, ReactNode } from 'react'
import clsx from 'clsx'

/**
 * The entrances, as CSS. Each component renders plain markup with a class
 * from src/styles/global.css ("Entrances") and a `data-rv` trigger, which the
 * inline script in index.html starts as it scrolls into view.
 *
 * They used to be Motion components with `initial="hidden"`. That state was
 * written into the prerendered HTML, so every heading and block on a page sat
 * invisible until the JavaScript bundle had loaded and run — about a second on
 * a phone, on every page. As CSS they play the moment the HTML paints.
 */

type Props = {
  children: ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'section' | 'li' | 'article' | 'header' | 'figure'
}

/** The stagger index, as the custom property the animation delay reads. */
const step = (i: number) => ({ '--i': i }) as CSSProperties

export function Reveal({ children, className, delay = 0, as: Tag = 'div' }: Props) {
  return (
    <Tag data-rv="" className={clsx('rv-up', className)} style={delay ? step(delay) : undefined}>
      {children}
    </Tag>
  )
}

/**
 * A statement that drifts in from the margin it is set against. Slower than
 * `Reveal`, and without its stagger: these are read one at a time with a
 * screen's worth of space between them, so there is nothing to stagger
 * against and every reason to let each one take its time.
 */
export function Drift({ children, className, from = 'left' }: Props & { from?: 'left' | 'right' }) {
  return (
    <div data-rv="" className={clsx(from === 'left' ? 'rv-drift-l' : 'rv-drift-r', className)}>
      {children}
    </div>
  )
}

/** Photography reveal: the frame uncovers, the image inside settles back. */
export function RevealImage({ children, className }: Props) {
  return (
    <div data-rv="" className={clsx('rv-unmask overflow-hidden', className)}>
      <div className="rv-settle h-full w-full">{children}</div>
    </div>
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
  // The trigger is the outer span, not the lines: each line starts a full
  // line below its own mask, clipped to nothing, so it could never be seen
  // entering the viewport itself.
  return (
    <span data-rv="" className={clsx('block', className)}>
      {lines.map((line, i) => (
        <span key={line} className="block overflow-hidden">
          <span className={clsx('rv-rise block', lineClassName)} style={step(delay + i)}>
            {line}
          </span>
        </span>
      ))}
    </span>
  )
}
