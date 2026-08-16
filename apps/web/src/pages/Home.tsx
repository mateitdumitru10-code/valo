import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { HeroFilm } from '~/components/HeroFilm'

import { Index, type IndexItem } from '~/components/Index'
import { PieceCard } from '~/components/PieceCard'
import { Rail } from '~/components/Rail'
import { Img } from '~/components/Img'
import { Reveal, RevealImage, RevealLines } from '~/components/Reveal'
import { Parallax } from '~/components/Parallax'
import { ArrowLink, Cta, Eyebrow, Rule } from '~/components/UI'
import { InquiryForm } from '~/components/InquiryForm'
import {
  bySlug,
  collectionName,
  collections,
  featured,
  inCollection,
  pieces,
  priceRange,
} from '~/lib/catalog'
import { useI18n, type Key } from '~/lib/i18n'
import { locations, parentSite } from '~/lib/showrooms'
import { expo, viewport } from '~/lib/motion'

const CRAFT = [1, 2, 3, 4] as const

/** Two pieces whose photography can hold a full-bleed frame. */
const CRAFT_IMAGE_A = 'coltar-sam'
const CRAFT_IMAGE_B = 'pat-matrimonial'

export function Home() {
  const { t, lang } = useI18n()
  const craftA = bySlug(CRAFT_IMAGE_A) ?? featured[0]
  const craftB = bySlug(CRAFT_IMAGE_B) ?? featured[1]
  const showrooms = locations.filter((l) => l.kind === 'showroom')

  // The landing index is the ranges, not the kinds of piece: a name is worth
  // more on a first visit than a noun the visitor already knows.
  const rangeIndex: IndexItem[] = collections.map((c) => ({
    id: c.id,
    href: `/colectii/${c.id}`,
    label: collectionName(c.id),
    lede: t(`collection.lede.${c.id}` as Key),
    count: c.count,
    cover: c.cover,
    from: priceRange(inCollection(c.id))?.min ?? null,
  }))

  return (
    <>
      <div data-nav="invert">
        <HeroFilm />
      </div>

      {/* ---------------------------------------------------------------- */}
      <section id="manifesto" className="gutter py-28 md:py-40">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Eyebrow index="01">{t('manifesto.eyebrow')}</Eyebrow>
          </div>
          <div className="md:col-span-8">
            <p className="max-w-3xl font-display text-[clamp(1.5rem,3.1vw,2.75rem)] leading-[1.18]">
              <RevealLines lines={splitToLines(t('manifesto.body'), 4)} />
            </p>
            <Reveal delay={1} className="mt-10 flex flex-wrap items-center gap-8">
              <ArrowLink to="/atelier">{t('manifesto.link')}</ArrowLink>
              <p className="eyebrow opacity-45">
                {pieces.length} {t('common.pieces')}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- collections ---- */}
      <section className="gutter pb-24 md:pb-36">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow index="02">{t('collections.eyebrow')}</Eyebrow>
            <h2 className="display-lg mt-6 max-w-2xl">
              <RevealLines lines={[t('collections.title')]} />
            </h2>
          </div>
          <p className="max-w-sm text-sm opacity-60">{t('collections.lede')}</p>
        </div>

        <Index items={rangeIndex} />
      </section>

      {/* ---------------------------------------------------- featured ---- */}
      <section className="py-24 md:py-36">
        <div className="gutter mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow index="03">{t('featured.eyebrow')}</Eyebrow>
            <h2 className="display-lg mt-6">
              <RevealLines lines={[t('featured.title')]} />
            </h2>
          </div>
          <p className="eyebrow opacity-40">{t('featured.drag')}</p>
        </div>

        <div className="pl-[var(--spacing-gutter)]">
          <Rail itemClassName="w-[78vw] sm:w-[46vw] lg:w-[30vw]">
            {featured.map((piece, i) => (
              <PieceCard
                key={piece.slug}
                piece={piece}
                index={i}
                ratio="portrait"
                sizes="(max-width: 640px) 78vw, (max-width: 1024px) 46vw, 30vw"
              />
            ))}
          </Rail>
        </div>

        <div className="gutter mt-10">
          <ArrowLink to="/piese">{t('nav.pieces')}</ArrowLink>
        </div>
      </section>

      {/* ------------------------------------------------------- craft ---- */}
      <section className="gutter py-24 md:py-36">
        <div className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <Eyebrow index="04">{t('craft.eyebrow')}</Eyebrow>
            <h2 className="display-md mt-6 max-w-md">
              <RevealLines lines={[t('craft.title')]} />
            </h2>

            <ol className="mt-12">
              {CRAFT.map((n, i) => (
                <Reveal as="li" key={n} delay={i} className="border-t border-ink/12 py-6">
                  <div className="flex gap-6">
                    <span className="eyebrow w-8 shrink-0 opacity-35 tabular-nums">
                      {String(n).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="font-display text-2xl">{t(`craft.${n}.title` as Key)}</h3>
                      <p className="mt-2 max-w-sm text-sm leading-relaxed opacity-65">
                        {t(`craft.${n}.body` as Key)}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>

          <div className="md:col-span-7">
            <div className="grid grid-cols-2 gap-6">
              <Parallax distance={40} className="col-span-2">
                <RevealImage>
                  <Img
                    img={craftA.cover}
                    alt={craftA.name}
                    sizes="(max-width: 768px) 100vw, 55vw"
                    className="aspect-[16/10] w-full"
                  />
                </RevealImage>
              </Parallax>

              <Parallax distance={70} className="col-span-1 mt-8">
                <RevealImage>
                  <Img
                    img={craftB.cover}
                    alt={craftB.name}
                    sizes="(max-width: 768px) 50vw, 28vw"
                    className="aspect-[3/4] w-full"
                  />
                </RevealImage>
              </Parallax>

              <div className="col-span-1 mt-8 flex flex-col justify-end">
                <p className="font-display text-[clamp(1.25rem,1.9vw,1.85rem)] leading-[1.25]">
                  {t('manifesto.pull')}
                </p>
                <Rule className="mt-6" />
                <p className="eyebrow mt-4 opacity-45">Samobi · Vadu Săpat</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- lineage ---- */}
      <section data-nav="invert" className="grain bg-night py-28 text-paper md:py-40">
        <div className="gutter grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <Eyebrow index="05" className="text-paper">
              {t('lineage.eyebrow')}
            </Eyebrow>
            <h2 className="display-md mt-6">
              <RevealLines lines={splitToLines(t('lineage.title'), 2)} />
            </h2>
          </div>

          <div className="md:col-span-6 md:col-start-7">
            <Reveal>
              <p className="max-w-xl text-base leading-relaxed text-paper/75">
                {t('lineage.body')}
              </p>
            </Reveal>

            <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3">
              {[1, 2, 3].map((n, i) => (
                <Reveal key={n} delay={i}>
                  <dt className="eyebrow text-paper/45">{t(`lineage.stat.${n}` as Key)}</dt>
                  <dd className="mt-2 font-display text-xl">
                    {t(`lineage.stat.${n}.value` as Key)}
                  </dd>
                </Reveal>
              ))}
            </dl>

            <div className="mt-12 flex flex-wrap items-center gap-8">
              <Cta tone="paper" href={parentSite}>
                {t('lineage.link')}
              </Cta>
              <span className="font-display text-2xl tracking-[0.22em] text-paper/45">
                SAMOBI
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- showrooms ---- */}
      <section className="gutter py-24 md:py-36">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow index="06">{t('showrooms.eyebrow')}</Eyebrow>
            <h2 className="display-lg mt-6">
              <RevealLines lines={[t('showrooms.title')]} />
            </h2>
          </div>
          <p className="max-w-sm text-sm opacity-60">{t('showrooms.lede')}</p>
        </div>

        <ul className="border-t border-ink/12">
          {showrooms.map((l, i) => (
            <motion.li
              key={l.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ duration: 0.7, ease: expo, delay: i * 0.04 }}
              className="border-b border-ink/12"
            >
              <a
                href={l.map}
                target="_blank"
                rel="noreferrer"
                className="group grid grid-cols-12 items-baseline gap-4 py-5"
              >
                <span className="col-span-12 font-display text-xl sm:col-span-3 md:text-2xl">
                  {l.city}
                </span>
                <span className="col-span-6 text-sm opacity-70 sm:col-span-3">{l.name}</span>
                <span className="col-span-12 text-sm opacity-50 sm:col-span-4">{l.address}</span>
                <span className="col-span-6 text-right text-sm tabular-nums opacity-70 sm:col-span-2">
                  {l.phone}
                </span>
              </a>
            </motion.li>
          ))}
        </ul>

        <div className="mt-10">
          <ArrowLink to="/showroom-uri">{t('nav.showrooms')}</ArrowLink>
        </div>
      </section>

      {/* ----------------------------------------------------- contact ---- */}
      <section className="gutter pb-28 md:pb-40">
        <div className="grid gap-14 border-t border-ink/12 pt-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <Eyebrow index="07">{t('contact.eyebrow')}</Eyebrow>
            <h2 className="display-md mt-6 max-w-md">
              <RevealLines lines={splitToLines(t('contact.title'), 2)} />
            </h2>
            <p className="mt-6 max-w-sm text-sm leading-relaxed opacity-65">
              {t('contact.lede')}
            </p>
            <Link
              to="/colectii"
              className="eyebrow mt-10 inline-block opacity-45 hover:opacity-100"
            >
              {lang === 'ro' ? 'sau răsfoiește colecțiile' : 'or browse the collections'}
            </Link>
          </div>

          <div className="md:col-span-6 md:col-start-7">
            <InquiryForm />
          </div>
        </div>
      </section>
    </>
  )
}

/** Split a paragraph into roughly equal lines for the masked line reveal. */
function splitToLines(text: string, count: number) {
  const words = text.split(' ')
  const per = Math.ceil(words.length / count)
  return Array.from({ length: count }, (_, i) =>
    words.slice(i * per, (i + 1) * per).join(' '),
  ).filter(Boolean)
}
