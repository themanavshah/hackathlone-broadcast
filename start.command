#!/bin/bash
# Double-click to start the HackAthlone broadcast studio on a Mac.
cd "$(dirname "$0")" || exit 1
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
command -v node >/dev/null || { echo "Install Node.js first: https://nodejs.org"; read -r -p "Press Enter to close"; exit 1; }
echo "HackAthlone broadcast studio: http://127.0.0.1:3131"
echo "Keep this window open while you stream."
(sleep 2; open "http://127.0.0.1:3131") &
node server.mjs
read -r -p "Press Enter to close"
