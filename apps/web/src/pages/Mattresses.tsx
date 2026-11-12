import { Link } from 'react-router-dom'
import { Reveal, RevealImage, RevealLines } from '~/components/Reveal'
import { Cta, Eyebrow } from '~/components/UI'
import { MattressLayers } from '~/components/MattressLayers'
import { mattress } from '~/lib/mattresses'
import { useI18n } from '~/lib/i18n'

const copy = {
  ro: {
    eyebrow: 'Saltele',
    title: 'Construită strat cu strat',
    lede: 'Trei straturi de spumă, într-o husă matlasată Aloe Vera cu bandă din plasă 3D pe laturi. Pe măsura paturilor VALLO.',
    draft: 'Previzualizare: grosimile și densitățile se completează după fișa tehnică a atelierului.',
    buildEyebrow: 'Construcție',
    buildTitle: 'Ce este înăuntru',
    buildLede: 'Treceți peste un strat pentru a-l vedea. Desenul păstrează proporțiile, nu cotele.',
    materialsEyebrow: 'Materiale',
    materialsTitle: 'Fotografiate în atelier',
    materials: [
      { src: 'husa', title: 'Husa', body: 'Tricot Aloe Vera, matlasat în valuri.' },
      { src: 'plasa', title: 'Banda laterală', body: 'Plasă 3D, cu ochiuri deschise.' },
      { src: 'spuma', title: 'Miezul', body: 'Cele trei spume, înainte de a fi îmbrăcate.' },
    ],
    sizesEyebrow: 'Dimensiuni',
    sizesTitle: 'Pentru fiecare pat',
    sizesBody: 'Aceleași dimensiuni ca paturile din catalog. Prețurile și alte dimensiuni, la cerere.',
    beds: 'Vezi paturile',
    cta: 'Cere ofertă',
  },
  en: {
    eyebrow: 'Mattresses',
    title: 'Built layer by layer',
    lede: 'Three layers of foam in a quilted Aloe Vera cover, with a 3D mesh band round the sides. Made to fit VALLO beds.',
    draft: 'Preview: thicknesses and densities follow once the workshop sends its technical sheet.',
    buildEyebrow: 'Construction',
    buildTitle: 'What is inside',
    buildLede: 'Point at a layer to see it. The drawing keeps the proportions, not the measurements.',
    materialsEyebrow: 'Materials',
    materialsTitle: 'Photographed in the workshop',
    materials: [
      { src: 'husa', title: 'The cover', body: 'Aloe Vera knit, quilted in waves.' },
      { src: 'plasa', title: 'The side band', body: '3D mesh, with open cells.' },
      { src: 'spuma', title: 'The core', body: 'The three foams, before they are covered.' },
    ],
    sizesEyebrow: 'Sizes',
    sizesTitle: 'For every bed',
    sizesBody: 'The same sizes as the beds in the catalogue. Prices and other sizes on request.',
    beds: 'See the beds',
    cta: 'Request a quote',
  },
}

/** Mattresses: one model for now, drawn from the workshop's photographs. */
export function Mattresses() {
  const { lang } = useI18n()
  const c = copy[lang]

  return (
    <div className="pt-32 md:pt-44">
      <header className="gutter">
        <Eyebrow index="—">{c.eyebrow}</Eyebrow>
        <h1 className="display-lg mt-6 max-w-4xl">
          <RevealLines lines={[c.title]} />
        </h1>
        <Reveal delay={1}>
          <p className="lede mt-6 max-w-xl opacity-75">{c.lede}</p>
          <p className="mt-4 max-w-md text-xs leading-relaxed opacity-45">{c.draft}</p>
        </Reveal>
      </header>

      {/* ------------------------------------------------------ construction */}
      <section className="gutter mt-16 border-t border-ink/12 pt-12 md:mt-24 md:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow index="01">{c.buildEyebrow}</Eyebrow>
            <h2 className="display-md mt-4">{lang === 'ro' ? mattress.name.ro : mattress.name.en}</h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed opacity-55">{c.buildLede}</p>
        </div>
        <div className="mt-10 md:mt-14">
          <MattressLayers />
        </div>
      </section>

      {/* --------------------------------------------------------- materials */}
      <section className="gutter mt-20 border-t border-ink/12 pt-12 md:mt-28 md:pt-16">
        <Eyebrow index="02">{c.materialsEyebrow}</Eyebrow>
        <h2 className="display-md mt-4">{c.materialsTitle}</h2>
        <div className="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-6">
          {c.materials.map((m) => (
            <figure key={m.src}>
              <RevealImage>
                <img
                  src={`/media/saltele/${m.src}-1200.webp`}
                  srcSet={`/media/saltele/${m.src}-700.webp 700w, /media/saltele/${m.src}-1200.webp 1200w`}
                  sizes="(max-width: 640px) 92vw, 30vw"
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
            {mattress.sizes.map((size) => (
              <li key={size} className="border border-ink/20 px-4 py-2 font-display text-lg tabular-nums">
                {size}
                <span className="ml-1 text-sm opacity-45">cm</span>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap items-center gap-8">
            <Cta to={`/contact?piece=${encodeURIComponent(lang === 'ro' ? mattress.name.ro : mattress.name.en)}`}>
              {c.cta}
            </Cta>
            <Link to="/categorii/beds" className="eyebrow underline underline-offset-4 opacity-70 hover:opacity-100">
              {c.beds}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
