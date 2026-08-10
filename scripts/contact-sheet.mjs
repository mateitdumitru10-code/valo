/** Build labelled contact sheets of media-src so imagery can be curated by eye. */
import { readdir, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'media-src')
const OUT = process.argv[2] ?? join(ROOT, 'media-src/.sheets')

const CELL = 260
const COLS = 6
const LABEL = 26
const PER_SHEET = COLS * 6

const files = (await readdir(SRC)).filter((f) => /\.(webp|jpe?g|png)$/i.test(f)).sort()
await mkdir(OUT, { recursive: true })

for (let s = 0; s * PER_SHEET < files.length; s++) {
  const batch = files.slice(s * PER_SHEET, (s + 1) * PER_SHEET)
  const rows = Math.ceil(batch.length / COLS)
  const composites = []

  for (const [i, file] of batch.entries()) {
    const x = (i % COLS) * CELL
    const y = Math.floor(i / COLS) * (CELL + LABEL)
    composites.push({
      input: await sharp(join(SRC, file))
        .resize(CELL, CELL, { fit: 'cover' })
        .toBuffer(),
      left: x,
      top: y,
    })
    const text = file.replace(/\.(webp|jpe?g|png)$/i, '')
    composites.push({
      input: Buffer.from(
        `<svg width="${CELL}" height="${LABEL}"><rect width="100%" height="100%" fill="#111"/>` +
          `<text x="6" y="18" font-family="monospace" font-size="13" fill="#eee">${text.slice(0, 30)}</text></svg>`,
      ),
      left: x,
      top: y + CELL,
    })
  }

  const out = join(OUT, `sheet-${String(s + 1).padStart(2, '0')}.png`)
  await sharp({
    create: {
      width: COLS * CELL,
      height: rows * (CELL + LABEL),
      channels: 3,
      background: '#000',
    },
  })
    .composite(composites)
    .png()
    .toFile(out)
  console.log(out, batch.length)
}
