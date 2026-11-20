# VALO

Marketing and catalogue site for **Valo**, the furniture distribution brand of
[Samobi](https://mobilasamobi.ro) (Vadu Săpat, Prahova).

Romanian first, with a full English toggle. No checkout — the catalogue ends in a
quote request, which is how a distribution business actually sells.

```
apps/web     Vite + React 19 + TypeScript + Tailwind v4 + Motion + Lenis
apps/api     Express 5 — local development only: catalogue endpoints, quote requests
functions/   Cloudflare Pages Functions — POST /api/inquiries in production
scripts/     Catalogue ingest, image pipeline, prerender, icons, link check
data/        Generated catalogue + curation manifest
media-src/   Original imagery (gitignored — regenerate with `pnpm ingest`)
```

## Running it

```bash
pnpm install
pnpm data      # fetch the Samobi catalogue + build optimised imagery (first run only)
pnpm dev       # api on :8787, web on :5173 (proxying /api)
```

## Deploying

The site is hosted on **Cloudflare Pages** (project `valo`), which builds on
every push to `main`: build command `pnpm build`, output `apps/web/dist`, and
`functions/` at the project root for the one dynamic route. Every page is
prerendered to static HTML; `apps/web/public/_headers` and `_redirects` carry
the caching, security headers, noindex for the `pages.dev` hosts, and old-URL
redirects. Production is **https://vallo.ro** (`SITE_URL` in
`apps/web/src/lib/seo.ts`).

Before a release:

```bash
pnpm typecheck && pnpm smoke && pnpm build && pnpm links
```

`pnpm build` prints `⚠ not releasable yet` while any company fact or term of
sale in `apps/web/src/lib/company.ts` is still `null` — those feed the footer
and the two legal pages, `/confidentialitate` and `/termeni`.

### The quote form

Both forms POST JSON to `/api/inquiries`. In production that is
`functions/api/inquiries.ts`, which emails the request through Resend; in
development Vite proxies it to Express, which appends to `data/inquiries.jsonl`.
Set these in the Pages project (Settings → Variables and secrets):

| Variable                 | Where     | Notes                                                      |
| ------------------------ | --------- | ---------------------------------------------------------- |
| `RESEND_API_KEY`         | function  | secret, required — without it the form answers 503         |
| `INQUIRY_TO`             | function  | recipient(s), comma-separated, required                    |
| `INQUIRY_FROM`           | function  | e.g. `VALLO <site@vallo.ro>` once vallo.ro is verified     |
| `TURNSTILE_SECRET`       | function  | secret, optional — when set, a Turnstile token is required |
| `VITE_TURNSTILE_SITE_KEY`| build     | optional — renders the Turnstile widget on both forms      |

Set the two Turnstile values together: a secret without a site key rejects
every request.

## The catalogue pipeline

1. `pnpm ingest` reads Samobi's WooCommerce Store API, keeps the seven upholstery
   categories, parses millimetre dimensions out of the Romanian copy, and
   downloads the original images into `media-src/`.
2. `pnpm adopt` copies the client's own photography out of `docs/` and into
   `media-src/` under the names the pipeline expects. `media-src/` is gitignored,
   so `docs/` is the only durable copy of anything the client shoots, and the
   table in `scripts/adopt.mjs` is the record of which frame is which.
3. `pnpm media` renders each image at 700/1200/2000px WebP, applies one house
   colour grade, inlines a 20px LQIP into the catalogue, and writes
   `data/catalog.json` plus the copy the web app bundles.
4. `pnpm sheets` builds labelled contact sheets of `media-src/` — how the
   curation below was decided.

Total media drops from ~171 MB of originals to ~25 MB of renditions.

## Two ways in

The catalogue is grouped twice, and the words are not interchangeable.

- **Categories** — the six kinds of piece: Colțare, Canapele, Paturi, Fotolii,
  Hol, Șezut. Derived from Samobi's own categories in `ingest.mjs`. They live at
  `/categorii`.
- **Collections** — the named ranges: Aldo, Cubic, Soria, Torro, Linear, Bella,
  Vallo. One design carried across several kinds of piece, so Aldo is a corner,
  a sofa bed, a module, a round sofa and a bed. They live at `/colectii`, and
  the landing page indexes them rather than the categories.

Membership is listed in `curation.json` under `collections` rather than matched
on the product name. Matching looked tempting — every Aldo piece has Aldo in its
name — but `Coltar Bela` is not a `Canapea Bella`, and renaming a piece would
silently move it.

A piece has exactly one category and at most one collection; most of the
catalogue has no collection at all.

## Art direction

The source library is uneven: some images are clean in-room renders, many are
phone photos taken in a showroom under fluorescent light on a tiled floor. Both
are real product imagery, so both stay in the catalogue — but they are not used
the same way.

`data/curation.json` is the manifest that enforces that:

- **`hero`** — the eight frames of the opening film, in order.
- **`covers`** — one image per category.
- **`editorial`** — images allowed to run large. Everything else is confined to
  small gallery thumbs on a product page, and never gets a full-bleed frame.
- **`options`** — what a piece is offered in, and what each of those costs.

`scripts/media.mjs` also applies a single restrained grade (saturation ×0.88,
slight contrast and gamma lift) so mixed sources read as one brand. When real
photography arrives, drop it into `docs/`, add a row to the table in
`scripts/adopt.mjs`, list the new names in `curation.json`, and rerun
`pnpm adopt && pnpm media`.

The client names their files by what they show, and it is worth knowing how to
read them: a trailing **C** is the piece head-on in one colour — those are the
colour sweep and become `<slug>-cN`. No C means another angle, the piece opened
out, or a detail, and those become `<slug>-studio-N`. The exception holds in
every family shot so far: the unsuffixed `1` file is a colour frame they forgot
to suffix, on the same camera as the C set, in a colour that has no C file of
its own. Filed as a view it would point the gallery at a colour the picker
cannot show.

## The hero

`components/HeroFilm.tsx` — the clip is the hero, and the scroll is its transport.
It is stretched across several screens of scrolling (`LENGTH`): stop scrolling
and the frame holds; scroll and it advances. Its duration is read from the
file, so replacing the clip needs no code change. Chapter captions and the
elapsed-seconds readout ride the same scroll progress. Under
`prefers-reduced-motion` the section collapses to one screen and is never
scrubbed.

The playhead is eased toward the scroll position in a rAF loop (`CHASE`) rather
than assigned on every scroll event — queuing seeks faster than the decoder
retires them is what makes naive scrubbing stutter.

### The clips

`bash scripts/hero.sh` cuts three files from the 4K render in `docs/`, every
frame a keyframe (`-g 1`) so any seek decodes one frame, `+faststart` so the
browser can seek before the whole file arrives:

| File | Size | Served to |
| --- | --- | --- |
| `bed-portrait.mp4` | 600×800, ~1.2 MB | portrait screens under 1024px — the middle of the frame, which is all a phone's cover-crop shows |
| `bed-1080.mp4` | 1920×1080, ~4.7 MB | 1024px and wider |
| `bed-720.mp4` | 1280×720, ~2.3 MB | everything else |

The browser picks from `<source media>` in the prerendered HTML
(`src/lib/hero.ts`), and the posters are the stage's CSS background per
orientation. Rename the files when the footage changes: `/media` is cached for
a week.

## Performance notes

- **Entrances are CSS** (`components/Reveal.tsx`, "Entrances" in `global.css`),
  started by the inline script in `index.html`. The prerendered page is
  *hydrated*, so content paints from the HTML and nothing animates twice.
  Never give prerendered content a hidden starting state that only JavaScript
  can lift.
- `src/prerender.tsx` sets `progressiveChunkSize` so React keeps each page's
  content in place instead of streaming it to the end of the document.
- **Fonts:** the plain latin files plus Romanian's letters cut from latin-ext
  (`sh scripts/fonts.sh`, needs fonttools). Re-run after upgrading fontsource.
- **Textile chips** are 240px renditions written by `scripts/swatches.mjs`.
- **Icons:** `pnpm icons` renders the PNGs and manifest from `favicon.svg`.

## Type and palette

- Display: **Bodoni Moda** — the didone contrast of the wordmark.
- Text: **Helvetica Neue** where installed, otherwise **Inter Tight**
  (self-hosted).
- Bone `#EFEBE2`, ink `#14120F`, night `#0D0C0A`, ember `#A8492A` used sparingly.
- Square corners throughout; hairlines instead of cards; a paper-grain overlay on
  photography.

Tokens live in `apps/web/src/styles/global.css`.

## Content and facts

Copy lives in `apps/web/src/lib/i18n.tsx` (RO + EN). Showroom addresses, phone
numbers and opening hours in `apps/web/src/lib/showrooms.ts` come from Samobi's
contact page — no invented claims about company age, awards or volumes.

Prices come from the client's own list, `docs/LISTA PRETURI VALLO.pdf`, and are
authoritative over the scraped Samobi figure wherever the two disagree — which
is everywhere they overlap. They live in `curation.json` rather than in the
generated catalogue so that a re-ingest cannot quietly restore the old number.
Beds are priced per mattress width, so the picker moves the figure on the page;
the thirteen pieces the list does not cover keep their Samobi price.

## API

| Method | Route                   | Notes                                    |
| ------ | ----------------------- | ---------------------------------------- |
| GET    | `/api/health`           | piece count + catalogue timestamp        |
| GET    | `/api/catalog`          | categories, collections, hero, products  |
| GET    | `/api/categories`       | the six kinds of piece                   |
| GET    | `/api/collections`      | the named ranges                         |
| GET    | `/api/products`         | `?category=` `?collection=` `?q=`        |
| GET    | `/api/products/:slug`   |                                          |
| POST   | `/api/inquiries`        | quote request → `data/inquiries.jsonl`   |

This API runs in development only. In production the catalogue is bundled and
prerendered, and only `POST /api/inquiries` exists, as a Pages Function.
