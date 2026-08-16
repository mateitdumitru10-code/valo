import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { formatPrice, srcFor, type Img as Photo } from '~/lib/catalog'
import { useI18n } from '~/lib/i18n'
import { expo } from '~/lib/motion'
import { useState } from 'react'

export type IndexItem = {
  id: string
  href: string
  label: string
  lede: string
  count: number
  cover: Photo | null
  from: number | null
}

/**
 * A list of names with one preview frame beside it. The frame never moves —
 * only its contents crossfade — so scanning the names stays calm. On touch,
 * where there is no hover, each row carries its own small cover instead.
 *
 * Both indexes on the site are this: the ranges, and the kinds of piece. They
 * differ in what fills the rows, not in how the rows behave.
 */
export function Index({ items }: { items: IndexItem[] }) {
  const { t, lang } = useI18n()
  const [active, setActive] = useState(items[0]?.id ?? '')

  if (!items.length) return null

  const current = items.find((i) => i.id === active) ?? items[0]

  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-12">
      <ul
        className="border-t border-ink/12 md:col-span-7"
        onPointerLeave={() => setActive(items[0].id)}
      >
        {items.map((item, i) => (
          <li key={item.id} className="border-b border-ink/12">
            <Link
              to={item.href}
              onPointerEnter={() => setActive(item.id)}
              onFocus={() => setActive(item.id)}
              className="group flex items-center gap-5 py-5 md:py-7"
            >
              <span className="eyebrow w-8 shrink-0 opacity-35 tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>

              <span className="flex-1 overflow-hidden">
                <motion.span
                  className="block font-display text-[clamp(1.6rem,4.4vw,3.5rem)] leading-[1.08]"
                  animate={{ x: active === item.id ? 14 : 0 }}
                  transition={{ duration: 0.65, ease: expo }}
                  style={{ opacity: active === item.id ? 1 : 0.42 }}
                >
                  {item.label}
                </motion.span>
              </span>

              {/* Touch fallback — no hover means no preview panel. */}
              {item.cover && (
                <span className="h-14 w-20 shrink-0 overflow-hidden md:hidden">
                  <img
                    src={srcFor(item.cover, 700)}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </span>
              )}

              <span className="eyebrow w-16 shrink-0 text-right opacity-40 tabular-nums">
                {String(item.count).padStart(2, '0')}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="hidden md:col-span-4 md:col-start-9 md:block">
        <div className="sticky top-28">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-mist">
            {items.map((item) =>
              item.cover ? (
                <motion.img
                  key={item.id}
                  src={srcFor(item.cover, 700)}
                  alt={item.label}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={false}
                  animate={{ opacity: active === item.id ? 1 : 0 }}
                  transition={{ duration: 0.6, ease: expo }}
                />
              ) : null,
            )}
          </div>

          <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-ink/12 pt-3">
            <p className="eyebrow opacity-60">{current.label}</p>
            {current.from !== null && (
              <p className="eyebrow tabular-nums opacity-40">
                {t('common.from')} {formatPrice(current.from, lang)}
              </p>
            )}
          </div>

          <p className="mt-3 max-w-xs text-sm leading-relaxed opacity-55 transition-opacity duration-500">
            {current.lede}
          </p>
        </div>
      </div>
    </div>
  )
}
