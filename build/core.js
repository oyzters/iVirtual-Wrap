/* iVirtual Wrap — core compartido (userscript + bookmarklet).
   Sin APIs de extensión: usa localStorage y un botón/badge en la página.
   El CSS se inyecta en build (marcador único abajo). */
(function () {
  // Reinvocación (2º clic del bookmarklet): alternar y salir.
  if (window.__IVW__) { window.__IVW__.toggle(); return; }

  var ROOT = document.documentElement;
  var ATTR = "data-ivw";
  var KEY = "ivwWrapEnabled";
  var CSS = __IVW_CSS__;
  var FONTS =
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap";

  function injectFonts() {
    if (document.getElementById("ivw-fonts")) return;
    var l = document.createElement("link");
    l.id = "ivw-fonts";
    l.rel = "stylesheet";
    l.href = FONTS;
    (document.head || document.documentElement).appendChild(l);
  }
  function injectStyle() {
    if (document.getElementById("ivw-style")) return;
    var s = document.createElement("style");
    s.id = "ivw-style";
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function pageKey() {
    var h = location.hostname, p = location.pathname;
    if (h.indexOf("apps9") !== -1 && /CambioPass/i.test(p)) return "recupera";
    return "";
  }

  function isOn() { return ROOT.getAttribute(ATTR) === "on"; }
  function store(on) { try { localStorage.setItem(KEY, on ? "1" : "0"); } catch (e) {} }
  function apply(on) {
    ROOT.setAttribute(ATTR, on ? "on" : "off");
    updateBadge();
    store(on);
  }

  function makeBadge() {
    if (!document.body || document.getElementById("ivw-badge")) return;
    var b = document.createElement("button");
    b.id = "ivw-badge";
    b.type = "button";
    b.addEventListener("click", function () { apply(!isOn()); });
    document.body.appendChild(b);
    updateBadge();
  }
  function updateBadge() {
    var b = document.getElementById("ivw-badge");
    if (!b) return;
    var on = isOn();
    b.textContent = on ? "iVirtual Wrap: ON" : "iVirtual Wrap: OFF";
    b.setAttribute("data-on", on ? "1" : "0");
  }

  // Reestructura del header de Moodle (idéntica a la extensión)
  function moodleChrome() {
    if (location.hostname.indexOf("ivirtual") === -1) return;

    var nodes = document.querySelectorAll("a,button,span,li,div");
    for (var k = 0; k < nodes.length; k++) {
      var el = nodes[k];
      var txt = (el.textContent || "").trim();
      if (el.children.length <= 1 && /^Vista\s+(est[aá]ndar|compacta)$/i.test(txt)) {
        (el.closest("li,.nav-item,a,button,div") || el).setAttribute("data-ivw-hide", "1");
      }
    }

    var userNav = document.querySelector("#adaptable-user-nav");
    var topbarInner = userNav ? userNav.parentElement : null;
    if (topbarInner) {
      var search = document.querySelector(".headersearch");
      if (search && !search.dataset.ivwMoved) {
        search.dataset.ivwMoved = "1";
        search.classList.add("ivw-search");
        userNav.insertBefore(search, userNav.firstChild);
      }

      var mainMenu = null;
      document.querySelectorAll("ul.navbar-nav").forEach(function (ul) {
        if (ul.id === "adaptable-user-nav" || ul.dataset.ivwMoved) return;
        if (/Inicio|Tablero|Cursos|Eventos/i.test(ul.textContent || "")) mainMenu = mainMenu || ul;
      });
      if (mainMenu && !mainMenu.dataset.ivwMoved) {
        var oldBar = mainMenu.closest("nav,.navbar");
        mainMenu.dataset.ivwMoved = "1";
        mainMenu.classList.add("ivw-topnav");
        topbarInner.insertBefore(mainMenu, userNav);
        if (oldBar) {
          oldBar.setAttribute("data-ivw-hide", "1");
          var barWrap = oldBar.parentElement;
          if (barWrap && barWrap !== topbarInner && !barWrap.querySelector("#adaptable-user-nav")) {
            barWrap.setAttribute("data-ivw-hide", "1");
          }
        }
      }
    }

    document.querySelectorAll("i.fa-magnifying-glass").forEach(function (ic) {
      if (ic.closest(".ivw-search")) return;
      var w = ic.closest("button,a,li");
      if (w) w.setAttribute("data-ivw-hide", "1");
    });

    document.querySelectorAll(".navbarsearchsocial, [data-action='opensearch']").forEach(function (el) {
      el.remove();
    });
  }

  function runDomFixes() {
    if (!isOn()) return;
    document.querySelectorAll('img[src^="http://ivirtual.itson.edu.mx"]').forEach(function (el) {
      el.src = el.src.replace(/^http:/, "https:");
    });
  }

  function onReady() {
    makeBadge();
    runDomFixes();
    moodleChrome();
    setTimeout(moodleChrome, 600);
  }

  function boot(defaultOn) {
    ROOT.setAttribute("data-ivw-page", pageKey());
    injectFonts();
    injectStyle();
    var stored = null;
    try { stored = localStorage.getItem(KEY); } catch (e) {}
    apply(stored === null ? defaultOn : stored === "1");
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", onReady);
    else onReady();
  }

  window.__IVW__ = {
    isOn: isOn,
    apply: apply,
    toggle: function () {
      injectFonts(); injectStyle();
      if (!ROOT.hasAttribute(ATTR)) { boot(true); return; } // 1ª vez: encender
      apply(!isOn());
      onReady();
    },
    setupAuto: function () { boot(true); },
  };
  // El archivo generado (build.js) agrega aquí la llamada según el modo:
  //   userscript  → __IVW__.setupAuto();
  //   bookmarklet → __IVW__.toggle();
})();
