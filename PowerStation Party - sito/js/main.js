// Avvio del gioco: registra le scene e fa partire Phaser.
import './compat.js'; // per primo: completa i browser più vecchi (Safari)
import { CONFIG } from './config.js';
import { Audio } from './audio.js';
import { RES } from './grafica/base.js';
import { eTouch } from './dispositivo.js';
import { MICROGIOCHI } from './microgames/index.js';
import { BootScene, MenuScene, AllenamentoScene, ComandiScene, PausaScene } from './scenes/menu.js';
import { IntroScene, RisultatoScene, FinaleScene } from './scenes/flusso.js';

// i browser fanno partire l'audio solo dopo un input dell'utente; Safari (soprattutto
// su iPhone) accetta solo alcuni eventi, quindi si ascoltano tutti quelli buoni
for (const ev of ['keydown', 'pointerdown', 'pointerup', 'touchstart', 'touchend', 'click']) {
  window.addEventListener(ev, () => Audio.sblocca(), { capture: true, passive: true });
}
window.addEventListener('keydown', (e) => { if (e.key === 'm' || e.key === 'M') Audio.silenzia(); });

let gioco = null;
function avvia() {
  gioco = window.gioco = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'gioco',
    // si disegna a RES volte lo schermo logico: 480x270 -> 1920x1080 (1440x810 sul telefono)
    width: CONFIG.larghezza * RES,
    height: CONFIG.altezza * RES,
    antialias: true,
    backgroundColor: '#1f1430',
    disableContextMenu: true, // niente menu del tasto destro (o CTRL+clic sul Mac) sul gioco
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    // l'audio è tutto in js/audio.js: niente secondo contesto audio di Phaser (su iPhone sono contati)
    audio: { noAudio: true },
    // dopo l'avvio o un rientro dallo sfondo Phaser rallenta per "panicMax" fotogrammi:
    // a 30 fps (iPhone a risparmio energetico) con i 120 di serie il gioco andrebbe a metà
    // velocità per 4 secondi; ne bastano pochi
    fps: { panicMax: 20 },
    scene: [BootScene, MenuScene, AllenamentoScene, ComandiScene, IntroScene,
      ...Object.values(MICROGIOCHI), RisultatoScene, FinaleScene, PausaScene],
  });
  controllaVerso();
}

// aspetta il font (se non arriva entro 2,5 secondi si parte lo stesso con quello di sistema)
const font = document.fonts?.load('600 16px Fredoka') ?? Promise.resolve();
Promise.race([font, new Promise((r) => setTimeout(r, 2500))]).then(avvia, avvia);

// se il font arriva dopo (rete lenta, capita su Safari e sul telefono),
// si ridisegnano le scritte già a schermo, che altrimenti resterebbero col font di sistema
font.then(() => {
  if (!gioco || !document.fonts.check('600 16px Fredoka')) return; // (window.gioco prima dell'avvio è il <div id="gioco">)
  const rifai = (o) => { o.updateText?.(); o.list?.forEach(rifai); };
  for (const s of gioco.scene.getScenes(true)) s.children.list.forEach(rifai);
}, () => {});

// --- telefono ---
const microgiocoInCorso = () => gioco?.scene?.getScenes(true).find((s) => s.scene.key.startsWith('mg_') && s.inCorso);

// in verticale: schermata "Gira il telefono" (in index.html) e microgioco in pausa
function controllaVerso() {
  const verticale = eTouch() && innerHeight > innerWidth;
  document.body.classList.toggle('verticale', verticale);
  if (verticale) microgiocoInCorso()?.pausa();
}
for (const ev of ['resize', 'orientationchange']) window.addEventListener(ev, controllaVerso);
controllaVerso();

// app in sottofondo (telefonata, notifica, cambio app): pausa; al ritorno l'audio si riaccende
document.addEventListener('visibilitychange', () => {
  if (document.hidden) microgiocoInCorso()?.pausa();
  else Audio.riprendi();
});
window.addEventListener('pageshow', () => Audio.riprendi());

// gioco anche senza internet dopo la prima visita (vedi sw.js): solo su https o localhost
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(() => navigator.serviceWorker.ready)
      // già alla prima visita: gli si passano tutti i file scaricati finora (codice, Phaser, font, icone)
      .then((reg) => reg.active?.postMessage({ salva: [new URL('index.html', location.href).href, ...performance.getEntriesByType('resource').map((r) => r.name)] }))
      .catch(() => {});
  });
}
