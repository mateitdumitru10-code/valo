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
 * Ranges the client has written a full description for. Listed rather than
 * probed for a missing key, because `t` falls back to Romanian and then to the
 * key itself — a range without the copy would otherwise print its own key on
 * the page instead of rendering nothing.
 */
const DESCRIBED = new Set(['aldo', 'cubic', 'soria', 'torro'])

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

  const described = DESCRIBED.has(range.id)
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
          <h1 className="display-lg">
            <RevealLines lines={[collectionName(range.id)]} />
          </h1>
        </header>
      </div>

      <section className="gutter grid gap-10 py-14 md:grid-cols-12 md:py-20">
        <div className="md:col-span-6">
          {/* Four ranges have a written description; the rest carry only the
              index blurb. Both are read from the same slot, so the page never
              has to explain which kind of range it is showing. */}
          <p className="font-display text-xl leading-[1.3]">
            {described
              ? t(`collection.pull.${range.id}` as Key)
              : t(`collection.lede.${range.id}` as Key)}
          </p>
          {described && (
            <div className="mt-6 max-w-prose space-y-4 text-sm leading-relaxed opacity-70">
              {t(`collection.body.${range.id}` as Key)
                .split('\n\n')
                .map((para) => (
                  <p key={para}>{para}</p>
                ))}
            </div>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 self-end md:col-span-5 md:col-start-8">
          <div>
            <dt className="eyebrow opacity-45">
              {t(range.count === 1 ? 'common.piece' : 'common.pieces')}
            </dt>
            <dd className="mt-1 font-display text-xl tabular-nums">{range.count}</dd>
          </div>
          {prices && (
            <div>
              <dt className="eyebrow opacity-45">{t('common.from')}</dt>
              <dd className="mt-1 font-display text-xl">{formatPrice(prices.min, lang)}</dd>
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
                className="font-display text-xl opacity-60 transition-opacity hover:opacity-100 md:text-2xl"
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
