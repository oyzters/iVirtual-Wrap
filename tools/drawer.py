#!/usr/bin/env python3
"""Fixtures del cajón de Mensajería con contenido.

    python3 tools/drawer.py            # usa fixtures/perfil.html

El cajón viene en el HTML de cualquier pantalla, pero vacío: la conversación
y la lista las pinta el JS de Moodle con plantillas Mustache que se piden por
AJAX. Este script rellena esas zonas con el markup que genera ese JS (copiado
de core_message/message_drawer_view_*) para poder ver y ajustar el diseño sin
sesión ni red.

Salida: fixtures/mensajeria.html (conversación), fixtures/mensajeria-lista.html
(bandeja con secciones) y fixtures/notificaciones.html (panel de notificaciones
con avisos, que también llega vacío y lo llena el JS).
"""
import os
import sys
from bs4 import BeautifulSoup

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "fixtures", "perfil.html")
AVATAR = "/theme/image.php/adaptable/core/1/u/f1"

HEADER = """
<div class="d-flex align-items-center">
  <div class="align-self-stretch">
    <a class="h-100 me-2 d-flex align-items-center" href="#" data-route-back role="button">
      <i class="afaicon fa fa-chevron-left fa-fw" aria-hidden="true"></i>
    </a>
  </div>
  <div class="d-flex text-truncate">
    <div class="d-flex align-items-center">
      <img class="rounded-circle" src="{avatar}" alt="" aria-hidden="true" style="height: 38px">
    </div>
    <div class="w-100 text-truncate ms-2">
      <div class="d-flex">
        <strong class="m-0 text-truncate">SEBASTIAN ESCALANTE RAMIREZ</strong>
        <span class="ms-1 text-primary" data-region="favourite-icon-container">
          <i class="afaicon fa fa-star fa-fw" aria-hidden="true"></i>
        </span>
      </div>
      <p class="m-0 font-weight-light text-truncate">En línea</p>
    </div>
  </div>
  <div class="ms-auto dropdown">
    <button class="btn btn-link btn-icon icon-size-3" type="button" data-toggle="dropdown" aria-expanded="false">
      <i class="afaicon fa fa-ellipsis-h fa-fw" aria-hidden="true"></i>
    </button>
    <div class="dropdown-menu pull-right">
      <a class="dropdown-item" href="#" data-action="confirm-unfavourite">Quitar de destacados</a>
      <a class="dropdown-item" href="#" data-action="request-delete-conversation">Borrar conversación</a>
    </div>
  </div>
</div>
""".format(avatar=AVATAR)

MSG_SENT = """
<div class="message clickable d-flex flex-column p-2 mx-1 position-relative send rounded mb-2 mt-2" data-region="message" role="checkbox" aria-checked="false" tabindex="0">
  <div class="tail position-absolute"></div>
  <div class="d-flex align-items-center">
    <div class="ms-auto small text-end time" data-region="time-created">{time}</div>
  </div>
  <div dir="auto" data-region="text-container">{text}</div>
</div>
"""

MSG_RECEIVED = """
<div class="message clickable d-flex flex-column p-2 mx-1 position-relative received rounded mb-2 mt-2" data-region="message" role="checkbox" aria-checked="false" tabindex="0">
  <div class="tail position-absolute"></div>
  <div class="d-flex align-items-center pb-2">
    <div style="flex-shrink: 0">
      <img class="rounded-circle" src="%s" alt="" aria-hidden="true" style="height: 30px">
    </div>
    <div class="text-truncate ps-2 pe-2">
      <h6 class="text-truncate m-0 font-weight-bold">{name}</h6>
    </div>
    <div class="ms-auto small text-end time" data-region="time-created">{time}</div>
  </div>
  <div dir="auto" data-region="text-container">{text}</div>
</div>
""" % AVATAR

FOOTER = """
<div class="d-flex mt-sm-1">
  <textarea dir="auto" data-region="send-message-txt" class="form-control bg-light" rows="3"
            aria-label="Escribir un mensaje..." placeholder="Escribir un mensaje..." style="resize: none"></textarea>
  <div class="position-relative d-flex flex-column">
    <button class="btn btn-link btn-icon icon-size-3 ms-1" aria-label="Emojis" data-action="toggle-emoji-picker">
      <i class="afaicon fa fa-smile-o fa-fw" aria-hidden="true"></i>
    </button>
    <button class="btn btn-link btn-icon icon-size-3 ms-1 mt-auto" aria-label="Enviar mensaje" data-action="send-message">
      <span data-region="send-icon-container"><i class="afaicon fa fa-paper-plane fa-fw" aria-hidden="true"></i></span>
    </button>
  </div>
</div>
"""

CONV_ITEM = """
<a href="#" class="py-0 px-2 d-flex list-group-item list-group-item-action align-items-center" role="button">
  <img class="rounded-circle align-self-start mt-2" src="%s" alt="" aria-hidden="true" style="height: 38px">
  <span class="contact-status icon-size-2 {online}"></span>
  <div class="w-100 text-truncate ms-2 my-2">
    <div class="d-flex"><strong class="m-0 text-truncate">{name}</strong></div>
    <p class="m-0 font-weight-light text-truncate last-message" data-region="last-message"><span>{last}</span></p>
  </div>
  <div class="d-flex align-self-stretch">
    <div class="px-2 py-1 small position-absolute position-right" data-region="last-message-date" aria-hidden="true">{date}</div>
    <div class="{unreadhidden} badge rounded-pill bg-primary align-self-center ms-auto" data-region="unread-count">{unread}</div>
  </div>
</a>
""" % AVATAR

NOTIF_ITEM = """
<div class="content-item-container notification {unread}" data-region="notification-content-item-container" role="listitem">
  <a class="context-link" href="#" data-action="content-item-link" aria-label="{subject}">
    <div class="content-item-body">
      <div class="notification-image"><i class="afaicon fa fa-highlighter fa-fw" aria-hidden="true"></i></div>
      <div class="notification-message">{subject}</div>
    </div>
    <div class="content-item-footer">
      <div class="timestamp">{time}</div>
    </div>
    <a href="#" class="view-more" data-action="view-more">Ver notificación completa</a>
  </a>
</div>
"""

NOTIFICATIONS = [
    dict(unread="unread", time="hace 10 horas 52 mins",
         subject="Esperada en sábado, 29 de agosto de 2026, 15:00: Tipos de lectura."),
    dict(unread="unread", time="hace 20 horas 48 mins",
         subject="Esperada en domingo, 30 de agosto de 2026, 23:59: Actividad 1. Infografía sobre conceptos fundamentales de calidad"),
    dict(unread="", time="hace 2 días",
         subject="Calificación actualizada en 1197C-14393 Calidad de Software"),
]

CONVERSATIONS = [
    dict(name="SEBASTIAN ESCALANTE RAMIREZ", last="Espacio personal", date="21:30", unread="", unreadhidden="hidden", online="online"),
    dict(name="MARIA DEL ROSARIO ANGULO", last="Yo: gracias, ya lo subí", date="Ayer", unread="", unreadhidden="hidden", online=""),
    dict(name="Calidad de Software — Equipo 4", last="ANGEL URQUIDEZ: nos vemos a las 3", date="Lun", unread="3", unreadhidden="", online=""),
]


def unhide(node):
    if node is None:
        return
    cls = [c for c in (node.get("class") or []) if c != "hidden"]
    node["class"] = cls
    if node.has_attr("aria-hidden"):
        node["aria-hidden"] = "false"


def hide(node):
    if node is None:
        return
    cls = node.get("class") or []
    if "hidden" not in cls:
        node["class"] = cls + ["hidden"]
    node["aria-hidden"] = "true"


def fill(soup, node, html):
    node.clear()
    node.append(BeautifulSoup(html, "lxml").body or BeautifulSoup(html, "lxml"))


def load():
    return BeautifulSoup(open(SRC, encoding="utf-8").read(), "lxml")


def open_drawer(soup):
    drawer = soup.select_one('[data-region="right-hand-drawer"]')
    unhide(drawer)
    drawer["class"] = drawer.get("class", []) + ["show"]
    return soup.select_one('[data-region="message-drawer"]')


def conversation(soup):
    app = open_drawer(soup)
    head = app.select_one('.header-container > [data-region="view-conversation"]')
    body = app.select_one('.body-container > [data-region="view-conversation"]')
    foot = app.select_one('.footer-container > [data-region="view-conversation"]')
    for zone in ("header-container", "body-container", "footer-container"):
        hide(app.select_one('.%s > [data-region="view-overview"]' % zone))
    unhide(head)
    content = head.select_one('[data-region="header-content"]')
    unhide(content)
    fill(soup, content, HEADER)
    ph = head.select_one('[data-region="header-placeholder"]')
    if ph:
        ph.decompose()

    unhide(body)
    msgs = body.select_one('[data-region="content-message-container"]')
    unhide(msgs)
    self_msg = msgs.select_one('[data-region="self-conversation-message-container"]')
    unhide(self_msg)
    stream = MSG_SENT.format(time="21:28", text="Recordar: subir el avance del wrap") + \
        MSG_RECEIVED.format(name="SEBASTIAN ESCALANTE RAMIREZ", time="21:29", text="Pendiente revisar el cajón de mensajería") + \
        MSG_SENT.format(time="21:30", text="Listo, queda para mañana temprano")
    msgs.append(BeautifulSoup(stream, "lxml").body)
    holder = body.select_one('[data-region="content-placeholder"]')
    if holder:
        holder.decompose()

    unhide(foot)
    fc = foot.select_one('[data-region="content-messages-footer-container"]')
    unhide(fc)
    fill(soup, fc, FOOTER)
    fph = foot.select_one('[data-region="placeholder-container"]')
    if fph:
        fph.decompose()
    return soup


def overview(soup):
    app = open_drawer(soup)
    for zone in ("header-container", "body-container", "footer-container"):
        hide(app.select_one('.%s > [data-region="view-conversation"]' % zone))
    section = app.select_one('[data-region="view-overview-messages"]')
    if section is None:
        section = app.select_one('.body-container [data-region="lazy-load-list"]')
    toggle = section.select_one('button.overview-section-toggle')
    if toggle:
        toggle["class"] = [c for c in toggle.get("class", []) if c != "collapsed"]
        toggle["aria-expanded"] = "true"
    lazy = section.select_one('[data-region="lazy-load-list"]') or section
    lazy["class"] = [c for c in lazy.get("class", []) if c != "collapse"] + ["show"]
    content = lazy.select_one('[data-region="content-container"]')
    unhide(content)
    items = "".join(CONV_ITEM.format(**c) for c in CONVERSATIONS)
    fill(soup, content, items)
    ph = lazy.select_one('[data-region="placeholder-container"]')
    if ph:
        ph.decompose()
    count = section.select_one('[data-region="section-total-count-container"]')
    unhide(count)
    total = section.select_one('[data-region="section-total-count"]')
    if total:
        total.string = str(len(CONVERSATIONS))
    return soup


def notifications(soup):
    region = soup.select_one(".popover-region-notifications")
    region["class"] = [c for c in region.get("class", []) if c != "collapsed"]
    container = region.select_one('[data-region="popover-region-container"]')
    container["aria-hidden"] = "false"
    lista = region.select_one('[data-region="all-notifications"]')
    fill(soup, lista, "".join(NOTIF_ITEM.format(**n) for n in NOTIFICATIONS))
    hide(region.select_one('[data-region="empty-message"]'))
    loading = region.select_one('.popover-region-content-container > .loading-icon')
    if loading:
        loading.decompose()
    count = region.select_one('[data-region="count-container"]')
    if count:
        unhide(count)
        count.string = "2"
    return soup


for name, build in (("mensajeria", conversation), ("mensajeria-lista", overview),
                    ("notificaciones", notifications)):
    out = os.path.join(ROOT, "fixtures", name + ".html")
    open(out, "w", encoding="utf-8").write(str(build(load())))
    print("→ fixtures/%s.html" % name)
