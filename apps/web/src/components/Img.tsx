import { useState } from 'react'
import clsx from 'clsx'
import { srcFor, srcSet, type Img as ImgData } from '~/lib/catalog'

type Props = {
  img: ImgData
  alt: string
  sizes?: string
  className?: string
  imgClassName?: string
  priority?: boolean
  /** Scale applied on hover by the parent group. */
  zoom?: boolean
}

/**
 * Blur-up image. The LQIP is inlined in the catalogue, so the layout is never
 * empty — the crop is filled with the right colours before a byte is fetched.
 */
export function Img({
  img,
  alt,
  sizes = '100vw',
  className,
  imgClassName,
  priority,
  zoom,
}: Props) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div
      className={clsx('relative overflow-hidden bg-mist', className)}
      style={{
        backgroundImage: `url(${img.lqip})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <img
        src={srcFor(img, 1200)}
        srcSet={srcSet(img)}
        sizes={sizes}
        alt={alt}
        width={img.w}
        height={img.h}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={clsx(
          'h-full w-full object-cover transition-[opacity,transform] duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
          loaded ? 'opacity-100' : 'opacity-0',
          zoom && 'group-hover:scale-[1.045]',
          imgClassName,
        )}
      />
    </div>
  )
}
