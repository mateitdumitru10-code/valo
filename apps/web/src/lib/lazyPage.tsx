import { lazy, useState, type ComponentType } from 'react'

/**
 * A page that arrives on demand, but can be fetched ahead of time.
 *
 * Every page except the one being opened is split out of the main bundle. A
 * prerendered page already shows its content in the HTML, so if the client's
 * first render suspended on the chunk it would swap that content for an empty
 * fallback and back again. main.tsx calls `preload` for the current address
 * before rendering, so the first render finds the page already loaded and
 * draws it straight away.
 *
 * Each instance decides once which of the two it renders. Switching from the
 * lazy wrapper to the loaded component mid-life would be a different element
 * type to React, and would remount the page.
 */
export function lazyPage<P extends object>(load: () => Promise<ComponentType<P>>) {
  let loaded: ComponentType<P> | null = null
  let pending: Promise<ComponentType<P>> | null = null
  const preload = () =>
    (pending ??= load().then((component) => {
      loaded = component
      return component
    }))
  const Lazy = lazy(() => preload().then((component) => ({ default: component })))

  function Page(props: P) {
    const [Ready] = useState(() => loaded)
    return Ready ? <Ready {...props} /> : <Lazy {...props} />
  }
  return Object.assign(Page, { preload })
}
