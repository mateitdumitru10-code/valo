import { Link } from 'react-router-dom'
import { CollectionIndex } from '~/components/CollectionIndex'
import { Img } from '~/components/Img'
import { RevealImage, RevealLines, Reveal } from '~/components/Reveal'
import { Eyebrow } from '~/components/UI'
import { collections, inCollection, priceRange, formatPrice } from '~/lib/catalog'
import { useI18n, type Key } from '~/lib/i18n'

export function Collections() {
  const { t, lang } = useI18n()

  return (
    <div className="pt-32 md:pt-44">
      <header className="gutter">
        <Eyebrow index="—">{t('collections.eyebrow')}</Eyebrow>
        <h1 className="display-xl mt-8">
          <RevealLines lines={[lang === 'ro' ? 'Colecții' : 'Collections']} />
        </h1>
        <p className="mt-8 max-w-lg text-sm leading-relaxed opacity-65">
          {t('collections.lede')}
        </p>
      </header>

      <section className="gutter mt-20">
        <CollectionIndex />
      </section>

      <section className="gutter grid gap-x-8 gap-y-16 py-24 md:grid-cols-2 md:py-36">
        {collections.map((c, i) => {
          const list = inCollection(c.id)
          const range = priceRange(list)
          return (
            <Reveal key={c.id} delay={i % 2} className="group">
              <Link to={`/colectii/${c.id}`}>
                {c.cover && (
                  <RevealImage>
                    <Img
                      img={c.cover}
                      alt={lang === 'ro' ? c.ro : c.en}
                      sizes="(max-width: 768px) 92vw, 46vw"
                      className="aspect-[5/4] w-full"
                      zoom
                    />
                  </RevealImage>
                )}
                <div className="mt-5 flex items-baseline justify-between gap-6 border-t border-ink/12 pt-4">
                  <h2 className="font-display text-3xl md:text-4xl">
                    {lang === 'ro' ? c.ro : c.en}
                  </h2>
                  <span className="eyebrow opacity-45">
                    {c.count} {t('common.pieces')}
                  </span>
                </div>
                <p className="mt-3 max-w-md text-sm leading-relaxed opacity-60">
                  {t(`collection.lede.${c.id}` as Key)}
                </p>
                {range && (
                  <p className="eyebrow mt-4 opacity-40">
                    {t('common.from')} {formatPrice(range.min, lang)}
                  </p>
                )}
              </Link>
            </Reveal>
          )
        })}
      </section>
    </div>
  )
}
