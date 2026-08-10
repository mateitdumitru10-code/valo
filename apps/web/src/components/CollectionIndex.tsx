import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import clsx from 'clsx'
import {
  collections,
  formatPrice,
  inCollection,
  priceRange,
  srcFor,
  type CollectionId,
} from '~/lib/catalog'
import { useI18n, type Key } from '~/lib/i18n'
import { expo } from '~/lib/motion'

/**
 * The collection index as a list with one preview frame beside it. The frame
 * never moves — only its contents crossfade — so scanning the names stays calm.
 * On touch, where there is no hover, each row carries its own small cover.
 */
export function CollectionIndex() {
  const { t, lang } = useI18n()
  const [active, setActive] = useState<CollectionId>(collections[0].id)

  const ranges = useMemo(
    () =>
      Object.fromEntries(
        collections.map((c) => [c.id, priceRange(inCollection(c.id))]),
      ) as Record<CollectionId, ReturnType<typeof priceRange>>,
    [],
  )

  const current = collections.find((c) => c.id === active) ?? collections[0]
  const range = ranges[current.id]

  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-12">
      <ul
        className="border-t border-ink/12 md:col-span-7"
        onPointerLeave={() => setActive(collections[0].id)}
      >
        {collections.map((c, i) => (
          <li key={c.id} className="border-b border-ink/12">
            <Link
              to={`/colectii/${c.id}`}
              onPointerEnter={() => setActive(c.id)}
              onFocus={() => setActive(c.id)}
              className="group flex items-center gap-5 py-5 md:py-7"
            >
              <span className="eyebrow w-8 shrink-0 opacity-35 tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>

              <span className="flex-1 overflow-hidden">
                <motion.span
                  className="block font-display text-[clamp(1.6rem,4.4vw,3.5rem)] leading-[1.08]"
                  animate={{ x: active === c.id ? 14 : 0 }}
                  transition={{ duration: 0.65, ease: expo }}
                  style={{ opacity: active === c.id ? 1 : 0.42 }}
                >
                  {lang === 'ro' ? c.ro : c.en}
                </motion.span>
              </span>

              {/* Touch fallback — no hover means no preview panel. */}
              {c.cover && (
                <span className="h-14 w-20 shrink-0 overflow-hidden md:hidden">
                  <img
                    src={srcFor(c.cover, 700)}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </span>
              )}

              <span className="eyebrow w-16 shrink-0 text-right opacity-40 tabular-nums">
                {String(c.count).padStart(2, '0')}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="hidden md:col-span-4 md:col-start-9 md:block">
        <div className="sticky top-28">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-mist">
            {collections.map((c) =>
              c.cover ? (
                <motion.img
                  key={c.id}
                  src={srcFor(c.cover, 700)}
                  alt={lang === 'ro' ? c.ro : c.en}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={false}
                  animate={{ opacity: active === c.id ? 1 : 0 }}
                  transition={{ duration: 0.6, ease: expo }}
                />
              ) : null,
            )}
          </div>

          <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-ink/12 pt-3">
            <p className="eyebrow opacity-60">{lang === 'ro' ? current.ro : current.en}</p>
            {range && (
              <p className="eyebrow tabular-nums opacity-40">
                {t('common.from')} {formatPrice(range.min, lang)}
              </p>
            )}
          </div>

          <p
            className={clsx(
              'mt-3 max-w-xs text-sm leading-relaxed opacity-55',
              'transition-opacity duration-500',
            )}
          >
            {t(`collection.lede.${current.id}` as Key)}
          </p>
        </div>
      </div>
    </div>
  )
}
