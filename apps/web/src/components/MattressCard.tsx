import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MattressThumb } from './MattressLayers'
import type { Mattress } from '~/lib/mattresses'
import { useI18n } from '~/lib/i18n'

/** One model on the list: its drawing, which opens into layers on hover. */
export function MattressCard({ mattress, index }: { mattress: Mattress; index?: number }) {
  const { lang } = useI18n()
  const [open, setOpen] = useState(false)
  return (
    <article className="group">
      <Link
        to={`/saltele/${mattress.slug}`}
        onPointerEnter={() => setOpen(true)}
        onPointerLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <div className="aspect-[4/3] w-full overflow-hidden bg-ink/[0.04] px-[8%] py-[5%]">
          <MattressThumb mattress={mattress} open={open} />
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-ink/10 pt-3">
          <div>
            <h3 className="font-display text-lg leading-tight md:text-xl">{mattress.name}</h3>
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
