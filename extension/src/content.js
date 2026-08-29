// iVirtual Wrap — content script
// Aplica/quita el reskin poniendo un atributo en <html>. Toda la CSS de wrap.css
// vive bajo [data-ivw="on"], así togglear el atributo enciende/apaga todo sin recargar.

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
  return "";
}
ROOT.setAttribute("data-ivw-page", pageKey());

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
    "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600&family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap";
  (document.head || document.documentElement).append(pre1, pre2, font);
}
injectFonts();

function isOn() {
  return ROOT.getAttribute(ATTR) === "on";
}

function apply(enabled) {
  ROOT.setAttribute(ATTR, enabled ? "on" : "off");
  updateBadge();
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

// --- Fixes de DOM/JS que la CSS sola no cubre ---
function runDomFixes() {
  if (!isOn()) return;
  document.querySelectorAll('img[src^="http://ivirtual.itson.edu.mx"]').forEach((el) => {
    el.src = el.src.replace(/^http:/, "https:");
  });
}

// --- Reestructura del header de Moodle: subir tabs al topbar, ocultar "Vista estándar" ---
function moodleChrome() {
  if (location.hostname.indexOf("ivirtual") === -1) return;

  // Ocultar "Vista estándar" / "Vista compacta"
  document.querySelectorAll("a,button,span,li,div").forEach((el) => {
    const txt = (el.textContent || "").trim();
    if (el.children.length <= 1 && /^Vista\s+(est[aá]ndar|compacta)$/i.test(txt)) {
      const w = el.closest("li,.nav-item,a,button,div") || el;
      w.setAttribute("data-ivw-hide", "1");
    }
  });

  // Mover el menú de tabs (Inicio/Tablero/Cursos/Eventos) al topbar
  const userNav = document.querySelector("#adaptable-user-nav");
  const topbarInner = userNav ? userNav.parentElement : null;
  if (topbarInner) {
    let mainMenu = null;
    document.querySelectorAll("ul.navbar-nav").forEach((ul) => {
      if (ul.id === "adaptable-user-nav" || ul.dataset.ivwMoved) return;
      if (/Inicio|Tablero|Cursos|Eventos/i.test(ul.textContent || "")) mainMenu = mainMenu || ul;
    });
    // Mover el buscador de escritorio (.headersearch vive en #page-header oculto) al topbar
    const search = document.querySelector(".headersearch");
    if (search && !search.dataset.ivwMoved) {
      search.dataset.ivwMoved = "1";
      search.classList.add("ivw-search");
      userNav.insertBefore(search, userNav.firstChild);
    }

    if (mainMenu && !mainMenu.dataset.ivwMoved) {
      const oldBar = mainMenu.closest("nav,.navbar");
      mainMenu.dataset.ivwMoved = "1";
      mainMenu.classList.add("ivw-topnav");
      topbarInner.insertBefore(mainMenu, userNav);
      // Ocultar la barra vieja completa (.btco-hover-menu: nav de tabs vacío +
      // controles "Pantalla completa"/"Vista estándar"). Proteger el topbar.
      if (oldBar) {
        oldBar.setAttribute("data-ivw-hide", "1");
        const barWrap = oldBar.parentElement;
        if (barWrap && barWrap !== topbarInner && !barWrap.querySelector("#adaptable-user-nav")) {
          barWrap.setAttribute("data-ivw-hide", "1");
        }
      }
    }
  }

  // Ocultar cualquier lupa suelta que NO esté en el buscador bueno (.ivw-search)
  // (después de mover .headersearch para no ocultar la buena)
  document.querySelectorAll("i.fa-magnifying-glass").forEach((ic) => {
    if (ic.closest(".ivw-search")) return;
    const w = ic.closest("button,a,li");
    if (w) w.setAttribute("data-ivw-hide", "1");
  });

  // Borrar del DOM el buscador móvil y los toggles opensearch (no solo ocultar)
  document.querySelectorAll(".navbarsearchsocial, [data-action='opensearch']").forEach((el) => el.remove());
}

function onReady() {
  makeBadge();
  runDomFixes();
  moodleChrome();
  setTimeout(moodleChrome, 600); // reintento por si el menú se arma con JS
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", onReady);
} else {
  onReady();
}
