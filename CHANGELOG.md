# Changelog

Versiones de iVirtual Wrap en la Chrome Web Store. Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).
Cada versión aquí debe tener su gemela, en lenguaje de usuario, en `extension/src/changelog.js` —
es lo que el menú de la extensión muestra como **Novedades**. El Release de GitHub
toma las notas de esta sección (ver `.github/workflows/release.yml`).

## [1.0.0] - 2026-10-01

Primera versión publicada en la Chrome Web Store.

### Añadido
- Menú de la extensión con el mismo diseño que CIA Wrap: encender o apagar, tema (claro, oscuro o automático), abrir iVirtual y novedades de la versión.
- Aviso "NEW" en el ícono al actualizarse.

### Cambiado
- Tema automático por defecto (sigue al sistema); antes era claro.
- El sitio de la extensión pasa a ivirtual.potronet.com.

### Quitado
- El botón flotante "iVirtual Wrap: ON/OFF" de la extensión: el encendido vive en el menú. El userscript y el bookmarklet lo conservan, porque no tienen menú.
