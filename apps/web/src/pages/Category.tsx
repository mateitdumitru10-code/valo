import { Link, Navigate, useParams } from 'react-router-dom'
import { PieceCard } from '~/components/PieceCard'
import { RevealLines } from '~/components/Reveal'
import { ArrowLink, Eyebrow } from '~/components/UI'
import { categories, category, formatPrice, inCategory, priceRange } from '~/lib/catalog'
import { useI18n, type Key } from '~/lib/i18n'

export function CategoryPage() {
  const { id = '' } = useParams()
  const { t, lang } = useI18n()
  const kind = category(id)

  if (!kind) return <Navigate to="/categorii" replace />

  const list = inCategory(kind.id)
  const range = priceRange(list)
  const others = categories.filter((c) => c.id !== kind.id)

  return (
    <div className="pt-32 md:pt-44">
      {/* Type-led opening: the pieces below are the photography. */}
      <header className="gutter">
        <Eyebrow index="—">{t('categories.eyebrow')}</Eyebrow>
        <h1 className="display-xl mt-8">
          <RevealLines lines={[lang === 'ro' ? kind.ro : kind.en]} />
        </h1>
      </header>

      <section className="gutter grid gap-10 py-16 md:grid-cols-12 md:py-24">
        <p className="md:col-span-6 md:col-start-1">
          <span className="font-display text-[clamp(1.35rem,2.4vw,2rem)] leading-[1.25]">
            {t(`category.lede.${kind.id}` as Key)}
          </span>
        </p>
        <dl className="grid grid-cols-2 gap-6 self-end md:col-span-4 md:col-start-9">
          <div>
            <dt className="eyebrow opacity-45">{t('common.pieces')}</dt>
            <dd className="mt-1 font-display text-2xl tabular-nums">{kind.count}</dd>
          </div>
          {range && (
            <div>
              <dt className="eyebrow opacity-45">{t('common.from')}</dt>
              <dd className="mt-1 font-display text-2xl">{formatPrice(range.min, lang)}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="gutter grid grid-cols-1 gap-x-6 gap-y-14 pb-24 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((piece, i) => (
          <PieceCard
            key={piece.slug}
            piece={piece}
            index={i}
            // One ratio throughout. Breaking the rhythm with a portrait card
            // crops a studio frame on both sides, and its piece then reads as
            // larger than the identically-scaled pieces beside it.
            ratio="landscape"
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
          />
        ))}
      </section>

      <section className="gutter border-t border-ink/12 py-16">
        <Eyebrow>{t('common.next')}</Eyebrow>
        <ul className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
          {others.map((c) => (
            <li key={c.id}>
              <Link
                to={`/categorii/${c.id}`}
                className="font-display text-2xl opacity-60 transition-opacity hover:opacity-100 md:text-3xl"
              >
                {lang === 'ro' ? c.ro : c.en}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <ArrowLink to="/piese">{t('nav.pieces')}</ArrowLink>
        </div>
      </section>
    </div>
  )
}
