// Aiutanti condivisi: telecamera, testi, immagini, stelline, fumo, scritte che rimbalzano, menu.
import { Audio } from './audio.js';
import { Progressi } from './progressi.js';
import { CONFIG } from './config.js';
import { RES, DENS } from './grafica/base.js';
import { eTouch } from './dispositivo.js';
import { Salvataggio } from './salvataggio.js';

// --- tastiera e mouse, oppure dito ---
// eTouch(): true sul telefono/tablet (o con ?touch=1). Decide testi e comandi da mostrare.
export { eTouch };
export const perDito = (tastiera, dito) => (eTouch() ? dito : tastiera);
// vibrazione breve per colpi ed errori (Android; su iPhone non c'è e non succede niente)
// (si può spegnere dalle Impostazioni)
export const vibra = (ms = 40) => { if (eTouch() && Salvataggio.impostazioni.vibrazione) try { navigator.vibrate?.(ms); } catch (e) { /* niente */ } };
// fino a tre dita insieme (ogni scena che lo chiama; i puntatori si aggiungono una volta sola)
export function multiTouch(scene, dita = 3) {
  const m = scene.input.manager;
  if (m.pointersTotal < dita) scene.input.addPointer(dita - m.pointersTotal);
}

export const FONT = 'Fredoka, "Trebuchet MS", "Segoe UI", sans-serif';
export const lerp = (a, b, t) => a + (b - a) * t;
export const caso = (arr) => arr[Math.floor(Math.random() * arr.length)];
// numero + parola al singolare o al plurale: quanti(1, 'panino', 'panini') -> "1 panino"
// I numeri nei testi, all'italiana: virgola per i decimali (0,3 s), niente puntini delle migliaia
export const numero = (x, decimali = 0) => Number(x).toLocaleString('it-IT', { minimumFractionDigits: decimali, maximumFractionDigits: decimali, useGrouping: false });
export const quanti = (n, uno, tanti) => `${numero(n)} ${n === 1 ? uno : tanti}`;
// i punti nell'HUD dei microgiochi: mai sotto zero (come il risultato)
export const puntiHud = (n) => 'PUNTI: ' + numero(Math.max(0, Math.round(n)));

// Ogni scena lavora in unità logiche (480x270): la telecamera ingrandisce di RES
// volte, così si disegna a 1920x1080 senza cambiare le coordinate di gioco.
export function inquadra(scene, o = {}) {
  scene.cameras.main.setZoom(RES).centerOn(CONFIG.larghezza / 2, CONFIG.altezza / 2);
  // ogni schermata entra con una dissolvenza veloce (la pausa no: sta sopra al gioco fermo)
  if (o.dissolvenza !== false) scene.cameras.main.fadeIn(170, 31, 20, 48);
}

// immagine a grandezza naturale (le texture sono più dense dello schermo logico)
export const scalaDi = (key, scala = 1) => scala / DENS[key];
export const im = (scene, x, y, key, scala = 1) => scene.add.image(x, y, key).setScale(scalaDi(key, scala));

// tremolio dello schermo: forza = frazione della larghezza (0.01 = 1%)
// (si può spegnere dalle Impostazioni: "Schermo che trema")
export const scuoti = (scene, ms, forza) => { if (Salvataggio.impostazioni.tremolio) scene.cameras.main.shake(ms, forza / (RES * RES)); };

// quanto restano a schermo scritte e fumetti (Impostazioni: velocità dei testi)
export const ritmoTesti = () => ({ lenta: 1.5, normale: 1, veloce: 0.7 })[Salvataggio.impostazioni.velocitaTesti] ?? 1;

// Posizione del mouse (o di un dito, p) in unità logiche. Non si usa getWorldPoint della
// telecamera perché quello segue anche il tremolio di scuoti(): a mouse fermo il punto ballerebbe
// di qualche unità a ogni fotogramma, e dove conta la strada fatta (la barba) sembrerebbe una corsa.
export function puntatore(scene, p = scene.input.activePointer) {
  const cam = scene.cameras.main;
  return {
    x: cam.scrollX + cam.width / 2 + (p.x - cam.width / 2) / cam.zoom,
    y: cam.scrollY + cam.height / 2 + (p.y - cam.height / 2) / cam.zoom,
  };
}

export function txt(scene, x, y, s, o = {}) {
  // (mai sotto 7: sul telefono, dentro Safari, le scritte più piccole non si leggevano. Se una scritta
  // non ci sta, si toglie testo: non si rimpicciolisce)
  const size = Math.max(7, o.size ?? 8) * 1.3;
  const thick = o.thick ?? (size >= 20 ? 5 : 3);
  const t = scene.add.text(x, y, s, {
    fontFamily: FONT,
    fontStyle: '600',
    fontSize: size + 'px',
    color: o.color ?? '#ffffff',
    align: o.align ?? 'center',
    stroke: o.stroke ?? '#1f1430',
    strokeThickness: thick,
    lineSpacing: o.spacing ?? 1,
    padding: { x: 3, y: 3 },
    resolution: RES,
    wordWrap: o.wrap ? { width: o.wrap } : undefined,
  });
  if (thick > 0 && size >= 20) t.setShadow(0, 2, 'rgba(0,0,0,0.4)', 0, true, true);
  t.setOrigin(o.ox ?? 0.5, o.oy ?? 0.5);
  if (o.depth != null) t.setDepth(o.depth);
  return t;
}

// pannello arrotondato (x, y = centro)
export function pannello(scene, x, y, w, h, o = {}) {
  const g = scene.add.graphics();
  const r = o.raggio ?? 6;
  g.fillStyle(0x000000, 0.25); g.fillRoundedRect(x - w / 2 + 1.5, y - h / 2 + 2.5, w, h, r);
  g.fillStyle(o.colore ?? 0x1f1430, o.alfa ?? 0.85); g.fillRoundedRect(x - w / 2, y - h / 2, w, h, r);
  if (o.bordo !== null) { g.lineStyle(o.spessore ?? 1.5, o.bordo ?? 0xffe14a, 1); g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, r); }
  if (o.depth != null) g.setDepth(o.depth);
  return g;
}

export function stelle(scene, x, y, n = 8, depth = 900) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.5, d = 24 + Math.random() * 26;
    const s = im(scene, x, y, 'stella', 0.7 + Math.random() * 0.9).setDepth(depth);
    scene.tweens.add({ targets: s, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, angle: 220, alpha: 0, duration: 450 + Math.random() * 250, ease: 'Cubic.out', onComplete: () => s.destroy() });
  }
}

export function fumo(scene, x, y, n = 5, depth = 900, tinta = 0xffffff) {
  for (let i = 0; i < n; i++) {
    const s = im(scene, x + (Math.random() - 0.5) * 14, y + (Math.random() - 0.5) * 8, 'fumo', 0.4).setDepth(depth).setTint(tinta);
    scene.tweens.add({ targets: s, y: s.y - 14 - Math.random() * 14, x: s.x + (Math.random() - 0.5) * 24, scale: scalaDi('fumo', 1.3), alpha: 0, duration: 500 + Math.random() * 300, onComplete: () => s.destroy() });
  }
}

// Scritta che entra rimbalzando e poi svanisce
export function scritta(scene, x, y, s, o = {}) {
  const t = txt(scene, x, y, s, { size: o.size ?? 16, color: o.color ?? '#ffe14a', depth: o.depth ?? 950 });
  t.setScale(0.2).setAngle((Math.random() - 0.5) * 14);
  scene.tweens.add({ targets: t, scale: 1, duration: 320, ease: 'Back.out' });
  scene.tweens.add({ targets: t, y: y - 14, alpha: 0, delay: (o.durata ?? 700) * ritmoTesti(), duration: 300, onComplete: () => t.destroy() });
  return t;
}

// Fumetto con la punta in basso (x, y = centro), sparisce dopo ms
export function fumetto(scene, x, y, s, ms = 1200, depth = 900) {
  const t = txt(scene, 0, 0, s, { size: 7, color: '#1f1430', thick: 0 });
  const w = t.width + 8, h = 13;
  const g = scene.add.graphics();
  g.fillStyle(0x1f1430, 1); g.fillRoundedRect(-w / 2 - 1, -h / 2 - 1, w + 2, h + 2, 6);
  g.fillStyle(0xffffff, 1); g.fillRoundedRect(-w / 2, -h / 2, w, h, 5); g.fillTriangle(-4, h / 2 - 0.5, 3, h / 2 - 0.5, -3, h / 2 + 4.5);
  const b = scene.add.container(x, y, [g, t]).setDepth(depth).setScale(0.3);
  scene.tweens.add({ targets: b, scale: 1, duration: 140, ease: 'Back.out' });
  scene.time.delayedCall(ms * ritmoTesti(), () => b.destroy());
  return b;
}

// "Respiro" cartoon: squash & stretch continuo attorno alla scala attuale
export function molleggia(scene, obj, durata = 380) {
  const sx = obj.scaleX, sy = obj.scaleY;
  return scene.tweens.add({ targets: obj, scaleY: sy * 0.94, scaleX: sx * 1.05, duration: durata, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
}

// Colpetto di squash singolo
export function colpetto(scene, obj, sx = 1.25, sy = 0.8) {
  const x = obj.scaleX, y = obj.scaleY;
  scene.tweens.add({ targets: obj, scaleX: x * sx, scaleY: y * sy, duration: 80, yoyo: true, ease: 'Quad.out', onComplete: () => obj.setScale(x, y) });
}

// Sfondo a raggi rotanti con vignettatura
export function raggi(scene, c1, c2) {
  // il tema comprato al Bancone (i colori restano quelli della schermata)
  const tema = Progressi.tema;
  if (tema !== 'raggi') return motivo(scene, tema, c1, c2);
  const g = scene.add.graphics().setPosition(240, 135);
  const n = 18, r = 420;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
    g.fillStyle(i % 2 ? c1 : c2);
    g.fillTriangle(0, 0, Math.cos(a0) * r, Math.sin(a0) * r, Math.cos(a1) * r, Math.sin(a1) * r);
  }
  scene.tweens.add({ targets: g, angle: 360, duration: 50000, repeat: -1 });
  scene.add.image(240, 135, 'vignetta').setDisplaySize(480, 270);
  return g;
}

// gli altri sfondi (temi del Bancone): pois, scacchi, strisce, cielo stellato. Scorrono piano
function motivo(scene, tema, c1, c2) {
  const g = scene.add.graphics(), P = tema === 'scacchi' ? 30 : tema === 'strisce' ? 40 : 24;
  g.fillStyle(tema === 'stelle' ? scuroInt(c1) : c2, 1).fillRect(-P, -P, 480 + 2 * P, 270 + 2 * P);
  g.fillStyle(c1, 1);
  if (tema === 'pois') { for (let y = -P, r = 0; y < 270 + P; y += P, r++) for (let x = -P + (r % 2) * P / 2; x < 480 + P; x += P) g.fillCircle(x, y, 6.5); }
  else if (tema === 'scacchi') { for (let y = -P, r = 0; y < 270 + P; y += P, r++) for (let x = -P, k = 0; x < 480 + P; x += P, k++) if ((r + k) % 2) g.fillRect(x, y, P, P); }
  else if (tema === 'strisce') { for (let x = -300; x < 480 + P; x += P) g.fillPoints([{ x, y: -P }, { x: x + P / 2, y: -P }, { x: x + P / 2 + 330, y: 270 + P }, { x: x + 330, y: 270 + P }], true); }
  else if (tema === 'stelle') {
    let s = 7;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 90; i++) { g.fillStyle(i % 3 ? 0xffffff : c2, 0.4 + r() * 0.6); g.fillCircle(-P + r() * (480 + 2 * P), -P + r() * (270 + 2 * P), 0.6 + r() * 1.4); }
  }
  scene.tweens.add({ targets: g, x: tema === 'stelle' ? -P : P, y: tema === 'strisce' || tema === 'stelle' ? 0 : P, duration: tema === 'stelle' ? 30000 : 4000, repeat: -1 });
  scene.add.image(240, 135, 'vignetta').setDisplaySize(480, 270);
  return g;
}
const scuroInt = (col) => { const c = Phaser.Display.Color.IntegerToColor(col); return Phaser.Display.Color.GetColor(c.red * 0.25, c.green * 0.25, c.blue * 0.35); };

// trofei appena sbloccati: una striscia che sale dal basso per ciascuno, uno dopo l'altro
// (in basso c'è sempre posto: in alto coprirebbe i titoli)
export function annunciaTrofei(scene, trofei = [], ritardo = 0) {
  trofei.forEach((t, k) => scene.time.delayedCall(ritardo + k * 1900, () => {
    const c = scene.add.container(240, 300).setDepth(5000);
    c.add([pannello(scene, 0, 0, 290, 34, { alfa: 0.95, raggio: 10, colore: 0x3a2050 }), im(scene, -126, 0, 'coppa', 0.75),
      txt(scene, -108, -7, 'TROFEO: ' + t.nome, { size: 9, ox: 0, color: '#ffe14a' }),
      txt(scene, -108, 7, `${t.descrizione}   +${CONFIG.trofei.pinte} PINTE`, { size: 7, ox: 0, color: '#fff3d6' })]);
    Audio.sfx('bonus');
    scene.tweens.add({ targets: c, y: 244, duration: 300, ease: 'Back.out', hold: 1300, yoyo: true, onComplete: () => c.destroy() });
  }));
}

// ombra a terra sotto un personaggio
export const ombra = (scene, x, y, w = 60) => scene.add.ellipse(x, y, w, w * 0.2, 0x000000, 0.25);

// Pulsantino a schermo (pausa, audio, schermo intero, indietro): icona disegnata, zona di
// tocco più grande del disegno. Il tocco non arriva al resto della scena (stopPropagation).
// icona: 'pausa' | 'audio' | 'schermo' | 'indietro'. o.suRilascio: azione al rilascio
// (lo schermo intero lo vuole); o.depth.
export function pulsante(scene, x, y, icona, azione, o = {}) {
  const depth = o.depth ?? 1003, w = 19, h = 16;
  const g = scene.add.graphics().setPosition(x, y).setDepth(depth);
  const disegna = () => {
    g.clear();
    g.fillStyle(0x000000, 0.25); g.fillRoundedRect(-w / 2 + 0.8, -h / 2 + 1.4, w, h, 5);
    g.fillStyle(0x1f1430, 0.75); g.fillRoundedRect(-w / 2, -h / 2, w, h, 5);
    g.lineStyle(1.2, 0xffe14a, 0.9); g.strokeRoundedRect(-w / 2, -h / 2, w, h, 5);
    g.fillStyle(0xffffff, 1); g.lineStyle(1.4, 0xffffff, 1);
    if (icona === 'pausa') { g.fillRect(-3.6, -4.5, 2.6, 9); g.fillRect(1, -4.5, 2.6, 9); }
    else if (icona === 'indietro') { g.fillTriangle(-5, 0, 0, -5, 0, 5); g.fillRect(-0.5, -1.6, 5.5, 3.2); }
    else if (icona === 'schermo') {
      for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { g.beginPath(); g.moveTo(sx * 5.5, sy * 1.5); g.lineTo(sx * 5.5, sy * 4.5); g.lineTo(sx * 2.5, sy * 4.5); g.strokePath(); }
    } else if (icona === 'audio') {
      g.fillRect(-6, -2, 3, 4); g.fillTriangle(-3.5, -2, 1, -5.5, 1, 5.5); g.fillRect(-3.5, -2, 4.5, 4);
      if (Audio.eMuto) { g.lineStyle(1.4, 0xff6b5a, 1); g.lineBetween(2.8, -3, 7, 3); g.lineBetween(7, -3, 2.8, 3); }
      else { g.beginPath(); g.arc(1.5, 0, 3.5, -0.9, 0.9); g.strokePath(); g.beginPath(); g.arc(1.5, 0, 6, -0.9, 0.9); g.strokePath(); }
    }
  };
  disegna();
  const zona = scene.add.rectangle(x, y, w + 10, h + 10, 0x000000, 0.001).setDepth(depth).setInteractive({ useHandCursor: true });
  const premi = (_p, _x, _y, ev) => {
    ev?.stopPropagation();
    Audio.sfx('muovi');
    scene.tweens.add({ targets: g, scale: { from: 0.8, to: 1 }, duration: 120, ease: 'Back.out' });
    azione();
    disegna();
  };
  if (o.suRilascio) { zona.on('pointerdown', (_p, _x, _y, ev) => ev?.stopPropagation()); zona.on('pointerup', premi); }
  else zona.on('pointerdown', premi);
  // l'icona dell'audio segue anche il tasto M
  if (icona === 'audio') {
    window.addEventListener('audio-cambiato', disegna);
    scene.events.once('shutdown', () => window.removeEventListener('audio-cambiato', disegna));
  }
  return { g, zona, disegna, setVisible: (v) => { g.setVisible(v); zona.setVisible(v); } };
}

// La pausa a schermo dei giochi, sul telefono: col DOPPIO tocco (al primo si accende e sotto
// dice ANCORA), perché giocando la si sfiorava e la partita si fermava. Ridà [tasto, scritta].
export function pulsantePausa(scene, x, y, azione) {
  let primo = -9999;
  const ancora = txt(scene, x, y + 14, 'ANCORA', { size: 7, color: '#ffe14a', depth: 1004 }).setVisible(false);
  const tasto = pulsante(scene, x, y, 'pausa', () => {
    const ora = scene.time.now;
    if (ora - primo < 900) { primo = -9999; ancora.setVisible(false); return azione(); }
    primo = ora;
    ancora.setVisible(true);
    scene.time.delayedCall(900, () => { if (scene.time.now - primo >= 880) ancora.setVisible(false); });
  });
  return [tasto, ancora];
}

// Schermo intero, dove il browser lo permette (Android sì, iPhone no: lì si usa
// "Aggiungi a schermata Home"). In orizzontale, se il telefono lo consente.
export const schermoInteroPossibile = (scene) => scene.scale.fullscreen.available;
export function schermoIntero(scene) {
  if (scene.scale.isFullscreen) return scene.scale.stopFullscreen();
  scene.scale.startFullscreen();
  try { screen.orientation?.lock?.('landscape').catch(() => {}); } catch (e) { /* niente */ }
}

// Menu a lista: frecce + INVIO, oppure mouse o dito (un tocco = scegli)
// o.pos(i) -> [x, y]: posizione di ogni voce (per le liste a colonne); o.larghezza: zona di tocco;
// o.iniziale: la voce evidenziata all'inizio; o.orizzontale: si scorre anche con SINISTRA e DESTRA
export function menuLista(scene, voci, x, y, passo = 20, size = 8, o = {}) {
  let sel = Phaser.Math.Clamp(o.iniziale ?? 0, 0, voci.length - 1);
  const evid = scene.add.graphics();
  const agg = () => {
    testi.forEach((t, i) => t.setColor(i === sel ? '#1f1430' : '#ffffff').setStroke(i === sel ? '#ffe14a' : '#1f1430', i === sel ? 0 : 3));
    const t = testi[sel], w = t.width + 18, h = passo - 4;
    evid.clear();
    evid.fillStyle(0x000000, 0.25); evid.fillRoundedRect(t.x - w / 2 + 1, t.y - h / 2 + 2, w, h, h / 2);
    evid.fillStyle(0xffe14a, 1); evid.fillRoundedRect(t.x - w / 2, t.y - h / 2, w, h, h / 2);
  };
  const testi = voci.map((v, i) => {
    const [tx, ty] = o.pos ? o.pos(i) : [x, y + i * passo];
    const t = txt(scene, tx, ty, v.label, { size });
    // zona di tocco larga quanto la riga, non solo quanto la scritta: col dito si prende meglio
    const W = o.larghezza ?? Math.max(t.width + 20, 150);
    t.setInteractive({ hitArea: new Phaser.Geom.Rectangle((t.width - W) / 2, (t.height - passo) / 2, W, passo), hitAreaCallback: Phaser.Geom.Rectangle.Contains, useHandCursor: true });
    t.on('pointerover', () => { if (sel !== i) { sel = i; Audio.sfx('muovi'); agg(); } });
    // il tocco sceglie subito (col dito non c'è il passaggio del mouse che prima evidenzia)
    t.on('pointerdown', () => { Audio.sblocca(); if (sel !== i) { sel = i; agg(); } Audio.sfx('scegli'); v.azione(); });
    return t;
  });
  const muovi = (d) => { sel = (sel + d + voci.length) % voci.length; Audio.sfx('muovi'); agg(); };
  const kb = scene.input.keyboard;
  kb.on('keydown-UP', () => muovi(-1));
  kb.on('keydown-DOWN', () => muovi(1));
  if (o.orizzontale) { kb.on('keydown-LEFT', () => muovi(-1)); kb.on('keydown-RIGHT', () => muovi(1)); }
  const ok = (e) => { if (e.repeat) return; Audio.sfx('scegli'); voci[sel].azione(); };
  kb.on('keydown-ENTER', ok);
  kb.on('keydown-SPACE', ok);
  agg();
  testi.evid = evid;     // (l'evidenziatore: chi vuole nascondere il menu, per esempio per una foto)
  return testi;
}
