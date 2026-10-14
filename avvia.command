#!/bin/bash
# Avvia il server locale (senza cache) e apre il gioco nel browser.
# macOS: doppio clic dal Finder. Linux: ./avvia.command da terminale.
cd "$(dirname "$0")" || exit 1

if ! command -v python3 >/dev/null 2>&1; then
  echo "Python 3 non trovato."
  echo "Su Mac installalo da https://www.python.org/downloads/ (oppure con: xcode-select --install)"
  read -r -p "Premi INVIO per chiudere..."
  exit 1
fi

python3 server.py "$@"
