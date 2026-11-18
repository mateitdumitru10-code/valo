import clsx from 'clsx'
import { useI18n } from '~/lib/i18n'
import { chaiseSides } from '~/lib/chaise'

/**
 * Left or right chaise, drawn as the sofa seen from above so the choice is
 * the shape, not just a word.
 */
export function ChaiseSide({ side, onSide }: { side: number; onSide: (index: number) => void }) {
  const { t, lang } = useI18n()

  return (
    <section aria-label={t('piece.chaise')}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="eyebrow opacity-45">{t('piece.chaise')}</p>
        <p className="eyebrow opacity-35">{t('piece.chaiseFree')}</p>
      </div>

      <div className="mt-3 h-px w-full bg-ink/12" />

      <ul className="mt-5 flex gap-4">
        {chaiseSides.map((option, index) => (
          <li key={option.id}>
            <button
              type="button"
              onClick={() => onSide(index)}
              aria-pressed={index === side}
              className={clsx(
                'flex items-center gap-3 transition-opacity duration-300',
                index === side ? 'opacity-100' : 'opacity-35 hover:opacity-70',
              )}
            >
              <svg width="44" height="26" viewBox="0 0 44 26" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
                {index === 0 ? (
                  <path d="M1 1h42v12H15v12H1z" />
                ) : (
                  <path d="M1 1h42v24H29V13H1z" />
                )}
              </svg>
              <span
                className={clsx(
                  'font-display text-base',
                  index === side && 'underline underline-offset-[6px]',
                )}
              >
                {option.label[lang]}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-5 max-w-xs text-xs leading-relaxed opacity-40">{t('piece.chaiseNote')}</p>
    </section>
  )
}
