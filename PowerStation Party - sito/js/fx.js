// Aiutanti condivisi: telecamera, testi, immagini, stelline, fumo, scritte che rimbalzano, menu.
import { Audio } from './audio.js';
import { CONFIG } from './config.js';
import { RES, DENS } from './grafica/base.js';
import { eTouch } from './dispositivo.js';

// --- tastiera e mouse, oppure dito ---
// eTouch(): true sul telefono/tablet (o con ?touch=1). Decide testi e comandi da mostrare.
export { eTouch };
export const perDito = (tastiera, dito) => (eTouch() ? dito : tastiera);
// vibrazione breve per colpi ed errori (Android; su iPhone non c'è e non succede niente)
export const vibra = (ms = 40) => { if (eTouch()) try { navigator.vibrate?.(ms); } catch (e) { /* niente */ } };
// fino a tre dita insieme (ogni scena che lo chiama; i puntatori si aggiungono una volta sola)
export function multiTouch(scene, dita = 3) {
  const m = scene.input.manager;
  if (m.pointersTotal < dita) scene.input.addPointer(dita - m.pointersTotal);
}

export const FONT = 'Fredoka, "Trebuchet MS", "Segoe UI", sans-serif';
export const lerp = (a, b, t) => a + (b - a) * t;
export const caso = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Ogni scena lavora in unità logiche (480x270): la telecamera ingrandisce di RES
// volte, così si disegna a 1920x1080 senza cambiare le coordinate di gioco.
export function inquadra(scene) {
  scene.cameras.main.setZoom(RES).centerOn(CONFIG.larghezza / 2, CONFIG.altezza / 2);
}

// immagine a grandezza naturale (le texture sono più dense dello schermo logico)
export const scalaDi = (key, scala = 1) => scala / DENS[key];
export const im = (scene, x, y, key, scala = 1) => scene.add.image(x, y, key).setScale(scalaDi(key, scala));

// tremolio dello schermo: forza = frazione della larghezza (0.01 = 1%)
export const scuoti = (scene, ms, forza) => scene.cameras.main.shake(ms, forza / (RES * RES));

// posizione del mouse in unità logiche
export function puntatore(scene) {
  const p = scene.input.activePointer;
  return scene.cameras.main.getWorldPoint(p.x, p.y);
}

export function txt(scene, x, y, s, o = {}) {
  const size = (o.size ?? 8) * 1.3;
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
  scene.tweens.add({ targets: t, y: y - 14, alpha: 0, delay: o.durata ?? 700, duration: 300, onComplete: () => t.destroy() });
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
  scene.time.delayedCall(ms, () => b.destroy());
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

// Schermo intero, dove il browser lo permette (Android sì, iPhone no: lì si usa
// "Aggiungi a schermata Home"). In orizzontale, se il telefono lo consente.
export const schermoInteroPossibile = (scene) => scene.scale.fullscreen.available;
export function schermoIntero(scene) {
  if (scene.scale.isFullscreen) return scene.scale.stopFullscreen();
  scene.scale.startFullscreen();
  try { screen.orientation?.lock?.('landscape').catch(() => {}); } catch (e) { /* niente */ }
}

// Menu a lista: frecce + INVIO, oppure mouse o dito (un tocco = scegli)
// o.pos(i) -> [x, y]: posizione di ogni voce (per le liste a colonne); o.larghezza: zona di tocco
export function menuLista(scene, voci, x, y, passo = 20, size = 8, o = {}) {
  let sel = 0;
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
  const ok = (e) => { if (e.repeat) return; Audio.sfx('scegli'); voci[sel].azione(); };
  kb.on('keydown-ENTER', ok);
  kb.on('keydown-SPACE', ok);
  agg();
  return testi;
}
