// Microgioco 16: "Beer Pong al Pallaio" - contro i veterani del Pallaio (lo Zio e Marsupino). TIRA!
//
//  Si tira ai 10 bicchieri dei veterani (finiti quelli, ne rimettono 6, con un bonus); intanto loro
//  tirano ai tuoi a ritmo regolare. Ogni bicchiere che ti centrano lo bevi: la sbronza sale
//  (allegro, brillo, sbronzo) e mirare diventa un'impresa. Anche loro bevono i bicchieri che gli
//  centri, e più bevono meno centrano. Se resti senza bicchieri finisce prima. Quando Marsupino
//  sbaglia un tiro, se la prende con Greg che gli sta accanto: SCIAF! (js/beerpong/schiaffo.js).
//  Il tavolo, il tiro, la sbronza, le gag e le reazioni sono gli stessi della modalità BEER PONG
//  (js/beerpong/): qui ci sono solo i veterani, i punti e i tre atti.
//  I tiri dei veterani escono dal seme del round: uguali per tutti i giocatori.
import { MicrogiocoBase } from './MicrogiocoBase.js';
import { CONFIG } from '../config.js';
import { Audio } from '../audio.js';
import { Sessione } from '../sessione.js';
import { casuale } from '../grafica/base.js';
import { livellato } from '../livelli.js';
import { FACCE_SBRONZA } from '../sprites.js';
import { txt, scritta, fumetto, caso, scuoti, puntiHud, numero, quanti } from '../fx.js';
import { Tavolo } from '../beerpong/tavolo.js';
import { Schiaffo } from '../beerpong/schiaffo.js';
import { triangolo, livelloSbronza } from '../beerpong/motore.js';

const tra = ([a, b], r) => a + r() * (b - a);
const rastrelliera = (n) => triangolo(n).map((b) => ({ ...b, su: true }));

export class BeerpongScene extends MicrogiocoBase {
  constructor() { super('beerpong'); }

  get atto() { return this.cfg.atti.filter((a) => this.trascorso >= a.da).pop(); }

  prepara() {
    const c = this.cfg, seme = Sessione.seme;
    this.rnd = casuale(seme);
    // (i disturbi di Marsupino hanno il loro generatore, sempre dal seme del round: così non
    // dipendono da quante volte hanno tirato i veterani)
    this.rndDisturbi = casuale((seme ^ 0x3d15b0) >>> 0);
    // il tiro al livello di chi gioca (FACILE: anteprima più lunga e bordo che perdona...)
    this.motore = livellato(CONFIG.beerpong, this.livello);
    this.punti = 0;
    this.tolti = 0;          // bicchieri tolti ai veterani
    this.persi = 0;          // bicchieri miei centrati (e bevuti)
    this.nAtto = 0;
    this.tVet = c.primoTiro; // tra quanto tirano i veterani
    this.kVet = 0;           // a chi dei due tocca
    this.tDisturbo = tra(c.disturbo.ogni, this.rndDisturbi);
    this.tNuovi = 0;         // tra quanto arriva il triangolo nuovo
    this.hud = null;         // (la scena viene riusata: il testo dell'HUD va riscritto da capo)
    this.mieiBic = rastrelliera(c.bicchieriMiei);
    this.loroBic = rastrelliera(c.bicchieriVeterani);

    // (Greg sta accanto a Marsupino per prendersi gli schiaffi: non fa anche lo spettatore)
    const sc = c.schiaffo, io = this.giocatore.id.replace('Bis', '');
    this.T = new Tavolo(this, {
      cfg: this.motore, peso: c.sbronzaPeso, rnd: this.rnd, musica: c.musica ?? 'gioco',
      escludi: [io, ...c.veterani, ...(sc ? [sc.a] : [])],
      suEsito: (e) => this.esito(e),
    });
    this.T.imposta({ tiratore: this.giocatore, avversari: c.veterani, lontani: this.loroBic, vicini: this.mieiBic });
    this.T.attivo = true;
    // lo schiaffo di Marsupino (se gioca Greg, lo prende il suo ritratto)
    const m = sc && this.T.avv.find((a) => a.id === sc.chi);
    this.schiaffo = m ? new Schiaffo(this.T, sc, m, io === sc.a) : null;

    this.testoPunti = txt(this, 474, 36, '', { ox: 1, depth: 1001, size: 9 });
    this.testoConto = txt(this, 474, 49, '', { ox: 1, depth: 1001, size: 7, color: '#ffe14a' });
  }

  alRientro() { this.T.alRientro(); }
  pulisci() { this.T?.ferma(); }

  aggiorna(dt) {
    const c = this.cfg, T = this.T;
    // al rallentatore (l'ultimo bicchiere) rallenta anche il tempo del microgioco
    const d = dt * T.lento;
    if (T.lento < 1) this.trascorso -= dt - d;
    // gli atti si annunciano
    const A = this.atto, n = c.atti.indexOf(A);
    if (n !== this.nAtto) {
      this.nAtto = n;
      if (A.nome) { Audio.sfx('bonus'); scritta(this, 240, 92, A.nome, { size: 14, color: '#ffe14a', durata: 1000, depth: 950 }); }
    }
    // i veterani tirano a ritmo
    this.tVet -= d;
    if (this.tVet <= 0) {
      this.tVet = A.ogni * (0.85 + this.rnd() * 0.3);
      this.veteraniTirano(A);
    }
    // nell'ultimo atto Marsupino disturba
    if (A.disturbo) {
      this.tDisturbo -= d;
      if (this.tDisturbo <= 0) { this.tDisturbo = tra(c.disturbo.ogni, this.rndDisturbi); this.disturba(); }
    }
    // il triangolo nuovo
    if (this.tNuovi > 0) {
      this.tNuovi -= d;
      if (this.tNuovi <= 0) { this.loroBic = rastrelliera(c.bicchieriDopo); T.nuoviLontani(this.loroBic); T.attivo = true; Audio.sfx('ricarica'); }
    }
    T.aggiorna(dt);

    const hud = `${this.punti}|${this.tolti}|${this.persi}`;
    if (hud !== this.hud) {
      this.hud = hud;
      this.testoPunti.setText(puntiHud(this.punteggio));
      this.testoConto.setText(`TOLTI: ${this.tolti}   PERSI: ${this.persi}`);
    }
  }

  // quanto sono sbronzi i veterani (bevono i bicchieri che gli centri)
  get sbronzaVeterani() { return livelloSbronza(this.tolti, this.cfg.bicchieriVeterani, this.motore.sbronza.soglie); }

  veteraniTirano(A) {
    const c = this.cfg, q = A.precisione * (c.caloVeterani[this.sbronzaVeterani] ?? 1), r = this.rnd();
    const voglio = r < q ? 'centro' : r < q + (1 - q) * c.bordoVeterani ? 'bordo' : 'fuori';
    this.T.avversarioTira(this.kVet++, voglio);
  }

  // Marsupino fa il suo numero proprio mentre miri: la mira sobbalza
  disturba() {
    const c = this.cfg, T = this.T, m = T.avv.find((a) => a.id === 'marsupino') ?? T.avv[T.avv.length - 1];
    if (!m || !T.attivo) return;
    // mentre sta schiaffeggiando Greg ha da fare: il disturbo slitta di un attimo (se no i due
    // fumetti si coprono sopra la sua testa)
    if (this.schiaffo?.occupato) { this.tDisturbo = Math.min(this.tDisturbo, 0.6); return; }
    const furioso = m.id === 'marsupino' && this.textures.exists('marsupino_rabbia');
    if (furioso) m.img.setTexture('marsupino_rabbia');
    fumetto(this, m.x + 24, m.img.y - m.alto - 2, caso(c.disturbo.frasi), 900, 920);
    Audio.sfx('ruggito');
    scuoti(this, 160, 0.006);
    T.sobbalzo(c.disturbo.forza * c.sbronzaPeso, null);
    this.tweens.add({ targets: m.img, scaleX: m.img.scaleX * 1.12, scaleY: m.img.scaleY * 0.92, duration: 110, yoyo: true, repeat: 1 });
    if (furioso) this.time.delayedCall(800, () => { if (this.inCorso) m.img.setTexture(`marsupino_${FACCE_SBRONZA[T.sbronzaAvv]}`); });
  }

  esito(e) {
    if (!this.inCorso) return;
    const c = this.cfg, T = this.T, S = this.motore.sbronza;
    const preso = e.tipo === 'centro' || e.tipo === 'rimbalzo';
    // Marsupino ha sbagliato: se la prende con Greg
    if (!preso && e.chi === 'loro' && e.tiratore === c.schiaffo?.chi) this.schiaffo?.dai();
    if (!preso) return;
    if (e.chi === 'io') {
      this.tolti++;
      const pt = (e.tipo === 'rimbalzo' ? c.puntiRimbalzo : c.puntiCentro) + (e.fiamme ? c.bonusFiamme : 0);
      this.punti += pt;
      scritta(this, 396, 66, `+${pt}`, { size: 12, color: '#7dff9a', durata: 500, depth: 1002 }).setAngle(0);
      // i veterani bevono: più bevono, meno centrano
      const liv = this.sbronzaVeterani;
      if (liv !== T.sbronzaAvv) {
        T.setSbronzaAvv(liv);
        scritta(this, 240, 58, `I VETERANI: ${S.nomiTanti[liv]}`, { size: 9, color: S.colori[liv], durata: 900, depth: 950 }).setAngle(0);
      }
      if (T.inPiedi === 0) {
        // triangolo finito: bonus, e ne rimettono uno
        this.punti += c.bonusTriangolo;
        T.attivo = false;
        this.tNuovi = 0.7;
        Audio.sfx('conquista');
        scritta(this, 240, 118, `TRIANGOLO FINITO! +${c.bonusTriangolo}`, { size: 13, color: '#7dff9a', durata: 900, depth: 951 });
      }
    } else {
      this.persi++;
      const liv = livelloSbronza(this.persi, c.bicchieriMiei, S.soglie);
      if (liv > T.sbronza) {
        T.setSbronza(liv);
        scritta(this, 240, 176, `SEI ${S.nomi[liv]}!`, { size: 14, color: S.colori[liv], durata: 900, depth: 951 });
      }
      if (T.mieiInPiedi === 0) this.termina();   // senza bicchieri: finisce prima
    }
  }

  // Il punteggio è la partita coi veterani: a pari bicchieri vale puntiPari, poi ogni bicchiere
  // tolto (coi suoi bonus) aggiunge e ogni bicchiere perso toglie. Così "togline più di quanti te
  // ne tolgono" è proprio il bronzo (un bicchiere di vantaggio = 100), comunque tirino loro.
  get punteggio() { const c = this.cfg; return Math.max(0, c.puntiPari + this.punti - this.persi * c.puntiPerso); }

  risultato() {
    const inPiedi = this.T.mieiInPiedi;
    return {
      punteggio: this.punteggio,
      vittoria: this.tolti > this.persi,
      riepilogo: `Bicchieri tolti: ${this.tolti}   persi: ${this.persi}`,
      titoloFine: inPiedi === 0 ? 'A SECCO!' : 'TEMPO!',
    };
  }

  // i veterani la prendono male, oppure brindano
  finale(ris, fatto) {
    const c = this.cfg, T = this.T, secco = T.mieiInPiedi === 0;
    T.ferma();
    this.schiaffo?.finale(ris.vittoria);
    for (const o of [this.testoPunti, this.testoConto]) o.setVisible(false);
    Audio.sfx(secco ? 'sconfitta' : 'tempo');
    scritta(this, 240, 104, ris.titoloFine, { size: 30, color: '#ffffff', durata: 900, depth: 960 });
    this.time.delayedCall(700, () => {
      txt(this, 240, 30, ris.vittoria ? 'I VETERANI BEVONO!' : secco ? 'TI HANNO LASCIATO A SECCO!' : 'VINCONO I VETERANI!', { size: 15, color: ris.vittoria ? '#7dff9a' : '#ff9a8a', depth: 960 });
      Audio.sfx(ris.vittoria ? 'vittoria' : 'tsk');
      T.avv.forEach((a, i) => {
        const giu = ris.vittoria ? (a.id === 'marsupino' && this.textures.exists('marsupino_rabbia') ? 'marsupino_rabbia' : `${a.id}_triste`) : `${a.id}_felice`;
        a.img.setAngle(0).setTexture(giu);
        if (!ris.vittoria) this.tweens.add({ targets: a.img, y: a.img.y - 8, duration: 220, yoyo: true, repeat: 3, delay: i * 90 });
      });
      const chi = T.avv[0];
      if (chi) fumetto(this, chi.x - 6, chi.img.y - chi.alto - 2, caso(ris.vittoria ? c.frasiVittoria : c.frasiSconfitta), 1600, 961);
      T.faccia(ris.vittoria ? 'felice' : undefined);
    });
    this.time.delayedCall(2800, fatto);
  }
}
