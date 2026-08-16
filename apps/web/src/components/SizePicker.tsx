import { motion } from 'motion/react'
import clsx from 'clsx'
import { useI18n } from '~/lib/i18n'
import { expo } from '~/lib/motion'

type Props = {
  sizes: number[]
  active: number
  onSelect: (size: number) => void
}

/**
 * Width selector for a bed. Abstract on purpose: a photograph of a 160 next to
 * a photograph of a 180 tells you nothing, because both are shot to fill the
 * same frame. A measured line does — the bar is drawn at the true fraction of
 * the widest size offered, so a 140 really is seven tenths of a 200 on screen.
 *
 * Same restraint as the colour picker: no boxes, no shadows, hairlines only,
 * and the value itself set large in the display face.
 */
export function SizePicker({ sizes, active, onSelect }: Props) {
  const { t } = useI18n()
  const widest = Math.max(...sizes)

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
        <span className="font-display text-4xl leading-none tabular-nums">{active}</span>
        <span className="eyebrow opacity-40">{t('piece.sizeUnit')}</span>
      </p>

      {/* The measure. The track is the widest size offered; the bar is the one
          selected, at its true proportion of it. */}
      <div className="mt-5 h-px w-full bg-ink/12">
        <motion.div
          className="h-px origin-left bg-ink"
          initial={false}
          animate={{ scaleX: active / widest }}
          transition={{ duration: 0.7, ease: expo }}
        />
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
        {sizes.map((size) => {
          const selected = size === active
          return (
            <li key={size}>
              <button
                type="button"
                onClick={() => onSelect(size)}
                aria-pressed={selected}
                className={clsx(
                  'font-display text-lg tabular-nums transition-opacity duration-300',
                  selected
                    ? 'opacity-100 underline underline-offset-[6px]'
                    : 'opacity-35 hover:opacity-70',
                )}
              >
                {size}
              </button>
            </li>
          )
        })}
      </ul>

      <p className="mt-5 max-w-xs text-xs leading-relaxed opacity-40">{t('piece.sizeNote')}</p>
    </section>
  )
}
