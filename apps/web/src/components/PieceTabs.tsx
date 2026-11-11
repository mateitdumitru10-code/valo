import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import clsx from 'clsx'
import { expo } from '~/lib/motion'

export type Tab = { id: string; label: string; content: ReactNode }

/**
 * The reading part of a product page — description, technical sheet, details,
 * plan — behind one row of tabs instead of four bands stacked down the page.
 *
 * Every panel is rendered, the inactive ones `hidden`: the prerendered page
 * still carries all of the text for search engines and for anyone without
 * JavaScript, and switching never waits on anything.
 */
export function PieceTabs({ tabs, label }: { tabs: Tab[]; label: string }) {
  // Nothing is stored until the visitor picks: the tabs fill in as the piece's
  // detail arrives, and the first of them should lead once they have.
  const [active, setActive] = useState<string | null>(null)
  // The first panel is simply there; only a panel the visitor asks for fades
  // in. Animating from the start would ship the prerendered text at opacity 0.
  const [moved, setMoved] = useState(false)
  const current = tabs.some((tab) => tab.id === active) ? active : tabs[0]?.id
  const base = useId()
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const still = useReducedMotion()

  if (tabs.length === 0) return null

  function choose(id: string) {
    setMoved(true)
    setActive(id)
  }

  // The WAI-ARIA tabs pattern: arrows move along the row, Home and End jump.
  function onKeyDown(event: KeyboardEvent, i: number) {
    const next =
      event.key === 'ArrowRight' ? (i + 1) % tabs.length
      : event.key === 'ArrowLeft' ? (i - 1 + tabs.length) % tabs.length
      : event.key === 'Home' ? 0
      : event.key === 'End' ? tabs.length - 1
      : null
    if (next === null) return
    event.preventDefault()
    choose(tabs[next].id)
    buttons.current[next]?.focus()
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label={label}
        className="flex justify-between gap-3 overflow-x-auto border-b border-ink/12 [scrollbar-width:none] sm:justify-start sm:gap-8 md:gap-12"
      >
        {tabs.map((tab, i) => {
          const on = tab.id === current
          return (
            <button
              key={tab.id}
              ref={(el) => {
                buttons.current[i] = el
              }}
              role="tab"
              type="button"
              id={`${base}-tab-${tab.id}`}
              aria-selected={on}
              aria-controls={`${base}-panel-${tab.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => choose(tab.id)}
              onKeyDown={(event) => onKeyDown(event, i)}
              className={clsx(
                'relative shrink-0 whitespace-nowrap pb-4 font-display text-[clamp(0.9375rem,0.8rem+0.6vw,1.375rem)] transition-opacity duration-300',
                'focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink/40',
                on ? 'opacity-100' : 'opacity-40 hover:opacity-75',
              )}
            >
              {tab.label}
              {on && (
                <motion.span
                  layoutId={`${base}-mark`}
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-px bg-ink"
                  transition={still ? { duration: 0 } : { duration: 0.6, ease: expo }}
                />
              )}
            </button>
          )
        })}
      </div>

      {tabs.map((tab) => {
        const on = tab.id === current
        return (
          <div
            key={tab.id}
            role="tabpanel"
            id={`${base}-panel-${tab.id}`}
            aria-labelledby={`${base}-tab-${tab.id}`}
            hidden={!on}
            tabIndex={0}
            className="focus-visible:outline-none"
          >
            {on ? (
              <motion.div
                key={tab.id}
                initial={still || !moved ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: expo }}
              >
                {tab.content}
              </motion.div>
            ) : (
              tab.content
            )}
          </div>
        )
      })}
    </div>
  )
}
