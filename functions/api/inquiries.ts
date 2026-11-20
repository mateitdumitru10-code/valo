/**
 * POST /api/inquiries — the quote request, on Cloudflare Pages.
 *
 * Cloudflare runs this file as a Pages Function: `functions/` sits in the
 * project's root directory, and the path under it is the route. The contact
 * form and the HoReCa form both post here; in development Vite proxies the
 * same path to the Express API instead (apps/api), so the browser code never
 * branches on where it runs.
 *
 * The request is emailed through Resend. Configure it in the Pages project
 * (Settings → Variables and secrets), for Production and Preview:
 *
 *   RESEND_API_KEY     secret — required; without it every request gets 503
 *   INQUIRY_TO         where requests go, comma-separated — required
 *   INQUIRY_FROM       sender, e.g. "VALLO <site@vallo.ro>" once vallo.ro is
 *                      verified in Resend; until then Resend's test sender,
 *                      which only delivers to the Resend account's own address
 *   TURNSTILE_SECRET   secret — optional; when set, a valid Turnstile token is
 *                      required (the site key is VITE_TURNSTILE_SITE_KEY,
 *                      read by the web build)
 *
 * An unconfigured function answers 503 rather than pretending: the form then
 * shows its error and the phone number, and nobody believes they were heard.
 */

type Env = {
  RESEND_API_KEY?: string
  INQUIRY_TO?: string
  INQUIRY_FROM?: string
  TURNSTILE_SECRET?: string
}

type Context = { request: Request; env: Env }

const LIMITS = { name: 120, email: 160, phone: 40, piece: 160, message: 4000 } as const

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
const trim = (value: unknown, max: number) => String(value ?? '').trim().slice(0, max)

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })

const escape = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

async function verifyTurnstile(secret: string, token: string, ip: string | null) {
  if (!token) return false
  const body = new FormData()
  body.append('secret', secret)
  body.append('response', token)
  if (ip) body.append('remoteip', ip)
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body })
  if (!res.ok) return false
  const outcome = (await res.json()) as { success?: boolean }
  return outcome.success === true
}

export async function onRequestPost({ request, env }: Context): Promise<Response> {
  let raw: Record<string, unknown>
  try {
    raw = (await request.json()) as Record<string, unknown>
  } catch {
    return json(400, { error: 'bad_request' })
  }

  // Honeypot: a person never sees this field. A bot that fills it is told it
  // succeeded, so it has no reason to try again differently.
  if (trim(raw['bot-field'], 200)) return json(201, { ok: true })

  const inquiry = {
    name: trim(raw.name, LIMITS.name),
    email: trim(raw.email, LIMITS.email),
    phone: trim(raw.phone, LIMITS.phone),
    piece: trim(raw.piece, LIMITS.piece),
    message: trim(raw.message, LIMITS.message),
  }

  const errors: string[] = []
  if (!inquiry.name) errors.push('name')
  // A way to answer is required, but either will do: the HoReCa form asks for
  // a phone number or an email, and plenty of venues only give a phone.
  if (inquiry.email ? !isEmail(inquiry.email) : !inquiry.phone) errors.push('email')
  if (!inquiry.message) errors.push('message')
  if (errors.length) return json(422, { error: 'invalid', fields: errors })

  if (!env.RESEND_API_KEY || !env.INQUIRY_TO) return json(503, { error: 'not_configured' })

  if (env.TURNSTILE_SECRET) {
    const token = trim(raw['cf-turnstile-response'], 4096)
    const ok = await verifyTurnstile(env.TURNSTILE_SECRET, token, request.headers.get('cf-connecting-ip'))
    if (!ok) return json(403, { error: 'challenge_failed' })
  }

  const rows: [string, string][] = [
    ['Nume', inquiry.name],
    ['Email', inquiry.email],
    ['Telefon', inquiry.phone],
    ['Produs', inquiry.piece],
  ]
  const filled = rows.filter(([, v]) => v)
  const sentAt = new Date().toLocaleString('ro-RO', { timeZone: 'Europe/Bucharest' })

  const text = [
    ...filled.map(([k, v]) => `${k}: ${v}`),
    '',
    inquiry.message,
    '',
    `— trimis de pe vallo.ro, ${sentAt}`,
  ].join('\n')

  const html =
    `<table style="font:15px/1.5 sans-serif;border-collapse:collapse">` +
    filled
      .map(([k, v]) => `<tr><td style="padding:2px 16px 2px 0;color:#777">${k}</td><td>${escape(v)}</td></tr>`)
      .join('') +
    `</table><p style="font:15px/1.6 sans-serif;white-space:pre-wrap">${escape(inquiry.message)}</p>` +
    `<p style="font:13px sans-serif;color:#999">Trimis de pe vallo.ro, ${escape(sentAt)}</p>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: env.INQUIRY_FROM || 'VALLO <onboarding@resend.dev>',
      to: env.INQUIRY_TO.split(',').map((a) => a.trim()).filter(Boolean),
      // Answering the email answers the customer, not the site.
      ...(inquiry.email ? { reply_to: inquiry.email } : {}),
      subject: `Cerere ofertă: ${inquiry.name}${inquiry.piece ? ` · ${inquiry.piece}` : ''}`,
      text,
      html,
    }),
  })

  if (!res.ok) {
    console.error('resend', res.status, await res.text().catch(() => ''))
    return json(502, { error: 'send_failed' })
  }
  return json(201, { ok: true })
}

/** Anything but POST is not a thing this address does. */
export const onRequest = () => json(405, { error: 'method_not_allowed' })
