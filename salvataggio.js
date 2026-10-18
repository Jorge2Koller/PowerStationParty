// ============================================================
//  SALVATAGGIO
//  Tutto quello che il gioco ricorda tra una sera e l'altra, in un posto solo:
//  impostazioni, ultimi personaggi, registro dei punteggi, e (fasi successive) statistiche,
//  record, trofei, sblocchi, Pinte.
//
//  - Sta nel localStorage del browser, con un numero di VERSIONE: se in futuro la forma dei
//    dati cambia, MIGRAZIONI porta i salvataggi vecchi a quella nuova (niente si perde).
//  - Ogni lettura e scrittura è protetta: in navigazione privata o col salvataggio bloccato
//    il gioco funziona lo stesso, solo non ricorda niente (Salvataggio.disponibile = false).
//  - esporta() / importa(): il salvataggio come codice di testo, da mandarsi su WhatsApp e
//    incollare su un altro telefono. azzera(): si ricomincia da capo.
// ============================================================

const CHIAVE = 'powerstation-party.salvataggio';
const VECCHIA = 'powerstation-party.giocatori';   // dove si ricordavano i personaggi prima del salvataggio
export const VERSIONE = 2;
const PREFISSO = 'PSP';                            // i codici esportati cominciano così: PSP1-...
const MAX_REGISTRO = 60;                           // punteggi tenuti per ogni microgioco (gli ultimi)

// le impostazioni di partenza (le stesse che il gioco aveva prima della schermata Impostazioni)
export const IMPOSTAZIONI = {
  audio: true,              // audio sì/no (M, o il pulsante sul telefono)
  volumeMusica: 0.8,        // 0..1
  volumeEffetti: 0.8,       // 0..1
  vibrazione: true,         // colpi ed errori fanno vibrare il telefono (dove si può: Android)
  difficolta: 'normale',    // 'facile' | 'normale' | 'difficile': il livello di partenza (Fase 5)
  provaLampo: true,         // prima dei microgiochi mai giocati il cursore dell'Intro parte su PROVA
  velocitaTesti: 'normale', // 'lenta' | 'normale' | 'veloce': quanto restano a schermo scritte e fumetti
  tremolio: true,           // lo schermo che trema sui colpi
  ritardoAudio: 0,          // ms: quanto arriva in ritardo il suono (cuffie e casse Bluetooth); misurato nelle Impostazioni
};

const nuovo = () => ({
  versione: VERSIONE,
  impostazioni: { ...IMPOSTAZIONI },
  giocatori: null,          // i personaggi dell'ultima partita (id), per ritrovarli già scelti
  registro: {},             // registro[idMicrogioco] = [[punteggio, giorno, livello], ...] (gli ultimi MAX_REGISTRO)
  statistiche: {},          // per personaggio (Fase 4)
  record: {},               // migliori punteggi per microgioco (Fase 4)
  trofei: {},               // trofei sbloccati (Fase 4)
  sblocchi: {},             // costumi, modalità, frasi, temi comprati al Bancone (Fase 4)
  pinte: 0,                 // la valuta del gioco (Fase 4)
  visti: {},                // microgiochi già incontrati (per la prova lampo, Fase 3)
  novita: '',               // l'ultima versione di cui si è vista la schermata "Novità" (Fase 3)
});

// Da una versione dei dati alla successiva: MIGRAZIONI[n](dati) porta dalla n alla n+1.
const MIGRAZIONI = {
  // 1 -> 2 (revisione 4): i punti di tutti i microgiochi sono passati alla stessa scala (bronzo
  // circa 100, argento 200, oro 300), quindi i punteggi di prima non si confrontano più coi nuovi.
  // I record e i "migliore" si azzerano (lo dice la schermata Novità); trofei, medaglie, Pinte e
  // il resto delle statistiche restano. Il registro dei punteggi non si butta: passa in
  // registroScala1 (scala vecchia), e il registro nuovo riparte vuoto.
  1: (d) => {
    if (d.record && Object.keys(d.record).length) d.recordScala1 = d.record;
    d.record = {};
    if (d.registro && Object.keys(d.registro).length) d.registroScala1 = d.registro;
    d.registro = {};
    for (const g of Object.values(d.statistiche?.giochi ?? {})) if (g && typeof g === 'object') g.migliore = null;
    // Lampo e Da solo ora sono gratis: chi le aveva comprate (30 Pinte l'una) riprende le Pinte
    const prese = Array.isArray(d.sblocchi?.modalita) ? d.sblocchi.modalita.filter((m) => m === 'lampo' || m === 'solitario').length : 0;
    if (prese) d.pinte = (Number(d.pinte) || 0) + prese * 30;
  },
};

// completa i dati con quello che manca (un salvataggio vecchio o un codice incompleto non rompe niente)
function completa(d) {
  const base = nuovo();
  const out = { ...base, ...(d && typeof d === 'object' ? d : {}) };
  out.impostazioni = { ...IMPOSTAZIONI, ...(d?.impostazioni ?? {}) };
  for (const k of ['registro', 'statistiche', 'record', 'trofei', 'sblocchi', 'visti']) if (!out[k] || typeof out[k] !== 'object') out[k] = {};
  if (typeof out.pinte !== 'number' || !isFinite(out.pinte)) out.pinte = 0;
  if (out.giocatori && !Array.isArray(out.giocatori)) out.giocatori = null;
  return out;
}

function migra(d) {
  let v = Number(d?.versione) || 1;
  if (v > VERSIONE) throw new Error('salvataggio di una versione più nuova del gioco');
  while (v < VERSIONE) { MIGRAZIONI[v]?.(d); v++; }
  d.versione = VERSIONE;
  return completa(d);
}

// --- testo <-> codice (base64 dell'UTF-8, così passano anche accenti ed emoji) ---
const aBase64 = (s) => btoa(String.fromCharCode(...new TextEncoder().encode(s)));
const daBase64 = (b) => new TextDecoder().decode(Uint8Array.from(atob(b), (ch) => ch.charCodeAt(0)));
// un controllo semplice: se il codice viene tagliato o storpiato copiandolo, ce ne si accorge
const controllo = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return (h >>> 0).toString(36).slice(0, 5); };

let dati = nuovo();
let disponibile = false;
let timer = null;

function scrivi() {
  timer = null;
  if (!disponibile) return;
  try { localStorage.setItem(CHIAVE, JSON.stringify(dati)); } catch (e) { /* pieno o bloccato: si va avanti senza */ }
}

export const Salvataggio = {
  get dati() { return dati; },
  get disponibile() { return disponibile; },
  get impostazioni() { return dati.impostazioni; },

  // all'avvio: legge (o crea) il salvataggio
  carica() {
    try {
      const prova = '__psp_prova__';
      localStorage.setItem(prova, '1'); localStorage.removeItem(prova);
      disponibile = true;
    } catch (e) { disponibile = false; }
    if (!disponibile) { dati = nuovo(); return dati; }
    try {
      const testo = localStorage.getItem(CHIAVE);
      if (testo) dati = migra(JSON.parse(testo));
      else {
        // prima volta col salvataggio: si recuperano i personaggi ricordati dalla versione di prima
        dati = nuovo();
        try { const ids = JSON.parse(localStorage.getItem(VECCHIA)); if (Array.isArray(ids)) dati.giocatori = ids; } catch (e) { /* niente */ }
        scrivi();
      }
    } catch (e) {
      // salvataggio illeggibile: se ne tiene una copia (non si sa mai) e si riparte puliti
      try { localStorage.setItem(CHIAVE + '.rovinato', localStorage.getItem(CHIAVE) ?? ''); } catch (e2) { /* niente */ }
      dati = nuovo();
    }
    return dati;
  },

  // da chiamare dopo ogni modifica a "dati": scrive poco dopo (più modifiche di fila = una scrittura)
  segna() {
    if (!timer) timer = setTimeout(scrivi, 250);
  },
  // scrive subito (per esempio quando l'app va in sottofondo)
  subito() {
    if (timer) clearTimeout(timer);
    scrivi();
  },

  // cambia un'impostazione; chi deve reagire (audio...) ascolta l'evento "impostazioni-cambiate"
  imposta(chiave, valore) {
    if (!(chiave in IMPOSTAZIONI)) return;
    dati.impostazioni[chiave] = valore;
    this.segna();
    window.dispatchEvent(new CustomEvent('impostazioni-cambiate', { detail: { chiave, valore } }));
  },

  // un punteggio fatto: finisce nel registro del microgioco (serve a ritarare le medaglie)
  registra(id, punteggio, livello = dati.impostazioni.difficolta) {
    if (!id || typeof punteggio !== 'number') return;
    const r = dati.registro[id] ?? (dati.registro[id] = []);
    r.push([punteggio, Math.floor(Date.now() / 86400000), livello]);
    if (r.length > MAX_REGISTRO) r.splice(0, r.length - MAX_REGISTRO);
    this.segna();
  },

  // il salvataggio come codice di testo: PSP1-<dati>-<controllo>
  esporta() {
    const corpo = aBase64(JSON.stringify(dati));
    return `${PREFISSO}${VERSIONE}-${corpo}-${controllo(corpo)}`;
  },

  // da un codice: { ok: true } oppure { ok: false, errore: 'spiegazione' }. Se va bene sostituisce tutto.
  importa(codice) {
    const pulito = String(codice ?? '').replace(/\s+/g, '');
    const m = /^PSP(\d+)-([A-Za-z0-9+/=]+)-([a-z0-9]+)$/.exec(pulito);
    if (!m) return { ok: false, errore: 'Questo non sembra un codice di PowerStation Party.' };
    if (controllo(m[2]) !== m[3]) return { ok: false, errore: 'Il codice è incompleto o è stato modificato: ricopialo tutto.' };
    let nuovi;
    try { nuovi = migra(JSON.parse(daBase64(m[2]))); } catch (e) { return { ok: false, errore: 'Il codice non si legge: ' + e.message }; }
    dati = nuovi;
    this.subito();
    window.dispatchEvent(new CustomEvent('impostazioni-cambiate', { detail: { tutte: true } }));
    return { ok: true };
  },

  // Salvataggi più sicuri: al primo avvio si chiede al browser di non cancellare i dati del gioco
  // (Safari li può togliere ai siti aperti di rado, e con loro Pinte e trofei). Una volta sola:
  // Firefox lo chiede a chi gioca, e non deve chiederlo a ogni avvio.
  chiediPersistenza() {
    if (!disponibile || dati.persistenzaChiesta || !navigator.storage?.persist) return;
    dati.persistenzaChiesta = true;
    this.segna();
    navigator.storage.persisted().then((gia) => gia || navigator.storage.persist()).catch(() => {});
  },

  // si ricomincia da capo: impostazioni, personaggi, registro, progressi
  azzera() {
    dati = nuovo();
    this.subito();
    window.dispatchEvent(new CustomEvent('impostazioni-cambiate', { detail: { tutte: true } }));
  },
};

Salvataggio.carica();
Salvataggio.chiediPersistenza();
// app in sottofondo o chiusa: si scrive subito quello che è in sospeso
document.addEventListener('visibilitychange', () => { if (document.hidden) Salvataggio.subito(); });
window.addEventListener('pagehide', () => Salvataggio.subito());
