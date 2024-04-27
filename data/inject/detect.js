/* global navigation */

if (window.top !== window && window.parent === window.top) {
  chrome.runtime.sendMessage({
    method: 'is-popup'
  }, result => { // true or tabId
    const port = document.getElementById('gfr-uyJjfsas');
    if (port) {
      port.remove();
    }

    if (result.permit) {
      const origin = chrome.runtime.getURL('');

      const navigating = e => {
        const href = e.destination.url;

        if (e.canIntercept === false) {
          navigation.removeEventListener('navigate', navigating);
          removeEventListener('message', messaging);
        }

        top.postMessage({
          method: 'open',
          href,
          type: e.navigationType,
          changing: e.hashChange,
          hostname: href.startsWith(location.origin) ? location.hostname : (new URL(href)).hostname,
          meta: {
            canIntercept: e.canIntercept,
            href: location.href
          }
        }, origin);
      };

      const messaging = e => {
        if (port && e.data?.method === 'navigate-verified' && e.origin.includes(chrome.runtime.id)) {
          // try to allow navigation to the new destination
          navigation.addEventListener('navigate', navigating);

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
        else if (port && e.data?.method === 'navigate-stop') {
          window.stop();
        }
        else if (port && e.data?.method === 'navigate-reload') {
          location.reload();
        }
        else if (port && e.data?.method === 'detach') {
          navigation.removeEventListener('navigate', navigating);
          removeEventListener('message', messaging);
        }
      };
      addEventListener('message', messaging);
      addEventListener('focus', () => top.postMessage({
        method: 'focus'
      }, origin));
      top.postMessage({
        method: 'navigate',
        href: location.href,
        hostname: location.hostname
      }, origin);
      if (document.readyState === 'complete') {
        top.postMessage({
          method: 'loaded'
        }, origin);
      }
      else {
        addEventListener('load', () => top.postMessage({
          method: 'loaded'
        }, origin));
      }
    }
  });
}
