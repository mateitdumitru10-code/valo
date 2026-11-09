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
  story,
  craftFrame,
} from '~/lib/catalog'
import { useI18n, type Key } from '~/lib/i18n'
import { locations, parentSite } from '~/lib/showrooms'
import { expo, viewport } from '~/lib/motion'

const CRAFT = [1, 2, 3, 4] as const

/**
 * The opening section's photographs, by where each sits: three pieces —
 * Colțar Aldo, Canapea Sonia, Pat Cubic — in their quieter colours, beige,
 * stone and one olive, plus the bed in black.
 */
const STORY_SLOTS = [
  'col-span-2 md:col-span-8',
  'col-span-1 md:col-span-3 md:col-start-10 md:mt-48',
  'col-span-1 md:col-span-4',
  'col-span-1 md:col-span-4 md:mt-24',
  'col-span-1 md:col-span-4',
]

/** The craft section's lead frame. The second is curated: see `craftFrame`. */
const CRAFT_IMAGE_A = 'coltar-sam'

/** The four pairs of hands a sectional passes through, in order. */
const HANDS = [1, 2, 3, 4] as const

export function Home() {
  const { t, lang } = useI18n()
  const craftA = bySlug(CRAFT_IMAGE_A) ?? featured[0]
  const craftPiece = (craftFrame && bySlug(craftFrame.piece)) ?? featured[1]
  // A sectional, so it is shown whole at its own 4:3 rather than cut tall.
  const craftB = { img: craftFrame?.img ?? craftPiece.cover, name: craftPiece.name }
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
      <section id="manifesto" className="gutter py-32 md:py-52">
        {/* The section's particulars, banded across the top rather than held
            in a column beside the statement. The statement is centred now and
            the three paragraphs under it alternate against both margins, so
            there is no longer a side of the page free to stand a column in. */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
          <Eyebrow index="01">{t('manifesto.eyebrow')}</Eyebrow>
          <p className="eyebrow opacity-45">
            <span className="tabular-nums">
              {pieces.length} {t('common.pieces')} · {collections.length}{' '}
              {t('common.collections')}
            </span>
            {' · '}
            {t('manifesto.origin')}
          </p>
        </div>
        <Rule className="mt-5" />

        {/* The claim, centred and on its own lines, with the promise under it.
            One display voice per section: this is the headline, and everything
            below it down to the closing pull is prose. */}
        <header className="mx-auto mt-20 max-w-3xl text-center md:mt-32">
          <h2 className="font-display text-[clamp(1.5rem,1.15rem+1.6vw,2.625rem)] leading-[1.2]">
            <RevealLines lines={splitToLines(t('manifesto.title'), 2)} />
          </h2>
          <Reveal delay={1}>
            <p className="mx-auto mt-8 max-w-lg text-[0.95rem] leading-relaxed opacity-65">
              {t('manifesto.lede')}
            </p>
          </Reveal>
        </header>

        {/* One statement, then the pieces it is about. */}
        <Reveal className="mx-auto mt-24 max-w-3xl text-center md:mt-36">
          <p className="font-display text-[clamp(1.25rem,1.05rem+0.9vw,1.75rem)] leading-[1.45] opacity-85">
            {t('manifesto.body')}
          </p>
        </Reveal>

        <div className="mt-20 grid grid-cols-2 gap-x-4 gap-y-12 md:mt-32 md:grid-cols-12 md:gap-x-6 md:gap-y-24">
          {story.map(({ img, piece }, i) => {
            const p = bySlug(piece)
            if (!p) return null
            // Studio frames are staged on a 4:3 white field and shown whole.
            const ratio = img.studio ? 'aspect-[4/3]' : 'aspect-[3/2]'
            const wide = STORY_SLOTS[i]?.startsWith('col-span-2')
            return (
              <Parallax
                key={img.src}
                distance={wide ? 30 : 55}
                className={STORY_SLOTS[i] ?? 'col-span-1 md:col-span-4'}
              >
                <Link to={`/produse/${p.slug}`} className="group block">
                  <RevealImage>
                    <Img
                      img={img}
                      alt={p.name}
                      zoom
                      sizes={wide ? '(max-width: 768px) 100vw, 62vw' : '(max-width: 768px) 50vw, 31vw'}
                      className={`${ratio} w-full`}
                    />
                  </RevealImage>
                  <p className="eyebrow mt-4 opacity-55 transition-opacity group-hover:opacity-100">
                    {p.name}
                  </p>
                </Link>
              </Parallax>
            )
          })}
        </div>

        {/* The claim above is a promise; these four are the only evidence the
            site can give for it without photographs of the bench.

            Set across rather than down, deliberately. Section 04 is already a
            numbered list of four making steps read top to bottom, and a second
            one here would have put the same device twice on one page. Read
            left to right the order is still legible, the hands land as one
            band instead of four rows, and the collections index below keeps
            its place on the first screen. */}
        <Reveal className="mt-16 border-t border-ink/12 pt-8 md:mt-24 md:pt-10">
          <p className="max-w-md text-sm leading-relaxed opacity-60">
            {t('manifesto.hands.lead')}
          </p>
        </Reveal>

        <ol className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 md:mt-14 md:grid-cols-4">
          {HANDS.map((n, i) => (
            <Reveal as="li" key={n} delay={i}>
              <span className="eyebrow block opacity-30 tabular-nums">
                {String(n).padStart(2, '0')}
              </span>
              <p className="eyebrow mt-4 opacity-55">{t(`manifesto.hand.${n}.role` as Key)}</p>
              <p className="mt-2 font-display text-[clamp(1.0625rem,0.95rem+0.5vw,1.25rem)] leading-[1.3]">
                {t(`manifesto.hand.${n}.act` as Key)}
              </p>
            </Reveal>
          ))}
        </ol>

        {/* What the three statements have been building to, and the only place
            on the page the brand states its own name as a sentence. Centred,
            above the reading size of everything around it, and given the width
            of the page to sit in: it is the section's last word and the hands
            and the quote above are the evidence it rests on. */}
        <div className="mx-auto mt-28 max-w-3xl text-center md:mt-44">
          <p className="font-display text-[clamp(1.375rem,1.05rem+1.5vw,2.375rem)] leading-[1.25]">
            <RevealLines lines={splitToLines(t('manifesto.pull'), 3)} />
          </p>
          <Reveal delay={2}>
            <p className="mt-10 font-display text-[clamp(1.125rem,1rem+0.6vw,1.4375rem)] opacity-55">
              {t('manifesto.close')}
            </p>
            <div className="mt-12 flex justify-center">
              <ArrowLink to="/colectii">{t('manifesto.link')}</ArrowLink>
            </div>
          </Reveal>
        </div>

      </section>

      {/* ------------------------------------------------- collections ---- */}
      <section className="gutter pb-28 md:pb-44">
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
      <section className="py-28 md:py-44">
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
                ratio="landscape"
                sizes="(max-width: 640px) 78vw, (max-width: 1024px) 46vw, 30vw"
              />
            ))}
          </Rail>
        </div>

        <div className="gutter mt-10">
          <ArrowLink to="/produse">{t('nav.pieces')}</ArrowLink>
        </div>
      </section>

      {/* ------------------------------------------------------- craft ---- */}
      <section className="gutter py-28 md:py-44">
        <div className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <Eyebrow index="04">{t('craft.eyebrow')}</Eyebrow>
            <h2 className="display-md mt-6 max-w-md">
              <RevealLines lines={[t('craft.title')]} />
            </h2>

            {/* The section used to go straight from the heading into the list.
                It reads as four service bullets that way; the two lines here
                are what make it a process, and they say what the list is a
                list of before the first number arrives. */}
            <Reveal delay={1}>
              <p className="mt-7 max-w-sm font-display text-lg leading-[1.4] opacity-80">
                {t('craft.lede')}
              </p>
              <p className="mt-4 max-w-sm text-sm leading-relaxed opacity-60">
                {t('craft.body')}
              </p>
            </Reveal>

            <ol className="mt-12">
              {CRAFT.map((n, i) => (
                <Reveal as="li" key={n} delay={i} className="border-t border-ink/12 py-6">
                  <div className="flex gap-6">
                    <span className="eyebrow w-8 shrink-0 opacity-35 tabular-nums">
                      {String(n).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="font-display text-xl">{t(`craft.${n}.title` as Key)}</h3>
                      {/* The step's claim, set above its explanation and in
                          the display face: each one is an aphorism the body
                          then argues for, and flattening the two into one
                          grey paragraph loses that turn. */}
                      <p className="mt-1.5 max-w-sm font-display text-[0.9375rem] leading-[1.4] opacity-75">
                        {t(`craft.${n}.tag` as Key)}
                      </p>
                      <p className="mt-3 max-w-sm text-sm leading-relaxed opacity-65">
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
                    img={craftB.img}
                    alt={craftB.name}
                    sizes="(max-width: 768px) 50vw, 28vw"
                    className="aspect-[4/3] w-full"
                  />
                </RevealImage>
              </Parallax>

              {/* The section's own closing line, not the landing pull it used
                  to borrow. That pull now closes section 01, and a line cannot
                  be the last word of two sections on the same page. */}
              <div className="col-span-1 mt-8 flex flex-col justify-end">
                <p className="font-display text-[clamp(1.125rem,1rem+0.6vw,1.375rem)] leading-[1.35]">
                  {t('craft.close')}
                </p>
                <Rule className="mt-6" />
                <p className="eyebrow mt-4 opacity-45">Samobi · Vadu Săpat</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- lineage ---- */}
      <section data-nav="invert" className="grain bg-night py-32 text-paper md:py-52">
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
              <span className="font-display text-xl tracking-[0.25em] text-paper/45">
                SAMOBI
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- showrooms ---- */}
      <section className="gutter py-28 md:py-44">
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
                <span className="col-span-12 font-display text-lg sm:col-span-3 md:text-xl">
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
