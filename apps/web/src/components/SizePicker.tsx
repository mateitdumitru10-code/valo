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

/** The dial's long side on screen. The bed's length never changes; its width does. */
const LENGTH_PX = 168

/**
 * Mattress size, shown as a dial rather than as a list.
 *
 * The plate is the mattress seen from above, drawn at its true proportion: the
 * length holds still and the width opens, so 140 × 200 stands at seven tenths
 * of 200 × 200 on screen. Photography cannot carry this — every bed is shot to
 * fill the same frame — so the drawing is the only honest place the difference
 * can live.
 *
 * Hairline outline, no fill, the figure set inside in the display face. Same
 * restraint as the colour picker: no boxes, no shadows, no rounded corners.
 */
export function SizePicker({ sizes, active, onSelect }: Props) {
  const { t } = useI18n()
  const [width, length] = active
  const longest = Math.max(...sizes.map(([, l]) => l))

  return (
    <section aria-label={t('piece.size')}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="eyebrow opacity-45">{t('piece.size')}</p>
        <p className="eyebrow tabular-nums opacity-35">
          {String(sizes.length).padStart(2, '0')} {t('piece.sizeOptions')}
        </p>
      </div>

      <div className="mt-3 h-px w-full bg-ink/12" />

      {/* The dial. Height is fixed to the longest length offered, so a shorter
          mattress would read shorter too; only the width animates today. */}
      <div className="mt-7 flex justify-center">
        <motion.div
          className="relative border border-ink/25"
          initial={false}
          animate={{
            width: (width / longest) * LENGTH_PX,
            height: (length / longest) * LENGTH_PX,
          }}
          transition={{ duration: 0.7, ease: expo }}
        >
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <span className="font-display text-xl leading-none tabular-nums whitespace-nowrap">
              {width} × {length}
            </span>
            <span className="eyebrow opacity-40">{t('piece.sizeUnit')}</span>
          </span>
        </motion.div>
      </div>

      <ul className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-3">
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

      <p className="mt-6 max-w-xs text-xs leading-relaxed opacity-40">{t('piece.sizeNote')}</p>
    </section>
  )
}
