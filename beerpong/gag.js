// BEER PONG: le gag dei tiri sbagliati. Quando la pallina esce dal tavolo, ogni tanto ne parte una
// a caso tra quelle elencate in js/config/beerpong.js (gag.lista): qui c'è, con lo stesso id, la
// funzione che la mette in scena. Sono solo di contorno: il gioco intanto va avanti.
//
// Ogni funzione riceve T (il tavolo: js/beerpong/tavolo.js), la pallina (l'immagine, già staccata
// dal volo: va distrutta alla fine) e la sua riga di configurazione (testo, frasi); ritorna quanti
// secondi dura, oppure 0 se in questo momento non si può fare (allora la pallina cade e basta).
import { Audio } from '../audio.js';
import { im, scritta, fumetto, stelle, caso, scuoti } from '../fx.js';
import { SP } from '../sprites.js';
import { CANE } from '../grafica/vialetto.js';

const frase = (g) => (g.frasi?.length ? caso(g.frasi) : null);

export const GAG = {
  // colpisce in fronte uno che guarda, che crolla con le stelline
  fronte(T, palla, g) {
    const scene = T.scene, v = caso(T.pubblico.filter((s) => !s.giu));
    if (!v) return 0;
    // (cade verso l'esterno; chi sta già sul bordo dello schermo cade verso l'interno, se no sparisce)
    const x = v.img.x, y = v.img.y - v.alto * 0.8, lato = x < 80 ? 1 : x > 400 ? -1 : x < 240 ? -1 : 1;
    v.giu = true;
    scene.tweens.add({ targets: palla, x, y, scale: palla.scale * 0.75, duration: 330, ease: 'Quad.in', onComplete: () => {
      Audio.sfx('tonk');
      scuoti(scene, 90, 0.004);
      scritta(scene, x, y - 16, g.testo ?? 'TONK!', { size: 11, color: '#ffffff', durata: 500 });
      stelle(scene, x, y, 6);
      scene.tweens.add({ targets: palla, x: x - lato * 46, y: y - 34, alpha: 0, duration: 420, ease: 'Quad.out', onComplete: () => palla.destroy() });
      v.img.setTexture(`${v.id}_shock`);
      scene.tweens.add({ targets: v.img, angle: lato * 84, duration: 520, ease: 'Bounce.out' });
      // le stelline gli girano sulla testa mentre è a terra
      const giro = scene.time.addEvent({ delay: 260, repeat: 5, callback: () => stelle(scene, x + lato * v.alto * 0.7, v.img.y - 10, 3) });
      const f = frase(g);
      if (f) scene.time.delayedCall(650, () => fumetto(scene, x + lato * v.alto * 0.5, v.img.y - 30, f, 1300, 920));
      scene.time.delayedCall(2300, () => {
        giro.remove();
        v.img.setTexture(v.faccia);
        scene.tweens.add({ targets: v.img, angle: 0, duration: 300, ease: 'Back.out', onComplete: () => { v.giu = false; } });
      });
    } });
    return 2.8;
  },

  // finisce nel bicchiere di qualcuno che beveva in disparte
  bicchiere(T, palla, g) {
    const scene = T.scene, b = T.bevitore;
    if (!b || b.giu) return 0;
    const x = b.pinta.x, y = b.pinta.y - 9;
    scene.tweens.add({ targets: palla, x, y: y - 30, scale: palla.scale * 0.7, duration: 300, ease: 'Quad.out', onComplete: () => {
      scene.tweens.add({ targets: palla, y, scale: palla.scale * 0.8, duration: 200, ease: 'Quad.in', onComplete: () => {
        palla.destroy();
        Audio.sfx('plop');
        T.schizzi(x, y, 0.9);
        scritta(scene, x - 4, y - 16, g.testo ?? 'PLOP!', { size: 10, color: '#ffe14a', durata: 500 });
        b.img.setTexture(`${b.id}_shock`);
        const f = frase(g);
        if (f) scene.time.delayedCall(350, () => fumetto(scene, b.img.x - 22, b.img.y - b.alto - 4, f, 1400, 920));
        scene.time.delayedCall(1900, () => b.img.setTexture(b.faccia));
      } });
    } });
    return 2.4;
  },

  // rimbalza sulla lampadina, che dondola facendo ondeggiare le ombre
  lampadina(T, palla, g) {
    const scene = T.scene, L = T.lampada;
    const x = L.x, y = L.y + 36;
    scene.tweens.add({ targets: palla, x, y, scale: palla.scale * 0.9, duration: 300, ease: 'Quad.out', onComplete: () => {
      Audio.sfx('ding');
      scritta(scene, x + 26, y + 4, g.testo ?? 'DLING!', { size: 10, color: '#fff6b8', durata: 500 });
      T.dondola(x < palla.x ? -1 : 1);
      scene.tweens.add({ targets: palla, x: x + (Math.random() < 0.5 ? -70 : 70), y: 120, alpha: 0, duration: 520, ease: 'Quad.in', onComplete: () => palla.destroy() });
    } });
    return 3.2;
  },

  // un cane entra, la prende al volo e scappa, e qualcuno lo insegue
  cane(T, palla, g) {
    const scene = T.scene;
    if (!scene.textures.exists('cane0_a')) return 0;
    const verso = palla.x < 240 ? 1 : -1, x0 = verso > 0 ? 96 : 384, x1 = 480 - x0, Y = 178, cima = 86;
    const cane = im(scene, x0 - verso * 130, Y, 'cane0_a', 0.95).setOrigin(CANE.ox, CANE.oy).setFlipX(verso < 0).setDepth(46);
    let passo = 0;
    const zampe = scene.time.addEvent({ delay: 110, loop: true, callback: () => cane.setTexture(passo++ % 2 ? 'cane0_a' : 'cane0_b') });
    Audio.sfx('bau');
    // la pallina resta per aria un attimo: il cane arriva di corsa, salta e la prende
    scene.tweens.add({ targets: palla, x: 240, y: cima - 6, scale: palla.scale * 0.8, duration: 620, ease: 'Quad.out' });
    scene.tweens.add({ targets: cane, x: x0, duration: 300, onComplete: () => {
      scene.tweens.add({ targets: cane, x: 240, duration: 330 });
      scene.tweens.add({ targets: cane, y: cima, angle: -verso * 18, duration: 330, ease: 'Quad.out', onComplete: () => {
        palla.destroy();
        Audio.sfx('gnam');
        cane.setTexture('cane0_felice'); zampe.paused = true;
        scritta(scene, 240, cima - 24, g.testo ?? 'GNAM!', { size: 12, color: '#ffe14a', durata: 500 });
        scene.tweens.add({ targets: cane, x: x1, duration: 330 });
        scene.tweens.add({ targets: cane, y: Y, angle: verso * 14, duration: 330, ease: 'Quad.in', onComplete: () => {
          zampe.paused = false; cane.setAngle(0);
          scene.tweens.add({ targets: cane, x: x1 + verso * 160, duration: 420, onComplete: () => { zampe.remove(); cane.destroy(); } });
        } });
      } });
    } });
    // ...e dietro al tavolo passa di corsa chi lo insegue
    if (scene.textures.exists('emilio_disperato')) scene.time.delayedCall(1150, () => {
      const e = im(scene, 240 - verso * 300, 172, 'emilio_disperato').setOrigin(0.5, 1).setScale(2.3 * SP).setFlipX(verso < 0).setDepth(7);
      const corsa = scene.tweens.add({ targets: e, y: 166, duration: 110, yoyo: true, repeat: -1 });
      const f = frase(g);
      if (f) scene.time.delayedCall(420, () => fumetto(scene, e.x + verso * 30, 84, f, 1200, 920));
      scene.tweens.add({ targets: e, x: 240 + verso * 320, duration: 1700, onComplete: () => { corsa.stop(); e.destroy(); } });
    });
    return 3.4;
  },

  // vola fuori dalla finestra; da fuori arriva un "AHIA!"
  finestra(T, palla, g) {
    const scene = T.scene, x = palla.x < 240 ? 190 + Math.random() * 30 : 262 + Math.random() * 40, y = 52;
    scene.tweens.add({ targets: palla, x, y, scale: palla.scale * 0.22, duration: 520, ease: 'Quad.out', onComplete: () => {
      palla.destroy();
      scene.time.delayedCall(380, () => {
        Audio.sfx('ahia');
        scritta(scene, x, y - 4, g.testo ?? 'AHIA!', { size: 12, color: '#ffffff', durata: 600 });
        const f = frase(g);
        if (f) scene.time.delayedCall(700, () => fumetto(scene, x + 6, y + 4, f, 1400, 920));
      });
    } });
    return 2.6;
  },
};
