#!/usr/bin/env bash
# Descarga una pantalla de iVirtual usando tu sesión y la guarda en fixtures/.
#
#   export IVW_COOKIE='MoodleSession=xxxxxxxx'
#   tools/fetch.sh perfil-editar '/user/edit.php?id=35730&course=1'
#
# La cookie NO se guarda en disco ni entra al repo: vive solo en tu shell.
set -euo pipefail

BASE="${IVW_BASE:-https://ivirtual.itson.edu.mx}"
NAME="${1:?uso: tools/fetch.sh <nombre> <ruta-o-url>}"
PATH_OR_URL="${2:?uso: tools/fetch.sh <nombre> <ruta-o-url>}"
: "${IVW_COOKIE:?falta IVW_COOKIE (ver cabecera del script)}"

case "$PATH_OR_URL" in
  http*) URL="$PATH_OR_URL" ;;
  *)     URL="$BASE$PATH_OR_URL" ;;
esac

DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$DIR/fixtures/$NAME.html"

curl -sS --compressed \
  -H "Cookie: $IVW_COOKIE" \
  -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/148 Safari/537.36' \
  -H 'Accept: text/html,application/xhtml+xml' \
  "$URL" -o "$OUT"

if grep -qi 'loginform\|Usted no se ha identificado' "$OUT"; then
  echo "⚠  La respuesta parece la pantalla de login: la cookie caducó o es la equivocada." >&2
fi
printf '→ %s  (%s bytes)\n' "$OUT" "$(stat -c%s "$OUT")"
