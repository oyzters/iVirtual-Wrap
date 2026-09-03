#!/usr/bin/env bash
# Screenshot de un fixture ya preparado con tools/wrap.js
#   tools/shot.sh fixtures/perfil-editar.wrap.html [ancho] [alto]
set -euo pipefail
FILE="$(realpath "${1:?uso: tools/shot.sh <fixture.wrap.html> [ancho] [alto]}")"
W="${2:-1440}"; H="${3:-1200}"
OUT="${FILE%.html}.png"

# Resuelve el binario de Chrome/Chromium por plataforma (google-chrome es el
# nombre del paquete Linux; macOS no lo trae en el PATH por defecto).
CHROME_BIN="${CHROME_BIN:-}"
if [ -z "$CHROME_BIN" ]; then
  for candidate in google-chrome google-chrome-stable chromium chromium-browser \
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    "/Applications/Chromium.app/Contents/MacOS/Chromium"; do
    if command -v "$candidate" >/dev/null 2>&1 || [ -x "$candidate" ]; then
      CHROME_BIN="$candidate"
      break
    fi
  done
fi
: "${CHROME_BIN:?no se encontró Chrome/Chromium; exporta CHROME_BIN con la ruta al ejecutable}"

"$CHROME_BIN" --headless --disable-gpu --allow-file-access-from-files \
  --hide-scrollbars --window-size="$W,$H" --virtual-time-budget="${IVW_WAIT:-8000}" \
  --screenshot="$OUT" "$FILE" >/dev/null 2>&1
printf '→ %s\n' "$OUT"
