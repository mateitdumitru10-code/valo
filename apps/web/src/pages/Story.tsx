import { Img } from '~/components/Img'
import { Parallax } from '~/components/Parallax'
import { RevealImage, RevealLines, Reveal } from '~/components/Reveal'
import { Cta, Eyebrow, Rule } from '~/components/UI'
import { bySlug, featured } from '~/lib/catalog'
import { useI18n, type Key } from '~/lib/i18n'
import { parentSite } from '~/lib/showrooms'

const CRAFT = [1, 2, 3, 4] as const

export function Story() {
  const { t } = useI18n()
  const wide = bySlug('coltar-cubic-fix') ?? featured[0]
  const tall = bySlug('fotoliu-king') ?? featured[1]
  const detail = bySlug('hol-chesterfield') ?? featured[2]

  return (
    <div className="pt-32 md:pt-44">
      <header className="gutter">
        <Eyebrow index="—">{t('story.eyebrow')}</Eyebrow>
        <h1 className="display-lg mt-8 max-w-5xl">
          <RevealLines lines={t('story.title').split(' ').reduce(intoTwoLines, ['', ''])} />
        </h1>
      </header>

      <section className="gutter mt-16 grid gap-12 md:mt-24 md:grid-cols-12">
        <div className="md:col-span-7">
          <RevealImage>
            <Img
              img={wide.cover}
              alt={wide.name}
              sizes="(max-width: 768px) 100vw, 58vw"
              priority
              className="aspect-[16/10] w-full"
            />
          </RevealImage>
        </div>
        <div className="self-end md:col-span-4 md:col-start-9">
          <Reveal>
            <p className="text-base leading-relaxed opacity-75">{t('story.p1')}</p>
          </Reveal>
        </div>
      </section>

      <section className="gutter py-24 md:py-32">
        <blockquote className="mx-auto max-w-4xl text-center">
          <p className="display-md">
            <RevealLines lines={[`„${t('story.quote')}”`]} />
          </p>
        </blockquote>
      </section>

      <section className="gutter grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <Reveal>
            <p className="text-base leading-relaxed opacity-75">{t('story.p2')}</p>
          </Reveal>
          <Rule className="my-10" />
          <Reveal>
            <p className="text-base leading-relaxed opacity-75">{t('story.p3')}</p>
          </Reveal>
        </div>

        <Parallax distance={50} className="md:col-span-4 md:col-start-6">
          <RevealImage>
            <Img
              img={tall.cover}
              alt={tall.name}
              sizes="(max-width: 768px) 92vw, 32vw"
              className="aspect-[3/4] w-full"
            />
          </RevealImage>
        </Parallax>

        <Parallax distance={90} className="md:col-span-3 md:col-start-10 md:mt-24">
          <RevealImage>
            <Img
              img={detail.cover}
              alt={detail.name}
              sizes="(max-width: 768px) 92vw, 24vw"
              className="aspect-[4/5] w-full"
            />
          </RevealImage>
        </Parallax>
      </section>

      <section data-nav="invert" className="grain mt-24 bg-night py-24 text-paper md:mt-36 md:py-32">
        <div className="gutter grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Eyebrow className="text-paper">{t('craft.eyebrow')}</Eyebrow>
            <h2 className="display-md mt-6">{t('craft.title')}</h2>
          </div>
          <ol className="md:col-span-7 md:col-start-6">
            {CRAFT.map((n, i) => (
              <Reveal as="li" key={n} delay={i} className="border-t border-paper/15 py-6">
                <div className="flex gap-6">
                  <span className="eyebrow w-8 shrink-0 text-paper/40 tabular-nums">
                    {String(n).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-display text-xl">{t(`craft.${n}.title` as Key)}</h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-paper/65">
                      {t(`craft.${n}.body` as Key)}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="gutter py-24 text-center md:py-32">
        <p className="mx-auto max-w-2xl font-display text-[clamp(1.25rem,1.05rem+1vw,1.75rem)] leading-[1.35]">
          {t('lineage.body')}
        </p>
        <div className="mt-10 flex justify-center">
          <Cta href={parentSite}>{t('lineage.link')}</Cta>
        </div>
      </section>
    </div>
  )
}

/** Break a headline across two balanced lines for the masked reveal. */
function intoTwoLines(lines: string[], word: string, i: number, all: string[]) {
  const half = Math.ceil(all.length / 2)
  const next = [...lines]
  next[i < half ? 0 : 1] = `${next[i < half ? 0 : 1]} ${word}`.trim()
  return next
}
