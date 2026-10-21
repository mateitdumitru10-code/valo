/**
 * Copy the client's photography out of `docs/` and into `media-src/` under the
 * names the pipeline expects.
 *
 *   node scripts/adopt.mjs [--prune]
 *
 * `media-src/` is gitignored and regenerated, so `docs/` is the only durable
 * copy of anything the client shoots. Renaming by hand meant the mapping lived
 * in whoever did it — a fresh clone could rebuild the renditions but not the
 * decision about which frame was which. The table below is that decision,
 * written down.
 *
 * The client's own naming carries more than it looks like it does:
 *
 *   `CL BELLA 3C.jpg`   trailing C — the piece head-on in one colour. These are
 *                       the colour sweep, and become `<slug>-cN`.
 *   `CL BELLA 2.jpg`    no C — another angle, the piece opened out, a detail.
 *                       These become `<slug>-studio-N`.
 *   `CL BELLA 1.jpg`    the exception, and it holds in every family: the `1`
 *                       file is shot head-on with the same camera as the C set,
 *                       in a colour that has no C file of its own. It is a
 *                       colour frame the client didn't suffix, so it is adopted
 *                       as the last `-cN` — otherwise the views shot in that
 *                       colour point at a colour the picker cannot show.
 *
 * Pat Colt inverts it: there the C frames are three-quarters, so its head-on is
 * the odd one out and becomes a view instead.
 *
 * Numbers here are ours, not the client's. Theirs skip and repeat across the
 * two sets — `X 2` and `X 2C` are different colours — so following them would
 * leave `-c2` and `-studio-2` unrelated to each other and to anything else.
 */
import { copyFile, mkdir, readdir, rm, stat } from 'node:fs/promises'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DOCS = join(ROOT, 'docs')
const SRC = join(ROOT, 'media-src')
const PRUNE = process.argv.includes('--prune')

/**
 * docs filename → media-src name, which takes the source file's extension.
 *
 * Keys carry their extension because four frames arrived as a new PNG beside a
 * tracked JPG of the same name — `CP SORIA 2`, `CP TORRO 1`, `2` and `4` — and
 * in every case the PNG is the one to take. Matching on the name alone would
 * have picked whichever the filesystem listed second.
 *
 * Several names also carry a stray space — `CL ECO II 1C .jpg`, `PAT
 * MATRIMONIAL 1 .jpg`, `PAT ONE .jpg`, `CP TORRO 3 .jpg` — and `CL SORIA U2
 * C.jpg` has the digit and the C the wrong way round. They are written here
 * exactly as they sit on disk; repairing them is this table's job.
 */
const ADOPT = {
  // ── Colțar Bela ────────────────────────────────────────────────────────────
  // Not Canapea Bella. Every frame is a two-piece sectional with a left chaise;
  // the Bella sofa is a straight two-seater sharing the rounded-arm language.
  'CL BELLA 1C.jpg': 'coltar-bela-c1',
  'CL BELLA 2C.jpg': 'coltar-bela-c2',
  'CL BELLA 3C.jpg': 'coltar-bela-c3',
  'CL BELLA 4C.jpg': 'coltar-bela-c4',
  'CL BELLA 5C.jpg': 'coltar-bela-c5',
  'CL BELLA 1.jpg': 'coltar-bela-c6',
  'CL BELLA 2.jpg': 'coltar-bela-studio-1',
  'CL BELLA 3.jpg': 'coltar-bela-studio-2',

  // ── Colțar Eco II ──────────────────────────────────────────────────────────
  'CL ECO II 1C .jpg': 'coltar-eco-2-c1',
  'CL ECO II 2C.jpg': 'coltar-eco-2-c2',
  'CL ECO II 3C.jpg': 'coltar-eco-2-c3',
  'CL ECO II 4C.jpg': 'coltar-eco-2-c4',
  'CL ECO II 5C.jpg': 'coltar-eco-2-c5',
  'CL ECO II 1.jpg': 'coltar-eco-2-c6',
  'CL ECO II 2.jpg': 'coltar-eco-2-studio-1',

  // ── Colțar Soria ───────────────────────────────────────────────────────────
  // The last two arrived labelled CP SORIA, but they are not the sofa: same
  // L-sectional, same camera as `CL SORIA 1C`, in a beige body with olive back
  // cushions. Filed here rather than on `canapea-extensibila-soria`.
  'CL SORIA 1C.jpg': 'coltar-soria-c1',
  'CL SORIA 2C.jpg': 'coltar-soria-c2',
  'CL SORIA 3C.jpg': 'coltar-soria-c3',
  'CL SORIA 4C.jpg': 'coltar-soria-c4',
  'CL SORIA 1.jpg': 'coltar-soria-c5',
  'CP SORIA.png': 'coltar-soria-c6',
  'CL SORIA 3.jpg': 'coltar-soria-studio-1',
  'CP SORIA 2.png': 'coltar-soria-studio-2',

  // ── Colțar Soria în formă de U ─────────────────────────────────────────────
  'CL SORIA U 1C.jpg': 'coltar-soria-in-forma-de-u-c1',
  'CL SORIA U2 C.jpg': 'coltar-soria-in-forma-de-u-c2',
  'CL SORIA U 3C.jpg': 'coltar-soria-in-forma-de-u-c3',
  'CL SORIA U 4C.jpg': 'coltar-soria-in-forma-de-u-c4',
  'CL SORIA U 5C.jpg': 'coltar-soria-in-forma-de-u-c5',
  'CL SORIA U 6C.jpg': 'coltar-soria-in-forma-de-u-c6',
  'CL SORIA U 1.jpg': 'coltar-soria-in-forma-de-u-c7',
  'CL SORIA U 2.jpg': 'coltar-soria-in-forma-de-u-studio-1',
  'CL SORIA U 3.jpg': 'coltar-soria-in-forma-de-u-studio-2',

  // ── Colțar Torro ───────────────────────────────────────────────────────────
  // `CL TORRO 1` was adopted earlier as a studio frame. It is a head-on on the
  // same camera as the C set, so it is a sixth colour, and moves.
  'CL TORRO 1C.png': 'coltar-torro-c1',
  'CL TORRO 2C.png': 'coltar-torro-c2',
  'CL TORRO 3C.jpg': 'coltar-torro-c3',
  'CL TORRO 4C.jpg': 'coltar-torro-c4',
  'CL TORRO 5C.jpg': 'coltar-torro-c5',
  'CL TORRO 1.png': 'coltar-torro-c6',
  'CL TORRO 2.png': 'coltar-torro-studio-1',

  // ── Canapea Torro ──────────────────────────────────────────────────────────
  // The PNGs are not re-exports of the JPGs of the same number: 1 and 2 are the
  // same shots taken again at 2.6× the pixels, 3 and 4 are frames the JPG set
  // never had. The PNGs win; `CP TORRO 3 ` is kept because it is the only
  // opened three-quarter.
  'CP TORRO 1C.jpg': 'canapea-toro-c1',
  'CP TORRO 2C.jpg': 'canapea-toro-c2',
  'CP TORRO 3C.jpg': 'canapea-toro-c3',
  'CP TORRO 4C.jpg': 'canapea-toro-c4',
  'CP TORRO 1.png': 'canapea-toro-c5',
  'CP TORRO 2.png': 'canapea-toro-studio-1',
  'CP TORRO 3.png': 'canapea-toro-studio-2',
  'CP TORRO 4.png': 'canapea-toro-studio-3',
  'CP TORRO 3 .jpg': 'canapea-toro-studio-4',

  // ── Demifotoliu ────────────────────────────────────────────────────────────
  'DEMIFOTOLIU 1C.png': 'demifotoliu-c1',
  'DEMIFOTOLIU 2C.png': 'demifotoliu-c2',
  'DEMIFOTOLIU 3C.png': 'demifotoliu-c3',
  'DEMIFOTOLIU 4C.png': 'demifotoliu-c4',
  'DEMIFOTOLIU 1.png': 'demifotoliu-c5',
  'DEMIFOTOLIU 2.png': 'demifotoliu-studio-1',
  'DEMIFOTOLIU 3.png': 'demifotoliu-studio-2',

  // ── Fotoliu King ───────────────────────────────────────────────────────────
  'FOT KING 1C.png': 'fotoliu-king-c1',
  'FOT KING 2C.png': 'fotoliu-king-c2',
  'FOT KING 3C.png': 'fotoliu-king-c3',
  'FOT KING 4C.png': 'fotoliu-king-c4',
  'FOT KING 1.png': 'fotoliu-king-c5',
  'FOT KING 2.png': 'fotoliu-king-studio-1',
  'FOT KING 3.png': 'fotoliu-king-studio-2',

  // ── Fotoliu King Chester ───────────────────────────────────────────────────
  // The same chair as King — identical wing profile, arms, welt, cushion,
  // skirt, legs, camera — with the plain three-button back replaced by diamond
  // tufting. A separate piece rather than a King variant, because `variants` is
  // a colour axis and treatment × colour will not fit through one picker; the
  // two colour sets only overlap on three of six anyway.
  'FOT KING CHESTER 1C.png': 'fotoliu-king-chester-c1',
  'FOT KING CHESTER 2C.png': 'fotoliu-king-chester-c2',
  'FOT KING CHESTER 3C.png': 'fotoliu-king-chester-c3',
  'FOT KING CHESTER 4C.png': 'fotoliu-king-chester-c4',
  'FOT KING CHESTER 5C.png': 'fotoliu-king-chester-c5',
  'FOT KING CHESTER 1.png': 'fotoliu-king-chester-c6',
  'FOT KING CHESTER 2.png': 'fotoliu-king-chester-studio-1',
  'FOT KING CHESTER 3.png': 'fotoliu-king-chester-studio-2',

  // ── Pat Colț ───────────────────────────────────────────────────────────────
  // The one family whose C frames are three-quarters. So `PAT COLT 2` is the
  // frame that matches the picker's angle and `PAT COLT 1`, the only head-on,
  // becomes a view.
  'PAT COLT 1C.jpg': 'pat-colt-c1',
  'PAT COLT 2C.jpg': 'pat-colt-c2',
  'PAT COLT 3C.jpg': 'pat-colt-c3',
  'PAT COLT 4C.jpg': 'pat-colt-c4',
  'PAT COLT 2.jpg': 'pat-colt-c5',
  'PAT COLT 1.jpg': 'pat-colt-studio-1',
  'PAT COLT 3.jpg': 'pat-colt-studio-2',

  // ── Pat Happy ──────────────────────────────────────────────────────────────
  // Three frames, one colour: head-on, three-quarter, storage box lifted. No
  // picker — a colour picker with one swatch is a label pretending to be a
  // control.
  'PAT HAPPY 1.jpg': 'pat-happy-c1',
  'PAT HAPPY 2.jpg': 'pat-happy-studio-1',
  'PAT HAPPY 3.jpg': 'pat-happy-studio-2',

  // ── Pat Matrimonial ────────────────────────────────────────────────────────
  // `PAT MATRIMONIAL 2` is not adopted: a second beige three-quarter, ten
  // degrees off frame 5 and weaker.
  'PAT MATRIMONIAL 1C.jpg': 'pat-matrimonial-c1',
  'PAT MATRIMONIAL 2C.jpg': 'pat-matrimonial-c2',
  'PAT MATRIMONIAL 3C.jpg': 'pat-matrimonial-c3',
  'PAT MATRIMONIAL 4C.jpg': 'pat-matrimonial-c4',
  'PAT MATRIMONIAL 1 .jpg': 'pat-matrimonial-c5',
  'PAT MATRIMONIAL 5.jpg': 'pat-matrimonial-studio-1',
  'PAT MATRIMONIAL 3.jpg': 'pat-matrimonial-studio-2',

  // ── Pat One ────────────────────────────────────────────────────────────────
  'PAT ONE 1C.png': 'pat-one-c1',
  'PAT ONE 2C.png': 'pat-one-c2',
  'PAT ONE 3C.png': 'pat-one-c3',
  'PAT ONE 4C.png': 'pat-one-c4',
  'PAT ONE 5C.png': 'pat-one-c5',
  'PAT ONE .jpg': 'pat-one-c6',
  'PAT ONE 2.png': 'pat-one-studio-1',
  'PAT ONE 3.png': 'pat-one-studio-2',

  // ── Pat Paul ───────────────────────────────────────────────────────────────
  // `PAT PAUL 4` is adopted but not published: the storage box is shot in a
  // cream the picker has no head-on for, so the gallery could not hold one
  // colour through it. It waits here for a cream colour frame.
  'PAT PAUL 1C.jpg': 'pat-paul-c1',
  'PAT PAUL 2C.jpg': 'pat-paul-c2',
  'PAT PAUL 3C.jpg': 'pat-paul-c3',
  'PAT PAUL 4C.jpg': 'pat-paul-c4',
  'PAT PAUL 5C.jpg': 'pat-paul-c5',
  'PAT PAUL 6C.jpg': 'pat-paul-c6',
  'PAT PAUL 1.jpg': 'pat-paul-c7',
  'PAT PAUL 2.jpg': 'pat-paul-studio-1',
  'PAT PAUL 3.jpg': 'pat-paul-studio-2',
  'PAT PAUL 4.jpg': 'pat-paul-studio-3',

  // ── Plan drawings ──────────────────────────────────────────────────────────
  // Not photography: these feed scripts/schematics.mjs, keyed in `schematics`
  // in curation.json. Each sheet stacks the piece closed above the piece
  // opened into a bed, except Bella and Cubic, which are fixed.
  //
  // CL is colțar and CP is canapea, as everywhere else — so `CL BELLA` is
  // Colțar Bela, not Canapea Bella, and `CL ECO` is the extending Eco (240 ×
  // 160, the size Samobi lists and the one the Relaxa / memory foam prices in
  // the client's list belong to), not Eco II. Aldo's two supersede the grey
  // drawings adopted before this table existed: the corner's figures agree,
  // and the sofa's do not — see the note in curation.json.
  //
  // `CL VISION SCHITA` is not adopted: Colțar Vision is on the exclude list,
  // so there is no page for it to sit on.
  'CL ALDO SCHITA .png': 'schita-coltar-aldo-3',
  'CP ALDO SCHITA .png': 'schita-canapea-aldo-2',
  'CL BELLA SCHITA .png': 'schita-coltar-bela',
  'CL CUBIC SCHITA .png': 'schita-coltar-cubic-fix',
  'CL ECO SCHITA .png': 'schita-coltar-extensibil-eco',
  'CL SAM SCHITA.png': 'schita-coltar-sam',
  'CL SORIA SCHITA .png': 'schita-coltar-soria',
  'CP SORIA SCHITA .png': 'schita-canapea-extensibila-soria',
  'CL TORRO SCHITA .png': 'schita-coltar-torro',
}

/**
 * Names this table has superseded. Left in `media-src/` they would still be
 * rendered at three widths and still be reachable by anything that names them,
 * so they go — the originals are all in `docs/`, and `--prune` is what removes
 * them.
 */
const RETIRE = [
  // The Torro sofa's PNGs are the same three frames, larger.
  'canapea-torro-studio-1',
  'canapea-torro-studio-2',
  'canapea-torro-studio-4',
  // `CL TORRO 1` was the old `-studio-1`; it is a colour frame, and the name it
  // vacated is now `CL TORRO 2`, which used to be `-studio-2`. Only the tail of
  // that shuffle is left over.
  'coltar-torro-studio-2',
  // A showroom photograph against a grey wall, with the wall/floor seam in
  // frame — the only Torro shot not on a sweep.
  'coltar-torro-studio-3',
]

const stem = (file) => file.slice(0, file.length - extname(file).length)

const run = async () => {
  await mkdir(SRC, { recursive: true })

  // One pass over docs/, so a name that is not on disk is reported rather than
  // silently skipped — the stray spaces make that an easy mistake to ship.
  const present = new Set(await readdir(DOCS))

  let copied = 0
  let current = 0
  const missing = []

  for (const [file, to] of Object.entries(ADOPT)) {
    if (!present.has(file)) {
      missing.push(file)
      continue
    }

    const dest = join(SRC, `${to}${extname(file)}`)
    const source = join(DOCS, file)

    // Copy only what changed: media.mjs skips renditions newer than their
    // source, so refreshing every mtime would re-render the whole library.
    const [a, b] = await Promise.all([
      stat(source),
      stat(dest).catch(() => null),
    ])
    if (b && b.mtimeMs >= a.mtimeMs && b.size === a.size) {
      current++
      continue
    }

    await copyFile(source, dest)
    copied++
  }

  let pruned = 0
  if (PRUNE) {
    for (const file of await readdir(SRC)) {
      if (!RETIRE.includes(stem(file))) continue
      await rm(join(SRC, file))
      pruned++
    }
  }

  console.log(
    `adopted: ${copied} copied, ${current} already current` +
      (PRUNE ? `, ${pruned} retired` : `, ${RETIRE.length} superseded (run with --prune)`),
  )
  if (missing.length) {
    console.log(`\nnot found in docs/ — check the exact filename, spaces included:`)
    for (const name of missing) console.log(`  ${JSON.stringify(name)}`)
    process.exitCode = 1
  }
}

await run()
