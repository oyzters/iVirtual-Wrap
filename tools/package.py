"""
Arma el .zip que se sube a la Chrome Web Store.

    python tools/package.py            ->  dist/<nombre>-<versión>.zip

La tienda espera el manifest.json en la RAÍZ del zip, así que se comprime el
contenido de extension/, no la carpeta. El nombre y la versión salen del propio
manifest: para publicar una actualización basta con subir "version" ahí.

Antes de comprimir valida lo que la tienda rechazaría: archivos referenciados
por el manifest que no existen, una descripción de más de 132 caracteres y
restos de depuración. Mismo script en CIA-Wrap e iVirtual-Wrap.
"""
import json
import re
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXT = ROOT / "extension"
DIST = ROOT / "dist"
SKIP = {".DS_Store", "Thumbs.db", "desktop.ini"}

manifest = json.loads((EXT / "manifest.json").read_text(encoding="utf-8"))
errors = []

# 1. todo lo que declara el manifest existe
refs = set(manifest.get("icons", {}).values())
action = manifest.get("action", {})
refs |= set(action.get("default_icon", {}).values())
if action.get("default_popup"):
    refs.add(action["default_popup"])
if manifest.get("background", {}).get("service_worker"):
    refs.add(manifest["background"]["service_worker"])
for cs in manifest.get("content_scripts", []):
    refs |= set(cs.get("css", [])) | set(cs.get("js", []))
errors += [f"falta {r}" for r in sorted(refs) if not (EXT / r).exists()]

# 2. límites de la tienda
if len(manifest.get("description", "")) > 132:
    errors.append(f"description de {len(manifest['description'])} caracteres (máximo 132)")
if "128" not in manifest.get("icons", {}):
    errors.append("falta el ícono de 128 px")

# 3. restos de depuración que un revisor leería como manejo de datos
for f in EXT.rglob("*.js"):
    text = f.read_text(encoding="utf-8", errors="ignore")
    for pat in (r"\bdebugger\b", r"CAPTURA TEMPORAL", r"execCommand\(['\"]copy"):
        if re.search(pat, text):
            errors.append(f"{f.relative_to(ROOT)}: contiene {pat}")

if errors:
    print("No se empaquetó:\n  " + "\n  ".join(errors))
    sys.exit(1)

slug = re.sub(r"[^a-z0-9]+", "-", manifest["name"].lower()).strip("-")
DIST.mkdir(exist_ok=True)
out = DIST / f"{slug}-{manifest['version']}.zip"
files = sorted(p for p in EXT.rglob("*") if p.is_file() and p.name not in SKIP)
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for p in files:
        z.write(p, p.relative_to(EXT).as_posix())
print(f"{out.relative_to(ROOT)}  ({len(files)} archivos, {out.stat().st_size // 1024} KB)")
