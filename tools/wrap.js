#!/usr/bin/env node
/* Prepara un fixture descargado para verlo con el wrap aplicado.
 *
 *   node tools/wrap.js fixtures/perfil-editar.html
 *
 * Genera fixtures/perfil-editar.wrap.html: el mismo HTML con data-ivw="on",
 * el CSS del tema de Moodle intacto (resuelto contra el sitio con <base>) y
 * encima el CSS + enhance.js de la extensión. El JS del sitio se quita para
 * que el fixture renderice igual sin sesión. */
const fs = require("fs");
const path = require("path");

const BASE = process.env.IVW_BASE || "https://ivirtual.itson.edu.mx";
const SRC = path.join(__dirname, "..", "extension", "src");
const CSS = [
  "base.css", "pages/login.css", "pages/dashboard.css", "pages/frontpage.css",
  "pages/recuperapassword.css", "pages/mesaayuda.css", "pages/portalsistemas.css", "pages/portalinicio.css", "pages/eres.css", "pages/calendarioescolar.css", "pages/coursesearch.css", "pages/profile.css",
  "pages/tables.css", "pages/forms.css", "pages/messaging.css", "pages/notifications.css", "pages/calendar.css", "pages/course.css", "pages/attendance.css", "pages/reportbuilder.css", "pages/chrome.css"
];

const input = process.argv[2];
if (!input) {
  console.error("uso: node tools/wrap.js fixtures/<nombre>.html");
  process.exit(1);
}

let html = fs.readFileSync(input, "utf8");
let boot2 = "";

// Sin JS del sitio: el fixture es estático, no hay sesión ni servicios web.
// IVW_KEEP_JS=1 lo conserva, para pantallas donde el JS es la pantalla misma
// (carruseles, modales) y las librerías se cargan del propio sitio.
if (!process.env.IVW_KEEP_JS) {
  html = html.replace(/<script\b[^>]*\bsrc=(["'])(?:(?!\1).)*\1[^>]*>\s*<\/script>/gi, "");
  html = html.replace(/<script\b(?![^>]*\btype=(["'])(?:text\/)?template\1)[^>]*>[\s\S]*?<\/script>/gi, "");
}

// El CSS del tema se queda: sin él no se parece en nada a la pantalla real.
const base = `<base href="${BASE}/">`;
const links = CSS
  .map((f) => `<link rel="stylesheet" href="file://${path.join(SRC, f)}">`)
  .join("\n");
const boot =
  `<script src="file://${path.join(SRC, "enhance.js")}"></script>` +
  `<script>window.ivwEnhance.run();</script>`;

// Algunas pantallas (el calendario anual) se sirven sin <html>: el navegador lo
// crea, pero aquí no hay dónde poner el flag, así que se pone por script como
// hace content.js.
if (/<html/i.test(html)) {
  html = html.replace(/<html/i, '<html data-ivw="on"');
} else {
  boot2 = '<script>document.documentElement.setAttribute("data-ivw","on");</script>';
}
html = html.replace(/<head([^>]*)>/i, `<head$1>${base}`);
html = html.replace(/<\/head>/i, links + boot2 + "\n</head>");
html = html.replace(/<\/body>/i, boot + "\n</body>");

const out = input.replace(/\.html$/, "") + ".wrap.html";
fs.writeFileSync(out, html);
console.log("→ " + out);
