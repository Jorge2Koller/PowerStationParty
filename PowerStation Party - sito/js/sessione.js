// Stato della partita in corso, per un numero qualunque di giocatori (da 1 a CONFIG.maxGiocatori).
//
// Sfida: ogni round tutti giocano lo stesso microgioco, uno dopo l'altro; chi comincia ruota a
// ogni round. Allenamento: un solo giocatore, un solo microgioco.
// Tipi di sfida: completa (tutti i microgiochi), rapida (alcuni, pescati a caso), al meglio di
// 3 o 5 (microgiochi a caso: vince chi per primo ne vince 2 o 3), singola (un microgioco scelto).
//
// Come si decide chi vince:
//  - in DUE resta com'era: nella sfida completa contano i punti fatti nei microgiochi (a parità
//    i round vinti), in quella al meglio di contano i round vinti (a parità i punti);
//  - da TRE in su si danno punti classifica a ogni round secondo la posizione (CONFIG.puntiPosizione:
//    a pari punteggio, pari posizione). A parità di punti classifica, chi ha vinto più round; se
//    ancora pari, chi ha fatto più punti in tutto nei microgiochi.
import { CONFIG } from './config.js';
import { Salvataggio } from './salvataggio.js';
import { normalizza } from './punteggi.js';
import { LIVELLI } from './livelli.js';
import { casuale } from './grafica/base.js';
import { chiaveGiorno } from './progressi.js';
import { nuovoTabellone, prossimaPartita, campione, vittorie } from './torneo.js';

export const DOPPIONE = 'Bis';                   // suffisso degli sprite del "doppione" (vedi inScena)
const mescola = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const giocabile = (id) => CONFIG.personaggiGiocabili.find((p) => p.id === id);

export const Sessione = {
  giocatori: [],     // chi gioca, nell'ordine in cui si sono scelti: voci di CONFIG.personaggiGiocabili, più "i" (il loro numero)
  modo: 'sfida',     // 'sfida' | 'allenamento'
  tipo: 'completa',  // 'completa' | 'rapida' | 'meglioDi' | 'singola' | 'allenamento'
  lista: [],         // id dei microgiochi da giocare
  indice: 0,         // round corrente
  passo: 0,          // a che turno siamo nel round: 0 = gioca il primo, 1 = il secondo...
  solo: null,        // in allenamento: numero del giocatore
  risultati: [],     // risultati[round][giocatore] = { punteggio, vittoria, riepilogo }
  meglioDi: 0,       // 0 = si gioca tutta la lista; 3 o 5 = vince chi per primo vince 2 o 3 round
  ultima: null,      // com'era fatta l'ultima partita avviata (per la rivincita)

  // ---------- chi gioca ----------
  // ids: i personaggi scelti, uno per giocatore (quelli che non esistono più si saltano)
  imposta(ids) {
    const scelti = [...new Set(ids)].map(giocabile).filter(Boolean).slice(0, CONFIG.maxGiocatori);
    this.giocatori = (scelti.length ? scelti : CONFIG.personaggiGiocabili.slice(0, 2)).map((p, i) => ({ ...p, i }));
  },
  get n() { return this.giocatori.length; },
  // l'ultima scelta si ricorda (nel salvataggio, se il browser lo permette), così la volta dopo basta confermare
  salva() { Salvataggio.dati.giocatori = this.giocatori.map((g) => g.id); Salvataggio.segna(); },
  ricordati() {
    const ids = Salvataggio.dati.giocatori;
    return Array.isArray(ids) && ids.some(giocabile) ? ids.filter(giocabile) : null;
  },

  // ---------- nuove partite ----------
  avvia(modo, tipo, lista, solo = null, meglioDi = 0) {
    // un seme per round: nella sfida tutti trovano lo stesso mazzo (blackjack)
    const semi = lista.map(() => (Math.random() * 2 ** 32) >>> 0);
    Object.assign(this, { modo, tipo, lista: [...lista], indice: 0, passo: 0, solo, meglioDi, risultati: lista.map(() => []), semi, registrata: false,
      partecipanti: [],   // chi gioca ogni round, se non sono tutti (il torneo)
      // da solo: vite, microgiochi superati, com'è andata col boss
      solitario: tipo === 'solitario' ? { vite: CONFIG.modalita.solitario.vite, superati: 0, boss: null, contati: {} } : null });
    this.ultima = { tipo, lista: [...lista], solo, meglioDi };
  },
  nuovaSfida(lista = CONFIG.ordineSfida) { this.avvia('sfida', lista.length === 1 ? 'singola' : 'completa', lista); },
  // alcuni microgiochi pescati a caso
  nuovaSfidaRapida(quanti) { this.avvia('sfida', 'rapida', mescola([...CONFIG.ordineSfida]).slice(0, quanti)); },
  // tutti i microgiochi in ordine casuale: si smette appena qualcuno ha vinto i round che servono
  nuovaSfidaVeloce(meglioDi) { this.avvia('sfida', 'meglioDi', mescola([...CONFIG.ordineSfida]), null, meglioDi); },
  nuovoAllenamento(id, giocatore = 0) { this.avvia('allenamento', 'allenamento', [id], Math.min(giocatore, this.n - 1)); },
  // Lampo: microgiochi corti, pescati a caso
  // Squadre: ROSSI (1°, 3°, 5°...) contro BLU (2°, 4°...), microgiochi a caso
  nuoveSquadre() { this.avvia('sfida', 'squadre', mescola([...CONFIG.ordineSfida]).slice(0, CONFIG.modalita.squadre.microgiochi)); },
  // Torneo: tabellone a eliminazione (js/torneo.js); ogni partita è un round a due, si aggiunge alla lista man mano
  nuovoTorneo() {
    this.avvia('sfida', 'torneo', []);
    this.torneo = nuovoTabellone(this.giocatori.map((g) => g.i));
    this.scorta = [];
    this.preparaPartita();
  },
  // mette in lista la prossima partita del tabellone (un microgioco a caso: lo stesso per tutti e due)
  preparaPartita() {
    const m = prossimaPartita(this.torneo);
    if (!m) return null;
    if (!this.scorta.length) this.scorta = mescola([...CONFIG.ordineSfida]);
    this.lista.push(this.scorta.pop());
    this.risultati.push([]);
    this.semi.push((Math.random() * 2 ** 32) >>> 0);
    this.indice = this.lista.length - 1;
    this.passo = 0;
    this.partecipanti[this.indice] = [m.a, m.b];
    m.round = this.indice;
    this.partita = m;
    return m;
  },
  // hanno giocato tutti e due: chi passa? (pari: niente, la partita si rigioca con un altro microgioco)
  chiudiPartita() {
    const m = this.partita;
    if (!m || m.round !== this.indice || !this.completo(this.indice)) return null;
    if (m.vincitore == null) {
      const r = this.risultati[m.round], pa = r[m.a].punteggio, pb = r[m.b].punteggio;
      if (pa === pb) return { ...m, pareggio: true };
      m.vincitore = pa > pb ? m.a : m.b;
    }
    return { ...m };
  },
  // Sfida del giorno: 5 microgiochi scelti dalla data, con gli stessi semi per tutti quel giorno
  nuovaSfidaDelGiorno(giocatore = 0) {
    const giorno = chiaveGiorno(new Date());
    let h = 7;
    for (const ch of giorno) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const rnd = casuale(h), tutti = [...CONFIG.ordineSfida];
    for (let i = tutti.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [tutti[i], tutti[j]] = [tutti[j], tutti[i]]; }
    this.avvia('giorno', 'giorno', tutti.slice(0, CONFIG.modalita.giorno.microgiochi), Math.min(giocatore, this.n - 1));
    this.semi = this.lista.map(() => Math.floor(rnd() * 2 ** 32));
    this.giorno = giorno;
  },
  nuovoLampo() { this.avvia('sfida', 'lampo', mescola([...CONFIG.ordineSfida]).slice(0, CONFIG.modalita.lampo.microgiochi)); },
  // Beer pong: la partita vera a tiri alternati. Non usa i microgiochi: lo stato della partita è
  // in js/beerpong/partita.js, le schermate in js/scenes/beerpong.js
  nuovoBeerPong() { this.avvia('beerpong', 'beerpong', []); },
  // Da solo: microgiochi a caso, l'ultimo è il boss
  nuovoSolitario(giocatore = 0) { this.avvia('solitario', 'solitario', mescola([...CONFIG.ordineSfida]).slice(0, CONFIG.modalita.solitario.microgiochi + 1), Math.min(giocatore, this.n - 1)); },
  // stessi giocatori e stessa modalità (i microgiochi a caso si ripescano)
  rivincita() {
    const u = this.ultima;
    if (!u) return this.nuovaSfida();
    if (u.tipo === 'rapida') this.nuovaSfidaRapida(u.lista.length);
    else if (u.tipo === 'lampo') this.nuovoLampo();
    else if (u.tipo === 'beerpong') this.nuovoBeerPong();
    else if (u.tipo === 'squadre') this.nuoveSquadre();
    else if (u.tipo === 'torneo') this.nuovoTorneo();
    else if (u.tipo === 'giorno') this.nuovaSfidaDelGiorno(u.solo);
    else if (u.tipo === 'solitario') this.nuovoSolitario(u.solo);
    else if (u.tipo === 'meglioDi') this.nuovaSfidaVeloce(u.meglioDi);
    else if (u.tipo === 'allenamento') this.nuovoAllenamento(u.lista[0], u.solo);
    else this.nuovaSfida(u.tipo === 'singola' ? u.lista : undefined);
  },

  // ---------- il turno ----------
  get idCorrente() { return this.lista[this.indice]; },
  // (durante la prova: un seme suo, così la prova non è la stessa partita di quella vera)
  get seme() { return this.semeProva ?? this.semi?.[this.indice] ?? (Math.random() * 2 ** 32) >>> 0; },
  // Per i microgiochi con più canzoni (X-Factor, l'elenco "canzoni" della sua configurazione): quale
  // suona in questo turno (il numero nell'elenco). Nella sfida la decide il seme del round, quello vero
  // e non quello della prova (tutti i giocatori, e la prova, la stessa canzone; la Sfida del giorno ha i
  // semi del giorno, quindi la stessa canzone per tutti); in allenamento quella scelta nell'introduzione
  // (scegliCanzone, che vale finché la pagina resta aperta), se no anche lì il seme, cioè una a caso
  canzone(id) {
    const n = CONFIG.microgiochi[id]?.canzoni?.length ?? 0;
    if (n < 2) return 0;
    const scelta = this.modo === 'allenamento' ? this.scelteCanzoni?.[id] : null;
    if (scelta != null && scelta < n) return scelta;
    return (this.semi?.[this.indice] ?? 0) % n;
  },
  scegliCanzone(id, i) { this.scelteCanzoni = { ...this.scelteCanzoni, [id]: i }; },
  // chi gioca adesso (numero del giocatore): a ogni round comincia quello dopo
  get turno() {
    if (this.solo != null) return this.solo;
    if (this.tipo === 'torneo') return this.chiGioca(this.indice)[this.passo % 2].i;   // i due della partita
    return (this.indice + this.passo) % this.n;
  },
  get giocatore() { return this.giocatori[this.turno]; },
  get turni() { return this.modo === 'sfida' ? (this.tipo === 'torneo' ? 2 : this.n) : 1; },             // quanti turni ha un round
  get ultimoTurno() { return this.passo >= this.turni - 1; },
  // a chi tocca dopo, in questo round (null se era l'ultimo)
  get prossimo() {
    if (this.ultimoTurno) return null;
    if (this.tipo === 'torneo') return this.chiGioca(this.indice)[this.passo + 1];
    return this.giocatori[(this.indice + this.passo + 1) % this.n];
  },
  // il miglior punteggio fatto finora in questo round: { punteggio, giocatore }, o null se non ha ancora giocato nessuno
  get record() {
    if (this.modo !== 'sfida') return null;
    let meglio = null;
    this.risultati[this.indice].forEach((r, i) => { if (r && (!meglio || r.punteggio > meglio.punteggio)) meglio = { punteggio: r.punteggio, giocatore: this.giocatori[i] }; });
    return meglio;
  },
  // "Contro se stesso": chi gioca è anche l'ospite del microgioco, o uno dei personaggi della sua
  // storia ("cast" in config.js). Il microgioco va avanti uguale: l'ospite lo muove il computer.
  get controSeStesso() {
    const m = CONFIG.microgiochi[this.idCorrente], id = this.giocatore.id;
    return m.ospite?.id === id || !!m.cast?.includes(id);
  },
  // Il giocatore com'è dentro il microgioco: di solito è lui; se gioca contro se stesso è il
  // "doppione", cioè gli stessi sprite ma travestito (id + DOPPIONE, creati da sprites.js).
  get inScena() {
    const g = this.giocatore;
    return this.controSeStesso ? { ...g, id: g.id + DOPPIONE } : g;
  },

  registra(r) { this.risultati[this.indice][this.turno] = r; },
  // chi gioca il round i (di solito tutti; nel torneo i due della partita)
  chiGioca(i) { return this.partecipanti?.[i] ? this.partecipanti[i].map((k) => this.giocatori[k]) : this.giocatori; },

  // ---------- livelli (l'handicap) ----------
  // il livello di un personaggio: quello scelto per lui (si ricorda), se no quello delle Impostazioni
  livelloDi(id) {
    const I = Salvataggio.impostazioni, l = I.livelli?.[id] ?? I.difficolta;
    return LIVELLI.includes(l) ? l : 'normale';
  },
  scegliLivello(id, livello) {
    const I = Salvataggio.impostazioni;
    I.livelli = { ...(I.livelli ?? {}), [id]: livello };
    Salvataggio.segna();
  },
  get livello() {
    // la sfida del giorno è a NORMALE (si confronta coi giorni prima); il boss di Da solo a DIFFICILE
    if (this.tipo === 'giorno') return 'normale';
    if (this.solitario && this.indice === this.lista.length - 1) return 'difficile';
    return this.livelloDi(this.giocatore.id);
  },
  get boss() { return !!this.solitario && this.indice === this.lista.length - 1; },

  // ---------- classifiche ----------
  // hanno giocato tutti, in quel round?
  completo(i) { const r = this.risultati[i]; return !!r && this.chiGioca(i).every((g) => r[g.i]); },
  // round giocati da tutti
  get giocati() { return this.risultati.filter((_r, i) => this.completo(i)).length; },
  // round da vincere nella sfida al meglio di (di 3: 2; di 5: 3)
  get serve() { return Math.ceil(this.meglioDi / 2); },
  // i punti classifica per posizione: il primo, il secondo...
  get puntiPosizione() { const n = this.n; return CONFIG.puntiPosizione?.[n] ?? Array.from({ length: n }, (_v, k) => n - k); },
  // La classifica di un round, dal primo all'ultimo: [{ g, punteggio, pos, punti }]. A pari
  // punteggio, pari posizione (due primi, poi il terzo); punti = punti classifica guadagnati.
  classificaRound(i) {
    const tab = this.puntiPosizione;
    const righe = this.chiGioca(i).map((g) => ({ g, punteggio: this.risultati[i][g.i].punteggio })).sort((a, b) => b.punteggio - a.punteggio || a.g.i - b.g.i);
    righe.forEach((r, k) => { r.pos = k && r.punteggio === righe[k - 1].punteggio ? righe[k - 1].pos : k + 1; r.punti = tab[r.pos - 1] ?? 0; });
    return righe;
  },
  // chi ha vinto il round (numero del giocatore), -1 se in cima sono pari
  vincitoreRound(i) {
    const c = this.classificaRound(i);
    return c[1]?.pos === 1 ? -1 : c[0].g.i;
  },
  // dopo questo round la sfida è finita?
  get finita() {
    if (this.solitario) return this.solitario.vite <= 0 || this.indice >= this.lista.length - 1;
    if (this.tipo === 'torneo') return campione(this.torneo) != null;
    if (this.indice >= this.lista.length - 1) return true;
    return this.meglioDi > 0 && this.classifica().round.some((v) => v >= this.serve);
  },

  // La classifica generale, contando i primi "fino" round (di solito tutti quelli giocati).
  // Per ogni giocatore (in ordine di numero): round = round vinti, punti = punti fatti nei
  // microgiochi, NORMALIZZATI da 0 a 100 per microgioco (js/punteggi.js: se no i microgiochi che
  // danno tanti punti peserebbero di più), posizione = punti classifica. E poi: ordine = i numeri dei giocatori dal primo
  // all'ultimo, pos = la posizione di ciascuno (pari merito = stessa posizione), conta = il
  // numero che decide (quello da mostrare accanto al nome), vincitore = il primo, o -1 se pari.
  classifica(fino = this.risultati.length) {
    const n = this.n, round = Array(n).fill(0), punti = Array(n).fill(0), posizione = Array(n).fill(0);
    this.risultati.slice(0, fino).forEach((_r, i) => {
      if (!this.completo(i)) return;
      const c = this.classificaRound(i), primi = c.filter((x) => x.pos === 1);
      // un round lo vince chi arriva primo; pari in due: nessuno; pari in più giocatori: tutti i primi
      if (primi.length === 1 || n > 2) for (const x of primi) round[x.g.i]++;
      for (const x of c) { punti[x.g.i] += normalizza(this.lista[i], x.punteggio); posizione[x.g.i] += x.punti; }
    });
    // squadre: conta la media dei punti sfida di ogni squadra, round per round
    if (this.tipo === 'squadre') {
      const sq = { punti: [0, 0], round: [0, 0], ultimoRound: -1 };
      this.risultati.slice(0, fino).forEach((_r, i) => {
        if (!this.completo(i)) return;
        const medie = [0, 1].map((q) => { const m = this.giocatori.filter((g) => g.i % 2 === q); return m.reduce((t, g) => t + normalizza(this.lista[i], this.risultati[i][g.i].punteggio), 0) / m.length; });
        sq.punti[0] += medie[0]; sq.punti[1] += medie[1];
        sq.ultimoRound = medie[0] === medie[1] ? -1 : medie[0] > medie[1] ? 0 : 1;
        if (sq.ultimoRound >= 0) sq.round[sq.ultimoRound]++;
      });
      sq.punti = sq.punti.map((x) => Math.round(x));
      sq.vincitrice = sq.punti[0] === sq.punti[1] ? -1 : sq.punti[0] > sq.punti[1] ? 0 : 1;
      const per = this.giocatori.map((g) => sq.punti[g.i % 2]);
      const ord = [...Array(n).keys()].sort((a, b) => per[b] - per[a] || punti[b] - punti[a] || a - b), ps = Array(n);
      ord.forEach((g, k) => { ps[g] = k && per[ord[k - 1]] === per[g] ? ps[ord[k - 1]] : k + 1; });
      return { round: this.giocatori.map((g) => sq.round[g.i % 2]), punti: per, posizione: per, ordine: ord, pos: ps, conta: per, vincitore: -1, squadre: sq };
    }
    // torneo: prima il campione, poi chi è arrivato più avanti (conta = partite vinte)
    if (this.tipo === 'torneo') {
      const v = vittorie(this.torneo, n), re = campione(this.torneo);
      const cr = [this.giocatori.map((g) => (g.i === re ? 1 : 0)), v, punti], conf = (a, b) => { for (const k of cr) if (k[a] !== k[b]) return k[b] - k[a]; return 0; };
      const ord = [...Array(n).keys()].sort((a, b) => conf(a, b) || a - b), ps = Array(n);
      ord.forEach((g, k) => { ps[g] = k && conf(ord[k - 1], g) === 0 ? ps[ord[k - 1]] : k + 1; });
      return { round, punti, posizione, ordine: ord, pos: ps, conta: v, vincitore: re ?? -1 };
    }
    const criteri = n <= 2 ? (this.meglioDi ? [round, punti] : [punti, round])
      : (this.meglioDi ? [round, posizione, punti] : [posizione, round, punti]);
    const confronta = (a, b) => { for (const k of criteri) if (k[a] !== k[b]) return k[b] - k[a]; return 0; };
    const ordine = [...Array(n).keys()].sort((a, b) => confronta(a, b) || a - b);
    const pos = Array(n);
    ordine.forEach((g, k) => { pos[g] = k && confronta(ordine[k - 1], g) === 0 ? pos[ordine[k - 1]] : k + 1; });
    return { round, punti, posizione, ordine, pos, conta: criteri[0], vincitore: n > 1 && pos[ordine[1]] === 1 ? -1 : ordine[0] };
  },
};

// si parte con i personaggi dell'ultima volta (se il browser se li ricorda), se no coi primi due
Sessione.imposta(Sessione.ricordati() ?? []);
