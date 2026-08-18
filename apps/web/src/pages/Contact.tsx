import { Link, useSearchParams } from 'react-router-dom'
import { InquiryForm } from '~/components/InquiryForm'
import { RevealLines } from '~/components/Reveal'
import { Eyebrow, Rule } from '~/components/UI'
import { useI18n } from '~/lib/i18n'
import { locations, mainPhone, mainPhoneHref } from '~/lib/showrooms'

export function Contact() {
  const [params] = useSearchParams()
  const { t, lang } = useI18n()
  const piece = params.get('piece') ?? undefined
  // A width chosen on a bed page rides the link here; it is put in the message
  // rather than in the piece field, which is a fixed list of catalogue names.
  const size = params.get('size') ?? undefined
  const factory = locations.find((l) => l.kind === 'factory')!

  return (
    <div className="pt-32 pb-28 md:pt-44">
      <header className="gutter">
        <Eyebrow index="—">{t('contact.eyebrow')}</Eyebrow>
        <h1 className="display-lg mt-8 max-w-3xl">
          <RevealLines lines={[t('contact.title')]} />
        </h1>
      </header>

      <section className="gutter mt-16 grid gap-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="lede max-w-sm opacity-70">{t('contact.lede')}</p>

          <Rule className="my-10" />

          <dl className="space-y-6 text-sm">
            <div>
              <dt className="eyebrow opacity-40">{t('showrooms.phone')}</dt>
              <dd className="mt-2">
                <a href={`tel:${mainPhoneHref}`} className="font-display text-xl hover:opacity-60">
                  {mainPhone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="eyebrow opacity-40">{t('showrooms.factory')}</dt>
              <dd className="mt-2 opacity-70">{factory.address}</dd>
            </div>
            <div>
              <dt className="eyebrow opacity-40">{t('nav.showrooms')}</dt>
              <dd className="mt-2">
                <Link to="/showroom-uri" className="underline underline-offset-4 hover:opacity-60">
                  {lang === 'ro' ? '6 locații în 4 orașe' : '6 locations in 4 cities'}
                </Link>
              </dd>
            </div>
          </dl>
        </div>

        <div className="md:col-span-7 md:col-start-6">
          <InquiryForm defaultPiece={piece} defaultSize={size} />
        </div>
      </section>
    </div>
  )
}
