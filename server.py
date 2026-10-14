"""Server locale per PowerStation Party.

Come `python -m http.server`, ma dice al browser di non tenere in cache i file:
cosi' dopo ogni modifica al codice basta ricaricare la pagina.
Funziona uguale su Windows, Mac e Linux (serve Python 3.7 o piu' recente).
Uso:  py server.py              (Windows: apre anche il browser)
      python3 server.py         (Mac e Linux)
      ... server.py --rete      anche per i telefoni sulla stessa Wi-Fi (stampa l'indirizzo)
      ... server.py --no-browser
"""
import http.server
import os
import socket
import sys
import webbrowser


class SenzaCache(http.server.SimpleHTTPRequestHandler):
    # Tipi dei file dichiarati qui e non presi dal sistema: su alcuni Windows il
    # registro associa .js a "text/plain" e il browser rifiuta i moduli ES.
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".html": "text/html; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".mjs": "text/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".json": "application/json",
        ".webmanifest": "application/manifest+json",
        ".md": "text/markdown; charset=utf-8",
        ".svg": "image/svg+xml",
        ".png": "image/png",
        ".ico": "image/x-icon",
    }

    def do_GET(self):
        if self.nascosto():
            return self.send_error(404)
        super().do_GET()

    def do_HEAD(self):
        if self.nascosto():
            return self.send_error(404)
        super().do_HEAD()

    def nascosto(self):
        """File e cartelle che iniziano col punto (.git, .DS_Store): non si servono,
        tanto meno a chi e' sulla stessa Wi-Fi."""
        return any(parte.startswith(".") for parte in self.path.split("?")[0].split("/"))

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, *args):
        pass  # niente righe di log per ogni file servito


class Server(getattr(http.server, "ThreadingHTTPServer", http.server.HTTPServer)):
    # Su Windows riusare l'indirizzo permetterebbe di aprire una porta gia' occupata;
    # su Mac e Linux invece serve, se no dopo un riavvio la porta resta bloccata per un po'.
    allow_reuse_address = os.name != "nt"


def occupata(porta):
    """True se qualcuno risponde gia' su quella porta (es. un vecchio server rimasto aperto)."""
    try:
        socket.create_connection(("127.0.0.1", porta), timeout=0.3).close()
        return True
    except OSError:
        return False


def ip_locale():
    """Indirizzo del computer sulla rete di casa (quello da aprire sul telefono)."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("10.255.255.255", 1))  # non parte nessun pacchetto: serve solo a scegliere la scheda di rete
            return s.getsockname()[0]
    except OSError:
        try:
            return socket.gethostbyname(socket.gethostname())
        except OSError:
            return None


def main():
    if sys.version_info < (3, 7):
        sys.exit("Serve Python 3.7 o piu' recente.")
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    rete = "--rete" in sys.argv
    # 127.0.0.1 = solo questo computer; 0.0.0.0 = anche gli altri dispositivi della stessa rete
    indirizzo = "0.0.0.0" if rete else "127.0.0.1"
    # prima porta libera a partire dalla 8080
    for porta in range(8080, 8100):
        if occupata(porta):
            continue
        try:
            server = Server((indirizzo, porta), SenzaCache)
            break
        except OSError:
            continue
    else:
        sys.exit("Nessuna porta libera tra 8080 e 8099.")

    url = f"http://localhost:{porta}"
    print(f"PowerStation Party in esecuzione su {url}")
    if rete:
        ip = ip_locale()
        print()
        if ip and not ip.startswith("127."):
            print("  DAL TELEFONO (collegato alla stessa Wi-Fi) apri:")
            print(f"      http://{ip}:{porta}")
        else:
            print("  Non trovo l'indirizzo di rete: il computer e' collegato a una Wi-Fi?")
        print("  Se il computer chiede di consentire le connessioni in entrata a Python, rispondi Consenti.")
        print()
    print("Lascia aperta questa finestra mentre giochi. CTRL+C per chiudere.")
    if "--no-browser" not in sys.argv:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
