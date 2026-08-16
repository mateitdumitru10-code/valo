import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type Lang = 'ro' | 'en'

/* -------------------------------------------------------------------------- */
/*  Copy                                                                       */
/*  Romanian is the source of truth — the market is Romanian and so is the      */
/*  factory. English is a full translation, not a machine pass.                 */
/* -------------------------------------------------------------------------- */

const ro = {
  'nav.collections': 'Colecții',
  'nav.categories': 'Categorii',
  'nav.pieces': 'Piese',
  'nav.atelier': 'Atelier',
  'nav.showrooms': 'Showroom-uri',
  'nav.contact': 'Contact',
  'nav.menu': 'Meniu',
  'nav.close': 'Închide',

  'common.back': 'Înapoi',
  'common.all': 'Toate',
  'common.pieces': 'piese',
  'common.piece': 'piesă',
  'common.from': 'de la',
  'common.enquire': 'Cere ofertă',
  'common.explore': 'Vezi colecția',
  'common.viewPiece': 'Vezi piesa',
  'common.scroll': 'Derulează',
  'common.index': 'Index',
  'common.collections': 'colecții',
  'common.next': 'Următoarea',
  'common.loading': 'Se încarcă',

  'hero.kicker': 'Mobilier tapițat · România',
  'hero.tagline': 'Piese construite pentru camerele în care se trăiește.',
  'hero.chapter.1.label': 'Atelier',
  'hero.chapter.1.line': 'Croit și tapițat în Vadu Săpat, Prahova.',
  'hero.chapter.2.label': 'Structură',
  'hero.chapter.2.line': 'Cadre din lemn, spume pe densități, arcuri în serpentină.',
  'hero.chapter.3.label': 'Textile',
  'hero.chapter.3.line': 'Țesături alese la atingere, nu din catalog.',
  'hero.chapter.4.label': 'Livrare',
  'hero.chapter.4.line': 'În toată țara, cu montaj la fața locului.',

  'manifesto.eyebrow': 'Cine suntem',
  'manifesto.body':
    'Vallo este brațul de distribuție al Samobi. Aceleași hale, aceiași tapițeri, același lemn — dar un catalog editat: colțare, canapele, paturi și fotolii alese pentru case unde mobila rămâne zece ani, nu două sezoane.',
  'manifesto.pull': 'Distribuim ceea ce se produce la doi pași de noi.',
  'manifesto.origin': 'Samobi · Vadu Săpat, Prahova',
  'manifesto.hands.lead':
    'Un colțar trece prin patru perechi de mâini înainte să plece din Vadu Săpat.',
  'manifesto.hand.1.role': 'Tâmplarul',
  'manifesto.hand.1.act': 'Închide cadrul.',
  'manifesto.hand.2.role': 'Croitorul',
  'manifesto.hand.2.act': 'Așază textilul.',
  'manifesto.hand.3.role': 'Tapițerul',
  'manifesto.hand.3.act': 'Trage materialul peste spumă.',
  'manifesto.hand.4.role': 'Controlul',
  'manifesto.hand.4.act': 'Verifică cusătura înainte de ambalare.',
  'manifesto.link': 'Despre atelier',

  'collections.eyebrow': 'Colecții',
  'collections.title': 'Un desen, dus mai departe',
  'collections.lede':
    'O colecție e un desen dus mai departe: același braț, același soclu, aceeași cusătură, croite pe rând ca fotoliu, colțar, modul sau pat. Se comandă o piesă sau se scrie camera întreagă în aceeași limbă.',
  'collections.hoverHint': 'Treci cu mouse-ul peste un titlu',

  'categories.eyebrow': 'Categorii',
  'categories.title': 'Șase feluri de piese',
  'categories.lede':
    'Catalogul întreg, împărțit după cum se folosește o casă: locul unde stai, locul unde dormi, locul prin care treci.',
  'collection.across': 'Se regăsește în',
  'collection.only': 'O singură piesă, deocamdată.',

  'featured.eyebrow': 'Selecție',
  'featured.title': 'Piese în lumină',
  'featured.lede':
    'Zece piese pe care le-am fotografiat în camere reale, nu pe fundal alb.',
  'featured.drag': 'Trage lateral',

  'craft.eyebrow': 'Cum se face',
  'craft.title': 'Patru pași și nicio scurtătură',
  'craft.1.title': 'Cadrul',
  'craft.1.body':
    'Lemn uscat și plăci stratificate, încheiate mecanic. Cadrul e piesa care decide dacă o canapea trăiește zece ani sau doi.',
  'craft.2.title': 'Confortul',
  'craft.2.body':
    'Spume pe densități diferite pentru șezut și spătar, arcuri în serpentină acolo unde se stă zilnic.',
  'craft.3.title': 'Textila',
  'craft.3.body':
    'Catifele, țesături bouclé și piele ecologică. Alegerea se face cu mostra în mână, în showroom.',
  'craft.4.title': 'Livrarea',
  'craft.4.body':
    'Transport în toată România și montaj la destinație. Garanție 24 de luni pentru fiecare piesă.',

  'lineage.eyebrow': 'Origine',
  'lineage.title': 'Un nume nou. O fabrică veche de tot.',
  'lineage.body':
    'Samobi produce mobilier tapițat în comuna Vadu Săpat, județul Prahova, și îl vinde prin showroom-uri proprii în București, Ploiești, Constanța și Buzău. Vallo preia din acest catalog piesele cu cea mai lungă viață și le duce mai departe, sub un nume propriu.',
  'lineage.stat.1': 'Fabrică proprie',
  'lineage.stat.1.value': 'Vadu Săpat, PH',
  'lineage.stat.2': 'Garanție',
  'lineage.stat.2.value': '24 de luni',
  'lineage.stat.3': 'Showroom-uri',
  'lineage.stat.3.value': '6, în 4 orașe',
  'lineage.link': 'mobilasamobi.ro',

  'showrooms.eyebrow': 'Unde ne găsiți',
  'showrooms.title': 'Showroom-uri',
  'showrooms.lede':
    'Textilele se aleg cu mâna. Veniți să vă așezați pe ele înainte să comandați.',
  'showrooms.hours': 'Program',
  'showrooms.phone': 'Telefon',
  'showrooms.factory': 'Fabrică',
  'showrooms.showroom': 'Showroom',

  'contact.eyebrow': 'Contact',
  'contact.title': 'Spuneți-ne ce cameră amenajați',
  'contact.lede':
    'Trimiteți dimensiunile camerei și piesa care vă interesează. Răspundem cu o ofertă și cu variantele de textile disponibile.',
  'contact.name': 'Nume',
  'contact.email': 'Email',
  'contact.phone': 'Telefon',
  'contact.piece': 'Piesa de interes',
  'contact.message': 'Mesaj',
  'contact.messagePlaceholder': 'Camera, dimensiunile, culoarea la care vă gândiți…',
  'contact.submit': 'Trimite cererea',
  'contact.sending': 'Se trimite…',
  'contact.success': 'Am primit cererea. Vă răspundem în cel mult o zi lucrătoare.',
  'contact.error': 'Cererea nu a putut fi trimisă. Sunați-ne la 0733 853 257.',
  'contact.required': 'Câmp obligatoriu',
  'contact.invalidEmail': 'Adresă de email invalidă',
  'contact.optional': 'opțional',

  'piece.eyebrow': 'Piesă',
  'piece.dimensions': 'Dimensiuni',
  'piece.dimensionsNote': 'lățime × adâncime × înălțime, mm',
  'piece.description': 'Descriere',
  'piece.spec': 'Fișă tehnică',
  'piece.collection': 'Colecție',
  'piece.category': 'Categorie',
  'piece.code': 'Cod',
  'piece.warranty': 'Garanție',
  'piece.warrantyValue': '24 de luni',
  'piece.origin': 'Producție',
  'piece.originValue': 'Vadu Săpat, Prahova',
  'piece.related': 'Din aceeași colecție',
  'piece.relatedCategory': 'Din aceeași categorie',
  'piece.priceNote': 'Preț de listă, textil standard. TVA inclus.',
  'piece.roNote': 'Descriere din fișa de producție.',
  'piece.plan': 'Plan',
  'piece.planTitle': 'Cotele piesei',
  'piece.planNote': 'Cote în centimetri, preluate din desenul de execuție al atelierului.',
  'piece.width': 'Lățime',
  'piece.depth': 'Adâncime, cu șezlong',
  'piece.depthBack': 'Adâncime, corp canapea',
  'piece.seat': 'Adâncime șezut',
  'piece.textile': 'Culoare',
  'piece.textileNote': 'Nuanțele sunt fotografiate, nu simulate. Paleta completă se vede în showroom.',
  'piece.options': 'nuanțe',
  'contact.sizePrefill': 'Mă interesează salteaua de {size} cm.',
  'piece.size': 'Dimensiune',
  'piece.sizeOptions': 'dimensiuni',
  'piece.sizeUnit': 'cm',
  'piece.sizeNote':
    'Dimensiunea saltelei, în centimetri. Fabrica fiind a noastră, se pot croi și alte dimensiuni — cereți-ne și vă răspundem în aceeași zi.',
  'piece.gallery': 'Galerie',
  'piece.detail': 'În detaliu',
  'piece.shotIn': 'Fotografiat în',
  'piece.views': 'vederi',

  'category.lede.sectionals':
    'Colțare modulare, cu ladă de depozitare și extensie de dormit. Piesa care organizează un living întreg.',
  'category.lede.sofas':
    'Canapele fixe și extensibile, de la două locuri la piese de patru metri.',
  'category.lede.beds':
    'Paturi tapițate cu somieră rabatabilă și ladă. Tăblii capitonate sau cu panouri cusute.',
  'category.lede.armchairs':
    'Fotolii fixe și extensibile, pentru colțul de citit sau pentru un oaspete peste noapte.',
  'category.lede.hallway':
    'Ansambluri pentru hol și living: canapea, fotolii și măsuță, gândite împreună.',
  'category.lede.nightstands':
    'Noptiere tapițate, asortate tăbliilor de pat din aceeași colecție.',
  'category.lede.seating':
    'Scaune și taburete tapițate — piesele mici care leagă restul camerei.',

  'collection.lede.aldo':
    'Blocuri adânci, capitonate mărunt, pe picioare joase. Cinci piese pe același desen: colțarul, canapeaua extensibilă, modulul, canapeaua rotundă și patul.',
  'collection.lede.cubic':
    'Volume drepte așezate pe un soclu cu falduri strânse. Aceeași geometrie la patru scări — modul, colțar, canapea și pat.',
  'collection.lede.soria':
    'Braț lat, șezut adânc, extensie de dormit. Un colțar, un colțar în U și canapeaua din aceeași familie.',
  'collection.lede.torro':
    'Braț-bloc și tetiere rabatabile. Colțarul și canapeaua, aceeași linie citită la două lungimi.',
  'collection.lede.linear':
    'Linie joasă, fără ornament, cu o singură cusătură orizontală. Un colțar și un pat croite din aceeași tăietură.',
  'collection.lede.bella':
    'Brațe rotunjite și perne libere, într-un bouclé care ține forma. Deocamdată o singură piesă.',
  'collection.lede.ela':
    'Corp jos, cu falduri strânse pe soclu și perne libere pe toată lungimea. Deocamdată o singură canapea, în șapte nuanțe.',
  'collection.lede.vallo':
    'Spătare joase și o cusătură verticală care împarte șezutul. Deocamdată un singur colțar.',

  'story.eyebrow': 'Atelier',
  'story.title': 'Mobilă făcută unde se și vinde',
  'story.p1':
    'Piesele Vallo se croiesc și se tapițează în hala Samobi din comuna Vadu Săpat, județul Prahova. Nu importăm containere; producem la 60 de kilometri de București și livrăm de acolo în toată țara.',
  'story.p2':
    'Un colțar trece prin patru mâini: tâmplarul care încheie cadrul, croitorul care taie textila, tapițerul care o trage pe spumă și omul care verifică cusătura înainte de ambalare. Ne place să credem că se vede.',
  'story.p3':
    'Pentru că fabrica e a noastră, se poate schimba ce vrea clientul: dimensiunea, partea pe care cade colțul, textila, adâncimea șezutului. Cereți-ne o modificare și vă spunem în aceeași zi dacă se poate.',
  'story.quote': 'O canapea bună se recunoaște după cadru, nu după pernă.',

  'footer.tagline': 'Mobilier tapițat, distribuit din Prahova în toată România.',
  'footer.rights': 'Toate drepturile rezervate.',
  'footer.parent': 'Companie a',
  'footer.newsletter': 'Piese noi, o dată pe lună',
  'footer.subscribe': 'Abonează-te',
  'footer.emailPlaceholder': 'Adresa de email',

  'notFound.title': 'Pagina nu există',
  'notFound.body': 'Linkul e greșit sau piesa a ieșit din catalog.',
  'notFound.link': 'Înapoi la colecții',
} as const

const en: Record<keyof typeof ro, string> = {
  'nav.collections': 'Collections',
  'nav.categories': 'Categories',
  'nav.pieces': 'Pieces',
  'nav.atelier': 'Atelier',
  'nav.showrooms': 'Showrooms',
  'nav.contact': 'Contact',
  'nav.menu': 'Menu',
  'nav.close': 'Close',

  'common.back': 'Back',
  'common.all': 'All',
  'common.pieces': 'pieces',
  'common.piece': 'piece',
  'common.from': 'from',
  'common.enquire': 'Request a quote',
  'common.explore': 'View collection',
  'common.viewPiece': 'View piece',
  'common.scroll': 'Scroll',
  'common.index': 'Index',
  'common.collections': 'collections',
  'common.next': 'Next',
  'common.loading': 'Loading',

  'hero.kicker': 'Upholstered furniture · Romania',
  'hero.tagline': 'Pieces built for rooms that get lived in.',
  'hero.chapter.1.label': 'Atelier',
  'hero.chapter.1.line': 'Cut and upholstered in Vadu Săpat, Prahova.',
  'hero.chapter.2.label': 'Structure',
  'hero.chapter.2.line': 'Timber frames, layered foam, serpentine springs.',
  'hero.chapter.3.label': 'Textiles',
  'hero.chapter.3.line': 'Fabrics chosen by hand, not from a swatch list.',
  'hero.chapter.4.label': 'Delivery',
  'hero.chapter.4.line': 'Nationwide, assembled in the room.',

  'manifesto.eyebrow': 'Who we are',
  'manifesto.body':
    'Vallo is the distribution arm of Samobi. The same workshop, the same upholsterers, the same timber — but an edited catalogue: sectionals, sofas, beds and armchairs picked for homes where furniture stays ten years, not two seasons.',
  'manifesto.pull': 'We distribute what is made a few steps away.',
  'manifesto.origin': 'Samobi · Vadu Săpat, Prahova',
  'manifesto.hands.lead':
    'A sectional passes through four pairs of hands before it leaves Vadu Săpat.',
  'manifesto.hand.1.role': 'The joiner',
  'manifesto.hand.1.act': 'Closes the frame.',
  'manifesto.hand.2.role': 'The cutter',
  'manifesto.hand.2.act': 'Lays the textile.',
  'manifesto.hand.3.role': 'The upholsterer',
  'manifesto.hand.3.act': 'Pulls it over the foam.',
  'manifesto.hand.4.role': 'The check',
  'manifesto.hand.4.act': 'Checks the seam before wrapping.',
  'manifesto.link': 'About the atelier',

  'collections.eyebrow': 'Collections',
  'collections.title': 'One drawing, carried further',
  'collections.lede':
    'A collection is one drawing carried further: the same arm, the same base, the same seam, cut in turn as a corner, a sofa, a module, a bed. Order a single piece, or write the whole room in one language.',
  'collections.hoverHint': 'Hover a title',

  'categories.eyebrow': 'Categories',
  'categories.title': 'Six kinds of piece',
  'categories.lede':
    'The whole catalogue, sorted the way a house is used: where you sit, where you sleep, what you pass through.',
  'collection.across': 'Runs across',
  'collection.only': 'One piece, for now.',

  'featured.eyebrow': 'Selection',
  'featured.title': 'In the light',
  'featured.lede': 'Ten pieces photographed in real rooms, not against white.',
  'featured.drag': 'Drag sideways',

  'craft.eyebrow': 'How it is made',
  'craft.title': 'Four steps, no shortcuts',
  'craft.1.title': 'The frame',
  'craft.1.body':
    'Dried timber and laminated board, mechanically joined. The frame decides whether a sofa lasts ten years or two.',
  'craft.2.title': 'The comfort',
  'craft.2.body':
    'Different foam densities for seat and back, serpentine springs wherever a seat is used daily.',
  'craft.3.title': 'The textile',
  'craft.3.body':
    'Velvets, bouclé weaves and eco leather. The choice is made with the swatch in your hand, in the showroom.',
  'craft.4.title': 'The delivery',
  'craft.4.body':
    'Shipping across Romania and assembly on site. Twenty-four months of warranty on every piece.',

  'lineage.eyebrow': 'Origin',
  'lineage.title': 'A new name. A long-standing factory.',
  'lineage.body':
    'Samobi manufactures upholstered furniture in Vadu Săpat, Prahova County, and sells it through its own showrooms in Bucharest, Ploiești, Constanța and Buzău. Vallo takes the longest-lived pieces from that catalogue and carries them under a name of their own.',
  'lineage.stat.1': 'Own factory',
  'lineage.stat.1.value': 'Vadu Săpat, PH',
  'lineage.stat.2': 'Warranty',
  'lineage.stat.2.value': '24 months',
  'lineage.stat.3': 'Showrooms',
  'lineage.stat.3.value': '6, in 4 cities',
  'lineage.link': 'mobilasamobi.ro',

  'showrooms.eyebrow': 'Where to find us',
  'showrooms.title': 'Showrooms',
  'showrooms.lede':
    'Textiles are chosen by hand. Come and sit on them before you order.',
  'showrooms.hours': 'Hours',
  'showrooms.phone': 'Phone',
  'showrooms.factory': 'Factory',
  'showrooms.showroom': 'Showroom',

  'contact.eyebrow': 'Contact',
  'contact.title': 'Tell us which room you are furnishing',
  'contact.lede':
    'Send the room dimensions and the piece you have in mind. We reply with a quote and the textiles currently available.',
  'contact.name': 'Name',
  'contact.email': 'Email',
  'contact.phone': 'Phone',
  'contact.piece': 'Piece of interest',
  'contact.message': 'Message',
  'contact.messagePlaceholder': 'The room, the dimensions, the colour you have in mind…',
  'contact.submit': 'Send request',
  'contact.sending': 'Sending…',
  'contact.success': 'Request received. We answer within one working day.',
  'contact.error': 'The request could not be sent. Call us on +40 733 853 257.',
  'contact.required': 'Required field',
  'contact.invalidEmail': 'Invalid email address',
  'contact.optional': 'optional',

  'piece.eyebrow': 'Piece',
  'piece.dimensions': 'Dimensions',
  'piece.dimensionsNote': 'width × depth × height, mm',
  'piece.description': 'Description',
  'piece.spec': 'Specification',
  'piece.collection': 'Collection',
  'piece.category': 'Category',
  'piece.code': 'Code',
  'piece.warranty': 'Warranty',
  'piece.warrantyValue': '24 months',
  'piece.origin': 'Made in',
  'piece.originValue': 'Vadu Săpat, Prahova',
  'piece.related': 'From the same collection',
  'piece.relatedCategory': 'From the same category',
  'piece.priceNote': 'List price, standard textile. VAT included.',
  'piece.roNote': 'Description as written on the production sheet, in Romanian.',
  'piece.plan': 'Plan',
  'piece.planTitle': 'Measured drawing',
  'piece.planNote': 'Centimetres, taken from the workshop drawing.',
  'piece.width': 'Width',
  'piece.depth': 'Depth, with chaise',
  'piece.depthBack': 'Depth, sofa body',
  'piece.seat': 'Seat depth',
  'piece.textile': 'Colour',
  'piece.textileNote': 'Shades are photographed, not simulated. The full range is in the showroom.',
  'piece.options': 'shades',
  'contact.sizePrefill': 'I am interested in the {size} cm mattress.',
  'piece.size': 'Size',
  'piece.sizeOptions': 'sizes',
  'piece.sizeUnit': 'cm',
  'piece.sizeNote':
    'Mattress size, in centimetres. The workshop is ours, so other sizes can be cut — ask and we answer the same day.',
  'piece.gallery': 'Gallery',
  'piece.detail': 'In detail',
  'piece.shotIn': 'Photographed in',
  'piece.views': 'views',

  'category.lede.sectionals':
    'Modular sectionals with storage and a sleeping extension. The piece that organises a whole living room.',
  'category.lede.sofas':
    'Fixed and extendable sofas, from two seats to four-metre pieces.',
  'category.lede.beds':
    'Upholstered beds with lift-up bases and storage. Buttoned or panel-stitched headboards.',
  'category.lede.armchairs':
    'Fixed and extendable armchairs, for the reading corner or an overnight guest.',
  'category.lede.hallway':
    'Hallway and living sets: sofa, armchairs and table, designed together.',
  'category.lede.nightstands':
    'Upholstered nightstands matched to the headboards of the same collection.',
  'collection.lede.aldo':
    'Deep blocks, finely tufted, on low feet. Five pieces on one drawing: the corner, the sofa bed, the module, the round sofa and the bed.',
  'collection.lede.cubic':
    'Straight volumes set on a gathered base. One geometry at four scales — module, corner, sofa and bed.',
  'collection.lede.soria':
    'A wide arm, a deep seat, a bed inside. A corner, a corner in a U, and the sofa of the same family.',
  'collection.lede.torro':
    'Block arms and folding headrests. The corner and the sofa, one line read at two lengths.',
  'collection.lede.linear':
    'A low line, no ornament, a single horizontal seam. A corner and a bed cut the same way.',
  'collection.lede.bella':
    'Rounded arms and loose cushions, in a bouclé that holds its shape. One piece so far.',
  'collection.lede.ela':
    'A low body, gathered along the base, loose cushions its whole length. One sofa so far, in seven tones.',
  'collection.lede.vallo':
    'Low backs and a vertical seam dividing the seat. One corner so far.',

  'category.lede.seating':
    'Upholstered chairs and stools — the small pieces that tie the room together.',

  'story.eyebrow': 'Atelier',
  'story.title': 'Furniture made where it is sold',
  'story.p1':
    'Vallo pieces are cut and upholstered in the Samobi workshop in Vadu Săpat, Prahova County. We do not import containers; we make furniture 60 kilometres from Bucharest and ship it from there across the country.',
  'story.p2':
    'A sectional passes through four pairs of hands: the joiner who closes the frame, the cutter who lays the textile, the upholsterer who pulls it over the foam, and the person who checks the seam before it is wrapped. We like to think it shows.',
  'story.p3':
    'Because the factory is ours, what a client wants can change: the size, the side the corner falls on, the textile, the seat depth. Ask us for a modification and we will tell you the same day whether it can be done.',
  'story.quote': 'A good sofa is judged by its frame, not by its cushion.',

  'footer.tagline': 'Upholstered furniture, distributed from Prahova across Romania.',
  'footer.rights': 'All rights reserved.',
  'footer.parent': 'A company of',
  'footer.newsletter': 'New pieces, once a month',
  'footer.subscribe': 'Subscribe',
  'footer.emailPlaceholder': 'Email address',

  'notFound.title': 'Page not found',
  'notFound.body': 'The link is wrong, or the piece has left the catalogue.',
  'notFound.link': 'Back to collections',
}

const dict: Record<Lang, Record<string, string>> = { ro, en }

export type Key = keyof typeof ro

type Ctx = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: Key) => string
}

const I18nContext = createContext<Ctx | null>(null)
const STORAGE_KEY = 'valo:lang'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'en' ? 'en' : 'ro'
  })

  useEffect(() => {
    document.documentElement.lang = lang
    localStorage.setItem(STORAGE_KEY, lang)
  }, [lang])

  const setLang = useCallback((l: Lang) => setLangState(l), [])
  const t = useCallback((key: Key) => dict[lang][key] ?? dict.ro[key] ?? key, [lang])

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}
