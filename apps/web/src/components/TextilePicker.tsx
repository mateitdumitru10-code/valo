import { useState } from 'react'
import { motion } from 'motion/react'
import clsx from 'clsx'
import type { Variant } from '~/lib/catalog'
import { useI18n } from '~/lib/i18n'
import { expo } from '~/lib/motion'

type Props = {
  variants: Variant[]
  active: number
  onSelect: (index: number) => void
}

/**
 * Textile selector. The chip is a crop of the actual cloth rather than a
 * miniature of the whole sofa — at 56px a product thumbnail is unreadable, while
 * a weave is not, and it is what a showroom would put in your hand.
 *
 * Hovering previews a name without committing to it, so the row can be read
 * without a single click.
 */
export function TextilePicker({ variants, active, onSelect }: Props) {
  const { t, lang } = useI18n()
  const [preview, setPreview] = useState<number | null>(null)
  const shown = variants[preview ?? active]

  return (
    <section aria-label={t('piece.textile')}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="eyebrow opacity-45">{t('piece.textile')}</p>
        <p className="eyebrow tabular-nums opacity-35">
          {String(variants.length).padStart(2, '0')} {t('piece.options')}
        </p>
      </div>

      <div className="mt-3 h-px w-full bg-ink/12" />

      {/* The name is the headline here; the chips below are the control. */}
      <div className="mt-4 h-8 overflow-hidden">
        <motion.p
          key={shown.tone[lang]}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          transition={{ duration: 0.5, ease: expo }}
          className="font-display text-2xl leading-none"
        >
          {shown.tone[lang]}
        </motion.p>
      </div>

      <ul className="mt-5 flex flex-wrap gap-3">
        {variants.map((variant, i) => {
          const selected = i === active
          return (
            <li key={variant.src}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                onPointerEnter={() => setPreview(i)}
                onPointerLeave={() => setPreview(null)}
                onFocus={() => setPreview(i)}
                onBlur={() => setPreview(null)}
                aria-pressed={selected}
                aria-label={variant.tone[lang]}
                title={variant.tone[lang]}
                className={clsx(
                  'group relative block p-1 transition-colors duration-500',
                  // The selection is a hairline frame held off the cloth, not a
                  // heavy border drawn on it.
                  selected ? 'ring-1 ring-ink' : 'ring-1 ring-transparent hover:ring-ink/25',
                )}
              >
                <span
                  className="block h-12 w-12 bg-cover bg-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06] md:h-14 md:w-14"
                  style={{
                    backgroundColor: variant.swatch,
                    backgroundImage: `url(${variant.chip})`,
                  }}
                />
              </button>
            </li>
          )
        })}
      </ul>

      <p className="mt-4 max-w-xs text-xs leading-relaxed opacity-40">{t('piece.textileNote')}</p>
    </section>
  )
}
