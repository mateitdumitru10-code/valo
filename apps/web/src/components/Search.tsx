import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import clsx from 'clsx'
import { Img } from '~/components/Img'
import { categories, category, collectionName, collections, formatPrice } from '~/lib/catalog'
import { useI18n } from '~/lib/i18n'
import { expo } from '~/lib/motion'
import { stopScroll } from '~/lib/scroll'
import { searchPieces } from '~/lib/search'

/** How many results the panel lists before handing over to the products page. */
const SHOWN = 8

export function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden className={className}>
      <circle cx="7" cy="7" r="5" />
      <path d="m11 11 3.5 3.5" strokeLinecap="round" />
    </svg>
  )
}

/**
 * The search panel: a sheet over the page with one large field and the pieces
 * it finds as you type. Nothing is fetched — see lib/search.ts.
 */
export function Search({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang } = useI18n()
  const navigate = useNavigate()
  const still = useReducedMotion()
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const listId = useId()

  const results = useMemo(() => searchPieces(query), [query])
  const shown = results.slice(0, SHOWN)
  const typed = query.trim().length > 0

  useEffect(() => {
    stopScroll(open)
    if (open) {
      setQuery('')
      setHighlight(0)
    }
    return () => stopScroll(false)
  }, [open])

  useEffect(() => setHighlight(0), [query])

  const go = (to: string) => {
    onClose()
    navigate(to)
  }
  const allResults = `/produse?q=${encodeURIComponent(query.trim())}`

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
    } else if (event.key === 'ArrowDown' && shown.length) {
      event.preventDefault()
      setHighlight((i) => (i + 1) % shown.length)
    } else if (event.key === 'ArrowUp' && shown.length) {
      event.preventDefault()
      setHighlight((i) => (i - 1 + shown.length) % shown.length)
    } else if (event.key === 'Enter' && typed) {
      event.preventDefault()
      const piece = shown[highlight]
      go(piece ? `/produse/${piece.slug}` : allResults)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={t('search.label')}
          initial={still ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)' }}
          animate={still ? { opacity: 1 } : { clipPath: 'inset(0 0 0% 0)' }}
          exit={still ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.6, ease: expo }}
          onAnimationComplete={() => input.current?.focus()}
          onKeyDown={onKeyDown}
          className="fixed inset-0 z-[60] overflow-y-auto bg-bone text-ink"
        >
          <div className="gutter pb-20">
            <div className="flex h-[4.5rem] items-center justify-between md:h-24">
              <span className="eyebrow opacity-45">{t('search.label')}</span>
              <button
                type="button"
                onClick={onClose}
                className="eyebrow flex items-center gap-2 opacity-70 transition-opacity hover:opacity-100"
              >
                {t('nav.close')}
                <span className="relative block h-3 w-4" aria-hidden>
                  <span className="absolute top-1.5 left-0 h-px w-4 rotate-45 bg-current" />
                  <span className="absolute top-1.5 left-0 h-px w-4 -rotate-45 bg-current" />
                </span>
              </button>
            </div>

            <div className="mt-6 flex items-center gap-4 border-b border-ink/25 pb-4 md:mt-12 md:gap-6">
              <SearchIcon className="h-5 w-5 shrink-0 opacity-45 md:h-7 md:w-7" />
              <input
                ref={input}
                autoFocus
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('search.placeholder')}
                aria-label={t('search.label')}
                aria-controls={listId}
                aria-activedescendant={typed && shown[highlight] ? `${listId}-${shown[highlight].slug}` : undefined}
                autoComplete="off"
                spellCheck={false}
                enterKeyHint="search"
                className="min-w-0 flex-1 bg-transparent font-display text-[clamp(1.75rem,1.2rem+2.6vw,3.75rem)] leading-tight outline-none placeholder:text-ink/25 [&::-webkit-search-cancel-button]:hidden"
              />
            </div>

            {!typed && (
              // Before anything is typed: the two ways the catalogue is already
              // organised, one tap away.
              <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-12">
                <div className="md:col-span-4">
                  <p className="eyebrow opacity-45">{t('nav.categories')}</p>
                  <ul className="mt-4 space-y-2">
                    {categories.map((c) => (
                      <li key={c.id}>
                        <Link
                          to={`/categorii/${c.id}`}
                          onClick={onClose}
                          className="font-display text-xl opacity-75 transition-opacity hover:opacity-100"
                        >
                          {lang === 'ro' ? c.ro : c.en}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:col-span-4">
                  <p className="eyebrow opacity-45">{t('nav.collections')}</p>
                  <ul className="mt-4 space-y-2">
                    {collections.map((c) => (
                      <li key={c.id}>
                        <Link
                          to={`/colectii/${c.id}`}
                          onClick={onClose}
                          className="font-display text-xl opacity-75 transition-opacity hover:opacity-100"
                        >
                          {collectionName(c.id)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {typed && (
              <div className="mt-8 md:mt-10">
                <p className="eyebrow tabular-nums opacity-45" aria-live="polite">
                  {results.length === 0
                    ? t('search.none')
                    : `${results.length} ${t(results.length === 1 ? 'search.one' : 'search.many')}`}
                </p>

                {results.length === 0 ? (
                  <p className="mt-4 max-w-md text-sm leading-relaxed opacity-60">{t('search.hint')}</p>
                ) : (
                  <ul id={listId} role="listbox" aria-label={t('search.label')} className="mt-4 border-t border-ink/12">
                    {shown.map((piece, i) => {
                      const kind = category(piece.category)
                      const price = formatPrice(piece.price, lang)
                      return (
                        <li
                          key={piece.slug}
                          id={`${listId}-${piece.slug}`}
                          role="option"
                          aria-selected={i === highlight}
                        >
                          <Link
                            to={`/produse/${piece.slug}`}
                            onClick={onClose}
                            onMouseEnter={() => setHighlight(i)}
                            tabIndex={-1}
                            className={clsx(
                              'flex items-center gap-4 border-b border-ink/12 py-3 transition-colors md:gap-6',
                              i === highlight ? 'bg-ink/[0.04]' : '',
                            )}
                          >
                            <Img
                              img={piece.cover}
                              alt=""
                              sizes="112px"
                              className="aspect-[4/3] w-20 shrink-0 md:w-28"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-display text-lg md:text-2xl">{piece.name}</p>
                              <p className="eyebrow mt-1 truncate opacity-45">
                                {kind ? (lang === 'ro' ? kind.ro : kind.en) : ''}
                                {piece.collection && ` / ${collectionName(piece.collection)}`}
                              </p>
                            </div>
                            {price && (
                              <p className="hidden shrink-0 pr-2 text-sm tabular-nums opacity-70 sm:block">{price}</p>
                            )}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}

                {results.length > SHOWN && (
                  <button
                    type="button"
                    onClick={() => go(allResults)}
                    className="eyebrow mt-8 underline underline-offset-4 opacity-70 transition-opacity hover:opacity-100"
                  >
                    {t('search.all')} ({results.length})
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
