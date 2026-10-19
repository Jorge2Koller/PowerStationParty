// BEER PONG: lo schiaffo di Marsupino. Quando Marsupino sbaglia un tiro se la prende con Greg, che
// gli sta accanto in fondo al tavolo: si gira, carica la manata e SCIAF!, Greg barcolla con le
// stelline che gli girano intorno alla testa e la guancia rossa (scheda di valutazione: "quando
// Marsupino sbaglia, deve dare uno schiaffo a Greg"). Se Greg è chi gioca (visto da dietro, quindi
// accanto a Marsupino non c'è), lo schiaffo arriva al suo ritratto. È solo di contorno: il gioco
// intanto va avanti. Numeri e frasi: blocco "schiaffo" in js/config/microgiochi/beerpong.js.
//
//  Chi lo usa (il microgioco, js/microgames/BeerpongScene.js):
//    const sc = new Schiaffo(T, cfg, chi);   // T = il tavolo, chi = l'avversario che schiaffeggia
//    sc.dai();                               // a ogni tiro sbagliato di Marsupino
//    sc.finale(vittoria);                    // la reazione di Greg alla fine
import { Audio } from '../audio.js';
import { tela } from '../grafica/base.js';
import { PERSONAGGI } from '../grafica/personaggi.js';
import { SP, FACCE_SBRONZA } from '../sprites.js';
import { manoAperta, MANO_APERTA_IMG } from '../grafica/pallaio.js';
import { im, scalaDi, scritta, fumetto, stelle, caso, scuoti, vibra } from '../fx.js';

// profondità (come in tavolo.js: Greg tra il pubblico e gli avversari, la mano davanti a tutti e due)
const P = { greg: 5.5, mano: 6.5, fx: 900, hud: 990 };
const RITRATTO = { x: 36, y: 230 };      // dov'è il ritratto di chi tira (tavolo.js)
const TAGLIA = 2;                        // Greg è un filo più piccolo dei veterani (2.2): sta un passo indietro

export class Schiaffo {
  // T = il tavolo; cfg = il blocco "schiaffo" della configurazione; m = l'avversario che dà lo
  // schiaffo (una voce di T.avv); suGiocatore = Greg è chi gioca (allora niente Greg in fondo)
  constructor(T, cfg, m, suGiocatore = false) {
    this.T = T; this.s = T.scene; this.cfg = cfg; this.m = m;
    this.a = cfg.a;                      // chi lo prende (Greg)
    this.occupato = false;
    this.vivo = true;
    // la manata, col colore della pelle di chi la dà (si crea una volta sola)
    const key = `manoAperta_${m.id}`;
    if (!this.s.textures.exists(key)) tela(this.s, key, MANO_APERTA_IMG.w, MANO_APERTA_IMG.h, (c) => manoAperta(c, PERSONAGGI[m.id]?.pelle ?? '#e6b48c'), 6);
    this.keyMano = key;
    if (suGiocatore) return;
    this.mettiGreg();
  }

  // Greg in piedi accanto a Marsupino, dalla parte dove non c'è l'altro veterano. È dentro una
  // scatola coi piedi nell'origine: così barcolla dai piedi, e la guancia rossa e le stelline lo
  // seguono. Lo spettatore che gli starebbe addosso fa un passo in là.
  mettiGreg() {
    const s = this.s, m = this.m, lato = m.x >= 240 ? 1 : -1;
    this.lato = lato;
    this.alto = 48 * TAGLIA * (PERSONAGGI[this.a]?.statura ?? 1);
    this.x0 = m.x + lato * this.cfg.distanza;
    this.box = s.add.container(this.x0, m.img.y + 4).setDepth(P.greg);
    this.img = s.add.image(0, 0, `${this.a}_normale`).setOrigin(0.5, 1).setScale(TAGLIA * SP);
    this.box.add(this.img);
    for (const v of this.T.pubblico) if (Math.abs(v.img.x - this.x0) < 54) v.img.setX(this.x0 + lato * 56);
    // (un respiro leggero, come chi aspetta il suo turno)
    this.respiro = s.tweens.add({ targets: this.img, scaleY: this.img.scaleY * 0.975, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  // la guancia di Greg dalla parte di Marsupino, rispetto ai suoi piedi (cioè nella scatola)
  get guancia() { return { x: -this.lato * this.alto * 0.16, y: -this.alto * 0.6 }; }

  // Marsupino ha sbagliato: SCIAF! (se ne sta già dando uno, questo salta)
  dai() {
    if (!this.vivo || this.occupato || Math.random() >= (this.cfg.probabilita ?? 1)) return false;
    this.occupato = true;
    if (this.box) this.manata(); else this.alRitratto();
    return true;
  }

  // Marsupino si gira arrabbiato, carica e colpisce; t = i tempi dal blocco di configurazione
  manata() {
    const s = this.s, m = this.m, lato = this.lato, t = this.cfg.tempi, g = this.guancia;
    this.arrabbiato();
    s.tweens.add({ targets: m.img, x: m.x + lato * 6, duration: 120, ease: 'Quad.out' });
    // la mano parte dalla spalla, si alza dietro la testa (caricata all'indietro) e poi parte
    const spalla = { x: m.x + lato * m.alto * 0.26, y: m.img.y - m.alto * 0.42 };
    const carica = { x: m.x + lato * m.alto * 0.14, y: m.img.y - m.alto * 0.9 };
    const arrivo = { x: this.x0 + g.x - lato * 7, y: this.box.y + g.y };
    const mano = im(s, spalla.x, spalla.y, this.keyMano, 0).setOrigin(MANO_APERTA_IMG.ox, MANO_APERTA_IMG.oy).setDepth(P.mano).setFlipX(lato < 0).setAngle(-lato * 20);
    this.mano = mano;
    const sc = scalaDi(this.keyMano, this.cfg.manoScala);   // (la scala vera della texture, come fa im)
    this.catena = s.tweens.chain({ targets: mano, tweens: [
      { scale: sc, x: carica.x, y: carica.y, angle: -lato * 60, duration: t.carica, ease: 'Back.out', onStart: () => Audio.sfx('fiuu') },
      { x: arrivo.x, y: arrivo.y, angle: lato * 28, duration: t.colpo, ease: 'Quad.in', onComplete: () => this.colpito(arrivo) },
      { x: arrivo.x - lato * 3, duration: t.fermo },
      { x: spalla.x, y: spalla.y, angle: -lato * 10, scale: sc * 0.6, alpha: 0, duration: t.ritorno, ease: 'Quad.in', onComplete: () => mano.destroy() },
    ] });
    // finita la scena, tutti al loro posto
    s.time.delayedCall(t.carica + t.colpo + t.fermo + t.ritorno + 350, () => {
      if (!this.vivo) return;
      s.tweens.add({ targets: m.img, x: m.x, duration: 160 });
      m.img.setTexture(`${m.id}_${FACCE_SBRONZA[this.T.sbronzaAvv]}`);
    });
    s.time.delayedCall(t.carica + t.colpo + t.riprende, () => { if (this.vivo) { this.img.setTexture(`${this.a}_normale`); this.occupato = false; } });
  }

  // la faccia arrabbiata di chi dà lo schiaffo (Marsupino ne ha una sua)
  arrabbiato() {
    const m = this.m, k = `${m.id}_rabbia`;
    if (this.s.textures.exists(k)) m.img.setTexture(k);
  }

  // la mano arriva sulla guancia: il suono, la scritta, Greg che barcolla e le stelline
  colpito(dove) {
    if (!this.vivo) return;
    const s = this.s, lato = this.lato, g = this.guancia, box = this.box;
    Audio.sfx('schiaffo');
    scuoti(s, 90, 0.004);
    scritta(s, dove.x + lato * 18, dove.y - 16, caso(this.cfg.scritte), { size: 12, color: '#ffffff', durata: 450, depth: P.fx });
    this.botta(dove.x + lato * 4, dove.y);
    this.img.setTexture(`${this.a}_shock`);
    // barcolla: spinto via dal colpo, poi oscilla sui piedi e torna dritto
    this.barcolla?.stop();
    box.setAngle(0).setX(this.x0);
    this.barcolla = s.tweens.chain({ targets: box, tweens: [
      { angle: lato * 16, x: this.x0 + lato * 7, duration: 110, ease: 'Quad.out' },
      { angle: -lato * 9, duration: 230, ease: 'Sine.inOut' },
      { angle: lato * 5, duration: 200, ease: 'Sine.inOut' },
      { angle: 0, x: this.x0, duration: 220, ease: 'Sine.out' },
    ] });
    // la guancia rossa (l'impronta della manata), che sbiadisce piano
    const r = this.alto / 96;
    const rosso = s.add.ellipse(g.x, g.y + 2 * r, 11 * r, 9 * r, 0xff3d3d, 0.55);
    box.add(rosso);
    s.tweens.add({ targets: rosso, alpha: 0, delay: 500, duration: 1200, onComplete: () => rosso.destroy() });
    this.stelline(box, 0, -this.alto * 0.98, 15 * r);
    this.frase();
  }

  // il lampo bianco del colpo e le stelle che schizzano via
  botta(x, y) {
    const s = this.s, b = s.add.circle(x, y, 7, 0xffffff, 0.85).setDepth(P.fx - 1);
    s.tweens.add({ targets: b, scale: 2.2, alpha: 0, duration: 200, ease: 'Quad.out', onComplete: () => b.destroy() });
    stelle(s, x, y, 5, P.fx);
  }

  // tre stelline che girano sopra la testa (cx, cy nella scatola, raggio r), finché lo stordimento passa
  stelline(box, cx, cy, r) {
    const s = this.s, st = [0, 1, 2].map(() => im(s, cx, cy, 'stella', 0.75));
    box.add(st);
    const giro = { a: 0 };
    s.tweens.add({ targets: giro, a: Math.PI * 4, duration: this.cfg.tempi.stordito, onUpdate: () => {
      st.forEach((o, i) => { const a = giro.a + (i * Math.PI * 2) / 3; o.setPosition(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.32); });
    }, onComplete: () => st.forEach((o) => o.destroy()) });
    s.tweens.add({ targets: st, alpha: 0, delay: this.cfg.tempi.stordito - 250, duration: 250 });
  }

  // ogni tanto uno dei due dice la sua: Marsupino dà la colpa a Greg, oppure Greg protesta
  frase() {
    const c = this.cfg, s = this.s, m = this.m, r = Math.random();
    if (r < c.parlaMarsupino) fumetto(s, m.x - this.lato * 8, m.img.y - m.alto - 2, caso(c.frasiMarsupino), 1100, P.fx + 2);
    else if (r < c.parlaMarsupino + c.parlaGreg) s.time.delayedCall(260, () => {
      if (!this.vivo) return;
      if (this.box) fumetto(s, this.x0 + this.lato * 10, this.box.y - this.alto - 6, caso(c.frasiGreg), 1100, P.fx + 2);
      else fumetto(s, RITRATTO.x + 54, RITRATTO.y - 30, caso(c.frasiGreg), 1100, P.hud + 5);
    });
  }

  // Greg è chi gioca: la manata sale dal bordo in basso, accanto al ritratto, carica e lo colpisce;
  // il ritratto sbanda con le stelline
  alRitratto() {
    const s = this.s, T = this.T, t = this.cfg.tempi, sc = scalaDi(this.keyMano, this.cfg.manoScala * 1.9);
    this.arrabbiato();
    const da = { x: RITRATTO.x + 96, y: 300 }, carica = { x: RITRATTO.x + 82, y: RITRATTO.y - 24 }, arrivo = { x: RITRATTO.x + 20, y: RITRATTO.y - 2 };
    const mano = im(s, da.x, da.y, this.keyMano, this.cfg.manoScala * 1.9).setOrigin(MANO_APERTA_IMG.ox, MANO_APERTA_IMG.oy).setDepth(P.hud + 4).setFlipX(true).setAngle(10);
    this.mano = mano;
    this.catena = s.tweens.chain({ targets: mano, tweens: [
      { x: carica.x, y: carica.y, angle: 40, duration: t.carica, ease: 'Back.out', onStart: () => Audio.sfx('fiuu') },
      { x: arrivo.x, y: arrivo.y, angle: -24, duration: t.colpo, ease: 'Quad.in', onComplete: () => {
        if (!this.vivo) return;
        Audio.sfx('schiaffo');
        vibra(50);
        scuoti(s, 120, 0.006);
        scritta(s, arrivo.x + 16, arrivo.y - 34, caso(this.cfg.scritte), { size: 13, color: '#ffffff', durata: 450, depth: P.hud + 6 });
        this.botta(arrivo.x - 4, arrivo.y - 6);
        T.faccia('shock');
        // (il ritratto ondeggia già da sé con la sbronza: qui sbanda solo di lato)
        if (T.ritratto) s.tweens.add({ targets: T.ritratto, x: { from: RITRATTO.x - 7, to: RITRATTO.x }, duration: 420, ease: 'Elastic.out' });
        const box = s.add.container(RITRATTO.x, RITRATTO.y).setDepth(P.hud + 3);
        this.stelline(box, 0, -24, 17);
        s.time.delayedCall(t.stordito + 50, () => box.destroy());
        this.frase();
      } },
      { x: arrivo.x - 4, duration: t.fermo },
      { x: da.x, y: da.y, angle: 10, scale: sc, duration: t.ritorno, ease: 'Quad.in', onComplete: () => mano.destroy() },
    ] });
    s.time.delayedCall(t.carica + t.colpo + t.riprende, () => {
      if (!this.vivo) return;
      T.faccia();
      this.m.img.setTexture(`${this.m.id}_${FACCE_SBRONZA[T.sbronzaAvv]}`);
      this.occupato = false;
    });
  }

  // fine del microgioco: niente più schiaffi, e Greg reagisce. vittoria = ha vinto chi gioca: i
  // veterani hanno perso e Greg se la ride (Marsupino gliene ha date tante); se no resta lì mogio
  finale(vittoria) {
    this.vivo = false;
    // (uno schiaffo a metà si ferma lì: le catene di tween non le ferma killTweensOf)
    this.catena?.stop(); this.barcolla?.stop();
    this.mano?.destroy();
    this.m.img.setX(this.m.x);
    if (!this.box) return;
    const s = this.s;
    this.box.setAngle(0).setX(this.x0);
    this.img.setTexture(`${this.a}_${vittoria ? 'felice' : 'triste'}`);
    if (vittoria) s.tweens.add({ targets: this.box, y: this.box.y - 7, duration: 200, yoyo: true, repeat: 3, delay: 120 });
  }
}
