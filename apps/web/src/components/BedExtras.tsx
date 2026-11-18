import clsx from 'clsx'
import { useI18n } from '~/lib/i18n'
import { formatPrice } from '~/lib/catalog'
import { legColours, legs, nightstands } from '~/lib/bedExtras'

type Props = {
  leg: number
  onLeg: (index: number) => void
  colour: number
  onColour: (index: number) => void
  withNightstands: boolean
  onNightstands: (on: boolean) => void
}

/**
 * What is chosen on top of any bed: how tall its legs stand and in which
 * colour, and whether a pair of nightstands comes with it. Same restraint as the size picker above it —
 * hairlines, the value set large, each choice saying what it adds.
 */
export function BedExtras({ leg, onLeg, colour, onColour, withNightstands, onNightstands }: Props) {
  const { t, lang } = useI18n()
  const plus = (price: number) => `+${formatPrice(price, lang)}`
  const current = legs[leg]

  return (
    <section aria-label={t('piece.extras')}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="eyebrow opacity-45">{t('piece.legs')}</p>
        <p className="eyebrow tabular-nums opacity-35">
          {current.price ? plus(current.price) : t('piece.legsIncluded')}
        </p>
      </div>

      <div className="mt-3 h-px w-full bg-ink/12" />

      <p className="mt-4 flex items-baseline gap-2">
        <span className="font-display text-2xl leading-none tabular-nums whitespace-nowrap">
          {current.label[lang]}
        </span>
        <span className="eyebrow opacity-40">{t('piece.sizeUnit')}</span>
        <span className="ml-auto text-sm opacity-60">{legColours[colour].label[lang]}</span>
      </p>

      <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
        {legs.map((item, index) => (
          <li key={item.cm}>
            <button
              type="button"
              onClick={() => onLeg(index)}
              aria-pressed={index === leg}
              aria-label={`${item.label[lang]} cm${item.price ? `, ${plus(item.price)}` : ''}`}
              className={clsx(
                'font-display text-base tabular-nums whitespace-nowrap transition-opacity duration-300',
                index === leg ? 'opacity-100 underline underline-offset-[6px]' : 'opacity-35 hover:opacity-70',
              )}
            >
              {item.label[lang]}
            </button>
          </li>
        ))}
      </ul>

      <ul className="mt-5 flex gap-3" aria-label={t('piece.legColour')}>
        {legColours.map((tone, index) => (
          <li key={tone.id}>
            <button
              type="button"
              onClick={() => onColour(index)}
              aria-pressed={index === colour}
              aria-label={tone.label[lang]}
              title={tone.label[lang]}
              className={clsx(
                'flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-300',
                index === colour ? 'border-ink' : 'border-transparent hover:border-ink/30',
              )}
            >
              <span className="h-5 w-5 rounded-full ring-1 ring-ink/15 ring-inset" style={{ background: tone.hex }} />
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        role="switch"
        aria-checked={withNightstands}
        onClick={() => onNightstands(!withNightstands)}
        className="group mt-10 flex w-full items-center gap-4 border-y border-ink/12 py-4 text-left"
      >
        <span
          className={clsx(
            'relative h-4 w-4 shrink-0 border transition-colors duration-300',
            withNightstands ? 'border-ink bg-ink' : 'border-ink/30 group-hover:border-ink/60',
          )}
          aria-hidden
        >
          {withNightstands && (
            <svg viewBox="0 0 16 16" className="absolute inset-0 h-full w-full text-paper" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M4 8.2l2.6 2.6L12 5.4" />
            </svg>
          )}
        </span>
        <span className="flex-1 text-sm">{nightstands.label[lang]}</span>
        <span className="text-sm tabular-nums opacity-60">{plus(nightstands.price)}</span>
      </button>
    </section>
  )
}
