/* iVirtual Wrap — core compartido (userscript + bookmarklet).
   Sin APIs de extensión: usa localStorage y un botón/badge en la página.
   El CSS se inyecta en build (marcador único abajo). */
(function () {
  // Reinvocación (2º clic del bookmarklet): alternar y salir.
  if (window.__IVW__) { window.__IVW__.toggle(); return; }

  var ROOT = document.documentElement;
  var ATTR = "data-ivw";
  var KEY = "ivwWrapEnabled";
  var THEME_KEY = "ivwThemeMode";   // "auto" | "light" | "dark"
  var CSS = __IVW_CSS__;
  var FONTS =
    "https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap";

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
    if (h.indexOf("apps9") !== -1 && /MesaAyuda/i.test(p)) return "mesaayuda";
    if (h.indexOf("apps9") !== -1 && /PortalSistemas\/PortalSistemas/i.test(p)) return "portalsistemas";
    if (h.indexOf("apps9") !== -1 && /^\/PortalSistemas(\/(Inicio.*)?)?$/i.test(p)) return "portalinicio";
    if (h.indexOf("apps9") !== -1 && /^\/eres/i.test(p)) return "eres";
    if (h.indexOf("apps11") !== -1 && /CalendarioAnual/i.test(p)) return "calendario-anual";
    if (h.indexOf("apps11") !== -1 && /CalendarioEscolar/i.test(p)) return "calendario-escolar";
    return "";
  }

  function isOn() { return ROOT.getAttribute(ATTR) === "on"; }
  function store(on) { try { localStorage.setItem(KEY, on ? "1" : "0"); } catch (e) {} }
  function apply(on) {
    ROOT.setAttribute(ATTR, on ? "on" : "off");
    updateBadge();
    store(on);
    if (window.ivwEnhance) {
      if (on) window.ivwEnhance.rerun();
      else window.ivwEnhance.clearInline();
    }
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

  // Reestructura de DOM compartida con la extensión (extension/src/enhance.js).
  // build.js la inserta aquí íntegra y expone window.ivwEnhance.
__IVW_ENHANCE__

  function onReady() {
    makeBadge();
    if (!window.ivwEnhance) return;
    window.ivwEnhance.run();
    setTimeout(function () { window.ivwEnhance.run(); }, 600);
  }

  /* Tema: el CSS solo mira [data-ivw-theme], así que aquí se resuelve igual
     que en content.js. Sin esto el userscript y el bookmarklet se quedarían
     sin modo oscuro, porque ya no hay `@media (prefers-color-scheme)`. */
  var mqOscuro = window.matchMedia("(prefers-color-scheme: dark)");
  var modoTema = "light";

  function aplicarTema(modo) {
    modoTema = modo || "auto";
    var resuelto = (modoTema === "light" || modoTema === "dark")
      ? modoTema
      : (mqOscuro.matches ? "dark" : "light");
    ROOT.setAttribute("data-ivw-theme", resuelto);
    ROOT.setAttribute("data-ivw-theme-mode", modoTema);
  }

  function ciclarTema() {
    var orden = ["light", "dark", "auto"];
    var siguiente = orden[(orden.indexOf(modoTema) + 1) % orden.length];
    aplicarTema(siguiente);
    try { localStorage.setItem(THEME_KEY, siguiente); } catch (e) {}
    return siguiente;
  }

  function boot(defaultOn) {
    ROOT.setAttribute("data-ivw-page", pageKey());
    var temaGuardado = null;
    try { temaGuardado = localStorage.getItem(THEME_KEY); } catch (e) {}
    aplicarTema(temaGuardado || "light");
    mqOscuro.addEventListener("change", function () {
      if (modoTema === "auto") aplicarTema("auto");
    });
    // enhance.js busca este puente para el botón del topbar.
    window.ivwTema = { actual: function () { return modoTema; }, ciclar: ciclarTema };
    // El calendario escolar tiene una vista reducida (/Calendario/Prototipo) que la
    // portada del Portal de Sistemas embebe en un <iframe>: mismo markup, pero sin
    // sitio para el layout a pantalla completa.
    if (/\/Prototipo/i.test(location.pathname)) ROOT.setAttribute("data-ivw-view", "prototipo");
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
