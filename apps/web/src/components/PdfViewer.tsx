import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { useI18n } from '~/lib/i18n'
import { stopScroll } from '~/lib/scroll'
import { expo } from '~/lib/motion'
import type { Catalogue } from '~/lib/catalogues'

const ZOOM_MIN = 1
const ZOOM_MAX = 3
const ZOOM_STEP = 0.5

/**
 * A catalogue, read in the page: one page at a time, fitted to the screen,
 * with page turning, zoom, fullscreen and a download.
 *
 * pdf.js is imported only when a catalogue is opened, so the HoReCa page itself
 * costs nothing extra to load.
 */
export function PdfViewer({ catalogue, onClose }: { catalogue: Catalogue; onClose: () => void }) {
  const { t } = useI18n()
  const shell = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const task = useRef<RenderTask | null>(null)

  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null)
  const [failed, setFailed] = useState(false)
  const [page, setPage] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const pages = doc?.numPages ?? 0

  // Load the document.
  useEffect(() => {
    let cancelled = false
    let loaded: PDFDocumentProxy | null = null
    ;(async () => {
      try {
        const pdfjs = await import('pdfjs-dist')
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
        loaded = await pdfjs.getDocument(catalogue.pdf).promise
        if (cancelled) loaded.destroy()
        else setDoc(loaded)
      } catch {
        if (!cancelled) setFailed(true)
      }
    })()
    return () => {
      cancelled = true
      void loaded?.destroy()
    }
  }, [catalogue.pdf])

  // Lock the page behind, take focus, and give it back on close.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    stopScroll(true)
    closeButton.current?.focus()
    return () => {
      stopScroll(false)
      previous?.focus?.()
    }
  }, [])

  // Track the stage's size, so the page is refitted on resize and rotation.
  useEffect(() => {
    const el = stage.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ w: Math.floor(width), h: Math.floor(height) })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Draw the current page: fitted whole into the stage at zoom 1, larger above.
  useEffect(() => {
    if (!doc || !size.w || !size.h || !canvas.current) return
    let cancelled = false
    ;(async () => {
      const p = await doc.getPage(page)
      if (cancelled || !canvas.current) return
      const base = p.getViewport({ scale: 1 })
      // Fit inside the padding around the page, not the bare stage.
      const wrap = canvas.current.parentElement
      const style = wrap ? getComputedStyle(wrap) : null
      const padX = style ? parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) : 0
      const padY = style ? parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) : 0
      const fit = Math.min((size.w - padX) / base.width, (size.h - padY) / base.height)
      const scale = fit * zoom
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      const viewport = p.getViewport({ scale: scale * ratio })

      const el = canvas.current
      el.width = Math.floor(viewport.width)
      el.height = Math.floor(viewport.height)
      el.style.width = `${Math.floor(viewport.width / ratio)}px`
      el.style.height = `${Math.floor(viewport.height / ratio)}px`

      task.current?.cancel()
      const ctx = el.getContext('2d')
      if (!ctx) return
      task.current = p.render({ canvasContext: ctx, viewport })
      await task.current.promise.catch(() => {})
    })()
    return () => {
      cancelled = true
      task.current?.cancel()
    }
  }, [doc, page, zoom, size])

  const go = useCallback(
    (delta: number) => {
      setPage((current) => Math.min(Math.max(1, current + delta), pages || 1))
      setZoom(1)
      stage.current?.scrollTo(0, 0)
    },
    [pages],
  )

  const zoomBy = (delta: number) =>
    setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z + delta)))

  const fullscreen = () => {
    const el = shell.current
    if (!el) return
    if (document.fullscreenElement) void document.exitFullscreen()
    else void el.requestFullscreen?.()
  }

  // Keyboard: arrows turn pages, Escape closes, Tab stays inside the dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.fullscreenElement) onClose()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'Tab' && shell.current) {
        const focusable = shell.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, onClose])

  // Swipe to turn the page on a touch screen, but only when not zoomed in —
  // zoomed, a horizontal drag is panning the page.
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStart.current = zoom === 1 && e.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current
    touchStart.current = null
    if (!start) return
    const touch = e.changedTouches[0]
    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1)
  }

  const canFullscreen = typeof document !== 'undefined' && document.fullscreenEnabled
  const button =
    'flex h-10 min-w-10 items-center justify-center px-2 text-paper/75 transition-colors hover:text-paper disabled:opacity-25 disabled:hover:text-paper/75'

  return (
    <motion.div
      ref={shell}
      role="dialog"
      aria-modal="true"
      aria-label={`${catalogue.title} ${catalogue.year}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: expo }}
      className="fixed inset-0 z-[80] flex flex-col bg-night text-paper"
    >
      <header className="flex items-center justify-between gap-4 border-b border-paper/10 px-4 py-2 md:px-6">
        <p className="eyebrow truncate text-paper/70">
          {catalogue.title} <span className="tabular-nums">· {catalogue.year}</span>
        </p>
        <div className="flex shrink-0 items-center gap-1">
          <a
            href={catalogue.pdf}
            download
            className="eyebrow mr-2 hidden border border-paper/25 px-3 py-2 text-paper/80 transition-colors hover:border-paper hover:text-paper sm:inline-block"
          >
            {t('horeca.download')}
          </a>
          {canFullscreen && (
            <button type="button" onClick={fullscreen} aria-label={t('horeca.fullscreen')} className={button}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
                <path d="M1 5V1h4M11 1h4v4M15 11v4h-4M5 15H1v-4" />
              </svg>
            </button>
          )}
          <button
            ref={closeButton}
            type="button"
            onClick={onClose}
            aria-label={t('horeca.close')}
            className={button}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
              <path d="M2 2l12 12M14 2L2 14" />
            </svg>
          </button>
        </div>
      </header>

      <div
        ref={stage}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="relative min-h-0 flex-1 overflow-auto"
      >
        {/* Centred while it fits; once zoomed past the stage, it scrolls from
            its top-left corner rather than being cut off on both sides. */}
        <div className="flex min-h-full min-w-full w-max items-center justify-center p-3 md:p-6">
          <canvas ref={canvas} className="block bg-paper shadow-[0_20px_60px_rgba(0,0,0,0.5)]" />
        </div>
        {!doc && (
          <p className="eyebrow absolute inset-0 flex items-center justify-center text-paper/60">
            {failed ? t('horeca.failed') : t('horeca.loading')}
          </p>
        )}
      </div>

      <footer className="flex items-center justify-center gap-2 border-t border-paper/10 px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <button type="button" onClick={() => go(-1)} disabled={page <= 1} aria-label={t('horeca.prev')} className={button}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
            <path d="M11 3L5 9l6 6" />
          </svg>
        </button>
        <span className="eyebrow min-w-[4.5rem] text-center tabular-nums text-paper/80" aria-live="polite">
          {pages ? `${page} / ${pages}` : '—'}
        </span>
        <button type="button" onClick={() => go(1)} disabled={!pages || page >= pages} aria-label={t('horeca.next')} className={button}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
            <path d="M7 3l6 6-6 6" />
          </svg>
        </button>
        <span className="mx-2 h-5 w-px bg-paper/15" aria-hidden />
        <button type="button" onClick={() => zoomBy(-ZOOM_STEP)} disabled={zoom <= ZOOM_MIN} aria-label={t('horeca.zoomOut')} className={button}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
            <path d="M3 8h10" />
          </svg>
        </button>
        <button type="button" onClick={() => zoomBy(ZOOM_STEP)} disabled={zoom >= ZOOM_MAX} aria-label={t('horeca.zoomIn')} className={button}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
            <path d="M3 8h10M8 3v10" />
          </svg>
        </button>
        <a
          href={catalogue.pdf}
          download
          aria-label={t('horeca.download')}
          className={`${button} sm:hidden`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
            <path d="M8 2v9M4 7l4 4 4-4M2 14h12" />
          </svg>
        </a>
      </footer>
    </motion.div>
  )
}
