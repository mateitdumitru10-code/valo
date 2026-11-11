import { category, collectionName, pieces, type Piece } from './catalog'

/**
 * Search over the catalogue, entirely in the browser: forty-odd pieces fit in
 * the bundle already, so there is nothing to ask a server.
 *
 * People type without diacritics ("coltar", "canapea extensibila") and in
 * either language, so both sides are folded to bare lowercase ASCII and every
 * piece also answers to the everyday words for what it is.
 */
export const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

/** The words people use for each kind of piece, beyond the category's own name. */
const KIND_WORDS: Record<string, string> = {
  sectionals: 'coltar coltare colt canapea de colt corner sectional sectionals',
  sofas: 'canapea canapele sofa sofas couch',
  beds: 'pat paturi bed beds dormitor bedroom',
  armchairs: 'fotoliu fotolii armchair armchairs chair',
  hallway: 'hol holuri hallway bench banca',
  seating: 'scaun scaune demifotoliu seating chair',
}

type Entry = { piece: Piece; name: string; words: string[] }

const index: Entry[] = pieces.map((piece) => {
  const kind = category(piece.category)
  const name = fold(piece.name)
  const words = fold(
    [
      piece.name,
      kind?.ro,
      kind?.en,
      piece.collection ? `${collectionName(piece.collection)} colectia collection` : '',
      KIND_WORDS[piece.category] ?? '',
      piece.slug.replace(/-/g, ' '),
    ].join(' '),
  ).split(' ')
  return { piece, name, words }
})

/**
 * Pieces matching every word of the query, best first. A word matches when it
 * begins a word of the piece ("ext" finds "extensibilă"); the name outranks
 * the category, and a name that starts with the query outranks the rest.
 */
export function searchPieces(query: string): Piece[] {
  const terms = fold(query).split(' ').filter(Boolean)
  if (!terms.length) return []

  // A query word also matches a shorter word it extends — "extensibila" finds
  // "extensibil", "coltare" finds "coltar" — once that word is long enough to
  // be a stem rather than a coincidence.
  const hits = (word: string, term: string) =>
    word.startsWith(term) || (word.length >= 5 && term.startsWith(word))

  const scored: { piece: Piece; score: number; order: number }[] = []
  index.forEach((entry, order) => {
    let score = 0
    for (const term of terms) {
      const nameWords = entry.name.split(' ')
      if (nameWords.some((w) => w === term)) score += 6
      else if (nameWords.some((w) => hits(w, term))) score += 4
      else if (entry.words.some((w) => hits(w, term))) score += 1
      else return
    }
    if (entry.name.startsWith(terms.join(' '))) score += 5
    scored.push({ piece: entry.piece, score, order })
  })

  return scored.sort((a, b) => b.score - a.score || a.order - b.order).map((s) => s.piece)
}
