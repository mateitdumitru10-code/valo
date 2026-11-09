/**
 * Where a quote request goes. Shared by the contact form and the HoReCa form,
 * which send the same fields.
 *
 * In development the Express API is running, so requests go there and land in
 * data/inquiries.jsonl. In production the request is posted to
 * public/__forms.html for Netlify Forms — which only exists on Netlify. The
 * site is deployed to Cloudflare Pages, where that POST is refused (405), so
 * the forms currently show their error message and the phone number instead.
 */
export function sendInquiry(data: Record<string, string>) {
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
