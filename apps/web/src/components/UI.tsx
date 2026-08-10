import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import clsx from 'clsx'

export function Eyebrow({
  children,
  className,
  index,
}: {
  children: ReactNode
  className?: string
  index?: string
}) {
  return (
    <p className={clsx('eyebrow flex items-center gap-3 opacity-60', className)}>
      {index && <span className="tabular-nums">{index}</span>}
      {index && <span className="h-px w-8 bg-current opacity-40" />}
      {children}
    </p>
  )
}

/** Text link with a rule that draws itself in from the left on hover. */
export function ArrowLink({
  to,
  href,
  children,
  className,
  onClick,
}: {
  to?: string
  href?: string
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  const inner = (
    <span className="group/link relative inline-flex items-center gap-3 py-2">
      <span className="eyebrow">{children}</span>
      <svg
        viewBox="0 0 20 8"
        className="h-2 w-5 overflow-visible"
        fill="none"
        stroke="currentColor"
        aria-hidden
      >
        <path
          d="M0 4h18M14 0.5 18.5 4 14 7.5"
          className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/link:translate-x-1"
        />
      </svg>
      <span className="absolute inset-x-0 bottom-0 h-px origin-right scale-x-0 bg-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/link:origin-left group-hover/link:scale-x-100" />
    </span>
  )

  if (href) {
    return (
      <a href={href} className={className} target="_blank" rel="noreferrer">
        {inner}
      </a>
    )
  }
  return (
    <Link to={to ?? '#'} className={className} onClick={onClick}>
      {inner}
    </Link>
  )
}

/** Solid call to action. Square corners; the fill wipes up on hover. */
export function Cta({
  to,
  href,
  children,
  tone = 'ink',
  className,
  type,
  disabled,
}: {
  to?: string
  href?: string
  children: ReactNode
  tone?: 'ink' | 'paper'
  className?: string
  type?: 'submit' | 'button'
  disabled?: boolean
}) {
  const classes = clsx(
    'group/cta relative inline-flex items-center justify-center overflow-hidden border px-8 py-4 transition-colors duration-500',
    tone === 'ink'
      ? 'border-ink text-ink hover:text-bone'
      : 'border-paper/40 text-paper hover:text-ink',
    disabled && 'pointer-events-none opacity-50',
    className,
  )
  const body = (
    <>
      <span
        className={clsx(
          'absolute inset-0 origin-bottom scale-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/cta:scale-y-100',
          tone === 'ink' ? 'bg-ink' : 'bg-paper',
        )}
        aria-hidden
      />
      <span className="eyebrow relative">{children}</span>
    </>
  )

  if (type) {
    return (
      <button type={type} className={classes} disabled={disabled}>
        {body}
      </button>
    )
  }
  if (href) {
    return (
      <a href={href} className={classes} target="_blank" rel="noreferrer">
        {body}
      </a>
    )
  }
  return (
    <Link to={to ?? '#'} className={classes}>
      {body}
    </Link>
  )
}

export function Rule({ className }: { className?: string }) {
  return <hr className={clsx('rule border-t', className)} />
}
