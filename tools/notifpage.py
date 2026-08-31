#!/usr/bin/env python3
"""Fixture de la pantalla completa de Notificaciones, con avisos.

    tools/fetch.sh notificaciones-popup '/message/output/popup/notifications.php'
    python3 tools/notifpage.py

/message/output/popup/notifications.php llega vacía: la lista de la izquierda y
el detalle de la derecha los pinta el JS de Moodle (message_popup/…) con las
plantillas notification_content_item, notification_area_content_area_header,
…_content y …_footer. Este script rellena esas zonas con el markup que genera
ese JS para poder ver y ajustar el diseño sin sesión ni red.

Salida: fixtures/notificaciones-pagina.html
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "fixtures", "notificaciones-popup.html")
OUT = os.path.join(ROOT, "fixtures", "notificaciones-pagina.html")
ICON = '<i class="afaicon fa fa-marker fa-fw" title="Imagen de notificación" role="img" aria-label="Imagen de notificación"></i>'

# (asunto, "hace…", leída, seleccionada)
ITEMS = [
    ("Esperada en martes, 1 de septiembre de 2026, 16:30: Ley de Ohm", "hace 3 horas 12 mins", True, False),
    ("Uted tiene tareas pendientes para dentro de 7 días", "hace 18 horas 30 mins", True, True),
    ("Calificación de Práctica 3: Divisor de voltaje", "hace 1 día 4 horas", True, False),
    ("Nuevo mensaje del foro Avisos en Ingeniería de Requisitos", "hace 2 días", False, False),
    ("Esperada en viernes, 21 de agosto de 2026, 23:59: Reporte de laboratorio", "hace 9 días", True, False),
]

DETAIL = """
<p>Hola SEBASTIAN,</p>
<p>Las siguientes tareas están programadas para entregarse en <strong>domingo, 6 de septiembre de 2026</strong>.</p>
<ul>
<li><strong>Actividad 1. Elegir proyecto y equipo (se Sube Individual)</strong> en el curso Ingeniería de Requisitos<br/>
<strong>Esperada: 11:59 PM</strong><br/>
<a href="/mod/assign/view.php?id=1677242&amp;action=view">Ir a actividad</a></li>
</ul>
"""


def item(subject, when, read, selected):
    classes = "content-item-container notification"
    if not read:
        classes += " unread"
    if selected:
        classes += " selected"
    return f"""
<div class="{classes}" data-region="notification-content-item-container" data-id="0" role="listitem">
    <div tabindex="0" aria-label="{subject}">
        <div class="content-item-body">
            <div class="notification-image">{ICON}</div>
            <div class="notification-message">{subject}</div>
        </div>
        <div class="content-item-footer">
            <div class="timestamp">{when}</div>
        </div>
    </div>
</div>"""


def main():
    html = open(SRC, encoding="utf8").read()
    lista = "".join(item(*i) for i in ITEMS)
    header = (
        f'<div class="image-container">{ICON}</div>'
        '<div class="subject-container">Uted tiene tareas pendientes para dentro de 7 días</div>'
        '<div class="timestamp">hace 18 horas 30 mins</div>'
    )
    footer = '<a href="/mod/assign/view.php?id=1677242&amp;action=view">Ir a: Actividad 1</a>'

    # control-area: la lista
    html = html.replace(
        '<div class="content" data-region="content"></div>\n        <div class="empty-text">Usted no tiene notificaciones</div>',
        f'<div class="content" data-region="content" role="list">{lista}</div>\n        <div class="empty-text" style="display:none">Usted no tiene notificaciones</div>',
        1,
    )
    # content-area: cabecera, cuerpo y pie del aviso abierto
    html = html.replace(
        '<div class="header" data-region="header"></div>\n        <div class="content" data-region="content"></div>\n'
        '        <div class="empty-text">Seleccionar de entre la lista de notificaciones a un lado para ver más detalles</div>\n'
        '        <div class="footer" data-region="footer"></div>',
        f'<div class="header" data-region="header">{header}</div>\n        <div class="content" data-region="content">{DETAIL}</div>\n'
        '        <div class="empty-text" style="display:none">Seleccionar de entre la lista de notificaciones a un lado para ver más detalles</div>\n'
        f'        <div class="footer" data-region="footer">{footer}</div>',
        1,
    )
    # la zona de contenido sólo se muestra cuando el JS marca el aviso abierto
    html = re.sub(r'(<div class="notification-area"[^>]*)', r'\1', html)
    open(OUT, "w", encoding="utf8").write(html)
    print("→", OUT)


if __name__ == "__main__":
    main()
