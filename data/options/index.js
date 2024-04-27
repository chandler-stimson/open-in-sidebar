chrome.storage.local.get({
  'user-script': '',
  'search-engine': 'https://www.google.com/search?q=%s',
  'start-page': '',
  'open-in-sidebar-context': true,
  'open-last-visited': true,
  'display-last-visited': true,
  'record': true
}, prefs => {
  document.getElementById('user-script').value = prefs['user-script'];
  document.getElementById('search-engine').value = prefs['search-engine'];
  document.getElementById('start-page').value = prefs['start-page'];
  document.getElementById('open-in-sidebar-context').checked = prefs['open-in-sidebar-context'];
  document.getElementById('open-last-visited').checked = prefs['open-last-visited'];
  document.getElementById('display-last-visited').checked = prefs['display-last-visited'];
  document.getElementById('record').checked = prefs['record'];
});

document.getElementById('save').onclick = () => chrome.storage.local.set({
  'user-script': document.getElementById('user-script').value,
  'search-engine': document.getElementById('search-engine').value,
  'start-page': document.getElementById('start-page').value,
  'open-in-sidebar-context': document.getElementById('open-in-sidebar-context').checked,
  'open-last-visited': document.getElementById('open-last-visited').checked,
  'display-last-visited': document.getElementById('display-last-visited').checked,
  'record': document.getElementById('record').checked
}, () => {
  const e = document.getElementById('toast');
  e.textContent = 'Options saved';
  setTimeout(() => e.textContent = '', 750);
});

// support
document.getElementById('support').onclick = () => chrome.tabs.create({
  url: chrome.runtime.getManifest().homepage_url + '?rd=donate'
});

// report
document.getElementById('report').onclick = () => chrome.tabs.create({
  url: chrome.runtime.getManifest().homepage_url + '#reviews'
});

// links
for (const a of [...document.querySelectorAll('[data-href]')]) {
  if (a.hasAttribute('href') === false) {
    a.href = chrome.runtime.getManifest().homepage_url + '#' + a.dataset.href;
  }
}

document.addEventListener('change', e => {
  if (['open-last-visited', 'display-last-visited'].includes(e.target.id)) {
    if (e.target.checked) {
      document.getElementById('record').checked = true;
    }
  }
  if (e.target.id === 'record' && e.target.checked === false) {
    document.getElementById('open-last-visited').checked = false;
    document.getElementById('display-last-visited').checked = false;
  }
});
