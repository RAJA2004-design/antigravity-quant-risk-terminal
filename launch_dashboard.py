"""
Antigravity Quant Risk Terminal — Local Dashboard Launcher
==========================================================
Launches a lightweight local HTTP server and opens the dashboard in your default browser.
Ensures local telemetry JSON files (market_data.json, sectors_config.json) load seamlessly without CORS restrictions.
"""

import http.server
import socketserver
import webbrowser
from pathlib import Path
import os
import sys

PORT = 8000
DIRECTORY = Path(__file__).resolve().parent

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)

    def log_message(self, format, *args):
        # Keep terminal output clean
        pass

def launch():
    os.chdir(str(DIRECTORY))
    url = f"http://localhost:{PORT}/dashboard.html"
    print("=" * 68)
    print(" ANTIGRAVITY QUANT RISK TERMINAL — INDIAN EQUITY DASHBOARD")
    print("=" * 68)
    print(f"[*] Serving dashboard at: {url}")
    print("[*] Opening your default web browser...")
    print("[*] Press Ctrl + C to stop the server at any time.")
    print("=" * 68)

    # Open browser automatically
    webbrowser.open(url)

    # Allow port reuse so re-launching doesn't raise OSError
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[OK] Dashboard server stopped.")
            sys.exit(0)

if __name__ == "__main__":
    launch()
