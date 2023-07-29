chrome.storage.local.get({
  'user-script': ''
}, prefs => {
  document.getElementById('user-script').value = prefs['user-script'];
});

document.getElementById('save').onclick = () => chrome.storage.local.set({
  'user-script': document.getElementById('user-script').value
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