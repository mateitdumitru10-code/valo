import { lazy, Suspense, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { RevealLines } from '~/components/Reveal'
import { ArrowLink, Eyebrow } from '~/components/UI'
import { useI18n } from '~/lib/i18n'
import { catalogues, type Catalogue } from '~/lib/catalogues'
import { expo, viewport } from '~/lib/motion'

// The viewer pulls in pdf.js; it loads when a catalogue is first opened.
const PdfViewer = lazy(() => import('~/components/PdfViewer').then((m) => ({ default: m.PdfViewer })))

/**
 * The HoReCa catalogues: covers in a row, each opening the PDF in an in-page
 * reader, with a download beside it for anyone who would rather keep a copy.
 */
export function Horeca() {
  const { t } = useI18n()
  const [open, setOpen] = useState<Catalogue | null>(null)

  return (
    <div className="pt-32 md:pt-44">
      <header className="gutter">
        <Eyebrow index="—">{t('horeca.eyebrow')}</Eyebrow>
        <h1 className="display-lg mt-8 max-w-4xl">
          <RevealLines lines={[t('horeca.title')]} />
        </h1>
        <p className="lede mt-10 max-w-xl opacity-70">{t('horeca.lede')}</p>
      </header>

      <section className="gutter mt-20 border-t border-ink/12 pt-14 pb-24 md:mt-28 md:pb-36">
        <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {catalogues.map((c, i) => (
            <motion.article
              key={c.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ duration: 0.9, ease: expo, delay: i * 0.08 }}
            >
              <button
                type="button"
                onClick={() => setOpen(c)}
                className="group block w-full text-left"
                aria-label={`${t('horeca.open')}: ${c.title} ${c.year}`}
              >
                <span className="relative block aspect-[3/4] overflow-hidden bg-mist">
                  <img
                    src={c.cover}
                    alt=""
                    width={c.w}
                    height={c.h}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035]"
                  />
                  <span className="eyebrow absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/70 to-transparent px-5 pb-4 pt-12 text-paper opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    {t('horeca.open')}
                  </span>
                </span>
                <span className="mt-5 flex items-baseline justify-between gap-4">
                  <span className="font-display text-[clamp(1.125rem,1rem+0.5vw,1.375rem)]">
                    {c.title}
                  </span>
                  <span className="eyebrow tabular-nums opacity-50">{c.year}</span>
                </span>
              </button>
              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1">
                <button
                  type="button"
                  onClick={() => setOpen(c)}
                  className="eyebrow inline-flex items-center gap-3 whitespace-nowrap py-2 transition-opacity hover:opacity-60"
                >
                  {t('horeca.open')}
                  <svg viewBox="0 0 20 8" className="h-2 w-5 overflow-visible" fill="none" stroke="currentColor" aria-hidden>
                    <path d="M0 4h18M14 0.5 18.5 4 14 7.5" />
                  </svg>
                </button>
                <a
                  href={c.pdf}
                  download
                  className="eyebrow whitespace-nowrap opacity-55 underline-offset-4 transition-opacity hover:underline hover:opacity-100"
                >
                  {t('horeca.download')}
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="gutter border-t border-ink/12 py-16 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <p className="max-w-xl font-display text-[clamp(1.25rem,1.05rem+0.9vw,1.75rem)] leading-[1.35]">
            {t('horeca.cta')}
          </p>
          <ArrowLink to="/contact">{t('nav.contact')}</ArrowLink>
        </div>
      </section>

      <AnimatePresence>
        {open && (
          <Suspense fallback={null}>
            <PdfViewer key={open.id} catalogue={open} onClose={() => setOpen(null)} />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  )
}
