/* iVirtual Wrap — enhance.js
   Reestructura de DOM compartida por la extensión (content.js) y el
   userscript/bookmarklet (build/core.js). Fuente única: si algo se toca aquí,
   corre `node build/build.js` para regenerar los gemelos.

   Todo lo que se inyecta lleva id/clase con prefijo `ivw-` y la CSS lo oculta
   cuando el flag está en OFF, así el toggle sigue revirtiendo la vista entera. */
(function () {
  var SUPPORT_FALLBACK = [
    { t: "Recuperar contraseña", h: "https://apps9.itson.edu.mx/PortalSistemas/CambioPass/RecuperaPassword" },
    { t: "Mesa de ayuda", h: "https://apps9.itson.edu.mx/MesaAyudaITSON/Inicio/Aviso" },
    { t: "Calendario escolar", h: "https://apps11.itson.edu.mx/CalendarioEscolar/Calendario/Calendario" },
    { t: "Sistema bibliotecario", h: "https://sib.itson.edu.mx/" },
    { t: "Portal de sistemas", h: "https://apps9.itson.edu.mx/PortalSistemas" }
  ];

  // Glifos (SVG inline, stroke currentColor) por palabra clave del enlace.
  var ICONS = {
    key: '<path d="M14 7a4 4 0 1 1-3.2 6.4L4 20H2v-2l6.6-6.8A4 4 0 0 1 14 7Z"/><circle cx="15.5" cy="7.5" r=".6" fill="currentColor"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.6 2.6 0 1 1 3.4 2.5c-.6.2-.9.7-.9 1.3v.4"/><circle cx="12" cy="17" r=".7" fill="currentColor"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5Z"/><path d="M19 18v3H6.5A2.5 2.5 0 0 1 4 18.5"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    link: '<path d="M10 13a4 4 0 0 0 5.7 0l2.6-2.6A4 4 0 0 0 12.6 4.7l-1.5 1.5"/><path d="M14 11a4 4 0 0 0-5.7 0l-2.6 2.6a4 4 0 0 0 5.7 5.7l1.5-1.5"/>'
  };

  function iconFor(text) {
    var t = (text || "").toLowerCase();
    if (/contrase|password|clave/.test(t)) return ICONS.key;
    if (/ayuda|soporte|mesa|ticket/.test(t)) return ICONS.help;
    if (/calendario|fecha/.test(t)) return ICONS.calendar;
    if (/biblio|libro|tutorial|manual/.test(t)) return ICONS.book;
    if (/portal|sistema/.test(t)) return ICONS.grid;
    return ICONS.link;
  }

  function svg(paths) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + "</svg>";
  }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function textOf(node) {
    return (node.textContent || "").replace(/\s+/g, " ").trim();
  }

  // Texto real, sin lo que solo existe para lectores de pantalla ("Bloques", etc.):
  // esos <h2 class="sr-only"> hacían pasar por "con contenido" a regiones vacías.
  function visibleTextLen(node) {
    var len = textOf(node).length;
    var sr = node.querySelectorAll(".sr-only, .visually-hidden, .accesshide");
    for (var i = 0; i < sr.length; i++) len -= textOf(sr[i]).length;
    return len;
  }

  /* ---------- 1. Marca en el topbar (el lado izquierdo estaba vacío) ---------- */
  function brand(topbarInner) {
    if (!topbarInner || document.getElementById("ivw-brand")) return;
    var a = el("a", null,
      '<span class="ivw-brand-mark" aria-hidden="true">iV</span>' +
      '<span class="ivw-brand-text"><strong>iVirtual</strong><small>ITSON</small></span>');
    a.id = "ivw-brand";
    a.href = "https://ivirtual.itson.edu.mx/";
    a.setAttribute("aria-label", "iVirtual — Inicio");
    topbarInner.insertBefore(a, topbarInner.firstChild);
  }

  /* ---------- 2. Accesos rápidos: leerlos del bloque real de soporte ---------- */
  function quickLinks() {
    var out = [];
    var seen = {};
    var anchors = document.querySelectorAll(
      "#block-region-side-post .block_html .content a[href], #frontblockregion .block_html .content a[href]"
    );
    for (var i = 0; i < anchors.length; i++) {
      var t = textOf(anchors[i]);
      var h = anchors[i].href;
      if (!t || t.length > 42 || seen[h]) continue;
      seen[h] = 1;
      out.push({ t: t, h: h });
      if (out.length === 5) break;
    }
    return out.length >= 3 ? out : SUPPORT_FALLBACK;
  }

  /* ---------- 3. Portada de invitado: hero + CTA + accesos ---------- */
  function guestFrontpage() {
    if (!document.body || document.body.id !== "page-site-index") return;
    if (!document.body.classList.contains("notloggedin")) return;
    if (document.getElementById("ivw-guest")) return;

    var anchor = document.querySelector(".slidewrap") || document.querySelector("#frontblockregion");
    if (!anchor || !anchor.parentNode) return;

    var links = quickLinks().map(function (l) {
      return '<li><a href="' + l.h + '"><span class="ivw-ql-icon">' + svg(iconFor(l.t)) +
        "</span><span>" + l.t + "</span>" +
        '<span class="ivw-ql-go" aria-hidden="true">' + svg('<path d="M9 6l6 6-6 6"/>') + "</span></a></li>";
    }).join("");

    var sec = el("section", null,
      '<div class="ivw-guest-inner">' +
        '<div class="ivw-guest-main">' +
          '<span class="ivw-eyebrow">Instituto Tecnológico de Sonora</span>' +
          "<h1>Tus cursos del semestre, en un solo lugar</h1>" +
          "<p>Entra con tu cuenta ITSON para consultar cursos, tareas, calificaciones " +
          "y avisos de tus profesores.</p>" +
          '<div class="ivw-cta">' +
            '<a class="ivw-btn ivw-btn-primary" href="https://ivirtual.itson.edu.mx/login/index.php">Ingresar</a>' +
            '<a class="ivw-btn ivw-btn-ghost" href="https://ivirtual.itson.edu.mx/course/search.php">Buscar un curso</a>' +
          "</div>" +
          '<p class="ivw-note">¿Olvidaste tu contraseña? ' +
          '<a href="https://apps9.itson.edu.mx/PortalSistemas/CambioPass/RecuperaPassword">Recupérala aquí</a>.</p>' +
        "</div>" +
        '<aside class="ivw-guest-links" aria-label="Accesos rápidos">' +
          "<h2>Accesos rápidos</h2><ul>" + links + "</ul>" +
        "</aside>" +
      "</div>");
    sec.id = "ivw-guest";
    anchor.parentNode.insertBefore(sec, anchor.nextSibling);
  }

  /* ---------- 4. Colapsar contenedores vacíos (huecos blancos de la portada) ---------- */
  function hideEmpties() {
    var sel = "#frontblockregion, #maincontainer, #page-navbar, .slidewrap + .container, #page > .container";
    var nodes = document.querySelectorAll(sel);
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.closest("#ivw-guest")) continue;
      var hasContent = visibleTextLen(n) > 0 ||
        n.querySelector("img, .block, form, table, .course-content, .courses, video, iframe");
      n.setAttribute("data-ivw-empty", hasContent ? "0" : "1");
    }
  }

  /* ---------- 5. Chrome de Moodle: tabs al topbar, quitar duplicados ---------- */
  /* Menú principal del topbar: navegación y estado ----------
     El menú se mueve del `nav` del tema al topbar del wrap, y ahí los
     manejadores que Adaptable engancha a su barra original siguen cazando el
     click sin dejar que el enlace navegue: "Cursos", "Tablero" y compañía se
     quedaban muertos con el wrap encendido. Cada enlace con destino real
     navega por su cuenta, y el del apartado en el que estás se marca. */
  function topnavLinks(menu) {
    if (!menu) return;
    var links = menu.querySelectorAll("a.nav-link[href]");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var href = a.getAttribute("href") || "";
      var esMenu = a.classList.contains("dropdown-toggle") ||
        (a.getAttribute("data-toggle") === "dropdown");
      if (!href || href === "#" || href.charAt(0) === "#" || esMenu) continue;

      if (!a.dataset.ivwNav) {
        a.dataset.ivwNav = "1";
        a.addEventListener("click", function (ev) {
          // Click normal solamente: ctrl/cmd/mayúsculas y botón central
          // siguen abriendo en pestaña nueva como siempre.
          if (ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
          ev.preventDefault();
          ev.stopPropagation();
          window.location.href = ev.currentTarget.href;
        }, true);
      }

      // Apartado actual: /my/courses.php, /my/, /calendar/…
      var destino = a.pathname || "";
      var aqui = location.pathname || "";
      var actual = destino && (aqui === destino ||
        (destino !== "/" && aqui.indexOf(destino.replace(/\/index\.php$/, "/")) === 0));
      if (actual) a.setAttribute("data-ivw-current", "1");
      else a.removeAttribute("data-ivw-current");
    }
  }

  /* Desplegables del menú principal ----------
     El tema abre estos menús con su propio CSS de hover, colgado del `nav`
     original; al mover el menú al topbar del wrap ese CSS ya no alcanza y
     "Este curso" se quedaba mudo. Aquí el desplegable lo maneja el wrap:
     click para abrir, click fuera o Escape para cerrar, y submenús que no
     cierran a su padre. */
  function cerrarMenus(salvo) {
    var abiertos = document.querySelectorAll(".ivw-topnav .ivw-open, #adaptable-user-nav .ivw-open");
    for (var i = 0; i < abiertos.length; i++) {
      var li = abiertos[i];
      if (salvo && (li === salvo || li.contains(salvo))) continue;
      li.classList.remove("ivw-open");
      var t = li.querySelector(":scope > a[data-toggle='dropdown'], :scope > a.dropdown-toggle");
      if (t) t.setAttribute("aria-expanded", "false");
    }
  }

  function topnavDropdowns(menu) {
    if (!menu) return;
    var togglers = menu.querySelectorAll("a.dropdown-toggle, a[data-toggle='dropdown']");
    for (var i = 0; i < togglers.length; i++) {
      var t = togglers[i];
      if (t.dataset.ivwDrop) continue;
      t.dataset.ivwDrop = "1";
      t.addEventListener("click", function (ev) {
        var a = ev.currentTarget;
        var li = a.parentElement;
        if (!li || !li.querySelector(":scope > .dropdown-menu")) return;
        ev.preventDefault();
        ev.stopPropagation();
        var abierto = li.classList.contains("ivw-open");
        cerrarMenus(abierto ? null : li);
        li.classList.toggle("ivw-open", !abierto);
        a.setAttribute("aria-expanded", abierto ? "false" : "true");
      }, true);
    }

    if (window.__ivwDropWatch) return;
    window.__ivwDropWatch = 1;
    document.addEventListener("click", function (ev) {
      if (!ev.target.closest ||
          !ev.target.closest(".ivw-topnav .ivw-open, #adaptable-user-nav .ivw-open")) cerrarMenus(null);
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") cerrarMenus(null);
    });
  }

  /* Selector de idioma ----------
     Moodle solo manda el <li class="langmenu"> en algunas pantallas (el
     Tablero sí, una actividad como Asistencia no), así que el globo aparecía
     y desaparecía al navegar. Aquí se fija: si el tema lo manda se mueve al
     topbar (y se memorizan los idiomas de esa lista para el resto de la
     sesión); si no lo manda, el wrap dibuja el suyo con esos mismos idiomas.
     El desplegable lo abre el wrap, igual que los del menú principal. */
  var LANGS_FALLBACK = [
    { code: "es_mx", name: "Español - México ‎(es_mx)‎" },
    { code: "en", name: "English ‎(en)‎" }
  ];

  function langActual() {
    var m = /\blang-([a-z0-9_]+)\b/i.exec(document.body.className || "");
    if (m) return m[1].toLowerCase();
    return (document.documentElement.lang || "es_mx").replace(/-/g, "_").toLowerCase();
  }

  function langUrl(code) {
    try {
      var u = new URL(location.href);
      u.searchParams.set("lang", code);
      return u.toString();
    } catch (e) {
      return location.pathname + "?lang=" + code;
    }
  }

  function langsGuardar(lista) {
    try { sessionStorage.setItem("ivw-langs", JSON.stringify(lista)); } catch (e) { /* sin storage */ }
  }

  function langsLeer() {
    try {
      var v = JSON.parse(sessionStorage.getItem("ivw-langs") || "null");
      if (v && v.length) return v;
    } catch (e) { /* sin storage */ }
    return null;
  }

  function langsDe(li) {
    var lista = [];
    var items = li.querySelectorAll(".dropdown-menu a[href*='lang=']");
    for (var i = 0; i < items.length; i++) {
      var code = /[?&]lang=([^&#]+)/.exec(items[i].getAttribute("href") || "");
      if (!code) continue;
      lista.push({ code: decodeURIComponent(code[1]), name: textOf(items[i]) });
    }
    return lista;
  }

  function langMenuNuevo() {
    var lista = langsLeer() || LANGS_FALLBACK;
    var actual = langActual();
    var li = document.createElement("li");
    li.className = "nav-item dropdown my-auto langmenu";
    li.dataset.ivwLang = "1";

    var nombre = "";
    var opciones = "";
    for (var i = 0; i < lista.length; i++) {
      var esActual = lista[i].code.toLowerCase() === actual;
      if (esActual) nombre = lista[i].name;
      opciones += '<li><a class="dropdown-item' + (esActual ? " active" : "") + '"' +
        (esActual ? ' aria-current="true"' : "") +
        ' href="' + langUrl(lista[i].code) + '" title="' + lista[i].name + '">' + lista[i].name + "</a></li>";
    }

    li.innerHTML =
      '<a href="#" class="nav-link dropdown-toggle my-auto" role="button" id="ivw-langmenu"' +
      ' aria-haspopup="true" aria-expanded="false" data-toggle="dropdown" title="Idioma">' +
      '<i aria-hidden="true" class="fa-lg fa fa-globe afaicon fa-fw"></i>' +
      '<span class="ms-1 langdesc">' + (nombre || actual) + "</span></a>" +
      '<ul role="menu" class="dropdown-menu dropdown-menu-end" aria-labelledby="ivw-langmenu">' +
      opciones + "</ul>";
    return li;
  }

  function langMenu(userNav) {
    if (!userNav) return;
    var li = document.querySelector("li.langmenu");

    if (li && !li.dataset.ivwLang) {
      var lista = langsDe(li);
      if (lista.length) langsGuardar(lista);
    }
    if (!li) li = langMenuNuevo();

    // Antes del menú del usuario, que se queda al final de la fila.
    if (li.parentElement !== userNav || li.nextElementSibling !== userNav.lastElementChild) {
      var user = userNav.querySelector(":scope > li.usermenu, :scope > li:last-child");
      if (user && user !== li) userNav.insertBefore(li, user);
      else userNav.appendChild(li);
    }
    topnavDropdowns(li);
  }

  function moodleChrome() {
    if (location.hostname.indexOf("ivirtual") === -1) return;

    // Ocultar "Vista estándar" / "Vista compacta"
    var nodes = document.querySelectorAll("a,button,span,li,div");
    for (var k = 0; k < nodes.length; k++) {
      var e = nodes[k];
      var txt = textOf(e);
      if (e.children.length <= 1 && /^(Vista\s+(est[aá]ndar|compacta)|Pantalla\s+completa)$/i.test(txt)) {
        // Preferir el <li>: ocultar solo el <a> deja el hueco del item.
        (e.closest("li,.nav-item") || e.closest("a,button,div") || e).setAttribute("data-ivw-hide", "1");
      }
    }

    var userNav = document.querySelector("#adaptable-user-nav");
    var topbarInner = userNav ? userNav.parentElement : null;
    if (topbarInner) {
      brand(topbarInner);

      // Buscador de escritorio (.headersearch vive en el #page-header oculto) → topbar
      var search = document.querySelector(".headersearch");
      if (search && !search.dataset.ivwMoved) {
        search.dataset.ivwMoved = "1";
        search.classList.add("ivw-search");
        userNav.insertBefore(search, userNav.firstChild);
      }

      // Menú principal (Inicio/Tablero/Cursos/Eventos) → topbar
      var mainMenu = null;
      var uls = document.querySelectorAll("ul.navbar-nav");
      for (var j = 0; j < uls.length; j++) {
        var ul = uls[j];
        if (ul.id === "adaptable-user-nav" || ul.dataset.ivwMoved) continue;
        if (/Inicio|Tablero|Cursos|Eventos/i.test(ul.textContent || "")) { mainMenu = ul; break; }
      }
      if (mainMenu && !mainMenu.dataset.ivwMoved) {
        var oldBar = mainMenu.closest("nav,.navbar");
        mainMenu.dataset.ivwMoved = "1";
        mainMenu.classList.add("ivw-topnav");
        topbarInner.insertBefore(mainMenu, userNav);
        topnavLinks(mainMenu);
        topnavDropdowns(mainMenu);
        if (oldBar) {
          oldBar.setAttribute("data-ivw-hide", "1");
          var barWrap = oldBar.parentElement;
          if (barWrap && barWrap !== topbarInner && !barWrap.querySelector("#adaptable-user-nav")) {
            barWrap.setAttribute("data-ivw-hide", "1");
          }
        }
      }

      langMenu(userNav);
    }

    // "Secciones" en el menú "Este curso": duplica el índice del curso que ya
    // vive en el panel de contenido, y su submenú lateral es el único de dos
    // niveles del topbar. Fuera.
    var itemsMenu = document.querySelectorAll(".ivw-topnav .dropdown-menu .nav-item, .ivw-topnav .dropdown-menu li");
    for (var s = 0; s < itemsMenu.length; s++) {
      var li = itemsMenu[s];
      var enlace = li.querySelector(":scope > a");
      if (!enlace) continue;
      if (!/^Secciones$/i.test(textOf(enlace))) continue;
      li.setAttribute("data-ivw-hide", "1");
    }

    // Lupas sueltas fuera del buscador bueno
    var mags = document.querySelectorAll("i.fa-magnifying-glass");
    for (var m = 0; m < mags.length; m++) {
      if (mags[m].closest(".ivw-search")) continue;
      var w = mags[m].closest("button,a,li");
      if (w) w.setAttribute("data-ivw-hide", "1");
    }

    // Buscador móvil y toggles opensearch: fuera del DOM
    var dups = document.querySelectorAll(".navbarsearchsocial, [data-action='opensearch']");
    for (var d = 0; d < dups.length; d++) dups[d].remove();
  }

  /* ---------- 5b. Nombres en MAYÚSCULAS → Capitalizados ---------- */
  // Moodle los trae en mayúsculas de la base; en texto chico se leen mejor así.
  function titleCase(t) {
    return t.toLowerCase().replace(/(^|[\s'\u2019-])([a-záéíóúüñ])/g, function (m, a, b) {
      return a + b.toUpperCase();
    });
  }

  function tidyName(el) {
    if (!el || el.dataset.ivwTidy) return;
    var t = textOf(el);
    if (!t || t !== t.toUpperCase() || !/[A-ZÁÉÍÓÚÜÑ]/.test(t)) return;
    el.dataset.ivwTidy = "1";
    el.title = t;
    el.textContent = titleCase(t);
  }

  function tidyUserName() {
    tidyName(document.querySelector("#adaptable-user-nav .usertext"));
  }

  /* ---------- 5c. Listados de cursos: resultados como tarjetas ---------- */
  // Aplica al buscador (/course/search.php) y al listado de una categoría
  // (/course/index.php?categoryid=N). Se marca el contenedor con
  // .ivw-course-grid para que la CSS sepa qué listas son rejilla — los cursos
  // que salen al expandir una categoría del árbol se quedan como filas.
  // Además la imagen se sube a primer hijo de .coursebox (Moodle la mete
  // dentro de .content, a un lado del texto).
  function courseSearchCards() {
    if (!/\/course\/(search|index)\.php/.test(location.pathname)) return;
    var grids = document.querySelectorAll(
      ".courses.course-search-result, .course_category_tree > .content > .courses.category-browse"
    );
    for (var g = 0; g < grids.length; g++) grids[g].classList.add("ivw-course-grid");
    var boxes = document.querySelectorAll(".ivw-course-grid .coursebox");
    for (var i = 0; i < boxes.length; i++) {
      var box = boxes[i];
      if (box.dataset.ivwCard) continue;
      box.dataset.ivwCard = "1";
      var img = box.querySelector(".courseimage");
      if (img) {
        box.insertBefore(img, box.firstChild);
      } else {
        // Sin imagen de portada la tarjeta quedaba a media altura en la
        // rejilla: se le pone una portada generada con el código del curso.
        var name = textOf(box.querySelector(".coursename")) || "";
        var code = (name.match(/^[\w./-]{3,16}/) || [""])[0].replace(/\/$/, "");
        var thumb = el("div", "ivw-thumb", "<span>" + (code || "Curso") + "</span>");
        thumb.dataset.tone = String((parseInt(box.dataset.courseid || "0", 10) || name.length) % 4);
        box.insertBefore(thumb, box.firstChild);
      }
      var teachers = box.querySelectorAll("ul.teachers a");
      for (var t = 0; t < teachers.length; t++) tidyName(teachers[t]);
    }
  }

  /* ---------- 5d. Portada: "Mis cursos" como tarjetas ---------- */
  // El tema pinta .cimbox con background-image inline; cuando el curso no
  // tiene portada queda un rectángulo blanco. Se le pone la misma portada
  // generada que en el buscador y se acomodan los nombres de profesores.
  function frontpageCourseCards() {
    var boxes = document.querySelectorAll("#frontpage-course-list .coursebox, .frontpage-course-list-enrolled .coursebox");
    for (var i = 0; i < boxes.length; i++) {
      var box = boxes[i];
      if (box.dataset.ivwCard) continue;
      box.dataset.ivwCard = "1";

      var name = textOf(box.querySelector("h3")) || "";
      var code = (name.match(/^[\w./-]{3,16}/) || [""])[0].replace(/\/$/, "");
      var cim = box.querySelector(".cimbox");
      if (cim && !/background-image/i.test(cim.getAttribute("style") || "")) {
        cim.classList.add("ivw-thumb");
        cim.dataset.tone = String(name.length % 4);
        if (!cim.querySelector("span")) cim.appendChild(el("span", null, code || "Curso"));
      }

      // "Profesor: NOMBRE APELLIDO" → etiqueta + nombre capitalizado
      var teachers = box.querySelectorAll("ul.teachers a");
      for (var t = 0; t < teachers.length; t++) {
        var a = teachers[t];
        if (a.dataset.ivwTidy) continue;
        var txt = textOf(a);
        var m = txt.match(/^([^:]{3,20}:)\s*(.+)$/);
        if (!m || m[2] !== m[2].toUpperCase()) continue;
        a.dataset.ivwTidy = "1";
        a.title = txt;
        a.innerHTML = "";
        a.appendChild(el("span", "ivw-teacher-label", m[1]));
        a.appendChild(document.createTextNode(" " + titleCase(m[2])));
      }
    }
  }

  /* ---------- 5e. Tablero: quitar el zoom del bloque y ordenar la línea de tiempo ---------- */
  // Adaptable mete en el encabezado de cada bloque un botón de "zoom" que
  // expande la tarjeta a pantalla completa. Se detecta por su icono o su
  // etiqueta (el nombre de clase cambia entre versiones del tema).
  function hideBlockZoom() {
    var blocks = document.querySelectorAll(".block, [data-block]");
    for (var i = 0; i < blocks.length; i++) {
      var ctrls = blocks[i].querySelectorAll(
        ".header a, .header button, .card-header a, .card-header button," +
        ".block-controls a, .block-controls button, .block-header a, .block-header button"
      );
      for (var c = 0; c < ctrls.length; c++) {
        var ctrl = ctrls[c];
        var icon = ctrl.querySelector("i, span[class*='fa-']");
        var cls = (icon && icon.className && icon.className.toString()) || "";
        var lbl = (ctrl.getAttribute("title") || "") + " " +
          (ctrl.getAttribute("aria-label") || "") + " " + textOf(ctrl);
        // No tocar el control de "mover bloque" del modo edición, que usa
        // el mismo icono de flechas.
        if (/mover|move|arrastrar|drag/i.test(lbl)) continue;
        if (/fa-(compress|expand|arrows|maximize|minimize)/.test(cls) || /zoom|amplia|maximiz/i.test(lbl)) {
          ctrl.setAttribute("data-ivw-hide", "1");
        }
      }
    }
  }

  // Línea de tiempo: el curso viaja pegado al estado ("Tarea está en fecha de
  // entrega · 1197C-… Calidad de Software"). Se separa en un chip para poder
  // escanear la lista por curso, y el botón "Ver" baja a secundario.
  function tidyTimeline() {
    var items = document.querySelectorAll('[data-region="event-list-item"], .block_timeline .list-group-item');
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (it.dataset.ivwTimeline) continue;
      it.dataset.ivwTimeline = "1";
      it.classList.add("ivw-tl-item");

      // Marcado quirúrgico: se parte del elemento característico (el botón,
      // el título) y se sube SOLO hasta el hijo directo de la fila. Nada de
      // recorrer hijos a ciegas: eso etiquetaba el <h6> como si fuera el
      // icono y desaparecía el texto de la actividad.
      var rowEl = it.querySelector(":scope > .row, :scope > .d-flex") || it;
      var cellOf = function (node) {
        while (node && node.parentElement && node.parentElement !== rowEl) node = node.parentElement;
        return node && node.parentElement === rowEl ? node : null;
      };
      var mark = function (node, cls) {
        var cell = cellOf(node);
        if (cell && !/ivw-tl-(time|icon|body|action)/.test(cell.className)) cell.classList.add(cls);
      };

      var nameEl = it.querySelector(".event-name, h6");
      var btnEl = it.querySelector("a.btn, button.btn");
      var iconEl = it.querySelector("img.icon, .activityiconcontainer, .icon, i[class*='fa-']");
      var timeEl = null;
      var times = it.querySelectorAll("small, time, span, div");
      for (var q = 0; q < times.length; q++) {
        if (/^\d{1,2}[:.]\d{2}$/.test(textOf(times[q]))) { timeEl = times[q]; break; }
      }
      if (btnEl) mark(btnEl, "ivw-tl-action");
      if (nameEl) mark(nameEl, "ivw-tl-body");
      if (timeEl) mark(timeEl, "ivw-tl-time");
      if (iconEl) mark(iconEl, "ivw-tl-icon");

      var metas = it.querySelectorAll("small");
      for (var m = 0; m < metas.length; m++) {
        var meta = metas[m];
        var txt = textOf(meta);
        var cut = txt.lastIndexOf("·");
        if (cut < 0 || meta.querySelector(".ivw-course-chip")) continue;
        meta.classList.add("ivw-tl-meta");
        meta.textContent = txt.slice(0, cut).trim() + " ";
        meta.appendChild(el("span", "ivw-course-chip", txt.slice(cut + 1).trim()));
      }

      var btns = it.querySelectorAll("a.btn, button.btn");
      for (var b = 0; b < btns.length; b++) {
        if (/^(ver|view)$/i.test(textOf(btns[b]))) btns[b].classList.add("ivw-btn-soft");
      }
      // Respaldo: si ninguna columna quedó marcada como acción (Moodle cambia
      // las clases entre versiones), se marca el padre del primer botón.
      if (btns.length && !it.querySelector(".ivw-tl-action")) {
        var host = btns[0].parentElement;
        if (host && host !== it) host.classList.add("ivw-tl-action");
      }
      if (!it.querySelector(".ivw-tl-body")) {
        var name = it.querySelector(".event-name, h6");
        var body = name && name.parentElement;
        if (body && body !== it) body.classList.add("ivw-tl-body");
      }
    }
  }

  /* ---------- 5f. Perfil: nombre legible y correo bajo el título ---------- */
  // El nombre encabeza también la página de edición, en mayúsculas
  function tidyHeadings() {
    var hs = document.querySelectorAll(
      "#page-user-edit #region-main h1, #page-user-edit #region-main h2," +
      "#page-user-editadvanced #region-main h2, .page-header-headings h1"
    );
    for (var i = 0; i < hs.length; i++) tidyName(hs[i]);
  }

  function tidyProfile() {
    // Por id del <body> además de por URL: así también aplica en las capturas
    // de pantalla guardadas (fixtures), donde la ruta es un archivo local.
    if (!/^page-user-(profile|view)/.test(document.body.id || "") &&
        !/\/user\/(profile|view)\.php/.test(location.pathname)) return;
    var head = document.querySelector(".page-header-headings h1, .userprofile .page-header-headings h1");
    if (!head) return;
    tidyName(head);
    if (head.parentElement.querySelector(".ivw-profile-sub")) return;
    var mail = document.querySelector('a[href^="mailto:"]');
    var txt = mail ? textOf(mail) : "";
    if (!txt) {
      var dds = document.querySelectorAll(".contentnode dd");
      for (var i = 0; i < dds.length; i++) {
        var t = textOf(dds[i]);
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+/.test(t)) { txt = t.split(" ")[0]; break; }
      }
    }
    if (txt) head.parentElement.appendChild(el("span", "ivw-profile-sub", txt));

    // Acciones del perfil ("Mensaje", "Editar perfil"…) agrupadas a la
    // derecha del encabezado. Moodle no siempre trae .header-button-group,
    // así que si no existe se crea el contenedor.
    // El encabezado de contexto vive FUERA de .userprofile: se mete dentro
    // para que comparta ancho y alineación con la rejilla de tarjetas.
    var header = document.querySelector(".page-context-header");
    if (!header) return;
    var profile = document.querySelector(".userprofile");
    if (profile && !profile.contains(header)) profile.insertBefore(header, profile.firstChild);
    var group = header.querySelector(".header-button-group, .btn-group, .ivw-profile-actions");
    if (!group) {
      group = el("div", "ivw-profile-actions");
      header.appendChild(group);
    } else {
      group.classList.add("ivw-profile-actions");
    }

    // Los botones que ya viven en el encabezado (Mensaje, Añadir contacto…)
    var loose = header.querySelectorAll(":scope > a, :scope > .message-button, :scope > div > a.btn");
    for (var j = 0; j < loose.length; j++) {
      if (loose[j] === group || group.contains(loose[j])) continue;
      loose[j].classList.add("ivw-profile-action");
      group.appendChild(loose[j]);
    }

    var edit = document.querySelector('a[href*="/user/edit.php"], a[href*="editadvanced.php"]');
    if (edit && !edit.dataset.ivwMoved) {
      edit.dataset.ivwMoved = "1";
      edit.classList.add("ivw-profile-action");
      var host = edit.closest("li.contentnode") || edit;
      group.appendChild(edit);
      if (host !== edit && !textOf(host)) host.setAttribute("data-ivw-hide", "1");
    }

    // Moodle ofrece "Editar perfil" dos veces: como botón del encabezado y
    // como fila de la tarjeta. Con el botón arriba, la fila sobra.
    if (group.querySelector('a[href*="/user/edit.php"], a[href*="editadvanced.php"]')) {
      var dup = document.querySelectorAll(".userprofile li.editprofile");
      for (var d = 0; d < dup.length; d++) {
        if (!dup[d].contains(edit)) dup[d].setAttribute("data-ivw-hide", "1");
      }
    }

    tidyProfileCourses();
  }

  /* Cursos del perfil: "1197C-14393 Calidad de Software" llega como un solo
     texto y la lista se lee como un párrafo. El código se separa en una
     pastilla para que la columna de la izquierda sirva de índice. */
  var COURSE_CODE = /^([0-9]{3,4}[A-Za-z]?[-\/][0-9A-Za-z-]+)\s+(.+)$/;

  function tidyProfileCourses() {
    var links = document.querySelectorAll(".userprofile .contentnode dd li > a, .userprofile .contentnode dd > a");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (a.dataset.ivwCourse) continue;
      if ((a.getAttribute("href") || "").indexOf("mailto:") === 0) continue;
      var m = COURSE_CODE.exec(textOf(a));
      if (!m) continue;
      a.dataset.ivwCourse = "1";
      a.dataset.ivwHtml = a.innerHTML;
      a.innerHTML = "";
      var code = el("span", "ivw-course-code", null);
      code.textContent = m[1];
      var name = el("span", "ivw-course-name", null);
      name.textContent = m[2];
      a.appendChild(code);
      a.appendChild(name);
    }
  }

  /* ---------- 5f-bis. Asistencia: el estatus como pastilla ---------- */
  // El estatus solo existe como texto suelto en la celda ("Presente",
  // "Excusado (Justificado)"…), así que el color tiene que decidirlo el JS:
  // la CSS no puede escoger por contenido.
  var ATT_ESTADOS = [
    { re: /^presente/i, tipo: "ok" },
    { re: /^(retrasado|retardo|tarde)/i, tipo: "warn" },
    { re: /^(excusad|justificad)/i, tipo: "info" },
    { re: /^(ausente|falta|inasistencia)/i, tipo: "bad" }
  ];

  function attEstado(txt) {
    for (var i = 0; i < ATT_ESTADOS.length; i++) {
      if (ATT_ESTADOS[i].re.test(txt)) return ATT_ESTADOS[i].tipo;
    }
    return null;
  }

  // La tarjeta de totales trae el título dentro de la propia tabla (un <th>
  // con colspan) y el avatar en un float aparte, así que el título arranca a
  // media altura y debajo del avatar queda un hueco. Se saca a una cabecera
  // propia: avatar y título en el mismo renglón, fichas debajo a todo lo ancho.
  function attCabeceraResumen() {
    var info = document.querySelector(".allsessionssummary .userinfo");
    if (!info || info.dataset.ivwHead) return;
    var th = info.querySelector("table th[colspan]");
    if (!th) return;
    info.dataset.ivwHead = "1";

    var head = el("div", "ivw-att-head", null);
    var avatar = info.querySelector(".float-left");
    if (avatar) head.appendChild(avatar);
    var titulo = el("h3", "ivw-att-title", null);
    titulo.textContent = textOf(th);
    head.appendChild(titulo);
    info.insertBefore(head, info.firstChild);

    var filaTitulo = th.closest("tr");
    if (filaTitulo) filaTitulo.setAttribute("data-ivw-hide", "1");

    // "Excusado (Justificado)" en dos renglones descuadra la fila de fichas:
    // la aclaración se va al title.
    var celdas = info.querySelectorAll("table tbody tr td:first-child");
    for (var i = 0; i < celdas.length; i++) {
      var t = textOf(celdas[i]);
      var m = /^([^(]+?)\s*\(([^)]+)\)\s*:?$/.exec(t);
      if (!m) continue;
      celdas[i].textContent = m[1];
      celdas[i].title = t.replace(/\s*:\s*$/, "");
    }
  }

  // Los filtros vienen como tres bloques sueltos, dos de ellos sin etiqueta:
  // se les pone una y quedan como renglones de "etiqueta → opciones".
  function attFiltros() {
    var barra = document.querySelector(".attfiltercontrols");
    if (!barra || barra.dataset.ivwFiltros) return;
    barra.dataset.ivwFiltros = "1";

    // "Agrupar sesiones por:" es un nodo de texto suelto delante de los chips
    var agrupar = barra.querySelector(".groupingcontrols > div");
    if (agrupar) {
      for (var n = 0; n < agrupar.childNodes.length; n++) {
        var nodo = agrupar.childNodes[n];
        if (nodo.nodeType === 3 && nodo.nodeValue.trim()) { nodo.nodeValue = ""; break; }
      }
      attEtiqueta(agrupar, "Agrupar por");
    }
    attEtiqueta(barra.querySelector(".coursecontrols > div"), "Cursos");
    attEtiqueta(barra.querySelector(".viewcontrols > div"), "Vista");

    // El navegador de mes (◄ agosto ►) se envuelve para que la píldora sea
    // solo el control y la etiqueta se quede fuera.
    var fecha = barra.querySelector(".curdatecontrols");
    if (fecha && !fecha.querySelector(".ivw-att-nav")) {
      var nav = el("span", "ivw-att-nav", null);
      while (fecha.firstChild) nav.appendChild(fecha.firstChild);
      fecha.appendChild(nav);
      attEtiqueta(fecha, "Periodo");
    }

  }

  // Etiqueta + caja de chips: los chips van juntos en un contenedor propio,
  // si no cada uno ocuparía su propio renglón de la rejilla.
  function attEtiqueta(cont, texto) {
    if (!cont || cont.querySelector(":scope > .ivw-att-lbl")) return;
    var caja = el("span", "ivw-att-chips", null);
    while (cont.firstChild) caja.appendChild(cont.firstChild);
    var lbl = el("span", "ivw-att-lbl", null);
    lbl.textContent = texto;
    cont.appendChild(lbl);
    cont.appendChild(caja);
  }

  function tidyAttendance() {
    if (!/^page-mod-attendance/.test(document.body.id || "")) return;

    // Celdas de estatus de las tablas de sesiones (la tarjeta de totales
    // también es una .generaltable, pero ahí "Presente:" es una etiqueta, no
    // un estado que valga una pastilla).
    var celdas = document.querySelectorAll("#region-main table.generaltable tbody td");
    for (var i = 0; i < celdas.length; i++) {
      var td = celdas[i];
      if (td.dataset.ivwAtt || td.children.length) continue;
      if (td.closest(".allsessionssummary")) continue;
      var txt = textOf(td);
      if (!txt || txt.length > 40) continue;
      var tipo = attEstado(txt);
      if (!tipo) continue;
      td.dataset.ivwAtt = tipo;
      td.setAttribute("data-ivw-att", tipo);
      var pastilla = el("span", "ivw-att", null);
      pastilla.textContent = txt;
      td.textContent = "";
      td.appendChild(pastilla);
    }

    // Tarjeta de totales: cada renglón toma el color de su estatus, y los
    // ceros se apagan para que salte a la vista lo que sí tiene cuenta.
    var filas = document.querySelectorAll(".allsessionssummary table tr");
    for (var f = 0; f < filas.length; f++) {
      var tr = filas[f];
      if (tr.dataset.ivwAtt) continue;
      var cels = tr.children;
      if (cels.length !== 2) continue;
      tr.dataset.ivwAtt = "1";
      var etiqueta = textOf(cels[0]);
      var tipo2 = attEstado(etiqueta);
      if (tipo2) {
        tr.setAttribute("data-ivw-att", tipo2);
        // "Presente:" → "Presente": el dos puntos sobra cuando la etiqueta y
        // su número van en renglones distintos.
        cels[0].textContent = etiqueta.replace(/\s*:\s*$/, "");
      }
      if (/^0$/.test(textOf(cels[1]))) tr.setAttribute("data-ivw-zero", "1");
    }

    attCabeceraResumen();
    attFiltros();

    // Resumen del pie: "Sesiones tomadas:" → "Sesiones tomadas" (la etiqueta
    // y su valor ya van en renglones distintos) y color al porcentaje.
    var fichas = document.querySelectorAll("table.attlist tr");
    for (var k = 0; k < fichas.length; k++) {
      var fila = fichas[k];
      if (fila.dataset.ivwAtt || fila.children.length !== 2) continue;
      fila.dataset.ivwAtt = "1";
      fila.children[0].textContent = textOf(fila.children[0]).replace(/\s*:\s*$/, "");
      pintaPorcentaje(fila.children[1]);
    }

    // Porcentajes sueltos de las tablas (columna de porcentaje y fila de
    // promedio); pintaPorcentaje descarta lo que no sea sólo un "NN.N%".
    var pcts = document.querySelectorAll("#region-main table.generaltable tbody td");
    for (var q = 0; q < pcts.length; q++) pintaPorcentaje(pcts[q]);
  }

  // Verde a partir del 80% —el mínimo que pide el reglamento—, ámbar entre
  // 60 y 80, rojo por debajo.
  function pintaPorcentaje(td) {
    if (!td || td.dataset.ivwPct) return;
    var m = /^([\d.]+)\s*%$/.exec(textOf(td));
    if (!m) return;
    var v = parseFloat(m[1]);
    if (isNaN(v)) return;
    td.dataset.ivwPct = "1";
    td.setAttribute("data-ivw-pct", v >= 80 ? "ok" : (v >= 60 ? "warn" : "bad"));
  }

  /* ---------- 5g. Calificaciones: la nota como pastilla ---------- */
  function tidyGrades() {
    var tables = document.querySelectorAll("#page-grade-report-overview-index table.generaltable, .gradereport-overview-table table");
    for (var t = 0; t < tables.length; t++) {
      var table = tables[t];
      if (table.dataset.ivwGrades) continue;
      table.dataset.ivwGrades = "1";

      // Etiquetas para la vista de una columna en móvil
      var heads = table.querySelectorAll("thead th");
      var labels = [];
      for (var h = 0; h < heads.length; h++) labels.push(textOf(heads[h]));

      var rows = table.querySelectorAll("tbody tr");
      for (var r = 0; r < rows.length; r++) {
        var cells = rows[r].children;
        for (var c = 0; c < cells.length; c++) {
          if (labels[c]) cells[c].setAttribute("data-ivw-label", labels[c]);
        }
        var last = cells[cells.length - 1];
        if (!last || last.querySelector(".ivw-grade")) continue;
        var val = textOf(last);
        var pill = el("span", "ivw-grade", "");
        pill.textContent = /^[-–—]?$/.test(val) ? "Sin calificar" : val;
        if (/^[-–—]?$/.test(val)) pill.dataset.empty = "1";
        else if (/^0([.,]0+)?$/.test(val)) pill.dataset.zero = "1";
        last.textContent = "";
        last.appendChild(pill);
      }
    }
  }

  /* ---------- 5h. Diálogos: cerrar de verdad ----------
     Red de seguridad: si tras pulsar la "X" el diálogo sigue visible (el
     handler de YUI puede no dispararse), se cierra con la propia clase de
     YUI —`yui3-widget-hidden`— para que el widget siga pudiendo reabrirlo.
     También se cierra con Escape. */
  function closeDialog(dlg) {
    if (!dlg) return;
    dlg.classList.add("yui3-widget-hidden");
    var masks = document.querySelectorAll(".yui3-widget-mask, .moodle-dialogue-lightbox");
    for (var i = 0; i < masks.length; i++) masks[i].classList.add("yui3-widget-hidden");
    document.body.classList.remove("yui3-widget-modal");
  }

  function visibleDialog(dlg) {
    if (!dlg || !dlg.isConnected) return false;
    if (dlg.classList.contains("yui3-widget-hidden")) return false;
    var st = window.getComputedStyle(dlg);
    return st.display !== "none" && st.visibility !== "hidden";
  }

  function dialogEscapes() {
    if (window.__ivwDialogs) return;
    window.__ivwDialogs = true;

    document.addEventListener("click", function (e) {
      var t = e.target;
      var btn = t && t.closest ? t.closest(".closebutton") : null;
      if (!btn) return;
      var dlg = btn.closest(".moodle-dialogue");
      if (!dlg) return;
      setTimeout(function () {
        if (visibleDialog(dlg)) closeDialog(dlg);
      }, 200);
    }, true);

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" && e.keyCode !== 27) return;
      var dlgs = document.querySelectorAll(".moodle-dialogue");
      for (var i = 0; i < dlgs.length; i++) {
        if (visibleDialog(dlgs[i])) closeDialog(dlgs[i]);
      }
    });
  }

  /* ---------- 5i. Formularios: alineación de cabeceras y botonera ----------
     El CSS no gana contra algunas reglas del tema (usa ids y !important),
     así que estos dos arreglos se aplican como estilo inline marcado, y
     `clearInline()` los revierte cuando se apaga el wrap. */
  function setInline(node, props) {
    if (!node) return;
    var names = [];
    for (var k in props) {
      if (!Object.prototype.hasOwnProperty.call(props, k)) continue;
      node.style.setProperty(k, props[k], "important");
      names.push(k);
    }
    var prev = node.getAttribute("data-ivw-inline");
    node.setAttribute("data-ivw-inline", prev ? prev + "," + names.join(",") : names.join(","));
  }

  function clearInline() {
    var frames = document.querySelectorAll('#CalendarSection iframe[scrolling="no"]');
    for (var f = 0; f < frames.length; f++) frames[f].removeAttribute("scrolling");
    var heads = document.querySelectorAll("[data-ivw-html]");
    for (var h = 0; h < heads.length; h++) {
      heads[h].innerHTML = heads[h].dataset.ivwHtml;
      delete heads[h].dataset.ivwHtml;
      delete heads[h].dataset.ivwHead;
      delete heads[h].dataset.ivwCourse;
      heads[h].classList.remove("ivw-fhead");
    }
    var wraps = document.querySelectorAll(".ivw-fhead-wrap");
    for (var w = 0; w < wraps.length; w++) wraps[w].classList.remove("ivw-fhead-wrap");
    var nodes = document.querySelectorAll("[data-ivw-inline]");
    for (var i = 0; i < nodes.length; i++) {
      var props = (nodes[i].getAttribute("data-ivw-inline") || "").split(",");
      for (var p = 0; p < props.length; p++) if (props[p]) nodes[i].style.removeProperty(props[p]);
      nodes[i].removeAttribute("data-ivw-inline");
    }
  }

  // Cabecera de sección: icono y título centrados en la misma línea.
  // El icono viene envuelto en un <span> que precede al título, así que el
  // título NO se puede buscar con querySelector("h3, span"): eso devolvía el
  // envoltorio del icono y el <h3> se quedaba con la tipografía del tema.
  /* Cabecera de sección.
     Markup real (Moodle 4.x + Adaptable):

       <legend>
         <a class="btn btn-icon me-3 icons-collapse-expand stretched-link fheader"
            data-toggle="collapse" aria-expanded="false">
           <span class="expanded-icon p-2">…chevron abajo…</span>
           <span class="collapsed-icon p-2">…chevron derecha/izquierda…</span>
           <span class="sr-only">General</span>
         </a>
         <h3 class="d-flex align-self-stretch align-items-center mb-0">General</h3>
       </legend>

     El enlace NO contiene el título: es una capa `stretched-link` (posición
     absoluta) que cubre toda la cabecera para que se pueda pulsar entera, y
     el título visible es el <h3> hermano. Por eso meter el título dentro del
     enlace lo descuadraba. Aquí se deja el enlace como capa de clic (solo con
     su texto para lectores de pantalla), el chevron se pinta como elemento
     propio del <legend> y el <h3> se conserva como título. */
  var CHEVRON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

  // Texto de la cabecera, sin iconos ni duplicados para lectores de pantalla.
  function headText(node) {
    var probe = node.cloneNode(true);
    var junk = probe.querySelectorAll(".icon, i, svg, img, .sr-only, .accesshide, .visually-hidden");
    for (var j = 0; j < junk.length; j++) junk[j].parentNode.removeChild(junk[j]);
    return textOf(probe) || textOf(node);
  }

  // ¿Existe solo para lectores de pantalla? Entonces no es la cabecera visible.
  function isSrOnly(node) {
    return /(^|\s)(sr-only|visually-hidden|accesshide)(\s|$)/.test(node.className || "");
  }

  /* La cabecera visible de un fieldset.
     En este Moodle el <legend> es únicamente para lectores de pantalla y la
     cabecera real es un `div.ftoggler` nieto del fieldset (con el enlace de
     colapso y un <h3 aria-hidden>). En versiones previas la cabecera era el
     propio <legend>. Tocar el <legend> sr-only lo volvía visible: de ahí los
     títulos repetidos. */
  function formHead(fieldset) {
    var legend = fieldset.querySelector(":scope > legend");
    if (legend && !isSrOnly(legend) && textOf(legend)) return legend;
    var togglers = fieldset.querySelectorAll(".ftoggler");
    for (var t = 0; t < togglers.length; t++) {
      if (!togglers[t].closest(".fcontainer")) return togglers[t];
    }
    return null;
  }

  function tidyFormHeaders() {
    var sets = document.querySelectorAll(".mform fieldset");
    for (var i = 0; i < sets.length; i++) {
      var fieldset = sets[i];
      var head = formHead(fieldset);
      if (!head || head.dataset.ivwHead) continue;

      var label = headText(head);
      if (!label) continue;
      head.dataset.ivwHead = "1";
      head.dataset.ivwHtml = head.innerHTML;
      head.classList.add("ivw-fhead");

      // Los envoltorios que Moodle mete entre el fieldset y la cabecera traen
      // márgenes propios: se marcan para que la cabecera pegue al borde.
      var wrap = head.parentElement;
      while (wrap && wrap !== fieldset) {
        wrap.classList.add("ivw-fhead-wrap");
        wrap = wrap.parentElement;
      }

      var link = head.querySelector("a[data-toggle], a.fheader, a[href]");

      // Título: el <h3> del tema si existe (así no se pierde la jerarquía),
      // si no, uno propio.
      var title = head.querySelector("h1, h2, h3, h4, h5, h6");
      // En algunas versiones el <h3> es hermano de la cabecera: se trae dentro
      // para que comparta fila con el chevron.
      if (!title) {
        var box = head.parentElement;
        var outside = box ? box.querySelectorAll(":scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6") : [];
        for (var o = 0; o < outside.length; o++) {
          if (outside[o].closest(".fcontainer")) continue;
          title = outside[o];
          head.appendChild(title);
          break;
        }
      }
      if (!title) {
        title = el("span", null, null);
        title.textContent = label;
        head.appendChild(title);
      } else {
        title.textContent = label;
      }
      title.classList.add("ivw-fheader-title");
      setInline(title, {
        display: "block", flex: "1 1 auto", "align-self": "center",
        margin: "0", padding: "0", "line-height": "1.3", "font-size": "16px"
      });

      // Chevron propio, hermano del título: el del tema son dos iconos
      // (expandido/colapsado) con padding propio dentro del enlace absoluto.
      var icon = el("span", "ivw-fheader-icon", CHEVRON);
      head.insertBefore(icon, head.firstChild);

      if (link) {
        // El enlace se queda como capa de clic sobre toda la cabecera.
        var sr = el("span", "sr-only", null);
        sr.textContent = label;
        link.innerHTML = "";
        link.appendChild(sr);
        link.classList.add("ivw-fheader-hit");
        setInline(link, {
          position: "absolute", inset: "0", display: "block",
          width: "auto", height: "auto", margin: "0", padding: "0",
          border: "0", background: "transparent", "box-shadow": "none"
        });
      }

      setInline(head, {
        display: "flex", "align-items": "center", gap: "10px",
        position: "relative", width: "100%", float: "none"
      });
    }
  }

  /* Botonera: los botones acaban en una sola fila.
     El markup varía mucho (a veces comparten contenedor, a veces cada uno
     viene en su propia celda o incluso en su propio <form>), así que en vez
     de asumir una forma se busca el ancestro común de todos los botones de
     acción y se agrupan sus celdas hijas. Se mueven celdas, nunca <input>
     sueltos: así ningún botón sale de su <form> y el envío sigue igual. */
  var BTN_SEL = 'input[type="submit"], button[type="submit"], input[type="button"][name="cancel"], ' +
    'input[name="cancel"], button[name="cancel"], input[name="submitbutton"], button[name="submitbutton"]';

  function isActionBtn(n) {
    return n.nodeType === 1 && n.matches(BTN_SEL);
  }

  // Texto del nodo descontando el de los botones que contiene.
  function textOutsideButtons(node) {
    var clone = node.cloneNode(true);
    var bs = clone.querySelectorAll(BTN_SEL);
    for (var i = 0; i < bs.length; i++) bs[i].parentNode.removeChild(bs[i]);
    return textOf(clone);
  }

  function commonAncestor(a, b) {
    var n = a;
    while (n && !n.contains(b)) n = n.parentElement;
    return n;
  }

  // Hijo directo de `parent` que contiene a `node`.
  function childOf(parent, node) {
    var n = node;
    while (n && n.parentElement !== parent) n = n.parentElement;
    return n;
  }

  function tidyFormButtons() {
    var forms = document.querySelectorAll("form.mform, #region-main form, form");
    for (var f = 0; f < forms.length; f++) {
      var form = forms[f];
      if (form.dataset.ivwBtns) continue;

      var all = form.querySelectorAll(BTN_SEL);
      var btns = [];
      for (var b = 0; b < all.length; b++) {
        // Los formularios dentro de un desplegable (filtros del constructor de
        // reportes) ya traen su botonera en fila y con la barra anclada: el
        // relleno de esta función los empujaba fuera del panel.
        if (all[b].closest(".moodle-dialogue, .filemanager, .headersearch, .ivw-search, .ivw-btnrow, .dropdown-menu, .filters-dropdown")) continue;
        btns.push(all[b]);
      }
      if (btns.length < 2) continue;

      var common = btns[0].parentElement;
      for (var c = 1; c < btns.length; c++) common = commonAncestor(common, btns[c]);
      if (!common) continue;
      form.dataset.ivwBtns = "1";

      // Celdas: el hijo directo del ancestro común que envuelve a cada botón.
      var cells = [];
      for (var k = 0; k < btns.length; k++) {
        var cell = childOf(common, btns[k]);
        if (cell && cells.indexOf(cell) === -1) cells.push(cell);
      }

      // Si alguna celda arrastra contenido que no son botones, no se mueve
      // nada: basta con volver horizontal el contenedor común.
      var movable = cells.length >= 2;
      for (var m = 0; m < cells.length && movable; m++) {
        if (textOutsideButtons(cells[m])) movable = false;
      }

      var row;
      if (movable) {
        row = el("div", "ivw-btnrow");
        common.insertBefore(row, cells[0]);
        for (var g = 0; g < cells.length; g++) {
          row.appendChild(cells[g]);
          if (!isActionBtn(cells[g])) cells[g].classList.add("ivw-btncell");
        }
      } else {
        row = common;
        common.classList.add("ivw-btnrow");
      }

      // Cancelar va primero; la acción principal cierra la fila (el CSS lee
      // data-ivw-btn para ordenarlas).
      for (var o = 0; o < cells.length; o++) {
        var btn = cells[o].matches(BTN_SEL) ? cells[o] : cells[o].querySelector(BTN_SEL);
        var nombre = btn ? (btn.getAttribute("name") || "") : "";
        var texto = btn ? (btn.value || textOf(btn)) : "";
        var esCancel = /(^|_)cancel$/i.test(nombre) || /^cancelar$/i.test((texto || "").trim());
        cells[o].setAttribute("data-ivw-btn", esCancel ? "cancel" : "main");
      }

      setInline(row, {
        display: "flex", "flex-wrap": "wrap", "align-items": "center",
        "justify-content": "flex-start", gap: "10px", width: "100%",
        "grid-template-columns": "none", margin: "0", border: "0", float: "none"
      });
      for (var q = 0; q < btns.length; q++) {
        setInline(btns[q], {
          margin: "0", float: "none", position: "static",
          inset: "auto", transform: "none", flex: "none", "vertical-align": "middle"
        });
      }
      // Celdas vacías del grid (la columna de la etiqueta) fuera de la fila.
      var kids = row.children;
      for (var x = 0; x < kids.length; x++) {
        if (!kids[x].querySelector(BTN_SEL) && !isActionBtn(kids[x]) && !textOf(kids[x])) {
          kids[x].setAttribute("data-ivw-hide", "1");
        }
      }
    }
  }

  /* ---------- 5j. Portal de Sistemas (apps9/PortalSistemas) ----------
     El portal arma sus fichas por AJAX y las mete en dos contenedores sin
     título (`.modules-items` = favoritos, `.modules-itemsN` = el resto). Aquí
     se les pone encabezado con contador, se saca la descripción del `title=`
     al cuerpo de la tarjeta y se mueve la foto del banner a la barra.

     Dos cosas del sitio que hay que respetar:
     · el filtro del buscador oculta con `style.display = "none"` → los
       contadores se leen de ahí, y el CSS no puede forzar `display`;
     · el click resuelve el sistema con `event.target.parentNode.id` y
       `offsetParent.id` → lo que se inyecta va como hijo DIRECTO del `<a>`. */
  function psBrand(bar) {
    if (document.getElementById("ivw-ps-brand")) return;
    var a = el("a", null,
      '<span class="ivw-ps-mark" aria-hidden="true">PS</span>' +
      '<span class="ivw-ps-brand-text"><strong>Portal de Sistemas</strong><small>ITSON</small></span>');
    a.id = "ivw-ps-brand";
    a.href = "/PortalSistemas/PortalSistemas";
    bar.insertBefore(a, bar.firstChild);
  }

  // La foto vivía flotando sobre el banner con `position:absolute`; junto al
  // menú "MI PERFIL" ocupa menos y queda donde se la busca.
  function psAvatar() {
    var nav = document.getElementById("SeccionDatos");
    var photo = document.getElementById("PhotoEmplid");
    if (!nav || !photo || photo.dataset.ivwMoved) return;
    var box = el("div", "ivw-ps-avatar");
    photo.dataset.ivwMoved = "1";
    box.appendChild(photo);
    var cam = document.getElementById("camara");
    if (cam) box.appendChild(cam);
    nav.insertBefore(box, nav.firstChild);
  }

  function psSection(wrap, title, hint) {
    if (!wrap || wrap.querySelector(".ivw-ps-head")) return;
    var grid = wrap.querySelector(".modules-items, .modules-itemsN");
    if (!grid) return;
    var head = el("div", "ivw-ps-head",
      "<h2>" + title + '</h2><span class="ivw-ps-count">0</span>' +
      (hint ? '<span class="ivw-ps-hint">' + hint + "</span>" : ""));
    wrap.insertBefore(head, grid);
  }

  function psDescriptions() {
    var cards = document.querySelectorAll(".modules .module-item");
    for (var i = 0; i < cards.length; i++) {
      var a = cards[i];
      if (a.dataset.ivwCard) continue;
      a.dataset.ivwCard = "1";
      var t = (a.getAttribute("title") || "").replace(/\s+/g, " ").trim();
      if (!t || /^(undefined|null|-|\.)$/i.test(t)) continue;
      var d = el("span", "ivw-ps-desc");
      d.textContent = t;
      a.appendChild(d);
    }
  }

  function psEmpty(show) {
    var box = document.getElementById("ivw-ps-empty");
    if (!box) {
      var modules = document.querySelector(".home-body .modules");
      if (!modules) return;
      box = el("div", null,
        "<strong>Ningún sistema coincide</strong>" +
        "<span>El buscador mira el nombre y la descripción. Prueba con otra palabra " +
        "o pulsa Esc para ver todos.</span>");
      box.id = "ivw-ps-empty";
      modules.appendChild(box);
    }
    box.setAttribute("data-show", show ? "1" : "0");
  }

  // Contadores por sección + estado vacío. Una sección sin tarjetas visibles
  // (favoritos vacío, o todo filtrado) se esconde entera con su encabezado.
  function psSync() {
    var heads = document.querySelectorAll(".ivw-ps-head");
    if (!heads.length) return;
    var shown = 0;
    for (var i = 0; i < heads.length; i++) {
      var grid = heads[i].nextElementSibling;
      if (!grid) continue;
      var cards = grid.querySelectorAll(".module-item");
      var n = 0;
      for (var j = 0; j < cards.length; j++) if (cards[j].style.display !== "none") n++;
      shown += n;
      // Escribir solo si cambió: el MutationObserver observa `childList` y
      // reescribir el mismo texto volvería a dispararlo en bucle.
      var c = heads[i].querySelector(".ivw-ps-count");
      if (c && c.textContent !== String(n)) c.textContent = String(n);
      var wrap = heads[i].parentNode;
      if (n === 0) wrap.setAttribute("data-ivw-hide", "1");
      else wrap.removeAttribute("data-ivw-hide");
    }
    psEmpty(shown === 0);
  }

  function psSearch() {
    var input = document.getElementById("Buscar");
    if (!input || input.dataset.ivwBound) return;
    input.dataset.ivwBound = "1";
    input.setAttribute("placeholder", "Buscar sistema por nombre o descripción");
    input.setAttribute("autocomplete", "off");
    if (input.parentNode) input.parentNode.appendChild(el("kbd", "ivw-ps-kbd", "/"));

    // El filtro del sitio corre en su propio `keyup`: los contadores se
    // recalculan un tick después, ya con los `display` puestos.
    var later = function () { setTimeout(psSync, 0); };
    input.addEventListener("input", later);
    input.addEventListener("keyup", later);

    document.addEventListener("keydown", function (e) {
      var tag = ((e.target && e.target.tagName) || "").toLowerCase();
      var typing = tag === "input" || tag === "textarea" || tag === "select";
      if (e.key === "/" && !typing) {
        e.preventDefault();
        input.focus();
        input.select();
        return;
      }
      if ((e.key === "Escape" || e.keyCode === 27) && e.target === input && input.value) {
        input.value = "";
        // buscarSistemas() solo escucha `keyup`: hay que provocarlo para que
        // vuelvan las tarjetas ocultas.
        input.dispatchEvent(new Event("keyup", { bubbles: true }));
        later();
      }
    });
  }

  function portalSistemas() {
    var bar = document.getElementById("contenedor-perfil-buscar");
    var modules = document.querySelector(".home-body .modules");
    if (!bar || !modules) return;

    // Los fixtures no pasan por content.js: marcar la pantalla aquí también.
    var root = document.documentElement;
    if (!root.getAttribute("data-ivw-page")) root.setAttribute("data-ivw-page", "portalsistemas");
    if (root.getAttribute("data-ivw-page") !== "portalsistemas") return;

    bar.classList.add("ivw-ps-bar");
    psBrand(bar);
    psAvatar();

    var fav = document.getElementById("divFavoritos");
    var all = document.querySelector(".modules-itemsN");
    psSection(fav, "Accesos rápidos", "Marca con ★ los que uses a diario");
    psSection(all ? all.parentNode : null, "Todos los sistemas", "");
    psDescriptions();
    psSearch();
    psSync();
  }

  /* ---------- 5.b Calendario anual (apps11) ----------
     La vista anual escupe cada evento como `<p><b>Nombre</b><br>Fecha de
     Inicio: dd/mm/aaaa<br>Fecha de Fin: dd/mm/aaaa</p>`: tres renglones de
     texto corrido donde lo único que se busca es el rango. Aquí el rango pasa
     a un par de fichas, y cada evento queda marcado como pasado, en curso o
     por venir para que la lista se lea de un vistazo. El texto original se
     conserva en un span que la CSS enseña otra vez cuando el wrap está OFF. */
  var MESES_ES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
    "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  function parseFechaMx(txt) {
    var m = /(\d{2})\/(\d{2})\/(\d{4})/.exec(txt || "");
    if (!m) return null;
    return new Date(+m[3], +m[2] - 1, +m[1]);
  }

  function fechaChip(kind, texto) {
    var chip = el("span", "ivw-cal-date");
    chip.setAttribute("data-kind", kind);
    chip.textContent = texto;
    return chip;
  }

  function calendarioAnual() {
    var cont = document.getElementById("contenedorMeses");
    if (!cont) return;

    // El mes en curso se marca para destacarlo entre los doce.
    var hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    var nombreMes = MESES_ES[hoy.getMonth()];
    var tit = document.getElementById("titulo" + nombreMes);
    var caja = document.getElementById("eventos" + nombreMes);
    if (tit) tit.setAttribute("data-ivw-now", "1");
    if (caja) caja.setAttribute("data-ivw-now", "1");

    var items = cont.querySelectorAll(".eventos");
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (it.dataset.ivwCal) continue;
      var p = it.querySelector("p");
      if (!p) { it.dataset.ivwCal = "1"; continue; }

      var partes = (p.textContent || "").split(/Fecha de Fin\s*:/i);
      var ini = parseFechaMx(partes[0].split(/Fecha de Inicio\s*:/i)[1] || "");
      var fin = partes.length > 1 ? parseFechaMx(partes[1]) : null;
      if (!ini) { it.dataset.ivwCal = "1"; continue; }

      var meta = el("span", "ivw-cal-meta");
      meta.appendChild(fechaChip("ini", fechaCorta(ini)));
      if (fin && fin.getTime() !== ini.getTime()) meta.appendChild(fechaChip("fin", fechaCorta(fin)));

      // El contenido original se guarda tal cual, oculto mientras el wrap está ON.
      // Los hijos se recogen antes de tocarlos: mover el <b> mientras se
      // recorre `firstChild` deja el bucle dando vueltas para siempre.
      var raw = el("span", "ivw-cal-raw");
      var nombre = p.querySelector("b");
      var hijos = [];
      for (var k = 0; k < p.childNodes.length; k++) hijos.push(p.childNodes[k]);
      for (var j = 0; j < hijos.length; j++) {
        if (hijos[j] !== nombre) raw.appendChild(hijos[j]);
      }
      if (nombre) nombre.classList.add("ivw-cal-title");
      p.appendChild(meta);
      p.appendChild(raw);

      var hasta = fin || ini;
      it.dataset.ivwState = hasta < hoy ? "past" : (ini <= hoy ? "now" : "future");
      it.dataset.ivwCal = "1";
    }
  }

  function fechaCorta(d) {
    var dd = ("0" + d.getDate()).slice(-2);
    return dd + " " + MESES_ES[d.getMonth()].slice(0, 3).toLowerCase() + " " + d.getFullYear();
  }

  /* ---------- 5k. Portada pública del Portal de Sistemas ----------
     La portada de apps9/PortalSistemas: nav fija, "hero" con solo un título,
     carrusel de banners, el calendario escolar embebido, ligas, galería y el
     modal de acceso que se abre solo al cargar. Aquí se le añade la entradilla
     y los botones que le faltaban al hero, un encabezado al calendario y se
     arreglan los títulos que venían en mayúsculas de caja. */
  var PI_FIX = { galeria: "galería", interes: "interés" };
  var PI_ACRONYM = { itson: "ITSON", cia: "CIA", sib: "SIB", eres: "ERES", ivirtual: "iVirtual" };
  var PI_MINOR = { de: 1, del: 1, la: 1, las: 1, el: 1, los: 1, y: 1, e: 1, a: 1, en: 1 };

  function piTitle(str) {
    var words = str.toLowerCase().split(/\s+/);
    var out = [];
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      var key = w.replace(/[^0-9a-záéíóúüñ]/gi, "");
      if (PI_FIX[key]) { w = w.replace(key, PI_FIX[key]); key = PI_FIX[key]; }
      if (PI_ACRONYM[key]) out.push(w.replace(key, PI_ACRONYM[key]));
      else if (i && PI_MINOR[key]) out.push(w);
      else out.push(w.charAt(0).toUpperCase() + w.slice(1));
    }
    return out.join(" ");
  }

  // Igual que piTitle pero en estilo español: mayúscula solo en la primera
  // palabra (y en las siglas). "LIGAS DE INTERÉS" → "Ligas de interés".
  function piSentence(str) {
    var t = piTitle(str).split(" ");
    for (var i = 1; i < t.length; i++) {
      var key = t[i].replace(/[^0-9a-záéíóúüñ]/gi, "").toLowerCase();
      if (!PI_ACRONYM[key]) t[i] = t[i].toLowerCase();
    }
    return t.join(" ");
  }

  // Corrige la ortografía siempre; recapitaliza solo lo que venía en versales.
  function piTidyText(node, sentence) {
    if (!node || node.dataset.ivwText) return;
    var t = textOf(node);
    if (!t || t.length > 60) return;
    var next = /[a-záéíóúñ]/.test(t)
      ? t.replace(/Galeria/g, "Galería").replace(/\bIVirtual\b/g, "iVirtual")
      : (sentence ? piSentence(t) : piTitle(t));
    if (next === t) return;
    node.dataset.ivwText = "1";
    node.textContent = next;
  }

  function piTitles() {
    piTidyText(document.querySelector("#hero-area .head-title"));
    var nodes = document.querySelectorAll(
      ".section-header h2, nav.navbar .nav-link, .mobile-menu a," +
      "#ligasinteres .services-content h3 a"
    );
    for (var i = 0; i < nodes.length; i++) piTidyText(nodes[i], true);
  }

  function piHero() {
    var contents = document.querySelector("#hero-area .contents");
    if (!contents || document.querySelector(".ivw-pi-sub")) return;
    var title = contents.querySelector(".head-title");
    if (!title) return;

    var sub = el("p", "ivw-pi-sub",
      "Entra a los sistemas de ITSON con tu cuenta de dominio o tu ID de 11 dígitos. " +
      "Aquí también están el calendario escolar del ciclo y las ligas que más se usan.");
    var cta = el("div", "ivw-pi-cta",
      '<a href="#InicioSesion" id="ivw-pi-login">Iniciar sesión</a>' +
      '<a href="http://www.itson.mx/mesadeayuda" target="_blank" rel="noopener">Mesa de ayuda</a>');
    title.parentNode.insertBefore(sub, title.nextSibling);
    sub.parentNode.insertBefore(cta, sub.nextSibling);

    // El modal lo abre bootstrap desde el enlace de la nav (los atributos
    // cambian entre bootstrap 4 y 5 en esta página): se reusa ese enlace.
    var opener = document.querySelector('.btn-sing a[href="#InicioSesion"]');
    var btn = document.getElementById("ivw-pi-login");
    if (opener && btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        opener.click();
      });
    }
  }

  function piCalendar() {
    var sec = document.getElementById("CalendarSection");
    if (!sec || sec.querySelector(".ivw-pi-head")) return;
    var frame = sec.querySelector("iframe");
    if (!frame) return;
    var head = el("div", "ivw-pi-head", "<h2>Calendario escolar</h2>");
    var src = frame.getAttribute("src") || "";
    if (src) {
      head.insertAdjacentHTML("beforeend",
        '<a href="' + src + '" target="_blank" rel="noopener">Abrir en una pestaña</a>');
    }
    sec.insertBefore(head, frame);
  }

  // Los dos banners ya vienen en el HTML, así que el navegador los baja igual;
  // lo que costaba caro era decodificarlos en el hilo principal al cambiar de
  // slide (uno mide 26042×5034). Con `decoding="async"` el cambio deja de dar
  // el tirón, y la prioridad alta va para el que se ve primero.
  function piBanner() {
    var imgs = document.querySelectorAll("#Banner .carousel-item img");
    for (var i = 0; i < imgs.length; i++) {
      if (imgs[i].dataset.ivwImg) continue;
      imgs[i].dataset.ivwImg = "1";
      imgs[i].setAttribute("decoding", "async");
      imgs[i].setAttribute("fetchpriority", i === 0 ? "high" : "low");
    }
  }

  function portalInicio() {
    if (!document.getElementById("hero-area") || !document.getElementById("ligasinteres")) return;
    var root = document.documentElement;
    if (!root.getAttribute("data-ivw-page")) root.setAttribute("data-ivw-page", "portalinicio");
    if (root.getAttribute("data-ivw-page") !== "portalinicio") return;

    piTitles();
    piHero();
    piBanner();
    piCalendar();
    embedListen();
  }

  /* ---------- 5l. Calendario embebido: alto sin scroll propio ----------
     La portada mete /CalendarioEscolar/Calendario/Prototipo en un <iframe> de
     700px, así que el mes se veía por una rendija con su propia barra. El alto
     real solo lo conoce el documento de dentro (es otro origen), y el wrap
     corre en los dos: el de dentro publica su alto y el de fuera lo aplica. */
  var IVW_EMBED_MSG = "ivw-embed-height";

  // Dentro del iframe: publicar el alto del documento al contenedor.
  function embedReportHeight() {
    var root = document.documentElement;
    if (root.getAttribute("data-ivw-view") !== "prototipo") return;
    if (window.top === window.self || !window.parent) return;

    var last = 0;
    var send = function () {
      var body = document.body;
      if (!body) return;
      var h = Math.max(body.scrollHeight, root.scrollHeight, body.offsetHeight);
      if (!h || Math.abs(h - last) < 8) return;
      last = h;
      try { window.parent.postMessage({ type: IVW_EMBED_MSG, height: h }, "*"); } catch (e) {}
    };

    if (window.__ivwEmbedSend) return;
    window.__ivwEmbedSend = send;
    send();
    // El calendario se pinta por AJAX y se repinta al cambiar de mes o vista.
    if (window.ResizeObserver && document.body) {
      new ResizeObserver(send).observe(document.body);
    }
    window.addEventListener("load", send);
    var n = 0;
    var t = setInterval(function () { send(); if (++n > 20) clearInterval(t); }, 500);
  }

  // Fuera: aplicar el alto que publica el calendario.
  function embedListen() {
    if (window.__ivwEmbedListener) return;
    var frame = document.querySelector('#CalendarSection iframe[src*="CalendarioEscolar"]');
    if (!frame) return;
    window.__ivwEmbedListener = true;
    var expected = "";
    try { expected = new URL(frame.getAttribute("src"), location.href).origin; } catch (err) {}

    window.addEventListener("message", function (e) {
      // Solo del propio marco del calendario, y solo desde su origen.
      if (e.source !== frame.contentWindow) return;
      if (expected && e.origin !== expected) return;
      var d = e.data;
      if (!d || d.type !== IVW_EMBED_MSG) return;
      var h = parseInt(d.height, 10);
      if (!h || h < 300 || h > 6000) return;
      // Vía setInline: así `clearInline()` devuelve el alto del sitio al apagar.
      setInline(frame, { height: h + "px" });
      frame.setAttribute("scrolling", "no");
    });
  }

  /* ---------- 5.c Lista de actividades del curso ----------
     Moodle deja un `<span class="activitybadge">` vacío en cada actividad
     (lo usa para "Tarea", "Foro", el estado de finalización…). Vacío se
     dibujaba igual como una pastilla gris al lado del nombre. */
  function courseActivities() {
    // Resúmenes de sección que solo traen espacios o párrafos vacíos: el tema
    // los pinta igual y dejan un bloque gris colgando bajo el título.
    var sums = document.querySelectorAll(".course-content .summarytext");
    for (var k = 0; k < sums.length; k++) {
      var sum = sums[k];
      if (sum.dataset.ivwSum) continue;
      sum.dataset.ivwSum = "1";
      if (!textOf(sum) && !sum.querySelector("img, video, iframe")) sum.classList.add("ivw-empty");
    }

    var badges = document.querySelectorAll(".course-content .activitybadge");
    for (var i = 0; i < badges.length; i++) {
      var b = badges[i];
      if (b.dataset.ivwBadge) continue;
      b.dataset.ivwBadge = "1";
      if (!textOf(b)) b.classList.add("ivw-empty");
    }
  }

  /* ---------- 5m. Formulario de denuncia (apps9/eres) ----------
     Trámite delicado y largo. No se toca ni un texto del formulario ni sus
     reglas: solo se le pone jerarquía al encabezado (el título era un
     <label class="big"> suelto), se avisa de que todo es obligatorio —lo son,
     según las reglas de jquery.validate del sitio—, se cuenta lo escrito en la
     descripción (tope de 500) y se completan teclado y autocompletado. */
  function eresForm() {
    var form = document.getElementById("frmQueja");
    if (!form) return;
    var root = document.documentElement;
    if (!root.getAttribute("data-ivw-page")) root.setAttribute("data-ivw-page", "eres");
    if (root.getAttribute("data-ivw-page") !== "eres") return;

    eresHeading(form);
    eresHints();
    eresCounter();
    eresCaptcha();
  }

  function eresHeading(form) {
    var lbl = form.querySelector(".text-center label.big");
    if (!lbl || lbl.dataset.ivwDone) return;
    lbl.dataset.ivwDone = "1";
    var h = el("h1", "ivw-eres-title");
    h.textContent = textOf(lbl);
    lbl.setAttribute("data-ivw-hide", "1");
    lbl.parentNode.insertBefore(h, lbl);
    var note = el("p", "ivw-eres-note",
      "Todos los campos son obligatorios. Al final se pide copiar un código de seguridad.");
    h.parentNode.insertBefore(note, lbl);
  }

  // Teclado numérico donde el sitio ya filtra a dígitos, y autocompletado.
  function eresHints() {
    var hints = [
      ["txtnombre", { autocomplete: "name" }],
      ["txtEdad", { inputmode: "numeric", autocomplete: "off" }],
      ["txtTelefono", { inputmode: "tel", autocomplete: "tel" }],
      ["txtCorreo", { inputmode: "email", autocomplete: "email" }],
      ["cpatchaTextBox", { autocomplete: "off", autocapitalize: "off", spellcheck: "false" }]
    ];
    for (var i = 0; i < hints.length; i++) {
      var node = document.getElementById(hints[i][0]);
      if (!node || node.dataset.ivwHints) continue;
      node.dataset.ivwHints = "1";
      var attrs = hints[i][1];
      for (var k in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, k)) node.setAttribute(k, attrs[k]);
      }
    }
  }

  // "Máximo 500 caracteres" solo estaba en el placeholder, que desaparece al
  // escribir: el contador lo dice mientras se redacta.
  function eresCounter() {
    var box = document.getElementById("txtCaso");
    if (!box || box.dataset.ivwCount) return;
    box.dataset.ivwCount = "1";
    var max = parseInt(box.getAttribute("maxlength"), 10) || 500;
    var out = el("span", "ivw-eres-count");
    box.parentNode.appendChild(out);
    var paint = function () {
      var n = (box.value || "").length;
      out.textContent = n + " / " + max + " caracteres";
      out.setAttribute("data-full", n >= max ? "1" : "0");
    };
    box.addEventListener("input", paint);
    paint();
  }

  function eresCaptcha() {
    var input = document.getElementById("cpatchaTextBox");
    if (!input) return;
    var box = input.parentNode;
    if (!box || box.querySelector(".ivw-eres-captcha-label")) return;
    var lbl = el("span", "ivw-eres-captcha-label", "Escribe el código de la imagen");
    box.insertBefore(lbl, box.firstChild);
    input.setAttribute("aria-label", "Código de seguridad");
  }

  /* ---------- 5.d Vista previa del PDF entregado ----------
     En una tarea con entrega de archivo Moodle solo deja el enlace: para
     mirar lo que subiste hay que descargarlo. Aquí se incrusta debajo del
     estado de la entrega.
     El archivo se sirve con `Content-Disposition: attachment`, así que un
     <iframe> apuntando a la URL dispararía una descarga en vez de mostrarlo:
     se pide con fetch (misma sesión, mismo origen) y se muestra el blob, que
     el visor de PDF del navegador sí abre. Nada sale de ivirtual. */
  function pdfName(url) {
    try {
      var path = decodeURIComponent(url.split("?")[0]);
      return path.substring(path.lastIndexOf("/") + 1);
    } catch (e) { return "documento.pdf"; }
  }

  function cargarPdf(det, url) {
    if (det.dataset.ivwLoaded) return;
    det.dataset.ivwLoaded = "1";
    var frame = det.querySelector(".ivw-pdf-frame");
    var nota = det.querySelector(".ivw-pdf-note");
    var abrir = det.querySelector(".ivw-pdf-open");
    fetch(url, { credentials: "same-origin" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.blob();
      })
      .then(function (blob) {
        // Si la sesión caducó, Moodle responde 200 con la página de login:
        // sin esta comprobación el visor mostraría ese HTML.
        if (blob.type && blob.type.indexOf("pdf") === -1) throw new Error("no es pdf");
        var obj = URL.createObjectURL(blob);
        frame.src = obj + "#view=FitH";
        if (abrir) abrir.href = obj;
        if (nota) nota.remove();
      })
      .catch(function () {
        det.dataset.ivwLoaded = "";
        if (nota) nota.textContent = "No se pudo cargar la vista previa. Puedes abrirlo en una pestaña nueva.";
      });
  }

  function assignPdfPreview() {
    var box = document.querySelector(".submissionstatustable");
    if (!box || box.dataset.ivwPdf) return;
    var links = box.querySelectorAll('.fileuploadsubmission a[href*="pluginfile.php"]');
    if (!links.length) return;
    box.dataset.ivwPdf = "1";

    var hechos = 0;
    for (var i = 0; i < links.length && hechos < 3; i++) {
      var href = links[i].href || "";
      if (!/\.pdf$/i.test(href.split("?")[0])) continue;
      var url = href;
      var nombre = pdfName(url);

      var det = el("details", "ivw-pdf");
      det.open = false;   // cerrado de partida: el PDF se pide al abrirlo
      var sum = el("summary", "ivw-pdf-head",
        '<span class="ivw-pdf-title">Vista previa · ' + nombre + "</span>");
      var abrir = el("a", "ivw-pdf-open", "Abrir en pestaña nueva");
      abrir.href = url;
      abrir.target = "_blank";
      abrir.rel = "noopener";
      abrir.addEventListener("click", function (ev) { ev.stopPropagation(); });
      sum.appendChild(abrir);

      var cuerpo = el("div", "ivw-pdf-body");
      var nota = el("p", "ivw-pdf-note", "Cargando vista previa…");
      var frame = document.createElement("iframe");
      frame.className = "ivw-pdf-frame";
      frame.title = "Vista previa de " + nombre;
      cuerpo.appendChild(nota);
      cuerpo.appendChild(frame);

      det.appendChild(sum);
      det.appendChild(cuerpo);
      // Al final de la pantalla: primero el estado, luego el enunciado y la
      // vista previa cierra. `#region-main` es quien ordena esos bloques.
      var destino = document.querySelector("#region-main") || box.parentNode;
      destino.appendChild(det);

      (function (d, u) {
        d.addEventListener("toggle", function () { if (d.open) cargarPdf(d, u); });
      })(det, url);
      hechos++;
    }
  }

  /* ---------- 5.e Altura real de la barra superior ----------
     Los cajones laterales van `position: fixed; top: 0`, así que arrancan
     por detrás de la barra superior. Aquí se mide la barra y se publica su
     alto en `--ivw-header-h`, que la CSS usa para bajarlos hasta el ras. */
  function headerOffset() {
    var bar = document.querySelector("#header1, .navbar.fixed-top, header .navbar");
    if (!bar) return;
    var h = Math.round(bar.getBoundingClientRect().height);
    if (!h || h > 200) return;
    document.documentElement.style.setProperty("--ivw-header-h", h + "px");
  }

  var headerTimer = null;
  function watchHeader() {
    if (window.__ivwHeaderWatch) return;
    window.__ivwHeaderWatch = 1;
    window.addEventListener("resize", function () {
      clearTimeout(headerTimer);
      headerTimer = setTimeout(headerOffset, 120);
    });
  }

  /* ---------- 5n. Calendario anual: los combos jqxDropDownList ----------
     El arreglo del desplegable de "Año" necesita el jQuery de la página y no
     puede vivir aquí: este script corre en el mundo aislado de la extensión y
     la CSP de la extensión bloquea inyectar el código como <script> inline.
     Va en src/page-combos.js, que el manifest carga con "world": "MAIN" (y
     build.js mete en el paquete del userscript/bookmarklet). */

  /* ---------- 5.f Zona de subida clicable ----------
     En el gestor de archivos, el recuadro de "arrastre y suelte" es solo
     texto: para elegir un archivo hay que dar con el botón pequeño de la
     barra. Aquí el recuadro entero abre ese mismo selector. */
  function uploadArea() {
    var zonas = document.querySelectorAll(".filemanager .fm-empty-container");
    for (var i = 0; i < zonas.length; i++) {
      var z = zonas[i];
      if (z.dataset.ivwDrop) continue;
      z.dataset.ivwDrop = "1";
      z.setAttribute("role", "button");
      z.setAttribute("tabindex", "0");
      z.addEventListener("click", function (ev) {
        var fm = ev.currentTarget.closest(".filemanager");
        var btn = fm && fm.querySelector(".fp-btn-add a");
        if (btn) btn.click();
      });
      z.addEventListener("keydown", function (ev) {
        if (ev.key !== "Enter" && ev.key !== " ") return;
        ev.preventDefault();
        ev.currentTarget.click();
      });
    }
  }

  /* ---------- 6. Fixes varios ---------- */
  function domFixes() {
    var imgs = document.querySelectorAll('img[src^="http://ivirtual.itson.edu.mx"]');
    for (var i = 0; i < imgs.length; i++) imgs[i].src = imgs[i].src.replace(/^http:/, "https:");
  }

  // Moodle carga contenido por AJAX (más actividades de la línea de tiempo,
  // cursos al expandir una categoría, popovers…). Sin esto, lo que llega
  // después se queda con el estilo del tema. Todas las funciones llevan
  // guarda por dataset, así que re-ejecutarlas es barato e idempotente.
  var rerunTimer = null;
  function watchDom() {
    if (window.__ivwObserver || !document.body || !window.MutationObserver) return;
    var obs = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        if (muts[i].addedNodes && muts[i].addedNodes.length) {
          clearTimeout(rerunTimer);
          rerunTimer = setTimeout(rerun, 120);
          return;
        }
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
    window.__ivwObserver = obs;
  }

  function rerun() {
    seguro([
      portalSistemas,
      courseActivities,
      assignPdfPreview,
      filemanagerQuickPick,
      headerOffset,
      portalInicio,
      calendarioAnual,
      eresForm,
      embedReportHeight,
      tidyFormHeaders,
      tidyFormButtons,
      tidyTimeline,
      courseSearchCards,
      frontpageCourseCards,
      hideBlockZoom,
      domFixes
    ]);
  }


  // Punto de entrada único: todo lo que hay que correr cuando el DOM está listo.
  // Cada pantalla usa un puñado de estas funciones; el resto no encuentra su
  // markup y sale sola. Si alguna revienta (markup inesperado), las demás
  // tienen que seguir corriendo: antes un fallo temprano se llevaba por
  // delante todo lo que venía después en la lista.
  function seguro(fns) {
    for (var i = 0; i < fns.length; i++) {
      try {
        fns[i]();
      } catch (e) {
        console.warn("[ivw] falló " + (fns[i].name || "una mejora") + ":", e);
      }
    }
  }

  /* Subir un archivo sin fricción ----------
     La zona de arrastre parece un botón pero Moodle no le engancha nada: el
     selector de archivos solo se abre desde el botón "Subir archivo", y desde
     ahí todavía hay que elegir el repositorio y pulsar "Seleccionar archivo".
     Aquí el clic en la zona abre ese diálogo y, en cuanto aparece, elige el
     repositorio de subida y dispara el explorador del sistema.

     El sondeo es corto a propósito: Chrome solo deja abrir el explorador
     mientras dure la activación del clic (unos segundos). Si no llega a
     tiempo, el diálogo se queda abierto y el usuario sigue a mano. */
  function visible(el) {
    return !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length));
  }

  function pickerUpload(intentos) {
    if (intentos > 45) return;                       // ~4 s
    // Moodle deja diálogos de selector montados y ocultos: vale el que se ve.
    var dlgs = document.querySelectorAll(".moodle-dialogue.filepicker, .file-picker, [data-region='filepicker']");
    var dlg = null;
    for (var d = 0; d < dlgs.length; d++) {
      if (visible(dlgs[d])) { dlg = dlgs[d]; break; }
    }
    if (dlg) {
      var inputs = dlg.querySelectorAll('input[type="file"]');
      for (var n = 0; n < inputs.length; n++) {
        if (inputs[n].dataset.ivwPicked) return;
        inputs[n].dataset.ivwPicked = "1";
        inputs[n].click();
        return;
      }
      // Todavía en otro repositorio ("Archivos recientes", "Archivos privados"…)
      var repos = dlg.querySelectorAll(".fp-repo-name, .fp-repo a");
      for (var i = 0; i < repos.length; i++) {
        if (!/^subir/i.test(textOf(repos[i]))) continue;
        if (repos[i].dataset.ivwRepo) break;
        repos[i].dataset.ivwRepo = "1";
        repos[i].click();
        break;
      }
    }
    setTimeout(function () { pickerUpload(intentos + 1); }, 90);
  }

  function filemanagerQuickPick() {
    // El escuchador va en el documento: el gestor lo pinta el JS de Moodle
    // después, y así no importa quién llegue primero.
    if (window.__ivwQuickPick) return;
    window.__ivwQuickPick = 1;

    document.addEventListener("click", function (ev) {
      if (!ev.target.closest) return;
      var zona = ev.target.closest(".fm-empty-container, .filemanager .dndupload-message");
      if (!zona) return;
      var fm = zona.closest(".filemanager");
      var add = fm && fm.querySelector(".fp-btn-add a, .fp-btn-add button");
      if (!add) return;
      ev.preventDefault();
      ev.stopPropagation();
      add.click();
      pickerUpload(0);
    }, true);
  }

  function run() {
    seguro([
      domFixes,
      moodleChrome,
      tidyUserName,
      courseSearchCards,
      frontpageCourseCards,
      hideBlockZoom,
      tidyTimeline,
      tidyHeadings,
      tidyProfile,
      tidyGrades,
      tidyAttendance,
      dialogEscapes,
      tidyFormHeaders,
      tidyFormButtons,
      guestFrontpage,
      portalSistemas,
      portalInicio,
      calendarioAnual,
      courseActivities,
      assignPdfPreview,
      headerOffset,
      watchHeader,
      eresForm,
      embedReportHeight,
      hideEmpties,
      watchDom
    ]);
  }


  window.ivwEnhance = {
    run: run,
    moodleChrome: moodleChrome,
    topnavLinks: topnavLinks,
    topnavDropdowns: topnavDropdowns,
    filemanagerQuickPick: filemanagerQuickPick,
    langMenu: langMenu,
    guestFrontpage: guestFrontpage,
    courseSearchCards: courseSearchCards,
    frontpageCourseCards: frontpageCourseCards,
    hideBlockZoom: hideBlockZoom,
    tidyTimeline: tidyTimeline,
    tidyProfile: tidyProfile,
    tidyGrades: tidyGrades,
    tidyAttendance: tidyAttendance,
    portalSistemas: portalSistemas,
    portalInicio: portalInicio,
    eresForm: eresForm,
    embedReportHeight: embedReportHeight,
    calendarioAnual: calendarioAnual,
    courseActivities: courseActivities,
    assignPdfPreview: assignPdfPreview,
    headerOffset: headerOffset,
    uploadArea: uploadArea,
    closeDialog: closeDialog,
    clearInline: clearInline,
    rerun: rerun
  };
})();
