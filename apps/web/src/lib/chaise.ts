/**
 * Which side the chaise sits on, for every colțar (client, 2026-11-18), as
 * seen standing in front of the sofa. The U-shaped Soria has one at each
 * end and Modul Cubic is a single module, so neither is offered the choice.
 * The side adds nothing to the price.
 */
export const chaiseSides = [
  { id: 'left', label: { ro: 'Stânga', en: 'Left' } },
  { id: 'right', label: { ro: 'Dreapta', en: 'Right' } },
] as const

const NO_SIDE = new Set(['coltar-soria-in-forma-de-u', 'modul-cubic'])

export const hasChaiseSide = (slug: string, category: string) =>
  category === 'sectionals' && !NO_SIDE.has(slug)

export const describeChaise = (side: number, lang: 'ro' | 'en') =>
  lang === 'ro'
    ? `șezlong pe ${side === 0 ? 'stânga' : 'dreapta'}`
    : `chaise on the ${side === 0 ? 'left' : 'right'}`
