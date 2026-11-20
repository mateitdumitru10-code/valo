/**
 * Who sells, and on what terms — the facts the footer and the two legal pages
 * (Confidențialitate, Termeni și condiții) are built from.
 *
 * Law 365/2002 requires a commercial site to name the company behind it, and
 * the terms page states what the client agreed with the customer. None of it
 * can be guessed: every `null` below is still waiting for the client. A `null`
 * is left out of the footer, shown as "[de completat]" on the legal pages, and
 * listed by `missingCompanyFields()`, which the prerenderer prints on every
 * build so the gap cannot be forgotten at release.
 */

export type Company = {
  /** Legal name, e.g. "SAMOBI SRL". */
  legalName: string | null
  /** CUI, with "RO" in front when the company is VAT-registered. */
  cui: string | null
  /** Registrul Comerțului number, e.g. "J29/123/2005". */
  regCom: string | null
  /** Registered office — may differ from the factory. */
  seat: string | null
  /** Where customers and GDPR requests write. */
  email: string | null
  privacyEmail: string | null
}

export const company: Company = {
  legalName: null,
  cui: null,
  regCom: null,
  seat: null,
  email: null,
  privacyEmail: null,
}

/** Terms of sale: what the client decides. Each is a phrase that reads inside a sentence. */
export type Terms = {
  /** e.g. "30% din valoarea comenzii" */
  advance: string | null
  /** e.g. "numerar, transfer bancar sau card, în showroom" */
  payment: string | null
  /** e.g. "3–6 săptămâni de la confirmarea comenzii" */
  leadTime: string | null
  /** e.g. "gratuită în București și Prahova; în restul țării, după tarifele curierului" */
  delivery: string | null
  /** e.g. "24 de luni pentru structură și mecanisme" */
  warranty: string | null
  /** How long an inquiry that led to no order is kept, e.g. "12 luni". */
  retention: string | null
}

export const terms: Terms = {
  advance: null,
  payment: null,
  leadTime: null,
  delivery: null,
  warranty: null,
  retention: null,
}

/** The date the legal texts were last changed, shown on both pages. */
export const legalUpdated = '2026-11-20'

const LABELS: Record<keyof Company | keyof Terms, string> = {
  legalName: 'denumirea firmei',
  cui: 'CUI',
  regCom: 'nr. Registrul Comerțului',
  seat: 'sediul social',
  email: 'email de contact',
  privacyEmail: 'email pentru cereri GDPR',
  advance: 'avansul',
  payment: 'metodele de plată',
  leadTime: 'termenul de producție',
  delivery: 'condițiile de livrare',
  warranty: 'garanția',
  retention: 'durata de păstrare a cererilor',
}

export const label = (key: keyof Company | keyof Terms) => LABELS[key]

/** Every fact still missing, by its Romanian name. */
export function missingCompanyFields() {
  const all = { ...company, ...terms } as Record<keyof Company | keyof Terms, string | null>
  return (Object.keys(all) as (keyof typeof all)[]).filter((k) => !all[k]).map(label)
}
