import { Link, Navigate, useParams } from 'react-router-dom'
import { PieceCard } from '~/components/PieceCard'
import { RevealLines } from '~/components/Reveal'
import { ArrowLink, Eyebrow } from '~/components/UI'
import {
  category,
  collection,
  collectionName,
  collections,
  formatPrice,
  inCollection,
  priceRange,
} from '~/lib/catalog'
import { useI18n, type Key } from '~/lib/i18n'

/**
 * One range, whole. Every piece drawn from it stands here together — the
 * corner beside the bed beside the module — because that is the only place the
 * range is visible as a range rather than as five entries in five categories.
 */
export function CollectionPage() {
  const { id = '' } = useParams()
  const { t, lang } = useI18n()
  const range = collection(id)

  // /colectii/:id used to address the kinds of piece. Those moved to
  // /categorii, so send an old link on rather than bouncing it to the index.
  if (!range) {
    const moved = category(id)
    return <Navigate to={moved ? `/categorii/${moved.id}` : '/colectii'} replace />
  }

  const list = inCollection(range.id)
  const prices = priceRange(list)
  const others = collections.filter((c) => c.id !== range.id)
  const kinds = [...new Set(list.map((p) => p.category))]
    .map((kind) => category(kind))
    .filter(Boolean)

  return (
    <div className="pt-28 md:pt-36">
      <div className="gutter">
        <nav className="eyebrow flex items-center gap-3 opacity-45">
          <Link to="/colectii" className="hover:opacity-100">
            {t('nav.collections')}
          </Link>
          <span>/</span>
          <span>{collectionName(range.id)}</span>
        </nav>

        {/* The name alone. A range is sold on the name being worth carrying. */}
        <header className="mt-10">
          <h1 className="display-xl">
            <RevealLines lines={[collectionName(range.id)]} />
          </h1>
        </header>
      </div>

      <section className="gutter grid gap-10 py-14 md:grid-cols-12 md:py-20">
        <p className="md:col-span-6">
          <span className="font-display text-[clamp(1.35rem,2.4vw,2rem)] leading-[1.25]">
            {t(`collection.lede.${range.id}` as Key)}
          </span>
        </p>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 self-end md:col-span-5 md:col-start-8">
          <div>
            <dt className="eyebrow opacity-45">{t('common.pieces')}</dt>
            <dd className="mt-1 font-display text-2xl tabular-nums">{range.count}</dd>
          </div>
          {prices && (
            <div>
              <dt className="eyebrow opacity-45">{t('common.from')}</dt>
              <dd className="mt-1 font-display text-2xl">{formatPrice(prices.min, lang)}</dd>
            </div>
          )}
          <div className="col-span-2">
            <dt className="eyebrow opacity-45">{t('collection.across')}</dt>
            <dd className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
              {kinds.map((kind) => (
                <Link
                  key={kind!.id}
                  to={`/categorii/${kind!.id}`}
                  className="text-sm opacity-70 underline-offset-4 transition-opacity hover:underline hover:opacity-100"
                >
                  {lang === 'ro' ? kind!.ro : kind!.en}
                </Link>
              ))}
            </dd>
          </div>
        </dl>
      </section>

      {/* Largest piece first, as the manifest lists it: the one that shows the
          language the rest of the range is written in. */}
      <section className="gutter grid grid-cols-1 gap-x-6 gap-y-14 border-t border-ink/12 pt-14 pb-24 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((piece, i) => (
          <PieceCard
            key={piece.slug}
            piece={piece}
            index={i}
            ratio="landscape"
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
          />
        ))}
      </section>

      {list.length === 1 && (
        <p className="gutter -mt-16 pb-24 text-sm opacity-45">{t('collection.only')}</p>
      )}

      <section className="gutter border-t border-ink/12 py-16">
        <Eyebrow>{t('common.next')}</Eyebrow>
        <ul className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
          {others.map((c) => (
            <li key={c.id}>
              <Link
                to={`/colectii/${c.id}`}
                className="font-display text-2xl opacity-60 transition-opacity hover:opacity-100 md:text-3xl"
              >
                {collectionName(c.id)}
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
