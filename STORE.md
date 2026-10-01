# Publicar en la Chrome Web Store

Todo lo que pide el [Developer Dashboard](https://chrome.google.com/webstore/devconsole),
listo para copiar. El `.zip` se arma con `python tools/package.py` (sale en `dist/`).

## Antes del primer envío

- [ ] Cuenta de desarrollador **de Oyzters** (no personal: transferir una extensión después es difícil).
      Pago único de registro y correo verificado.
- [ ] La landing publicada en **https://ivirtual.potronet.com**, con **https://ivirtual.potronet.com/privacidad** en línea — la tienda pide
      la URL de la política de privacidad y el revisor la abre.
- [ ] `python tools/package.py` sin errores → `dist/ivirtual-wrap-<versión>.zip`.
- [ ] Imágenes de `store/` (capturas y mosaico promocional).

## Ficha (pestaña *Store listing*)

| Campo | Valor |
|---|---|
| Nombre | iVirtual Wrap (sale del manifest) |
| Resumen | Interfaz moderna para iVirtual (Moodle) y los portales del ITSON: diseño limpio y modo oscuro. No oficial. |
| Categoría | Educación |
| Idioma | Español (Latinoamérica) |
| Sitio web | https://ivirtual.potronet.com |
| Correo de soporte | mdjesuscv@gmail.com |
| Ícono | `extension/icons/icon-128.png` (128×128) |
| Capturas | `store/captura-*.png` (1280×800) |
| Mosaico promocional pequeño | `store/promo-440x280.png` |

**Descripción**

```
Una interfaz moderna para iVirtual, el Moodle del ITSON. Proyecto independiente de estudiantes — no oficial.

El mismo iVirtual, con otra cara:
• Login, barra superior, tablero y cursos rediseñados, con modo claro, oscuro o automático.
• Una sola barra superior con inicio, tablero, cursos, eventos y búsqueda.
• Tablero y cursos en tarjetas; línea de tiempo legible.
• También el Portal de Sistemas, eRes, la Mesa de Ayuda y el Calendario Escolar, con el mismo diseño.

Privado por diseño:
• Corre en tu navegador, sobre la sesión que ya iniciaste.
• No inicia sesión por ti ni lee o guarda contraseñas.
• No envía datos a ningún lado. No hay servidor intermedio.

Desde el ícono de la extensión la enciendes o apagas, eliges el tema y abres iVirtual.

Código abierto (MIT): github.com/oyzters/iVirtual-Wrap
Sitio: ivirtual.potronet.com

iVirtual Wrap no está afiliado ni respaldado por el Instituto Tecnológico de Sonora (ITSON). "ITSON", "iVirtual" y Moodle pertenecen a sus respectivos titulares.
```

## Prácticas de privacidad (pestaña *Privacy*)

**Propósito único**

```
Rediseñar la interfaz de iVirtual (el Moodle del ITSON) y de los portales del ITSON que se usan junto con él (Portal de Sistemas, eRes, Mesa de Ayuda, Calendario Escolar), sobre la sesión del propio estudiante, sin cambiar la lógica ni los datos de esos sistemas.
```

**Justificación de permisos**

| Permiso | Justificación |
|---|---|
| `storage` | Recordar si la interfaz está encendida y el tema elegido (claro, oscuro o automático). Se guarda solo en el navegador. |
| `ivirtual.itson.edu.mx` | Es iVirtual (Moodle), el sitio principal que la extensión reestiliza. |
| `apps9.itson.edu.mx/PortalSistemas*`, `/eres*`, `/MesaAyudaITSON/*` | Portal de Sistemas (desde donde se entra a iVirtual), eRes y la Mesa de Ayuda: se reestilizan con el mismo diseño. Solo esas rutas. |
| `apps11.itson.edu.mx/CalendarioEscolar/*` | Calendario Escolar, que el Portal de Sistemas embebe; se reestiliza para que se vea igual que el resto. |

**¿Usa código remoto?** No. Todo el JavaScript va dentro del paquete. Lo único externo
son las tipografías de Google Fonts (CSS y fuentes, no código).

**Uso de datos:** no se marca ninguna categoría — la extensión no recopila ni transmite
datos del usuario. Se certifican las tres declaraciones (no se venden datos a terceros,
no se usan para fines ajenos al propósito único, no se usan para crédito o préstamos).

**Política de privacidad:** https://ivirtual.potronet.com/privacidad

## Notas para el revisor

```
iVirtual Wrap es una capa visual sobre iVirtual, el Moodle del ITSON (ivirtual.itson.edu.mx), y algunos portales del ITSON en apps9 y apps11. Para verla funcionando hace falta una
cuenta institucional del ITSON, que no podemos compartir. La extensión solo reestiliza
las páginas que el usuario ya tiene abiertas con su propia sesión: no inicia sesión,
no lee ni guarda contraseñas, no hace peticiones de red propias y no envía datos.
Las capturas de la ficha muestran el portal con la extensión activa. Es un proyecto
independiente de estudiantes, sin afiliación oficial con el ITSON (así lo dice la ficha).
```

## Distribución

Pública, en todas las regiones. Publicación: **manual después de la aprobación** si
quieren coordinarla con un anuncio; si no, automática.

## Publicar una actualización

1. Subir `version` en `extension/manifest.json` (tiene que ser mayor que la publicada).
2. Agregar la versión a `CHANGELOG.md` y, en lenguaje de usuario, a `extension/src/changelog.js`.
3. `git tag v<versión> && git push origin v<versión>` → la Action arma el zip y crea el
   Release. Sin la Action: `python tools/package.py`, subir el zip en el dashboard
   (*Package* → *Upload new package*) y enviar a revisión.
4. Toda actualización pasa por revisión (normalmente horas o pocos días; más si cambian
   permisos o sitios). Al aprobarse, Chrome la instala sola a los usuarios y el ícono
   muestra **NEW** con las novedades.

## Publicar desde GitHub (opcional)

La Action `.github/workflows/release.yml` también sube el zip a la tienda si el repo
tiene estos secretos (*Settings → Secrets and variables → Actions*):

| Secreto | De dónde sale |
|---|---|
| `CWS_EXTENSION_ID` | El ID de la extensión en el dashboard (tras el primer envío manual). |
| `CWS_CLIENT_ID`, `CWS_CLIENT_SECRET` | Un cliente OAuth en Google Cloud con la *Chrome Web Store API* habilitada. |
| `CWS_REFRESH_TOKEN` | Generado una vez con ese cliente. |

La guía para obtenerlos: [chrome-webstore-upload-keys](https://github.com/fregante/chrome-webstore-upload-keys).
El primer envío siempre es manual (ahí se crea el ID y se llena la ficha).

## Nombre y marca

La tienda revisa nombres que parecen suplantar a una institución. Por eso el nombre es
**iVirtual Wrap** (sin "ITSON") y la ficha, la landing y la política de privacidad dicen que es
un proyecto no oficial. No usar logotipos del ITSON en las imágenes de la ficha.
