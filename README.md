# iVirtual Wrap

Capa visual (reskin) para el portal **iVirtual (Moodle)** de ITSON
(`ivirtual.itson.edu.mx`). Le pone una interfaz limpia y moderna — tipografía
Inter, tarjetas, inputs y botones cuidados, barra superior unificada — **sobre
tu propia sesión**, ya iniciada con tu cuenta.

> **Importante — qué NO es esto:** no es un login alterno ni un proxy. Cada
> persona se conecta directo a ITSON con su cuenta; esto solo re-estiliza la
> página que ya tienes abierta, en tu navegador. **No maneja contraseñas, no
> hace peticiones de red a terceros, no cambia nada en el servidor de ITSON.**

## Qué rediseña

- **Login** (`/login/index.php`): tarjeta centrada sobre fondo azul, campos y
  botón grandes, enlaces de idioma y recuperación ordenados.
- **Barra superior**: quita el banner pesado; deja las tabs (Inicio, Tablero,
  Cursos, Eventos), la búsqueda y el menú de usuario en una sola barra limpia.
- **Inicio / frontpage**: slider enmarcado y sin franja blanca, cursos como
  tarjetas, bloques ordenados. Para quien **no** ha iniciado sesión, donde el
  Moodle deja la página vacía se arma un bloque de bienvenida con el botón de
  Ingresar y accesos rápidos (recuperar contraseña, mesa de ayuda, calendario…)
  tomados del propio bloque de soporte del sitio.
- **Barra + pie**: marca iVirtual a la izquierda, barra pegada arriba al
  hacer scroll, footer oscuro anclado al fondo de la ventana.
- **Tablero** (`/my/index.php`): línea de tiempo con hora, icono de actividad
  en círculo, el curso separado en un chip y la acción a la derecha; cursos
  recientes como tarjetas 16:9; filtros como chips. Sin el botón de zoom que
  el tema pone en cada bloque.
- **Mis cursos** (portada con sesión): rejilla de tarjetas con portada 16:9
  —generada con el código del curso si no hay imagen—, título a dos líneas,
  profesor capitalizado y botón "Curso" como pastilla.
- **Buscar cursos** (`/course/search.php`): los resultados dejan de ser una
  lista plana y pasan a rejilla de tarjetas — portada 16:9 (generada con el
  código del curso cuando no hay imagen), título a dos líneas, profesores en
  una sola línea sin repetir la etiqueta, categoría como chip y paginación
  en pastillas.
- **Catálogo de cursos** (`/course/index.php`): barra de acciones con el
  selector de categorías legible y buscador, categorías como filas-tarjeta en
  varias columnas con chevron que gira al expandir, y los cursos de una
  categoría con el mismo formato de tarjeta que el buscador.
- **Recuperar contraseña** (`apps9.itson.edu.mx/PortalSistemas/CambioPass/…`):
  tarjeta, encabezado con logo, campos y sección de contacto rediseñados.
- **Curso: índice, sección y actividad** (`/course/section.php`,
  `/mod/*/view.php`): el índice lateral pasa a menú con secciones, punto de
  finalización por actividad y la actividad abierta en azul sólido; la lista
  de la sección se convierte en tarjetas con el icono coloreado por tipo de
  módulo (los rótulos siguen siendo texto corrido); y la página de actividad
  muestra las fechas como fichas, el enunciado en tarjeta de lectura —con las
  tablas pegadas desde Word normalizadas—, los adjuntos como ficha de archivo
  y el estado de la entrega como rejilla de fichas con el estado en color, en
  vez de una tabla de bordes grises. Si lo entregado es un PDF, se incrusta
  debajo una vista previa: el archivo se pide con `fetch` a la misma sesión y
  se muestra como blob, porque Moodle lo sirve con `Content-Disposition:
  attachment` y un `<iframe>` a esa URL solo dispararía una descarga.
- **Foros** (`/mod/forum/…`): la barra de herramientas (ayuda, buscador,
  modo de vista y menú de la discusión) se agrupa en una sola barra —antes el
  botón "Configuraciones" en cian se montaba sobre la primera publicación— y
  cada mensaje pasa a tarjeta con avatar, autor y fecha, cuerpo en tipografía
  de lectura, acciones al pie con "Responder" como acción principal y las
  respuestas anidadas colgando de una guía. El mensaje que abre el hilo va
  marcado con acento azul.
- **Calendario escolar** (`apps11.itson.edu.mx/CalendarioEscolar/…`): la vista
  de mes pasa a ocupar la pantalla como una aplicación de calendario —barra
  lateral fija con los filtros y la agenda, toolbar con el mes en grande, días
  en celdas limpias, eventos como píldoras de color, periodos vacacionales con
  trama en vez de un bloque gris y leyenda de categorías en chips—, y la vista
  anual queda en tres columnas de tarjetas con el día de cada evento en ficha,
  el rango en dos chips (el sitio lo escupe como "Fecha de Inicio: …" en texto
  corrido), los eventos marcados como pasado / en curso / por venir y el mes
  actual destacado.
- **Portada del Portal de Sistemas** (`apps9.itson.edu.mx/PortalSistemas`): la
  pantalla pública desde donde se inicia sesión. Nav limpia con el acceso como
  botón, portada azul con título, entradilla y botones (antes solo un título
  gris sobre gris), banners y calendario escolar embebido en tarjeta —el
  `<iframe>` ya no tiene barra propia: el calendario publica su alto al
  contenedor y este lo aplica—, "Ligas de interés" deja el azul con texto gris
  ilegible y pasa a rejilla de tarjetas con icono, galería de fotos como
  tarjetas 4:3, pie azul y modal de acceso —el que
  se abre solo al cargar— rediseñado: panel del 70 aniversario en azul, campos
  de 46px con su icono y botón a todo el ancho. Los títulos que venían en
  versales (`LIGAS DE INTERÉS`, `GALERIA DE FOTOS`) se reescriben con
  ortografía y capitalización normales.
- **Portal de Sistemas** (`apps9.itson.edu.mx/PortalSistemas/PortalSistemas`):
  el banner a sangre se quita, la foto de perfil baja del banner a
  una barra pegajosa con marca, buscador y menú de perfil, y las 20 fichas
  grises flotadas pasan a dos rejillas con encabezado y contador —"Accesos
  rápidos" (favoritos) y "Todos los sistemas"— de tarjetas con icono, nombre,
  la descripción que antes solo vivía en el `title=` y la estrella arriba a la
  derecha. El buscador del sitio se conserva (se le suman contadores, atajo
  `/` para enfocar, `Esc` para limpiar y aviso de "ningún sistema coincide").
- **Formulario de denuncia** (`apps9.itson.edu.mx/eres`): denuncia de
  violencia, acoso u hostigamiento. Columna estrecha en vez de la tarjeta de
  1100px, título como encabezado real (era un `<label>` suelto) con la nota de
  que todos los campos son obligatorios —lo son, según las reglas del propio
  sitio—, etiquetas legibles sin el `float:left` inline, campos de 46px, las
  opciones de ocupación como fichas seleccionables, contador de caracteres en
  la descripción (el tope de 500 solo estaba en el placeholder), captcha en su
  caja con etiqueta, botón de ancho completo y el pie deja de ir en
  `position: fixed` tapando el final del formulario. Teclado numérico en edad
  y teléfono, y autocompletado en nombre y correo. No se cambia ningún texto
  del formulario ni sus validaciones.
- **Mesa de ayuda** (`apps9.itson.edu.mx/MesaAyudaITSON/…`): banner recortado a
  una franja, formulario en tarjeta centrada (el sitio lo dejaba en un
  `margin: 0 15%` inline), campos y captcha con la caja del wrap, el aviso del
  correo como texto de ayuda en vez de rojo de error, y los teléfonos de
  WhatsApp y las líneas telefónicas como dos fichas.

## Instalar (modo desarrollador)

**Chrome / Edge / Brave**
1. Ve a `chrome://extensions`.
2. Activa **Modo de desarrollador** (arriba a la derecha).
3. **Cargar descomprimida** → selecciona la carpeta `extension/`.
4. Entra a iVirtual. La interfaz se aplica sola; abajo a la derecha hay un
   botón **Wrap ON/OFF**, y también puedes prender/apagar desde el popup del
   ícono de la extensión.

**Firefox**
1. Ve a `about:debugging#/runtime/this-firefox`.
2. **Cargar complemento temporal** → elige `extension/manifest.json`.

## Otras formas de usarlo (gemelas de la extensión)

Mismo reskin, cambia cómo se activa:

| Forma | Instalación | Se activa |
|---|---|---|
| **Extensión** (`extension/`) | Cargar en el navegador | Sola, siempre |
| **Userscript** (`userscript/`) | Tampermonkey + pegar `ivirtual-wrap.user.js` | Sola |
| **Bookmarklet** (`bookmarklet/`) | Abrir `ivirtual-wrap-installer.html` y arrastrar el botón | Clic en cada visita |

> El bookmarklet lleva **todo el reskin embebido** (~75 KB), así que el
> marcador es grande. Si tu navegador no lo acepta, usa el userscript o la
> extensión.

## Build (userscript + bookmarklet)

El userscript y el bookmarklet se **generan** desde una sola fuente (el CSS de
`extension/src`, `extension/src/enhance.js` y `build/core.js`), para no
duplicar estilos ni lógica de DOM:

```
node build/build.js
```

Regenera `userscript/ivirtual-wrap.user.js`, `bookmarklet/bookmarklet.js` y
`bookmarklet/ivirtual-wrap-installer.html`. Corre esto tras editar cualquier
CSS, `enhance.js` o `build/core.js`.

## El flag ON/OFF

El estado vive en `chrome.storage.local` (`wrapEnabled`, por defecto ON). Todo
el reskin está bajo el atributo `data-ivw="on"` en `<html>`: apagarlo revierte
la vista sin recargar. El botón flotante y el popup escriben ese flag.

## Estructura

```
extension/
  manifest.json          # MV3: content scripts + popup, permiso storage
  src/
    content.js           # aplica/quita el wrap (flag, badge, storage)
    enhance.js           # reestructura de DOM: topbar, marca, portada de invitado
    storage.js           # helper storage (Chrome/Firefox)
    popup.html / popup.js# UI del toggle
    base.css             # design system (tokens, fuentes, componentes)
    pages/
      login.css          # #page-login-index
      frontpage.css      # #page-site-index
      dashboard.css      # #page-my-index
      coursesearch.css   # #page-course-search (resultados como tarjetas)
      chrome.css         # header/topbar compartido (cargar al final)
      recuperapassword.css  # apps9 CambioPass
      mesaayuda.css      # apps9 MesaAyudaITSON
      portalsistemas.css # apps9 PortalSistemas (rejilla de sistemas)
      portalinicio.css   # apps9 PortalSistemas (portada pública + login)
      eres.css           # apps9 /eres (formulario de denuncia)
      calendarioescolar.css # apps11 CalendarioEscolar (mes + anual + la
                            # vista Prototipo que embebe la portada de apps9)
index.html               # landing
```

## Notas

- El cert SSL del sitio es válido; lo que se percibe como "sin SSL" suele ser
  contenido mixto (http). El wrap fuerza https en recursos propios.
- Solo actúa en `ivirtual.itson.edu.mx`, en el Portal de Sistemas y la página
  de recuperación de `apps9.itson.edu.mx` y en el calendario de
  `apps11.itson.edu.mx`; no toca ninguna otra página.

## Licencia

MIT. Un producto de [Oyzters](https://github.com/oyzters).
