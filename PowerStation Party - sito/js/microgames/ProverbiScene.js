// Microgioco 20: "Le Perle di Denny" - correggi i proverbi sbagliati di Denny, scrivendo. CORREGGI!
//
//  Al Pallaio Denny (Pastaffi, il figlio di Emilio) fa il grande saggio: dito alzato, mano sul
//  petto, sopracciglio inarcato e occhi socchiusi... e sbaglia i proverbi con totale convinzione.
//  Ogni proverbio arriva intero nel fumetto, con una sola parola sbagliata: chi gioca scrive quella
//  giusta e preme INVIO.
//  - Giusta: nel fumetto la parola sbagliata si cancella con una riga rossa e sopra arriva quella
//    giusta; Denny si offende e ribatte. Subito il proverbio dopo.
//  - Sbagliata: la casella trema, Denny gongola e si riprova sullo stesso proverbio.
//  - Tempo del proverbio finito: Denny la proclama VERITÀ DEFINITIVA, il proverbio si mostra giusto
//    per un attimo e si passa al dopo, senza punti.
//  Tre atti: LE PERLE DI DENNY (la parola sbagliata è sottolineata, tempo largo); TROVALA TU! (non
//  più sottolineata); DENNY SI SCATENA! (parla in fretta e dopo poco il fumetto sbiadisce: resta la
//  casella). Si scrive in una casella HTML vera (js/casella.js): sul telefono si apre la sua
//  tastiera, e quando è aperta fumetto, casella e barra salgono nella parte che resta visibile.
//  L'ordine dei proverbi esce dal seme del round e dal giocatore: ognuno ha i suoi, in un altro ordine.
//  (Denny e le sue pose sono texture create qui e buttate alla fine: niente immagini grandi nuove.)
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { Sessione } from '../sessione.js';
import { RES, casuale } from '../grafica/base.js';
import { preparaPosa } from '../sprites.js';
import { casellaTesto } from '../casella.js';
import { txt, im, scalaDi, scritta, stelle, fumetto, caso, eTouch, perDito, vibra, puntiHud, numero, quanti } from '../fx.js';

// Denny: le sue pose (espressione, opzioni del disegno), tutte alla stessa densità (si vede in grande)
const POSE_DENNY = { dennySaggio: ['sufficienza', { posa: 'saggio' }], dennyOffeso: ['sufficienza', {}], dennyGongola: ['felice', {}] };
const DENS_DENNY = Math.round(RES * 1.35);
// dove sta tutto: a tastiera chiusa (Denny grande a destra) e, sul telefono con la tastiera aperta,
// tutto nella parte che resta visibile in alto (basso = fin dove si vede, in unità logiche)
const NORMALE = {
  fumetto: { x: 12, y: 44, w: 318, h: 112 }, barra: { x: 22, y: 163, w: 298 },
  casella: { x: 52, y: 176, w: 196, h: 30 }, ok: { x: 254, y: 176, w: 60, h: 30 },
  denny: { x: 402, piedi: 290, taglia: 1.55 }, size: 13,
};
const ALTO = (alto, basso) => {
  // (su iPhone, aprendo la tastiera, Safari può far scorrere la pagina: allora si vede da "alto" in giù)
  const t = Math.max(0, Math.min(150, alto)), b = Math.max(t + 96, Math.min(270, basso)), y0 = t + 32;
  // quello che stai scrivendo, ripetuto nel gioco (la casella vera, su qualche telefono, finisce sotto
  // la tastiera): solo se sotto il fumetto c'è posto, se no andrebbe sopra il proverbio
  const posto = b - y0 - 66 >= 30;
  return {
    fumetto: { x: 8, y: y0, w: 372, h: posto ? b - y0 - 66 : Math.max(30, b - y0 - 50) }, barra: { x: 18, y: b - 45, w: 352 },
    eco: posto ? { x: 194, y: b - 55 } : null,
    casella: { x: 70, y: b - 38, w: 210, h: 28 }, ok: { x: 286, y: b - 38, w: 60, h: 28 },
    // Denny piccolo in basso a destra, sotto punti e contatore
    denny: { x: 446, piedi: b + 4, taglia: Math.max(0.36, Math.min(0.62, (b - t - 54) / 144)) }, size: 11,
  };
};
const INCHIOSTRO = '#2b1b17', GIUSTA = '#1e8a4a', SCADUTA = '#2f6fd8';

// la risposta, per confrontarla: niente maiuscole, spazi prima e dopo, accenti e apostrofi
const norma = (s) => String(s ?? '').toLowerCase().trim().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/['’`´]/g, '');
function levenshtein(a, b) {
  const d = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prima = d[0];
    d[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const t = d[j];
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prima + (a[i - 1] === b[j - 1] ? 0 : 1));
      prima = t;
    }
  }
  return d[b.length];
}
// un proverbio della configurazione: "Il mattino ha l'[oro] in bocca" -> le parole prima, la parola
// tra quadre (coi pezzi attaccati: l'apostrofo davanti, la virgola dopo) e le parole dopo
function leggi(voce) {
  const m = voce.proverbio.match(/^(.*?)(\S*)\[([^\]]+)\](\S*)(.*)$/);
  return { prima: m[1].trim().split(/\s+/).filter(Boolean), pre: m[2], giusta: m[3], post: m[4], dopo: m[5].trim().split(/\s+/).filter(Boolean), dice: voce.dice, perla: !!voce.perla };
}

export class ProverbiScene extends MicrogiocoBase {
  constructor() { super('proverbi'); }

  attoA(t) { return this.cfg.atti.filter((a) => t >= a.da).pop(); }
  // in Lampo (15 secondi) l'obiettivo è più piccolo e i punti non seguono la scala delle medaglie
  get obiettivo() { return this.lampo ? this.cfg.obiettivoLampo : this.cfg.obiettivoProverbi; }

  prepara() {
    const c = this.cfg;
    // (il seme del round, ma diverso per ogni giocatore: chi gioca dopo non deve trovare gli stessi
    // proverbi nello stesso ordine, scheda di valutazione)
    this.rnd = casuale((Sessione.seme + 7919 * ((Sessione.giocatore?.i ?? 0) + 1)) >>> 0);
    this.lampo = Sessione.tipo === 'lampo';
    // l'ordine dei proverbi: dal seme del round, tutti diversi
    this.ordine = this.mescola(c.proverbi.map((_, i) => i));
    this.indice = 0;
    this.punti = 0; this.giusti = 0; this.serie = 0; this.perle = 0; this.visti = 0;
    this.stato = 'attesa';
    this.L = NORMALE; this.chiaveLayout = 'normale';

    // il Pallaio, un po' scurito (il fumetto e la casella si devono leggere)
    im(this, 0, 0, 'bgPallaio').setOrigin(0).setDepth(0);
    this.add.rectangle(0, 0, 480, 270, 0x140c20, 0.38).setOrigin(0).setDepth(1);
    im(this, 240, 0, 'lampadaPong', 1.2).setOrigin(0.5, 0).setDepth(2);
    // Denny: le sue pose, create adesso (e buttate alla fine)
    for (const [k, [espr, o]] of Object.entries(POSE_DENNY)) preparaPosa(this, k, 'pastaffi', espr, o, DENS_DENNY);
    this.denny = im(this, 0, 0, 'dennySaggio').setOrigin(0.5, 1).setFlipX(true).setDepth(20);
    this.tweens.add({ targets: this.denny, scaleY: { from: this.denny.scaleY, to: this.denny.scaleY * 1.012 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // il fumetto (disegnato: niente immagini), le parole, la barra del tempo del proverbio
    this.gFumetto = this.add.graphics().setDepth(30);
    this.gSegni = this.add.graphics().setDepth(32);
    this.parole = [];
    this.gBarra = this.add.graphics().setDepth(30);
    this.perlaTesto = txt(this, 0, 0, 'PERLA ORIGINALE!', { size: 8, color: '#ffe14a', depth: 34 }).setAngle(-4).setVisible(false);
    this.aiuto = txt(this, 0, 0, perDito('Scrivi la parola giusta e premi INVIO', ''), { size: 7, color: '#fff3d6', depth: 30 });
    this.testoPunti = txt(this, 474, 36, '', { ox: 1, size: 9, depth: 1001 });
    this.testoGiusti = txt(this, 474, 49, '', { ox: 1, size: 8, depth: 1001 });
    this.testoSerie = txt(this, 0, 0, '', { ox: 0, size: 9, color: '#ffe14a', depth: 31 });
    this.eco = txt(this, 0, 0, '', { size: 11, color: '#ffe14a', depth: 32 }).setVisible(false);
    this.hud();

    // la casella (HTML): si chiude in pausa e si riapre alla ripresa
    this.apriCasella();
    this.alPausa = () => this.chiudiCasella();
    this.events.on('pause', this.alPausa);
    this.disponi();
    this.nuovoProverbio();
  }

  // alla ripresa dopo la pausa: la casella di nuovo (sul telefono va ritoccato SCRIVI)
  alRientro() { this.apriCasella(); this.chiaveLayout = ''; this.disponi(); }

  apriCasella() {
    if (this.casella) return;
    this.casella = casellaTesto({ invio: (t) => this.risposta(t) });
    this.casella.mettiIn(this.posti());
    this.suggerisci();
  }

  chiudiCasella() { this.casella?.chiudi(); this.casella = null; }

  pulisci() {
    this.chiudiCasella();
    this.events.off('pause', this.alPausa);
    // le pose di Denny: prima l'immagine, poi le texture
    this.denny?.destroy();
    for (const k of [...Object.keys(POSE_DENNY), 'dennyResa', 'dennyProclama']) if (this.textures.exists(k)) this.textures.remove(k);
  }

  termina() {
    this.eco?.setVisible(false);   // (aggiorna non gira più: se no resterebbe sul finale)
    this.chiudiCasella();
    this.stato = 'fine';     // (le correzioni ancora in arrivo non partono più)
    super.termina();
  }

  mescola(a) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(this.rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  // ---------- il layout ----------
  posti() {
    const L = this.L;
    return { casella: L.casella, ok: L.ok, scrivi: { x: L.casella.x, y: L.casella.y, w: L.ok.x + L.ok.w - L.casella.x, h: L.casella.h } };
  }

  // sul telefono: la tastiera aperta copre metà schermo, tutto sale nella parte che si vede
  controllaTastiera() {
    if (!eTouch() || !this.casella) return;
    const k = this.casella.tastiera(), a = Math.round(k.alto / 6) * 6, b = Math.round(k.basso / 6) * 6;
    const chiave = k.aperta ? `alto${a}-${b}` : 'normale';
    if (chiave === this.chiaveLayout) return;
    this.chiaveLayout = chiave;
    this.L = k.aperta ? ALTO(a, b) : NORMALE;
    this.disponi();
  }

  disponi() {
    const L = this.L, d = L.denny;
    this.denny.setPosition(d.x, d.piedi);
    this.tweens.killTweensOf(this.denny);
    this.denny.setScale(scalaDi(this.denny.texture.key, d.taglia)).setFlipX(true);
    this.tweens.add({ targets: this.denny, scaleY: this.denny.scaleY * 1.012, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.disegnaFumetto();
    this.scriviProverbio(false);
    const cx = L.casella.x + L.casella.w / 2;
    this.aiuto.setPosition(cx, L.casella.y + L.casella.h + 9).setVisible(L === NORMALE && !eTouch());
    this.testoSerie.setPosition(eTouch() ? L.ok.x + L.ok.w + 6 : L.casella.x + L.casella.w + 8, L.casella.y + L.casella.h / 2);
    this.casella?.mettiIn(this.posti());
    this.disegnaBarra2();
  }

  // il fumetto: grande, bianco, con la punta verso la bocca di Denny
  disegnaFumetto() {
    const F = this.L.fumetto, d = this.L.denny, g = this.gFumetto, M = Phaser.Math;
    const bocca = { x: d.x - 8 * d.taglia, y: d.piedi - 144 * d.taglia + 80 * d.taglia };
    // la punta: dal bordo di sotto, verso destra, fino quasi alla bocca di Denny
    const A = [F.x + F.w - 74, F.y + F.h - 3], B = [F.x + F.w - 34, F.y + F.h - 3];
    const C = [M.Clamp(bocca.x - 22, F.x + F.w - 10, F.x + F.w + 40), M.Clamp(bocca.y, F.y + F.h + 8, F.y + F.h + 30)];
    g.clear();
    g.fillStyle(0x000000, 0.28); g.fillRoundedRect(F.x + 2, F.y + 3, F.w, F.h, 14); g.fillTriangle(A[0] + 2, A[1] + 3, B[0] + 2, B[1] + 3, C[0] + 2, C[1] + 3);
    g.fillStyle(0xfffaf0, 1); g.fillRoundedRect(F.x, F.y, F.w, F.h, 13);
    g.lineStyle(3.5, 0x2b1b17, 1); g.strokeRoundedRect(F.x, F.y, F.w, F.h, 13);
    g.fillTriangle(A[0], A[1], B[0], B[1], C[0], C[1]);
    g.beginPath(); g.moveTo(A[0], A[1] + 1.6); g.lineTo(C[0], C[1]); g.lineTo(B[0], B[1] + 1.6); g.strokePath();
    this.perlaTesto.setPosition(F.x + 62, F.y - 2);
  }

  // ---------- il proverbio ----------
  nuovoProverbio() {
    if (!this.inCorso && this.visti) return;
    const c = this.cfg;
    if (this.indice >= this.ordine.length) { this.ordine = this.mescola(this.ordine.slice()); this.indice = 0; }
    this.prov = leggi(c.proverbi[this.ordine[this.indice++]]);
    this.visti++;
    const atto = this.attoA(this.trascorso);
    this.sottolinea = !c.sottolineaMai && (c.sottolineaSempre || atto.sottolinea);
    this.limite = atto.tempo;
    this.leggibile = atto.leggibile ?? null;
    this.svelto = !!atto.svelto;
    this.tProv = 0;
    this.sbiadito = false;
    this.correzione = null;
    this.stato = 'risposta';
    this.casella?.svuota();
    this.suggerisci();
    this.perlaTesto.setVisible(this.prov.perla);
    this.denny.setTexture('dennySaggio');
    this.scriviProverbio(true);
  }

  suggerisci() {
    // (Facile) la prima lettera in grigio nella casella
    if (this.casella) this.casella.segnaposto(this.cfg.suggerimento && this.prov ? this.prov.giusta[0].toLowerCase() + '…' : '');
  }

  // le parole del proverbio, una per una (così la sbagliata si sottolinea e si cancella), a capo
  // quando serve; il testo si rimpicciolisce solo se proprio non ci sta (mai sotto 8)
  scriviProverbio(entra) {
    for (const t of this.parole) t.destroy();
    this.parole = [];
    this.rigaRossa?.stop(); this.rigaRossa = null;
    this.gSegni.clear();
    this.giustaTesto?.destroy(); this.giustaTesto = null;
    if (!this.prov) return;
    const F = this.L.fumetto, p = this.prov;
    let size = this.L.size, righe, misure, alt;
    const crea = () => {
      for (const t of this.parole) t.destroy();
      this.parole = [];
      const pezzi = [];
      const parola = (s, sbagliata = false) => { const t = txt(this, 0, 0, s, { size, color: INCHIOSTRO, thick: 0, depth: 33, ox: 0 }); this.parole.push(t); return { t, w: t.width - 6, sbagliata }; };
      for (const s of p.prima) pezzi.push([parola(s)]);
      pezzi.push([p.pre && parola(p.pre), parola(p.dice, true), p.post && parola(p.post)].filter(Boolean));
      for (const s of p.dopo) pezzi.push([parola(s)]);
      const spazio = size * 1.3 * 0.32, maxW = F.w - 26;
      righe = [[]]; let w = 0;
      for (const gruppo of pezzi) {
        const gw = gruppo.reduce((a, q) => a + q.w, 0);
        if (righe[righe.length - 1].length && w + spazio + gw > maxW) { righe.push([]); w = 0; }
        w += (righe[righe.length - 1].length ? spazio : 0) + gw;
        righe[righe.length - 1].push(gruppo);
      }
      misure = { spazio, riga: size * 1.3 * 1.25 };
      alt = righe.length * misure.riga;
    };
    crea();
    while (alt > F.h - Math.min(18, F.h * 0.25) && size > 8) { size -= 1; crea(); }
    this.sizeTesto = size;
    // a posto: righe centrate nel fumetto
    let y = F.y + (F.h - alt) / 2 + misure.riga / 2 + (this.prov.perla ? 3 : 0);
    let ordine = 0;
    this.sbagliata = null;
    for (const r of righe) {
      const w = r.reduce((a, gr) => a + gr.reduce((b, q) => b + q.w, 0), 0) + misure.spazio * (r.length - 1);
      let x = F.x + (F.w - w) / 2;
      for (const gr of r) {
        for (const q of gr) {
          q.t.setPosition(x - 3, y).setOrigin(0, 0.5);
          if (q.sbagliata) this.sbagliata = { x, y, w: q.w, t: q.t };
          q.t.ordine = ordine;
          x += q.w;
        }
        ordine++;
        x += misure.spazio;
      }
      y += misure.riga;
    }
    // Denny parla in fretta (terzo atto): le parole arrivano una dopo l'altra
    if (entra && this.svelto) {
      for (const t of this.parole) { t.setAlpha(0); this.time.delayedCall(t.ordine * 60, () => t.setAlpha(1)); }
      this.rivelato = (ordine * 60) / 1000;
    } else this.rivelato = 0;
    if (entra && !this.svelto) for (const t of this.parole) { t.setAlpha(0); this.tweens.add({ targets: t, alpha: 1, duration: 140, delay: t.ordine * 12 }); }
    this.disegnaSegni(false);
    if (!entra) this.sbiadisci(this.sbiadito, true);
  }

  // la sottolineatura della parola sbagliata, o la correzione (riga rossa e la parola giusta sopra)
  disegnaSegni(anima) {
    const g = this.gSegni, s = this.sbagliata;
    g.clear();
    if (!s || !this.prov) return;
    const fs = this.sizeTesto * 1.3;
    if (!this.correzione && this.sottolinea && this.stato === 'risposta') {
      g.lineStyle(2.2, 0xe23b4e, 1); g.lineBetween(s.x - 1, s.y + fs * 0.55, s.x + s.w + 1, s.y + fs * 0.55);
    }
    if (!this.correzione) return;
    const riga = { w: anima ? 0 : s.w + 4 };
    const traccia = () => { g.clear(); g.lineStyle(2.8, 0xd8263a, 1); g.lineBetween(s.x - 2, s.y + 1, s.x - 2 + riga.w, s.y - 1); };
    traccia();
    this.rigaRossa?.stop();
    this.rigaRossa = anima ? this.tweens.add({ targets: riga, w: s.w + 4, duration: 160, onUpdate: traccia }) : null;
    s.t.setAlpha(0.55);
    const col = this.correzione === 'giusto' ? GIUSTA : SCADUTA;
    this.giustaTesto?.destroy();
    this.giustaTesto = txt(this, s.x + s.w / 2, s.y - fs * 0.92, this.prov.giusta, { size: this.sizeTesto, color: col, stroke: '#fffaf0', thick: 4, depth: 34 });
    if (anima) { this.giustaTesto.setScale(0.2); this.tweens.add({ targets: this.giustaTesto, scale: 1, duration: 220, delay: 120, ease: 'Back.out' }); }
  }

  // terzo atto: il fumetto sbiadisce (resta la casella)
  sbiadisci(si, subito = false) {
    const oggetti = [this.gFumetto, this.gSegni, ...this.parole, this.perlaTesto];
    if (this.giustaTesto) oggetti.push(this.giustaTesto);
    this.tweens.killTweensOf(oggetti.filter((o) => o !== this.perlaTesto));
    if (subito) { for (const o of oggetti) o.setAlpha(si ? 0 : o === this.sbagliata?.t && this.correzione ? 0.55 : 1); return; }
    this.tweens.add({ targets: oggetti, alpha: si ? 0 : 1, duration: si ? 450 : 120 });
  }

  // ---------- la risposta ----------
  accettata(testo) {
    const c = this.cfg, t = norma(testo), giusta = norma(this.prov.giusta), sbagliata = norma(this.prov.dice);
    if (t === sbagliata) return false;                 // la parola di Denny non vale mai
    if (t === giusta) return true;
    return giusta.length >= c.lunghezzaTolleranza && levenshtein(t, giusta) <= c.tolleranza;
  }

  risposta(testo) {
    if (!this.inCorso || this.stato !== 'risposta' || !norma(testo)) return;
    if (this.accettata(testo)) this.giusto(); else this.sbagliato();
  }

  molt() { return this.cfg.serie.reduce((m, [n, k]) => (this.serie >= n ? k : m), 1); }

  giusto() {
    const c = this.cfg, p = this.prov, veloce = this.tProv < c.secondiVeloce;
    const valore = (c.punti + (veloce ? c.bonusVeloce : 0)) * this.molt() * (p.perla ? c.perla : 1);
    this.giusti++; this.serie++;
    if (p.perla) this.perle++;
    // la scala delle medaglie: fino all'obiettivo al massimo tettoPrima; l'obiettivo porta almeno
    // al bronzo (in Lampo le medaglie non contano: i punti e basta)
    const ob = this.obiettivo, bronzo = c.medaglie.bronzo;
    if (this.lampo) this.punti += valore;
    else if (this.giusti < ob) this.punti = Math.min(c.tettoPrima, this.punti + valore);
    else if (this.giusti === ob) this.punti = Math.max(bronzo, this.punti + valore);
    else this.punti += valore;
    this.stato = 'giusto';
    this.correzione = 'giusto';
    this.casella?.svuota();
    this.sbiadisci(false, true);
    this.disegnaSegni(true);
    Audio.sfx('ding');
    const L = this.L;
    const pt = txt(this, L.casella.x + L.casella.w / 2, L.casella.y - 6, `+${numero(valore, valore % 1 ? 1 : 0)}${veloce ? '  VELOCE!' : ''}`, { size: 9, color: '#7dff9a', depth: 40 });
    this.tweens.add({ targets: pt, y: pt.y - 16, alpha: 0, duration: 800, onComplete: () => pt.destroy() });
    if (p.perla) { scritta(this, L.fumetto.x + L.fumetto.w / 2, L.fumetto.y + 10, 'PERLA ORIGINALE! x2', { size: 13, color: '#ffe14a' }); Audio.sfx('applauso'); stelle(this, L.fumetto.x + L.fumetto.w / 2, L.fumetto.y + 10, 8, 940); }
    if (this.giusti === ob) { scritta(this, 420, 62, `${ob} GIUSTI!`, { size: 12, color: '#7dff9a', durata: 900 }); Audio.sfx('bonus'); }
    // Denny si offende e ribatte
    this.denny.setTexture('dennyOffeso');
    this.frase(caso(c.frasiOffeso), 1100);
    Audio.sfx('borbottio');
    this.hud();
    this.time.delayedCall(c.pausaGiusto * 1000, () => this.nuovoProverbio());
  }

  sbagliato() {
    const c = this.cfg;
    this.serie = 0;
    this.punti = Math.max(!this.lampo && this.giusti >= this.obiettivo ? c.medaglie.bronzo : 0, this.punti - c.sbaglio);
    this.casella?.trema();
    this.casella?.svuota();
    Audio.sfx('errore');
    vibra(60);
    const L = this.L, pt = txt(this, L.casella.x + L.casella.w / 2, L.casella.y - 6, `-${c.sbaglio}`, { size: 9, color: '#ff8a7a', depth: 40 });
    this.tweens.add({ targets: pt, y: pt.y - 14, alpha: 0, duration: 700, onComplete: () => pt.destroy() });
    // Denny gongola, poi torna saggio
    this.denny.setTexture('dennyGongola');
    this.frase(caso(c.frasiGongola), 1000);
    this.time.delayedCall(900, () => { if (this.stato === 'risposta') this.denny.setTexture('dennySaggio'); });
    this.hud();
  }

  // tempo del proverbio finito: VERITÀ DEFINITIVA, poi il proverbio giusto per un attimo
  scaduto() {
    const c = this.cfg, F = this.L.fumetto;
    this.stato = 'scaduto';
    this.serie = 0;
    this.casella?.svuota();
    Audio.sfx('tamburo');
    this.sbiadisci(false, true);
    this.disegnaSegni(false);
    this.tweens.add({ targets: this.denny, angle: { from: -3, to: 3 }, duration: 90, yoyo: true, repeat: 3, onComplete: () => this.denny.setAngle(0) });
    scritta(this, F.x + F.w / 2, F.y + F.h / 2, 'VERITÀ DEFINITIVA!', { size: 15, color: '#ff6b5a', durata: 650 });
    this.frase(caso(c.frasiVerita), 1300);
    this.time.delayedCall(700, () => { if (this.stato !== 'scaduto') return; this.correzione = 'scaduto'; this.disegnaSegni(true); });
    this.hud();
    this.time.delayedCall(c.pausaScaduto * 1000, () => this.nuovoProverbio());
  }

  // una battuta di Denny, nel fumettino accanto alla sua testa
  frase(s, ms) {
    this.fumettino?.destroy();
    const d = this.L.denny, x = Math.max(70, Math.min(410, d.x - 30 * d.taglia)), y = Math.max(32, d.piedi - 150 * d.taglia);
    this.fumettino = fumetto(this, x, y, s, ms, 960);
  }

  hud() {
    this.testoPunti.setText(puntiHud(this.punti));
    const ob = this.obiettivo;
    this.testoGiusti.setText(`GIUSTI: ${this.giusti}/${ob}`).setColor(this.giusti >= ob ? '#7dff9a' : '#ffe14a');
    const m = this.molt();
    this.testoSerie.setText(m > 1 ? `SERIE x${numero(m, m % 1 ? 1 : 0)}` : '');
  }

  // la barra del tempo del proverbio, sotto il fumetto
  disegnaBarra2() {
    const B = this.L.barra, g = this.gBarra, r = this.stato === 'risposta' ? Math.max(0, 1 - this.tProv / this.limite) : 0;
    g.clear();
    g.fillStyle(0x1f1430, 0.9); g.fillRoundedRect(B.x, B.y, B.w, 7, 3.5);
    g.fillStyle(r < 0.3 ? 0xf87171 : r < 0.6 ? 0xfacc15 : 0x7dd3fc, 1);
    if (r > 0.01) g.fillRoundedRect(B.x + 1.5, B.y + 1.5, (B.w - 3) * r, 4, 2);
  }

  // ---------- a ogni fotogramma ----------
  aggiorna(dt) {
    this.controllaTastiera();
    this.casella?.aggiorna();
    const eco = this.L.eco && this.casella?.haFuoco();
    this.eco.setVisible(!!eco);
    if (eco) this.eco.setPosition(this.L.eco.x, this.L.eco.y).setText('SCRIVI: ' + (this.casella.valore.trim() || '...'));
    // gli atti si annunciano
    const atto = this.cfg.atti.indexOf(this.attoA(this.trascorso));
    if (atto !== this.nAtto) {
      this.nAtto = atto;
      Audio.sfx(atto === 2 ? 'scatena' : 'bonus');
      // (sotto la casella, dove non copre il proverbio)
      scritta(this, this.L === NORMALE ? 170 : 240, this.L === NORMALE ? 242 : Math.min(256, this.L.casella.y + 44), this.cfg.atti[atto].nome, { size: 15, color: atto === 2 ? '#ff6b5a' : '#ffe14a', durata: 900, depth: 950 });
    }
    if (this.stato === 'risposta') {
      this.tProv += dt;
      // terzo atto: dopo un po' il fumetto sbiadisce
      if (this.leggibile && !this.sbiadito && this.tProv >= this.rivelato + this.leggibile) { this.sbiadito = true; this.sbiadisci(true); }
      if (this.tProv >= this.limite) this.scaduto();
    }
    this.disegnaBarra2();
  }

  risultato() {
    const ob = this.obiettivo;
    return {
      punteggio: Math.round(this.punti),
      vittoria: this.giusti >= ob,
      riepilogo: `${quanti(this.giusti, 'proverbio corretto', 'proverbi corretti')} su ${this.visti}` + (this.perle ? ` (${quanti(this.perle, 'perla', 'perle')})` : ''),
      titoli: ['DENNY SI ARRENDE!', 'HA RAGIONE DENNY!'],
    };
  }

  // ---------- la fine ----------
  // Vinci: Denny si arrende teatralmente. Perdi: sale su una sedia e proclama l'ultima perla, tra i
  // coriandoli. Al massimo 3 secondi; si salta con un tocco, INVIO o SPAZIO.
  finale(ris, fatto) {
    const c = this.cfg, F = NORMALE.fumetto, d = NORMALE.denny;
    this.chiudiCasella();
    this.L = NORMALE;
    for (const o of [this.gBarra, this.aiuto, this.testoSerie, this.perlaTesto, this.gSegni]) o.setVisible(false);
    this.giustaTesto?.destroy();
    this.fumettino?.destroy();
    let chiuso = false;
    const fine = () => { if (chiuso) return; chiuso = true; fatto(); };
    this.time.delayedCall(400, () => {
      for (const k of ['ENTER', 'SPACE']) this.input.keyboard.once('keydown-' + k, fine);
      this.input.once('pointerdown', fine);
    });
    const titolo = txt(this, 240, 26, ris.titoloFine, { size: 20, color: ris.vittoria ? '#7dff9a' : '#ff6b5a', depth: 1100 });
    this.tweens.add({ targets: titolo, scale: { from: 1.6, to: 1 }, duration: 260, ease: 'Back.out' });
    this.tweens.killTweensOf(this.denny);
    this.denny.setAngle(0);
    let frase, y = d.piedi;
    if (ris.vittoria) {
      preparaPosa(this, 'dennyResa', 'pastaffi', 'triste', { posa: 'shock' }, DENS_DENNY);
      this.denny.setTexture('dennyResa');
      frase = c.fraseResa;
      Audio.sfx('vittoria');
      stelle(this, 240, 120, 10, 1050);
    } else {
      // la sedia (disegnata), e Denny ci sale sopra
      preparaPosa(this, 'dennyProclama', 'pastaffi', 'felice', { posa: 'saggio' }, DENS_DENNY);
      const sedia = this.add.graphics().setDepth(19), sx = d.x, sy = 268;
      sedia.fillStyle(0x2b1b17, 1);
      for (const dx of [-30, 26]) sedia.fillRect(sx + dx - 1, sy - 46, 7, 48);
      sedia.fillRect(sx - 34, sy - 52, 72, 10); sedia.fillRect(sx + 26, sy - 112, 8, 64);
      sedia.fillStyle(0xa86a38, 1);
      for (const dx of [-30, 26]) sedia.fillRect(sx + dx, sy - 45, 5, 46);
      sedia.fillRect(sx - 33, sy - 51, 70, 7); sedia.fillRect(sx + 27, sy - 111, 6, 62);
      this.denny.setTexture('dennyProclama');
      y = sy - 50 + 20;
      const v = leggi(caso(c.proverbi));
      frase = `${caso(c.frasiSedia)} ${[...v.prima, v.pre + v.dice + v.post, ...v.dopo].join(' ')}!`;
      Audio.sfx('tamburo'); Audio.sfx('applauso');
      const COL = [0xff5a6a, 0x5ab4ff, 0xffe14a, 0x7dff9a, 0xff9ac4, 0xb06aff];
      this.time.addEvent({ delay: 45, repeat: 40, callback: () => {
        const r = this.add.rectangle(Math.random() * 480, -6, 3.2, 5, caso(COL)).setAngle(Math.random() * 360).setDepth(1050);
        this.tweens.add({ targets: r, y: 280, x: r.x + (Math.random() - 0.5) * 70, angle: r.angle + 500, duration: 1300 + Math.random() * 700, onComplete: () => r.destroy() });
      } });
    }
    this.denny.setScale(scalaDi(this.denny.texture.key, d.taglia)).setPosition(d.x, d.piedi);
    this.tweens.add({ targets: this.denny, y, duration: 260, ease: 'Back.out' });
    // l'ultima parola di Denny, nel fumetto grande
    this.prov = null;
    this.disegnaFumetto();
    for (const t of this.parole) t.destroy();
    this.parole = [txt(this, F.x + F.w / 2, F.y + F.h / 2, frase, { size: 11, color: INCHIOSTRO, thick: 0, depth: 33, wrap: F.w - 24 })];
    this.gFumetto.setAlpha(1);
    this.time.delayedCall(3000, fine);
  }
}
