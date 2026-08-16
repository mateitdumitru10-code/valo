import { Link } from 'react-router-dom'
import { useI18n } from '~/lib/i18n'
import { collectionName, collections } from '~/lib/catalog'
import { locations, mainPhone, mainPhoneHref, parentSite } from '~/lib/showrooms'
import { Rule } from './UI'

const year = new Date().getFullYear()

export function Footer() {
  const { t } = useI18n()
  const showrooms = locations.filter((l) => l.kind === 'showroom')

  return (
    <footer className="gutter bg-bone pt-24 pb-10">
      <Rule />

      <div className="grid gap-12 pt-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="max-w-sm font-display text-[clamp(1.5rem,2.4vw,2.25rem)] leading-[1.15]">
            {t('footer.tagline')}
          </p>
          <a
            href={`tel:${mainPhoneHref}`}
            className="mt-8 inline-block font-display text-2xl transition-opacity hover:opacity-60"
          >
            {mainPhone}
          </a>
        </div>

        <nav className="md:col-span-3">
          <p className="eyebrow opacity-45">{t('nav.collections')}</p>
          <ul className="mt-5 space-y-2">
            {collections.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/colectii/${c.id}`}
                  className="text-sm opacity-70 transition-opacity hover:opacity-100"
                >
                  {collectionName(c.id)}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                to="/categorii"
                className="text-sm opacity-45 transition-opacity hover:opacity-100"
              >
                {t('nav.categories')}
              </Link>
            </li>
          </ul>
        </nav>

        <nav className="md:col-span-2">
          <p className="eyebrow opacity-45">{t('nav.showrooms')}</p>
          <ul className="mt-5 space-y-2">
            {showrooms.map((l) => (
              <li key={l.id}>
                <a
                  href={l.map}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm opacity-70 transition-opacity hover:opacity-100"
                >
                  {l.city} — {l.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-2">
          <p className="eyebrow opacity-45">{t('footer.parent')}</p>
          <a
            href={parentSite}
            target="_blank"
            rel="noreferrer"
            className="mt-5 block font-display text-xl tracking-[0.16em] transition-opacity hover:opacity-60"
          >
            SAMOBI
          </a>
          <ul className="mt-6 space-y-2">
            <li>
              <Link to="/atelier" className="text-sm opacity-70 hover:opacity-100">
                {t('nav.atelier')}
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-sm opacity-70 hover:opacity-100">
                {t('nav.contact')}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* The wordmark, set as large as the page allows. */}
      <div className="mt-20 overflow-hidden">
        <span
          className="-mr-[0.02em] block w-full text-center font-display leading-[0.78] tracking-[0.02em] text-ink/90 select-none"
          style={{ fontSize: 'clamp(3.5rem, 19.5vw, 20rem)' }}
          aria-hidden
        >
          VALLO
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-ink/10 pt-6 text-xs opacity-55 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} Vallo — {t('footer.rights')}
        </p>
        <p className="eyebrow">Vadu Săpat · Prahova · România</p>
      </div>
    </footer>
  )
}
