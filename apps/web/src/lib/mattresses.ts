/**
 * Mattresses — a first draft, built from workshop photographs (docs/WhatsApp
 * Image 2026-11-12 *.jpeg), not from a technical sheet.
 *
 * What the photographs show is stated: a three-colour foam core (light blue,
 * yellow, pink — the pink in two sheets), a quilted Aloe Vera knit cover top
 * and bottom, and a lime 3D mesh band round the sides. What they cannot show —
 * which foam each colour is, its density, every thickness — is left marked
 * `pending` and worded as such. The drawn thicknesses are proportions read off
 * the photographs, for the drawing only.
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
  texture: 'quilt' | 'foam' | 'foam-speckled' | 'knit'
  /** Not yet confirmed by the workshop. */
  pending?: boolean
}

export const mattress = {
  name: { ro: 'Saltea Aloe Vera', en: 'Aloe Vera mattress' },
  /** Top to bottom, as the drawing stacks them. */
  layers: [
    {
      id: 'cover-top',
      name: { ro: 'Husă matlasată Aloe Vera', en: 'Quilted Aloe Vera cover' },
      detail: {
        ro: 'Tricot alb cu model Aloe Vera, matlasat în valuri. Fața de dormit.',
        en: 'White knit with an Aloe Vera jacquard, quilted in waves. The sleeping side.',
      },
      draw: 2.5,
      tone: '#f6f6f0',
      texture: 'quilt',
    },
    {
      id: 'comfort',
      name: { ro: 'Strat de confort', en: 'Comfort layer' },
      detail: {
        ro: 'Spumă albastră, cu granulație fină — stratul pe care se doarme.',
        en: 'Fine-grained blue foam — the layer you sleep on.',
      },
      draw: 5,
      tone: '#cfe4e6',
      texture: 'foam-speckled',
      pending: true,
    },
    {
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
    },
    {
      id: 'core',
      name: { ro: 'Miez de susținere', en: 'Support core' },
      detail: {
        ro: 'Spumă roz, în două plăci lipite, care poartă greutatea.',
        en: 'Pink foam, two sheets bonded together, carrying the weight.',
      },
      draw: 8,
      tone: '#f2a7bd',
      texture: 'foam',
      pending: true,
    },
    {
      id: 'cover-bottom',
      name: { ro: 'Husă, fața inferioară', en: 'Cover, underside' },
      detail: {
        ro: 'Aceeași țesătură matlasată închide salteaua și dedesubt.',
        en: 'The same quilted knit closes the mattress underneath.',
      },
      draw: 1.5,
      tone: '#f1f1ea',
      texture: 'knit',
    },
  ] satisfies Layer[],
  band: {
    name: { ro: 'Bandă laterală din plasă 3D', en: '3D mesh side band' },
    detail: {
      ro: 'Plasă tridimensională verde pe toate cele patru laturi, care lasă aerul să circule prin saltea.',
      en: 'Green three-dimensional mesh on all four sides, letting air move through the mattress.',
    },
    tone: '#9cc81e',
  },
  /** Mattress sizes that match the beds' size pickers. Prices to come. */
  sizes: ['120 × 200', '140 × 200', '160 × 200', '180 × 200', '200 × 200'],
}
