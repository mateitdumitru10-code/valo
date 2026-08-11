# Turning the site into a shop, with EuPlătesc

Scoping notes, 11 August 2026. Nothing here is built yet — the site is a
catalogue that ends in a quote request.

The payment integration is the small part. The work is the order system, the
product data we do not currently own, and Romanian compliance.

---

## 1. EuPlătesc integration

A redirect gateway: the card is entered on their pages, never ours, so PCI scope
stays at SAQ A.

**Needed from them**

- Merchant contract and account, plus a test account.
- `merch_id` and the secret key.
- A registered IPN ("silent reply") URL and return URLs.

**Needed from us**

- **Payment initiation.** Server-side form POST to their secure endpoint with
  `amount`, `curr`, `invoice_id`, `order_desc`, `merch_id`, `timestamp`,
  `nonce`, plus billing and shipping fields, signed with `fp_hash` — an HMAC-MD5
  over the length-prefixed concatenation of those values, keyed with the
  hex-decoded secret. 3DS2 happens on their side.
- **IPN handler.** They POST the result server to server. Verify `fp_hash` over
  the reply fields, mark the order paid, acknowledge in the format they expect.
  **This is the only source of truth** — an order must never be marked paid from
  the browser return URL, which the customer controls.
- **Idempotency.** They retry notifications; the same one must not produce two
  paid orders.
- **Refunds**, full and partial, for the withdrawal right in §3.

> Verify the exact field order and hashing against EuPlătesc's current
> integration document before writing the signer. That detail changes between
> versions, and getting it wrong fails as "invalid hash" with no further
> explanation.

Estimated 3–5 days once §2 exists.

---

## 2. What the site is missing to be a shop

### Product data we do not have

The catalogue is scraped from Samobi: their list prices, no stock, no SKUs, no
per-fabric pricing.

- Real SKUs, and prices per variant — fabric grade changes the price of a sofa,
  which is normal in upholstery.
- Configurable options priced properly: corner side (left/right), size, textile
  grade, storage.
- Stock, or an honest lead time. Made-to-order furniture sells as "4–6 weeks",
  which changes the whole checkout promise.
- Delivery pricing by county and by volume, plus floor and lift questions. A
  four-metre sectional is not a parcel.

**This is the blocking dependency, and it is not code.** It needs Samobi's real
price list, options and delivery tariffs.

### Order system

Quote requests currently append to `data/inquiries.jsonl`. A shop needs:

- Postgres: orders, order lines, payments, addresses, stock.
- An order state machine, and an admin interface to see and fulfil orders.
- Transactional email at each state change.
- **Server-side price recalculation at checkout.** Never trust an amount that
  came from the browser.

### Cart and checkout

Cart state, guest checkout, billing separate from delivery address, and Romanian
invoicing fields: persoană fizică or juridică, with CUI and Reg. Com. for
companies.

---

## 3. Romanian and EU compliance

Non-negotiable, and the legal texts should come from a Romanian lawyer.

- Termeni și condiții, Politica de confidențialitate (GDPR), politica de cookies
  with real consent, politica de livrare și retur.
- **Drept de retragere, 14 zile** (OUG 34/2014). Goods made to customer
  specification are exempt, which covers most made-to-order upholstery — but the
  exemption must be stated explicitly at the point of order or it does not apply.
- **Garanție legală de conformitate**, alongside the 24-month commercial
  warranty already in the copy.
- **ANPC** contact, plus **SAL** and **SOL** links in the footer. Required for
  Romanian online sellers.
- **e-Factura.** ANAF e-invoicing now extends to B2C; invoices must be generated
  and submitted through SPV, not emailed as a PDF.
- **VAT.** Romania's standard rate has moved off 19% — confirm the current rate
  with the accountant, and store the rate per order. Displayed prices include
  VAT.

---

## 4. Infrastructure

Postgres, sessions, admin authentication, transactional email, background jobs
for IPN retries and stock sync, logging and alerting on failed payments,
backups, a staging environment with EuPlătesc test cards, and real hosting. The
current setup is one Express process serving static files — fine for a
catalogue, not for money.

---

## 5. Effort

| Phase | Work                                                     | Estimate  |
| ----- | -------------------------------------------------------- | --------- |
| 1     | Postgres, product/variant/price model, admin             | 2–3 weeks |
| 2     | Cart, checkout, delivery pricing, order states, email    | 2–3 weeks |
| 3     | EuPlătesc: initiation, IPN, refunds, test cards          | 3–5 days  |
| 4     | e-Factura and invoicing                                  | 1–2 weeks |
| 5     | Legal pages, cookie consent, ANPC/SAL/SOL                | 3–5 days  |

Roughly **6–10 weeks** of build, plus lawyer time.

---

## 6. Recommendation

Ship the current site as brand and catalogue, keep the quote form, and add a
"cerere de comandă" flow first. Furniture at 3.000–7.000 lei rarely converts on
impulse; most Romanian furniture sales still start with a phone call. Build the
shop against real data once Samobi's price list is in hand.

If starting now, start with Phase 1 — with products, variants and prices modelled
properly, the EuPlătesc work becomes the three days it should be.
