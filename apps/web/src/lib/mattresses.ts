/**
 * Mattresses — a first draft, built from workshop photographs (docs/WhatsApp
 * Image 2026-11-12 *.jpeg and docs/image copy 2–7.png), not from a technical
 * sheet.
 *
 * Four models, all in the same quilted Aloe Vera knit cover with a lime 3D
 * mesh band round the sides:
 *
 * - Eflex: an all-foam core — pink, a thin white sheet, yellow, pink.
 * - Eflex Memory Foam: memory foam (light blue) over yellow and two pink sheets.
 * - Relaxa Memory Foam: memory foam and a white sheet over Bonnell springs set
 *   in a foam frame on felt, on a white foam base.
 * - Relaxa: the same spring mattress without the memory foam (no photograph:
 *   drawn from Relaxa Memory Foam with that layer left out).
 *
 * Eflex Memory Foam's three foams have their grades from the client's layer
 * sheet. What the photographs cannot show for the others — densities, foam
 * grades, every thickness — is left marked `pending` and worded as such. The drawn
 * thicknesses are proportions read off the photographs, for the drawing only.
 */

type Text = { ro: string; en: string }

export type Layer = {
  id: string
  name: Text
  detail: Text
  /** Thickness used to draw the layer, in centimetres — proportion, not a spec. */
  draw: number
  /** Base colour of the material, as photographed. */
  tone: string
  /** Speckle or texture drawn over it. */
  texture: 'quilt' | 'foam' | 'foam-speckled' | 'knit' | 'springs'
  /** Two sheets bonded together: the glue line is drawn halfway up. */
  seam?: boolean
  /** Density and hardness, where a sheet gives them. */
  grade?: { density: number; hardness: number }
  /** Not yet confirmed by the workshop. */
  pending?: boolean
}

export type Photo = { src: string; alt: Text }

export type Mattress = {
  slug: string
  name: string
  /** One line for the card. */
  kind: Text
  /** A paragraph for the model's page. */
  lede: Text
  /** Top to bottom, as the drawing stacks them. */
  layers: Layer[]
}

/**
 * The two studio shots every model leads with, on white, as
 * `/media/saltele/{slug}-{produs,straturi}-{700,1400}.webp`: the mattress cut
 * open, then its foams stacked and labelled with their grades.
 */
export const shots = (m: Mattress) =>
  [
    {
      src: `${m.slug}-produs`,
      alt: { ro: `Salteaua ${m.name}, în secțiune`, en: `The ${m.name} mattress, in section` },
    },
    {
      src: `${m.slug}-straturi`,
      alt: { ro: `Straturile saltelei ${m.name}, cu densitățile lor`, en: `The layers of the ${m.name}, with their grades` },
    },
  ] satisfies Photo[]

// ------------------------------------------------------------- shared layers --

const coverTop: Layer = {
  id: 'cover-top',
  name: { ro: 'Husă matlasată Aloe Vera', en: 'Quilted Aloe Vera cover' },
  detail: {
    ro: 'Tricot alb cu model Aloe Vera, matlasat în valuri peste un strat de vată. Fața de dormit.',
    en: 'White knit with an Aloe Vera jacquard, quilted in waves over a layer of wadding. The sleeping side.',
  },
  draw: 2.5,
  tone: '#f6f6f0',
  texture: 'quilt',
}

const coverBottom: Layer = {
  id: 'cover-bottom',
  name: { ro: 'Husă, fața inferioară', en: 'Cover, underside' },
  detail: {
    ro: 'Aceeași țesătură matlasată închide salteaua și dedesubt.',
    en: 'The same quilted knit closes the mattress underneath.',
  },
  draw: 1.5,
  tone: '#f1f1ea',
  texture: 'knit',
}

const memoryFoam: Layer = {
  id: 'memory',
  name: { ro: 'Memory foam', en: 'Memory foam' },
  detail: {
    ro: 'Spumă cu memorie, albastru-deschis, cu granulație fină: se mulează după corp și revine încet.',
    en: 'Light-blue memory foam, fine-grained: it takes the shape of the body and returns slowly.',
  },
  draw: 5,
  tone: '#cfe4e6',
  texture: 'foam-speckled',
  pending: true,
}

const yellow: Layer = {
  id: 'transition',
  name: { ro: 'Strat intermediar', en: 'Transition layer' },
  detail: {
    ro: 'Spumă galbenă, care face trecerea de la confort la susținere.',
    en: 'Yellow foam, the step from comfort to support.',
  },
  draw: 5,
  tone: '#efeaa8',
  texture: 'foam',
  pending: true,
}

const PINK = '#f2a7bd'
const WHITE_FOAM = '#f4f1e8'

// ------------------------------------------------------------ Relaxa layers --

const relaxaSheet: Layer = {
  id: 'sheet',
  name: { ro: 'Placă de spumă', en: 'Foam sheet' },
  detail: {
    ro: 'Spumă albă, întinsă peste arcuri, ca acestea să nu se simtă prin saltea.',
    en: 'White foam laid over the springs, so they are not felt through the mattress.',
  },
  draw: 3,
  tone: WHITE_FOAM,
  texture: 'foam',
  pending: true,
}

const springs: Layer = {
  id: 'springs',
  name: { ro: 'Arcuri Bonnell în cadru de spumă', en: 'Bonnell springs in a foam frame' },
  detail: {
    ro: 'Arcuri din sârmă de oțel, așezate pe un strat de pâslă și încadrate de borduri din spumă pe toate laturile.',
    en: 'Steel wire springs, laid on a felt pad and framed by foam rails on every side.',
  },
  draw: 10,
  tone: WHITE_FOAM,
  texture: 'springs',
  pending: true,
}

const relaxaBase: Layer = {
  id: 'base',
  name: { ro: 'Bază din spumă', en: 'Foam base' },
  detail: {
    ro: 'O placă de spumă albă, pe care stă tot ansamblul de arcuri.',
    en: 'A white foam slab that the whole spring unit stands on.',
  },
  draw: 4,
  tone: WHITE_FOAM,
  texture: 'foam',
  pending: true,
}

// ------------------------------------------------------------------ models --

export const mattresses: Mattress[] = [
  {
    slug: 'eflex',
    name: 'Eflex',
    kind: { ro: 'Spumă, patru straturi', en: 'Foam, four layers' },
    lede: {
      ro: 'Patru straturi de spumă — roz, alb, galben și roz — într-o husă matlasată Aloe Vera cu bandă din plasă 3D pe laturi.',
      en: 'Four layers of foam — pink, white, yellow and pink — in a quilted Aloe Vera cover with a 3D mesh band round the sides.',
    },
    layers: [
      coverTop,
      {
        id: 'comfort',
        name: { ro: 'Strat de confort', en: 'Comfort layer' },
        detail: {
          ro: 'Spumă roz, sub husă — stratul pe care se doarme.',
          en: 'Pink foam under the cover — the layer you sleep on.',
        },
        draw: 4.5,
        tone: PINK,
        texture: 'foam',
        pending: true,
      },
      {
        id: 'sheet',
        name: { ro: 'Placă intermediară', en: 'Intermediate sheet' },
        detail: {
          ro: 'O placă subțire de spumă albă, între stratul de confort și cel galben.',
          en: 'A thin sheet of white foam between the comfort layer and the yellow.',
        },
        draw: 2.5,
        tone: WHITE_FOAM,
        texture: 'foam',
        pending: true,
      },
      { ...yellow, draw: 5.5 },
      {
        id: 'core',
        name: { ro: 'Miez de susținere', en: 'Support core' },
        detail: {
          ro: 'Spumă roz la bază, care poartă greutatea.',
          en: 'Pink foam at the base, carrying the weight.',
        },
        draw: 5,
        tone: PINK,
        texture: 'foam',
        pending: true,
      },
      coverBottom,
    ],
  },
  {
    slug: 'eflex-memory-foam',
    name: 'Eflex Memory Foam',
    kind: { ro: 'Memory foam peste spumă', en: 'Memory foam over foam' },
    lede: {
      ro: 'Memory Foam 28–10 peste burete 30–28 și burete HR 38–40, într-o husă matlasată Aloe Vera cu bandă din plasă 3D pe laturi.',
      en: 'Memory Foam 28–10 over 30–28 foam and HR 38–40 foam, in a quilted Aloe Vera cover with a 3D mesh band round the sides.',
    },
    // Grades from the client's sheet "Straturile saltelelor VALLO"
    // (docs/VALLO Memory Foam Sleep Layers.png), which shows this stack.
    layers: [
      coverTop,
      {
        ...memoryFoam,
        name: { ro: 'Memory Foam 28–10', en: 'Memory Foam 28–10' },
        detail: {
          ro: 'Strat de confort din burete vâscoelastic, care se mulează după corp, reduce punctele de presiune și oferă o senzație de relaxare profundă.',
          en: 'A comfort layer of viscoelastic foam that takes the shape of the body, eases pressure points and gives a feeling of deep relaxation.',
        },
        grade: { density: 28, hardness: 10 },
        pending: false,
      },
      {
        ...yellow,
        name: { ro: 'Burete 30–28', en: 'Foam 30–28' },
        detail: {
          ro: 'Strat de tranziție din burete poliuretanic, care echilibrează confortul și susținerea și distribuie uniform presiunea.',
          en: 'A transition layer of polyurethane foam that balances comfort and support and spreads pressure evenly.',
        },
        grade: { density: 30, hardness: 28 },
        pending: false,
      },
      {
        id: 'core',
        name: { ro: 'Burete HR 38–40', en: 'HR foam 38–40' },
        detail: {
          ro: 'Strat de susținere din burete High Resilience, în două plăci lipite: elastic, rezistent în timp, pentru o susținere fermă și stabilă.',
          en: 'A support layer of High Resilience foam, two sheets bonded together: springy and lasting, for firm, steady support.',
        },
        draw: 8,
        tone: PINK,
        texture: 'foam',
        seam: true,
        grade: { density: 38, hardness: 40 },
      },
      coverBottom,
    ],
  },
  {
    slug: 'relaxa',
    name: 'Relaxa',
    kind: { ro: 'Arcuri Bonnell', en: 'Bonnell springs' },
    lede: {
      ro: 'Arcuri Bonnell într-un cadru de spumă, acoperite cu o placă de spumă albă, într-o husă matlasată Aloe Vera cu bandă din plasă 3D pe laturi.',
      en: 'Bonnell springs in a foam frame under a sheet of white foam, in a quilted Aloe Vera cover with a 3D mesh band round the sides.',
    },
    layers: [coverTop, relaxaSheet, springs, relaxaBase, coverBottom],
  },
  {
    slug: 'relaxa-memory-foam',
    name: 'Relaxa Memory Foam',
    kind: { ro: 'Memory foam peste arcuri', en: 'Memory foam over springs' },
    lede: {
      ro: 'Relaxa, cu un strat de memory foam deasupra: arcuri Bonnell într-un cadru de spumă, într-o husă matlasată Aloe Vera cu bandă din plasă 3D pe laturi.',
      en: 'Relaxa with a layer of memory foam on top: Bonnell springs in a foam frame, in a quilted Aloe Vera cover with a 3D mesh band round the sides.',
    },
    layers: [coverTop, { ...memoryFoam, draw: 4 }, relaxaSheet, springs, relaxaBase, coverBottom],
  },
]

export const bySlug = (slug: string) => mattresses.find((m) => m.slug === slug)

/** The side band, the same on every model. */
export const band = {
  name: { ro: 'Bandă laterală din plasă 3D', en: '3D mesh side band' },
  detail: {
    ro: 'Plasă tridimensională verde pe toate cele patru laturi, care lasă aerul să circule prin saltea.',
    en: 'Green three-dimensional mesh on all four sides, letting air move through the mattress.',
  },
  tone: '#9cc81e',
}

/** Mattress sizes that match the beds' size pickers. Prices to come. */
export const sizes = ['120 × 200', '140 × 200', '160 × 200', '180 × 200', '200 × 200']
