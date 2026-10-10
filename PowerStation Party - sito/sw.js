// Service worker: dopo la prima visita il gioco si apre anche senza internet.
// "Prima la rete": se c'è connessione si scarica sempre la versione aggiornata (così una
// modifica si vede subito) e se ne tiene una copia; senza rete si usa la copia salvata.
// Funziona solo su https (GitHub Pages) o su localhost, non sull'indirizzo di casa 192.168...
const CACHE = 'powerstation-party';   // versione 2: Il Passaggiorgio e Petri Tentacolari
const FONT = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

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
