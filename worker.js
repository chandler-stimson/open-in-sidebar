chrome.sidePanel.setPanelBehavior({
  openPanelOnActionClick: true
});

{
  const once = () => chrome.sidePanel.open && chrome.storage.local.get({
    'open-in-sidebar-context': true
  }, prefs => {
    chrome.contextMenus.remove('set-origin-and-open', () => {
      chrome.runtime.lastError;
      if (prefs['open-in-sidebar-context']) {
        chrome.contextMenus.create({
          id: 'set-origin-and-open',
          title: 'Open in Sidebar',
          contexts: ['link', 'page']
        }, () => chrome.runtime.lastError);
      }
    });
  });
  chrome.runtime.onInstalled.addListener(once);
  chrome.runtime.onStartup.addListener(once);
  chrome.storage.onChanged.addListener(ps => ps['open-in-sidebar-context'] && once());
}

let href;

chrome.runtime.onMessage.addListener((request, sender, response) => {
  if (request.method === 'get-href') {
    response(href);
    href = '';
  }
  else if (request.method === 'is-popup') {
    response(!sender.documentId);
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'set-origin-and-open') {
    href = info.linkUrl || info.pageUrl;
    chrome.runtime.sendMessage({
      method: 'send-href',
      href
    }, b => {
      chrome.runtime.lastError;
      if (b) {
        href = '';
      }
    });
    chrome.sidePanel.open({
      windowId: tab.windowId
    });
  }
});

/* FAQs & Feedback */
{
  const {management, runtime: {onInstalled, setUninstallURL, getManifest}, storage, tabs} = chrome;
  if (navigator.webdriver !== true) {
    const page = getManifest().homepage_url;
    const {name, version} = getManifest();
    onInstalled.addListener(({reason, previousVersion}) => {
      management.getSelf(({installType}) => installType === 'normal' && storage.local.get({
        'faqs': true,
        'last-update': 0
      }, prefs => {
        if (reason === 'install' || (prefs.faqs && reason === 'update')) {
          const doUpdate = (Date.now() - prefs['last-update']) / 1000 / 60 / 60 / 24 > 45;
          if (doUpdate && previousVersion !== version) {
            tabs.query({active: true, currentWindow: true}, tbs => tabs.create({
              url: page + '?version=' + version + (previousVersion ? '&p=' + previousVersion : '') + '&type=' + reason,
              active: reason === 'install',
              ...(tbs && tbs.length && {index: tbs[0].index + 1})
            }));
            storage.local.set({'last-update': Date.now()});
          }
        }
      }));
    });
    setUninstallURL(page + '?rd=feedback&name=' + encodeURIComponent(name) + '&version=' + version);
  }
}
