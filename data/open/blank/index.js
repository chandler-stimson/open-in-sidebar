const origin = chrome.runtime.getURL('');

addEventListener('focus', () => top.postMessage({
  method: 'focus'
}, origin));
top.postMessage({
  method: 'focus'
}, origin);
