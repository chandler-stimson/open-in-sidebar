document.body.addEventListener('dragover', e => {
  e.preventDefault();
});
document.body.addEventListener('drop', e => {
  e.preventDefault();

  const href = e.dataTransfer.getData('text/uri-list');
  const query = e.dataTransfer.getData('text/plain') || href;

  try {
    const o = new URL(href);
    if (o.hostname) {
      return top.navigate(undefined, {href});
    }
  }
  catch (e) {}
  if (query) {
    chrome.storage.local.get({
      'search-engine': 'https://www.google.com/search?q=%s'
    }, prefs => {
      const href = prefs['search-engine'].replace('%s', encodeURIComponent(query));
      top.navigate(undefined, {href});
    });
  }
});
