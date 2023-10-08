chrome.storage.local.get({
  'user-script': '',
  'search-engine': 'https://www.google.com/search?q=%s',
  'start-page': ''
}, prefs => {
  document.getElementById('user-script').value = prefs['user-script'];
  document.getElementById('search-engine').value = prefs['search-engine'];
  document.getElementById('start-page').value = prefs['start-page'];
});

document.getElementById('save').onclick = () => chrome.storage.local.set({
  'user-script': document.getElementById('user-script').value,
  'search-engine': document.getElementById('search-engine').value,
  'start-page': document.getElementById('start-page').value
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
