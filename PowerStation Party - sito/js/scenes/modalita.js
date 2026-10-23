// Le schermate delle modalità della Fase 6 (config: js/config/modalita.js):
//  - FineSolitario: la fine della partita Da solo (vite finite, o boss battuto o no)
//  - FineLampo: la fine del Lampo da soli (i microgiochi coi punti, il totale e il record)
import { CONFIG } from '../config.js';
import { Audio } from '../audio.js';
import { Sessione } from '../sessione.js';
import { Progressi } from '../progressi.js';
import { normalizza } from '../punteggi.js';
import { SP, ritratto } from '../sprites.js';
import { txt, im, inquadra, raggi, pannello, ombra, stelle, scritta, scuoti, fumo, perDito, annunciaTrofei } from '../fx.js';
import { pulsantiAngolo } from './menu.js';

function attendi(scene, fn) {
  let fatto = false;
  const vai = (e) => { if (fatto || e?.repeat) return; fatto = true; Audio.sfx('scegli'); fn(); };
  scene.time.delayedCall(600, () => {
    for (const k of ['ENTER', 'SPACE']) scene.input.keyboard.on('keydown-' + k, vai);
    scene.input.on('pointerdown', () => vai());
  });
}

// ------------------------------------------------------------
// Il Lampo da soli: i microgiochi da 15 secondi coi loro punti sfida (come la Sfida del giorno), il
// totale e il migliore di sempre
export class FineLampoScene extends Phaser.Scene {
  constructor() { super('FineLampo'); }
  create() {
    inquadra(this);
    this.input.setDefaultCursor('default');
    const S = Sessione, g = S.giocatore;
    const punti = S.lista.reduce((t, id, i) => t + (S.risultati[i][g.i] ? normalizza(id, S.risultati[i][g.i].punteggio) : 0), 0);
    const esito = S.registrata ? this.registry.get('esitoLampo') : Progressi.dopoLampoSolo(punti);
    S.registrata = true;
    this.registry.set('esitoLampo', esito);
    Audio.musica('festa');
    raggi(this, 0xe0a028, 0xf6cc4a);
    Audio.sfx(esito.record ? 'vittoria' : 'ok');
    txt(this, 240, 20, 'LAMPO', { size: 18, color: '#ffe14a' });
    txt(this, 240, 38, `${S.lista.length} microgiochi da ${CONFIG.modalita.lampo.durata} secondi`, { size: 8 });
    ombra(this, 96, 224, 70);
    im(this, 96, 224, `${g.id}_felice`).setOrigin(0.5, 1).setScale(3.3 * SP);
    txt(this, 96, 238, g.nome.toUpperCase(), { size: 10, color: g.colore });
    pannello(this, 320, 139, 260, 166, { alfa: 0.65, raggio: 10 });
    S.lista.forEach((id, i) => {
      const r = S.risultati[i][g.i], y = 66 + i * 16;
      txt(this, 200, y, CONFIG.microgiochi[id].titolo, { size: 7, ox: 0, color: '#fff3d6' });
      txt(this, 440, y, r ? `${normalizza(id, r.punteggio)}` : '-', { size: 8, ox: 1 });
    });
    const yt = 66 + S.lista.length * 16 + 6;
    txt(this, 200, yt, 'TOTALE (punti sfida)', { size: 8, ox: 0, color: '#ffe14a' });
    const tot = txt(this, 440, yt, String(punti), { size: 11, ox: 1, color: '#ffe14a' });
    this.tweens.add({ targets: tot, scale: 1.25, duration: 300, yoyo: true, delay: 300 });
    txt(this, 320, yt + 18, `Il tuo record Lampo: ${esito.migliore} punti sfida`, { size: 7, color: '#fff3d6' });
    if (esito.record) this.time.delayedCall(500, () => scritta(this, 320, yt + 33, esito.primo ? 'PRIMO RECORD!' : 'NUOVO RECORD!', { size: 11, color: '#7dff9a', durata: 99999 }).setAngle(0));
    txt(this, 240, 258, perDito('INVIO: menu', 'Tocca: menu'), { size: 9, color: '#ffe14a' });
    attendi(this, () => this.scene.start('Menu'));
    pulsantiAngolo(this);
  }
}

// ------------------------------------------------------------
export class FineSolitarioScene extends Phaser.Scene {
  constructor() { super('FineSolitario'); }
  create() {
    inquadra(this);
    this.input.setDefaultCursor('default');
    const S = Sessione, g = S.giocatore, R = S.solitario, C = CONFIG.modalita.solitario;
    const vinto = R.boss === 'vinto';
    Audio.musica(vinto ? 'festa' : 'menu');
    raggi(this, vinto ? 0x3fae74 : 0x8a5a9a, vinto ? 0x62cf96 : 0xa878b8);
    Audio.sfx(vinto ? 'vittoria' : 'sconfitta');
    txt(this, 240, 22, vinto ? 'BOSS BATTUTO!' : R.vite <= 0 ? 'VITE FINITE!' : 'IL BOSS HA VINTO!', { size: 20, color: vinto ? '#ffe14a' : '#ffb0a4' });
    ombra(this, 100, 220, 70);
    im(this, 100, 220, `${g.id}_${vinto ? 'felice' : 'triste'}`).setOrigin(0.5, 1).setScale(3.4 * SP);
    txt(this, 100, 234, g.nome.toUpperCase(), { size: 10, color: g.colore });
    // il conto: microgiochi superati, punti sfida, record
    const giocati = S.risultati.filter((r) => r[0]).length;
    const punti = S.risultati.reduce((t, r, i) => t + (r[0] ? normalizza(S.lista[i], r[0].punteggio) : 0), 0);
    const st = Progressi.statistiche;
    const record = punti > (st.solitario ?? 0);
    if (record) st.solitario = punti;
    let pinte = 0;
    if (!R.registrata) {
      R.registrata = true;
      if (vinto) { pinte = C.pinteBoss; annunciaTrofei(this, Progressi.regala(pinte), 1500); }
    }
    pannello(this, 320, 120, 260, 120, { alfa: 0.65, raggio: 10 });
    const righe = [
      ['Microgiochi giocati', `${giocati} di ${S.lista.length}`],
      ['Superati (con una medaglia)', String(R.superati)],
      ['Vite rimaste', String(Math.max(0, R.vite))],
      ['Punti sfida', String(punti)],
    ];
    righe.forEach(([a, b], k) => { txt(this, 202, 78 + k * 18, a, { size: 8, ox: 0, color: '#ffe14a' }); txt(this, 440, 78 + k * 18, b, { size: 9, ox: 1 }); });
    if (record) this.time.delayedCall(600, () => scritta(this, 320, 160, 'NUOVO RECORD!', { size: 13, color: '#7dff9a', durata: 99999 }).setAngle(0));
    if (pinte) txt(this, 320, 176, `+${pinte} PINTE per il boss`, { size: 7.5, color: '#ffe14a' });
    if (vinto) this.time.addEvent({ delay: 400, loop: true, callback: () => stelle(this, 100 + (Math.random() - 0.5) * 120, 90 + Math.random() * 60, 5) });
    txt(this, 320, 196, `Il tuo record: ${Math.max(st.solitario ?? 0, punti)} punti sfida`, { size: 7, color: '#fff3d6' });
    txt(this, 240, 256, perDito('INVIO: menu', 'Tocca: menu'), { size: 9, color: '#ffe14a' });
    attendi(this, () => this.scene.start('Menu'));
    pulsantiAngolo(this);
  }
}

