import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import clsx from 'clsx'
import { band, mattresses, type Layer, type Mattress } from '~/lib/mattresses'
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
const SPRING_GAP = 34 // extra lift over a spring unit, to show the coils

const A = (14 * Math.PI) / 180
const B = (38 * Math.PI) / 180
const ca = Math.cos(A)
const sa = Math.sin(A)
const cb = Math.cos(B)
const sb = Math.sin(B)

type Pt = [number, number]
const P = (x: number, y: number, z: number): Pt => [x * ca - y * cb, x * sa + y * sb - z]
const poly = (pts: Pt[]) => pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
/** The top of a box, at height z. */
const rect = (x0: number, y0: number, x1: number, y1: number, z: number) =>
  poly([P(x0, y0, z), P(x1, y0, z), P(x1, y1, z), P(x0, y1, z)])

/** Darken a hex colour by a factor, for the shaded faces. */
function shade(hex: string, f: number) {
  const n = parseInt(hex.slice(1), 16)
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * f))
  return `rgb(${c.join(',')})`
}

/**
 * Where a slab's leader starts: the back corner of its end face, the drawing's
 * rightmost edge, so the line runs out into clear space and never across a
 * slab below.
 */
const anchor = (z0: number, h: number): Pt => P(L, 0, z0 + h / 2)

// The floor shadow: the footprint, blurred, a touch larger than the bed.
const SHADOW: Pt[] = [P(-6, -4, 0), P(L + 6, -4, 0), P(L + 8, W + 8, 0), P(-6, W + 8, 0)]
const BLUR = 5
/** Clear space round the drawing: the blur's full reach, and some air. */
const MARGIN = BLUR * 3 + 12
const left = Math.min(...SHADOW.map(([x]) => x), P(0, W, 0)[0]) - MARGIN
const edge = Math.max(...SHADOW.map(([x]) => x), P(L, 0, 0)[0])
const floor = Math.max(...SHADOW.map(([, y]) => y)) + MARGIN

/** The gap each slab rises by when opened. A card opens tighter, to stay legible small. */
function gapOver(layer: Layer, compact: boolean) {
  const gap = compact ? 13 : GAP
  const extra = compact ? 22 : SPRING_GAP
  return gap + (layer.texture === 'springs' ? extra : 0)
}

/** Assembled heights and opened lifts, bottom up. */
function stack(layers: Layer[], compact: boolean) {
  const n = layers.length
  const base: number[] = []
  const lifts: number[] = []
  let z = 0
  let up = 0
  for (let i = n - 1; i >= 0; i--) {
    base[i] = z
    lifts[i] = up
    z += layers[i].draw * K
    // Each slab rises one gap above the one below it; over the springs the gap
    // is wider, so the coils inside the frame can be seen.
    up += gapOver(layers[i], compact)
  }
  return { base, lifts, total: z }
}

/** Top of a stack, closed and opened. */
function tops(layers: Layer[], compact: boolean) {
  const { lifts, total } = stack(layers, compact)
  return { closed: P(0, 0, total)[1] - MARGIN, open: P(0, 0, total + lifts[0])[1] - MARGIN }
}

/** The tallest opened stack among the models: every card is framed to it. */
const cardHeight = () => Math.max(...mattresses.map((m) => floor - tops(m.layers, true).open))

/** Heights and frame for one model's stack. */
function geometry(layers: Layer[], compact: boolean) {
  const n = layers.length
  const { base, lifts, total } = stack(layers, compact)
  const lead = edge + 22
  const right = compact ? edge + MARGIN : lead + 30
  const top = tops(layers, compact)
  // A card centres the mattress in its frame, closed or opened, and every card
  // shares one frame, so all four are drawn to one scale. The page's drawing
  // frames its own opened stack.
  const height = compact ? cardHeight() : floor - top.open
  const y0 = compact ? -height / 2 : top.open
  const centre = (t: number) => (compact ? -(t + floor) / 2 : 0)
  return {
    base,
    lift: (i: number) => lifts[i],
    lead,
    shift: { closed: centre(top.closed), open: centre(top.open) },
    coreTop: base[0], // top of the foam, bottom of the top cover
    coreBottom: base[n - 1] + layers[n - 1].draw * K,
    total,
    view: `${left} ${y0} ${right - left} ${height}`,
  }
}

// ----------------------------------------------------------- spring unit --
const RAIL = 12 // width of the foam frame round the springs, cm
const PITCH = 14.5 // spring centres, cm
const COIL = 5.4 // spring radius, cm

/** Spring centres inside the frame, back to front so nearer coils paint last. */
const coils: Pt[] = (() => {
  const list: Pt[] = []
  const nx = Math.floor((L - 2 * RAIL) / PITCH)
  const ny = Math.floor((W - 2 * RAIL) / PITCH)
  const ox = (L - (nx - 1) * PITCH) / 2
  const oy = (W - (ny - 1) * PITCH) / 2
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) list.push([ox + i * PITCH, oy + j * PITCH])
  return list.sort((a, b) => a[0] * sa + a[1] * sb - (b[0] * sa + b[1] * sb))
})()

/** A Bonnell coil: an hourglass helix, wide at both ends, waisted in the middle. */
function coilPath(cx: number, cy: number, z0: number, z1: number) {
  const turns = 4.5
  const steps = 54
  const pts: Pt[] = []
  for (let s = 0; s <= steps; s++) {
    const t = s / steps
    const a = t * turns * 2 * Math.PI
    const r = COIL * (1 - 0.38 * Math.sin(Math.PI * t))
    pts.push(P(cx + r * Math.cos(a), cy + r * Math.sin(a), z0 + (z1 - z0) * t))
  }
  return poly(pts)
}

/**
 * The spring unit, opened: foam rails on four sides, felt in the bottom of the
 * frame and the coils standing on it. Painted far to near — the back and left
 * rails, the felt, the two inner walls that face the viewer, the coils, then
 * the front and end rails over them.
 */
function SpringUnit({ layer, z0, h, url }: { layer: Layer; z0: number; h: number; url: (id: string) => string }) {
  const z1 = z0 + h
  const felt = '#b3b4ae'
  const wire = '#4f5459'
  const inner = { x0: RAIL, y0: RAIL, x1: L - RAIL, y1: W - RAIL }
  const backWall = poly([P(inner.x0, inner.y0, z0), P(inner.x1, inner.y0, z0), P(inner.x1, inner.y0, z1), P(inner.x0, inner.y0, z1)])
  const leftWall = poly([P(inner.x0, inner.y0, z0), P(inner.x0, inner.y1, z0), P(inner.x0, inner.y1, z1), P(inner.x0, inner.y0, z1)])
  const front = poly([P(0, W, z0), P(L, W, z0), P(L, W, z1), P(0, W, z1)])
  const end = poly([P(L, 0, z0), P(L, W, z0), P(L, W, z1), P(L, 0, z1)])
  const pores = url('pores')
  return (
    <>
      {[rect(0, 0, L, RAIL, z1), rect(0, 0, RAIL, W, z1)].map((pts) => (
        <g key={pts}>
          <polygon points={pts} fill={layer.tone} />
          <polygon points={pts} fill={pores} />
        </g>
      ))}
      <polygon points={rect(inner.x0, inner.y0, inner.x1, inner.y1, z0)} fill={felt} />
      <polygon points={rect(inner.x0, inner.y0, inner.x1, inner.y1, z0)} fill={url('felt')} />
      <polygon points={backWall} fill={shade(layer.tone, 0.9)} />
      <polygon points={leftWall} fill={shade(layer.tone, 0.8)} />
      <g fill="none" stroke={wire} strokeWidth={0.4} strokeLinejoin="round">
        {coils.map(([cx, cy]) => (
          <polyline key={`${cx},${cy}`} points={coilPath(cx, cy, z0 + 0.6, z1 - 0.4)} />
        ))}
      </g>
      {[rect(0, W - RAIL, L, W, z1), rect(L - RAIL, 0, L, W, z1)].map((pts) => (
        <g key={pts}>
          <polygon points={pts} fill={layer.tone} />
          <polygon points={pts} fill={pores} />
          <polygon points={pts} fill={url('light')} />
        </g>
      ))}
      <polygon points={front} fill={shade(layer.tone, 0.92)} />
      <polygon points={front} fill={pores} />
      <polygon points={end} fill={shade(layer.tone, 0.82)} />
      <polygon points={end} fill={pores} />
      <g fill="none" stroke="#14120f" strokeOpacity={0.55} strokeWidth={0.45} strokeLinejoin="round">
        <polygon points={rect(0, 0, L, W, z1)} />
        <polygon points={rect(inner.x0, inner.y0, inner.x1, inner.y1, z1)} />
        <polygon points={front} />
        <polygon points={end} />
      </g>
    </>
  )
}

type Props = {
  mattress: Mattress
  active: string | null
  onActive: (id: string | null) => void
  exploded: boolean
  onExploded: (v: boolean) => void
  /** Leader numbers, by layer id, matching the legend. */
  numbers: Record<string, string>
  /** A card's thumbnail: no leaders, no opening on view, opened by the card. */
  compact?: boolean
}

export function MattressDrawing({ mattress, active, onActive, exploded, onExploded, numbers, compact }: Props) {
  const { lang } = useI18n()
  const still = useReducedMotion()
  const ref = useRef<SVGSVGElement>(null)
  const layers = mattress.layers
  const { base, lift, lead, shift, coreTop, coreBottom, view } = useMemo(
    () => geometry(mattress.layers, Boolean(compact)),
    [mattress, compact],
  )
  // Several drawings can share a page (the cards): each keeps its own pattern ids.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const id = (name: string) => `${uid}-${name}`
  const url = (name: string) => `url(#${id(name)})`
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
  // Shown assembled first; it opens once, as it comes into view. A card's
  // thumbnail leaves that to the card.
  useEffect(() => {
    if (!seen || compact) return
    if (still) return onExploded(true)
    const t = setTimeout(() => onExploded(true), 450)
    return () => clearTimeout(t)
  }, [seen, still, onExploded, compact])

  const open = exploded && active !== 'band'
  const ease = still ? { duration: 0 } : { duration: 1.1, ease: expo }
  const dim = (layerId: string) => (active && active !== layerId ? 0.28 : 1)

  const textureFor: Record<Layer['texture'], string> = {
    quilt: url('quilt'),
    knit: url('knit'),
    foam: url('pores'),
    'foam-speckled': url('specks'),
    springs: url('pores'),
  }

  const shadow = poly(SHADOW)

  const leader = (ax: number, ay: number, text: string) => (
    <>
      <line x1={ax + 2.5} y1={ay} x2={lead} y2={ay} stroke="#14120f" strokeOpacity={0.4} strokeWidth={0.35} />
      <circle cx={ax + 2.5} cy={ay} r={0.9} fill="#14120f" />
      <text
        x={lead + 4}
        y={ay}
        dominantBaseline="middle"
        className="font-sans"
        fontSize={label}
        letterSpacing={0.6}
        fill="#14120f"
      >
        {text}
      </text>
    </>
  )

  return (
    <svg
      ref={ref}
      viewBox={view}
      className={clsx('w-full select-none', compact ? 'h-full' : 'h-auto')}
      role="img"
      aria-label={
        lang === 'ro'
          ? `${mattress.name}, în secțiune: ${layers.map((l) => l.name.ro).join(', ')}.`
          : `${mattress.name}, layer by layer: ${layers.map((l) => l.name.en).join(', ')}.`
      }
    >
      <defs>
        {/* Wave quilting, laid in the plane of the top face. */}
        <pattern
          id={id('quilt')}
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
        <pattern id={id('knit')} patternUnits="userSpaceOnUse" width="3" height="3">
          <circle cx="1.5" cy="1.5" r="0.32" fill="#c9d3bb" />
        </pattern>
        {/* Open-cell pores, and the darker flecks in the blue foam. */}
        <pattern id={id('pores')} patternUnits="userSpaceOnUse" width="9" height="7">
          <circle cx="1.2" cy="1.4" r="0.4" fill="#000" opacity="0.09" />
          <circle cx="5.6" cy="3.1" r="0.35" fill="#000" opacity="0.07" />
          <circle cx="3.4" cy="5.6" r="0.45" fill="#000" opacity="0.08" />
          <circle cx="7.8" cy="6.2" r="0.3" fill="#fff" opacity="0.4" />
        </pattern>
        <pattern id={id('specks')} patternUnits="userSpaceOnUse" width="13" height="9">
          <circle cx="1.2" cy="1.4" r="0.4" fill="#000" opacity="0.08" />
          <circle cx="6.6" cy="3.6" r="0.35" fill="#000" opacity="0.07" />
          <circle cx="3.4" cy="7.1" r="0.42" fill="#1d3f8a" opacity="0.55" />
          <circle cx="10.4" cy="2.2" r="0.32" fill="#1d3f8a" opacity="0.4" />
          <circle cx="11.6" cy="7.6" r="0.4" fill="#000" opacity="0.07" />
        </pattern>
        {/* Felt under the springs: grey, flecked dark and light. */}
        <pattern id={id('felt')} patternUnits="userSpaceOnUse" width="5" height="4">
          <circle cx="0.8" cy="0.9" r="0.5" fill="#000" opacity="0.18" />
          <circle cx="3.4" cy="2.6" r="0.45" fill="#fff" opacity="0.3" />
          <circle cx="1.9" cy="3.4" r="0.3" fill="#000" opacity="0.12" />
        </pattern>
        {/* 3D spacer mesh: a tight grid of open cells. */}
        <pattern id={id('mesh')} patternUnits="userSpaceOnUse" width="2.6" height="2.2">
          <circle cx="1.3" cy="1.1" r="0.62" fill="#6f9410" opacity="0.55" />
        </pattern>
        {/* Light from the upper left, across every top face. */}
        <linearGradient id={id('light')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="1" stopColor="#000" stopOpacity="0.04" />
        </linearGradient>
        <filter id={id('soft')} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={BLUR} />
        </filter>
      </defs>

      <motion.g initial={false} animate={{ y: open ? shift.open : shift.closed }} transition={ease}>
      <polygon points={shadow} fill="#14120f" opacity={0.13} filter={url('soft')} />

      {/* Bottom slab first, so each one above paints over the one below. */}
      {[...layers.keys()].reverse().map((i) => {
        const layer = layers[i]
        const z0 = base[i]
        const h = layer.draw * K
        const z1 = z0 + h
        const top = rect(0, 0, L, W, z1)
        const front = poly([P(0, W, z0), P(L, W, z0), P(L, W, z1), P(0, W, z1)])
        const end = poly([P(L, 0, z0), P(L, W, z0), P(L, W, z1), P(L, 0, z1)])
        const texture = textureFor[layer.texture]
        const sides = layer.texture === 'quilt' ? url('knit') : texture
        const [ax, ay] = anchor(z0, h)
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
            {layer.texture === 'springs' ? (
              <SpringUnit layer={layer} z0={z0} h={h} url={url} />
            ) : (
              <>
                <polygon points={top} fill={layer.tone} />
                <polygon points={top} fill={texture} />
                <polygon points={top} fill={url('light')} />
                <polygon points={front} fill={shade(layer.tone, 0.92)} />
                <polygon points={front} fill={sides} />
                <polygon points={end} fill={shade(layer.tone, 0.82)} />
                <polygon points={end} fill={sides} />
                {layer.seam && (
                  // Two sheets bonded together: the glue line shows.
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
              </>
            )}
            {/* Leader to the number, travelling with its slab. */}
            {!compact && (
              <motion.g initial={false} animate={{ opacity: open ? 1 : 0 }} transition={ease}>
                {leader(ax, ay, numbers[layer.id])}
              </motion.g>
            )}
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
            <polygon points={front} fill={shade(band.tone, 0.94)} />
            <polygon points={front} fill={url('mesh')} />
            <polygon points={end} fill={shade(band.tone, 0.82)} />
            <polygon points={end} fill={url('mesh')} />
            <g fill="none" stroke="#14120f" strokeOpacity={0.55} strokeWidth={0.45}>
              <polygon points={front} />
              <polygon points={end} />
            </g>
            {!compact && leader(ax, ay, numbers.band)}
          </motion.g>
        )
      })()}
      </motion.g>
    </svg>
  )
}

/** The drawing with its numbered key and the open/closed switch. */
export function MattressLayers({ mattress }: { mattress: Mattress }) {
  const { lang } = useI18n()
  const [active, setActive] = useState<string | null>(null)
  const [exploded, setExploded] = useState(false)
  const layers = mattress.layers

  // The key reads top to bottom, the band after the cover it is sewn to.
  const items = [
    { id: layers[0].id, name: layers[0].name, detail: layers[0].detail },
    { id: 'band', name: band.name, detail: band.detail },
    ...layers.slice(1).map((l) => ({
      id: l.id,
      name: l.name,
      detail: l.detail,
      density: l.density,
      thickness: l.thickness,
    })),
  ]
  const numbers = Object.fromEntries(items.map((item, i) => [item.id, String(i + 1).padStart(2, '0')]))
  const tx = (t: { ro: string; en: string }) => (lang === 'ro' ? t.ro : t.en)

  return (
    <div className="grid gap-12 md:grid-cols-12 md:gap-6">
      <div className="md:col-span-7 lg:col-span-8">
        <MattressDrawing
          mattress={mattress}
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
                {('density' in item && item.density) || ('thickness' in item && item.thickness) ? (
                  <span className="mt-2 flex gap-5 text-xs tabular-nums opacity-70">
                    {'density' in item && item.density && (
                      <span>
                        <span className="opacity-60">{lang === 'ro' ? 'Densitate' : 'Density'}</span> {item.density} kg/m³
                      </span>
                    )}
                    {'thickness' in item && item.thickness && (
                      <span>
                        <span className="opacity-60">{lang === 'ro' ? 'Grosime' : 'Thickness'}</span> {item.thickness} cm
                      </span>
                    )}
                  </span>
                ) : null}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}
