import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import clsx from 'clsx'
import { useI18n } from '~/lib/i18n'
import { collectionName, collections } from '~/lib/catalog'
import { mainPhone, mainPhoneHref } from '~/lib/showrooms'
import { expo } from '~/lib/motion'
import { stopScroll } from '~/hooks/useLenis'

const links = [
  { to: '/colectii', key: 'nav.collections' },
  { to: '/piese', key: 'nav.pieces' },
  { to: '/atelier', key: 'nav.atelier' },
  { to: '/showroom-uri', key: 'nav.showrooms' },
  { to: '/contact', key: 'nav.contact' },
] as const

/**
 * The bar inverts itself over any section marked `data-nav="invert"` — the film
 * hero and the dark origin band — so it never needs a per-page prop.
 */
function useInverted() {
  const [inverted, setInverted] = useState(false)
  const location = useLocation()

  useEffect(() => {
    // An IntersectionObserver rather than a scroll handler: measuring with
    // getBoundingClientRect every frame forced a layout flush mid-scroll, right
    // after motion had written its transforms.
    const dark = document.querySelectorAll<HTMLElement>('[data-nav="invert"]')
    if (!dark.length) {
      setInverted(false)
      return
    }

    const over = new Set<Element>()
    let observer: IntersectionObserver | null = null

    // A one-pixel band at the height of the bar: a section counts as "under the
    // nav" exactly while it crosses that line.
    const watch = () => {
      observer?.disconnect()
      const line = 34
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) over.add(entry.target)
            else over.delete(entry.target)
          }
          setInverted(over.size > 0)
        },
        { rootMargin: `-${line}px 0px -${Math.max(0, window.innerHeight - line - 1)}px 0px` },
      )
      dark.forEach((el) => observer?.observe(el))
    }

    watch()
    window.addEventListener('resize', watch)
    return () => {
      observer?.disconnect()
      over.clear()
      window.removeEventListener('resize', watch)
    }
  }, [location.pathname])

  return inverted
}

function useScrolled(threshold = 40) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return scrolled
}

export function Nav() {
  const { t, lang, setLang } = useI18n()
  const inverted = useInverted()
  const scrolled = useScrolled()
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    stopScroll(open)
    return () => stopScroll(false)
  }, [open])

  const tone = open || inverted ? 'text-paper' : 'text-ink'

  return (
    <>
      <header
        className={clsx(
          'fixed inset-x-0 top-0 z-50 transition-colors duration-500',
          tone,
          !open && scrolled && !inverted && 'bg-bone/80 backdrop-blur-md',
        )}
      >
        <div
          className={clsx(
            'gutter flex items-center justify-between gap-6 transition-[height] duration-500',
            scrolled ? 'h-16' : 'h-[4.5rem] md:h-24',
          )}
        >
          <Link
            to="/"
            className="group flex items-baseline gap-2"
            aria-label="Vallo"
          >
            <span className="-mr-[0.3em] font-display text-xl leading-none tracking-[0.3em] md:text-2xl">
              VALLO
            </span>
            <span className="eyebrow hidden opacity-55 transition-opacity group-hover:opacity-100 sm:block">
              by Samobi
            </span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  clsx(
                    'eyebrow relative py-2 transition-opacity',
                    isActive ? 'opacity-100' : 'opacity-60 hover:opacity-100',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {t(link.key)}
                    <span
                      className={clsx(
                        'absolute inset-x-0 -bottom-0.5 h-px origin-left bg-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                        isActive ? 'scale-x-100' : 'scale-x-0',
                      )}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <a
              href={`tel:${mainPhoneHref}`}
              className="eyebrow hidden opacity-60 transition-opacity hover:opacity-100 xl:block"
            >
              {mainPhone}
            </a>

            <div className="eyebrow flex items-center gap-1.5">
              {(['ro', 'en'] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  className={clsx(
                    'px-1 py-1 transition-opacity',
                    lang === code ? 'opacity-100 underline underline-offset-4' : 'opacity-45 hover:opacity-80',
                  )}
                  aria-pressed={lang === code}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="eyebrow flex items-center gap-2 lg:hidden"
              aria-expanded={open}
            >
              {open ? t('nav.close') : t('nav.menu')}
              <span className="relative block h-3 w-4">
                <span
                  className={clsx(
                    'absolute left-0 h-px w-4 bg-current transition-transform duration-500 ease-[cubic-bezier(0.83,0,0.17,1)]',
                    open ? 'top-1.5 rotate-45' : 'top-0.5',
                  )}
                />
                <span
                  className={clsx(
                    'absolute left-0 h-px w-4 bg-current transition-transform duration-500 ease-[cubic-bezier(0.83,0,0.17,1)]',
                    open ? 'top-1.5 -rotate-45' : 'top-2.5',
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.75, ease: expo }}
            className="fixed inset-0 z-40 bg-night text-paper"
          >
            <div className="gutter flex h-full flex-col justify-between pt-28 pb-12">
              <nav className="flex flex-col">
                {links.map((link, i) => (
                  <motion.div
                    key={link.to}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.7, ease: expo, delay: 0.12 + i * 0.05 }}
                    className="border-b border-paper/10"
                  >
                    <Link
                      to={link.to}
                      className="block py-4 font-display text-[clamp(1.5rem,5.5vw,2rem)] leading-tight"
                    >
                      {t(link.key)}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {collections.map((c) => (
                  <Link
                    key={c.id}
                    to={`/colectii/${c.id}`}
                    className="eyebrow text-paper/50 transition-colors hover:text-paper"
                  >
                    {collectionName(c.id)}
                  </Link>
                ))}
                <Link
                  to="/categorii"
                  className="eyebrow text-paper/50 transition-colors hover:text-paper"
                >
                  {t('nav.categories')}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
