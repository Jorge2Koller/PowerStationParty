// ============================================================
//  INTERFACCIA COMUNE DEI MICROGIOCHI
//
//  Ogni microgioco estende MicrogiocoBase e implementa:
//    prepara()            -> crea sfondo, sprite, input (una volta, all'inizio)
//    aggiorna(dt, p)      -> logica per frame. dt = secondi, p = avanzamento 0..1
//    risultato()          -> { punteggio, vittoria, riepilogo, titoloFine?, titoli? }
//                            vittoria è la condizione del microgioco; poi la base applica la regola
//                            unica: con la medaglia (bronzo o meglio) hai vinto, senza hai perso.
//                            titoli: [se vinci, se perdi] al posto di titoloFine
//  Facoltativi:
//    finale(ris, fatto)   -> animazione conclusiva; chiamare fatto() alla fine
//    pulisci()            -> chiamato quando la scena si chiude
//    alRientro()          -> chiamato quando si riprende dopo una pausa: azzera dita e
//                            pulsanti "tenuti premuti" (il rilascio, in pausa, non arriva)
//
//  La base gestisce: inquadratura, timer, barra del tempo, punteggio da battere,
//  pausa con ESC (sul telefono: pulsanti pausa e audio in alto a destra), la musica nei tre
//  atti (js/config/musiche.js), passaggio alla schermata dei risultati.
//  Per chiudere in anticipo il microgioco basta chiamare this.termina().
//  La prova (Sessione.prova, dall'Intro): una partita come quella vera ma con un seme diverso, che
//  non conta; quando finisce ricomincia, finché chi gioca non preme PRONTO (il pulsante in alto a
//  sinistra, o ESC). Poi si torna all'Intro, che parte subito col conto alla rovescia.
//  Le coordinate sono in unità logiche: lo schermo è 480x270.
// ============================================================
import { CONFIG } from '../config.js';
import { Audio } from '../audio.js';
import { Sessione } from '../sessione.js';
import { Salvataggio } from '../salvataggio.js';
import { livellato } from '../livelli.js';
import { medaglia } from '../punteggi.js';
import { preparaGiocatore, GRUPPI_MICROGIOCHI } from '../sprites.js';
import { usaGruppi } from '../grafica/base.js';
import { txt, scritta, inquadra, eTouch, perDito, pulsantePausa } from '../fx.js';

// ?foto (con ?prova=id): niente barra del tempo, nome e pulsante della pausa, per le foto delle
// anteprime nella lista dei microgiochi (strumenti/anteprime.py)
const FOTO = new URLSearchParams(location.search).has('foto');

export class MicrogiocoBase extends Phaser.Scene {
  constructor(id) {
    super('mg_' + id);
    this.id = id;
  }

  // la configurazione al livello di chi gioca (FACILE, NORMALE, DIFFICILE: js/livelli.js)
  get cfg() { return this._cfg ?? CONFIG.microgiochi[this.id]; }
  get progresso() { return Phaser.Math.Clamp(this.trascorso / this.durata, 0, 1); }
  get tempoRimasto() { return Math.max(0, this.durata - this.trascorso); }

  init() {
    // Chi gioca, com'è dentro il microgioco: this.giocatore.id è il nome dei suoi sprite
    // (id_normale, id_felice...). Se gioca contro se stesso è il doppione travestito.
    this.giocatore = Sessione.inScena;
    this.livello = Sessione.livello;
    this._cfg = livellato(CONFIG.microgiochi[this.id], this.livello);
    preparaGiocatore(this, Sessione.giocatore.id, Sessione.controSeStesso);
    this.prova = !!Sessione.prova;
    Sessione.prova = false;   // (vale per questa partita sola)
    Sessione.semeProva = this.prova ? (Math.random() * 2 ** 32) >>> 0 : null;
    this.esceDallaProva = false;
    this.durata = Sessione.tipo === 'lampo' ? CONFIG.modalita.lampo.durata : this.cfg.durata;
    this.oraVera = 0;
    this.trascorso = 0;
    this.inCorso = false;
    this.finito = false;
  }

  create() {
    inquadra(this);
    // le immagini di questo microgioco (sfondo e compagnia): si creano adesso, e si buttano quelle
    // del microgioco di prima (vedi gruppoPigro in grafica/base.js)
    usaGruppi(this, GRUPPI_MICROGIOCHI[this.id] ?? []);
    this.prepara();
    this.creaHud();
    this.input.keyboard.on('keydown-ESC', () => (this.prova ? this.pronto() : this.pausa()));
    // Durante la pausa la scena non riceve i rilasci di dita e mouse: al rientro ogni
    // microgioco azzera (in alRientro) quello che credeva ancora premuto. I tasti li azzera Phaser.
    const rientro = () => this.alRientro?.();
    this.events.on('resume', rientro);
    // (il seme della prova vale solo dentro la prova: se ne riprende un altro, lo rimette init)
    this.events.once('shutdown', () => { this.events.off('resume', rientro); Audio.versaFine(); Audio.tempo(1); Sessione.semeProva = null; this.pulisci?.(); });
    Audio.musica(this.cfg.musica ?? 'gioco');   // (Petri Tentacolari ha la sua musica da disco)
    this.cameras.main.fadeIn(150);
    this.inCorso = true;
    if (this.prova) scritta(this, 240, 135, 'PROVA!\nNON CONTA', { size: 20, color: '#ff9ac4', durata: 1300 });
  }

  creaHud() {
    this.barra = this.add.graphics().setDepth(1001);
    if (FOTO) { this.testoTempo = txt(this, -100, -100, ''); this.barra.setVisible(false); return; }
    this.testoTempo = txt(this, 474, 22, '', { ox: 1, depth: 1001, size: 10 });
    if (this.prova) this.pulsantePronto();
    else txt(this, 6, 22, this.giocatore.nome.toUpperCase(), { ox: 0, depth: 1001, size: 10, color: this.giocatore.colore });
    // nella sfida, chi non gioca per primo vede il record del round finora
    const rec = Sessione.record;
    if (rec) txt(this, 6, 35, `RECORD: ${rec.punteggio}  (${rec.giocatore.nome})`, { ox: 0, depth: 1001, size: 7, color: '#ffe14a' });
    // sul telefono non c'è ESC: il pulsante della pausa, un po' staccato dal tempo, col doppio
    // tocco (vedi pulsantePausa). L'audio si cambia dalla pausa (là c'è il pulsante) e dalle Impostazioni.
    if (eTouch()) this.pulsanti = pulsantePausa(this, 422, 22, () => this.pausa());
    this.disegnaBarra();
  }

  // nella prova, al posto del nome: il pulsante PRONTO! (anche ESC, come lo START dei vecchi giochi)
  pulsantePronto() {
    const g = this.add.graphics().setDepth(1001), t = txt(this, 43, 23.5, perDito('PRONTO! (ESC)', 'PRONTO!'), { size: 7.5, depth: 1002 });
    g.fillStyle(0x000000, 0.3); g.fillRoundedRect(5.5, 16.5, 76, 16, 8);
    g.fillStyle(0xff5fa2, 1); g.fillRoundedRect(4, 15, 78, 17, 8.5);
    g.lineStyle(1.4, 0xffffff, 1); g.strokeRoundedRect(4, 15, 78, 17, 8.5);
    this.tweens.add({ targets: t, scale: 1.04, duration: 450, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    // (il tocco sul pulsante non arriva al microgioco)
    this.add.zone(43, 23.5, 84, 24).setDepth(1003).setInteractive({ useHandCursor: true })
      .on('pointerdown', (_p, _x, _y, ev) => { ev.stopPropagation(); this.pronto(); });
    txt(this, 6, 39, 'PROVA: NON CONTA', { ox: 0, depth: 1001, size: 6.5, color: '#ff9ac4' });
  }

  // fine della prova: si torna all'Intro, che parte subito col conto alla rovescia
  pronto() {
    if (!this.prova || this.esceDallaProva) return;
    this.esceDallaProva = true;
    this.finito = true;
    this.inCorso = false;
    Audio.versaFine();
    Audio.musica(null);
    Audio.sfx('scegli');
    Sessione.semeProva = null;
    Sessione.dopoProva = `${Sessione.seme}:${Sessione.passo}`;
    scritta(this, 240, 120, 'PRONTO!', { size: 28, durata: 600, color: '#7dff9a', depth: 1100 });
    this.time.delayedCall(450, () => this.scene.start('Intro'));
  }

  disegnaBarra() {
    const r = this.tempoRimasto, g = this.barra, w = 468 * (r / this.durata);
    g.clear();
    g.fillStyle(0x1f1430, 0.9); g.fillRoundedRect(4, 3, 472, 9, 4.5);
    g.fillStyle(this.prova ? 0xff9ac4 : r < 10 ? 0xf87171 : r < 20 ? 0xfacc15 : 0x4ade80);
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
    // la musica: un microgioco a ritmo decide lui il tempo (tempoMusica); le musiche nuove crescono nei
    // tre atti (un terzo del tempo l'uno) e negli ultimi 5 secondi la batteria fa il riempimento; le
    // altre (il Passaseo) accelerano verso la fine, come prima
    if (this.tempoMusica) Audio.tempo(this.tempoMusica());
    else if (Audio.conAtti) Audio.atto(1 + Math.floor(this.progresso * 3), this.tempoRimasto <= 5);
    else Audio.tempo(1 + this.progresso * 0.3);
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
    Audio.musica(null);   // la musica si spegne subito: il finale ha i suoi suoni e il jingle
    if (this.prova) {
      // la prova è finita ma non si esce: ricomincia (con un'altra partita), finché non si preme PRONTO
      Audio.sfx('tempo');
      scritta(this, 240, 120, 'ANCORA!', { size: 28, durata: 900, color: '#ff9ac4', depth: 1100 });
      this.time.delayedCall(1100, () => { if (!this.esceDallaProva) { Sessione.prova = true; this.scene.restart(); } });
      return;
    }
    const ris = this.risultato();
    // Regola unica per tutti: il bronzo è la soglia della vittoria (con la medaglia vinci, senza
    // perdi). La condizione del microgioco resta in ris.condizione (le prove la confrontano con la
    // medaglia). In Lampo i microgiochi durano meno e le medaglie non contano: decide la condizione.
    ris.condizione = !!ris.vittoria;
    if (Sessione.tipo !== 'lampo' && CONFIG.microgiochi[this.id]?.medaglie) ris.vittoria = !!medaglia(this.id, ris.punteggio);
    if (ris.titoli) ris.titoloFine = ris.titoli[ris.vittoria ? 0 : 1];
    const fatto = () => this.scene.start('Risultato', { risultato: ris });
    if (this.finale) this.finale(ris, fatto);
    else {
      Audio.sfx('tempo');
      scritta(this, 240, 120, ris.titoloFine ?? 'TEMPO!', { size: 32, durata: 1100, color: '#ffffff' });
      this.time.delayedCall(1500, fatto);
    }
  }
}
