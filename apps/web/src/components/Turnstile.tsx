import { useEffect, useRef } from 'react'

/**
 * Cloudflare Turnstile, the spam check on the quote forms. It renders only
 * when the build has a site key (VITE_TURNSTILE_SITE_KEY); without one the
 * forms rely on the honeypot alone, and the function does not ask for a token
 * unless TURNSTILE_SECRET is set beside it.
 *
 * Turnstile writes its token into a hidden `cf-turnstile-response` input inside
 * the form, so FormData picks it up with the other fields.
 */
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string
  remove: (id: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

let loading: Promise<TurnstileApi> | null = null

function load() {
  loading ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('turnstile')))
    script.onerror = () => {
      loading = null
      reject(new Error('turnstile'))
    }
    document.head.appendChild(script)
  })
  return loading
}

export const turnstileEnabled = Boolean(SITE_KEY)

export function Turnstile({ lang }: { lang: 'ro' | 'en' }) {
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!SITE_KEY || !box.current) return
    let id: string | undefined
    let gone = false
    load()
      .then((api) => {
        if (gone || !box.current) return
        id = api.render(box.current, { sitekey: SITE_KEY, language: lang, theme: 'light', appearance: 'interaction-only' })
      })
      .catch(() => {})
    return () => {
      gone = true
      if (id) window.turnstile?.remove(id)
    }
  }, [lang])

  if (!SITE_KEY) return null
  return <div ref={box} className="sm:col-span-2" />
}
