/**
 * Write the catalogue out in the shape the app consumes.
 *
 * The app used to bundle the whole catalogue — every product's Romanian prose
 * and a base64 placeholder for all 288 images — into the JavaScript the browser
 * parses before it can draw anything. The home page needs about a twentieth of
 * that. So this emits two things:
 *
 *   apps/web/src/data/catalog.json   index: what cards and listings render.
 *                                    Bundled, deliberately small.
 *   apps/web/public/data/pieces/*    one file per piece: prose, gallery,
 *                                    drawing, textiles. Fetched on demand, and
 *                                    in public/ so it never enters a chunk.
 *
 * Every script that touches the catalogue calls this, so the two never drift.
 */
import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

export async function emit(catalog, root) {
  await writeFile(join(root, 'data/catalog.json'), JSON.stringify(catalog, null, 2))

  const index = {
    generatedAt: catalog.generatedAt,
    collections: catalog.collections,
    hero: catalog.hero,
    products: catalog.products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      collection: p.collection,
      price: p.price,
      currency: p.currency,
      cover: p.cover,
      editorial: p.editorial,
    })),
  }
  await writeFile(join(root, 'apps/web/src/data/catalog.json'), JSON.stringify(index))

  const detail = join(root, 'apps/web/public/data/pieces')
  await mkdir(detail, { recursive: true })
  for (const p of catalog.products) {
    await writeFile(
      join(detail, `${p.slug}.json`),
      JSON.stringify({
        slug: p.slug,
        lead: p.lead,
        summary: p.summary,
        body: p.body,
        dimensions: p.dimensions,
        images: p.images,
        source: p.source,
        ...(p.variants ? { variants: p.variants } : {}),
        ...(p.schematic ? { schematic: p.schematic } : {}),
      }),
    )
  }

  return { pieces: catalog.products.length, indexBytes: JSON.stringify(index).length }
}
