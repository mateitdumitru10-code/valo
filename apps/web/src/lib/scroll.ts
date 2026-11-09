/**
 * Scrolling is the browser's own. The site used to run every wheel and
 * trackpad movement through Lenis, which eased each one out over most of a
 * second; it read as the page dragging behind the hand. These are the few
 * things the app still needs to do to the scroll position itself.
 */

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function scrollTo(target: string | number, offset = 0) {
  const behavior: ScrollBehavior = reduced() ? 'auto' : 'smooth'
  if (typeof target === 'number') {
    window.scrollTo({ top: target + offset, behavior })
    return
  }
  const el = document.querySelector(target)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY + offset
  window.scrollTo({ top, behavior })
}

/** Locks the page, for the preloader and the open menu. */
export function stopScroll(stopped: boolean) {
  document.documentElement.style.overflow = stopped ? 'hidden' : ''
}

export function scrollToTop() {
  window.scrollTo(0, 0)
}
