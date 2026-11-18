import { Link } from 'react-router-dom'
import { shots, type Mattress } from '~/lib/mattresses'
import { useI18n } from '~/lib/i18n'

const SIZES = '(max-width: 640px) 92vw, 46vw'
const srcSet = (src: string) => `/media/saltele/${src}-700.webp 700w, /media/saltele/${src}-1400.webp 1400w`

/** One model on the list: its studio shot, which turns to its layers on hover. */
export function MattressCard({ mattress, index }: { mattress: Mattress; index?: number }) {
  const { lang } = useI18n()
  const [main, layers] = shots(mattress)
  const tx = (t: { ro: string; en: string }) => (lang === 'ro' ? t.ro : t.en)
  return (
    <article className="group">
      <Link to={`/saltele/${mattress.slug}`}>
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-white">
          <img
            src={`/media/saltele/${main.src}-1400.webp`}
            srcSet={srcSet(main.src)}
            sizes={SIZES}
            alt={tx(main.alt)}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-contain p-[6%] transition duration-700 group-hover:opacity-0 group-focus-visible:opacity-0"
          />
          <img
            src={`/media/saltele/${layers.src}-1400.webp`}
            srcSet={srcSet(layers.src)}
            sizes={SIZES}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-contain p-[6%] opacity-0 transition duration-700 group-hover:opacity-100 group-focus-visible:opacity-100"
          />
          <span className="eyebrow absolute bottom-4 right-5 translate-y-1 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-60 group-focus-visible:opacity-60">
            {lang === 'ro' ? 'Vezi salteaua' : 'View mattress'} →
          </span>
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-ink/10 pt-3">
          <div>
            <h3 className="font-display text-lg leading-tight underline decoration-transparent underline-offset-4 transition-colors duration-500 group-hover:decoration-ink/30 md:text-xl">
              {mattress.name}
            </h3>
            <p className="eyebrow mt-1.5 opacity-45">{tx(mattress.kind)}</p>
          </div>
          {index !== undefined && (
            <span className="eyebrow opacity-35 tabular-nums">{String(index + 1).padStart(2, '0')}</span>
          )}
        </div>
      </Link>
    </article>
  )
}
