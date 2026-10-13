// Schermata IMPOSTAZIONI (dal menu e dalla pausa): volumi, audio, vibrazione, difficoltà di
// partenza, prova lampo, velocità dei testi, schermo che trema, ritardo audio (con la schermata
// che lo misura: RitardoScene, qui sotto); e il salvataggio (esporta, importa, azzera).
// Tutto si salva da solo (js/salvataggio.js).
// Tastiera: SU/GIÙ scelgono la riga, SINISTRA/DESTRA cambiano, INVIO conferma, ESC esce.
// Mouse e dito: si tocca direttamente il comando.
import { CONFIG } from '../config.js';
import { Audio } from '../audio.js';
import { Salvataggio } from '../salvataggio.js';
import { dialogo, dialogoAperto } from '../dialogo.js';
import { txt, inquadra, raggi, pannello, eTouch, perDito, pulsante, scritta } from '../fx.js';
import { pulsantiAngolo } from './menu.js';

const SCELTE = {
  difficolta: [['facile', 'FACILE'], ['normale', 'NORMALE'], ['difficile', 'DIFFICILE']],
  velocitaTesti: [['lenta', 'LENTA'], ['normale', 'NORMALE'], ['veloce', 'VELOCE']],
};
const X_ETI = 52, X_COM = 330, LARGO = 150;        // dove stanno le etichette e i comandi

export class ImpostazioniScene extends Phaser.Scene {
  constructor() { super('Impostazioni'); }

  create(dati) {
    inquadra(this);
    this.input.setDefaultCursor('default');
    this.ritorno = dati?.ritorno ?? 'Menu';             // 'Menu' oppure 'Pausa' (con dati.chiave del microgioco)
    this.chiave = dati?.chiave;
    raggi(this, 0x4a6ad8, 0x6a8af0);
    txt(this, 240, 18, 'IMPOSTAZIONI', { size: 16, color: '#ffe14a' });
    const I = () => Salvataggio.impostazioni;

    // le righe: tipo 'volume' (cursore), 'si' (sì/no), 'scelta' (tra più valori), 'bottoni'
    this.righe = [
      { tipo: 'volume', chiave: 'volumeMusica', eti: 'Musica', aiuto: 'Volume della musica' },
      { tipo: 'volume', chiave: 'volumeEffetti', eti: 'Effetti', aiuto: 'Volume degli effetti sonori' },
      { tipo: 'si', chiave: 'audio', eti: 'Audio', aiuto: perDito('Audio acceso o spento (anche col tasto M)', 'Audio acceso o spento (anche col pulsante in alto a destra)') },
      { tipo: 'si', chiave: 'vibrazione', eti: 'Vibrazione', aiuto: 'Colpi ed errori fanno vibrare il telefono (dove si può: Android sì, iPhone no)' },
      { tipo: 'scelta', chiave: 'difficolta', eti: 'Difficoltà di partenza', aiuto: 'Il livello di chi non l\'ha scelto (quello di ognuno: GIOCA, poi LIVELLI)' },
      { tipo: 'si', chiave: 'provaLampo', eti: 'Prova lampo', aiuto: 'Pochi secondi di prova prima di un microgioco mai visto (in arrivo)' },
      { tipo: 'scelta', chiave: 'velocitaTesti', eti: 'Velocità dei testi', aiuto: 'Quanto restano a schermo scritte e fumetti' },
      { tipo: 'si', chiave: 'tremolio', eti: 'Schermo che trema', aiuto: 'Il tremolio sui colpi: spegnilo se ti dà fastidio' },
      { tipo: 'ritardo', chiave: 'ritardoAudio', eti: 'Ritardo audio', aiuto: perDito('Con cuffie o casse Bluetooth il suono arriva in ritardo e i giochi a tempo di musica sembrano sbagliati. INVIO: lo misuro io (PROVA). SINISTRA/DESTRA: a mano', 'Con cuffie o casse Bluetooth il suono arriva in ritardo e i giochi a tempo di musica sembrano sbagliati. PROVA: lo misuro io. Le frecce: a mano') },
      { tipo: 'bottoni', eti: 'Salvataggio', bottoni: ['ESPORTA', 'IMPORTA', 'AZZERA'], aiuto: 'Il salvataggio come codice da copiare su un altro telefono, oppure da capo' },
      { tipo: 'esci', eti: this.ritorno === 'Pausa' ? 'TORNA ALLA PAUSA' : 'TORNA AL MENU', aiuto: '' },
    ];
    const Y0 = 44, PASSO = 17.5;
    pannello(this, 240, Y0 + (PASSO * (this.righe.length - 1)) / 2, 430, PASSO * this.righe.length + 8, { alfa: 0.6, bordo: null, raggio: 10 });
    this.evid = this.add.graphics();
    this.g = this.add.graphics().setDepth(2);
    this.righe.forEach((r, i) => {
      r.y = Y0 + i * PASSO;
      if (r.tipo === 'esci') r.testo = txt(this, 240, r.y, r.eti, { size: 8.5, depth: 3 });
      else r.testo = txt(this, X_ETI, r.y, r.eti, { size: 8, ox: 0, depth: 3 });
      if (r.tipo !== 'esci') r.valore = txt(this, X_COM, r.y, '', { size: 7.5, depth: 3 });
      if (r.tipo === 'ritardo') r.prova = txt(this, X_COM + 82, r.y, 'PROVA', { size: 7.5, depth: 3, color: '#ffe14a' });
      if (r.tipo === 'bottoni') {
        r.valore.destroy();
        r.pulsanti = r.bottoni.map((b, k) => txt(this, X_COM - 52 + k * 52, r.y, b, { size: 7, depth: 3, color: b === 'AZZERA' ? '#ff9a8a' : '#ffffff' }));
      }
      // zona di tocco della riga intera; dove tocca dice cosa fare (cursore, bottoni)
      this.add.rectangle(240, r.y, 430, PASSO, 0x000000, 0.001).setInteractive({ useHandCursor: true })
        .on('pointerover', (p) => { if (!p.wasTouch && this.sel !== i) { this.sel = i; this.disegna(); } })
        .on('pointerdown', (p) => { this.sel = i; this.tocca(i, this.cameras.main.getWorldPoint(p.x, p.y).x); });
    });
    this.aiuto = txt(this, 240, 238, '', { size: 6.5, color: '#fff3d6', wrap: 420 });
    txt(this, 240, 257, perDito('SU/GIÙ: scegli    SINISTRA/DESTRA: cambia    INVIO: conferma    ESC: esci', 'Tocca un comando per cambiarlo'), { size: 6.5, color: '#ffe14a' });
    this.sel = 0;
    this.attesaAzzera = 0;
    this.disegna();

    const kb = this.input.keyboard;
    kb.on('keydown-UP', () => { if (!dialogoAperto()) { this.sel = (this.sel - 1 + this.righe.length) % this.righe.length; Audio.sfx('muovi'); this.disegna(); } });
    kb.on('keydown-DOWN', () => { if (!dialogoAperto()) { this.sel = (this.sel + 1) % this.righe.length; Audio.sfx('muovi'); this.disegna(); } });
    kb.on('keydown-LEFT', () => this.cambia(-1));
    kb.on('keydown-RIGHT', () => this.cambia(1));
    for (const k of ['ENTER', 'SPACE']) kb.on('keydown-' + k, (e) => { if (!e.repeat && !dialogoAperto()) this.conferma(); });
    kb.on('keydown-ESC', () => { if (!dialogoAperto()) this.esci(); });
    if (eTouch()) pulsante(this, 16, 13, 'indietro', () => this.esci());
    pulsantiAngolo(this);
    // se un'impostazione cambia da fuori (tasto M, codice importato) la schermata si aggiorna
    const agg = () => this.disegna();
    window.addEventListener('impostazioni-cambiate', agg);
    this.events.once('shutdown', () => window.removeEventListener('impostazioni-cambiate', agg));
    this.I = I;
  }

  // ridisegna valori, cursori e la riga scelta
  disegna() {
    const I = Salvataggio.impostazioni, g = this.g;
    g.clear();
    this.righe.forEach((r, i) => {
      const scelta = i === this.sel;
      r.testo.setColor(scelta ? '#ffe14a' : '#ffffff');
      if (r.tipo === 'volume') {
        const v = I[r.chiave], x0 = X_COM - LARGO / 2;
        g.fillStyle(0x000000, 0.35); g.fillRoundedRect(x0, r.y - 3, LARGO, 6, 3);
        g.fillStyle(scelta ? 0xffe14a : 0x7dff9a, 1); if (v > 0.01) g.fillRoundedRect(x0, r.y - 3, LARGO * v, 6, 3);
        g.fillStyle(0xffffff, 1); g.fillCircle(x0 + LARGO * v, r.y, 4.5);
        g.lineStyle(1.2, 0x1f1430, 1); g.strokeCircle(x0 + LARGO * v, r.y, 4.5);
        r.valore.setText(Math.round(v * 100) + '%').setPosition(X_COM + LARGO / 2 + 16, r.y);
      } else if (r.tipo === 'si') {
        const on = !!I[r.chiave];
        g.fillStyle(on ? 0x3fae74 : 0x8a3a3a, 1); g.fillRoundedRect(X_COM - 22, r.y - 6.5, 44, 13, 6.5);
        g.fillStyle(0xffffff, 1); g.fillCircle(on ? X_COM + 15 : X_COM - 15, r.y, 5);
        r.valore.setText(on ? 'SÌ' : 'NO').setPosition(on ? X_COM - 5 : X_COM + 5, r.y);
      } else if (r.tipo === 'scelta') {
        const voci = SCELTE[r.chiave], k = Math.max(0, voci.findIndex(([v]) => v === I[r.chiave]));
        r.valore.setText(`<   ${voci[k][1]}   >`);
      } else if (r.tipo === 'ritardo') {
        r.valore.setText(`<   ${I.ritardoAudio ?? 0} ms   >`);
        const w = r.prova.width + 8;
        g.fillStyle(0x1f1430, 0.9); g.fillRoundedRect(r.prova.x - w / 2, r.y - 7, w, 14, 7);
        g.lineStyle(1, 0xffe14a, scelta ? 1 : 0.6); g.strokeRoundedRect(r.prova.x - w / 2, r.y - 7, w, 14, 7);
      } else if (r.tipo === 'bottoni') {
        r.pulsanti.forEach((t, k) => {
          const w = t.width + 8;
          g.fillStyle(k === 2 ? 0x7a1f2a : 0x1f1430, 0.9); g.fillRoundedRect(t.x - w / 2, r.y - 7, w, 14, 7);
          g.lineStyle(1, k === 2 ? 0xff9a8a : 0xffe14a, scelta ? 1 : 0.6); g.strokeRoundedRect(t.x - w / 2, r.y - 7, w, 14, 7);
        });
        r.pulsanti[2].setText(this.attesaAzzera > this.time.now ? 'SICURO?' : 'AZZERA');
      }
    });
    const r = this.righe[this.sel];
    this.evid.clear();
    this.evid.fillStyle(0xffe14a, 0.14); this.evid.fillRoundedRect(30, r.y - 8.5, 420, 17, 8);
    this.aiuto.setText(r.aiuto + (r.tipo === 'bottoni' && !Salvataggio.disponibile ? '\n(Questo browser non lascia salvare: in navigazione privata il gioco non ricorda niente.)' : ''));
  }

  // SINISTRA/DESTRA sulla riga scelta
  cambia(d) {
    if (dialogoAperto()) return;
    const r = this.righe[this.sel], I = Salvataggio.impostazioni;
    if (r.tipo === 'volume') this.metti(r.chiave, Phaser.Math.Clamp(Math.round((I[r.chiave] + d * 0.1) * 10) / 10, 0, 1));
    else if (r.tipo === 'si') this.metti(r.chiave, d > 0);
    else if (r.tipo === 'scelta') {
      const voci = SCELTE[r.chiave], k = voci.findIndex(([v]) => v === I[r.chiave]);
      this.metti(r.chiave, voci[Phaser.Math.Clamp(k + d, 0, voci.length - 1)][0]);
    } else if (r.tipo === 'ritardo') this.metti(r.chiave, Phaser.Math.Clamp((I[r.chiave] ?? 0) + d * 10, 0, 500));
    else if (r.tipo === 'bottoni') { this.selBottone = Phaser.Math.Clamp((this.selBottone ?? 0) + d, 0, 2); this.lampeggiaBottone(); }
  }

  // INVIO sulla riga scelta
  conferma() {
    const r = this.righe[this.sel], I = Salvataggio.impostazioni;
    if (r.tipo === 'si') this.metti(r.chiave, !I[r.chiave]);
    else if (r.tipo === 'scelta') {
      const voci = SCELTE[r.chiave], k = voci.findIndex(([v]) => v === I[r.chiave]);
      this.metti(r.chiave, voci[(k + 1) % voci.length][0]);
    } else if (r.tipo === 'bottoni') this.bottone(this.selBottone ?? 0);
    else if (r.tipo === 'ritardo') this.misuraRitardo();
    else if (r.tipo === 'esci') this.esci();
    else if (r.tipo === 'volume') this.metti(r.chiave, I[r.chiave] > 0 ? 0 : 0.8);
  }

  // un tocco (o clic) sulla riga i, alla x data
  tocca(i, x) {
    if (dialogoAperto()) return;
    const r = this.righe[i], I = Salvataggio.impostazioni;
    if (r.tipo === 'volume') {
      if (Math.abs(x - X_COM) <= LARGO / 2 + 8) this.metti(r.chiave, Phaser.Math.Clamp(Math.round(((x - (X_COM - LARGO / 2)) / LARGO) * 20) / 20, 0, 1));
      else this.disegna();
    } else if (r.tipo === 'scelta') {
      const voci = SCELTE[r.chiave], k = voci.findIndex(([v]) => v === I[r.chiave]);
      const d = x < X_COM - 20 ? -1 : 1;
      this.metti(r.chiave, voci[(k + d + voci.length) % voci.length][0]);
    } else if (r.tipo === 'ritardo') {
      if (x > X_COM + 55) this.misuraRitardo();
      else this.metti(r.chiave, Phaser.Math.Clamp((I[r.chiave] ?? 0) + (x < X_COM ? -10 : 10), 0, 500));
    } else if (r.tipo === 'bottoni') {
      const k = r.pulsanti.findIndex((t) => Math.abs(x - t.x) < t.width / 2 + 6);
      if (k >= 0) { this.selBottone = k; this.bottone(k); } else this.disegna();
    } else this.conferma();
  }

  metti(chiave, valore) {
    Salvataggio.imposta(chiave, valore);
    Audio.sfx(chiave === 'volumeEffetti' ? 'ok' : 'muovi');
    if (chiave === 'vibrazione' && valore) try { navigator.vibrate?.(60); } catch (e) { /* niente */ }
    if (chiave === 'tremolio' && valore) this.cameras.main.shake(120, 0.004);
    this.disegna();
  }

  lampeggiaBottone() {
    const t = this.righe.find((r) => r.tipo === 'bottoni').pulsanti[this.selBottone];
    Audio.sfx('muovi');
    this.tweens.add({ targets: t, scale: { from: 1.25, to: 1 }, duration: 160 });
  }

  // ESPORTA / IMPORTA / AZZERA
  bottone(k) {
    Audio.sfx('scegli');
    if (k === 0) {
      const codice = Salvataggio.esporta();
      dialogo({
        titolo: 'Esporta il salvataggio',
        testo: 'Copia questo codice e mandalo dove vuoi (per esempio su WhatsApp). Sull\'altro telefono: Impostazioni → Importa, e incollalo.',
        area: { valore: codice, solaLettura: true },
        pulsanti: [
          { testo: 'Copia', principale: true, azione: (_v, d) => { navigator.clipboard?.writeText(codice).then(() => d.messaggio('Copiato!'), () => d.messaggio('Selezionalo e copialo a mano.', true)); return false; } },
          { testo: 'Chiudi' },
        ],
      });
    } else if (k === 1) {
      dialogo({
        titolo: 'Importa un salvataggio',
        testo: 'Incolla qui il codice (comincia con PSP). Attenzione: sostituisce tutto quello che c\'è su questo dispositivo.',
        area: { valore: '', segnaposto: 'PSP1-...' },
        pulsanti: [
          { testo: 'Annulla' },
          { testo: 'Importa', principale: true, azione: (v, d) => {
            const esito = Salvataggio.importa(v);
            if (!esito.ok) { d.messaggio(esito.errore, true); return false; }
            Audio.sfx('bonus');
            this.time.delayedCall(50, () => this.disegna());
            return true;
          } },
        ],
      });
    } else {
      // doppia conferma: prima "SICURO?" sul bottone, poi la finestra
      if (this.attesaAzzera < this.time.now) {
        this.attesaAzzera = this.time.now + 3000;
        Audio.sfx('errore');
        this.disegna();
        this.time.delayedCall(3050, () => this.scene.isActive() && this.disegna());
        return;
      }
      this.attesaAzzera = 0;
      this.disegna();
      dialogo({
        titolo: 'Azzerare tutto?',
        testo: 'Si cancellano impostazioni, personaggi ricordati, punteggi, record, trofei e Pinte di questo dispositivo. Non si torna indietro.\n(Se vuoi tenerne una copia: annulla ed esporta prima il salvataggio.)',
        pulsanti: [
          { testo: 'Annulla', principale: true },
          { testo: 'AZZERA TUTTO', pericolo: true, azione: () => { Salvataggio.azzera(); Audio.sfx('sbam'); this.time.delayedCall(50, () => this.disegna()); } },
        ],
      });
    }
  }

  misuraRitardo() {
    Audio.sfx('scegli');
    this.scene.start('Ritardo', { ritorno: this.ritorno, chiave: this.chiave });
  }

  esci() {
    Audio.sfx('scegli');
    if (this.ritorno === 'Pausa') this.scene.start('Pausa', { chiave: this.chiave });
    else this.scene.start('Menu');
  }
}

// ------------------------------------------------------------
// La misura del ritardo audio: il gioco suona dei BIP a tempo, e si tocca (o si preme SPAZIO) a ogni
// BIP ascoltando, senza guardare. Il ritardo è la mediana tra quando il BIP parte e quando si tocca
// (i primi colpi non contano: servono a prendere il ritmo).
const BIP = { quanti: 16, ogni: 0.6, scarta: 3 };

export class RitardoScene extends Phaser.Scene {
  constructor() { super('Ritardo'); }

  create(dati) {
    inquadra(this);
    this.dati = dati;
    raggi(this, 0x4a6ad8, 0x6a8af0);
    txt(this, 240, 22, 'RITARDO AUDIO', { size: 16, color: '#ffe14a' });
    pannello(this, 240, 104, 400, 110, { alfa: 0.65, raggio: 10 });
    txt(this, 240, 72, perDito('Metti le cuffie (o le casse) che usi per giocare. Quando parte, premi SPAZIO a ogni BIP, a tempo: ascolta, non guardare lo schermo.',
      'Metti le cuffie (o le casse) che usi per giocare. Quando parte, tocca lo schermo a ogni BIP, a tempo: ascolta, non guardare lo schermo.'), { size: 8, wrap: 380 });
    this.stato = txt(this, 240, 128, perDito('INVIO: comincia', 'Tocca: comincia'), { size: 11, color: '#ffe14a' });
    this.conto = txt(this, 240, 190, '', { size: 9, color: '#fff3d6' });
    txt(this, 240, 256, perDito('ESC: torna alle impostazioni', 'La freccia in alto: torna alle impostazioni'), { size: 7, color: '#fff3d6' });
    this.fase = 'pronto';
    this.bip = [];
    this.tocchi = [];
    Audio.musica(null);                       // (senza musica, si sentono solo i BIP)
    const tocco = () => {
      if (this.fase === 'pronto') return this.parti();
      if (this.fase === 'misura') this.tocchi.push(performance.now());
      else if (this.fase === 'fatto') this.esci();
    };
    this.input.on('pointerdown', tocco);
    for (const k of ['SPACE', 'ENTER']) this.input.keyboard.on('keydown-' + k, (e) => { if (!e.repeat) tocco(); });
    this.input.keyboard.on('keydown-ESC', () => this.esci());
    if (eTouch()) pulsante(this, 16, 13, 'indietro', () => this.esci());
  }

  parti() {
    this.fase = 'misura';
    this.stato.setText('ASCOLTA... E TOCCA A OGNI BIP');
    for (let k = 0; k < BIP.quanti; k++) this.time.delayedCall(800 + k * BIP.ogni * 1000, () => {
      Audio.sfx('bip');
      this.bip.push(performance.now());
      this.conto.setText(`${k + 1} / ${BIP.quanti}`);
    });
    this.time.delayedCall(800 + BIP.quanti * BIP.ogni * 1000 + 500, () => this.calcola());
  }

  calcola() {
    // ogni tocco va col BIP che lo precede da 0,1 s prima fino a mezzo secondo dopo (i BIP sono a
    // 0,6 s l'uno dall'altro: ce n'è uno solo così). Un ritardo più lungo di mezzo secondo non si misura
    const d = [];
    for (const t of this.tocchi) {
      const b = this.bip.slice(BIP.scarta).find((x) => t - x >= -100 && t - x <= 500);
      if (b != null) d.push(t - b);
    }
    this.fase = 'fatto';
    if (d.length < 6) {
      this.fase = 'pronto';
      this.bip = []; this.tocchi = [];
      this.stato.setText(perDito('Troppo pochi tocchi a tempo: INVIO per riprovare', 'Troppo pochi tocchi a tempo: tocca per riprovare'));
      Audio.sfx('errore');
      return;
    }
    d.sort((a, b) => a - b);
    const mediana = d[Math.floor(d.length / 2)], ms = Phaser.Math.Clamp(Math.round(mediana / 10) * 10, 0, 500);
    Salvataggio.imposta('ritardoAudio', ms);
    Audio.sfx('bonus');
    this.stato.setText(`RITARDO: ${ms} ms`);
    scritta(this, 240, 158, ms >= 100 ? 'Le frecce e le note aspetteranno il suono' : 'Il suono arriva quasi subito', { size: 9, color: '#7dff9a', durata: 99999 }).setAngle(0);
    this.conto.setText(perDito('INVIO: torna alle impostazioni', 'Tocca: torna alle impostazioni'));
  }

  esci() {
    Audio.sfx('scegli');
    // la musica di prima: quella del menu, o del microgioco in pausa
    const id = this.dati?.chiave?.replace('mg_', '');
    Audio.musica(this.dati?.ritorno === 'Pausa' ? CONFIG.microgiochi[id]?.musica ?? 'gioco' : 'menu');
    this.scene.start('Impostazioni', { ritorno: this.dati?.ritorno, chiave: this.dati?.chiave });
  }
}
