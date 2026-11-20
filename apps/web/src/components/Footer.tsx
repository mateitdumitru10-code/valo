import { Link } from 'react-router-dom'
import { useI18n } from '~/lib/i18n'
import { collectionName, collections } from '~/lib/catalog'
import { locations, mainPhone, mainPhoneHref, parentSite } from '~/lib/showrooms'
import { Rule } from './UI'
import { company } from '~/lib/company'

const year = new Date().getFullYear()

const identity = [
  company.legalName,
  company.cui && `CUI ${company.cui}`,
  company.regCom && `Reg. Com. ${company.regCom}`,
  company.seat && `Sediu: ${company.seat}`,
].filter((x): x is string => Boolean(x))

export function Footer() {
  const { t } = useI18n()
  const showrooms = locations.filter((l) => l.kind === 'showroom')

  return (
    <footer className="gutter bg-bone pt-24 pb-10">
      <Rule />

      <div className="grid gap-12 pt-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="max-w-sm font-display text-[clamp(1.25rem,0.9rem+1vw,1.5rem)] leading-[1.35]">
            {t('footer.tagline')}
          </p>
          <a
            href={`tel:${mainPhoneHref}`}
            className="mt-8 inline-block font-display text-xl transition-opacity hover:opacity-60"
          >
            {mainPhone}
          </a>
          <a
            href={`mailto:${company.email}`}
            className="mt-2 block text-sm opacity-70 transition-opacity hover:opacity-100"
          >
            {company.email}
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
              <Link to="/horeca" className="text-sm opacity-70 hover:opacity-100">
                {t('nav.horeca')}
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

      {/* The seller's identity (Law 365/2002) and the consumer-protection
          links (ANPC Order 449/2022). A fact the client has not sent yet is
          left out here; src/lib/company.ts lists what is missing. */}
      <div className="mt-5 flex flex-col gap-4 text-xs opacity-55 lg:flex-row lg:items-start lg:justify-between">
        {identity.length > 0 && <p className="max-w-xl leading-relaxed">{identity.join(' · ')}</p>}
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          <li>
            <Link to="/confidentialitate" className="hover:opacity-100 hover:underline">
              {t('footer.privacy')}
            </Link>
          </li>
          <li>
            <Link to="/termeni" className="hover:opacity-100 hover:underline">
              {t('footer.terms')}
            </Link>
          </li>
          <li>
            <a href="https://anpc.ro" target="_blank" rel="noreferrer" className="hover:underline">
              {t('footer.anpc')}
            </a>
          </li>
          <li>
            <a href="https://anpc.ro/ce-este-sal/" target="_blank" rel="noreferrer" className="hover:underline">
              {t('footer.sal')}
            </a>
          </li>
        </ul>
      </div>
    </footer>
  )
}
