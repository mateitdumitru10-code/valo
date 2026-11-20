import type { CSSProperties } from 'react'
import { Reveal, RevealLines } from '~/components/Reveal'
import { Eyebrow } from '~/components/UI'
import { MattressCard } from '~/components/MattressCard'
import { mattresses } from '~/lib/mattresses'
import { useI18n } from '~/lib/i18n'

const copy = {
  ro: {
    eyebrow: 'Saltele',
    title: 'Construite strat cu strat',
    lede: 'Patru saltele, toate în husă matlasată Aloe Vera cu bandă din plasă 3D pe laturi. Alegeți una pentru a vedea ce are înăuntru.',
    draft: 'Previzualizare: grosimile și densitățile se completează după fișa tehnică a atelierului.',
  },
  en: {
    eyebrow: 'Mattresses',
    title: 'Built layer by layer',
    lede: 'Four mattresses, all in a quilted Aloe Vera cover with a 3D mesh band round the sides. Choose one to see what is inside.',
    draft: 'Preview: thicknesses and densities follow once the workshop sends its technical sheet.',
  },
}

/** Mattresses: the models, each drawn from the workshop's photographs. */
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

      <section className="gutter mt-14 grid grid-cols-1 gap-x-6 gap-y-14 border-t border-ink/12 py-16 sm:grid-cols-2">
        {mattresses.map((m, i) => (
          <div key={m.slug} data-rv="" className="rv-up" style={{ '--i': i } as CSSProperties}>
            <MattressCard mattress={m} index={i} />
          </div>
        ))}
      </section>
    </div>
  )
}
