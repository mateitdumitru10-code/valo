import { motion } from 'motion/react'
import clsx from 'clsx'
import type { Size } from '~/lib/catalog'
import { useI18n } from '~/lib/i18n'
import { expo } from '~/lib/motion'

type Props = {
  sizes: Size[]
  active: Size
  onSelect: (size: Size) => void
}

/**
 * Mattress size. The figure is the whole size — 140 × 200 — because a width on
 * its own never says what it is a width of.
 *
 * The measure beneath it is drawn at the true fraction of the widest size
 * offered, so 140 sits at seven tenths of 200 on screen. Photography cannot
 * carry that: every bed is shot to fill the same frame.
 *
 * Same restraint as the colour picker — hairlines, no boxes, no shadows, and
 * the value set large in the display face.
 */
export function SizePicker({ sizes, active, onSelect }: Props) {
  const { t } = useI18n()
  const [width, length] = active
  const widest = Math.max(...sizes.map(([w]) => w))

  return (
    <section aria-label={t('piece.size')}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="eyebrow opacity-45">{t('piece.size')}</p>
        <p className="eyebrow tabular-nums opacity-35">
          {String(sizes.length).padStart(2, '0')} {t('piece.sizeOptions')}
        </p>
      </div>

      <div className="mt-3 h-px w-full bg-ink/12" />

      <p className="mt-4 flex items-baseline gap-2">
        <span className="font-display text-2xl leading-none tabular-nums whitespace-nowrap">
          {width} × {length}
        </span>
        <span className="eyebrow opacity-40">{t('piece.sizeUnit')}</span>
      </p>

      {/* The track is the widest size offered; the bar is the one selected, at
          its true proportion of it. */}
      <div className="mt-5 h-px w-full bg-ink/12">
        <motion.div
          className="h-px origin-left bg-ink"
          initial={false}
          animate={{ scaleX: width / widest }}
          transition={{ duration: 0.7, ease: expo }}
        />
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
        {sizes.map(([w, l]) => {
          const selected = w === width && l === length
          return (
            <li key={`${w}x${l}`}>
              <button
                type="button"
                onClick={() => onSelect([w, l])}
                aria-pressed={selected}
                className={clsx(
                  'font-display text-base tabular-nums whitespace-nowrap transition-opacity duration-300',
                  selected
                    ? 'opacity-100 underline underline-offset-[6px]'
                    : 'opacity-35 hover:opacity-70',
                )}
              >
                {w} × {l}
              </button>
            </li>
          )
        })}
      </ul>

      <p className="mt-5 max-w-xs text-xs leading-relaxed opacity-40">{t('piece.sizeNote')}</p>
    </section>
  )
}
