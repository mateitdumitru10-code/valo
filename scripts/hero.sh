#!/usr/bin/env bash
# Re-encode the hero clip from the 4K render in docs/.
#
#   bash scripts/hero.sh
#
# crop      3392x1908 from the top-left (x=190): a ~13% push-in that leaves the
#           generator's sparkle mark in the bottom-right corner outside the frame.
# setpts/-r all 145 frames kept, squeezed into 1s at 145fps, so the scrub has
#           every frame the render holds.
# -g 1      all-intra: every frame a keyframe, so any seek decodes one frame.
#           This is what keeps scrubbing instant, and why the files are sized
#           1080p/720p rather than 4K.
set -euo pipefail
cd "$(dirname "$0")/.."
IN="docs/pat liniar  tablie lunga 4K.mp4"
OUT="apps/web/public/media"

# $4: the crop, default the landscape frame above. Portrait screens get the
# middle of it at 3:4 — 1431x1908 centred on the same push-in, x=1171 — which
# is all a phone's cover-crop ever showed of the landscape clip anyway, at
# more rows than the 720p file had and about half its pixels.
enc() {
  ffmpeg -v error -y -i "$IN" -an \
    -vf "crop=${4:-3392:1908:190:0},scale=${1}:${2}:flags=lanczos,setpts=N/(145*TB)" \
    -r 145 -c:v libx264 -preset slow -tune film -crf 26 \
    -g 1 -keyint_min 1 -sc_threshold 0 -bf 0 \
    -pix_fmt yuv420p -profile:v high -movflags +faststart "$OUT/${3}"
}

enc 1920 1080 bed-1080.mp4
enc 1280 720 bed-720.mp4
enc 600 800 bed-portrait.mp4 1431:1908:1171:0
# The poster shows for the instant before the first frame decodes: 1280 wide
# and q70 is plenty for that, at a third of the 1920/q78 file it replaced.
ffmpeg -v error -y -i "$OUT/bed-1080.mp4" -frames:v 1 /tmp/bed-poster.png
node -e "require('sharp')('/tmp/bed-poster.png').resize({ width: 1280 }).webp({ quality: 70 }).toFile('$OUT/bed-poster-1280.webp')"
ffmpeg -v error -y -i "$OUT/bed-portrait.mp4" -frames:v 1 /tmp/bed-poster-portrait.png
node -e "require('sharp')('/tmp/bed-poster-portrait.png').webp({ quality: 70 }).toFile('$OUT/bed-poster-portrait.webp')"
ls -la "$OUT"/bed-*
