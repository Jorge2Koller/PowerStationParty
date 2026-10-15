// Finestra sopra al gioco, per quello che in Phaser è scomodo: copiare e incollare un testo
// (il codice del salvataggio) e le conferme importanti. È HTML normale, disegnato coi colori
// del gioco; mentre è aperta i tasti non arrivano al gioco (si può scrivere nella casella).
//
//   dialogo({ titolo, testo, area: { valore, solaLettura, segnaposto }, pulsanti: [{ testo, azione, principale }] })
//   L'azione riceve il testo della casella; se restituisce false la finestra resta aperta.
//   ESC o un tocco fuori chiudono (come "Annulla").

let aperto = null;

export function dialogo({ titolo, testo = '', area = null, pulsanti = [], allaChiusura = null }) {
  aperto?.chiudi();
  const fondo = document.createElement('div');
  fondo.style.cssText = 'position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:rgba(20,12,32,0.72);padding:12px;box-sizing:border-box;';
  const box = document.createElement('div');
  box.style.cssText = "max-width:560px;width:100%;max-height:100%;overflow:auto;background:#1f1430;border:3px solid #ffe14a;border-radius:14px;padding:14px 16px;box-sizing:border-box;color:#fff;font:600 15px Fredoka,'Trebuchet MS',sans-serif;box-shadow:0 6px 0 rgba(0,0,0,0.35);";
  const h = document.createElement('div');
  h.textContent = titolo;
  h.style.cssText = 'color:#ffe14a;font-size:20px;margin-bottom:6px;';
  const p = document.createElement('div');
  p.textContent = testo;
  p.style.cssText = 'white-space:pre-line;line-height:1.3;margin-bottom:10px;color:#fff3d6;';
  box.append(h, p);
  let casella = null;
  if (area) {
    casella = document.createElement('textarea');
    casella.value = area.valore ?? '';
    casella.readOnly = !!area.solaLettura;
    casella.placeholder = area.segnaposto ?? '';
    casella.spellcheck = false;
    casella.style.cssText = 'width:100%;height:96px;box-sizing:border-box;border-radius:8px;border:2px solid #8a7aa8;background:#140c20;color:#fff;font:13px ui-monospace,Menlo,monospace;padding:8px;resize:vertical;word-break:break-all;';
    box.append(casella);
  }
  const riga = document.createElement('div');
  riga.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end;margin-top:10px;';
  const messaggio = document.createElement('div');
  messaggio.style.cssText = 'margin-top:8px;min-height:1em;color:#7dff9a;';
  const chiudi = () => {
    if (aperto !== stato) return;
    aperto = null;
    window.removeEventListener('keydown', tasti, true);
    fondo.remove();
    allaChiusura?.();
  };
  const stato = { chiudi, messaggio: (s, errore = false) => { messaggio.textContent = s; messaggio.style.color = errore ? '#ff9a8a' : '#7dff9a'; } };
  for (const b of pulsanti) {
    const el = document.createElement('button');
    el.type = 'button';
    el.textContent = b.testo;
    el.style.cssText = `font:600 15px Fredoka,'Trebuchet MS',sans-serif;padding:9px 16px;border-radius:999px;border:2px solid #ffe14a;cursor:pointer;`
      + (b.principale ? 'background:#ffe14a;color:#1f1430;' : b.pericolo ? 'background:#c0392b;color:#fff;border-color:#ff9a8a;' : 'background:transparent;color:#fff;');
    el.addEventListener('click', () => { if (b.azione?.(casella?.value ?? '', stato) !== false) chiudi(); });
    riga.append(el);
  }
  box.append(riga, messaggio);
  fondo.append(box);
  fondo.addEventListener('pointerdown', (e) => { if (e.target === fondo) chiudi(); });
  // i tasti restano alla finestra (si scrive nella casella); ESC chiude
  const tasti = (e) => { e.stopPropagation(); if (e.key === 'Escape') { e.preventDefault(); chiudi(); } };
  window.addEventListener('keydown', tasti, true);
  for (const ev of ['keyup', 'keypress']) fondo.addEventListener(ev, (e) => e.stopPropagation());
  document.body.append(fondo);
  if (casella) setTimeout(() => { casella.focus(); if (area.solaLettura) casella.select(); }, 50);
  aperto = stato;
  return stato;
}

export const dialogoAperto = () => !!aperto;
