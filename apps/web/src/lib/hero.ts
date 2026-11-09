/**
 * The hero clip, in two sizes cut from the same 4K render (docs/pat liniar
 * tablie lunga 4K.mp4). See scripts/hero.sh for the encode.
 *
 * Every frame is a keyframe, which is what keeps scrubbing instant — and what
 * makes the file grow fast with resolution. 4K that way would be tens of
 * megabytes and too slow to decode frame by frame, so large screens get 1080p
 * and everything else 720p, which a phone's cover-crop never shows at more
 * than about that anyway.
 *
 * The names change when the footage does: /media is cached for a week, and a
 * new clip under the old name would leave returning visitors on the old one.
 */
export const HERO_POSTER = '/media/bed-poster.webp'

export function heroClip() {
  const large =
    typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
  return large ? '/media/bed-1080.mp4' : '/media/bed-720.mp4'
}
