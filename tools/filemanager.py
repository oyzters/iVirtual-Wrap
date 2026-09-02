#!/usr/bin/env python3
"""Fixtures del gestor de archivos con y sin archivos dentro.

    python3 tools/filemanager.py [fixtures/perfil-editar.html]

El gestor (mform filemanager) llega vacío en el HTML: la lista de archivos la
pinta el JS de Moodle (M.form_filemanager) y marca el contenedor con
fm-noitems / fm-hasitems según el caso. Este script deja los dos estados en
disco para poder revisarlos sin sesión ni red.

Salida: fixtures/filemanager-vacio.html y fixtures/filemanager-archivo.html
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "fixtures", "perfil-editar.html")
ICON = "/theme/image.php/adaptable/core/1/f/pdf-256"

FILE = """<div class="fp-iconview">
  <div class="fp-file" tabindex="0">
    <a href="#">
      <div class="fp-thumbnail"><img src="{icon}" alt=""></div>
      <div class="fp-filename-field"><div class="fp-filename">Infografia-calidad.pdf</div></div>
    </a>
    <div class="fp-reficons1"></div><div class="fp-reficons2"></div>
  </div>
</div>"""


def build(con_archivo):
    html = open(SRC, encoding="utf8").read()
    estado = "fm-hasitems" if con_archivo else "fm-noitems"
    # El JS marca el estado en el propio .filemanager
    html = re.sub(r'(<div[^>]*\bclass="filemanager)(")', r"\1 " + estado + r"\2", html, count=1)
    html = re.sub(r'(<div[^>]*\bclass="filemanager )([^"]*")', r"\1" + estado + r" \2", html, count=1)
    # fm-loading esconde el contenido hasta que el JS termina de pintar
    html = html.replace("fm-loading", "", 1)
    html = html.replace('<div class="filemanager-loading mdl-align">', '<div class="filemanager-loading mdl-align" style="display:none">', 1)
    if con_archivo:
        html = html.replace('<div class="fp-content"></div>',
                            '<div class="fp-content">' + FILE.format(icon=ICON) + "</div>", 1)
    nombre = "filemanager-archivo" if con_archivo else "filemanager-vacio"
    out = os.path.join(ROOT, "fixtures", nombre + ".html")
    open(out, "w", encoding="utf8").write(html)
    print("→", out)


build(False)
build(True)
