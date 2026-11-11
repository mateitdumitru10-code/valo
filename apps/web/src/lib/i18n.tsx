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
  'nav.pieces': 'Produse',
  'nav.horeca': 'HoReCa',
  'nav.showrooms': 'Showroom-uri',
  'nav.contact': 'Contact',
  'nav.menu': 'Meniu',
  'nav.close': 'Închide',

  'common.back': 'Înapoi',
  'common.all': 'Toate',
  'common.pieces': 'produse',
  'common.piece': 'produs',
  'common.from': 'de la',
  'common.enquire': 'Cere ofertă',
  'common.explore': 'Vezi colecția',
  'common.viewPiece': 'Vezi produsul',
  'common.scroll': 'Derulează',
  'common.index': 'Index',
  'common.collections': 'colecții',
  'common.next': 'Următoarea',
  'common.loading': 'Se încarcă',

  'hero.kicker': 'Mobilier tapițat · România',
  'hero.tagline': 'Produse construite pentru camerele în care se trăiește.',
  'hero.chapter.1.label': 'Atelier',
  'hero.chapter.1.line': 'Croit și tapițat în Vadu Săpat, Prahova.',
  'hero.chapter.2.label': 'Structură',
  'hero.chapter.2.line': 'Cadre din lemn, spume pe densități, arcuri în serpentină.',
  'hero.chapter.3.label': 'Textile',
  'hero.chapter.3.line': 'Țesături alese la atingere, nu din catalog.',

  'manifesto.eyebrow': 'Cine suntem',
  'manifesto.title': 'Mai mult decât mobilier. O expresie a spațiului tău.',
  'manifesto.lede': 'Un interior memorabil începe cu produse care au prezență.',
  'manifesto.body':
    'VALLO creează mobilier contemporan în care designul, confortul și materialele se întâlnesc într-o formă atent construită. Fiecare volum, fiecare cusătură și fiecare textură este aleasă pentru a crea o experiență care se vede, se simte și rămâne.',
  'manifesto.pull':
    'Forme care atrag privirea. Materiale care invită la atingere. Confort creat pentru a fi trăit.',
  'manifesto.close': 'Aceasta este VALLO.',
  'manifesto.origin': 'Samobi · Vadu Săpat, Prahova',
  'manifesto.hands.lead':
    'Un produs trece prin 4 etape înainte să părăsească fabrica.',
  'manifesto.hand.1.role': 'Tâmplarul',
  'manifesto.hand.1.act': 'Închide cadrul.',
  'manifesto.hand.2.role': 'Croitorul',
  'manifesto.hand.2.act': 'Așază textilul.',
  'manifesto.hand.3.role': 'Tapițerul',
  'manifesto.hand.3.act': 'Trage materialul peste spumă.',
  'manifesto.hand.4.role': 'Controlul',
  'manifesto.hand.4.act': 'Verifică cusătura înainte de ambalare.',
  'manifesto.link': 'Descoperă colecția',

  'collections.eyebrow': 'Colecții',
  'collections.title': 'Un desen, dus mai departe',
  'collections.lede':
    'O colecție e un desen dus mai departe: același braț, același soclu, aceeași cusătură, croite pe rând ca fotoliu, colțar, modul sau pat. Se comandă un produs sau se scrie camera întreagă în aceeași limbă.',
  'collections.hoverHint': 'Treci cu mouse-ul peste un titlu',

  'categories.eyebrow': 'Categorii',
  'categories.title': 'Șase feluri de produse',
  'categories.lede':
    'Catalogul întreg, împărțit după cum se folosește o casă: locul unde stai, locul unde dormi, locul prin care treci.',
  'collection.across': 'Se regăsește în',
  'collection.only': 'Un singur produs, deocamdată.',

  'featured.eyebrow': 'Selecție',
  'featured.title': 'Produse în lumină',
  'featured.lede':
    'Zece produse pe care le-am fotografiat în camere reale, nu pe fundal alb.',
  'featured.drag': 'Trage lateral',

  'craft.eyebrow': 'Cum se face',
  'craft.title': 'Patru pași. Nicio scurtătură.',
  'craft.lede': 'Un produs VALLO nu începe cu tapițeria. Începe cu ceea ce nu se vede.',
  'craft.body':
    'De la structura interioară până la ultimul detaliu al finisajului, fiecare etapă este parte dintr-un proces construit pentru confort, rezistență și un rezultat care se simte în fiecare zi.',
  'craft.1.title': 'Structura',
  'craft.1.tag': 'Totul începe din interior.',
  'craft.1.body':
    'O structură bine construită este fundația unui produs care rezistă. Folosim materiale atent selecționate și îmbinări realizate cu precizie pentru a oferi stabilitate și rezistență pe termen lung.',
  'craft.2.title': 'Confortul',
  'craft.2.tag': 'Confortul nu se vede. Se simte.',
  'craft.2.body':
    'Alegem fiecare strat în funcție de experiența pe care vrem să o ofere produsul. Bureți de calitate, arcuri și, acolo unde designul o cere, memory foam — fiecare contribuie la senzația de confort pe care o simți din primul moment.',
  'craft.3.title': 'Tapițeria',
  'craft.3.tag': 'Ultimul strat. Prima impresie.',
  'craft.3.body':
    'Țesătura dă personalitate unui produs. Selectăm materiale pentru textura, aspectul și senzația lor la atingere, astfel încât fiecare colecție să poată fi adaptată spațiului și stilului tău.',
  'craft.4.title': 'Finisajul',
  'craft.4.tag': 'Detaliile fac diferența.',
  'craft.4.body':
    'Ultimele cusături, proporțiile, liniile și finisajele sunt verificate cu aceeași atenție cu care începe construcția. Pentru că un produs bine făcut nu trebuie doar să arate impecabil. Trebuie să se simtă impecabil.',
  'craft.close': 'Designul atrage privirea. Execuția îi dă valoare.',

  'lineage.eyebrow': 'Origine',
  'lineage.title': 'Un nume nou. O fabrică veche de tot.',
  'lineage.body':
    'Samobi produce mobilier tapițat în comuna Vadu Săpat, județul Prahova, și îl vinde prin showroom-uri proprii în București, Ploiești, Constanța și Buzău. Vallo preia din acest catalog produsele cu cea mai lungă viață și le duce mai departe, sub un nume propriu.',
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
    'Trimiteți dimensiunile camerei și produsul care vă interesează. Răspundem cu o ofertă și cu variantele de textile disponibile.',
  'contact.name': 'Nume',
  'contact.email': 'Email',
  'contact.phone': 'Telefon',
  'contact.piece': 'Produsul de interes',
  'contact.message': 'Mesaj',
  'contact.messagePlaceholder': 'Camera, dimensiunile, culoarea la care vă gândiți…',
  'contact.submit': 'Trimite cererea',
  'contact.sending': 'Se trimite…',
  'contact.success': 'Am primit cererea. Vă răspundem în cel mult o zi lucrătoare.',
  'contact.error': 'Cererea nu a putut fi trimisă. Sunați-ne la 0733 358 066.',
  'contact.required': 'Câmp obligatoriu',
  'contact.invalidEmail': 'Adresă de email invalidă',
  'contact.optional': 'opțional',

  'piece.eyebrow': 'Produs',
  'piece.dimensions': 'Dimensiuni',
  'piece.dimensionsNote': 'lățime × adâncime × înălțime, mm',
  'piece.description': 'Descriere',
  'piece.spec': 'Fișă tehnică',
  'piece.collection': 'Colecție',
  'piece.collectionOf': 'Colecția',
  'piece.price': 'Preț',
  'piece.category': 'Categorie',
  'piece.code': 'Cod',
  'piece.warranty': 'Garanție',
  'piece.warrantyValue': '24 de luni',
  'piece.origin': 'Producție',
  'piece.originValue': 'Vadu Săpat, Prahova',
  'piece.related': 'Din aceeași colecție',
  'piece.relatedCategory': 'Din aceeași categorie',
  'piece.priceNote': 'Preț de listă, textil standard. TVA inclus.',
  'piece.priceNoteOption':
    'Preț de listă pentru varianta aleasă, textil standard. TVA inclus.',
  'piece.roNote': 'Descriere din fișa de producție.',
  'piece.plan': 'Plan',
  'piece.planTitle': 'Cotele produsului',
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
  'piece.mattress': 'Saltea',
  'piece.mattressOptions': 'variante',
  'piece.mattressNote':
    'Același produs, cu salteaua aleasă de dumneavoastră. Prețul se schimbă odată cu ea.',
  'piece.seatType': 'Șezut',
  'piece.seatNote':
    'Același produs, cu șezutul pe care îl preferați: plasă de arcuri sau Memory Foam. Prețul variantei îl confirmăm în ofertă.',
  'contact.optionPrefill': 'Mă interesează varianta: {option}.',
  'piece.build': 'Construcție și dotări',
  'piece.buildNote': 'Din fișa tehnică a atelierului. Orice configurație personalizată se confirmă în oferta individuală.',
  'piece.planApprox':
    'Schiță de atelier, orientativă. Cotele confirmate sunt cele din fișa tehnică.',
  'piece.gallery': 'Galerie',
  'piece.detail': 'În detaliu',
  'piece.shotIn': 'Fotografiat în',
  'piece.views': 'vederi',

  'category.lede.sectionals':
    'Colțare modulare, cu ladă de depozitare și extensie de dormit. Produsul care organizează un living întreg.',
  'category.lede.sofas':
    'Canapele fixe și extensibile, de la două locuri la produse de patru metri.',
  'category.lede.beds':
    'Paturi tapițate cu somieră rabatabilă și ladă. Tăblii capitonate sau cu panouri cusute.',
  'category.lede.armchairs':
    'Fotolii fixe și extensibile, pentru colțul de citit sau pentru un oaspete peste noapte.',
  'category.lede.hallway':
    'Ansambluri pentru hol și living: canapea, fotolii și măsuță, gândite împreună.',
  'category.lede.nightstands':
    'Noptiere tapițate, asortate tăbliilor de pat din aceeași colecție.',
  'category.lede.seating':
    'Scaune și taburete tapițate — produsele mici care leagă restul camerei.',

  'collection.lede.aldo':
    'Blocuri adânci, capitonate mărunt, pe picioare joase. Cinci produse pe același desen: colțarul, canapeaua extensibilă, modulul, canapeaua rotundă și patul.',
  'collection.lede.cubic':
    'Volume drepte așezate pe un soclu cu falduri strânse. Aceeași geometrie la patru scări — modul, colțar, canapea și pat.',
  'collection.lede.soria':
    'Braț lat, șezut adânc, extensie de dormit. Un colțar, un colțar în U și canapeaua din aceeași familie.',
  'collection.lede.torro':
    'Braț-bloc și tetiere rabatabile. Colțarul și canapeaua, aceeași linie citită la două lungimi.',
  'collection.lede.linear':
    'Linie joasă, fără ornament, cu o singură cusătură orizontală. Un colțar și un pat croite din aceeași tăietură.',
  'collection.lede.bella':
    'Brațe rotunjite și perne libere, într-un bouclé care ține forma. Deocamdată un singur produs.',
  'collection.lede.ela':
    'Corp jos, cu falduri strânse pe soclu și perne libere pe toată lungimea. Deocamdată o singură canapea, în șapte nuanțe.',
  'collection.lede.vallo':
    'Spătare joase și o cusătură verticală care împarte șezutul. Deocamdată un singur colțar.',

  /* The four ranges the client has written a full description for. `pull` is
     the statement the collection page opens on, `body` the prose under it —
     paragraphs split on a blank line. The `lede` above stays the short,
     concrete blurb the index needs, and is not the same sentence twice. */
  'collection.pull.aldo': 'Confort care se simte. Design care rămâne.',
  'collection.body.aldo':
    'ALDO este o colecție construită în jurul confortului generos și al unei prezențe imposibil de ignorat. Tapițeria bouclé, stratul de memory foam și structura din lemn masiv de fag, brad și placaj de eucalipt oferă senzația de confort profund, susținută de o construcție gândită să reziste în timp.\n\nCanapea, colțar, modul — fiecare produs este extensibil sau configurabil pentru felul în care alegi să trăiești spațiul.\n\nALDO. O colecție în care confortul devine parte din design.',
  'collection.pull.cubic': 'Minimalism în formă. Generozitate în confort.',
  'collection.body.cubic':
    'CUBIC se remarcă printr-un design minimalist, proporții neobișnuite și un șezut surprinzător de lat și moale. Buretele de înaltă calitate oferă un confort aparte, transformând liniile simple ale colecției într-o experiență de relaxare pe care o simți imediat.\n\nLinii curate. Dimensiuni aparte. Confort fără compromis.',
  'collection.pull.soria': 'Confort construit în detalii.',
  'collection.body.soria':
    'SORIA îmbină un design elegant cu o construcție gândită pentru confort de durată. Șezutul cu arcuri sinusoidale, susținut de o structură din lemn masiv de fag și brad, oferă o senzație plăcută de susținere și relaxare.\n\nDetaliile matlasate de pe șezut și brațele cu formă ondulată îi dau colecției o personalitate aparte, în timp ce extensia și lada de depozitare adaugă funcționalitate discretă.\n\nEleganță în formă. Confort în fiecare detaliu.',
  'collection.pull.torro': 'Confort care se adaptează. Design care rămâne.',
  'collection.body.torro':
    'TORRO combină liniile contemporane cu un confort atent construit. Șezutul cu arcuri sinusoidale oferă susținere plăcută și rezistență în timp, iar tetierele reglabile permit ajustarea poziției pentru un plus de confort. Extensia completează funcționalitatea colecției, transformând fiecare moment de relaxare într-o experiență mai generoasă.\n\nSusținere precisă. Confort personalizat.',


  'footer.tagline': 'Mobilier tapițat, distribuit din Prahova în toată România.',
  'footer.rights': 'Toate drepturile rezervate.',
  'footer.parent': 'Companie a',
  'horeca.open': 'Răsfoiește catalogul',
  'horeca.download': 'Descarcă PDF',
  'horeca.loading': 'Se încarcă catalogul…',
  'horeca.failed': 'Catalogul nu a putut fi deschis. Încercați să îl descărcați.',
  'horeca.close': 'Închide',
  'horeca.fullscreen': 'Ecran complet',
  'horeca.prev': 'Pagina anterioară',
  'horeca.next': 'Pagina următoare',
  'horeca.zoomIn': 'Mărește',
  'horeca.zoomOut': 'Micșorează',
  'footer.newsletter': 'Produse noi, o dată pe lună',
  'footer.subscribe': 'Abonează-te',
  'footer.emailPlaceholder': 'Adresa de email',

  'notFound.title': 'Pagina nu există',
  'notFound.body': 'Linkul e greșit sau produsul a ieșit din catalog.',
  'notFound.link': 'Înapoi la colecții',
} as const

const en: Record<keyof typeof ro, string> = {
  'nav.collections': 'Collections',
  'nav.categories': 'Categories',
  'nav.pieces': 'Pieces',
  'nav.horeca': 'HoReCa',
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

  'manifesto.eyebrow': 'Who we are',
  'manifesto.title': 'More than furniture. An expression of your space.',
  'manifesto.lede': 'A memorable interior starts with pieces that have presence.',
  'manifesto.body':
    'VALLO makes contemporary furniture where design, comfort and material meet in one carefully built form. Every volume, every seam and every texture is chosen for what it does — to the eye, to the hand, and over the years.',
  'manifesto.pull':
    'Shapes that draw the eye. Materials that ask to be touched. Comfort built to be lived in.',
  'manifesto.close': 'This is VALLO.',
  'manifesto.origin': 'Samobi · Vadu Săpat, Prahova',
  'manifesto.hands.lead':
    'A piece passes through 4 stages before it leaves the factory.',
  'manifesto.hand.1.role': 'The joiner',
  'manifesto.hand.1.act': 'Closes the frame.',
  'manifesto.hand.2.role': 'The cutter',
  'manifesto.hand.2.act': 'Lays the textile.',
  'manifesto.hand.3.role': 'The upholsterer',
  'manifesto.hand.3.act': 'Pulls it over the foam.',
  'manifesto.hand.4.role': 'The check',
  'manifesto.hand.4.act': 'Checks the seam before wrapping.',
  'manifesto.link': 'Discover the collection',

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
  'craft.title': 'Four steps. No shortcuts.',
  'craft.lede':
    'A VALLO piece does not start with the upholstery. It starts with what you never see.',
  'craft.body':
    'From the frame inside to the last detail of the finish, every stage is part of one process, built for comfort, strength and a result you feel every day.',
  'craft.1.title': 'The structure',
  'craft.1.tag': 'Everything starts on the inside.',
  'craft.1.body':
    'A well-built structure is the foundation of a piece that lasts. Selected materials and precisely made joints give it stability for the long run.',
  'craft.2.title': 'The comfort',
  'craft.2.tag': 'You do not see comfort. You feel it.',
  'craft.2.body':
    'We choose every layer for how we want the piece to sit. Quality foam, springs and, where the design calls for it, memory foam — each one at work from the moment you sit down.',
  'craft.3.title': 'The upholstery',
  'craft.3.tag': 'The last layer. The first impression.',
  'craft.3.body':
    'The fabric gives a piece its character. We select materials for their texture, their look and their feel under the hand, so every collection can be fitted to your room and your taste.',
  'craft.4.title': 'The finish',
  'craft.4.tag': 'The details make the difference.',
  'craft.4.body':
    'The last seams, the proportions, the lines and the finish are checked with the same attention the build began with. Because a well-made piece should not only look right. It should feel right.',
  'craft.close': 'Design draws the eye. Execution gives it its value.',

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
  'contact.error': 'The request could not be sent. Call us on +40 733 358 066.',
  'contact.required': 'Required field',
  'contact.invalidEmail': 'Invalid email address',
  'contact.optional': 'optional',

  'piece.eyebrow': 'Piece',
  'piece.dimensions': 'Dimensions',
  'piece.dimensionsNote': 'width × depth × height, mm',
  'piece.description': 'Description',
  'piece.spec': 'Specification',
  'piece.collection': 'Collection',
  'piece.collectionOf': 'Collection',
  'piece.price': 'Price',
  'piece.category': 'Category',
  'piece.code': 'Code',
  'piece.warranty': 'Warranty',
  'piece.warrantyValue': '24 months',
  'piece.origin': 'Made in',
  'piece.originValue': 'Vadu Săpat, Prahova',
  'piece.related': 'From the same collection',
  'piece.relatedCategory': 'From the same category',
  'piece.priceNote': 'List price, standard textile. VAT included.',
  'piece.priceNoteOption':
    'List price for the option selected, standard textile. VAT included.',
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
  'piece.mattress': 'Mattress',
  'piece.mattressOptions': 'options',
  'piece.mattressNote':
    'The same piece, with the mattress you choose. The price moves with it.',
  'piece.seatType': 'Seat',
  'piece.seatNote':
    'The same piece, with the seat you prefer: spring mesh or Memory Foam. We confirm the price of each in the quote.',
  'contact.optionPrefill': 'I am interested in this option: {option}.',
  'piece.build': 'Construction and features',
  'piece.buildNote': 'From the workshop’s technical sheet. Any custom configuration is confirmed in the individual quote.',
  'piece.planApprox': 'Workshop sketch, for orientation. The confirmed figures are those in the specification.',
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

  'collection.pull.aldo': 'Comfort you feel. Design that stays.',
  'collection.body.aldo':
    'ALDO is a collection built around generous comfort and a presence that is hard to ignore. Bouclé upholstery, a layer of memory foam and a structure of solid beech, fir and eucalyptus ply give it a deep, settled comfort, carried by a build made to last.\n\nSofa, corner, module — every piece folds out or reconfigures for the way you choose to live in the space.\n\nALDO. A collection where comfort becomes part of the design.',
  'collection.pull.cubic': 'Minimal in form. Generous in comfort.',
  'collection.body.cubic':
    'CUBIC stands out for its minimal design, its unusual proportions and a seat surprisingly wide and soft. High-grade foam gives it a comfort of its own, turning the collection’s plain lines into something you feel the moment you sit down.\n\nClean lines. Uncommon dimensions. Comfort without compromise.',
  'collection.pull.soria': 'Comfort built into the details.',
  'collection.body.soria':
    'SORIA joins an elegant design to a build made for comfort that lasts. The sinuous-spring seat, carried by a frame of solid beech and fir, supports you and lets you settle.\n\nThe quilted detailing on the seat and the wave-cut arms give the collection a character of its own, while the sleeping extension and the storage box do the quiet work.\n\nElegance in the form. Comfort in every detail.',
  'collection.pull.torro': 'Comfort that adapts. Design that stays.',
  'collection.body.torro':
    'TORRO joins contemporary lines with carefully built comfort. The sinuous-spring seat gives support that lasts, and the adjustable headrests let you set the position that suits you. A sleeping extension completes the collection, giving every evening more room to stretch out.\n\nPrecise support. Comfort you set yourself.',

  'category.lede.seating':
    'Upholstered chairs and stools — the small pieces that tie the room together.',


  'footer.tagline': 'Upholstered furniture, distributed from Prahova across Romania.',
  'footer.rights': 'All rights reserved.',
  'footer.parent': 'A company of',
  'horeca.open': 'Browse the catalogue',
  'horeca.download': 'Download PDF',
  'horeca.loading': 'Loading the catalogue…',
  'horeca.failed': 'The catalogue could not be opened. Try downloading it instead.',
  'horeca.close': 'Close',
  'horeca.fullscreen': 'Fullscreen',
  'horeca.prev': 'Previous page',
  'horeca.next': 'Next page',
  'horeca.zoomIn': 'Zoom in',
  'horeca.zoomOut': 'Zoom out',
  'footer.newsletter': 'New pieces, once a month',
  'footer.subscribe': 'Subscribe',
  'footer.emailPlaceholder': 'Email address',

  'notFound.title': 'Page not found',
  'notFound.body': 'The link is wrong, or the piece has left the catalogue.',
  'notFound.link': 'Back to collections',
}

const dict: Record<Lang, Record<string, string>> = { ro, en }

export type Key = keyof typeof ro

/** A string outside React — for page titles and descriptions, which are built before anything renders. */
export const translate = (key: Key, lang: Lang = 'ro') => dict[lang][key] ?? dict.ro[key] ?? key

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
