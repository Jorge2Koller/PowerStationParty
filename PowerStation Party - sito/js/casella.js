// Casella di testo per scrivere nel gioco (Le Perle di Denny): un <input> vero, così sul telefono si apre
// la sua tastiera, ma INVISIBILE. Quello che si vede (la casella, il testo, il cursore che lampeggia) lo
// disegna il gioco, col valore dell'input: valore e cursore, aggiornati dagli eventi "input" e
// "composition..." (i suggerimenti della tastiera Android), che portano sempre il testo vero; i tasti
// (keydown) sulle tastiere del telefono spesso non portano la lettera.
// Perché così: sul telefono a schermo intero (Android) lo schermo intero è solo il contenitore del canvas
// (Phaser ne crea uno suo, col canvas e basta): un input fuori da lì non si vede. L'input quindi sta
// sempre dentro il contenitore del canvas, e lo segue quando entra ed esce dallo schermo intero; ma anche
// dove non si vedesse, il testo è nel gioco.
// - Si mette in unità logiche (lo schermo 480x270) sopra il canvas, sopra la casella disegnata (toccarla
//   le dà il focus), e la segue quando cambia (finestra, rotazione, tastiera che si apre).
// - Finché c'è, i tasti vanno solo a lei (come in dialogo.js): niente scorciatoie del gioco (M, frecce,
//   SPAZIO...), tranne ESC, che passa e mette in pausa. INVIO (o OK) manda la risposta.
// - Computer: si scrive subito, senza clic (il focus ce l'ha lei, e se lo riprende).
// - Telefono: la tastiera si apre solo dentro un tocco (iPhone), quindi c'è il pulsante SCRIVI, che dà
//   il focus alla casella; poi il focus resta, da una risposta all'altra. OK accanto per mandare.
// - tastiera(): se la tastiera del telefono è aperta e fin dove si vede il gioco (visualViewport, in
//   unità logiche), per spostare in alto quello che serve.
// - Il testo dell'input è di almeno 16 pixel: più piccolo, toccandolo, iPhone fa lo zoom sulla pagina.
// Uso: const c = casellaTesto({ invio: (testo) => ..., cambia: () => ... }); c.mettiIn({ casella, ok,
// scrivi }) coi rettangoli { x, y, w, h }; c.valore, c.cursore (dove sta il cursore nel testo),
// c.haFuoco(); c.svuota(), c.trema() (la casella disegnata la fa tremare il gioco), c.aggiorna() (a ogni
// fotogramma: si sposta solo se serve), c.chiudi() (in pausa, alla fine, cambiando schermata).
import { eTouch } from './dispositivo.js';
import { FONT } from './fx.js';

export function casellaTesto({ invio, cambia } = {}) {
  const touch = eTouch();
  const radice = document.createElement('form');
  radice.noValidate = true;
  radice.setAttribute('autocomplete', 'off');
  radice.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;margin:0;padding:0;z-index:40;';
  // (nella pagina tutto è non selezionabile: la casella sì, se no su iPhone non si riesce a scriverci)
  const base = `position:fixed;box-sizing:border-box;margin:0;font-family:${FONT};font-weight:600;-webkit-user-select:text;user-select:text;touch-action:manipulation;`;
  const input = document.createElement('input');
  input.type = 'text';
  input.spellcheck = false;
  for (const [k, v] of [['autocomplete', 'off'], ['autocorrect', 'off'], ['autocapitalize', 'off'], ['enterkeyhint', 'done'], ['inputmode', 'text'], ['maxlength', '24'], ['aria-label', 'La parola giusta']]) input.setAttribute(k, v);
  // invisibile ma vera: c'è, prende il tocco e il focus, apre la tastiera; il testo lo disegna il gioco
  input.style.cssText = base + 'opacity:0;border:0;background:transparent;color:transparent;caret-color:transparent;padding:0 10px;outline:none;text-align:center;';
  const bottone = (testo, colori) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = testo;
    b.style.cssText = base + `-webkit-user-select:none;user-select:none;border-radius:10px;cursor:pointer;padding:0;${colori}`;
    return b;
  };
  const ok = touch ? bottone('OK', 'border:3px solid #1f1430;background:#ffe14a;color:#1f1430;') : null;
  const scrivi = touch ? bottone('SCRIVI', 'border:3px solid #1f1430;background:#7dff9a;color:#1f1430;box-shadow:0 4px 0 rgba(0,0,0,0.35);') : null;
  radice.append(input, ...[ok, scrivi].filter(Boolean));

  let aperta = true, posti = null, chiave = '', pieno = window.visualViewport?.height ?? 0, ultimoInvio = 0;
  const canvas = () => document.querySelector('#gioco canvas');
  // dove sta: nel contenitore del canvas (#gioco, o quello dello schermo intero)
  const aCasa = () => {
    const dove = canvas()?.parentElement ?? document.body;
    if (radice.parentElement === dove) return;
    const f = document.activeElement === input;
    dove.append(radice);
    if (f) input.focus({ preventScroll: true });
    chiave = '';
  };
  aCasa();
  const avvisa = () => { if (aperta) cambia?.(); };
  const manda = () => {
    const ora = performance.now();
    if (ora - ultimoInvio < 60) return;    // (INVIO e il "submit" del modulo possono arrivare insieme)
    ultimoInvio = ora;
    if (input.value.trim()) invio?.(input.value);
  };
  // i tasti vanno alla casella e non al gioco; ESC sì (la pausa)
  const tasti = (e) => {
    if (e.key === 'Escape') return;
    e.stopPropagation();
    if (e.type !== 'keydown') { avvisa(); return; }
    if (e.key === 'Enter') { e.preventDefault(); manda(); }
    else if (!touch && document.activeElement !== input) input.focus({ preventScroll: true });
  };
  window.addEventListener('keydown', tasti, true);
  window.addEventListener('keyup', tasti, true);
  radice.addEventListener('submit', (e) => { e.preventDefault(); manda(); });
  // il testo vero: a ogni cambio (anche i suggerimenti della tastiera, a metà parola) e quando si sposta il cursore
  for (const ev of ['input', 'compositionstart', 'compositionupdate', 'compositionend', 'select', 'focus']) input.addEventListener(ev, avvisa);
  document.addEventListener('selectionchange', avvisa);
  // (la tastiera che si apre e si chiude: si rimette tutto subito, senza aspettare il fotogramma dopo)
  const vista = () => { chiave = ''; avvisa(); };
  window.visualViewport?.addEventListener('resize', vista);
  window.visualViewport?.addEventListener('scroll', vista);
  input.addEventListener('blur', () => {
    if (!aperta) return;
    avvisa();
    // computer: il focus torna alla casella anche se si clicca sul gioco (telefono: torna SCRIVI, vedi aggiorna)
    if (!touch) setTimeout(() => { if (aperta) input.focus({ preventScroll: true }); }, 0);
  });
  // (il focus dentro il tocco: su iPhone è l'unico modo per aprire la tastiera)
  scrivi?.addEventListener('click', () => { input.focus(); conFuoco = null; aggiorna(); avvisa(); });
  if (ok) {
    // OK non deve togliere il focus alla casella, se no la tastiera si chiude
    ok.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    ok.addEventListener('touchend', (e) => { e.preventDefault(); manda(); });
    ok.addEventListener('mousedown', (e) => e.preventDefault());
    ok.addEventListener('click', manda);
  }
  if (!touch) setTimeout(() => { if (aperta) input.focus({ preventScroll: true }); }, 0);

  const metti = (el, q, b, k) => {
    el.style.left = `${b.left + q.x * k}px`; el.style.top = `${b.top + q.y * k}px`;
    el.style.width = `${q.w * k}px`; el.style.height = `${q.h * k}px`;
  };
  let conFuoco = null;
  const aggiorna = () => {
    const cv = canvas();
    if (!cv || !posti || !aperta) return;
    aCasa();
    // SCRIVI c'è solo quando la casella non ha il focus (cioè quando la tastiera è chiusa)
    const f = document.activeElement === input;
    if (scrivi && f !== conFuoco) { conFuoco = f; scrivi.style.display = f ? 'none' : ''; }
    const b = cv.getBoundingClientRect(), k = b.width / 480;
    const c = `${b.left}|${b.top}|${b.width}|${b.height}`;
    if (c === chiave) return;
    chiave = c;
    metti(input, posti.casella, b, k);
    input.style.fontSize = `${Math.max(16, posti.casella.h * k * 0.5)}px`;
    if (ok) { metti(ok, posti.ok, b, k); ok.style.fontSize = `${Math.max(14, posti.ok.h * k * 0.45)}px`; }
    if (scrivi) { const q = posti.scrivi ?? posti.casella; metti(scrivi, q, b, k); scrivi.style.fontSize = `${Math.max(16, q.h * k * 0.5)}px`; }
  };

  return {
    mettiIn(p) { posti = p; chiave = ''; aggiorna(); },
    aggiorna,
    get valore() { return input.value; },
    // dove sta il cursore nel testo (per disegnarlo lì); senza selezione, alla fine
    get cursore() { const s = input.selectionStart; return typeof s === 'number' ? s : input.value.length; },
    svuota() { input.value = ''; avvisa(); },
    trema() {},
    haFuoco: () => document.activeElement === input,
    // la tastiera del telefono: aperta? e fin dove (in unità logiche, dall'alto) si vede il gioco
    tastiera() {
      const vv = window.visualViewport, cv = canvas();
      if (!vv || !cv) return { aperta: false, alto: 0, basso: 270 };
      if (document.activeElement !== input) pieno = Math.max(pieno, vv.height);
      const b = cv.getBoundingClientRect(), y = (v) => Math.max(0, Math.min(270, ((v - b.top) / b.height) * 270));
      return { aperta: touch && document.activeElement === input && vv.height < pieno * 0.8, alto: y(vv.offsetTop), basso: y(vv.offsetTop + vv.height) };
    },
    chiudi() {
      if (!aperta) return;
      aperta = false;
      window.removeEventListener('keydown', tasti, true);
      window.removeEventListener('keyup', tasti, true);
      document.removeEventListener('selectionchange', avvisa);
      window.visualViewport?.removeEventListener('resize', vista);
      window.visualViewport?.removeEventListener('scroll', vista);
      input.blur();
      radice.remove();
    },
  };
}
