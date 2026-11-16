import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MattressThumb } from './MattressLayers'
import type { Mattress } from '~/lib/mattresses'
import { useI18n } from '~/lib/i18n'

/** One model on the list: its drawing, which opens into layers on hover. */
export function MattressCard({ mattress, index }: { mattress: Mattress; index?: number }) {
  const { lang } = useI18n()
  const [open, setOpen] = useState(false)
  // What the key lists: every layer, and the side band.
  const count = mattress.layers.length + 1
  return (
    <article className="group">
      <Link
        to={`/saltele/${mattress.slug}`}
        onPointerEnter={() => setOpen(true)}
        onPointerLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink/[0.035]">
          {/* A soft pool of light behind the mattress, as on a studio sweep. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_45%,rgb(255_255_255/0.6),transparent_75%)] transition-opacity duration-700 group-hover:opacity-100 md:opacity-70"
          />
          <div className="absolute inset-[6%]">
            <MattressThumb mattress={mattress} open={open} />
          </div>
          <span className="eyebrow absolute bottom-4 left-5 tabular-nums opacity-40">
            {count} {lang === 'ro' ? 'straturi' : 'layers'}
          </span>
          <span className="eyebrow absolute bottom-4 right-5 translate-y-1 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-60 group-focus-visible:opacity-60">
            {lang === 'ro' ? 'Vezi salteaua' : 'View mattress'} →
          </span>
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-ink/10 pt-3">
          <div>
            <h3 className="font-display text-lg leading-tight underline decoration-transparent underline-offset-4 transition-colors duration-500 group-hover:decoration-ink/30 md:text-xl">
              {mattress.name}
            </h3>
            <p className="eyebrow mt-1.5 opacity-45">{lang === 'ro' ? mattress.kind.ro : mattress.kind.en}</p>
          </div>
          {index !== undefined && (
            <span className="eyebrow opacity-35 tabular-nums">{String(index + 1).padStart(2, '0')}</span>
          )}
        </div>
      </Link>
    </article>
  )
}
