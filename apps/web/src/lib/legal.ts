/**
 * The two legal pages, in Romanian only: they bind the Romanian company and
 * Romanian law, so the English reading aid shows them as written.
 *
 * `{key}` stands for a fact from ~/lib/company and is filled in by the page;
 * a fact still missing there shows as "[de completat: …]". `[text](url)` is a
 * link. This is a working draft built on the usual Romanian practice — it must
 * be read by the client's lawyer or GDPR consultant before release.
 */

export type LegalSection = { heading: string; body: string[] }
export type LegalDoc = { path: string; title: string; lede: string; sections: LegalSection[] }

export const privacy: LegalDoc = {
  path: '/confidentialitate',
  title: 'Politica de confidențialitate',
  lede: 'Ce date personale primim prin acest site, de ce, cât timp le păstrăm și ce drepturi aveți asupra lor.',
  sections: [
    {
      heading: 'Cine prelucrează datele',
      body: [
        'Operatorul datelor este {legalName}, cu sediul în {seat}, CUI {cui}, înregistrată la Registrul Comerțului sub nr. {regCom}, care comercializează mobilierul VALLO.',
        'Pentru orice întrebare sau cerere privind datele dumneavoastră ne puteți scrie la {privacyEmail}.',
      ],
    },
    {
      heading: 'Ce date primim',
      body: [
        'Prin formularul de cerere de ofertă și prin formularul HoReCa: numele, adresa de email și/sau numărul de telefon, produsul care vă interesează și mesajul pe care ni-l scrieți. Nu cerem și nu vă rugăm să ne trimiteți alte date.',
        'Date tehnice: la fiecare vizită, furnizorul de găzduire înregistrează automat adresa IP, tipul browserului și paginile accesate, pentru funcționarea și securitatea site-ului. Verificarea anti-spam a formularelor (Cloudflare Turnstile) folosește aceleași date tehnice pentru a deosebi o persoană de un program automat.',
      ],
    },
    {
      heading: 'De ce le folosim și pe ce temei',
      body: [
        'Pentru a răspunde cererii dumneavoastră și a vă face o ofertă — demersuri făcute la cererea dumneavoastră înainte de încheierea unui contract (art. 6 alin. (1) lit. b) din Regulamentul (UE) 2016/679, GDPR).',
        'Pentru a executa comanda, dacă o plasați, și pentru facturare și evidența contabilă — executarea contractului și obligații legale (art. 6 alin. (1) lit. b) și c) GDPR).',
        'Pentru securitatea site-ului și prevenirea abuzurilor — interesul nostru legitim (art. 6 alin. (1) lit. f) GDPR).',
        'Nu folosim datele trimise prin formular pentru marketing și nu vă înscriem în liste de email fără acordul dumneavoastră separat.',
      ],
    },
    {
      heading: 'Cui le transmitem',
      body: [
        'Datele sunt văzute doar de echipa VALLO care răspunde cererilor și, dacă plasați o comandă, de firma care face livrarea, strict pentru adresa și telefonul de livrare.',
        'Folosim furnizori care prelucrează datele în numele nostru: Cloudflare (găzduirea site-ului și protecția anti-spam) și Resend (transmiterea cererilor pe email). Acești furnizori pot prelucra date în afara Spațiului Economic European, pe baza clauzelor contractuale standard aprobate de Comisia Europeană sau a Cadrului UE–SUA privind protecția datelor.',
        'Nu vindem și nu închiriem datele dumneavoastră.',
      ],
    },
    {
      heading: 'Cât timp le păstrăm',
      body: [
        'O cerere care nu s-a transformat în comandă se păstrează {retention}, apoi se șterge.',
        'Datele dintr-o comandă și documentele de facturare se păstrează pe durata prevăzută de legislația financiar-contabilă.',
      ],
    },
    {
      heading: 'Drepturile dumneavoastră',
      body: [
        'Aveți dreptul de acces la date, de rectificare, de ștergere, de restricționare a prelucrării, de portabilitate și de opoziție. Pentru oricare dintre ele, scrieți-ne la {privacyEmail}; vă răspundem în cel mult o lună.',
        'Dacă considerați că datele nu sunt prelucrate corect, puteți depune o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP), B-dul G-ral. Gheorghe Magheru nr. 28–30, Sector 1, București, [www.dataprotection.ro](https://www.dataprotection.ro).',
      ],
    },
    {
      heading: 'Cookie-uri și stocare locală',
      body: [
        'Site-ul nu folosește cookie-uri de marketing sau de urmărire și nu afișează reclame.',
        'Browserul dumneavoastră păstrează local o singură preferință: limba aleasă (română sau engleză). Ea nu ne este transmisă și o puteți șterge oricând din setările browserului.',
        'Statisticile de vizitare, dacă sunt activate, sunt anonime și nu folosesc cookie-uri (Cloudflare Web Analytics).',
      ],
    },
    {
      heading: 'Modificări',
      body: ['Când această politică se schimbă, publicăm aici versiunea nouă, cu data actualizării.'],
    },
  ],
}

export const termsDoc: LegalDoc = {
  path: '/termeni',
  title: 'Termeni și condiții',
  lede: 'Cum se face o comandă VALLO, cum se plătește și se livrează, și ce garanții aveți.',
  sections: [
    {
      heading: 'Vânzătorul',
      body: [
        'Mobilierul VALLO este comercializat de {legalName}, cu sediul în {seat}, CUI {cui}, nr. Registrul Comerțului {regCom}. Contact: {email}, telefon {phone}.',
      ],
    },
    {
      heading: 'Produse și prețuri',
      body: [
        'Mobilierul este produs la comandă, în fabrica din Vadu Săpat, Prahova, în textilul și configurația alese de dumneavoastră. Fotografiile sunt orientative: culoarea textilului poate diferi ușor de cea de pe ecran.',
        'Prețurile afișate sunt în lei și includ TVA. Un preț marcat „de la” este pentru configurația de bază; prețul final depinde de textil, dimensiuni și opțiuni. Prețul care vă angajează este cel din oferta confirmată.',
      ],
    },
    {
      heading: 'Comanda',
      body: [
        'Site-ul nu preia comenzi online. Trimiteți o cerere de ofertă prin formular, telefonic sau într-un showroom; vă contactăm cu oferta, iar comanda devine fermă după ce o confirmați și achitați avansul stabilit în ofertă. Comenzile realizate la comandă nu mai pot fi anulate după intrarea în producție.',
      ],
    },
    {
      heading: 'Plata',
      body: ['Se poate plăti prin: {payment}. {advance}'],
    },
    {
      heading: 'Producția și livrarea',
      body: [
        'Termenul de livrare este, în general, de {leadTime}. Vă anunțăm data livrării înainte de expediere.',
        'Livrarea: {delivery}.',
        'La primire, verificați produsul în prezența livratorului și notați pe documentul de livrare orice deteriorare vizibilă.',
      ],
    },
    {
      heading: 'Dreptul de retragere',
      body: [
        'Pentru contractele încheiate la distanță (telefon, email), consumatorul are, în general, dreptul de a se retrage în 14 zile de la primirea produsului, conform OUG nr. 34/2014.',
        'Excepție: mobilierul confecționat după specificațiile dumneavoastră — textil, dimensiuni sau configurație alese la comandă — nu poate fi returnat pe acest temei (art. 16 lit. c) din OUG nr. 34/2014). Produsele din stoc, livrate în configurația standard, pot fi returnate în 14 zile calendaristice, în starea în care au fost primite; transportul de retur este suportat de client, iar banii se restituie în cel mult 14 zile.',
      ],
    },
    {
      heading: 'Garanția',
      body: [
        'Pentru produsele cumpărate de consumatori se aplică garanția legală de conformitate, conform OUG nr. 140/2021.',
        'Canapelele, colțarele, fotoliile și paturile au o garanție de {warranty} de la livrare. Garanția nu acoperă uzura normală, deteriorările cauzate de folosirea necorespunzătoare, de expunerea la umezeală sau la soare direct, ori de intervenții făcute de alte persoane.',
      ],
    },
    {
      heading: 'Reclamații',
      body: [
        'Ne puteți scrie la {email} sau suna la {phone}, cu numărul comenzii și fotografii ale problemei. Vă răspundem în cel mult 15 zile.',
      ],
    },
    {
      heading: 'Soluționarea litigiilor',
      body: [
        'Ne dorim să rezolvăm orice neînțelegere direct cu dumneavoastră. Dacă nu reușim, vă puteți adresa Autorității Naționale pentru Protecția Consumatorilor ([anpc.ro](https://anpc.ro)) sau puteți apela la soluționarea alternativă a litigiilor ([SAL](https://anpc.ro/ce-este-sal/)).',
        'Acești termeni sunt guvernați de legea română.',
      ],
    },
  ],
}

export const legalDocs = [privacy, termsDoc]
