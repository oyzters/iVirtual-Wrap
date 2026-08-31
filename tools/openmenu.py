#!/usr/bin/env python3
"""Deja un menú desplegable abierto en un fixture, para poder verlo y ajustarlo.

    python3 tools/openmenu.py fixtures/reportes.html .filters-dropdown

Escribe fixtures/<nombre>-open.html con el menú marcado como abierto (igual que
hace Bootstrap al pulsar el botón: clase `show` en el menú y en su contenedor,
`aria-expanded="true"` en el disparador).
"""
import os
import sys
from bs4 import BeautifulSoup

src = sys.argv[1] if len(sys.argv) > 1 else None
sel = sys.argv[2] if len(sys.argv) > 2 else ".dropdown-menu"
if not src:
    print(__doc__)
    sys.exit(1)

soup = BeautifulSoup(open(src, encoding="utf-8").read(), "lxml")
menu = soup.select_one(sel)
if menu is None:
    print("sin coincidencias para " + sel)
    sys.exit(1)

menu["class"] = (menu.get("class") or []) + ["show"]
menu["style"] = (menu.get("style", "") + ";display:block").lstrip(";")

box = menu.parent
if box is not None:
    box["class"] = (box.get("class") or []) + ["show"]
    trigger = box.find(["button", "a"], recursive=False)
    if trigger is not None:
        trigger["aria-expanded"] = "true"
        trigger["class"] = (trigger.get("class") or []) + ["show"]

out = src.replace(".html", "") + "-open.html"
open(out, "w", encoding="utf-8").write(str(soup))
print("→ " + out)
