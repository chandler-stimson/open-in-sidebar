if (window.top !== window) {
  const origin = chrome.runtime.getURL('');

  top.postMessage({
    method: 'navigate',
    href: location.href
  }, origin);
  addEventListener('hashchange', () => top.postMessage({
    method: 'navigate',
    href: location.href
  }, origin));
}
