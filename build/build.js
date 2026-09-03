/* Genera userscript + bookmarklet + installer desde el CSS de extension/src y build/core.js.
   Uso: node build/build.js  (desde la raíz del repo) */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "extension", "src");
const CSS_ORDER = [
  "base.css",
  "pages/login.css",
  "pages/frontpage.css",
  "pages/dashboard.css",
  "pages/recuperapassword.css",
  "pages/mesaayuda.css",
  "pages/portalsistemas.css",
  "pages/portalinicio.css",
  "pages/eres.css",
  "pages/calendarioescolar.css",
  "pages/coursesearch.css",
  "pages/profile.css",
  "pages/tables.css",
  "pages/forms.css",
  "pages/messaging.css",
  "pages/notifications.css",
  "pages/calendar.css",
  "pages/course.css",
  "pages/attendance.css",
  "pages/reportbuilder.css",
  "pages/chrome.css",
  // Va al final a propósito: es una capa de compatibilidad que corrige lo que
  // Moodle y Adaptable pintan por su cuenta, así que tiene que poder pisar a
  // las hojas de página. Mismo orden que los dos bloques de manifest.json.
  "pages/dark.css",
];

function read(p) { return fs.readFileSync(p, "utf8"); }
function write(p, c) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, c); console.log("→", path.relative(ROOT, p)); }

// 1) CSS concatenado
const css = CSS_ORDER.map((f) => "/* " + f + " */\n" + read(path.join(SRC, f))).join("\n\n");

// 2) core con CSS embebido
const coreSrc = read(path.join(__dirname, "core.js"));
if ((coreSrc.match(/__IVW_CSS__/g) || []).length !== 1) throw new Error("core.js debe tener el marcador __IVW_CSS__ exactamente 1 vez");
if ((coreSrc.match(/__IVW_ENHANCE__/g) || []).length !== 1) throw new Error("core.js debe tener el marcador __IVW_ENHANCE__ exactamente 1 vez");
// page-combos.js va aparte en la extensión (content script "world": "MAIN",
// porque su CSP no deja inyectar inline); aquí ya corremos en la página, así
// que basta con acompañarlo: es un IIFE con su propia guarda por ruta.
const enhance = read(path.join(SRC, "enhance.js")) + "\n" + read(path.join(SRC, "page-combos.js"));
const core = coreSrc
  .split("__IVW_CSS__").join(JSON.stringify(css))
  .split("__IVW_ENHANCE__").join(enhance);

// 3) userscript
const USERSCRIPT_HEADER = `// ==UserScript==
// @name         iVirtual Wrap
// @namespace    https://github.com/oyzters/iVirtual-Wrap
// @version      0.1.0
// @description  Interfaz limpia y moderna sobre iVirtual (Moodle) de ITSON. Corre sobre tu propia sesión; sin servidor ni credenciales.
// @author       Oyzters
// @icon         https://raw.githubusercontent.com/oyzters/iVirtual-Wrap/main/extension/icons/icon-128.png
// @homepageURL  https://github.com/oyzters/iVirtual-Wrap
// @supportURL   https://github.com/oyzters/iVirtual-Wrap/issues
// @downloadURL  https://raw.githubusercontent.com/oyzters/iVirtual-Wrap/main/userscript/ivirtual-wrap.user.js
// @updateURL    https://raw.githubusercontent.com/oyzters/iVirtual-Wrap/main/userscript/ivirtual-wrap.user.js
// @match        https://ivirtual.itson.edu.mx/*
// @match        https://apps9.itson.edu.mx/PortalSistemas*
// @match        https://apps9.itson.edu.mx/eres*
// @match        https://apps9.itson.edu.mx/MesaAyudaITSON/*
// @match        https://apps11.itson.edu.mx/CalendarioEscolar/*
// @run-at       document-idle
// @grant        none
// @license      MIT
// ==/UserScript==
`;
const userscript = USERSCRIPT_HEADER + "\n" + core + "\nwindow.__IVW__.setupAuto();\n";
write(path.join(ROOT, "userscript", "ivirtual-wrap.user.js"), userscript);

// 4) bookmarklet.js (fuente legible)
const bmHeader = `/*
 * iVirtual Wrap — bookmarklet (fuente legible).
 * Versión "sin instalar nada": se guarda como marcador y se hace clic estando
 * dentro de iVirtual. Clic = aplica la capa, otro clic = la quita.
 *
 * Para el bookmarklet listo para arrastrar, abre ivirtual-wrap-installer.html
 * (genera el javascript: automáticamente).
 */
`;
const bookmarkletJs = bmHeader + core + "\nwindow.__IVW__.toggle();\n";
write(path.join(ROOT, "bookmarklet", "bookmarklet.js"), bookmarkletJs);

// 5) cuerpo del bookmarklet (para el href javascript:) y el installer.html
const bmBody = core + "\nwindow.__IVW__.toggle();";
const installerTpl = read(path.join(__dirname, "installer.template.html"));
const installer = installerTpl.replace("__IVW_BODY__", JSON.stringify(bmBody));
write(path.join(ROOT, "bookmarklet", "ivirtual-wrap-installer.html"), installer);

console.log("\nListo. CSS: " + css.length + " chars · core: " + core.length + " chars · bookmarklet body: " + bmBody.length + " chars");
