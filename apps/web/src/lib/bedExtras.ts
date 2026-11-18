/**
 * Add-ons every bed is offered with, from the client's price list
 * (2026-11-18): the leg height, where 2.5 cm is the standard bed's own, and a
 * pair of nightstands, left and right. Prices are what each adds to the bed's
 * list price, in lei, VAT included like the rest. The legs also come in black
 * or silver; the list gives no price for the colour, so it adds none.
 */
export type Leg = { cm: number; label: { ro: string; en: string }; price: number }

export const legs: Leg[] = [
  { cm: 2.5, label: { ro: '2,5', en: '2.5' }, price: 0 },
  { cm: 5, label: { ro: '5', en: '5' }, price: 50 },
  { cm: 10, label: { ro: '10', en: '10' }, price: 100 },
  { cm: 15, label: { ro: '15', en: '15' }, price: 150 },
]

export type LegColour = { id: 'black' | 'silver'; label: { ro: string; en: string }; hex: string }

export const legColours: LegColour[] = [
  { id: 'black', label: { ro: 'Negru', en: 'Black' }, hex: '#1c1b19' },
  { id: 'silver', label: { ro: 'Argintiu', en: 'Silver' }, hex: '#c3c4c6' },
]

export const nightstands = {
  label: { ro: 'Set 2 noptiere, stânga și dreapta', en: 'Pair of nightstands, left and right' },
  price: 650,
}

export const extrasPrice = (leg: number, withNightstands: boolean) =>
  (legs[leg]?.price ?? 0) + (withNightstands ? nightstands.price : 0)

/** The choices in words, for the quote request. The legs are always named, since their colour is always a choice. */
export function describeExtras(leg: number, colour: number, withNightstands: boolean, lang: 'ro' | 'en') {
  const parts: string[] = []
  const tone = legColours[colour] ?? legColours[0]
  parts.push(
    lang === 'ro'
      ? `picioare de ${legs[leg].label.ro} cm, ${tone.id === 'black' ? 'negre' : 'argintii'}`
      : `${legs[leg].label.en} cm legs in ${tone.label.en.toLowerCase()}`,
  )
  if (withNightstands) parts.push(nightstands.label[lang].toLowerCase())
  return parts.join(', ')
}
