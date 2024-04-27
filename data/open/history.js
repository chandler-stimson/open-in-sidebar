/* global navigate */

chrome.storage.local.get({
  'visits': [],
  'visible': 6,
  'display-last-visited': true
}, prefs => {
  if (prefs['display-last-visited'] !== true) {
    return;
  }
  for (const link of prefs.visits.slice(0, 6)) {
    const a = new Image();
    a.src = `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(link)}&size=32`;
    a.title = link;
    document.getElementById('history').append(a);
  }
});

document.getElementById('history').onclick = e => {
  if (e.target.tagName === 'IMG') {
    const args = new URLSearchParams(e.target.src.split('?')[1]);
    const href = args.get('pageUrl');
    navigate(undefined, {
      href
    });
  }
};

// store successful visits
addEventListener('message', e => {
  if (e.data?.method === 'navigate') {
    const {href} = e.data;

    chrome.storage.local.get({
      visits: [],
      size: 20,
      record: true
    }, prefs => {
      if (prefs.record) {
        const visits = [href, ...prefs.visits]
          .filter((s, i, l) => s && l.indexOf(s) === i)
          .slice(0, prefs.size);

        chrome.storage.local.set({
          visits
        });
      }
      else if (prefs.visits.length) {
        chrome.storage.local.set({
          visits: []
        });
      }
    });
  }
});
