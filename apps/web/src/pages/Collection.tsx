import { Link, Navigate, useParams } from 'react-router-dom'
import { Img } from '~/components/Img'
import { PieceCard } from '~/components/PieceCard'
import { RevealLines } from '~/components/Reveal'
import { ArrowLink, Eyebrow } from '~/components/UI'
import { collection, collections, formatPrice, inCollection, priceRange } from '~/lib/catalog'
import { useI18n, type Key } from '~/lib/i18n'

export function CollectionPage() {
  const { id = '' } = useParams()
  const { t, lang } = useI18n()
  const family = collection(id)

  if (!family) return <Navigate to="/colectii" replace />

  const list = inCollection(family.id)
  const range = priceRange(list)
  const others = collections.filter((c) => c.id !== family.id)

  return (
    <div>
      {/* Full-bleed cover; the nav inverts over it. */}
      {family.cover && (
        <header data-nav="invert" className="grain relative h-[68svh] min-h-[26rem] w-full">
          <Img
            img={family.cover}
            alt={lang === 'ro' ? family.ro : family.en}
            sizes="100vw"
            priority
            className="absolute inset-0 h-full w-full"
          />
          <div className="absolute inset-0 bg-night/45" aria-hidden />
          <div className="gutter absolute inset-x-0 bottom-0 pb-12 text-paper">
            <Eyebrow className="text-paper">{t('collections.eyebrow')}</Eyebrow>
            <h1 className="display-lg mt-4">
              <RevealLines lines={[lang === 'ro' ? family.ro : family.en]} />
            </h1>
          </div>
        </header>
      )}

      <section className="gutter grid gap-10 py-16 md:grid-cols-12 md:py-24">
        <p className="md:col-span-6 md:col-start-1">
          <span className="font-display text-[clamp(1.35rem,2.4vw,2rem)] leading-[1.25]">
            {t(`collection.lede.${family.id}` as Key)}
          </span>
        </p>
        <dl className="grid grid-cols-2 gap-6 self-end md:col-span-4 md:col-start-9">
          <div>
            <dt className="eyebrow opacity-45">{t('common.pieces')}</dt>
            <dd className="mt-1 font-display text-2xl tabular-nums">{family.count}</dd>
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
            ratio={i % 5 === 0 ? 'portrait' : 'landscape'}
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
                to={`/colectii/${c.id}`}
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
