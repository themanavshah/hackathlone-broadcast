#!/bin/bash
# Double-click to set up OBS for HackAthlone 2026 on a Mac. Close OBS first.
cd "$(dirname "$0")" || exit 1
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
command -v node >/dev/null || { echo "Install Node.js first: https://nodejs.org"; read -r -p "Press Enter to close"; exit 1; }
node obs/setup-obs.mjs --install
echo
read -r -n 1 -s -p "Done. Press any key to close."
