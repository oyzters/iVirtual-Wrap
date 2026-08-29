// Popup autónomo: no depende de scripts externos. Listener registrado ANTES de
// cualquier lectura async, para que el toggle siempre tenga función.
(function () {
  const KEY = "wrapEnabled";
  const toggle = document.getElementById("toggle");
  const label = document.getElementById("stateLabel");

  function render(enabled) {
    toggle.checked = enabled;
    label.textContent = enabled ? "ON" : "OFF";
  }

  function storageGet(defaults, cb) {
    try {
      chrome.storage.local.get(defaults, (res) => cb(res || defaults));
    } catch (e) {
      cb(defaults);
    }
  }
  function storageSet(obj) {
    try {
      chrome.storage.local.set(obj);
    } catch (e) {}
  }

  function notifyTab(enabled) {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs && tabs[0];
        if (tab && tab.id != null) {
          chrome.tabs.sendMessage(tab.id, { type: "ivw-toggle", enabled }, () => {
            void chrome.runtime.lastError; // ignora "no receiver"
          });
        }
      });
    } catch (e) {}
  }

  // 1) Listener PRIMERO (garantiza que el click siempre responde)
  toggle.addEventListener("change", () => {
    const enabled = toggle.checked;
    render(enabled);
    storageSet({ [KEY]: enabled });
    notifyTab(enabled);
  });

  // 2) Estado inicial (default ON)
  storageGet({ [KEY]: true }, (cfg) => render(cfg[KEY]));
})();
