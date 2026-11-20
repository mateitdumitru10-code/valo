import { Link, Navigate, useParams } from 'react-router-dom'
import { Reveal, RevealImage, RevealLines } from '~/components/Reveal'
import { Cta, Eyebrow } from '~/components/UI'
import { MattressLayers } from '~/components/MattressLayers'
import { bySlug, mattresses, shots, sizes } from '~/lib/mattresses'
import { useI18n } from '~/lib/i18n'
import { MattressCard } from '~/components/MattressCard'

const copy = {
  ro: {
    eyebrow: 'Saltele',
    buildEyebrow: 'Construcție',
    buildTitle: 'Ce este înăuntru',
    buildLede: 'Treceți peste un strat pentru a-l vedea. Desenul păstrează proporțiile, nu cotele.',
    sizesEyebrow: 'Dimensiuni',
    sizesTitle: 'Pentru fiecare pat',
    sizesBody: 'Aceleași dimensiuni ca paturile din catalog. Prețurile și alte dimensiuni, la cerere.',
    beds: 'Vezi paturile',
    cta: 'Cere ofertă',
    others: 'Alte saltele',
    all: 'Toate saltelele',
  },
  en: {
    eyebrow: 'Mattresses',
    buildEyebrow: 'Construction',
    buildTitle: 'What is inside',
    buildLede: 'Point at a layer to see it. The drawing keeps the proportions, not the measurements.',
    sizesEyebrow: 'Sizes',
    sizesTitle: 'For every bed',
    sizesBody: 'The same sizes as the beds in the catalogue. Prices and other sizes on request.',
    beds: 'See the beds',
    cta: 'Request a quote',
    others: 'Other mattresses',
    all: 'All mattresses',
  },
}

/** One mattress: its layers drawn, its section photographed, its sizes. */
export function MattressPage() {
  const { slug = '' } = useParams()
  const { lang } = useI18n()
  const c = copy[lang]
  const mattress = bySlug(slug)
  if (!mattress) return <Navigate to="/saltele" replace />
  const tx = (t: { ro: string; en: string }) => (lang === 'ro' ? t.ro : t.en)
  const others = mattresses.filter((m) => m.slug !== mattress.slug)

  return (
    <div className="pt-32 md:pt-44">
      <header className="gutter">
        <Link to="/saltele" className="inline-block opacity-80 hover:opacity-100">
          <Eyebrow index="—">{c.eyebrow}</Eyebrow>
        </Link>
        <h1 className="display-lg mt-6 max-w-4xl">
          <RevealLines key={mattress.slug} lines={[mattress.name]} />
        </h1>
        <Reveal delay={1}>
          <p className="display-md mt-4 max-w-2xl opacity-60">{tx(mattress.tagline)}</p>
          <p className="lede mt-8 max-w-xl opacity-75">{tx(mattress.lede)}</p>
          {mattress.body.map((p) => (
            <p key={p.ro} className="mt-4 max-w-xl text-sm leading-relaxed opacity-65">
              {tx(p)}
            </p>
          ))}
          <p className="mt-8 max-w-xl font-display text-lg italic leading-snug opacity-80">{tx(mattress.closing)}</p>
        </Reveal>
      </header>

      {/* ------------------------------------------------------ studio shots */}
      <section className="gutter mt-12 grid gap-6 sm:grid-cols-2 md:mt-16">
        {shots(mattress).map((p, i) => (
          <figure key={p.src}>
            <RevealImage>
              <img
                src={`/media/saltele/${p.src}-1400.webp`}
                srcSet={`/media/saltele/${p.src}-700.webp 700w, /media/saltele/${p.src}-1400.webp 1400w`}
                sizes="(max-width: 640px) 92vw, 46vw"
                alt={tx(p.alt)}
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : 'auto'}
                decoding="async"
                className="aspect-[4/3] w-full bg-white object-contain p-[5%]"
              />
            </RevealImage>
          </figure>
        ))}
      </section>

      {/* ------------------------------------------------------ construction */}
      <section className="gutter mt-16 border-t border-ink/12 pt-12 md:mt-24 md:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow index="01">{c.buildEyebrow}</Eyebrow>
            <h2 className="display-md mt-4">{c.buildTitle}</h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed opacity-55">{c.buildLede}</p>
        </div>
        <div className="mt-10 md:mt-14">
          {/* Keyed, so moving between models starts each drawing closed. */}
          <MattressLayers key={mattress.slug} mattress={mattress} />
        </div>
      </section>

      {/* ------------------------------------------------------------- sizes */}
      <section className="gutter mt-20 grid gap-10 border-t border-ink/12 py-12 md:mt-28 md:grid-cols-12 md:py-16">
        <div className="md:col-span-5">
          <Eyebrow index="02">{c.sizesEyebrow}</Eyebrow>
          <h2 className="display-md mt-4">{c.sizesTitle}</h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed opacity-65">{c.sizesBody}</p>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <ul className="flex flex-wrap gap-3">
            {sizes.map((size) => (
              <li key={size} className="border border-ink/20 px-4 py-2 font-display text-lg tabular-nums">
                {size}
                <span className="ml-1 text-sm opacity-45">cm</span>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap items-center gap-8">
            <Cta to={`/contact?piece=${encodeURIComponent(lang === 'ro' ? `Saltea ${mattress.name}` : `${mattress.name} mattress`)}`}>
              {c.cta}
            </Cta>
            <Link to="/categorii/beds" className="eyebrow underline underline-offset-4 opacity-70 hover:opacity-100">
              {c.beds}
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ others */}
      <section className="gutter border-t border-ink/12 py-12 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="display-md">{c.others}</h2>
          <Link to="/saltele" className="eyebrow underline underline-offset-4 opacity-70 hover:opacity-100">
            {c.all}
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-3">
          {others.map((m) => (
            <MattressCard key={m.slug} mattress={m} />
          ))}
        </div>
      </section>
    </div>
  )
}
