/**
 * The hero clip, cut from one 4K render (docs/pat liniar  tablie lunga 4K.mp4).
 * See scripts/hero.sh for the encodes.
 *
 * Every frame is a keyframe, which is what keeps scrubbing instant — and what
 * makes the file grow fast with resolution. So each screen gets the smallest
 * cut that fills it:
 *
 *   portrait, under 1024px  bed-portrait.mp4  600x800, the middle of the frame
 *                                              at 3:4 — all a phone's
 *                                              cover-crop ever showed. 1.2 MB.
 *   1024px and wider        bed-1080.mp4      1920x1080
 *   anything else           bed-720.mp4       1280x720
 *
 * The browser picks from `<source media>` in the prerendered HTML, before any
 * JavaScript, and the first match wins — so the portrait cut leads the list.
 * (It used to be chosen in JavaScript, which meant the HTML named the 720p
 * file, desktops downloaded it and then the 1080p one, and phones got a
 * 2.3 MB landscape clip to show a third of.)
 *
 * The names change when the footage does: /media is cached for a week, and a
 * new clip under the old name would leave returning visitors on the old one.
 */
export const HERO_SOURCES = [
  { src: '/media/bed-portrait.mp4', media: '(orientation: portrait) and (max-width: 1023px)' },
  { src: '/media/bed-1080.mp4', media: '(min-width: 1024px)' },
  { src: '/media/bed-720.mp4', media: undefined },
] as const

/** The first frame, as the stage background, cut to match the clip it stands in for. */
export const HERO_POSTER_CLASS =
  'bg-[url(/media/bed-poster-1280.webp)] portrait:max-lg:bg-[url(/media/bed-poster-portrait.webp)]'
