addEventListener('message', e => {
  if (e.data?.method === 'navigate') {
    document.getElementById('address').value = e.data.href;
  }
});
const reset = () => {
  document.body.classList.add('loading');
  document.querySelector('iframe').src = '';
  chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: [1]
  });
};

const open = href => {
  const {hostname} = new URL(href);

  document.getElementById('address').value = href;

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
  }).then(() => {
    document.body.classList.remove('loading');
    document.querySelector('iframe').src = href;
  });
};

const proceed = href => {
  if (href) {
    try {
      new URL(href);
      open(href);
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
document.body.addEventListener('dragover', event => {
  event.preventDefault();
});
document.body.addEventListener('drop', event => {
  event.preventDefault();

  const href = event.dataTransfer.getData('text/uri-list');
  proceed(href);
});
document.getElementById('reset').onclick = () => reset();

document.querySelector('.footer').onsubmit = e => {
  e.preventDefault();
  proceed(document.getElementById('address').value);
};

chrome.storage.local.get({
  history: true,
  visits: []
}, prefs => {
  console.log(prefs);
  if (prefs.history) {
    const href = prefs.visits.at(0);
    if (href) {
      open(href);
    }
  }
});

addEventListener('unload', () => chrome.runtime.sendMessage({
  method: 'closed'
}));
addEventListener('beforeunload', () => chrome.runtime.sendMessage({
  method: 'closed'
}));
console.log(112);
