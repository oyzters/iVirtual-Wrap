#!/usr/bin/env bash
# Screenshot de un fixture ya preparado con tools/wrap.js
#   tools/shot.sh fixtures/perfil-editar.wrap.html [ancho] [alto]
set -euo pipefail
FILE="$(realpath "${1:?uso: tools/shot.sh <fixture.wrap.html> [ancho] [alto]}")"
W="${2:-1440}"; H="${3:-1200}"
OUT="${FILE%.html}.png"
google-chrome --headless --disable-gpu --allow-file-access-from-files \
  --hide-scrollbars --window-size="$W,$H" --virtual-time-budget="${IVW_WAIT:-8000}" \
  --screenshot="$OUT" "$FILE" >/dev/null 2>&1
printf '→ %s\n' "$OUT"
