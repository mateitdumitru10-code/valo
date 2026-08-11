# VALO

Marketing and catalogue site for **Valo**, the furniture distribution brand of
[Samobi](https://mobilasamobi.ro) (Vadu Săpat, Prahova).

Romanian first, with a full English toggle. No checkout — the catalogue ends in a
quote request, which is how a distribution business actually sells.

```
apps/web     Vite + React 19 + TypeScript + Tailwind v4 + Motion + Lenis
apps/api     Express 5 — catalogue endpoints, quote requests, static host in prod
scripts/     Catalogue ingest, image pipeline, contact sheets
data/        Generated catalogue + curation manifest
media-src/   Original imagery (gitignored — regenerate with `pnpm ingest`)
```

## Running it

```bash
pnpm install
pnpm data      # fetch the Samobi catalogue + build optimised imagery (first run only)
pnpm dev       # api on :8787, web on :5173 (proxying /api)
```

Production:

```bash
pnpm build && pnpm start   # Express serves apps/web/dist and /api on :8787
```

## The catalogue pipeline

1. `pnpm ingest` reads Samobi's WooCommerce Store API, keeps the seven upholstery
   categories, parses millimetre dimensions out of the Romanian copy, and
   downloads the original images into `media-src/`.
2. `pnpm media` renders each image at 700/1200/2000px WebP, applies one house
   colour grade, inlines a 20px LQIP into the catalogue, and writes
   `data/catalog.json` plus the copy the web app bundles.
3. `pnpm sheets` builds labelled contact sheets of `media-src/` — how the
   curation below was decided.

Total media drops from ~171 MB of originals to ~25 MB of renditions.

## Art direction

The source library is uneven: some images are clean in-room renders, many are
phone photos taken in a showroom under fluorescent light on a tiled floor. Both
are real product imagery, so both stay in the catalogue — but they are not used
the same way.

`data/curation.json` is the manifest that enforces that:

- **`hero`** — the eight frames of the opening film, in order.
- **`covers`** — one image per collection.
- **`editorial`** — images allowed to run large. Everything else is confined to
  small gallery thumbs on a product page, and never gets a full-bleed frame.

`scripts/media.mjs` also applies a single restrained grade (saturation ×0.88,
slight contrast and gamma lift) so mixed sources read as one brand. When real
photography arrives, drop it into `media-src/`, add the filenames to
`curation.json`, and rerun `pnpm media`.

## The hero

`components/HeroFilm.tsx` — the clip is the hero, and the scroll is its transport.
`public/media/hero.mp4` is stretched across five screens of scrolling (`LENGTH`):
stop scrolling and the frame holds; scroll and it advances. Its duration is read
from the file, so replacing the clip needs no code change. Four chapter captions
and the elapsed-seconds readout ride the same scroll progress. Under
`prefers-reduced-motion` the section collapses to one screen and is never
scrubbed.

The playhead is eased toward the scroll position in a rAF loop (`CHASE`) rather
than assigned on every scroll event — queuing seeks faster than the decoder
retires them is what makes naive scrubbing stutter.

The current footage is portrait (720×1280). On desktop it is shown whole rather
than blown up to fill a landscape frame, and the space either side is filled by a
32px canvas that the same rAF loop paints from the same decoder, blurred and
darkened by CSS — an ambient fill that costs no second decode. Phones, being
portrait themselves, just use `object-cover`.

### Encoding the clip

Two things matter, and both are invisible locally — the file reads off an SSD
instantly, so problems only appear once it is served over a network.

- **`+movflags faststart`.** Phone and camera exports put the `moov` index at the
  end of the file. Until the browser has that index it cannot decode a frame,
  report a duration or seek, so it downloads the whole clip first: a black hero
  and a dead scrub until it finishes.
- **A short GOP.** Seeking decodes forward from the nearest keyframe, so sparse
  keyframes make scrubbing lag. `-g 6` puts one every quarter second. All-intra
  (`-g 1`) is smoother still but doubled the file here for no visible gain.

```bash
ffmpeg -i source.mp4 -an -c:v libx264 -crf 20 -preset slow \
  -g 6 -keyint_min 6 -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart \
  apps/web/public/media/hero.mp4

# poster: first frame, graded to match the house look
ffmpeg -i apps/web/public/media/hero.mp4 -vf "select=eq(n\,0)" -vframes 1 poster.png
```

Dropping the audio track (`-an`) is free — the hero is muted by definition.
The current clip is 3.1 MB, down from 9.2 MB as exported.

## Type and palette

- Display: **Bodoni Moda** — the didone contrast of the wordmark.
- Text: **Schibsted Grotesk**.
- Bone `#EFEBE2`, ink `#14120F`, night `#0D0C0A`, ember `#A8492A` used sparingly.
- Square corners throughout; hairlines instead of cards; a paper-grain overlay on
  photography.

Tokens live in `apps/web/src/styles/global.css`.

## Content and facts

Copy lives in `apps/web/src/lib/i18n.tsx` (RO + EN). Showroom addresses, phone
numbers and opening hours in `apps/web/src/lib/showrooms.ts` come from Samobi's
contact page — no invented claims about company age, awards or volumes.

## API

| Method | Route                   | Notes                                    |
| ------ | ----------------------- | ---------------------------------------- |
| GET    | `/api/health`           | piece count + catalogue timestamp        |
| GET    | `/api/catalog`          | collections, hero frames, products       |
| GET    | `/api/products`         | `?collection=` `?q=`                     |
| GET    | `/api/products/:slug`   |                                          |
| POST   | `/api/inquiries`        | quote request → `data/inquiries.jsonl`   |

Quote requests are validated server-side and rate limited to 5/minute per IP.
Wiring them to email or a CRM is a one-function change in `apps/api/src/server.js`.
