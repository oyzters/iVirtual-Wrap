// iVirtual Wrap — content script
// Aplica/quita el reskin poniendo un atributo en <html>. Toda la CSS vive bajo
// [data-ivw="on"], así togglear el atributo enciende/apaga todo sin recargar.
// La reestructura de DOM vive en enhance.js (compartida con userscript/bookmarklet).

const ROOT = document.documentElement;
const ATTR = "data-ivw";
const KEY = "wrapEnabled";
const log = (...a) => console.log("[ivw]", ...a);

// Optimista: aplicar YA en document_start para evitar flash. Se corrige tras leer storage.
ROOT.setAttribute(ATTR, "on");

// Marcar la página para scoping de CSS por pantalla (útil donde <body> no trae id).
function pageKey() {
  const h = location.hostname;
  const p = location.pathname;
  if (h.indexOf("apps9") !== -1 && /CambioPass/i.test(p)) return "recupera";
  if (h.indexOf("apps9") !== -1 && /MesaAyuda/i.test(p)) return "mesaayuda";
  if (h.indexOf("apps9") !== -1 && /PortalSistemas\/PortalSistemas/i.test(p)) return "portalsistemas";
  if (h.indexOf("apps9") !== -1 && /^\/PortalSistemas(\/(Inicio.*)?)?$/i.test(p)) return "portalinicio";
  if (h.indexOf("apps9") !== -1 && /^\/eres/i.test(p)) return "eres";
  if (h.indexOf("apps11") !== -1 && /CalendarioAnual/i.test(p)) return "calendario-anual";
  if (h.indexOf("apps11") !== -1 && /CalendarioEscolar/i.test(p)) return "calendario-escolar";
  return "";
}
ROOT.setAttribute("data-ivw-page", pageKey());
// El calendario escolar tiene una vista reducida (/Calendario/Prototipo) que la
// portada del Portal de Sistemas embebe en un <iframe>: mismo markup, pero sin
// sitio para el layout a pantalla completa.
if (/\/Prototipo/i.test(location.pathname)) ROOT.setAttribute("data-ivw-view", "prototipo");

// Inyectar Google Fonts (el sitio no manda CSP → carga sin problema)
function injectFonts() {
  if (document.getElementById("ivw-fonts")) return;
  const pre1 = document.createElement("link");
  pre1.rel = "preconnect";
  pre1.href = "https://fonts.googleapis.com";
  const pre2 = document.createElement("link");
  pre2.rel = "preconnect";
  pre2.href = "https://fonts.gstatic.com";
  pre2.crossOrigin = "anonymous";
  const font = document.createElement("link");
  font.id = "ivw-fonts";
  font.rel = "stylesheet";
  font.href =
    "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600&family=Figtree:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap";
  (document.head || document.documentElement).append(pre1, pre2, font);
}
injectFonts();

function isOn() {
  return ROOT.getAttribute(ATTR) === "on";
}

function apply(enabled) {
  ROOT.setAttribute(ATTR, enabled ? "on" : "off");
  updateBadge();
  // Los arreglos que van como estilo inline se revierten al apagar
  if (typeof ivwEnhance !== "undefined") {
    if (enabled) ivwEnhance.rerun();
    else ivwEnhance.clearInline();
  }
  log("apply", enabled ? "ON" : "OFF");
}

// --- Botón/badge flotante que TOGGLEA al click (siempre visible, ON y OFF) ---
function makeBadge() {
  if (!document.body || document.getElementById("ivw-badge")) return;
  const b = document.createElement("button");
  b.id = "ivw-badge";
  b.type = "button";
  b.addEventListener("click", () => {
    const next = !isOn();
    apply(next);
    ivwStorage.set({ [KEY]: next });
  });
  document.body.appendChild(b);
  updateBadge();
}

function updateBadge() {
  const b = document.getElementById("ivw-badge");
  if (!b) return;
  const on = isOn();
  b.textContent = on ? "iVirtual Wrap: ON" : "iVirtual Wrap: OFF";
  b.dataset.on = on ? "1" : "0";
}

// Estado inicial (default: activado)
ivwStorage.get({ [KEY]: true }).then((cfg) => apply(cfg[KEY]));

// Toggle desde el popup (mensaje directo)
chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === "ivw-toggle") apply(msg.enabled);
});

// Respaldo: cambios de storage desde cualquier origen
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && KEY in changes) apply(changes[KEY].newValue);
});

function onReady() {
  makeBadge();
  ivwEnhance.run();
  setTimeout(() => ivwEnhance.run(), 600); // reintento: parte del header se arma con JS
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", onReady);
} else {
  onReady();
}
