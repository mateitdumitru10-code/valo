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
 * Colour selector. Each swatch is the piece itself, upholstered in that colour,
 * on the same white field as the photograph above — a crop of cloth tells you
 * the shade but not what the shade does to the form.
 *
 * Restraint carries the luxury here: no boxes, no shadows, no rounded corners.
 * A hairline rule under the label, a hairline frame held off the selected
 * swatch, and the colour's name set large in the display face. Hovering a
 * swatch previews its name without committing, so the range reads at a glance.
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

      <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-5">
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
                className="group block"
              >
                <span
                  className={clsx(
                    'block p-[3px] transition-colors duration-500',
                    selected
                      ? 'ring-1 ring-ink'
                      : 'ring-1 ring-transparent hover:ring-ink/20',
                  )}
                >
                  <img
                    src={variant.chip}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    style={{ backgroundColor: variant.swatch }}
                    className={clsx(
                      'h-14 w-20 object-cover object-center transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] md:h-16 md:w-24',
                      selected ? 'opacity-100' : 'opacity-80 group-hover:opacity-100',
                    )}
                  />
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <p className="mt-5 max-w-xs text-xs leading-relaxed opacity-40">{t('piece.textileNote')}</p>
    </section>
  )
}
