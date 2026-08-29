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
- **Inicio / frontpage**: slider enmarcado, cursos como tarjetas, bloques
  ordenados.
- **Tablero** (`/my/index.php`): línea de tiempo en filas legibles, filtros
  como chips, acciones claras.
- **Recuperar contraseña** (`apps9.itson.edu.mx/PortalSistemas/CambioPass/…`):
  tarjeta, encabezado con logo, campos y sección de contacto rediseñados.

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

> El bookmarklet lleva **todo el reskin embebido** (~52 KB), así que el
> marcador es grande. Si tu navegador no lo acepta, usa el userscript o la
> extensión.

## Build (userscript + bookmarklet)

El userscript y el bookmarklet se **generan** desde una sola fuente (el CSS de
`extension/src` + `build/core.js`), para no duplicar estilos:

```
node build/build.js
```

Regenera `userscript/ivirtual-wrap.user.js`, `bookmarklet/bookmarklet.js` y
`bookmarklet/ivirtual-wrap-installer.html`. Corre esto tras editar cualquier
CSS o `build/core.js`.

## El flag ON/OFF

El estado vive en `chrome.storage.local` (`wrapEnabled`, por defecto ON). Todo
el reskin está bajo el atributo `data-ivw="on"` en `<html>`: apagarlo revierte
la vista sin recargar. El botón flotante y el popup escriben ese flag.

## Estructura

```
extension/
  manifest.json          # MV3: content scripts + popup, permiso storage
  src/
    content.js           # aplica/quita el wrap, reestructura header, fixes DOM
    storage.js           # helper storage (Chrome/Firefox)
    popup.html / popup.js# UI del toggle
    base.css             # design system (tokens, fuentes, componentes)
    pages/
      login.css          # #page-login-index
      frontpage.css      # #page-site-index
      dashboard.css      # #page-my-index
      chrome.css         # header/topbar compartido (cargar al final)
      recuperapassword.css  # apps9 CambioPass
index.html               # landing
```

## Notas

- El cert SSL del sitio es válido; lo que se percibe como "sin SSL" suele ser
  contenido mixto (http). El wrap fuerza https en recursos propios.
- Solo actúa en `ivirtual.itson.edu.mx` y en la página de recuperación de
  `apps9.itson.edu.mx`; no toca ninguna otra página.

## Licencia

MIT. Un producto de [Oyzters](https://github.com/oyzters).
