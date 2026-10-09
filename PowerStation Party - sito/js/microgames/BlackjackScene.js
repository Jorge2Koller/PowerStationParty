// Microgioco 8: "L'Ingiocabile" - blackjack contro il banco.
//
//  Blackjack classico: si punta (10, 25 o 50), poi carta, stai o raddoppia.
//  Il banco tira fino a 17, il blackjack paga 3 a 2. Il sabot ha due mazzi
//  mescolati con il seme del round: nella sfida tutti e due trovano le stesse carte.
//  Quando vince il banco, l'Ingiocabile allunga il braccio piegato a 90 gradi e
//  spazzola via le fiches con un fischio, poi commenta: «Come le leggo!»
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { Audio } from '../audio.js';
import { Sessione } from '../sessione.js';
import { casuale } from '../grafica/base.js';
import { txt, im, scalaDi, scritta, stelle, pannello, lerp, caso, fumetto, vibra, perDito } from '../fx.js';

const Y_TAVOLO = 100;
const Y_BANCO = 126, Y_MIA = 206, PASSO_CARTA = 20;
const SABOT = { x: 428, y: 118 }, SCARTI = { x: 48, y: 118 };
const CERCHIO = { x: 120, y: 206 };
const BANCA = { x: 384, y: 214 };
const SPALLA = { x: 256, y: 92 };      // spalla destra (per chi guarda) dell'Ingiocabile
const RANGHI = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SEMI = ['cuori', 'quadri', 'fiori', 'picche'];
const valoreCarta = (r) => (r === 'A' ? 11 : ['J', 'Q', 'K'].includes(r) ? 10 : Number(r));

export function conta(carte) {
  let tot = 0, assi = 0;
  for (const c of carte) { tot += valoreCarta(c.r); if (c.r === 'A') assi++; }
  while (tot > 21 && assi) { tot -= 10; assi--; }
  return { tot, morbido: assi > 0 && tot <= 21 };
}

export class BlackjackScene extends MicrogiocoBase {
  constructor() { super('blackjack'); }

  prepara() {
    const c = this.cfg;
    this.fiches = c.fiches;
    this.puntata = 0;
    this.mani = 0;
    this.vinte = 0;
    this.blackjack = 0;
    this.stato = 'attesa';
    this.mia = [];
    this.banco = [];
    this.pila = [];            // fiches sul cerchio della puntata
    this.nCarta = 0;
    this.rnd = casuale(Sessione.seme);
    this.sabot = [];
    this.mescola();

    im(this, 0, 0, 'bgCasino').setOrigin(0);
    this.dealer = im(this, 240, Y_TAVOLO + 30, 'ingiocabile_normale', 0.75).setOrigin(0.5, 1).setDepth(5);
    im(this, 0, Y_TAVOLO, 'tavoloVerde').setOrigin(0).setDepth(10);
    txt(this, 240, 166, 'BLACKJACK PAGA 3 A 2', { size: 7, color: '#e8d27a', thick: 0, depth: 11 }).setAlpha(0.8);
    txt(this, 240, 176, `IL BANCO STA SU ${c.stai}`, { size: 5, color: '#e8d27a', thick: 0, depth: 11 }).setAlpha(0.65);
    im(this, SABOT.x, SABOT.y, 'sabot').setDepth(12);

    this.testoBanco = txt(this, 240, 151, '', { size: 7, depth: 600 });
    this.testoMio = txt(this, 240, 233, '', { size: 8, depth: 600, color: '#ffe14a' });
    this.testoPuntata = txt(this, CERCHIO.x, CERCHIO.y + 21, '', { size: 6, depth: 600 });
    this.testoFiches = txt(this, BANCA.x, BANCA.y + 22, '', { size: 8, depth: 600, color: '#ffe14a' });
    this.banca = [];
    this.aggiornaBanca();

    // braccio a spazzola (nascosto finché non serve)
    this.omero = this.add.graphics().setDepth(400);
    this.avambraccio = im(this, 0, 0, 'avambraccio').setOrigin(74 / 78, 0.5).setDepth(401).setVisible(false);

    // pulsanti: fiches per puntare, poi carta / stai / raddoppia
    this.bottoniPunta = c.puntate.map((v, i) => this.bottone(200 + i * 40, 252, 30, String(v), null, () => this.punta(v), 'fiche_' + v));
    this.etichettaPunta = txt(this, 176, 252, perDito('PUNTA\n(1, 2, 3)', 'PUNTA'), { size: 6, ox: 1, spacing: 0, depth: 700 });
    this.bottoniGioco = [
      this.bottone(160, 254, 70, perDito('CARTA (C)', 'CARTA'), 0x2e9a4a, () => this.carta()),
      this.bottone(240, 254, 70, perDito('STAI (S)', 'STAI'), 0xc0392b, () => this.stai()),
      this.bottone(332, 254, 96, perDito('RADDOPPIA (D)', 'RADDOPPIA'), 0xc89018, () => this.raddoppia()),
    ];
    this.mostra('nessuno');

    this.input.keyboard.on('keydown', (e) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      if (['1', '2', '3'].includes(k)) this.punta(c.puntate[Number(k) - 1]);
      else if (k === 'c' || k === ' ') this.carta();
      else if (k === 's' || k === 'enter') this.stai();
      else if (k === 'd') this.raddoppia();
    });

    this.dopo(500, () => this.nuovaMano());
  }

  // pulsante a schermo: sfondo colorato (o una fiche), scritta, zona da toccare un po' più larga
  bottone(x, y, w, testo, colore, azione, fiche) {
    const parti = [];
    if (fiche) parti.push(im(this, 0, 0, fiche, 2));
    else {
      const g = this.add.graphics();
      g.fillStyle(0x1f1430, 1).fillRoundedRect(-w / 2 - 1, -10, w + 2, 20, 7);
      g.fillStyle(colore, 1).fillRoundedRect(-w / 2, -9, w, 18, 6);
      g.fillStyle(0xffffff, 0.22).fillRoundedRect(-w / 2 + 3, -8, w - 6, 5, 3);
      parti.push(g);
    }
    parti.push(txt(this, 0, fiche ? -1.5 : 0, testo, { size: fiche ? 6.5 : 7 }));
    const cont = this.add.container(x, y, parti).setDepth(700);
    const zona = this.add.zone(x, y, w + 8, 26).setInteractive().setDepth(701);
    zona.on('pointerdown', (p, lx, ly, ev) => { ev?.stopPropagation(); if (cont.visible && cont.alpha > 0.5) azione(); });
    return { cont, zona };
  }

  mostra(quali) {
    for (const b of this.bottoniPunta) b.cont.setVisible(quali === 'punta');
    this.etichettaPunta.setVisible(quali === 'punta');
    for (const b of this.bottoniGioco) b.cont.setVisible(quali === 'gioco');
    if (quali === 'punta') this.cfg.puntate.forEach((v, i) => this.bottoniPunta[i].cont.setAlpha(this.fiches >= v ? 1 : 0.3));
    if (quali === 'gioco') this.bottoniGioco[2].cont.setAlpha(this.mia.length === 2 && this.fiches >= this.puntata ? 1 : 0.3);
  }

  dopo(ms, fn) { return this.time.delayedCall(ms, () => { if (this.inCorso) fn(); }); }

  espr(e) { this.dealer.setTexture('ingiocabile_' + e); }

  parla(s, ms = 1300) {
    this.fum?.destroy();
    this.fum = fumetto(this, 306, 44, s, ms, 800);
  }

  // --- sabot ---
  mescola() {
    const carte = [];
    for (let m = 0; m < this.cfg.mazzi; m++) for (const s of SEMI) for (const r of RANGHI) carte.push({ r, s });
    for (let i = carte.length - 1; i > 0; i--) { const j = Math.floor(this.rnd() * (i + 1)); [carte[i], carte[j]] = [carte[j], carte[i]]; }
    this.sabot = carte;
  }

  // una carta dal sabot alla mano (del giocatore o del banco), coperta o scoperta
  dai(mano, coperta = false) {
    const c = { ...this.sabot.pop(), coperta };
    const rosso = c.s === 'cuori' || c.s === 'quadri', col = rosso ? '#d22a34' : '#16161c';
    const k = this.add.container(SABOT.x - 8, SABOT.y - 4).setDepth(20 + this.nCarta++).setScale(0.7).setAngle(-20);
    k.add([
      im(this, 0, 0, 'carta'),
      txt(this, -7.5, -11.5, c.r, { size: c.r === '10' ? 6 : 7, color: col, thick: 0 }),
      im(this, -7.5, -4, 'seme_' + c.s, 0.5),
      im(this, 1.5, 6, 'seme_' + c.s, 1.3),
    ]);
    c.dorso = im(this, 0, 0, 'cartaDorso').setVisible(coperta);
    k.add(c.dorso);
    c.k = k;
    mano.push(c);
    Audio.sfx('carta');
    this.disponi(mano);
    return c;
  }

  disponi(mano) {
    const y = mano === this.mia ? Y_MIA : Y_BANCO, x0 = 240 - (mano.length - 1) * PASSO_CARTA / 2;
    mano.forEach((c, i) => this.tweens.add({ targets: c.k, x: x0 + i * PASSO_CARTA, y, scale: 1, angle: (i - (mano.length - 1) / 2) * 2, duration: 220, ease: 'Quad.out' }));
  }

  scopri(c) {
    if (!c.coperta) return;
    c.coperta = false;
    Audio.sfx('gira');
    this.tweens.add({ targets: c.k, scaleX: 0, duration: 90, yoyo: true, onYoyo: () => c.dorso.setVisible(false) });
  }

  scrivi() {
    const f = (m) => { const v = conta(m.filter((c) => !c.coperta)); return v.morbido && v.tot < 21 ? `${v.tot - 10}/${v.tot}` : String(v.tot); };
    this.testoMio.setText(this.mia.length ? f(this.mia) : '');
    this.testoBanco.setText(this.banco.length ? f(this.banco) : '');
    this.testoPuntata.setText(this.puntata ? 'PUNTATA ' + this.puntata : '');
  }

  // --- fiches ---
  aggiornaBanca() {
    this.banca.forEach((b) => b.destroy());
    this.banca = [];
    const n = Math.min(24, Math.ceil(this.fiches / 10));
    for (let i = 0; i < n; i++) {
      const col = Math.floor(i / 8), h = i % 8;
      this.banca.push(im(this, BANCA.x - 16 + col * 16, BANCA.y + 4 - h * 2.2, ['fiche_10', 'fiche_25', 'fiche_50'][col], 1).setDepth(30 + i));
    }
    this.testoFiches.setText('FICHES ' + this.fiches);
  }

  fiche(v, da, x, y) {
    const f = im(this, da.x, da.y, 'fiche_' + v, 1).setDepth(300 + this.pila.length);
    this.tweens.add({ targets: f, x, y, duration: 260, ease: 'Quad.out' });
    return f;
  }

  // --- una mano ---
  nuovaMano() {
    if (this.fiches < this.cfg.puntate[0]) return this.termina();
    if (this.sabot.length < this.cfg.rimescola) { this.mescola(); scritta(this, SABOT.x - 20, SABOT.y - 24, 'RIMESCOLO', { size: 7, color: '#ffffff', durata: 500 }); }
    this.stato = 'punta';
    this.espr('normale');
    this.mostra('punta');
    if (this.mani % 2 === 0 && !this.fum?.active) this.parla(caso(this.cfg.frasi), 1100);
  }

  punta(v) {
    if (!this.inCorso || this.stato !== 'punta') return;
    if (this.fiches < v) return Audio.sfx('vuoto');
    this.fiches -= v;
    this.puntata = v;
    this.aggiornaBanca();
    this.pila.push(this.fiche(v, BANCA, CERCHIO.x, CERCHIO.y));
    Audio.sfx('fiches');
    this.stato = 'distribuisce';
    this.mani++;
    this.mostra('nessuno');
    this.scrivi();
    // carta a me, al banco, a me, al banco coperta
    [[this.mia], [this.banco], [this.mia], [this.banco, true]].forEach(([m, cop], i) => this.dopo(250 + i * 300, () => { this.dai(m, cop); this.scrivi(); }));
    this.dopo(250 + 4 * 300 + 150, () => this.dopoDistribuzione());
  }

  dopoDistribuzione() {
    const io = conta(this.mia), banco = conta(this.banco);
    if (io.tot === 21) {
      this.scopri(this.banco[1]); this.scrivi();
      return this.dopo(500, () => this.esito(banco.tot === 21 ? 'pari' : 'blackjack'));
    }
    if (banco.tot === 21) {
      this.scopri(this.banco[1]); this.scrivi();
      return this.dopo(500, () => this.esito('bancoBJ'));
    }
    this.stato = 'gioca';
    this.mostra('gioco');
  }

  carta() {
    if (!this.inCorso || this.stato !== 'gioca') return;
    this.dai(this.mia);
    this.scrivi();
    const t = conta(this.mia).tot;
    this.mostra('gioco');
    if (t > 21) { this.stato = 'esito'; this.mostra('nessuno'); this.dopo(450, () => { this.scopri(this.banco[1]); this.scrivi(); this.dopo(350, () => this.esito('sballato')); }); }
    else if (t === 21) this.stai();
  }

  raddoppia() {
    if (!this.inCorso || this.stato !== 'gioca' || this.mia.length !== 2 || this.fiches < this.puntata) return;
    this.fiches -= this.puntata;
    this.aggiornaBanca();
    this.pila.push(this.fiche(this.puntata, BANCA, CERCHIO.x + 4, CERCHIO.y - 3));
    this.puntata *= 2;
    Audio.sfx('fiches');
    this.stato = 'esito';
    this.mostra('nessuno');
    this.dopo(300, () => {
      this.dai(this.mia);
      this.scrivi();
      if (conta(this.mia).tot > 21) this.dopo(450, () => { this.scopri(this.banco[1]); this.scrivi(); this.dopo(350, () => this.esito('sballato')); });
      else { this.stato = 'gioca'; this.dopo(350, () => this.stai()); }
    });
  }

  stai() {
    if (!this.inCorso || this.stato !== 'gioca') return;
    this.stato = 'banco';
    this.mostra('nessuno');
    this.scopri(this.banco[1]);
    this.scrivi();
    const tira = () => {
      if (conta(this.banco).tot < this.cfg.stai) return this.dopo(550, () => { this.dai(this.banco); this.scrivi(); tira(); });
      this.dopo(450, () => {
        const io = conta(this.mia).tot, b = conta(this.banco).tot;
        this.esito(b > 21 || io > b ? 'vince' : io === b ? 'pari' : 'perde');
      });
    };
    this.dopo(450, tira);
  }

  esito(tipo) {
    this.stato = 'esito';
    this.mostra('nessuno');
    const scritte = { vince: 'HAI VINTO!', blackjack: 'BLACKJACK!', pari: 'PAREGGIO', perde: 'VINCE IL BANCO', sballato: 'SBALLATO!', bancoBJ: 'BLACKJACK DEL BANCO' };
    const buono = tipo === 'vince' || tipo === 'blackjack';
    scritta(this, 240, 186, scritte[tipo], { size: tipo === 'bancoBJ' ? 11 : 14, color: buono ? '#7dff9a' : tipo === 'pari' ? '#ffffff' : '#ff6b5a', durata: 900, depth: 960 });
    if (buono || tipo === 'pari') {
      const vincita = tipo === 'blackjack' ? Math.round(this.puntata * 2.5) : tipo === 'vince' ? this.puntata * 2 : this.puntata;
      if (buono) {
        this.vinte++;
        if (tipo === 'blackjack') this.blackjack++;
        Audio.sfx(tipo === 'blackjack' ? 'bonus' : 'ok');
        stelle(this, CERCHIO.x, CERCHIO.y - 6, 6, 950);
        this.espr(tipo === 'blackjack' ? 'shock' : 'triste');
        this.parla(caso(this.cfg.frasiPerde), 1100);
        // il banco paga: fiches dal suo lato al cerchio
        const paga = vincita - this.puntata;
        for (let i = 0; i < Math.max(1, Math.round(paga / 25)); i++) this.pila.push(this.fiche(paga >= 50 ? 50 : paga >= 25 ? 25 : 10, { x: 240, y: Y_TAVOLO + 4 }, CERCHIO.x + 20 + (i % 3) * 3, CERCHIO.y - Math.floor(i / 3) * 2));
      }
      this.fiches += vincita;
      this.puntata = 0;
      this.dopo(700, () => {
        Audio.sfx('fiches');
        for (const f of this.pila) this.tweens.add({ targets: f, x: BANCA.x, y: BANCA.y, alpha: 0, duration: 350, onComplete: () => f.destroy() });
        this.pila = [];
        this.dopo(360, () => this.aggiornaBanca());
        this.dopo(700, () => this.sparecchia());
      });
    } else {
      this.puntata = 0;
      vibra(50);
      this.dopo(450, () => this.spazzola(() => this.sparecchia()));
    }
    this.scrivi();
  }

  // il braccio piegato a 90 gradi che spazzola le fiches, con un fischio solo
  spazzola(poi) {
    const pila = this.pila;
    this.pila = [];
    this.espr('sufficienza');
    const gomito = { x: SPALLA.x + 6, y: Y_TAVOLO + 10 };
    const disegna = () => {
      const g = this.omero;
      g.clear();
      g.lineStyle(13, 0x2b1b17, 1).lineBetween(SPALLA.x, SPALLA.y, gomito.x, gomito.y);
      g.lineStyle(10.5, 0x2a52b8, 1).lineBetween(SPALLA.x, SPALLA.y, gomito.x, gomito.y);
      g.fillStyle(0x2b1b17, 1).fillCircle(gomito.x, gomito.y, 6.6);
      g.fillStyle(0x2a52b8, 1).fillCircle(gomito.x, gomito.y, 5.4);
      this.avambraccio.setPosition(gomito.x, gomito.y);
    };
    this.omero.setVisible(true).setAlpha(1);
    this.avambraccio.setVisible(true).setAlpha(1);
    disegna();
    // il braccio si allunga oltre le fiches...
    this.tweens.add({
      targets: gomito, x: CERCHIO.x + 62, y: CERCHIO.y + 13, duration: 280, ease: 'Quad.out', onUpdate: disegna,
      onComplete: () => {
        // ...e le tira a sé, fischiando
        Audio.sfx('fischio');
        this.note();
        const prese = new Set();
        let px = gomito.x, py = gomito.y;
        this.tweens.add({
          targets: gomito, x: SPALLA.x + 30, y: Y_TAVOLO + 8, duration: 1100, ease: 'Sine.inOut',
          onUpdate: () => {
            const dx = gomito.x - px, dy = gomito.y - py;
            px = gomito.x; py = gomito.y;
            for (const f of pila) {
              if (!prese.has(f) && f.y >= gomito.y - 8) prese.add(f);
              if (prese.has(f)) f.setPosition(f.x + dx, f.y + dy);
            }
            disegna();
          },
          onComplete: () => {
            Audio.sfx('fiches');
            for (const f of pila) this.tweens.add({ targets: f, y: Y_TAVOLO - 2, alpha: 0, duration: 200, onComplete: () => f.destroy() });
            this.tweens.add({ targets: [this.omero, this.avambraccio], alpha: 0, duration: 220, onComplete: () => { this.omero.setVisible(false); this.avambraccio.setVisible(false); } });
            this.parla(this.cfg.fraseVince, 1700);
            this.dopo(1700, poi);
          },
        });
      },
    });
  }

  // note che escono mentre fischia
  note() {
    for (let i = 0; i < 4; i++) this.time.delayedCall(i * 260, () => {
      const n = txt(this, 252 + i * 4, 66, i % 2 ? '♫' : '♪', { size: 8, color: '#ffe14a', depth: 950 });
      this.tweens.add({ targets: n, x: n.x + 14 + i * 3, y: 28, alpha: 0, duration: 800, onComplete: () => n.destroy() });
    });
  }

  sparecchia() {
    for (const c of [...this.mia, ...this.banco]) this.tweens.add({ targets: c.k, x: SCARTI.x, y: SCARTI.y, angle: -30, scale: 0.6, alpha: 0, duration: 300, ease: 'Quad.in', onComplete: () => c.k.destroy() });
    this.mia = [];
    this.banco = [];
    this.scrivi();
    this.dopo(380, () => this.nuovaMano());
  }

  aggiorna() {}

  risultato() {
    // a tempo scaduto, una mano a metà si annulla: la puntata torna indietro
    const fiches = this.fiches + this.puntata;
    return {
      punteggio: fiches,
      vittoria: fiches > this.cfg.fiches,
      riepilogo: `${fiches} fiches, ${this.vinte} mani vinte su ${this.mani}` + (this.blackjack ? `, ${this.blackjack} blackjack` : ''),
      titoloFine: fiches < this.cfg.puntate[0] ? 'AL VERDE!' : 'TEMPO!',
    };
  }

  finale(ris, fatto) {
    this.mostra('nessuno');
    this.fum?.destroy();
    for (const o of [this.testoMio, this.testoBanco, this.testoPuntata]) o.setVisible(false);
    Audio.sfx('tempo');
    const velo = this.add.rectangle(0, 0, 480, 270, 0x1f1430, 0).setOrigin(0).setDepth(700);
    this.tweens.add({ targets: velo, fillAlpha: 0.7, duration: 300 });
    this.dealer.setDepth(701).setTexture(ris.vittoria ? 'ingiocabile_shock' : 'ingiocabile_felice');
    this.tweens.add({ targets: this.dealer, x: 240, y: 300, scale: scalaDi('ingiocabile_normale', 1.35), duration: 400, ease: 'Back.out' });
    this.time.delayedCall(700, () => {
      if (ris.vittoria) {
        txt(this, 240, 26, 'HAI SBANCATO!', { size: 18, color: '#7dff9a', depth: 710 });
        Audio.sfx('vittoria');
        for (let i = 0; i < 14; i++) {
          const f = im(this, Phaser.Math.Between(40, 440), -10, caso(['fiche_10', 'fiche_25', 'fiche_50']), 1.6).setDepth(705);
          this.tweens.add({ targets: f, y: 280, angle: Phaser.Math.Between(-200, 200), delay: i * 90, duration: 1100, ease: 'Quad.in', onComplete: () => f.destroy() });
        }
        this.time.delayedCall(400, () => fumetto(this, 330, 120, 'Ingiocabile, io?!', 1800, 712));
      } else {
        txt(this, 240, 26, 'IL BANCO VINCE SEMPRE', { size: 16, color: '#ff6b5a', depth: 710 });
        Audio.sfx('fischio');
        this.note();
        this.time.delayedCall(900, () => fumetto(this, 330, 120, this.cfg.fraseVince, 1800, 712));
      }
    });
    this.time.delayedCall(3300, fatto);
  }
}
