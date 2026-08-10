import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import clsx from 'clsx'
import { PieceCard } from '~/components/PieceCard'
import { RevealLines } from '~/components/Reveal'
import { Eyebrow } from '~/components/UI'
import { collections, pieces, type CollectionId } from '~/lib/catalog'
import { useI18n } from '~/lib/i18n'
import { expo } from '~/lib/motion'

type Sort = 'featured' | 'price-asc' | 'price-desc'

export function Pieces() {
  const { t, lang } = useI18n()
  const [params, setParams] = useSearchParams()
  const active = params.get('c') as CollectionId | null
  const sort = (params.get('sort') as Sort) ?? 'featured'

  const list = useMemo(() => {
    const filtered = active ? pieces.filter((p) => p.collection === active) : pieces
    const sorted = [...filtered]
    if (sort === 'price-asc') sorted.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
    if (sort === 'price-desc') sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    return sorted
  }, [active, sort])

  const set = (key: string, value: string | null) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  return (
    <div className="pt-32 md:pt-44">
      <header className="gutter">
        <Eyebrow index="—">{t('nav.pieces')}</Eyebrow>
        <h1 className="display-xl mt-8">
          <RevealLines lines={[lang === 'ro' ? 'Toate piesele' : 'Every piece']} />
        </h1>
      </header>

      <div className="gutter sticky top-14 z-30 mt-14 bg-bone/85 py-4 backdrop-blur-md md:top-16">
        <div className="flex flex-wrap items-center justify-between gap-6 border-y border-ink/12 py-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <button
              type="button"
              onClick={() => set('c', null)}
              className={clsx(
                'eyebrow transition-opacity',
                !active ? 'opacity-100 underline underline-offset-4' : 'opacity-45 hover:opacity-80',
              )}
            >
              {t('common.all')}
            </button>
            {collections.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => set('c', c.id)}
                className={clsx(
                  'eyebrow transition-opacity',
                  active === c.id
                    ? 'opacity-100 underline underline-offset-4'
                    : 'opacity-45 hover:opacity-80',
                )}
              >
                {lang === 'ro' ? c.ro : c.en}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <span className="eyebrow opacity-35 tabular-nums">
              {String(list.length).padStart(2, '0')}
            </span>
            <select
              value={sort}
              onChange={(e) => set('sort', e.target.value === 'featured' ? null : e.target.value)}
              className="eyebrow cursor-pointer appearance-none bg-transparent pr-4 outline-none"
            >
              <option value="featured">{lang === 'ro' ? 'Recomandate' : 'Featured'}</option>
              <option value="price-asc">{lang === 'ro' ? 'Preț crescător' : 'Price ascending'}</option>
              <option value="price-desc">{lang === 'ro' ? 'Preț descrescător' : 'Price descending'}</option>
            </select>
          </div>
        </div>
      </div>

      <section className="gutter grid grid-cols-1 gap-x-6 gap-y-14 py-16 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((piece, i) => (
            <motion.div
              key={piece.slug}
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: expo, delay: Math.min(i, 8) * 0.03 }}
            >
              <PieceCard
                piece={piece}
                ratio="landscape"
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </section>
    </div>
  )
}
