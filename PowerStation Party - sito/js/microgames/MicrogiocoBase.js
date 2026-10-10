// ============================================================
//  INTERFACCIA COMUNE DEI MICROGIOCHI
//
//  Ogni microgioco estende MicrogiocoBase e implementa:
//    prepara()            -> crea sfondo, sprite, input (una volta, all'inizio)
//    aggiorna(dt, p)      -> logica per frame. dt = secondi, p = avanzamento 0..1
//    risultato()          -> { punteggio, vittoria, riepilogo, titoloFine? }
//  Facoltativi:
//    finale(ris, fatto)   -> animazione conclusiva; chiamare fatto() alla fine
//    pulisci()            -> chiamato quando la scena si chiude
//    alRientro()          -> chiamato quando si riprende dopo una pausa: azzera dita e
//                            pulsanti "tenuti premuti" (il rilascio, in pausa, non arriva)
//
//  La base gestisce: inquadratura, timer, barra del tempo, punteggio da battere,
//  pausa con ESC (sul telefono: pulsanti pausa e audio in alto a destra), musica che
//  accelera, passaggio alla schermata dei risultati.
//  Per chiudere in anticipo il microgioco basta chiamare this.termina().
//  Le coordinate sono in unità logiche: lo schermo è 480x270.
// ============================================================
import { CONFIG } from '../config.js';
import { Audio } from '../audio.js';
import { Sessione } from '../sessione.js';
import { txt, scritta, inquadra, eTouch, pulsante } from '../fx.js';

export class MicrogiocoBase extends Phaser.Scene {
  constructor(id) {
    super('mg_' + id);
    this.id = id;
  }

  get cfg() { return CONFIG.microgiochi[this.id]; }
  get progresso() { return Phaser.Math.Clamp(this.trascorso / this.durata, 0, 1); }
  get tempoRimasto() { return Math.max(0, this.durata - this.trascorso); }

  init() {
    this.giocatore = Sessione.giocatore;
    this.durata = this.cfg.durata;
    this.oraVera = 0;
    this.trascorso = 0;
    this.inCorso = false;
    this.finito = false;
  }

  create() {
    inquadra(this);
    this.prepara();
    this.creaHud();
    this.input.keyboard.on('keydown-ESC', () => this.pausa());
    // Durante la pausa la scena non riceve i rilasci di dita e mouse: al rientro ogni
    // microgioco azzera (in alRientro) quello che credeva ancora premuto. I tasti li azzera Phaser.
    const rientro = () => this.alRientro?.();
    this.events.on('resume', rientro);
    this.events.once('shutdown', () => { this.events.off('resume', rientro); Audio.versaFine(); Audio.tempo(1); this.pulisci?.(); });
    Audio.musica(this.cfg.musica ?? 'gioco');   // (Petri Tentacolari ha la sua musica da disco)
    this.cameras.main.fadeIn(150);
    this.inCorso = true;
  }

  creaHud() {
    this.barra = this.add.graphics().setDepth(1001);
    this.testoTempo = txt(this, 474, 22, '', { ox: 1, depth: 1001, size: 10 });
    txt(this, 6, 22, this.giocatore.nome.toUpperCase(), { ox: 0, depth: 1001, size: 10, color: this.giocatore.colore });
    // nella sfida, chi gioca per secondo vede il punteggio da battere
    const db = Sessione.daBattere;
    if (db) txt(this, 6, 35, `DA BATTERE: ${db.punteggio}  (${Sessione.avversario.nome})`, { ox: 0, depth: 1001, size: 7, color: '#ffe14a' });
    // sul telefono non ci sono ESC e M: pulsanti a schermo, accanto al tempo
    if (eTouch()) {
      this.pulsanti = [pulsante(this, 438, 22, 'pausa', () => this.pausa()), pulsante(this, 416, 22, 'audio', () => Audio.silenzia())];
    }
    this.disegnaBarra();
  }

  disegnaBarra() {
    const r = this.tempoRimasto, g = this.barra, w = 468 * (r / this.durata);
    g.clear();
    g.fillStyle(0x1f1430, 0.9); g.fillRoundedRect(4, 3, 472, 9, 4.5);
    g.fillStyle(r < 10 ? 0xf87171 : r < 20 ? 0xfacc15 : 0x4ade80);
    if (w > 1) g.fillRoundedRect(6, 5, w, 5, Math.min(2.5, w / 2));
    this.testoTempo.setText(Math.ceil(r) + 's');
  }

  update(ora, delta) {
    // orologio vero del fotogramma (ms). "delta" invece è una media degli ultimi fotogrammi:
    // va bene per muovere le cose, non per misurare la velocità di un gesto
    this.oraVera = ora;
    if (!this.inCorso) return;
    const dt = Math.min(delta, 50) / 1000;
    this.trascorso += dt;
    this.aggiorna(dt, this.progresso);
    this.disegnaBarra();
    Audio.tempo(1 + this.progresso * 0.3);
    if (this.trascorso >= this.durata) this.termina();
  }

  pausa() {
    if (!this.inCorso) return;
    Audio.versaFine();
    this.scene.launch('Pausa', { chiave: this.scene.key });
    this.scene.pause();
  }

  termina() {
    if (this.finito) return;
    this.finito = true;
    this.inCorso = false;
    this.pulsanti?.forEach((b) => b.setVisible(false));
    Audio.versaFine();
    const ris = this.risultato();
    const fatto = () => this.scene.start('Risultato', { risultato: ris });
    if (this.finale) this.finale(ris, fatto);
    else {
      Audio.sfx('tempo');
      scritta(this, 240, 120, ris.titoloFine ?? 'TEMPO!', { size: 32, durata: 1100, color: '#ffffff' });
      this.time.delayedCall(1500, fatto);
    }
  }
}
