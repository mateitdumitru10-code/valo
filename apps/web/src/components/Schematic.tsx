import { motion } from 'motion/react'
import type { Schematic as Drawing } from '~/lib/catalog'
import { useI18n, type Key } from '~/lib/i18n'
import { Eyebrow } from './UI'
import { expo, viewport } from '~/lib/motion'

/**
 * The workshop's plan drawing, given its own band on the page.
 *
 * The drawing arrives as a flat grey screenshot; scripts/schematics.mjs turns
 * its lightness into alpha and recolours it in ink, so here it can sit directly
 * on the paper ground with nothing boxing it in. Registration ticks at the
 * corners do the framing that a border would otherwise have to do.
 */
export function Schematic({ drawing, name }: { drawing: Drawing; name: string }) {
  const { t } = useI18n()
  // Only the figures the drawing actually carries: a sofa without a chaise has
  // one depth, a sectional has two.
  const figures: [Key, number][] = (
    [
      ['piece.width', drawing.cm?.width],
      ['piece.depth', drawing.cm?.depth],
      ['piece.depthBack', drawing.cm?.depthBack],
      ['piece.seat', drawing.cm?.seat],
    ] satisfies [Key, number | undefined][]
  ).flatMap(([key, value]) => (typeof value === 'number' ? [[key, value] as [Key, number]] : []))

  return (
    <section className="gutter border-t border-ink/12 py-20 md:py-28">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-3">
          <Eyebrow>{t('piece.plan')}</Eyebrow>
          <h2 className="display-md mt-5">{t('piece.planTitle')}</h2>

          <dl className="mt-10 border-t border-ink/12">
            {figures.map(([key, value], i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ duration: 0.6, ease: expo, delay: i * 0.06 }}
                className="flex items-baseline justify-between gap-4 border-b border-ink/12 py-3"
              >
                <dt className="eyebrow opacity-45">{t(key)}</dt>
                <dd className="font-display text-xl tabular-nums">
                  {value}
                  <span className="ml-1 text-sm opacity-45">cm</span>
                </dd>
              </motion.div>
            ))}
          </dl>

          <p className="mt-5 max-w-xs text-xs leading-relaxed opacity-40">
            {t('piece.planNote')}
          </p>
        </div>

        <motion.figure
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={viewport}
          transition={{ duration: 1, ease: expo }}
          className="relative md:col-span-8 md:col-start-5"
        >
          {/* Registration ticks — a drawing sheet, not a framed picture. */}
          {[
            'top-0 left-0 border-t border-l',
            'top-0 right-0 border-t border-r',
            'bottom-0 left-0 border-b border-l',
            'bottom-0 right-0 border-b border-r',
          ].map((corner) => (
            <span
              key={corner}
              className={`pointer-events-none absolute h-5 w-5 border-ink/25 ${corner}`}
              aria-hidden
            />
          ))}

          <img
            src={drawing.src}
            width={drawing.w}
            height={drawing.h}
            alt={`${name} — ${t('piece.plan')}`}
            loading="lazy"
            decoding="async"
            className="mx-auto w-full max-w-3xl px-10 py-8 mix-blend-multiply"
          />
        </motion.figure>
      </div>
    </section>
  )
}
