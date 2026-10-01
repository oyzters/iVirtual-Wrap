/* Service worker mínimo: solo avisa de actualizaciones.
   Chrome actualiza la extensión en silencio; para que la gente se entere,
   al actualizarse se pone "NEW" en el ícono y el popup muestra las novedades
   de la versión (changelog.js). Se quita al abrir el popup. Compartido por
   CIA Wrap e iVirtual Wrap. */
var api = (typeof browser !== 'undefined') ? browser : chrome;

api.runtime.onInstalled.addListener(function(details){
  if(details.reason !== 'update') return;
  if(details.previousVersion === api.runtime.getManifest().version) return;   // recarga en desarrollo
  api.action.setBadgeBackgroundColor({ color: '#0b5cad' });
  api.action.setBadgeText({ text: 'NEW' });
});
