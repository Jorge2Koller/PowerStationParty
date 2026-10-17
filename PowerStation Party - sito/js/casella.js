// Casella di testo HTML sopra il gioco (Le Perle di Denny): un <input> vero, così sul telefono si
// apre la sua tastiera. Si mette in unità logiche (lo schermo 480x270) sopra il canvas e lo segue
// quando cambia (finestra, rotazione, tastiera che si apre).
// - Finché c'è, i tasti vanno solo a lei (come in dialogo.js): niente scorciatoie del gioco (M,
//   frecce, SPAZIO...), tranne ESC, che passa e mette in pausa. INVIO (o OK) manda la risposta.
// - Computer: si scrive subito, senza clic (il focus ce l'ha lei, e se lo riprende).
// - Telefono: la tastiera si apre solo dentro un tocco (iPhone), quindi c'è il pulsante SCRIVI, che
//   dà il focus alla casella; poi il focus resta, da una risposta all'altra. OK accanto per mandare.
// - tastiera(): se la tastiera del telefono è aperta e fin dove si vede il gioco (visualViewport, in
//   unità logiche), per spostare in alto quello che serve.
// Uso: const c = casellaTesto({ invio: (testo) => ... }); c.mettiIn({ casella, ok, scrivi }) coi
// rettangoli { x, y, w, h }; c.svuota(), c.trema(), c.segnaposto('p…'), c.aggiorna() (a ogni
// fotogramma: si sposta solo se serve), c.chiudi() (in pausa, alla fine, cambiando schermata).
import { eTouch } from './dispositivo.js';
import { FONT } from './fx.js';

let stile = null;
const css = () => {
  if (stile) return;
  stile = document.createElement('style');
  stile.textContent = '.casella-gioco::placeholder{color:#8f86a6;opacity:1}';
  document.head.append(stile);
};

export function casellaTesto({ invio } = {}) {
  css();
  const touch = eTouch();
  const radice = document.createElement('form');
  radice.noValidate = true;
  radice.setAttribute('autocomplete', 'off');
  radice.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;margin:0;padding:0;z-index:40;';
  // (nella pagina tutto è non selezionabile: la casella sì, se no su iPhone non si riesce a scriverci)
  const base = `position:fixed;box-sizing:border-box;margin:0;font-family:${FONT};font-weight:600;-webkit-user-select:text;user-select:text;touch-action:manipulation;`;
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'casella-gioco';
  input.spellcheck = false;
  for (const [k, v] of [['autocomplete', 'off'], ['autocorrect', 'off'], ['autocapitalize', 'off'], ['enterkeyhint', 'done'], ['inputmode', 'text'], ['maxlength', '24'], ['aria-label', 'La parola giusta']]) input.setAttribute(k, v);
  input.style.cssText = base + 'border:3px solid #ffe14a;border-radius:10px;background:#1f1430;color:#ffffff;padding:0 10px;outline:none;text-align:center;caret-color:#ffe14a;';
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
  document.body.append(radice);

  let aperta = true, posti = null, chiave = '', pieno = window.visualViewport?.height ?? 0, ultimoInvio = 0;
  const canvas = () => document.querySelector('#gioco canvas');
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
    if (e.type !== 'keydown') return;
    if (e.key === 'Enter') { e.preventDefault(); manda(); }
    else if (!touch && document.activeElement !== input) input.focus({ preventScroll: true });
  };
  window.addEventListener('keydown', tasti, true);
  window.addEventListener('keyup', tasti, true);
  radice.addEventListener('submit', (e) => { e.preventDefault(); manda(); });
  input.addEventListener('blur', () => {
    if (!aperta) return;
    // computer: il focus torna alla casella anche se si clicca sul gioco (telefono: torna SCRIVI, vedi aggiorna)
    if (!touch) setTimeout(() => { if (aperta) input.focus({ preventScroll: true }); }, 0);
  });
  // (il focus dentro il tocco: su iPhone è l'unico modo per aprire la tastiera)
  scrivi?.addEventListener('click', () => { input.focus(); conFuoco = null; aggiorna(); });
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
    // SCRIVI c'è solo quando la casella non ha il focus (cioè quando la tastiera è chiusa)
    const f = document.activeElement === input;
    if (scrivi && f !== conFuoco) { conFuoco = f; scrivi.style.display = f ? 'none' : ''; }
    const b = cv.getBoundingClientRect(), k = b.width / 480;
    const c = `${b.left}|${b.top}|${b.width}|${b.height}`;
    if (c === chiave) return;
    chiave = c;
    metti(input, posti.casella, b, k);
    // (mai sotto i 16 pixel: se no, toccandola, iPhone fa lo zoom su tutta la pagina)
    input.style.fontSize = `${Math.max(16, posti.casella.h * k * 0.5)}px`;
    if (ok) { metti(ok, posti.ok, b, k); ok.style.fontSize = `${Math.max(14, posti.ok.h * k * 0.45)}px`; }
    if (scrivi) { const q = posti.scrivi ?? posti.casella; metti(scrivi, q, b, k); scrivi.style.fontSize = `${Math.max(16, q.h * k * 0.5)}px`; }
  };

  return {
    mettiIn(p) { posti = p; chiave = ''; aggiorna(); },
    aggiorna,
    get valore() { return input.value; },
    svuota() { input.value = ''; },
    segnaposto(s) { input.placeholder = s ?? ''; },
    trema() { input.animate?.([{ transform: 'translateX(0)' }, { transform: 'translateX(-9px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(0)' }], { duration: 320 }); },
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
      input.blur();
      radice.remove();
    },
  };
}
