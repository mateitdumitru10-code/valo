import { Fragment, type ReactNode } from 'react'
import { Eyebrow, Rule } from '~/components/UI'
import { company, label, legalUpdated, terms, type Company, type Terms } from '~/lib/company'
import { useI18n } from '~/lib/i18n'
import { privacy, termsDoc, type LegalDoc } from '~/lib/legal'
import { mainPhone } from '~/lib/showrooms'

/** A `{key}` in the legal text, resolved — or marked, loudly, as still missing. */
function fact(key: string): ReactNode {
  if (key === 'phone') return mainPhone
  const value =
    key === 'privacyEmail'
      ? (company.privacyEmail ?? company.email)
      : ((company as Record<string, string | null>)[key] ?? (terms as Record<string, string | null>)[key])
  if (value) return value
  return (
    <mark className="bg-ember/15 px-1 text-ember">
      [de completat: {label(key as keyof Company | keyof Terms)}]
    </mark>
  )
}

/** A paragraph's `{key}`s and `[text](url)` links, as elements. */
function rich(text: string) {
  return text.split(/(\{[a-zA-Z]+\}|\[[^\]]+\]\([^)]+\))/g).map((part, i) => {
    const key = part.match(/^\{([a-zA-Z]+)\}$/)
    if (key) return <Fragment key={i}>{fact(key[1])}</Fragment>
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (link)
      return (
        <a key={i} href={link[2]} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:opacity-60">
          {link[1]}
        </a>
      )
    return part
  })
}

const updated = new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }).format(
  new Date(legalUpdated),
)

function LegalPage({ doc }: { doc: LegalDoc }) {
  const { lang } = useI18n()
  return (
    <div className="pt-32 pb-28 md:pt-44">
      <header className="gutter">
        <Eyebrow index="—">{lang === 'ro' ? 'Informații legale' : 'Legal'}</Eyebrow>
        <h1 className="display-lg mt-8 max-w-3xl">{doc.title}</h1>
        <p className="lede mt-8 max-w-xl opacity-70">{doc.lede}</p>
        <p className="mt-6 text-xs opacity-50">
          Actualizat la {updated}
          {lang === 'en' && ' · This page is published in Romanian only.'}
        </p>
      </header>

      <div className="gutter mt-16">
        <Rule />
        <div className="mt-14 max-w-2xl space-y-12">
          {doc.sections.map((s, i) => (
            <section key={s.heading}>
              <h2 className="font-display text-[clamp(1.25rem,1rem+0.8vw,1.6rem)] leading-snug">
                <span className="mr-3 text-sm opacity-40">{String(i + 1).padStart(2, '0')}</span>
                {s.heading}
              </h2>
              <div className="mt-4 space-y-4 text-[0.95rem] leading-relaxed opacity-80">
                {s.body.map((p, j) => (
                  <p key={j}>{rich(p)}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

export const Privacy = () => <LegalPage doc={privacy} />
export const TermsPage = () => <LegalPage doc={termsDoc} />
