/**
 * Server-side entry for scripts/prerender.mjs: renders one address of the
 * real <App/> to HTML, with every lazy page and Suspense boundary resolved.
 *
 * Loaded through Vite's SSR module loader under a jsdom window, the same way
 * the smoke check runs, so components that read localStorage or matchMedia
 * during render behave as they do in a browser. The prerenderer loads
 * ~/lib/seo and ~/lib/catalog through the same loader, so they share these
 * module instances: a piece primed there is the piece rendered here.
 */
import { prerenderToNodeStream } from 'react-dom/static'
import { StaticRouter } from 'react-router-dom'
import App from '~/App'
import { preloadFor } from '~/routes'
import { I18nProvider } from '~/lib/i18n'

export async function render(url: string) {
  localStorage.setItem('valo:lang', 'ro')
  await preloadFor(url)
  const { prelude } = await prerenderToNodeStream(
    <StaticRouter location={url}>
      <I18nProvider>
        <App />
      </I18nProvider>
    </StaticRouter>,
  )
  // The stream yields bytes; decode as they come so a character split across
  // two chunks is joined rather than garbled.
  const decoder = new TextDecoder()
  let html = ''
  for await (const chunk of prelude as AsyncIterable<Uint8Array | string>) {
    html += typeof chunk === 'string' ? chunk : decoder.decode(chunk, { stream: true })
  }
  return html + decoder.decode()
}
