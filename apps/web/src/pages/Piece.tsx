import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import clsx from 'clsx'
import { Img } from '~/components/Img'
import { SizePicker } from '~/components/SizePicker'
import { TextilePicker } from '~/components/TextilePicker'
import { Schematic } from '~/components/Schematic'
import { PieceCard } from '~/components/PieceCard'
import { RevealImage, RevealLines, Reveal } from '~/components/Reveal'
import { InquiryForm } from '~/components/InquiryForm'
import { ArrowLink, Eyebrow, Rule } from '~/components/UI'
import {
  bySlug,
  category,
  collection,
  collectionName,
  formatPrice,
  loadPiece,
  related,
  type Img as Photo,
  type PieceDetail,
  type View,
} from '~/lib/catalog'
import { useI18n } from '~/lib/i18n'

/** Pieces whose address changed, so old links still land on them. */
const RENAMED: Record<string, string> = {
  'canapea-cubiq': 'canapea-cubic',
  'modul-cubiq': 'modul-cubic',
}

/** One slot in the gallery: a photograph, and what it shows when it is a named view. */
type Frame = { view: View | null; img: Photo }

export function PiecePage() {
  const { slug = '' } = useParams()
  const { t, lang } = useI18n()
  const piece = bySlug(slug)
  const [textile, setTextile] = useState(0)
  const [option, setOption] = useState(0)
  // Prose, gallery, drawing and textiles live outside the bundle and arrive
  // here. The cover comes from the index, so the page has an image to show
  // from the first frame.
  const [detail, setDetail] = useState<PieceDetail | null>(null)

  useEffect(() => {
    let live = true
    setDetail(null)
    setTextile(0)
    setOption(0)
    loadPiece(slug).then((data) => {
      if (live) setDetail(data)
    })
    return () => {
      live = false
    }
  }, [slug])

  if (!piece) {
    const renamed = slug ? RENAMED[slug] : undefined
    return <Navigate to={renamed ? `/produse/${renamed}` : '/produse'} replace />
  }

  const kind = category(piece.category)
  const range = collection(piece.collection)

  // With textiles, the lead image is whichever one is selected, and the
  // remaining textile shots leave the gallery — they are the picker's job now.
  const images = detail?.images?.length ? detail.images : [piece.cover]
  const variants = detail?.variants ?? []
  const variantSrcs = new Set(variants.map((v) => v.src))
  const selected = variants[Math.min(textile, variants.length - 1)]
  // What the piece is offered in — a mattress width, an overall dimension, a
  // choice of mattress. The first option stands as the default, and since the
  // list is written cheapest first that is the figure the card promised.
  const options = detail?.options
  const items = options?.items ?? []
  const chosen = Math.min(option, Math.max(items.length - 1, 0))
  // The picker moves the price — but only where the client's list gives one per
  // option. A bed it does not cover has known widths and one price, and the
  // note under the figure must not claim the width chose it.
  const priced = items.some((item) => typeof item.price === 'number')
  const price = formatPrice(items[chosen]?.price ?? piece.price, lang)
  const cover = (selected && images.find((img) => img.src === selected.src)) ?? images[0]
  // The other views of the piece — the angle, the side, the sofa opened out,
  // the storage box lifted. They are the atelier's record of the model, not the
  // visitor's configuration, so the set never moves: the lead image is the only
  // photograph the picker touches. Nothing here reads `selected`, deliberately.
  const bySrc = new Map(images.map((img) => [img.src, img]))
  const frames: Frame[] = detail?.views?.length
    ? detail.views.flatMap((view) => {
        const img = bySrc.get(view.src)
        return img ? [{ view, img }] : []
      })
    : images
        .filter((img) => img.src !== images[0].src && !variantSrcs.has(img.src))
        .map((img) => ({ view: null, img }))

  // Each view exists in the one colour it was shot in. Where they share it —
  // true of every model but Pat Cubic — the colour is credited once, at the
  // head of the section, rather than repeated under each frame like an excuse.
  const toneOf = (src?: string) =>
    src ? variants.find((variant) => variant.src === src)?.tone[lang] : undefined
  const tones = frames.map((frame) => toneOf(frame.view?.in))
  const oneTone = tones.length > 0 && tones.every((tone) => tone && tone === tones[0])
  const solo = frames.length === 1
  const siblings = related(piece)
  const figures = detail?.figures ?? []
  const sheet = detail?.specs ?? []
  const paragraphs = (detail?.body ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  return (
    <div className="pt-28 md:pt-36">
      <div className="gutter">
        <nav className="eyebrow flex items-center gap-3 opacity-45">
          <Link to="/produse" className="hover:opacity-100">
            {t('nav.pieces')}
          </Link>
          <span>/</span>
          <Link to={`/categorii/${piece.category}`} className="hover:opacity-100">
            {kind ? (lang === 'ro' ? kind.ro : kind.en) : ''}
          </Link>
        </nav>

        {/* A title page: the name alone on its line, at full width. It used to
            share the row with the price, which held it to eight columns and
            made the two compete. The price is a specification, so it now sits
            with the rest of them. */}
        <header className="mt-8">
          {/* Only where there is a collection to name. Most of the catalogue
              belongs to none, and a generic "Piesă" standing where other pages
              say "Colecția Aldo" reads as a field nobody filled in. */}
          {range && (
            <Link to={`/colectii/${range.id}`} className="eyebrow opacity-45 hover:opacity-100">
              {t('piece.collectionOf')} {collectionName(range.id)}
            </Link>
          )}
          <h1 className="display-md mt-4">
            <RevealLines lines={[piece.name]} />
          </h1>
          <Rule className="mt-8" />
        </header>
      </div>

      {/* ---------------------------------------------------------- media -- */}
      <section className="gutter mt-14 grid gap-6 md:grid-cols-12">
        <div className="md:col-span-8">
          <RevealImage>
            {/* Textile changes cross-dissolve; the frame itself never moves. */}
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <AnimatePresence initial={false}>
                <motion.div
                  key={cover.src}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55, ease: 'easeInOut' }}
                >
                  <Img
                    img={cover}
                    alt={
                      selected ? `${piece.name} — ${selected.tone[lang]}` : piece.name
                    }
                    sizes="(max-width: 768px) 100vw, 64vw"
                    priority
                    className="h-full w-full"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </RevealImage>

        </div>

        {/* -------------------------------------------------------- spec -- */}
        <aside className="md:col-span-4">
          <div className="md:sticky md:top-28">
            {variants.length > 1 && (
              <div className="mb-12">
                <TextilePicker
                  variants={variants}
                  active={Math.min(textile, variants.length - 1)}
                  onSelect={setTextile}
                />
              </div>
            )}

            {options && items.length > 1 && (
              <div className="mb-12">
                <SizePicker options={options} active={chosen} onSelect={setOption} />
              </div>
            )}

            <Eyebrow>{t('piece.spec')}</Eyebrow>
            <Rule className="mt-4" />

            <dl className="text-sm">
              {price && (
                <div className="border-b border-ink/10 py-4">
                  <dt className="eyebrow opacity-45">{t('piece.price')}</dt>
                  <dd className="mt-2 font-display text-xl">{price}</dd>
                  <p className="mt-1 text-xs opacity-45">
                    {t(priced && items.length > 1 ? 'piece.priceNoteOption' : 'piece.priceNote')}
                  </p>
                </div>
              )}
              {/* The client's technical sheet gives its figures in cm and never
                  a total height, so where it exists it replaces the scraped
                  w × d × h row rather than sitting beside it. */}
              {figures.length > 0 && (
                <div className="border-b border-ink/10 py-4">
                  <dt className="eyebrow opacity-45">{t('piece.dimensions')}</dt>
                  <dd className="mt-2 space-y-1.5">
                    {figures.map((figure) => (
                      <p key={figure.ro} className="flex items-baseline justify-between gap-4">
                        <span className="opacity-60">{lang === 'ro' ? figure.ro : figure.en}</span>
                        <span className="tabular-nums whitespace-nowrap">{figure.value}</span>
                      </p>
                    ))}
                    {detail?.figuresNote && (
                      <p className="pt-1 text-xs opacity-45">
                        {lang === 'ro' ? detail.figuresNote.ro : detail.figuresNote.en}
                      </p>
                    )}
                  </dd>
                </div>
              )}
              {figures.length === 0 && (detail?.dimensions?.length ?? 0) > 0 && (
                <div className="border-b border-ink/10 py-4">
                  <dt className="eyebrow opacity-45">{t('piece.dimensions')}</dt>
                  <dd className="mt-2 space-y-1 tabular-nums">
                    {detail?.dimensions.map((d) => (
                      <p key={`${d.w}-${d.d}-${d.h}`}>
                        {d.w} × {d.d} × {d.h} mm
                      </p>
                    ))}
                    <p className="mt-1 text-xs opacity-45">{t('piece.dimensionsNote')}</p>
                  </dd>
                </div>
              )}

              {range && (
                <div className="border-b border-ink/10 py-4">
                  <dt className="eyebrow opacity-45">{t('piece.collection')}</dt>
                  <dd className="mt-2">
                    <Link to={`/colectii/${range.id}`} className="underline underline-offset-4">
                      {collectionName(range.id)}
                    </Link>
                  </dd>
                </div>
              )}

              <div className="border-b border-ink/10 py-4">
                <dt className="eyebrow opacity-45">{t('piece.category')}</dt>
                <dd className="mt-2">
                  <Link to={`/categorii/${piece.category}`} className="underline underline-offset-4">
                    {kind ? (lang === 'ro' ? kind.ro : kind.en) : ''}
                  </Link>
                </dd>
              </div>

              <div className="border-b border-ink/10 py-4">
                <dt className="eyebrow opacity-45">{t('piece.origin')}</dt>
                <dd className="mt-2">{t('piece.originValue')}</dd>
              </div>

              <div className="border-b border-ink/10 py-4">
                <dt className="eyebrow opacity-45">{t('piece.warranty')}</dt>
                <dd className="mt-2">{t('piece.warrantyValue')}</dd>
              </div>

              <div className="border-b border-ink/10 py-4">
                <dt className="eyebrow opacity-45">{t('piece.code')}</dt>
                <dd className="mt-2 tabular-nums opacity-70">{piece.slug}</dd>
              </div>
            </dl>

            <div className="mt-8">
              <ArrowLink
                to={`/contact?piece=${encodeURIComponent(piece.name)}${
                  items.length > 1
                    ? `&${options?.kind === 'size' ? 'size' : 'option'}=${encodeURIComponent(lang === 'ro' ? items[chosen].ro : items[chosen].en)}`
                    : ''
                }`}
              >
                {t('common.enquire')}
              </ArrowLink>
            </div>
          </div>
        </aside>
      </section>

      {/* ------------------------------------------------------ in detail -- */}
      {frames.length > 0 && (
        <section className="gutter mt-16 border-t border-ink/12 pt-14 md:mt-24 md:pt-20">
          {/* Above the rule is the piece as you would order it. Below it, the
              record of the model — photographed once, in one cloth. */}
          <div className="flex items-baseline justify-between gap-4">
            <Eyebrow>{frames[0].view ? t('piece.detail') : t('piece.gallery')}</Eyebrow>
            {frames[0].view && (
              <p className="eyebrow tabular-nums opacity-35">
                {oneTone
                  ? `${t('piece.shotIn')} ${tones[0]}`
                  : `${String(frames.length).padStart(2, '0')} ${t('piece.views')}`}
              </p>
            )}
          </div>

          <div
            className={clsx(
              'mt-10 grid gap-10 sm:gap-6',
              solo ? 'md:grid-cols-12' : 'grid-cols-1 sm:grid-cols-2',
            )}
          >
            {frames.map(({ view, img }, i) => {
              const label = view ? (lang === 'ro' ? view.ro : view.en) : null
              // Credited per frame only where the section cannot credit them all
              // at once — Pat Cubic, whose details exist in two cloths.
              const tone = oneTone ? undefined : tones[i]
              const wide = !solo && i === 0 && frames.length % 2 === 1
              return (
                <figure
                  key={img.src}
                  className={clsx(
                    solo && 'md:col-span-8 md:col-start-3',
                    wide && 'sm:col-span-2',
                  )}
                >
                  <RevealImage>
                    <Img
                      img={img}
                      alt={[piece.name, label ?? `${i + 2}`, tone].filter(Boolean).join(' — ')}
                      sizes={
                        solo
                          ? '(max-width: 768px) 100vw, 62vw'
                          : wide
                            ? '(max-width: 640px) 100vw, 92vw'
                            : '(max-width: 640px) 100vw, 46vw'
                      }
                      className="aspect-[4/3] w-full"
                    />
                  </RevealImage>
                  {label && (
                    <figcaption className="eyebrow mt-3">
                      <span className="opacity-60">{label}</span>
                      {tone && (
                        <>
                          <span className="mx-2 opacity-30">·</span>
                          <span className="opacity-40">{tone}</span>
                        </>
                      )}
                    </figcaption>
                  )}
                </figure>
              )
            })}
          </div>
        </section>
      )}

      {/* ---------------------------------------------------- description -- */}
      {paragraphs.length > 0 && (
        <section className="gutter grid gap-8 py-20 md:grid-cols-12 md:py-28">
          <div className="md:col-span-4">
            <Eyebrow>{t('piece.description')}</Eyebrow>
            {lang === 'en' && <p className="mt-3 text-xs opacity-45">{t('piece.roNote')}</p>}
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <Reveal>
              <p className="font-display text-[clamp(1.1875rem,1.05rem+0.7vw,1.5rem)] leading-[1.35]">
                {detail?.lead || paragraphs[0]}
              </p>
            </Reveal>
            <div className="mt-8 space-y-4 text-sm leading-relaxed opacity-70">
              {paragraphs.slice(1, 8).map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------- the sheet -- */}
      {sheet.length > 0 && (
        <section className="gutter grid gap-8 border-t border-ink/12 py-20 md:grid-cols-12 md:py-28">
          <div className="md:col-span-4">
            <Eyebrow>{t('piece.build')}</Eyebrow>
            <p className="mt-3 max-w-xs text-xs leading-relaxed opacity-45">{t('piece.buildNote')}</p>
          </div>
          <div className="space-y-12 md:col-span-7 md:col-start-6">
            {sheet.map((group) => (
              <Reveal key={group.title.ro}>
                <h3 className="eyebrow opacity-60">{lang === 'ro' ? group.title.ro : group.title.en}</h3>
                <dl className="mt-4 border-t border-ink/12 text-sm">
                  {group.rows.map((row) => (
                    <div
                      key={row.label.ro}
                      className="grid gap-1 border-b border-ink/10 py-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,5fr)] sm:gap-6"
                    >
                      <dt className="opacity-45">{lang === 'ro' ? row.label.ro : row.label.en}</dt>
                      <dd className="leading-relaxed">{lang === 'ro' ? row.value.ro : row.value.en}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------- plan -- */}
      {detail?.schematic && <Schematic drawing={detail.schematic} name={piece.name} />}

      {/* -------------------------------------------------------- related -- */}
      {siblings.length > 0 && (
        <section className="gutter border-t border-ink/12 py-16">
          <Eyebrow>{t(range ? 'piece.related' : 'piece.relatedCategory')}</Eyebrow>
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {siblings.map((sibling) => (
              <PieceCard
                key={sibling.slug}
                piece={sibling}
                sizes="(max-width: 640px) 46vw, 24vw"
              />
            ))}
          </div>
        </section>
      )}

      {/* -------------------------------------------------------- enquire -- */}
      <section className="gutter border-t border-ink/12 py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <h2 className="display-md max-w-xs">{t('contact.title')}</h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed opacity-65">{t('contact.lede')}</p>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <InquiryForm defaultPiece={piece.name} />
          </div>
        </div>
      </section>
    </div>
  )
}
