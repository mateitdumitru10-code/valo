import { useRef, useState, type ReactNode } from 'react'
import clsx from 'clsx'

/**
 * Horizontal rail with pointer dragging. Native overflow does the scrolling, so
 * trackpads, wheels and touch all keep working; the drag is an extra affordance.
 */
export function Rail({
  children,
  className,
  itemClassName,
}: {
  children: ReactNode[]
  className?: string
  itemClassName?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: 0 })
  const [dragging, setDragging] = useState(false)

  const down = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el || e.pointerType === 'touch') return
    drag.current = { active: true, startX: e.clientX, startLeft: el.scrollLeft, moved: 0 }
    setDragging(true)
  }

  const move = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el || !drag.current.active) return
    const dx = e.clientX - drag.current.startX
    drag.current.moved = Math.abs(dx)
    el.scrollLeft = drag.current.startLeft - dx
  }

  const up = () => {
    drag.current.active = false
    setDragging(false)
  }

  return (
    <div
      ref={ref}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerLeave={up}
      // A click that follows a real drag would open the wrong piece.
      onClickCapture={(e) => {
        if (drag.current.moved > 8) {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
      className={clsx(
        'flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        dragging ? 'cursor-grabbing select-none' : 'cursor-grab',
        className,
      )}
    >
      {children.map((child, i) => (
        <div key={i} className={clsx('shrink-0 snap-start', itemClassName)}>
          {child}
        </div>
      ))}
    </div>
  )
}
