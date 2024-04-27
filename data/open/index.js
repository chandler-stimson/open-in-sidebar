/* global navigate, tabs, tld */

document.querySelector('.footer').onsubmit = e => {
  e.preventDefault();
  let href = document.getElementById('address').value;
  try {
    new URL(href);
    navigate(undefined, {href});
  }
  catch (e) {
    // is this a domain
    const domain = tld.getDomain(href);
    if (domain) {
      return top.navigate(undefined, {
        href: 'https://' + href
      });
    }
    else {
      chrome.storage.local.get({
        'search-engine': 'https://www.google.com/search?q=%s'
      }, prefs => {
        if (prefs['search-engine']) {
          const n = prefs['search-engine'].replace('%s', encodeURIComponent(href));
          navigate(undefined, {
            href: n
          });
        }
        else {
          if (href.toLowerCase().startsWith('http') === false) {
            href = 'https://' + href;
          }
          navigate(undefined, {href});
        }
      });
    }
  }
};

// context-menu request
chrome.runtime.sendMessage({
  method: 'get-href'
}, href => href && navigate(undefined, {href}));

chrome.runtime.onMessage.addListener((request, sender, response) => {
  if (request.method === 'send-href') {
    navigate(undefined, {
      href: request.href
    });
    response(true);
  }
});

addEventListener('load', () => chrome.storage.local.get({
  'visits': [],
  'start-page': '',
  'open-last-visited': true
}, prefs => {
  if (prefs['start-page']) {
    prefs['start-page'].split(/\s*,\s*/).slice(0, 2).forEach((href, n) => navigate(n + 1, {
      href
    }));
  }
  else if (prefs['open-last-visited']) {
    const href = prefs.visits.at(0);
    if (href) {
      navigate(undefined, {href});
    }
  }
}));

addEventListener('unload', () => chrome.runtime.sendMessage({
  method: 'closed'
}));
addEventListener('beforeunload', () => chrome.runtime.sendMessage({
  method: 'closed'
}));

document.getElementById('forward').onclick = () => {
  const tabId = tabs.active;
  if (tabId !== -1) {
    tabs.prepare(tabId, 'forward').then(href => href && navigate(tabId, {
      href
    }));
  }
};
document.getElementById('back').onclick = () => {
  const tabId = tabs.active;
  if (tabId !== -1) {
    tabs.prepare(tabId, 'backward').then(href => href && navigate(tabId, {
      href
    }));
  }
};

document.getElementById('refresh').onclick = () => {
  const tabId = tabs.active;
  if (tabId !== -1) {
    const method = tabs.get(tabId).state === 'ready' ? 'navigate-reload' : 'navigate-stop';
    tabs.sendMessage(tabId, {method});
  }
};

document.getElementById('reset').onclick = () => {
  for (let n = 1; n < 5; n += 1) {
    navigate.terminate(n);
    tabs.remove(n);
  }

  // change state
  tabs.update(1, {
    state: 'homepage'
  });
};

document.getElementById('split').onclick = () => {
  const splitted = document.querySelectorAll('iframe[src]').length > 1;

  if (splitted) {
    navigate.terminate(2);
    tabs.remove(2);
  }
  else {
    // since we are opening a local page, there is no need to use navigate()
    tabs.update(2, {
      href: chrome.runtime.getURL('/data/open/blank/index.html'),
      active: true
    });
  }
};
