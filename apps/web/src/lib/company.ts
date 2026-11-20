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

// Identity checked against ANAF's public registry (CUI 17713165) on
// 2026-11-20: registered 2005, VAT-registered since 27.06.2005, active. The
// registry writes the Reg. Com. number in ONRC's new form, J2005001382296;
// Samobi's own site uses the classic J29/1382/2005, kept here.
export const company: Company = {
  legalName: 'SAMOBI SERV SRL',
  cui: 'RO17713165',
  regCom: 'J29/1382/2005',
  seat: 'Sat Ungureni, Comuna Vadu Săpat, nr. FN, județul Prahova',
  // Cloudflare Email Routing forwards it to the team's inbox; the site never
  // names that inbox, so it can change without touching the site.
  email: 'contact@vallo.ro',
  privacyEmail: 'contact@vallo.ro',
}

/** Terms of sale: what the client decides. Each is a phrase that reads inside a sentence. */
export type Terms = {
  /** A sentence on when payment is due, e.g. "Livrarea se face numai după plata integrală a comenzii." */
  advance: string | null
  /** e.g. "numerar, transfer bancar sau card, în showroom" */
  payment: string | null
  /** e.g. "10–14 zile lucrătoare de la confirmarea comenzii" */
  leadTime: string | null
  /** e.g. "gratuită în București și Prahova; în restul țării, după tarifele curierului" */
  delivery: string | null
  /** e.g. "24 de luni" */
  warranty: string | null
  /** How long an inquiry that led to no order is kept, e.g. "12 luni". */
  retention: string | null
}

// Taken from Samobi's own published terms (mobilasamobi.ro: termeni, transport
// și livrare, politica de retur, întrebări frecvente), read 2026-11-20 — the
// same company sells VALLO. To be confirmed by the client before release.
// Samobi quotes two different per-km rates (4 and 1,5 lei/km), so the rate
// outside the free cities is left to the offer rather than printed here.
export const terms: Terms = {
  advance: 'Livrarea se face numai după plata integrală a comenzii.',
  payment: 'transfer bancar, numerar sau, în showroom, în rate cu cardul Star BT',
  leadTime: '10–14 zile lucrătoare de la confirmarea comenzii și plata avansului',
  delivery:
    'gratuită până în fața blocului în București, Ploiești, Buzău și Constanța; 50 lei în județul Ilfov; în alte localități, costul depinde de distanța față de fabrică și este comunicat în ofertă',
  warranty: '24 de luni',
  // Samobi says only "for the length of the commercial relationship".
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
  advance: 'regula de plată',
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
