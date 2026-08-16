import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { category as findCategory, formatPrice, type Piece } from '~/lib/catalog'
import { useI18n } from '~/lib/i18n'
import { Img } from './Img'

type Props = {
  piece: Piece
  index?: number
  sizes?: string
  className?: string
  ratio?: 'portrait' | 'landscape' | 'square'
}

const ratios = {
  portrait: 'aspect-[4/5]',
  landscape: 'aspect-[4/3]',
  square: 'aspect-square',
}

export function PieceCard({
  piece,
  index,
  sizes = '(max-width: 768px) 90vw, 30vw',
  className,
  ratio = 'landscape',
}: Props) {
  const { lang } = useI18n()
  const kind = findCategory(piece.category)
  const price = formatPrice(piece.price, lang)

  return (
    <article className={clsx('group', className)}>
      <Link to={`/piese/${piece.slug}`}>
        <Img
          img={piece.cover}
          alt={piece.name}
          sizes={sizes}
          zoom
          className={clsx('w-full', ratios[ratio])}
        />

        <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-ink/10 pt-3">
          <div>
            <h3 className="font-display text-xl leading-tight md:text-2xl">{piece.name}</h3>
            <p className="eyebrow mt-1.5 opacity-45">
              {kind ? (lang === 'ro' ? kind.ro : kind.en) : ''}
            </p>
          </div>
          <div className="text-right">
            {index !== undefined && (
              <span className="eyebrow block opacity-35 tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
            )}
            {price && <span className="mt-1 block text-sm tabular-nums">{price}</span>}
          </div>
        </div>
      </Link>
    </article>
  )
}
