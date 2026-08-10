/** Samobi's own locations — Vallo pieces can be seen and sat on in all of them. */
export type Location = {
  id: string
  city: string
  name: string
  address: string
  phone: string
  hours: { ro: string; en: string }[]
  kind: 'showroom' | 'factory'
  map: string
}

const maps = (q: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`

export const locations: Location[] = [
  {
    id: 'ghencea',
    city: 'București',
    name: 'Magazin Elite',
    address: 'B-dul Ghencea nr. 134, în incinta magazinului Elite, parter',
    phone: '0784 009 874',
    hours: [
      { ro: 'Luni–Vineri 10:00–19:00', en: 'Mon–Fri 10:00–19:00' },
      { ro: 'Sâmbătă 10:00–16:00', en: 'Sat 10:00–16:00' },
    ],
    kind: 'showroom',
    map: maps('B-dul Ghencea 134 Bucuresti magazin Elite mobila'),
  },
  {
    id: 'obor',
    city: 'București',
    name: 'Magazin Obor',
    address: 'Șoseaua Colentina nr. 2, etaj 1, în incinta magazinului Obor',
    phone: '0763 101 840',
    hours: [
      { ro: 'Luni–Vineri 10:00–19:00', en: 'Mon–Fri 10:00–19:00' },
      { ro: 'Sâmbătă 10:00–16:00', en: 'Sat 10:00–16:00' },
    ],
    kind: 'showroom',
    map: maps('Soseaua Colentina 2 Bucuresti magazin Obor'),
  },
  {
    id: 'ploiesti-strandului',
    city: 'Ploiești',
    name: 'Str. Ștrandului',
    address: 'Str. Ștrandului nr. 182, etaj 1',
    phone: '0784 681 595',
    hours: [
      { ro: 'Luni–Vineri 09:00–19:00', en: 'Mon–Fri 09:00–19:00' },
      { ro: 'Sâmbătă 09:00–16:00', en: 'Sat 09:00–16:00' },
    ],
    kind: 'showroom',
    map: maps('Strada Strandului 182 Ploiesti'),
  },
  {
    id: 'ploiesti-omnia',
    city: 'Ploiești',
    name: 'Complex Omnia',
    address: 'Bd. Republicii nr. 15, etaj 2',
    phone: '0784 681 595',
    hours: [{ ro: 'Luni–Vineri 09:00–19:00', en: 'Mon–Fri 09:00–19:00' }],
    kind: 'showroom',
    map: maps('Complex Omnia Bulevardul Republicii 15 Ploiesti'),
  },
  {
    id: 'constanta',
    city: 'Constanța',
    name: 'Complex Alpin',
    address: 'Șos. Mangaliei nr. 82, etaj 1',
    phone: '0767 559 681',
    hours: [{ ro: 'Luni–Vineri 09:00–19:00', en: 'Mon–Fri 09:00–19:00' }],
    kind: 'showroom',
    map: maps('Complex Alpin Soseaua Mangaliei 82 Constanta'),
  },
  {
    id: 'buzau',
    city: 'Buzău',
    name: 'Winmark, Piața Dacia',
    address: 'Piața Dacia nr. 1 (fostul magazin Dacia)',
    phone: '0735 162 872',
    hours: [
      { ro: 'Luni–Vineri 09:30–19:00', en: 'Mon–Fri 09:30–19:00' },
      { ro: 'Sâmbătă 09:30–16:00', en: 'Sat 09:30–16:00' },
    ],
    kind: 'showroom',
    map: maps('Winmark Piata Dacia 1 Buzau'),
  },
  {
    id: 'fabrica',
    city: 'Prahova',
    name: 'Fabrica Samobi',
    address: 'Comuna Vadu Săpat, sat Ungureni, jud. Prahova',
    phone: '0733 853 257',
    hours: [{ ro: 'Vizite pe bază de programare', en: 'Visits by appointment' }],
    kind: 'factory',
    map: maps('Vadu Sapat Ungureni Prahova'),
  },
]

export const cities = [...new Set(locations.map((l) => l.city))]
export const mainPhone = '0733 853 257'
export const mainPhoneHref = '+40733853257'
export const parentSite = 'https://mobilasamobi.ro'
