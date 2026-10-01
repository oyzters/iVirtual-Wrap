/* Popup compartido por CIA Wrap e iVirtual Wrap: el resto del archivo es
   idéntico en las dos extensiones; solo cambia este bloque. */
var CONFIG = {
  name: 'iVirtual Wrap',
  sub: 'Interfaz moderna para iVirtual',
  icon: '../icons/icon-128.png',
  portalLabel: 'Abrir iVirtual',
  portalUrl: 'https://ivirtual.itson.edu.mx/',
  site: 'https://ivirtual.potronet.com',
  code: 'https://github.com/oyzters/iVirtual-Wrap',
  enabledKey: 'wrapEnabled',
  themeKey: 'themeMode'
};

var api = (typeof browser !== 'undefined') ? browser : chrome;
var SEEN_KEY = 'wrap_news_seen';
var version = api.runtime.getManifest().version;

var sw = document.getElementById('sw');
var st = document.getElementById('st');
var segBtns = document.querySelectorAll('.seg button[data-theme]');
var mqDark = window.matchMedia('(prefers-color-scheme: dark)');

document.getElementById('icon').src = CONFIG.icon;
document.getElementById('name').textContent = CONFIG.name;
document.getElementById('sub').textContent = CONFIG.sub;
document.getElementById('site').href = CONFIG.site;
document.getElementById('code').href = CONFIG.code;
document.getElementById('ver').textContent = 'v' + version;
document.getElementById('open').innerHTML = CONFIG.portalLabel +
  ' <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg>';

function paintEnabled(v){
  sw.setAttribute('aria-checked', v ? 'true' : 'false');
  st.textContent = v ? 'Activada' : 'Desactivada';
  document.body.classList.toggle('on', !!v);
}
// el popup se pinta con el tema elegido; en 'auto', con el del sistema
function paintTheme(v){
  var dark = v === 'dark' || (v === 'auto' && mqDark.matches);
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  segBtns.forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-theme') === v); });
}

var defaults = {}; defaults[CONFIG.enabledKey] = true; defaults[CONFIG.themeKey] = 'auto'; defaults[SEEN_KEY] = '';
api.storage.local.get(defaults, function(r){
  paintEnabled(r[CONFIG.enabledKey]);
  paintTheme(r[CONFIG.themeKey]);
  renderNews(r[SEEN_KEY]);
});

function toggleEnabled(){
  var v = sw.getAttribute('aria-checked') !== 'true', o = {};
  o[CONFIG.enabledKey] = v; api.storage.local.set(o);
  paintEnabled(v);
}
sw.addEventListener('click', toggleEnabled);
sw.addEventListener('keydown', function(e){ if(e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); toggleEnabled(); } });

segBtns.forEach(function(b){
  b.addEventListener('click', function(){
    var v = b.getAttribute('data-theme'), o = {};
    o[CONFIG.themeKey] = v; api.storage.local.set(o);
    paintTheme(v);
  });
});

document.getElementById('open').addEventListener('click', function(){
  api.tabs.create({ url: CONFIG.portalUrl });
  window.close();
});

/* Novedades: las de la versión instalada (changelog.js). Tras una
   actualización, background.js pone "NEW" en el ícono; al abrir el popup se
   marcan como vistas y se quita. */
function renderNews(seen){
  var log = (typeof WRAP_CHANGELOG !== 'undefined' && WRAP_CHANGELOG) || [];
  var entry = log.filter(function(e){ return e.version === version; })[0] || log[0];
  var box = document.getElementById('news');
  if(!entry){ box.hidden = true; return; }
  document.getElementById('newsVer').textContent = 'v' + entry.version;
  var ul = document.getElementById('newsList');
  entry.items.forEach(function(t){ var li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
  if(seen !== version){
    box.classList.add('unseen'); box.open = true;
    var o = {}; o[SEEN_KEY] = version; api.storage.local.set(o);
  }
  try{ api.action.setBadgeText({ text: '' }); }catch(e){}
}
