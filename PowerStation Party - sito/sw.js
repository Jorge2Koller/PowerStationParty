// Service worker: dopo la prima visita il gioco si apre anche senza internet.
// "Prima la rete": se c'è connessione si scarica sempre la versione aggiornata (così una
// modifica si vede subito) e se ne tiene una copia; senza rete si usa la copia salvata.
// Funziona solo su https (GitHub Pages) o su localhost, non sull'indirizzo di casa 192.168...
const CACHE = 'powerstation-party-9';   // versione 9: X-Factor con Fuori Dagli Schemi, Stare Up e Stare Bene (prima: con Cambiare Aria e Non ti resisto)
// le canzoni di "Provini a X-Factor" (come "canzoni" in js/config/microgiochi/xfactor.js: per ognuna i
// due ritagli e la mappa delle note) e i riquadri della lista dei microgiochi: si scaricano subito,
// all'installazione (in tutto 3,3 MB), così il gioco installato li ha anche senza rete (le foto grandi
// delle anteprime si salvano la prima volta che si vedono). Qui vanno solo file che ci sono: se ne
// manca uno, non si salva niente
const CANZONI = ['fuori-dagli-schemi', 'stare-up', 'stare-bene'];
const MICROGIOCHI = ['spina', 'regrorio', 'barba', 'panino', 'mani', 'sego', 'ronda', 'blackjack', 'palleggi', 'passaseo', 'bota', 'guida',
  'piovra', 'scapoli', 'retromarcia', 'beerpong', 'xfactor', 'pizza', 'ballata', 'proverbi', 'scontrino'];
const SUBITO = [...CANZONI.flatMap((id) => [`audio/${id}.mp3`, `audio/${id}-lampo.mp3`, `js/config/microgiochi/xfactor-${id}.json`]),
  ...MICROGIOCHI.map((id) => `icone/anteprime/${id}.webp`)];
const FONT = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SUBITO)).catch(() => {}));
});
// le cache delle versioni vecchie si buttano (la pagina, appena aperta, rimanda i suoi file: vedi sotto)
self.addEventListener('activate', (e) => e.waitUntil(caches.keys()
  .then((nomi) => Promise.all(nomi.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
  .then(() => self.clients.claim())));

// la pagina, appena aperta, manda l'elenco dei file che ha già scaricato: si salvano subito
self.addEventListener('message', (e) => {
  const lista = e.data?.salva;
  if (!Array.isArray(lista)) return;
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(lista
    .filter((u) => u.startsWith(location.origin) || FONT.includes(new URL(u).hostname))
    .map((u) => c.add(u).catch(() => {})))));
});

// "no-cache": ogni file si ricontrolla col server (se non è cambiato risponde "uguale" e costa poco).
// Senza, il browser può tenere per qualche minuto i file vecchi (GitHub Pages li fa tenere 10 minuti)
// e dopo un aggiornamento mescolare file vecchi e nuovi. (Le richieste della pagina, mode "navigate",
// non si possono ricreare con delle opzioni: per quelle si usa l'indirizzo.)
const rete = (req) => (req.mode === 'navigate' ? fetch(req.url, { cache: 'no-cache' }) : fetch(req, { cache: 'no-cache' }));

self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || (url.origin !== location.origin && !FONT.includes(url.hostname))) return;
  e.respondWith(
    rete(req)
      .then((r) => {
        if (r.ok || r.type === 'opaque') {
          const copia = r.clone();
          caches.open(CACHE).then((c) => c.put(req, copia));
        }
        return r;
      })
      // senza rete: la copia salvata (anche con ?prova=... nell'indirizzo), o almeno la pagina
      .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('index.html', { ignoreSearch: true }))),
  );
});
