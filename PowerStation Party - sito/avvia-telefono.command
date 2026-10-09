#!/bin/bash
# Come avvia.command, ma il gioco si apre anche dai telefoni sulla stessa Wi-Fi:
# nella finestra compare l'indirizzo da scrivere sul telefono (es. http://192.168.1.23:8080).
cd "$(dirname "$0")" || exit 1

if ! command -v python3 >/dev/null 2>&1; then
  echo "Python 3 non trovato."
  echo "Su Mac installalo da https://www.python.org/downloads/ (oppure con: xcode-select --install)"
  read -r -p "Premi INVIO per chiudere..."
  exit 1
fi

python3 server.py --rete "$@"
