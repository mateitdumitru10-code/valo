import { Link, Navigate, useParams } from 'react-router-dom'
import { Img } from '~/components/Img'
import { PieceCard } from '~/components/PieceCard'
import { RevealImage, RevealLines, Reveal } from '~/components/Reveal'
import { InquiryForm } from '~/components/InquiryForm'
import { ArrowLink, Eyebrow, Rule } from '~/components/UI'
import { bySlug, collection, formatPrice, related } from '~/lib/catalog'
import { useI18n } from '~/lib/i18n'

export function PiecePage() {
  const { slug = '' } = useParams()
  const { t, lang } = useI18n()
  const piece = bySlug(slug)

  if (!piece) return <Navigate to="/piese" replace />

  const family = collection(piece.collection)
  const price = formatPrice(piece.price, lang)
  const [cover, ...gallery] = piece.images
  const siblings = related(piece)
  const paragraphs = piece.body
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  return (
    <div className="pt-28 md:pt-36">
      <div className="gutter">
        <nav className="eyebrow flex items-center gap-3 opacity-45">
          <Link to="/piese" className="hover:opacity-100">
            {t('nav.pieces')}
          </Link>
          <span>/</span>
          <Link to={`/colectii/${piece.collection}`} className="hover:opacity-100">
            {family ? (lang === 'ro' ? family.ro : family.en) : ''}
          </Link>
        </nav>

        <header className="mt-8 grid gap-8 md:grid-cols-12">
          <h1 className="display-lg md:col-span-8">
            <RevealLines lines={[piece.name]} />
          </h1>
          <div className="self-end md:col-span-4 md:text-right">
            {price && <p className="font-display text-3xl">{price}</p>}
            <p className="eyebrow mt-2 opacity-45">{t('piece.priceNote')}</p>
          </div>
        </header>
      </div>

      {/* ---------------------------------------------------------- media -- */}
      <section className="gutter mt-14 grid gap-6 md:grid-cols-12">
        <div className="md:col-span-8">
          <RevealImage>
            <Img
              img={cover}
              alt={piece.name}
              sizes="(max-width: 768px) 100vw, 64vw"
              priority
              className="aspect-[4/3] w-full"
            />
          </RevealImage>

          {gallery.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-6">
              {gallery.map((img, i) => (
                <RevealImage key={img.src} className={i === 0 && gallery.length % 2 === 1 ? 'col-span-2' : ''}>
                  <Img
                    img={img}
                    alt={`${piece.name} — ${i + 2}`}
                    sizes="(max-width: 768px) 46vw, 32vw"
                    className="aspect-[4/3] w-full"
                  />
                </RevealImage>
              ))}
            </div>
          )}
        </div>

        {/* -------------------------------------------------------- spec -- */}
        <aside className="md:col-span-4">
          <div className="md:sticky md:top-28">
            <Eyebrow>{t('piece.spec')}</Eyebrow>
            <Rule className="mt-4" />

            <dl className="text-sm">
              {piece.dimensions.length > 0 && (
                <div className="border-b border-ink/10 py-4">
                  <dt className="eyebrow opacity-45">{t('piece.dimensions')}</dt>
                  <dd className="mt-2 space-y-1 tabular-nums">
                    {piece.dimensions.map((d) => (
                      <p key={`${d.w}-${d.d}-${d.h}`}>
                        {d.w} × {d.d} × {d.h} mm
                      </p>
                    ))}
                    <p className="mt-1 text-xs opacity-45">{t('piece.dimensionsNote')}</p>
                  </dd>
                </div>
              )}

              <div className="border-b border-ink/10 py-4">
                <dt className="eyebrow opacity-45">{t('piece.collection')}</dt>
                <dd className="mt-2">
                  <Link to={`/colectii/${piece.collection}`} className="underline underline-offset-4">
                    {family ? (lang === 'ro' ? family.ro : family.en) : ''}
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
              <ArrowLink to={`/contact?piece=${encodeURIComponent(piece.name)}`}>
                {t('common.enquire')}
              </ArrowLink>
            </div>
          </div>
        </aside>
      </section>

      {/* ---------------------------------------------------- description -- */}
      {paragraphs.length > 0 && (
        <section className="gutter grid gap-8 py-20 md:grid-cols-12 md:py-28">
          <div className="md:col-span-4">
            <Eyebrow>{t('piece.description')}</Eyebrow>
            {lang === 'en' && <p className="mt-3 text-xs opacity-45">{t('piece.roNote')}</p>}
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <Reveal>
              <p className="font-display text-[clamp(1.35rem,2.3vw,2rem)] leading-[1.22]">
                {piece.lead || paragraphs[0]}
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

      {/* -------------------------------------------------------- related -- */}
      {siblings.length > 0 && (
        <section className="gutter border-t border-ink/12 py-16">
          <Eyebrow>{t('piece.related')}</Eyebrow>
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
