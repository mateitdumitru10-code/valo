import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import clsx from 'clsx'
import { mattress, type Layer } from '~/lib/mattresses'
import { useI18n } from '~/lib/i18n'
import { expo } from '~/lib/motion'

/*
 * An exploded axonometric drawing of the mattress, drawn rather than rendered:
 * every slab is three polygons computed from its thickness, so the drawing
 * follows the data when the workshop confirms the real layers.
 *
 * Projection: the long side (x) runs gently down to the right, the width (y)
 * steeply down to the left, height (z) straight up — enough of the top to read
 * the quilting, enough of both sides to read the stack.
 */
const L = 200 // length, cm
const W = 160 // width, cm
const K = 2.4 // vertical exaggeration: a 22 cm mattress is a sliver at true scale
const GAP = 22 // lift between slabs when exploded, in drawing units

const A = (14 * Math.PI) / 180
const B = (38 * Math.PI) / 180
const ca = Math.cos(A)
const sa = Math.sin(A)
const cb = Math.cos(B)
const sb = Math.sin(B)

type Pt = [number, number]
const P = (x: number, y: number, z: number): Pt => [x * ca - y * cb, x * sa + y * sb - z]
const poly = (pts: Pt[]) => pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')

/** Darken a hex colour by a factor, for the shaded faces. */
function shade(hex: string, f: number) {
  const n = parseInt(hex.slice(1), 16)
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * f))
  return `rgb(${c.join(',')})`
}

const layers: Layer[] = mattress.layers
const n = layers.length
// Assembled heights, bottom up.
const base: number[] = []
{
  let z = 0
  for (let i = n - 1; i >= 0; i--) {
    base[i] = z
    z += layers[i].draw * K
  }
}
const total = layers.reduce((sum, l) => sum + l.draw * K, 0)
const lift = (i: number) => (n - 1 - i) * GAP
const coreTop = base[0] // top of the foam, bottom of the top cover
const coreBottom = base[n - 1] + layers[n - 1].draw * K

// Frame: the exploded stack, the floor shadow, and room for the numbered leaders.
const topY = P(0, 0, total + lift(0))[1]
const bottomY = P(L, W, 0)[1]
const leftX = P(0, W, 0)[0]
const rightX = P(L, 0, 0)[0]
const LEAD = rightX + 26
const PAD = 14
const VIEW = `${leftX - PAD} ${topY - PAD} ${LEAD + 30 - leftX + PAD} ${bottomY - topY + PAD * 2 + 10}`

/** Where a slab's leader starts: the middle of its short end face. */
const anchor = (z0: number, h: number): Pt => P(L, W * 0.55, z0 + h / 2)

const textureFor: Record<Layer['texture'], string> = {
  quilt: 'url(#m-quilt)',
  knit: 'url(#m-knit)',
  foam: 'url(#m-pores)',
  'foam-speckled': 'url(#m-specks)',
}

type Props = {
  active: string | null
  onActive: (id: string | null) => void
  exploded: boolean
  onExploded: (v: boolean) => void
  /** Leader numbers, by layer id, matching the legend. */
  numbers: Record<string, string>
}

export function MattressDrawing({ active, onActive, exploded, onExploded, numbers }: Props) {
  const { lang } = useI18n()
  const still = useReducedMotion()
  const ref = useRef<SVGSVGElement>(null)
  // The numbers are drawn in the drawing's own units, so on a phone, where the
  // drawing is shrunk to a third, they are drawn larger to stay legible.
  const [small, setSmall] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(max-width: 640px)')
    const update = () => setSmall(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  const label = small ? 11 : 6
  const seen = useInView(ref, { once: true, margin: '-20% 0px -20% 0px' })
  // Shown assembled first; it opens once, as it comes into view.
  useEffect(() => {
    if (!seen) return
    if (still) return onExploded(true)
    const t = setTimeout(() => onExploded(true), 450)
    return () => clearTimeout(t)
  }, [seen, still, onExploded])

  const open = exploded && active !== 'band'
  const ease = still ? { duration: 0 } : { duration: 1.1, ease: expo }
  const dim = (id: string) => (active && active !== id ? 0.28 : 1)

  // The floor shadow: the footprint, blurred, a touch larger than the bed.
  const shadow = poly([P(-6, -4, 0), P(L + 6, -4, 0), P(L + 8, W + 8, 0), P(-6, W + 8, 0)])

  return (
    <svg
      ref={ref}
      viewBox={VIEW}
      className="h-auto w-full select-none"
      role="img"
      aria-label={
        lang === 'ro'
          ? `${mattress.name.ro}, în secțiune: ${layers.map((l) => l.name.ro).join(', ')}.`
          : `${mattress.name.en}, layer by layer: ${layers.map((l) => l.name.en).join(', ')}.`
      }
    >
      <defs>
        {/* Wave quilting, laid in the plane of the top face. */}
        <pattern
          id="m-quilt"
          patternUnits="userSpaceOnUse"
          width="34"
          height="22"
          patternTransform={`matrix(${ca} ${sa} ${-cb} ${sb} 0 0)`}
        >
          <path
            d="M0 5.5 C 8.5 -1, 8.5 12, 17 5.5 S 25.5 -1, 34 5.5 M0 16.5 C 8.5 10, 8.5 23, 17 16.5 S 25.5 10, 34 16.5"
            fill="none"
            stroke="#b9c9a3"
            strokeWidth="0.9"
          />
          <circle cx="6" cy="11" r="0.45" fill="#9fb77f" />
          <circle cx="22" cy="0" r="0.45" fill="#9fb77f" />
          <circle cx="28" cy="11" r="0.45" fill="#9fb77f" />
          <circle cx="12" cy="22" r="0.45" fill="#9fb77f" />
        </pattern>
        <pattern id="m-knit" patternUnits="userSpaceOnUse" width="3" height="3">
          <circle cx="1.5" cy="1.5" r="0.32" fill="#c9d3bb" />
        </pattern>
        {/* Open-cell pores, and the darker flecks in the blue foam. */}
        <pattern id="m-pores" patternUnits="userSpaceOnUse" width="9" height="7">
          <circle cx="1.2" cy="1.4" r="0.4" fill="#000" opacity="0.09" />
          <circle cx="5.6" cy="3.1" r="0.35" fill="#000" opacity="0.07" />
          <circle cx="3.4" cy="5.6" r="0.45" fill="#000" opacity="0.08" />
          <circle cx="7.8" cy="6.2" r="0.3" fill="#fff" opacity="0.4" />
        </pattern>
        <pattern id="m-specks" patternUnits="userSpaceOnUse" width="13" height="9">
          <circle cx="1.2" cy="1.4" r="0.4" fill="#000" opacity="0.08" />
          <circle cx="6.6" cy="3.6" r="0.35" fill="#000" opacity="0.07" />
          <circle cx="3.4" cy="7.1" r="0.42" fill="#1d3f8a" opacity="0.55" />
          <circle cx="10.4" cy="2.2" r="0.32" fill="#1d3f8a" opacity="0.4" />
          <circle cx="11.6" cy="7.6" r="0.4" fill="#000" opacity="0.07" />
        </pattern>
        {/* 3D spacer mesh: a tight grid of open cells. */}
        <pattern id="m-mesh" patternUnits="userSpaceOnUse" width="2.6" height="2.2">
          <circle cx="1.3" cy="1.1" r="0.62" fill="#6f9410" opacity="0.55" />
        </pattern>
        {/* Light from the upper left, across every top face. */}
        <linearGradient id="m-light" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="1" stopColor="#000" stopOpacity="0.04" />
        </linearGradient>
        <filter id="m-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      <polygon points={shadow} fill="#14120f" opacity={0.13} filter="url(#m-soft)" />

      {/* Bottom slab first, so each one above paints over the one below. */}
      {[...layers.keys()].reverse().map((i) => {
        const layer = layers[i]
        const z0 = base[i]
        const h = layer.draw * K
        const z1 = z0 + h
        const top = poly([P(0, 0, z1), P(L, 0, z1), P(L, W, z1), P(0, W, z1)])
        const front = poly([P(0, W, z0), P(L, W, z0), P(L, W, z1), P(0, W, z1)])
        const end = poly([P(L, 0, z0), P(L, W, z0), P(L, W, z1), P(L, 0, z1)])
        const texture = textureFor[layer.texture]
        const [ax, ay] = anchor(z0, h)
        const seam = layer.id === 'core'
        return (
          <motion.g
            key={layer.id}
            initial={false}
            animate={{ y: open ? -lift(i) : 0, opacity: dim(layer.id) }}
            transition={ease}
            onPointerEnter={() => onActive(layer.id)}
            onPointerLeave={() => onActive(null)}
            style={{ cursor: 'default' }}
          >
            <polygon points={top} fill={layer.tone} />
            <polygon points={top} fill={texture} />
            <polygon points={top} fill="url(#m-light)" />
            <polygon points={front} fill={shade(layer.tone, 0.92)} />
            <polygon points={front} fill={texture === 'url(#m-quilt)' ? 'url(#m-knit)' : texture} />
            <polygon points={end} fill={shade(layer.tone, 0.82)} />
            <polygon points={end} fill={texture === 'url(#m-quilt)' ? 'url(#m-knit)' : texture} />
            {seam && (
              // The core is two sheets bonded together: the glue line shows.
              <polyline
                points={poly([P(0, W, z0 + h / 2), P(L, W, z0 + h / 2), P(L, 0, z0 + h / 2)])}
                fill="none"
                stroke={shade(layer.tone, 0.7)}
                strokeWidth={0.5}
              />
            )}
            <g fill="none" stroke="#14120f" strokeOpacity={0.55} strokeWidth={0.45} strokeLinejoin="round">
              <polygon points={top} />
              <polygon points={front} />
              <polygon points={end} />
            </g>
            {/* Leader to the number, travelling with its slab. */}
            <motion.g initial={false} animate={{ opacity: open ? 1 : 0 }} transition={ease}>
              <line x1={ax} y1={ay} x2={LEAD} y2={ay} stroke="#14120f" strokeOpacity={0.4} strokeWidth={0.35} />
              <circle cx={ax} cy={ay} r={0.9} fill="#14120f" />
              <text
                x={LEAD + 4}
                y={ay}
                dominantBaseline="middle"
                className="font-sans"
                fontSize={label}
                letterSpacing={0.6}
                fill="#14120f"
              >
                {numbers[layer.id]}
              </text>
            </motion.g>
          </motion.g>
        )
      })}

      {/* The mesh band: the mattress's sides when it is closed. */}
      {(() => {
        const front = poly([P(0, W, coreBottom), P(L, W, coreBottom), P(L, W, coreTop), P(0, W, coreTop)])
        const end = poly([P(L, 0, coreBottom), P(L, W, coreBottom), P(L, W, coreTop), P(L, 0, coreTop)])
        const [ax, ay] = anchor(coreBottom, coreTop - coreBottom)
        return (
          <motion.g
            initial={false}
            animate={{ opacity: open ? 0 : active && active !== 'band' ? 0.28 : 1 }}
            transition={ease}
            style={{ pointerEvents: open ? 'none' : 'auto' }}
            onPointerEnter={() => onActive('band')}
            onPointerLeave={() => onActive(null)}
          >
            <polygon points={front} fill={shade(mattress.band.tone, 0.94)} />
            <polygon points={front} fill="url(#m-mesh)" />
            <polygon points={end} fill={shade(mattress.band.tone, 0.82)} />
            <polygon points={end} fill="url(#m-mesh)" />
            <g fill="none" stroke="#14120f" strokeOpacity={0.55} strokeWidth={0.45}>
              <polygon points={front} />
              <polygon points={end} />
            </g>
            <line x1={ax} y1={ay} x2={LEAD} y2={ay} stroke="#14120f" strokeOpacity={0.4} strokeWidth={0.35} />
            <circle cx={ax} cy={ay} r={0.9} fill="#14120f" />
            <text x={LEAD + 4} y={ay} dominantBaseline="middle" fontSize={label} letterSpacing={0.6} fill="#14120f">
              {numbers.band}
            </text>
          </motion.g>
        )
      })()}
    </svg>
  )
}

/** The drawing with its numbered key and the open/closed switch. */
export function MattressLayers() {
  const { lang } = useI18n()
  const [active, setActive] = useState<string | null>(null)
  const [exploded, setExploded] = useState(false)

  // The key reads top to bottom, the band after the cover it is sewn to.
  const items = [
    { id: layers[0].id, name: layers[0].name, detail: layers[0].detail, pending: false },
    { id: 'band', name: mattress.band.name, detail: mattress.band.detail, pending: false },
    ...layers.slice(1).map((l) => ({ id: l.id, name: l.name, detail: l.detail, pending: Boolean(l.pending) })),
  ]
  const numbers = Object.fromEntries(items.map((item, i) => [item.id, String(i + 1).padStart(2, '0')]))
  const tx = (t: { ro: string; en: string }) => (lang === 'ro' ? t.ro : t.en)

  return (
    <div className="grid gap-12 md:grid-cols-12 md:gap-6">
      <div className="md:col-span-7 lg:col-span-8">
        <MattressDrawing
          active={active}
          onActive={setActive}
          exploded={exploded}
          onExploded={setExploded}
          numbers={numbers}
        />
        <div className="mt-6 flex items-center gap-6" role="group" aria-label={lang === 'ro' ? 'Vedere' : 'View'}>
          {[
            { open: true, label: lang === 'ro' ? 'Straturi' : 'Layers' },
            { open: false, label: lang === 'ro' ? 'Asamblată' : 'Assembled' },
          ].map((v) => (
            <button
              key={v.label}
              type="button"
              aria-pressed={exploded === v.open}
              onClick={() => setExploded(v.open)}
              className={clsx(
                'eyebrow transition-opacity',
                exploded === v.open ? 'underline underline-offset-4' : 'opacity-45 hover:opacity-80',
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <ol className="border-t border-ink/12 md:col-span-5 lg:col-span-4">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onPointerEnter={() => setActive(item.id)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(item.id)}
              onBlur={() => setActive(null)}
              onClick={() => item.id === 'band' && setExploded(false)}
              className={clsx(
                'grid w-full grid-cols-[2.25rem_1fr] gap-x-2 border-b border-ink/10 py-4 text-left transition-opacity duration-300',
                active && active !== item.id ? 'opacity-35' : 'opacity-100',
              )}
            >
              <span className="eyebrow pt-1 tabular-nums opacity-45">{numbers[item.id]}</span>
              <span>
                <span className="block font-display text-lg leading-snug">{tx(item.name)}</span>
                <span className="mt-1 block text-sm leading-relaxed opacity-60">{tx(item.detail)}</span>
                {item.pending && (
                  <span className="mt-2 inline-block text-xs opacity-45">
                    {lang === 'ro' ? 'De confirmat cu atelierul' : 'To be confirmed by the workshop'}
                  </span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}
