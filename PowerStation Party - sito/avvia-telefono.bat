@echo off
rem Come avvia.bat, ma il gioco si apre anche dai telefoni sulla stessa Wi-Fi:
rem nella finestra compare l'indirizzo da scrivere sul telefono.
cd /d "%~dp0"
py server.py --rete
pause
