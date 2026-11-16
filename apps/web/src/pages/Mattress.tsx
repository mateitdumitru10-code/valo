import { Link, Navigate, useParams } from 'react-router-dom'
import { Reveal, RevealImage, RevealLines } from '~/components/Reveal'
import { Cta, Eyebrow } from '~/components/UI'
import { MattressLayers } from '~/components/MattressLayers'
import { bySlug, mattresses, sizes } from '~/lib/mattresses'
import { useI18n } from '~/lib/i18n'
import { MattressCard } from '~/components/MattressCard'

const copy = {
  ro: {
    eyebrow: 'Saltele',
    draft: 'Previzualizare: grosimile și densitățile se completează după fișa tehnică a atelierului.',
    buildEyebrow: 'Construcție',
    buildTitle: 'Ce este înăuntru',
    buildLede: 'Treceți peste un strat pentru a-l vedea. Desenul păstrează proporțiile, nu cotele.',
    photosEyebrow: 'Atelier',
    photosTitle: 'Fotografiată în secțiune',
    materialsTitle: 'Materialele, fotografiate în atelier',
    materials: [
      { src: 'husa', title: 'Husa', body: 'Tricot Aloe Vera, matlasat în valuri.' },
      { src: 'plasa', title: 'Banda laterală', body: 'Plasă 3D, cu ochiuri deschise.' },
    ],
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
    draft: 'Preview: thicknesses and densities follow once the workshop sends its technical sheet.',
    buildEyebrow: 'Construction',
    buildTitle: 'What is inside',
    buildLede: 'Point at a layer to see it. The drawing keeps the proportions, not the measurements.',
    photosEyebrow: 'Workshop',
    photosTitle: 'Photographed in section',
    materialsTitle: 'The materials, photographed in the workshop',
    materials: [
      { src: 'husa', title: 'The cover', body: 'Aloe Vera knit, quilted in waves.' },
      { src: 'plasa', title: 'The side band', body: '3D mesh, with open cells.' },
    ],
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
          <p className="lede mt-6 max-w-xl opacity-75">{tx(mattress.lede)}</p>
          <p className="mt-4 max-w-md text-xs leading-relaxed opacity-45">{c.draft}</p>
        </Reveal>
      </header>

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

      {/* ------------------------------------------------- photographs */}
      <section className="gutter mt-20 border-t border-ink/12 pt-12 md:mt-28 md:pt-16">
        <Eyebrow index="02">{c.photosEyebrow}</Eyebrow>
        <h2 className="display-md mt-4">{mattress.photos.length ? c.photosTitle : c.materialsTitle}</h2>
        <div className="mt-10 grid gap-10 sm:grid-cols-2 sm:gap-6">
          {mattress.photos.length
            ? mattress.photos.map((p) => (
                <figure key={p.src}>
                  <RevealImage>
                    <img
                      src={`/media/saltele/${p.src}-860.webp`}
                      srcSet={`/media/saltele/${p.src}-600.webp 600w, /media/saltele/${p.src}-860.webp 860w`}
                      sizes="(max-width: 640px) 92vw, 46vw"
                      alt={tx(p.alt)}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/5] w-full object-cover"
                    />
                  </RevealImage>
                  <figcaption className="mt-4 text-sm opacity-60">{tx(p.alt)}</figcaption>
                </figure>
              ))
            : c.materials.map((m) => (
                <figure key={m.src}>
                  <RevealImage>
                    <img
                      src={`/media/saltele/${m.src}-1200.webp`}
                      srcSet={`/media/saltele/${m.src}-700.webp 700w, /media/saltele/${m.src}-1200.webp 1200w`}
                      sizes="(max-width: 640px) 92vw, 46vw"
                      alt={`${m.title} — ${m.body}`}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/5] w-full object-cover"
                    />
                  </RevealImage>
                  <figcaption className="mt-4">
                    <span className="block font-display text-lg">{m.title}</span>
                    <span className="mt-1 block text-sm opacity-60">{m.body}</span>
                  </figcaption>
                </figure>
              ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- sizes */}
      <section className="gutter mt-20 grid gap-10 border-t border-ink/12 py-12 md:mt-28 md:grid-cols-12 md:py-16">
        <div className="md:col-span-5">
          <Eyebrow index="03">{c.sizesEyebrow}</Eyebrow>
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
