/* global navigation */

if (window.top !== window && window.parent === window.top) {
  const port = document.getElementById('gfr-uyJjfsas');
  if (port) {
    port.remove();
  }

  const origin = chrome.runtime.getURL('');

  top.postMessage({
    method: 'navigate',
    href: location.href
  }, origin);
  addEventListener('hashchange', () => top.postMessage({
    method: 'navigate',
    href: location.href
  }, origin));
  addEventListener('message', e => {
    if (port && e.data?.method === 'navigate-verified' && e.origin.includes(chrome.runtime.id)) {
      // try to allow navigation to the new destination
      navigation.addEventListener('navigate', e => {
        const href = e.destination.url;
        top.postMessage({
          method: 'open',
          href
        }, origin);
      });

      // run user script
      chrome.storage.local.get({
        'user-script': ''
      }, prefs => {
        if (prefs['user-script']) {
          port.dispatchEvent(new CustomEvent('run', {
            detail: prefs
          }));
        }
      });
    }
  });
}
