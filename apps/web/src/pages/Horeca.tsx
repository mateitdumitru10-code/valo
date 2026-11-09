import { lazy, Suspense, useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import clsx from 'clsx'
import { Reveal, RevealLines } from '~/components/Reveal'
import { Cta, Eyebrow } from '~/components/UI'
import { useI18n } from '~/lib/i18n'
import { catalogues, type Catalogue } from '~/lib/catalogues'
import { horeca, works, type ProjectGroup } from '~/lib/horeca'
import { sendInquiry } from '~/lib/inquiry'
import { scrollTo, stopScroll } from '~/lib/scroll'
import { expo, viewport } from '~/lib/motion'

// The viewer pulls in pdf.js; it loads when a catalogue is first opened.
const PdfViewer = lazy(() => import('~/components/PdfViewer').then((m) => ({ default: m.PdfViewer })))

/** A numbered section heading, the same shape as the home page's. */
function SectionHead({ index, eyebrow, title }: { index: string; eyebrow: string; title: string }) {
  return (
    <>
      <Eyebrow index={index}>{eyebrow}</Eyebrow>
      <h2 className="display-md mt-4 max-w-2xl">
        <RevealLines lines={[title]} />
      </h2>
    </>
  )
}

/**
 * The HoReCa page, written from the client's brief: what is made, how, why
 * VALLO, the catalogues, questions, and a short form to start a project.
 */
export function Horeca() {
  const { t, lang } = useI18n()
  const copy = horeca[lang]
  const [open, setOpen] = useState<Catalogue | null>(null)
  const toForm = () => scrollTo('#oferta', -80)

  let n = 0
  const next = () => String(++n).padStart(2, '0')

  return (
    <div className="pt-32 md:pt-44">
      {/* ------------------------------------------------------------ hero */}
      <header className="gutter">
        <Eyebrow index="—">{copy.eyebrow}</Eyebrow>
        <h1 className="display-lg mt-6 max-w-5xl">
          <RevealLines lines={[copy.title]} />
        </h1>
        <Reveal delay={1}>
          <p className="lede mt-6 max-w-xl opacity-75">{copy.lede}</p>
          <div className="mt-8">
            <Cta type="button" onClick={toForm}>
              {copy.cta}
            </Cta>
          </div>
        </Reveal>
      </header>

      {/* ----------------------------------------------------------- intro */}
      <section className="gutter mt-14 border-t border-ink/12 pt-12 md:mt-20 md:pt-16">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="font-display text-[clamp(1.25rem,1.05rem+0.9vw,1.75rem)] leading-[1.45] opacity-85">
            {copy.intro}
          </p>
        </Reveal>
      </section>

      {/* ------------------------------------------------------------ make */}
      <section className="gutter mt-16 md:mt-24">
        <SectionHead index={next()} eyebrow={copy.makeEyebrow} title={copy.makeTitle} />
        <div className="mt-8 grid gap-x-8 border-t border-ink/12 sm:grid-cols-2 lg:grid-cols-3 md:mt-10">
          {copy.make.map((item, i) => (
            <Reveal key={item.title} delay={i % 3} className="border-b border-ink/12 py-6 md:py-7">
              <span className="eyebrow block opacity-30 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-3 font-display text-[clamp(1.25rem,1.1rem+0.5vw,1.5rem)]">{item.title}</h3>
              <p className="mt-2 max-w-sm text-[0.95rem] leading-relaxed opacity-70">{item.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- projects */}
      <section id="proiecte" className="gutter mt-16 md:mt-24">
        <SectionHead index={next()} eyebrow={copy.galleryEyebrow} title={copy.galleryTitle} />
        <p className="mt-3 max-w-md text-[0.95rem] opacity-65">{copy.galleryLede}</p>
        <Projects />
      </section>

      {/* ------------------------------------------- made to measure, fabric */}
      <section className="gutter mt-16 grid gap-10 md:mt-24 md:grid-cols-2 md:gap-12">
        {[
          { title: copy.customTitle, body: copy.custom },
          { title: copy.fabricsTitle, body: copy.fabrics },
        ].map((block, i) => (
          <Reveal key={block.title} delay={i} className="border-t border-ink/12 pt-8">
            <h2 className="display-md">{block.title}</h2>
            <p className="mt-4 max-w-lg text-[0.95rem] leading-relaxed opacity-75">{block.body}</p>
          </Reveal>
        ))}
      </section>

      {/* --------------------------------------------------------- process */}
      <section className="gutter mt-16 md:mt-24">
        <SectionHead index={next()} eyebrow={copy.processEyebrow} title={copy.processTitle} />
        <ol className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-ink/12 pt-8 md:mt-10 md:grid-cols-4">
          {copy.process.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i}>
              <span className="eyebrow block opacity-30 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <p className="mt-4 font-display text-[clamp(1.0625rem,0.95rem+0.5vw,1.25rem)] leading-[1.3]">
                {step.title}
              </p>
              {step.body && <p className="mt-2 text-sm leading-relaxed opacity-65">{step.body}</p>}
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------------- why */}
      <section className="gutter mt-16 md:mt-24">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-4">
            <SectionHead index={next()} eyebrow={copy.whyEyebrow} title={copy.whyTitle} />
          </div>
          <ul className="md:col-span-7 md:col-start-6">
            {[...copy.why, ...(works.length ? [copy.whyGallery] : [])].map((reason, i) => (
              <Reveal
                as="li"
                key={reason}
                delay={i % 3}
                className="flex items-baseline gap-6 border-t border-ink/12 py-4 last:border-b"
              >
                <span className="eyebrow w-6 shrink-0 opacity-30 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {reason === copy.whyGallery ? (
                  <button
                    type="button"
                    onClick={() => scrollTo('#proiecte', -80)}
                    className="text-left font-display text-[clamp(1.0625rem,0.95rem+0.5vw,1.3125rem)] leading-[1.35] underline decoration-ink/25 underline-offset-4 transition-colors hover:decoration-ink"
                  >
                    {reason}
                  </button>
                ) : (
                  <span className="font-display text-[clamp(1.0625rem,0.95rem+0.5vw,1.3125rem)] leading-[1.35]">
                    {reason}
                  </span>
                )}
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------ catalogues */}
      <section className="gutter mt-16 md:mt-24">
        <SectionHead index={next()} eyebrow={copy.cataloguesEyebrow} title={copy.cataloguesTitle} />
        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-ink/12 pt-10 lg:grid-cols-4 md:mt-10">
          {catalogues.map((c, i) => (
            <motion.article
              key={c.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ duration: 0.9, ease: expo, delay: i * 0.08 }}
            >
              <button
                type="button"
                onClick={() => setOpen(c)}
                className="group block w-full text-left"
                aria-label={`${t('horeca.open')}: ${c.title} ${c.year}`}
              >
                <span className="relative block aspect-[3/4] overflow-hidden bg-mist">
                  <img
                    src={c.cover}
                    alt=""
                    width={c.w}
                    height={c.h}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035]"
                  />
                  <span className="eyebrow absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/70 to-transparent px-5 pb-4 pt-12 text-paper opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    {t('horeca.open')}
                  </span>
                </span>
                <span className="mt-5 flex items-baseline justify-between gap-4">
                  <span className="font-display text-[clamp(1.125rem,1rem+0.5vw,1.375rem)]">{c.title}</span>
                  <span className="eyebrow tabular-nums opacity-50">{c.year}</span>
                </span>
              </button>
              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1">
                <button
                  type="button"
                  onClick={() => setOpen(c)}
                  className="eyebrow inline-flex items-center gap-3 whitespace-nowrap py-2 transition-opacity hover:opacity-60"
                >
                  {t('horeca.open')}
                  <svg viewBox="0 0 20 8" className="h-2 w-5 overflow-visible" fill="none" stroke="currentColor" aria-hidden>
                    <path d="M0 4h18M14 0.5 18.5 4 14 7.5" />
                  </svg>
                </button>
                <a
                  href={c.pdf}
                  download
                  className="eyebrow whitespace-nowrap opacity-55 underline-offset-4 transition-opacity hover:underline hover:opacity-100"
                >
                  {t('horeca.download')}
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- faq */}
      <section className="gutter mt-16 md:mt-24">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-4">
            <SectionHead index={next()} eyebrow={copy.faqEyebrow} title={copy.faqTitle} />
          </div>
          <div className="md:col-span-7 md:col-start-6">
            {copy.faq.map(({ q, a }) => (
              <details key={q} className="group border-t border-ink/12 last:border-b">
                <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 py-4 [&::-webkit-details-marker]:hidden">
                  <span className="font-display text-[clamp(1.0625rem,0.95rem+0.5vw,1.3125rem)] leading-[1.35]">
                    {q}
                  </span>
                  <span
                    className="relative h-3 w-3 shrink-0 transition-transform duration-500 group-open:rotate-45"
                    aria-hidden
                  >
                    <span className="absolute inset-x-0 top-1/2 h-px bg-current" />
                    <span className="absolute inset-y-0 left-1/2 w-px bg-current" />
                  </span>
                </summary>
                <p className="max-w-lg pb-6 text-[0.95rem] leading-relaxed opacity-75">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- close */}
      <section id="oferta" className="gutter mt-16 border-t border-ink/12 py-12 md:mt-24 md:py-16">
        <div className="grid gap-8 md:grid-cols-12">
          <h2 className="display-md md:col-span-4">
            <RevealLines lines={[copy.closeTitle]} />
          </h2>
          <div className="md:col-span-7 md:col-start-6">
            <HorecaForm />
          </div>
        </div>
      </section>

      <AnimatePresence>
        {open && (
          <Suspense fallback={null}>
            <PdfViewer key={open.id} catalogue={open} onClose={() => setOpen(null)} />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  )
}

const inputClass =
  'w-full border-b border-ink/20 bg-transparent py-3 text-base outline-none transition-colors placeholder:text-ink/30 focus:border-ink'

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="eyebrow flex items-baseline gap-2 opacity-55">
        {label}
        {hint && <span className="normal-case tracking-normal opacity-60">({hint})</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-ember">{error}</p>}
    </div>
  )
}

type Errors = Partial<Record<'venue' | 'city' | 'seats' | 'contact', string>>

/**
 * The brief's closing form: kind of venue, city, number of seats, and a phone
 * number or an email. It goes out as an ordinary quote request, so it lands in
 * the same place as the contact form's.
 */
function HorecaForm() {
  const { t, lang } = useI18n()
  const f = horeca[lang].form
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errors, setErrors] = useState<Errors>({})

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>
    const contact = data.contact?.trim() ?? ''
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact)
    const isPhone = (contact.match(/\d/g)?.length ?? 0) >= 6 && /^[+\d\s().-]+$/.test(contact)

    const next: Errors = {}
    if (!data.venue) next.venue = f.required
    if (!data.city?.trim()) next.city = f.required
    if (!data.seats?.trim()) next.seats = f.required
    if (!contact) next.contact = f.required
    else if (!isEmail && !isPhone) next.contact = f.invalidContact
    setErrors(next)
    if (Object.keys(next).length) return

    setStatus('sending')
    try {
      const res = await sendInquiry({
        'bot-field': data['bot-field'] ?? '',
        name: `HoReCa · ${data.venue} · ${data.city.trim()}`,
        email: isEmail ? contact : '',
        phone: isEmail ? '' : contact,
        piece: '',
        message: [
          `${f.venue}: ${data.venue}`,
          `${f.city}: ${data.city.trim()}`,
          `${f.seats}: ${data.seats.trim()}`,
        ].join('\n'),
      })
      if (!res.ok) throw new Error(String(res.status))
      setStatus('sent')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: expo }}
        className="border border-ink/15 p-8"
      >
        <p className="font-display text-xl leading-snug">{f.success}</p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-8 sm:grid-cols-2">
      <input type="text" name="bot-field" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <Field id="h-venue" label={f.venue} error={errors.venue}>
        <select id="h-venue" name="venue" defaultValue="" className={clsx(inputClass, 'appearance-none')}>
          <option value="">—</option>
          {f.venueOptions.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </Field>

      <Field id="h-city" label={f.city} error={errors.city}>
        <input id="h-city" name="city" className={inputClass} autoComplete="address-level2" />
      </Field>

      <Field id="h-seats" label={f.seats} error={errors.seats}>
        <input id="h-seats" name="seats" inputMode="numeric" className={inputClass} />
      </Field>

      <Field id="h-contact" label={f.contact} hint={f.contactHint} error={errors.contact}>
        <input id="h-contact" name="contact" className={inputClass} autoComplete="email" />
      </Field>

      <div className="flex flex-wrap items-center gap-6 sm:col-span-2">
        <Cta type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? f.sending : f.submit}
        </Cta>
        {status === 'error' && <p className="text-sm text-ember">{t('contact.error')}</p>}
      </div>
    </form>
  )
}

/**
 * Finished work: a filter by kind of venue, a grid that leads with the first
 * photograph at double size, and a lightbox to see each one larger.
 */
function Projects() {
  const { lang } = useI18n()
  const copy = horeca[lang]
  const [group, setGroup] = useState<'all' | ProjectGroup>('all')
  const [open, setOpen] = useState<number | null>(null)
  const shown = group === 'all' ? works : works.filter((w) => w.group === group)
  const groups = (['all', 'restaurant', 'hotel', 'exterior'] as const).filter(
    (g) => g === 'all' || works.some((w) => w.group === g),
  )

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-b border-ink/12" role="tablist">
        {groups.map((g) => (
          <button
            key={g}
            type="button"
            role="tab"
            aria-selected={group === g}
            onClick={() => setGroup(g)}
            className={clsx(
              'eyebrow -mb-px border-b py-3 transition-[opacity,border-color]',
              group === g ? 'border-ink opacity-100' : 'border-transparent opacity-45 hover:opacity-80',
            )}
          >
            {copy.groups[g]}
            <span className="ml-2 tabular-nums opacity-50">
              {g === 'all' ? works.length : works.filter((w) => w.group === g).length}
            </span>
          </button>
        ))}
      </div>

      <motion.div layout className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((w, i) => (
            <motion.button
              layout
              key={w.src}
              type="button"
              onClick={() => setOpen(i)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: expo }}
              className={clsx(
                'group relative block overflow-hidden bg-mist text-left',
                i === 0 ? 'col-span-2 row-span-2 aspect-square md:aspect-auto' : 'aspect-[4/3]',
              )}
              aria-label={`${copy.groups[w.group]}: ${w.delivered[lang]}`}
            >
              <img
                src={w.src}
                alt=""
                width={w.w}
                height={w.h}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/75 to-transparent px-3 pb-2.5 pt-10 text-paper opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:px-4 md:pb-3">
                <span className="eyebrow block text-paper/70">{copy.groups[w.group]}</span>
                <span className="mt-1 block text-sm">{w.delivered[lang]}</span>
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {open !== null && shown[open] && (
          <Lightbox items={shown} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
        )}
      </AnimatePresence>
    </>
  )
}

function Lightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: typeof works
  index: number
  onIndex: (i: number) => void
  onClose: () => void
}) {
  const { t, lang } = useI18n()
  const copy = horeca[lang]
  const item = items[index]
  const go = useCallback(
    (d: number) => onIndex((index + d + items.length) % items.length),
    [index, items.length, onIndex],
  )

  useEffect(() => {
    stopScroll(true)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      stopScroll(false)
      window.removeEventListener('keydown', onKey)
    }
  }, [go, onClose])

  const [start, setStart] = useState<number | null>(null)
  const arrow = 'flex h-11 w-11 items-center justify-center text-paper/70 transition-colors hover:text-paper'

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={item.delivered[lang]}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: expo }}
      className="fixed inset-0 z-[80] flex flex-col bg-night text-paper"
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-4 py-2 md:px-6">
        <span className="eyebrow tabular-nums text-paper/60">
          {index + 1} / {items.length}
        </span>
        <button type="button" onClick={onClose} aria-label={t('horeca.close')} className={arrow} autoFocus>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
            <path d="M2 2l12 12M14 2L2 14" />
          </svg>
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-2 md:px-16"
        onTouchStart={(e) => setStart(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (start === null) return
          const dx = e.changedTouches[0].clientX - start
          setStart(null)
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
        }}
      >
        <motion.img
          key={item.src}
          src={item.src}
          alt={item.delivered[lang]}
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: expo }}
          onClick={(e) => e.stopPropagation()}
          className="max-h-full max-w-full object-contain"
        />
        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                go(-1)
              }}
              aria-label={t('horeca.prev')}
              className={clsx(arrow, 'absolute left-1 top-1/2 hidden -translate-y-1/2 md:flex')}
            >
              <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
                <path d="M11 3L5 9l6 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                go(1)
              }}
              aria-label={t('horeca.next')}
              className={clsx(arrow, 'absolute right-1 top-1/2 hidden -translate-y-1/2 md:flex')}
            >
              <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
                <path d="M7 3l6 6-6 6" />
              </svg>
            </button>
          </>
        )}
      </div>

      <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 text-center md:pb-6">
        <p className="eyebrow text-paper/55">{copy.groups[item.group]}</p>
        <p className="mt-1 text-sm text-paper/90">{item.delivered[lang]}</p>
      </div>
    </motion.div>
  )
}
