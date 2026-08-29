// Helper de storage que funciona en Chrome (promesa o callback) y Firefox (callback).
// Evita el fallo silencioso de chrome.storage.local.get(...).then() en navegadores
// donde chrome.* no devuelve promesa.
(function (global) {
  function get(defaults) {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get(defaults, (res) => resolve(res || defaults));
      } catch (e) {
        resolve(defaults);
      }
    });
  }
  function set(obj) {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.set(obj, () => resolve());
      } catch (e) {
        resolve();
      }
    });
  }
  global.ivwStorage = { get, set };
})(typeof window !== "undefined" ? window : globalThis);
