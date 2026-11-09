/**
 * The HoReCa catalogues, newest first. The PDFs and covers are Samobi's own,
 * copied from mobilasamobi.ro/cataloage-mobila into public/cataloage: that
 * server sends no CORS headers, so the viewer could not read the PDFs from
 * there.
 */
export type Catalogue = {
  id: string
  title: string
  year: number
  pdf: string
  cover: string
  /** Cover pixel size, so the card reserves its space before the image loads. */
  w: number
  h: number
}

export const catalogues: Catalogue[] = [
  {
    id: 'horeca-2026',
    title: 'Catalog Samobi HoReCa',
    year: 2026,
    pdf: '/cataloage/horeca-2026.pdf',
    cover: '/cataloage/horeca-2026-cover.webp',
    w: 606,
    h: 779,
  },
  {
    id: 'horeca-2025',
    title: 'Catalog Samobi HoReCa',
    year: 2025,
    pdf: '/cataloage/horeca-2025.pdf',
    cover: '/cataloage/horeca-2025-cover.jpg',
    w: 724,
    h: 1024,
  },
]
