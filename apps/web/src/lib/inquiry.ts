/**
 * Where a quote request goes. Shared by the contact form and the HoReCa form,
 * which send the same fields.
 *
 * Always POST /api/inquiries as JSON. In production that is the Cloudflare
 * Pages Function in functions/api/inquiries.ts, which emails the request; in
 * development Vite proxies it to the Express API, which appends it to
 * data/inquiries.jsonl.
 */
export function sendInquiry(data: Record<string, string>) {
  return fetch('/api/inquiries', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data),
  })
}
