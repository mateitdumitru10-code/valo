/**
 * The HoReCa page's copy, from the client's brief (docs/Pagina HoReCa -
 * VALLO.pdf). The brief keeps to what has been confirmed — fire rating,
 * samples, delivery and assembly were left out on purpose — so nothing is
 * added here that it does not say. "Piesă" is written "produs", as everywhere
 * else on the site.
 *
 * Kept out of i18n.tsx because it is one page's long-form copy, not interface
 * strings; the structure is the same in both languages.
 */

type Item = { title: string; body: string }

export type HorecaCopy = {
  eyebrow: string
  title: string
  lede: string
  cta: string
  intro: string
  makeEyebrow: string
  makeTitle: string
  make: Item[]
  customTitle: string
  custom: string
  fabricsTitle: string
  fabrics: string
  processEyebrow: string
  processTitle: string
  process: Item[]
  whyEyebrow: string
  whyTitle: string
  why: string[]
  /** The last reason, which points at the gallery; shown only when it has work in it. */
  whyGallery: string
  galleryEyebrow: string
  galleryTitle: string
  galleryLede: string
  groups: Record<'all' | ProjectGroup, string>
  cataloguesEyebrow: string
  cataloguesTitle: string
  faqEyebrow: string
  faqTitle: string
  faq: { q: string; a: string }[]
  closeTitle: string
  form: {
    venue: string
    venueOptions: string[]
    city: string
    seats: string
    contact: string
    contactHint: string
    submit: string
    sending: string
    success: string
    required: string
    invalidContact: string
  }
}

const ro: HorecaCopy = {
  eyebrow: 'HoReCa',
  title: 'Mobilier la comandă pentru restaurante, hoteluri, terase și plaje',
  lede: 'Producem mobilier tapițat exact pe dimensiunile spațiului tău, cu stofe pentru uz intens, de la 10–15 zile lucrătoare.',
  cta: 'Solicită ofertă',
  intro:
    'Un spațiu HoReCa are nevoie de mobilier care arată bine și rezistă la folosire zilnică. La VALLO realizăm mobilier tapițat pentru restaurante, cafenele, hoteluri, lounge-uri, terase și plaje, fabricat la dimensiunile exacte ale locației tale. Nu avem cantitate minimă: putem livra un singur produs sau un proiect complet.',
  makeEyebrow: 'Ce realizăm',
  makeTitle: 'Ce putem realiza',
  make: [
    {
      title: 'Banchete',
      body: 'Banchete făcute la dimensiunea exactă a spațiului tău, pe structură rigidă din lemn. Se potrivesc pe pereți, în colțuri sau în zone cu geometrie dificilă.',
    },
    {
      title: 'Scaune',
      body: 'Scaune tapițate pentru restaurante și cafenele, pe structură rigidă din lemn, cu stofe pentru uz intens.',
    },
    { title: 'Mese', body: 'Mese pentru sala interioară, realizate în dimensiunile cerute de proiect.' },
    {
      title: 'Mobilier pentru hoteluri',
      body: 'Paturi, tăblii și produse tapițate pentru camere, recepții și holuri, la dimensiunile cerute de proiect.',
    },
    { title: 'Zone lounge', body: 'Canapele, colțare și fotolii pentru lounge-uri, baruri și zone de așteptare.' },
    {
      title: 'Mobilier de exterior',
      body: 'Produse pentru terase, grădini de vară și plaje, tapițate cu stofe impermeabile, pe structură rigidă din lemn.',
    },
  ],
  customTitle: 'Dimensiuni la comandă',
  custom:
    'Nu producem doar modele standard. Fiecare produs este făcut după nevoile clientului, inclusiv pentru spații cu forme neregulate. Facem măsurători la fața locului, ca produsele să se potrivească din prima.',
  fabricsTitle: 'Stofe pentru uz intens',
  fabrics:
    'Avem o gamă foarte largă de stofe pentru HoReCa, majoritatea cu rezistență la abraziune de peste 100.000 de cicluri Martindale. Pentru exterior folosim stofe impermeabile. Un test Martindale măsoară cât de mult rezistă o țesătură la frecare, deci o valoare mare înseamnă o stofă care își păstrează aspectul și după ani de utilizare intensă.',
  processEyebrow: 'Proces',
  processTitle: 'Cum lucrăm',
  process: [
    { title: 'Discuție despre proiect', body: 'Tipul locației, numărul de locuri, stilul dorit.' },
    { title: 'Măsurători la fața locului', body: '' },
    { title: 'Ofertă și alegerea modelelor și stofelor', body: '' },
    { title: 'Producție', body: 'De la 10–15 zile lucrătoare, în funcție de mărimea proiectului.' },
  ],
  whyEyebrow: 'De ce VALLO',
  whyTitle: 'De ce VALLO',
  why: [
    'Dimensiuni exact după nevoile tale',
    'Fără cantitate minimă pe comandă',
    'Stofe pentru uz intens, majoritatea peste 100.000 Martindale',
    'Termen de producție de la 10–15 zile lucrătoare',
    'Garanție de peste 2 ani',
    'Măsurători la fața locului',
  ],
  whyGallery: 'Lucrări realizate pentru alte locații (vezi proiectele)',
  galleryEyebrow: 'Proiecte',
  galleryTitle: 'Lucrări realizate',
  galleryLede: 'Mobilier livrat în restaurante, hoteluri, terase și plaje.',
  groups: { all: 'Toate', restaurant: 'Restaurante și cafenele', hotel: 'Hoteluri', exterior: 'Terase și plaje' },
  cataloguesEyebrow: 'Cataloage',
  cataloguesTitle: 'Cataloage HoReCa',
  faqEyebrow: 'Întrebări',
  faqTitle: 'Întrebări frecvente',
  faq: [
    { q: 'Există o cantitate minimă?', a: 'Nu. Realizăm de la un singur produs până la proiecte complete.' },
    { q: 'Cât durează producția?', a: 'De la 10–15 zile lucrătoare, în funcție de proiect.' },
    { q: 'Ce garanție oferiți?', a: 'Peste 2 ani.' },
    { q: 'Faceți măsurători?', a: 'Da, la fața locului.' },
    {
      q: 'Aveți mobilier pentru terase și plaje?',
      a: 'Da, tapițat cu stofe impermeabile, pe structură rigidă din lemn.',
    },
  ],
  closeTitle: 'Spune-ne despre proiectul tău.',
  form: {
    venue: 'Tip locație',
    venueOptions: ['Restaurant', 'Cafenea', 'Hotel', 'Lounge / bar', 'Terasă', 'Plajă', 'Altul'],
    city: 'Oraș',
    seats: 'Număr de locuri',
    contact: 'Telefon sau email',
    contactHint: 'ca să vă putem răspunde',
    submit: 'Solicită ofertă',
    sending: 'Se trimite…',
    success: 'Am primit cererea. Revenim cu un răspuns cât mai curând.',
    required: 'Câmp obligatoriu',
    invalidContact: 'Scrieți un număr de telefon sau o adresă de email',
  },
}

const en: HorecaCopy = {
  eyebrow: 'HoReCa',
  title: 'Made-to-order furniture for restaurants, hotels, terraces and beaches',
  lede: 'We make upholstered furniture to the exact dimensions of your space, in fabrics for heavy use, from 10–15 working days.',
  cta: 'Request a quote',
  intro:
    'A HoReCa space needs furniture that looks good and stands up to daily use. At VALLO we make upholstered furniture for restaurants, cafés, hotels, lounges, terraces and beaches, built to the exact dimensions of your venue. There is no minimum order: we can deliver a single piece or a complete project.',
  makeEyebrow: 'What we make',
  makeTitle: 'What we can make',
  make: [
    {
      title: 'Banquettes',
      body: 'Banquettes made to the exact size of your space, on a rigid timber frame. They fit along walls, into corners or into awkward layouts.',
    },
    {
      title: 'Chairs',
      body: 'Upholstered chairs for restaurants and cafés, on a rigid timber frame, in fabrics for heavy use.',
    },
    { title: 'Tables', body: 'Tables for the indoor dining room, made to the dimensions the project calls for.' },
    {
      title: 'Hotel furniture',
      body: 'Beds, headboards and upholstered pieces for rooms, receptions and lobbies, to the dimensions the project calls for.',
    },
    { title: 'Lounge areas', body: 'Sofas, corner sofas and armchairs for lounges, bars and waiting areas.' },
    {
      title: 'Outdoor furniture',
      body: 'Pieces for terraces, summer gardens and beaches, upholstered in waterproof fabrics, on a rigid timber frame.',
    },
  ],
  customTitle: 'Made to measure',
  custom:
    'We do not only make standard models. Every piece is made to the client’s needs, including for irregularly shaped spaces. We measure on site, so the pieces fit the first time.',
  fabricsTitle: 'Fabrics for heavy use',
  fabrics:
    'We have a very wide range of HoReCa fabrics, most of them rated above 100,000 Martindale cycles for abrasion resistance. Outdoors we use waterproof fabrics. A Martindale test measures how well a fabric resists rubbing, so a high figure means a fabric that keeps its look after years of heavy use.',
  processEyebrow: 'Process',
  processTitle: 'How we work',
  process: [
    { title: 'Talking through the project', body: 'The kind of venue, the number of seats, the style you want.' },
    { title: 'Measuring on site', body: '' },
    { title: 'Quote, models and fabrics', body: '' },
    { title: 'Production', body: 'From 10–15 working days, depending on the size of the project.' },
  ],
  whyEyebrow: 'Why VALLO',
  whyTitle: 'Why VALLO',
  why: [
    'Dimensions made exactly to your needs',
    'No minimum order',
    'Fabrics for heavy use, most above 100,000 Martindale',
    'Production from 10–15 working days',
    'A warranty of more than 2 years',
    'Measuring on site',
  ],
  whyGallery: 'Work done for other venues (see the projects)',
  galleryEyebrow: 'Projects',
  galleryTitle: 'Finished work',
  galleryLede: 'Furniture delivered to restaurants, hotels, terraces and beaches.',
  groups: { all: 'All', restaurant: 'Restaurants and cafés', hotel: 'Hotels', exterior: 'Terraces and beaches' },
  cataloguesEyebrow: 'Catalogues',
  cataloguesTitle: 'HoReCa catalogues',
  faqEyebrow: 'Questions',
  faqTitle: 'Frequently asked questions',
  faq: [
    { q: 'Is there a minimum order?', a: 'No. We make anything from a single piece to complete projects.' },
    { q: 'How long does production take?', a: 'From 10–15 working days, depending on the project.' },
    { q: 'What warranty do you give?', a: 'More than 2 years.' },
    { q: 'Do you measure?', a: 'Yes, on site.' },
    {
      q: 'Do you have furniture for terraces and beaches?',
      a: 'Yes, upholstered in waterproof fabrics, on a rigid timber frame.',
    },
  ],
  closeTitle: 'Tell us about your project.',
  form: {
    venue: 'Type of venue',
    venueOptions: ['Restaurant', 'Café', 'Hotel', 'Lounge / bar', 'Terrace', 'Beach', 'Other'],
    city: 'City',
    seats: 'Number of seats',
    contact: 'Phone or email',
    contactHint: 'so we can reply',
    submit: 'Request a quote',
    sending: 'Sending…',
    success: 'We have your request and will come back to you as soon as we can.',
    required: 'Required',
    invalidContact: 'Enter a phone number or an email address',
  },
}

export const horeca = { ro, en }

/**
 * Finished work, taken from the "Din portofoliul nostru" pages of the 2026
 * HoReCa catalogue (public/cataloage/horeca-2026.pdf), extracted at their
 * original resolution into public/proiecte. The catalogue names neither the
 * venues nor their cities, so neither is claimed here: each photograph says
 * only what kind of place it is and what was made for it.
 */
export type ProjectGroup = 'restaurant' | 'hotel' | 'exterior'

export type Work = {
  src: string
  w: number
  h: number
  group: ProjectGroup
  delivered: { ro: string; en: string }
}

const work = (name: string, w: number, h: number, group: ProjectGroup, ro: string, en: string): Work => ({
  src: `/proiecte/${name}.webp`,
  w,
  h,
  group,
  delivered: { ro, en },
})

export const works: Work[] = [
  work('restaurant-01', 1200, 1238, 'restaurant', 'Banchete, scaune și mese', 'Banquettes, chairs and tables'),
  work('restaurant-05', 855, 551, 'restaurant', 'Banchete și scaune pentru sală', 'Banquettes and dining chairs'),
  work('hotel-01', 519, 325, 'hotel', 'Canapea pentru hol', 'Lobby sofa'),
  work('exterior-03', 586, 373, 'exterior', 'Banchete, scaune și mese pentru terasă', 'Terrace banquettes, chairs and tables'),
  work('restaurant-03', 681, 517, 'restaurant', 'Banchete capitonate', 'Channel-tufted banquettes'),
  work('hotel-03', 483, 382, 'hotel', 'Pat și tăblie tapițată', 'Bed and upholstered headboard'),
  work('restaurant-07', 511, 309, 'restaurant', 'Banchete și scaune', 'Banquettes and chairs'),
  work('exterior-01', 600, 335, 'exterior', 'Canapele, fotolii și mese de exterior', 'Outdoor sofas, armchairs and tables'),
  work('restaurant-04', 583, 505, 'restaurant', 'Scaune tapițate', 'Upholstered chairs'),
  work('hotel-02', 511, 314, 'hotel', 'Canapea și fotoliu capitonate', 'Tufted sofa and armchair'),
  work('restaurant-02', 649, 485, 'restaurant', 'Scaune și mese', 'Chairs and tables'),
  work('exterior-02', 601, 345, 'exterior', 'Colțar și măsuțe pentru plajă', 'Beach corner sofa and tables'),
  work('restaurant-06', 519, 309, 'restaurant', 'Banchetă și scaune', 'Banquette and chairs'),
  work('hotel-04', 458, 425, 'hotel', 'Pat și tăblie tapițată', 'Bed and upholstered headboard'),
  work('exterior-04', 585, 335, 'exterior', 'Șezlonguri pentru plajă', 'Beach loungers'),
  work('restaurant-08', 473, 304, 'restaurant', 'Banchetă, scaune și masă', 'Banquette, chairs and table'),
  work('hotel-05', 504, 403, 'hotel', 'Pat și tăblie tapițată', 'Bed and upholstered headboard'),
]
