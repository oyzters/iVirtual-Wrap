/* iVirtual Wrap — combos jqxDropDownList del calendario anual.
 *
 * Corre en el MUNDO PRINCIPAL de la página (manifest: "world": "MAIN"), porque
 * necesita el jQuery del sitio: la API de los widgets vive ahí y el content
 * script normal, aislado, no la alcanza. Inyectar un <script> con el código
 * dentro tampoco vale — la CSP de la extensión bloquea el inline —, así que
 * este archivo entra como content script propio. El userscript y el
 * bookmarklet ya corren en la página, y build.js lo mete en su paquete.
 *
 * Qué arregla: "Año" trae 53 opciones y el sitio crea el widget con
 * `autoDropDownHeight: true`, así que el desplegable se dimensiona con el alto
 * de todas y tapa la pantalla entera. No vale recortarlo por CSS: jqwidgets
 * coloca los items en absoluto y desplaza el contenido por su cuenta, de modo
 * que un scroll nativo encima descuadra los clics. Se le pide al widget.
 */
(function () {
  "use strict";

  if (!/CalendarioAnual/i.test(location.pathname)) return;
  if (window.__ivwCombos) return;
  window.__ivwCombos = { estado: "esperando jQuery/jqxDropDownList", ajustes: 0 };

  var ALTO = 260;  // ≈ 12 opciones a la vista; el resto, con el scroll del widget
  var TOPE = 12;   // a partir de aquí se recorta; por debajo manda el contenido
  // Extras por combo. El nombre de calendario más largo no cabe en el ancho por
  // defecto y el desplegable salía con barra horizontal.
  var CFG = {
    cboAniosElegibles: {},
    cboCalendariosElegibles: { width: 350, dropDownWidth: 350 }
  };
  var SEL = "#cboAniosElegibles, #cboCalendariosElegibles";
  // Con el wrap apagado la pantalla vuelve a ser la del sitio, desplegable
  // kilométrico incluido: el flag manda también aquí.
  function activo() {
    return document.documentElement.getAttribute("data-ivw") !== "off";
  }

  var n = 0;
  var espera = setInterval(function () {
    var $ = window.jQuery;
    if (!$ || !$.fn || !$.fn.jqxDropDownList) {
      if (++n > 150) { // 30 s
        clearInterval(espera);
        window.__ivwCombos.estado = "sin jqxDropDownList";
        console.warn("[ivw] combos: jqxDropDownList no apareció");
      }
      return;
    }
    clearInterval(espera);
    arrancar($);
  }, 200);

  function arrancar($) {
    var orig = $.fn.jqxDropDownList.__ivw || $.fn.jqxDropDownList;

    function opcion(el, nombre) {
      try { return orig.call($(el), nombre); } catch (e) { return undefined; }
    }

    // Sólo se recorta lo que lo necesita: "Año" trae 53 opciones y hay que
    // ponerle tope, pero "Calendario" trae cuatro y con el alto fijo quedaba
    // medio desplegable en blanco. Con pocas opciones manda el contenido.
    function cfgDe(el) {
      var extra = CFG[el.id];
      if (!extra) return null;
      var cfg = { autoDropDownHeight: true };
      if (activo()) {
        var items = opcion(el, "getItems");
        if (items && items.length > TOPE) {
          cfg = { autoDropDownHeight: false, dropDownHeight: ALTO };
        }
        for (var k in extra) {
          if (Object.prototype.hasOwnProperty.call(extra, k)) cfg[k] = extra[k];
        }
      }
      return cfg;
    }

    // ajustar() vuelve a entrar en el plugin: sin guarda, recursión infinita.
    var dentro = false;
    function ajustar(nodos) {
      if (dentro) return;
      dentro = true;
      for (var i = 0; i < nodos.length; i++) {
        var cfg = cfgDe(nodos[i]);
        if (!cfg) continue;
        // Si el widget aún no existe la llamada lanza: no pasa nada, el vigía
        // lo reintenta en la siguiente vuelta.
        try {
          orig.call($(nodos[i]), cfg);
          window.__ivwCombos.ajustes++;
        } catch (e) {}
      }
      dentro = false;
    }

    // 1) Parche del plugin: CalendarioAnual.js recrea los combos en cada
    //    búsqueda con `autoDropDownHeight: true`, así que toda creación se
    //    completa con nuestras opciones.
    if (!$.fn.jqxDropDownList.__ivw) {
      var parche = function () {
        var r = orig.apply(this, arguments);
        // Con string son getters o acciones ('val', 'open'…): no tocan opciones.
        if (typeof arguments[0] !== "string") ajustar(this);
        return r;
      };
      parche.__ivw = orig;
      for (var k in orig) {
        if (Object.prototype.hasOwnProperty.call(orig, k)) parche[k] = orig[k];
      }
      $.fn.jqxDropDownList = parche;
    }

    /* "Categoría" es un <select> nativo entre dos jqxDropDownList: su lista la
       dibuja el navegador y no hay CSS que la iguale a las otras. Se le pone
       delante un jqxDropDownList y el <select> original se queda oculto —
       CalendarioAnual.js lee su `.val()` al buscar, así que cada selección se
       le copia y se le dispara `change`. Las opciones llegan por AJAX y el
       sitio las repuebla con empty()+append(): un observador las recoge. */
    var CAJA = "ivw-cboAreas";
    function opciones(sel) {
      var out = [];
      for (var i = 0; i < sel.options.length; i++) {
        out.push({ label: sel.options[i].text, value: sel.options[i].value });
      }
      return out;
    }
    function firma(sel) {
      var o = opciones(sel), t = [];
      for (var i = 0; i < o.length; i++) t.push(o[i].value + "\u0001" + o[i].label);
      return t.join("\u0002");
    }

    function categoria($) {
      var sel = document.getElementById("cboAreasElegibles");
      if (!sel) return;
      var caja = document.getElementById(CAJA);

      // Wrap apagado: se devuelve el <select> del sitio tal cual estaba.
      if (!activo()) {
        if (caja) {
          try { orig.call($(caja), "destroy"); } catch (e) {}
          if (caja.parentNode) caja.parentNode.removeChild(caja);
          sel.style.display = "";
        }
        return;
      }

      if (!sel.options.length) return; // aún sin cargar por AJAX

      if (!caja) {
        caja = document.createElement("div");
        caja.id = CAJA;
        sel.parentNode.insertBefore(caja, sel.nextSibling);
        sel.style.display = "none";
      } else if (caja.getAttribute("data-ivw-firma") === firma(sel)) {
        return; // ya montado y con las mismas opciones
      }

      var lista = opciones(sel);
      try {
        orig.call($(caja), {
          source: lista,
          displayMember: "label",
          valueMember: "value",
          width: 190,
          // Igual que los otros dos: el sitio los crea a 25px y el CSS del
          // wrap los estira a 38 centrando el texto. Creándolo ya a 38, jqx
          // calcula el interior de otra forma y la etiqueta cae más abajo que
          // la de sus vecinos.
          height: 25,
          theme: "bootstrap",
          autoDropDownHeight: lista.length <= TOPE,
          dropDownHeight: ALTO,
          enableBrowserBoundsDetection: true,
          selectedIndex: sel.selectedIndex < 0 ? 0 : sel.selectedIndex
        });
      } catch (e) {
        return;
      }
      caja.setAttribute("data-ivw-firma", firma(sel));

      $(caja).off("change.ivw").on("change.ivw", function (e) {
        var item = e.args && e.args.item;
        if (!item) return;
        sel.value = item.value;
        $(sel).trigger("change");
      });

      // El sitio repuebla el <select> tras cada AJAX: hay que rehacer la lista.
      if (!sel.__ivwObs && window.MutationObserver) {
        sel.__ivwObs = new MutationObserver(function () { categoria($); });
        sel.__ivwObs.observe(sel, { childList: true });
      }
    }

    // 2) Vigía: por si el combo nace por un camino que no pasa por el plugin,
    //    antes de que llegara el parche, o si las opciones llegan por AJAX
    //    después. Compara opciones del widget, no mide el DOM: así no reajusta
    //    en cada vuelta. Se apaga a los cinco minutos.
    var vueltas = 0;
    var vigia = setInterval(function () {
      if (++vueltas > 300) clearInterval(vigia);
      var combos = document.querySelectorAll(SEL);
      for (var i = 0; i < combos.length; i++) {
        var quiero = cfgDe(combos[i]);
        if (!quiero) continue;
        var desajuste =
          opcion(combos[i], "autoDropDownHeight") !== quiero.autoDropDownHeight ||
          (quiero.autoDropDownHeight === false &&
            opcion(combos[i], "dropDownHeight") !== quiero.dropDownHeight);
        if (desajuste) { ajustar(combos); return; }
      }
      categoria($);
    }, 1000);

    ajustar(document.querySelectorAll(SEL));
    categoria($);
    window.__ivwCombos.estado = "parcheado";
    console.log("[ivw] combos del calendario anual: parche activo");
  }
})();
