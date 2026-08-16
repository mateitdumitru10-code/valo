import { Link } from 'react-router-dom'
import { Index, type IndexItem } from '~/components/Index'
import { Img } from '~/components/Img'
import { RevealImage, RevealLines, Reveal } from '~/components/Reveal'
import { ArrowLink, Eyebrow } from '~/components/UI'
import { categories, inCategory, priceRange, formatPrice } from '~/lib/catalog'
import { useI18n, type Key } from '~/lib/i18n'

/** The whole catalogue by kind of piece. The ranges live at /colectii. */
export function Categories() {
  const { t, lang } = useI18n()

  const items: IndexItem[] = categories.map((c) => ({
    id: c.id,
    href: `/categorii/${c.id}`,
    label: lang === 'ro' ? c.ro : c.en,
    lede: t(`category.lede.${c.id}` as Key),
    count: c.count,
    cover: c.cover,
    from: priceRange(inCategory(c.id))?.min ?? null,
  }))

  return (
    <div className="pt-32 md:pt-44">
      <header className="gutter">
        <Eyebrow index="—">{t('categories.eyebrow')}</Eyebrow>
        <h1 className="display-lg mt-8">
          <RevealLines lines={[t('categories.title')]} />
        </h1>
        <p className="mt-8 max-w-lg text-sm leading-relaxed opacity-65">
          {t('categories.lede')}
        </p>
      </header>

      <section className="gutter mt-20">
        <Index items={items} />
      </section>

      <section className="gutter grid gap-x-8 gap-y-16 py-24 md:grid-cols-2 md:py-36">
        {categories.map((c, i) => {
          const range = priceRange(inCategory(c.id))
          return (
            <Reveal key={c.id} delay={i % 2} className="group">
              <Link to={`/categorii/${c.id}`}>
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
                    {c.count} {t(c.count === 1 ? 'common.piece' : 'common.pieces')}
                  </span>
                </div>
                <p className="mt-3 max-w-md text-sm leading-relaxed opacity-60">
                  {t(`category.lede.${c.id}` as Key)}
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

      <section className="gutter border-t border-ink/12 py-16">
        <Eyebrow>{t('nav.collections')}</Eyebrow>
        <p className="mt-6 max-w-md text-sm leading-relaxed opacity-60">
          {t('collections.lede')}
        </p>
        <div className="mt-8">
          <ArrowLink to="/colectii">{t('collections.title')}</ArrowLink>
        </div>
      </section>
    </div>
  )
}
