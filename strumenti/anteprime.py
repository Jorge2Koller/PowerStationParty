# Le anteprime dei microgiochi per la lista "stile Mario Party" (Allenamento e Partita singola):
# apre ogni microgioco nel browser, lo gioca un po' con tasti e clic a caso e lo ferma in tre momenti
# (inizio, metà, fine), poi salva le foto in PowerStation Party - sito/icone/anteprime/:
#   <id>.webp          il riquadro della griglia (piccolo), dal momento di metà
#   <id>-1.webp ...    le tre foto dell'anteprima grande, che si alternano
# Si rilancia quando un microgioco cambia aspetto (anche uno solo: python anteprime.py scontrino).
#
# Uso, dalla cartella del progetto (la prima volta: py -m venv strumenti\.venv, poi
# strumenti\.venv\Scripts\python -m pip install playwright pillow e
# strumenti\.venv\Scripts\python -m playwright install chromium):
#   strumenti\.venv\Scripts\python strumenti\anteprime.py [id ...]
import functools
import http.server
import io
import random
import re
import sys
import threading
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

QUI = Path(__file__).resolve().parent
SITO = QUI.parent / 'PowerStation Party - sito'
USCITA = SITO / 'icone' / 'anteprime'
RIQUADRO = (256, 144)      # il riquadro della griglia
GRANDE = (512, 288)        # l'anteprima grande
QUALITA = 72

# chi gioca nelle foto: uno diverso per microgioco (non l'ospite, se no gioca "contro se stesso")
GIOCATORI = ['riccardo', 'giorgio', 'marco', 'greg', 'guerra', 'sego', 'generale', 'ingiocabile', 'passaseo',
             'bota', 'petri', 'manna', 'pastaffi', 'tini', 'oli', 'boni', 'lori', 'michele', 'giso']
OSPITI = {'spina': 'beppe', 'regrorio': 'greg', 'barba': 'marco', 'panino': 'marsupino', 'mani': 'guerra', 'sego': 'sego',
          'ronda': 'generale', 'blackjack': 'ingiocabile', 'palleggi': 'zio', 'passaseo': 'passaseo', 'bota': 'bota',
          'guida': 'giorgio', 'piovra': 'petri', 'scapoli': 'manna', 'retromarcia': 'pastaffi', 'beerpong': 'marsupino',
          'xfactor': 'tini', 'pizza': 'boni', 'ballata': 'lori', 'proverbi': 'pastaffi', 'scontrino': 'michele'}
# i momenti delle foto (frazioni della durata) e come si gioca: 'misto' = tasti e clic a caso,
# 'spazio' = SPAZIO tenuto e lasciato, 'tasti' = solo tasti (frecce, SPAZIO, numeri)
MOMENTI = (0.18, 0.5, 0.8)
# ('niente' = nessun tasto: per chi a giocare a caso finirebbe prima del tempo)
GIOCO = {'spina': 'spazio', 'blackjack': 'tasti', 'scapoli': 'tasti', 'xfactor': 'tasti', 'passaseo': 'tasti', 'palleggi': 'misto',
         'ballata': 'niente', 'proverbi': 'niente'}


def microgiochi():
    testo = (SITO / 'js' / 'microgames' / 'index.js').read_text(encoding='utf-8')
    return re.findall(r'^\s+(\w+): \w+Scene,', testo, re.M)


class Zitto(http.server.SimpleHTTPRequestHandler):
    # niente righe di log per ogni file, e niente cache (si fotografa sempre il codice di adesso)
    def log_message(self, *args):
        pass

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


def server():
    gestore = functools.partial(Zitto, directory=str(SITO))
    s = http.server.ThreadingHTTPServer(('127.0.0.1', 0), gestore)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s


def salva(png, nome, misura):
    img = Image.open(io.BytesIO(png)).convert('RGB').resize(misura, Image.LANCZOS)
    img.save(USCITA / nome, 'WEBP', quality=QUALITA, method=6)


def apri(pagina, porta, mg, chi):
    pagina.goto(f'http://127.0.0.1:{porta}/index.html?prova={mg}&chi={chi}&seme=7&res=2&foto')
    pagina.wait_for_function(f"window.gioco?.scene?.getScene?.('mg_{mg}')?.inCorso", timeout=90000)


def foto(pagina, porta, mg, chi):
    apri(pagina, porta, mg, chi)
    durata = pagina.evaluate(f"gioco.scene.getScene('mg_{mg}').durata")
    modo, scatti = GIOCO.get(mg, 'misto'), []
    for k, f in enumerate(MOMENTI):
        t = durata * f
        # si gioca (a caso) fino al momento giusto, poi il microgioco si ferma lì per la foto; se a
        # giocare a caso è finito prima, si riapre e si arriva lì senza toccare niente
        while True:
            s = pagina.evaluate(f"(() => {{ const s = gioco.scene.getScene('mg_{mg}'); return [s.trascorso, s.inCorso]; }})()")
            if s[0] >= t - 0.4:
                break
            if not s[1]:
                apri(pagina, porta, mg, chi)
                modo = 'niente'
                continue
            if modo == 'niente':
                pass
            elif modo == 'spazio':
                pagina.keyboard.down('Space')
                pagina.wait_for_timeout(random.randint(300, 900))
                pagina.keyboard.up('Space')
            else:
                if random.random() < 0.35:
                    pagina.keyboard.press(random.choice(['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '1', '2']))
                if modo == 'misto' and random.random() < 0.3:
                    pagina.mouse.click(random.uniform(120, 840), random.uniform(120, 480))
            pagina.wait_for_timeout(120)
        pagina.evaluate(f"""(t) => new Promise((ok) => {{
          const s = gioco.scene.getScene('mg_{mg}');
          const f = () => {{ if (s.trascorso >= t) {{ s.events.off('postupdate', f); s.scene.pause(); ok(); }} }};
          s.events.on('postupdate', f);
        }})""", t)
        scatti.append(pagina.locator('canvas').screenshot())
        pagina.evaluate(f"gioco.scene.getScene('mg_{mg}').scene.resume(); 0")
    salva(scatti[1], f'{mg}.webp', RIQUADRO)
    for k, png in enumerate(scatti):
        salva(png, f'{mg}-{k + 1}.webp', GRANDE)


def main():
    random.seed(7)
    tutti = microgiochi()
    scelti = sys.argv[1:] or tutti
    USCITA.mkdir(parents=True, exist_ok=True)
    s = server()
    with sync_playwright() as p:
        browser = p.chromium.launch()
        pagina = browser.new_page(viewport={'width': 960, 'height': 540})   # (res=2: 960x540, basta per le foto)
        errori = []
        pagina.on('pageerror', lambda e: errori.append(str(e)))
        for mg in scelti:
            liberi = [g for g in GIOCATORI if g != OSPITI.get(mg)]
            chi = liberi[(tutti.index(mg) * 7) % len(liberi)]
            foto(pagina, s.server_address[1], mg, chi)
            print(f'{mg:12} fatto ({chi})' + (f'  ERRORI: {errori}' if errori else ''))
            errori.clear()
        browser.close()
    s.shutdown()


if __name__ == '__main__':
    main()
