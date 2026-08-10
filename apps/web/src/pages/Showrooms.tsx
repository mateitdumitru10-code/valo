import { motion } from 'motion/react'
import { RevealLines } from '~/components/Reveal'
import { ArrowLink, Eyebrow } from '~/components/UI'
import { useI18n } from '~/lib/i18n'
import { cities, locations, mainPhoneHref } from '~/lib/showrooms'
import { expo, viewport } from '~/lib/motion'

export function Showrooms() {
  const { t, lang } = useI18n()

  return (
    <div className="pt-32 md:pt-44">
      <header className="gutter">
        <Eyebrow index="—">{t('showrooms.eyebrow')}</Eyebrow>
        <h1 className="display-xl mt-8">
          <RevealLines lines={[t('showrooms.title')]} />
        </h1>
        <p className="mt-8 max-w-md text-sm leading-relaxed opacity-65">{t('showrooms.lede')}</p>
      </header>

      <section className="gutter mt-20 pb-24">
        {cities.map((city, cityIndex) => (
          <div key={city} className="border-t border-ink/12 py-10 md:py-14">
            <div className="grid gap-10 md:grid-cols-12">
              <div className="md:col-span-3">
                <motion.h2
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={viewport}
                  transition={{ duration: 0.7, ease: expo }}
                  className="font-display text-[clamp(2rem,4.5vw,3.5rem)] leading-none"
                >
                  {city}
                </motion.h2>
                <p className="eyebrow mt-3 opacity-35 tabular-nums">
                  {String(cityIndex + 1).padStart(2, '0')}
                </p>
              </div>

              <div className="grid gap-10 md:col-span-9 md:grid-cols-2">
                {locations
                  .filter((l) => l.city === city)
                  .map((l) => (
                    <motion.article
                      key={l.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={viewport}
                      transition={{ duration: 0.7, ease: expo }}
                    >
                      <p className="eyebrow opacity-40">
                        {l.kind === 'factory' ? t('showrooms.factory') : t('showrooms.showroom')}
                      </p>
                      <h3 className="mt-2 font-display text-2xl">{l.name}</h3>
                      <p className="mt-3 max-w-xs text-sm leading-relaxed opacity-65">
                        {l.address}
                      </p>

                      <dl className="mt-5 space-y-2 text-sm">
                        <div className="flex gap-3">
                          <dt className="eyebrow w-20 shrink-0 pt-1 opacity-40">
                            {t('showrooms.phone')}
                          </dt>
                          <dd>
                            <a
                              href={`tel:${l.phone.replace(/\s/g, '')}`}
                              className="tabular-nums underline-offset-4 hover:underline"
                            >
                              {l.phone}
                            </a>
                          </dd>
                        </div>
                        <div className="flex gap-3">
                          <dt className="eyebrow w-20 shrink-0 pt-1 opacity-40">
                            {t('showrooms.hours')}
                          </dt>
                          <dd className="opacity-70">
                            {l.hours.map((h) => (
                              <p key={h.ro}>{lang === 'ro' ? h.ro : h.en}</p>
                            ))}
                          </dd>
                        </div>
                      </dl>

                      <div className="mt-5">
                        <ArrowLink href={l.map}>
                          {lang === 'ro' ? 'Deschide harta' : 'Open in maps'}
                        </ArrowLink>
                      </div>
                    </motion.article>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="gutter border-t border-ink/12 py-16 pb-28">
        <p className="font-display text-[clamp(1.5rem,3vw,2.5rem)] leading-[1.2]">
          {lang === 'ro'
            ? 'Preferați să sunați?'
            : 'Would you rather call?'}
        </p>
        <a
          href={`tel:${mainPhoneHref}`}
          className="mt-4 inline-block font-display text-[clamp(2rem,6vw,4rem)] leading-none transition-opacity hover:opacity-60"
        >
          0733 853 257
        </a>
      </section>
    </div>
  )
}
