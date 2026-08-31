// Pegar en la consola de Chrome (F12) estando en la pantalla a inspeccionar.
// Deja en el portapapeles un resumen del bloque que le pases por selector.
//   ivwDump('.mform legend')        → markup + estilos calculados clave
//   ivwDump('#fitem_id_buttonar')
function ivwDump(sel) {
  var n = document.querySelector(sel);
  if (!n) return "sin coincidencias para " + sel;
  var props = ["display", "position", "margin", "padding", "gridTemplateColumns",
               "flexDirection", "alignItems", "width", "float", "overflow", "color", "fontSize"];
  var out = ["== " + sel + " =="];
  function walk(el, depth) {
    if (depth > 3) return;
    var c = getComputedStyle(el), r = el.getBoundingClientRect();
    var line = "  ".repeat(depth) + "<" + el.tagName.toLowerCase() +
      (el.id ? "#" + el.id : "") + "." + (el.className || "").toString().trim().replace(/\s+/g, ".") + ">";
    line += " [" + Math.round(r.x) + "," + Math.round(r.y) + " " + Math.round(r.width) + "x" + Math.round(r.height) + "]";
    line += " " + props.map(function (p) { return p + ":" + c[p]; }).join(" ");
    out.push(line);
    for (var i = 0; i < el.children.length; i++) walk(el.children[i], depth + 1);
  }
  walk(n, 0);
  out.push("== HTML ==", n.outerHTML);
  var txt = out.join("\n");
  if (typeof copy === "function") copy(txt);
  return txt;
}
