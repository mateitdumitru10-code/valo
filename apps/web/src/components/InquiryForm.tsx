import { useState, type FormEvent } from 'react'
import { motion } from 'motion/react'
import clsx from 'clsx'
import { useI18n } from '~/lib/i18n'
import { pieces } from '~/lib/catalog'
import { Cta } from './UI'
import { expo } from '~/lib/motion'

type Status = 'idle' | 'sending' | 'sent' | 'error'
type Errors = Partial<Record<'name' | 'email' | 'message', string>>

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <label htmlFor={id} className="eyebrow flex items-baseline gap-2 opacity-55">
        {label}
        {hint && <span className="opacity-60 normal-case tracking-normal">({hint})</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-ember">{error}</p>}
    </div>
  )
}

const inputClass =
  'w-full border-b border-ink/20 bg-transparent py-3 text-base outline-none transition-colors placeholder:text-ink/30 focus:border-ink'

/**
 * Two destinations, because the site has two homes.
 *
 * In development the Express API is running, so requests go there and land in
 * data/inquiries.jsonl. In production the site is static on Netlify, where
 * there is no API — submissions go to Netlify Forms, declared in
 * public/__forms.html. It posts to that file rather than to "/" because the SPA
 * rewrite in netlify.toml would otherwise swallow the request.
 */
function send(data: Record<string, string>) {
  if (import.meta.env.DEV) {
    return fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  return fetch('/__forms.html', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ 'form-name': 'inquiry', ...data }).toString(),
  })
}

export function InquiryForm({
  defaultPiece,
  defaultSize,
}: {
  defaultPiece?: string
  defaultSize?: string
}) {
  const { t } = useI18n()
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<Errors>({})

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>

    const next: Errors = {}
    if (!data.name?.trim()) next.name = t('contact.required')
    if (!data.email?.trim()) next.email = t('contact.required')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) next.email = t('contact.invalidEmail')
    if (!data.message?.trim()) next.message = t('contact.required')
    setErrors(next)
    if (Object.keys(next).length) return

    setStatus('sending')
    try {
      const res = await send(data)
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
        <p className="font-display text-xl leading-snug">{t('contact.success')}</p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-8 sm:grid-cols-2">
      {/* Honeypot: invisible to people, irresistible to bots. Netlify drops any
          submission that arrives with it filled in. */}
      <input
        type="text"
        name="bot-field"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />

      <Field id="name" label={t('contact.name')} error={errors.name}>
        <input id="name" name="name" className={inputClass} autoComplete="name" />
      </Field>

      <Field id="email" label={t('contact.email')} error={errors.email}>
        <input id="email" name="email" type="email" className={inputClass} autoComplete="email" />
      </Field>

      <Field id="phone" label={t('contact.phone')} hint={t('contact.optional')}>
        <input id="phone" name="phone" type="tel" className={inputClass} autoComplete="tel" />
      </Field>

      <Field id="piece" label={t('contact.piece')} hint={t('contact.optional')}>
        <select
          id="piece"
          name="piece"
          defaultValue={defaultPiece ?? ''}
          className={clsx(inputClass, 'appearance-none')}
        >
          <option value="">—</option>
          {pieces.map((p) => (
            <option key={p.slug} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>

      <div className="sm:col-span-2">
        <Field id="message" label={t('contact.message')} error={errors.message}>
          <textarea
            id="message"
            name="message"
            rows={4}
            defaultValue={defaultSize ? t('contact.sizePrefill').replace('{size}', defaultSize) : undefined}
            placeholder={t('contact.messagePlaceholder')}
            className={clsx(inputClass, 'resize-none')}
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-6 sm:col-span-2">
        <Cta type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? t('contact.sending') : t('contact.submit')}
        </Cta>
        {status === 'error' && <p className="text-sm text-ember">{t('contact.error')}</p>}
      </div>
    </form>
  )
}
