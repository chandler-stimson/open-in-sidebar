addEventListener('message', e => {
  if (e.data?.method === 'navigate') {
    document.getElementById('address').value = e.data.href;

    if (e.source) {
      e.source.postMessage({
        method: 'navigate-verified'
      }, '*');
    }
  }
  else if (e.data?.method === 'open') {
    proceed(e.data.href, false);
  }
});

const open = (href, forced = false) => {
  const {hostname} = new URL(href);

  const next = () => {
    document.body.classList.remove('loading');

    if (forced === true || document.querySelector('iframe').src !== href) {
      document.querySelector('iframe').src = href;
    }
    else {
      console.info('skipped', href);
    }
  };

  if (open.cache !== hostname) {
    open.cache = hostname;
    chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: [1],
      addRules: [{
        'id': 1,
        'action': {
          'type': 'modifyHeaders',
          'responseHeaders': [
            {'header': 'X-Frame-Options', 'operation': 'remove'}
          ]
        },
        'condition': {
          'tabIds': [-1],
          'urlFilter': '||' + hostname
        }
      }]
    }).then(next);
  }
  else {
    next();
  }
};

const proceed = (href, forced = false) => {
  if (forced) {
    document.body.classList.add('loading');
    document.querySelector('iframe').src = '';
  }
  if (href) {
    try {
      new URL(href);
      setTimeout(() => open(href, forced), 300);
      chrome.storage.local.get({
        visits: [],
        history: true,
        size: 5
      }, prefs => {
        chrome.storage.local.set({
          history: prefs.history ? [href, ...prefs.visits].slice(0, prefs.size) : []
        });
      });
    }
    catch (e) {
      alert(e.message);
    }
  }
};

/* drag and drop */
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
      return proceed(href, true);
    }
  }
  catch (e) {}
  if (query) {
    chrome.storage.local.get({
      'search-engine': 'https://www.google.com/search?q=%s'
    }, prefs => {
      const href = prefs['search-engine'].replace('%s', encodeURIComponent(query));
      proceed(href, true);
    });
  }
});
document.getElementById('reset').onclick = () => {
  document.body.classList.add('loading');
  document.querySelector('iframe').src = '';
  document.getElementById('address').value = '';
  open.cache = '';
  chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: [1]
  });
};


document.querySelector('.footer').onsubmit = e => {
  e.preventDefault();
  let href = document.getElementById('address').value;
  try {
    new URL(href);
    proceed(href, true);
  }
  catch (e) {
    chrome.storage.local.get({
      'search-engine': 'https://www.google.com/search?q=%s'
    }, prefs => {
      if (prefs['search-engine']) {
        const n = prefs['search-engine'].replace('%s', encodeURIComponent(href));
        proceed(n, true);
      }
      else {
        if (href.toLowerCase().startsWith('http') === false) {
          href = 'https://' + href;
        }
        proceed(href, true);
      }
    });
  }
};

// context-menu request
chrome.runtime.sendMessage({
  method: 'get-href'
}, href => href && proceed(href, true));

chrome.runtime.onMessage.addListener((request, sender, response) => {
  if (request.method === 'send-href') {
    proceed(request.href, true);
    response(true);
  }
});

addEventListener('load', () => chrome.storage.local.get({
  'history': true,
  'visits': [],
  'start-page': ''
}, prefs => {
  if (prefs['start-page']) {
    open(prefs['start-page']);
  }
  else if (prefs.history) {
    const href = prefs.visits.at(0);
    if (href) {
      open(href);
    }
  }
}));

addEventListener('unload', () => chrome.runtime.sendMessage({
  method: 'closed'
}));
addEventListener('beforeunload', () => chrome.runtime.sendMessage({
  method: 'closed'
}));
