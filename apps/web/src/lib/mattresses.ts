/**
 * Mattresses. The copy and every layer's density are the client's own
 * descriptions (2026-11-19); the colours of the foams are read off the studio
 * shots in /media/saltele, which label each block with the same figures.
 *
 * Four models, all in the same quilted Aloe Vera knit cover with a 3D mesh
 * band round the sides:
 *
 * - Eflex: four HR foams — pink 38–40, yellow 28–30, white 25–38, pink 38–40.
 * - Eflex Memory Foam: the Eflex core with 4 cm of memory foam on one face,
 *   reversible. The client's text is followed over the studio shot, which
 *   shows memory foam over only yellow and pink.
 * - Relaxa: Bonnell springs in a foam frame, 25–38 above, 25–42 and 25–38
 *   below.
 * - Relaxa Memory Foam: Relaxa with 4 cm of memory foam on top.
 *
 * The client gives densities as a pair, "38–40", and calls the pair the
 * density in kg/m³; it is quoted as written. Thicknesses are not given, save
 * the memory foam's 4 cm: the drawn ones are proportions read off the
 * photographs, for the drawing only.
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
  /** Density in kg/m³ as the client writes it — a pair, "38–40". */
  density?: string
  /** Thickness in cm, where the client states it. */
  thickness?: number
}

export type Photo = { src: string; alt: Text }

export type Mattress = {
  slug: string
  name: string
  /** One line for the card. */
  kind: Text
  /** The client's headline for the model, after its name. */
  tagline: Text
  /** The opening paragraph, also the page's meta description. */
  lede: Text
  /** The paragraphs after it. */
  body: Text[]
  /** The closing line. */
  closing: Text
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
    ro: 'Husă matlasată cu tratament Aloe Vera, peste un strat de vată. Fața de dormit.',
    en: 'A quilted cover with an Aloe Vera treatment, over a layer of wadding. The sleeping side.',
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
  name: { ro: 'Memory Foam', en: 'Memory Foam' },
  detail: {
    ro: 'Spumă cu memorie: reacționează la căldura și presiunea corpului, se mulează treptat după contururile lui și distribuie presiunea.',
    en: 'Memory foam: it responds to the warmth and pressure of the body, settles gradually to its contours and spreads the pressure.',
  },
  draw: 4,
  tone: '#cfe4e6',
  texture: 'foam-speckled',
  thickness: 4,
}

const PINK = '#f2a7bd'
const YELLOW = '#efeaa8'
const WHITE_FOAM = '#f4f1e8'

// The Eflex core, shared by both Eflex models: four HR foams, top to bottom.
const eflexCore: Layer[] = [
  {
    id: 'hr-top',
    name: { ro: 'Spumă HR, strat superior', en: 'HR foam, top layer' },
    detail: {
      ro: 'Spumă poliuretanică High Resilience: elastică, revine la forma inițială după utilizare.',
      en: 'High Resilience polyurethane foam: springy, and returns to its shape after use.',
    },
    draw: 4.5,
    tone: PINK,
    texture: 'foam',
    density: '38–40',
  },
  {
    id: 'hr-middle',
    name: { ro: 'Spumă HR, strat intermediar', en: 'HR foam, middle layer' },
    detail: {
      ro: 'Un strat mai moale, care face trecerea de la confort la susținere.',
      en: 'A softer layer, the step from comfort to support.',
    },
    draw: 5,
    tone: YELLOW,
    texture: 'foam',
    density: '28–30',
  },
  {
    id: 'hr-lower',
    name: { ro: 'Spumă HR, al doilea strat intermediar', en: 'HR foam, second middle layer' },
    detail: {
      ro: 'O placă subțire, între stratul intermediar și cel inferior.',
      en: 'A thin sheet between the middle layer and the base.',
    },
    draw: 2.5,
    tone: WHITE_FOAM,
    texture: 'foam',
    density: '25–38',
  },
  {
    id: 'hr-base',
    name: { ro: 'Spumă HR, strat inferior', en: 'HR foam, bottom layer' },
    detail: {
      ro: 'Același HR ca stratul superior, la bază, unde poartă greutatea.',
      en: 'The same HR as the top layer, at the base, where it carries the weight.',
    },
    draw: 5,
    tone: PINK,
    texture: 'foam',
    density: '38–40',
  },
]

// ------------------------------------------------------------ Relaxa layers --

const relaxaTop: Layer = {
  id: 'foam-top',
  name: { ro: 'Spumă poliuretanică, strat superior', en: 'Polyurethane foam, top layer' },
  detail: {
    ro: 'Întinsă peste arcuri, ca acestea să nu se simtă prin saltea.',
    en: 'Laid over the springs, so they are not felt through the mattress.',
  },
  draw: 3,
  tone: WHITE_FOAM,
  texture: 'foam',
  density: '25–38',
}

const springs: Layer = {
  id: 'springs',
  name: { ro: 'Plasă de arcuri Bonnell', en: 'Bonnell spring unit' },
  detail: {
    ro: 'Sistemul central: arcuri Bonnell, încadrate în spumă poliuretanică pe toate laturile.',
    en: 'The core: Bonnell springs, framed in polyurethane foam on every side.',
  },
  draw: 10,
  tone: WHITE_FOAM,
  texture: 'springs',
}

const relaxaMiddle: Layer = {
  id: 'foam-middle',
  name: { ro: 'Spumă poliuretanică, strat intermediar', en: 'Polyurethane foam, middle layer' },
  detail: {
    ro: 'Sub plasa de arcuri, pe care o susține.',
    en: 'Under the spring unit, carrying it.',
  },
  draw: 3,
  tone: WHITE_FOAM,
  texture: 'foam',
  density: '25–42',
}

const relaxaBase: Layer = {
  id: 'foam-base',
  name: { ro: 'Spumă poliuretanică, strat inferior', en: 'Polyurethane foam, bottom layer' },
  detail: {
    ro: 'Placa de la bază, pe care stă tot ansamblul.',
    en: 'The slab at the base that the whole construction stands on.',
  },
  draw: 3,
  tone: '#f0ebdc',
  texture: 'foam',
  density: '25–38',
}

const relaxaCore = [relaxaTop, springs, relaxaMiddle, relaxaBase]

// ------------------------------------------------------------------ models --

export const mattresses: Mattress[] = [
  {
    slug: 'eflex',
    name: 'Eflex',
    kind: { ro: 'Spumă HR, patru straturi', en: 'HR foam, four layers' },
    tagline: { ro: 'Confort și elasticitate în echilibru', en: 'Comfort and spring, in balance' },
    lede: {
      ro: 'Salteaua EFLEX este realizată integral din spumă poliuretanică HR (High Resilience), un material apreciat pentru elasticitatea ridicată, capacitatea de revenire la forma inițială și proprietățile sale de susținere.',
      en: 'The EFLEX is made entirely of HR (High Resilience) polyurethane foam, a material valued for its spring, its return to shape and the support it gives.',
    },
    body: [
      {
        ro: 'Construcția sa este alcătuită din patru straturi de spumă poliuretanică, cu densități diferite, atent combinate pentru a oferi un echilibru între confort și susținere.',
        en: 'It is built from four layers of polyurethane foam of different densities, combined to balance comfort against support.',
      },
      {
        ro: 'Utilizarea spumei HR contribuie la o suprafață elastică și confortabilă, care se adaptează presiunii exercitate și își recapătă forma după utilizare.',
        en: 'The HR foam makes for a springy, comfortable surface that gives under pressure and recovers its shape afterwards.',
      },
    ],
    closing: {
      ro: 'EFLEX – O construcție din spumă HR, în care elasticitatea și susținerea definesc confortul.',
      en: 'EFLEX – built from HR foam, where spring and support make the comfort.',
    },
    layers: [coverTop, ...eflexCore, coverBottom],
  },
  {
    slug: 'eflex-memory-foam',
    name: 'Eflex Memory Foam',
    kind: { ro: 'Reversibilă, cu Memory Foam', en: 'Reversible, with Memory Foam' },
    tagline: { ro: 'Două niveluri de confort. O singură saltea.', en: 'Two levels of comfort. One mattress.' },
    lede: {
      ro: 'Salteaua EFLEX MEMORY FOAM îmbină elasticitatea spumei poliuretanice HR (High Resilience) cu proprietățile stratului de Memory Foam, oferind posibilitatea de a alege între două senzații distincte de confort.',
      en: 'The EFLEX MEMORY FOAM joins the spring of HR (High Resilience) polyurethane foam to a layer of Memory Foam, and lets you choose between two distinct feels.',
    },
    body: [
      {
        ro: 'Construcția interioară păstrează structura saltelei EFLEX, realizată din patru straturi de spumă poliuretanică HR, cu densități diferite, completată pe una dintre fețe cu un strat suplimentar de Memory Foam de 4 cm.',
        en: 'Inside it keeps the EFLEX construction — four layers of HR polyurethane foam of different densities — with an extra 4 cm layer of Memory Foam on one face.',
      },
      {
        ro: 'Fața cu Memory Foam: stratul de 4 cm de spumă cu memorie se adaptează formei corpului și contribuie la distribuirea presiunii, oferind o senzație de confort mai învăluitoare.',
        en: 'The Memory Foam side: the 4 cm of memory foam takes the shape of the body and helps spread the pressure, for a more enveloping feel.',
      },
      {
        ro: 'Fața fără Memory Foam: oferă o senzație de confort mai fermă, fiind potrivită celor care preferă o suprafață de dormit mai tare.',
        en: 'The side without: a firmer feel, for those who prefer a harder surface to sleep on.',
      },
      {
        ro: 'Salteaua este reversibilă și poate fi utilizată pe ambele părți, astfel încât fiecare persoană își poate alege nivelul de confort preferat.',
        en: 'The mattress is reversible and can be used either way up, so each sleeper chooses the comfort they prefer.',
      },
    ],
    closing: {
      ro: 'EFLEX MEMORY FOAM – Libertatea de a alege confortul, printr-o simplă întoarcere a saltelei.',
      en: 'EFLEX MEMORY FOAM – the freedom to choose your comfort, by turning the mattress over.',
    },
    layers: [
      coverTop,
      {
        ...memoryFoam,
        detail: {
          ro: 'Pe o singură față: se adaptează formei corpului și contribuie la distribuirea presiunii. Pe partea cealaltă se doarme direct pe spuma HR, mai fermă.',
          en: 'On one face only: it takes the shape of the body and helps spread the pressure. Turned over, the mattress sleeps on the firmer HR foam.',
        },
      },
      ...eflexCore,
      coverBottom,
    ],
  },
  {
    slug: 'relaxa',
    name: 'Relaxa',
    kind: { ro: 'Arcuri Bonnell', en: 'Bonnell springs' },
    tagline: {
      ro: 'Susținere și confort prin sistemul de arcuri Bonnell',
      en: 'Support and comfort on Bonnell springs',
    },
    lede: {
      ro: 'Salteaua RELAXA combină sistemul clasic de arcuri Bonnell cu straturi de spumă poliuretanică, oferind o structură concepută pentru susținere și confort în timpul somnului.',
      en: 'The RELAXA pairs the classic Bonnell spring unit with layers of polyurethane foam, a construction made for support and comfort through the night.',
    },
    body: [
      {
        ro: 'În centrul construcției se află o plasă de arcuri Bonnell, integrată într-un cadru de spumă poliuretanică. Sistemul este completat de straturi de burete cu densități diferite, dispuse deasupra și dedesubtul plasei de arcuri.',
        en: 'At its centre is a Bonnell spring unit set in a polyurethane foam frame, with foams of different densities above and below it.',
      },
    ],
    closing: {
      ro: 'RELAXA – Construcție clasică pe arcuri, completată de confortul spumei poliuretanice.',
      en: 'RELAXA – a classic spring construction, finished with the comfort of polyurethane foam.',
    },
    layers: [coverTop, ...relaxaCore, coverBottom],
  },
  {
    slug: 'relaxa-memory-foam',
    name: 'Relaxa Memory Foam',
    kind: { ro: 'Memory Foam peste arcuri', en: 'Memory Foam over springs' },
    tagline: { ro: 'Confortul care te îmbrățișează', en: 'Comfort that holds you' },
    lede: {
      ro: 'Salteaua RELAXA MEMORY FOAM îmbină susținerea sistemului de arcuri Bonnell cu proprietățile speciale ale spumei Memory Foam, oferind o experiență de dormit în care confortul și adaptabilitatea se completează armonios.',
      en: 'The RELAXA MEMORY FOAM joins the support of Bonnell springs to the particular qualities of Memory Foam, for a night where comfort and give work together.',
    },
    body: [
      {
        ro: 'În centrul construcției se află o plasă de arcuri Bonnell, integrată într-un cadru din spumă poliuretanică și completată de straturi de burete cu densități diferite.',
        en: 'At its centre is a Bonnell spring unit set in a polyurethane foam frame, with foams of different densities around it.',
      },
      {
        ro: 'Elementul distinctiv este stratul suplimentar de Memory Foam, cu o grosime de 4 cm, amplasat pe suprafața de dormit. Acesta reacționează la căldura și presiunea corpului, adaptându-se treptat contururilor acestuia și oferind o senzație plăcută de confort și relaxare.',
        en: 'What sets it apart is an extra 4 cm of Memory Foam on the sleeping surface. It responds to the warmth and pressure of the body, settles gradually to its contours and gives a pleasant sense of comfort and rest.',
      },
    ],
    closing: {
      ro: 'RELAXA MEMORY FOAM – Susținerea arcurilor Bonnell, completată de senzația învăluitoare a spumei cu memorie.',
      en: 'RELAXA MEMORY FOAM – the support of Bonnell springs, with the enveloping feel of memory foam.',
    },
    layers: [coverTop, memoryFoam, ...relaxaCore, coverBottom],
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
