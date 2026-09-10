import { motion } from 'motion/react'
import clsx from 'clsx'
import type { Options } from '~/lib/catalog'
import { useI18n } from '~/lib/i18n'
import { expo } from '~/lib/motion'

type Props = {
  options: Options
  active: number
  onSelect: (index: number) => void
}

/**
 * What the piece is offered in — a mattress size, an overall dimension, a
 * choice of mattress. The figure is the whole size — 140 × 200 — because a
 * width on its own never says what it is a width of.
 *
 * Where the options are lengths, the measure beneath is drawn at the true
 * fraction of the largest offered, so 140 sits at seven tenths of 200 on
 * screen. Photography cannot carry that: every bed is shot to fill the same
 * frame. Where they are not lengths — Relaxa against memory foam — there is
 * nothing to compare, and the bar is left off rather than drawn between two
 * numbers that do not exist.
 *
 * Same restraint as the colour picker — hairlines, no boxes, no shadows, and
 * the value set large in the display face.
 */
export function SizePicker({ options, active, onSelect }: Props) {
  const { t, lang } = useI18n()
  const items = options.items
  const current = items[Math.min(active, items.length - 1)]
  const measures = items.map((item) => item.measure)
  const scaled = measures.every((m): m is number => typeof m === 'number')
  const largest = scaled ? Math.max(...measures) : 0
  const label = (index: number) => (lang === 'ro' ? items[index].ro : items[index].en)

  return (
    <section aria-label={t(options.kind === 'spec' ? 'piece.mattress' : 'piece.size')}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="eyebrow opacity-45">
          {t(options.kind === 'spec' ? 'piece.mattress' : 'piece.size')}
        </p>
        <p className="eyebrow tabular-nums opacity-35">
          {String(items.length).padStart(2, '0')}{' '}
          {t(options.kind === 'spec' ? 'piece.mattressOptions' : 'piece.sizeOptions')}
        </p>
      </div>

      <div className="mt-3 h-px w-full bg-ink/12" />

      <p className="mt-4 flex items-baseline gap-2">
        <span className="font-display text-2xl leading-none tabular-nums whitespace-nowrap">
          {lang === 'ro' ? current.ro : current.en}
        </span>
        {scaled && <span className="eyebrow opacity-40">{t('piece.sizeUnit')}</span>}
      </p>

      {/* The track is the largest option offered; the bar is the one selected,
          at its true proportion of it. */}
      {scaled && (
        <div className="mt-5 h-px w-full bg-ink/12">
          <motion.div
            className="h-px origin-left bg-ink"
            initial={false}
            animate={{ scaleX: (current.measure ?? 0) / largest }}
            transition={{ duration: 0.7, ease: expo }}
          />
        </div>
      )}

      <ul className={clsx('flex flex-wrap gap-x-6 gap-y-3', scaled ? 'mt-4' : 'mt-5')}>
        {items.map((item, index) => {
          const selected = index === Math.min(active, items.length - 1)
          return (
            <li key={`${item.ro}-${index}`}>
              <button
                type="button"
                onClick={() => onSelect(index)}
                aria-pressed={selected}
                className={clsx(
                  'font-display text-base tabular-nums whitespace-nowrap transition-opacity duration-300',
                  selected
                    ? 'opacity-100 underline underline-offset-[6px]'
                    : 'opacity-35 hover:opacity-70',
                )}
              >
                {label(index)}
              </button>
            </li>
          )
        })}
      </ul>

      <p className="mt-5 max-w-xs text-xs leading-relaxed opacity-40">
        {t(options.kind === 'spec' ? 'piece.mattressNote' : 'piece.sizeNote')}
      </p>
    </section>
  )
}
