#!/bin/sh
# The Romanian letters of the two text faces, cut out of fontsource's
# latin-ext files into apps/web/src/assets/fonts/.
#
#   PYFTSUBSET=/path/to/pyftsubset sh scripts/fonts.sh
#
# Needs fonttools with brotli (pip install fonttools brotli). The latin-ext
# files cover hundreds of letters for other languages — 88 KB for Inter Tight
# alone — and Romanian uses ten of them. Everything else on the site is in the
# plain latin files, which are used as published. Re-run after upgrading
# either @fontsource-variable package. Declared in src/styles/fonts.css.
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd)
FILES="$ROOT/apps/web/node_modules/@fontsource-variable"
OUT="$ROOT/apps/web/src/assets/fonts"
SUBSET=${PYFTSUBSET:-pyftsubset}
# Ă ă, Ş ş, Ţ ţ (the cedilla forms older text still uses), Ș ș Ț ț.
RO="U+0102-0103,U+015E-015F,U+0162-0163,U+0218-021B"
mkdir -p "$OUT"
for face in inter-tight bodoni-moda; do
  "$SUBSET" "$FILES/$face/files/$face-latin-ext-wght-normal.woff2" \
    --unicodes="$RO" --layout-features='*' --flavor=woff2 \
    --output-file="$OUT/$face-ro-wght.woff2"
  # The latin file as published, beside it, so both are hashed and served
  # from the same place.
  cp "$FILES/$face/files/$face-latin-wght-normal.woff2" "$OUT/$face-latin-wght.woff2"
done
ls -l "$OUT"
