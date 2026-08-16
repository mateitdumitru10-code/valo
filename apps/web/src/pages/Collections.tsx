import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { Index, type IndexItem } from '~/components/Index'
import { Img } from '~/components/Img'
import { RevealImage, RevealLines, Reveal } from '~/components/Reveal'
import { ArrowLink, Eyebrow } from '~/components/UI'
import {
  category,
  collectionName,
  collections,
  formatPrice,
  inCollection,
  priceRange,
} from '~/lib/catalog'
import { useI18n, type Key } from '~/lib/i18n'

/**
 * The ranges. Set as full-width bands rather than as a grid of cards: a range
 * is a claim about a whole room, and a card the size of a product tile makes it
 * read as one more product.
 */
export function Collections() {
  const { t, lang } = useI18n()

  const items: IndexItem[] = collections.map((c) => ({
    id: c.id,
    href: `/colectii/${c.id}`,
    label: collectionName(c.id),
    lede: t(`collection.lede.${c.id}` as Key),
    count: c.count,
    cover: c.cover,
    from: priceRange(inCollection(c.id))?.min ?? null,
  }))

  return (
    <div className="pt-32 md:pt-44">
      <header className="gutter">
        <Eyebrow index="—">{t('collections.eyebrow')}</Eyebrow>
        <h1 className="display-lg mt-8">
          <RevealLines lines={[t('collections.title')]} />
        </h1>
        <p className="mt-8 max-w-lg text-sm leading-relaxed opacity-65">
          {t('collections.lede')}
        </p>
      </header>

      <section className="gutter mt-20">
        <Index items={items} />
      </section>

      <section className="pt-24 md:pt-36">
        {collections.map((c, i) => {
          const list = inCollection(c.id)
          const range = priceRange(list)
          // What the range spans, said once and in the catalogue's own words.
          const kinds = [...new Set(list.map((p) => p.category))]
            .map((id) => category(id))
            .filter(Boolean)
            .map((k) => (lang === 'ro' ? k!.ro : k!.en))

          return (
            <Reveal key={c.id}>
              <Link
                to={`/colectii/${c.id}`}
                className="group gutter grid items-end gap-8 border-t border-ink/12 py-14 md:grid-cols-12 md:py-20"
              >
                <div
                  className={clsx(
                    'md:col-span-5',
                    // Alternating side keeps a long index from marching.
                    i % 2 === 1 && 'md:order-2 md:col-start-8',
                  )}
                >
                  {c.cover && (
                    <RevealImage>
                      <Img
                        img={c.cover}
                        alt={collectionName(c.id)}
                        sizes="(max-width: 768px) 92vw, 40vw"
                        className="aspect-[5/4] w-full"
                        zoom
                      />
                    </RevealImage>
                  )}
                </div>

                <div className={clsx('md:col-span-6', i % 2 === 1 ? 'md:col-start-1' : 'md:col-start-7')}>
                  <span className="eyebrow opacity-35 tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h2 className="display-lg mt-3">{collectionName(c.id)}</h2>
                  <p className="mt-5 max-w-md text-sm leading-relaxed opacity-65">
                    {t(`collection.lede.${c.id}` as Key)}
                  </p>

                  <dl className="mt-8 flex flex-wrap items-baseline gap-x-10 gap-y-3 border-t border-ink/12 pt-4">
                    <div className="flex items-baseline gap-2">
                      <dt className="eyebrow opacity-40">
                        {t(c.count === 1 ? 'common.piece' : 'common.pieces')}
                      </dt>
                      <dd className="eyebrow tabular-nums">{String(c.count).padStart(2, '0')}</dd>
                    </div>
                    {range && (
                      <div className="flex items-baseline gap-2">
                        <dt className="eyebrow opacity-40">{t('common.from')}</dt>
                        <dd className="eyebrow tabular-nums">{formatPrice(range.min, lang)}</dd>
                      </div>
                    )}
                    <div className="flex items-baseline gap-2">
                      <dt className="eyebrow opacity-40">{t('collection.across')}</dt>
                      <dd className="eyebrow">{kinds.join(' · ')}</dd>
                    </div>
                  </dl>
                </div>
              </Link>
            </Reveal>
          )
        })}
      </section>

      <section className="gutter border-t border-ink/12 py-16">
        <Eyebrow>{t('nav.categories')}</Eyebrow>
        <p className="mt-6 max-w-md text-sm leading-relaxed opacity-60">
          {t('categories.lede')}
        </p>
        <div className="mt-8">
          <ArrowLink to="/categorii">{t('categories.title')}</ArrowLink>
        </div>
      </section>
    </div>
  )
}
