/* global tabs */
{
  // fix the network and retry
  const retry = (id, hostname, href) => {
    tabs.update(id, {
      href: ''
    });
    network(id, hostname).then(() => tabs.update(id, {
      href
    }));
  };

  // handle cross-origin redirects (e.g. https://www.iana.org/go/rfc2606)
  const watch = (tabId, hostname, href) => {
    const redirect = d => {
      const o = new URL(d.redirectUrl);
      if (o.hostname !== hostname) {
        retry(tabId, o.hostname, d.redirectUrl);
      }
    };
    chrome.webRequest.onBeforeRedirect.addListener(redirect, {
      urls: [href],
      types: ['sub_frame']
    });
    setTimeout(() => chrome.webRequest.onBeforeRedirect.removeListener(redirect), 1000);
  };

  const network = (id, hostname) => {
    tabs.update(id, {
      hostname
    });

    return chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: [id],
      addRules: [{
        id,
        'action': {
          'type': 'modifyHeaders',
          'responseHeaders': [
            {'header': 'X-Frame-Options', 'operation': 'remove'}
          ]
        },
        'condition': {
          'tabIds': [-1],
          'resourceTypes': ['sub_frame', 'xmlhttprequest'],
          'urlFilter': '||' + hostname
        }
      }]
    });
  };

  const navigate = async (tabId = tabs.active, options = {}) => {
    const {hostname} = new URL(options.href);

    await network(tabId, hostname);
    watch(tabId, hostname, options.href);

    tabs.update(tabId, {
      state: 'loading',
      href: options.href
    });
  };
  navigate.terminate = id => {
    return chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: [id]
    });
  };

  addEventListener('message', e => {
    if (e.data?.method === 'navigate' || e.data?.method === 'open') {
      const tabId = tabs.find(e.source);
      tabs.update(tabId, {
        href: e.data.href
      }, false); // false: do not actually reload the tab
    }
    // cross-origin request
    if (e.data?.method === 'navigate' || e.data?.method === 'open') {
      const tabId = tabs.find(e.source);

      if (tabId !== -1) {
        const m = tabs.get(tabId);

        if (!m || m.hostname !== e.data.hostname) {
          // we need to retry to open the URL since it might have been blocked
          retry(tabId, e.data.hostname, e.data.href);
        }

        watch(tabId, e.data.hostname, e.data.href);
      }
      // else {
      //   console.log('dead source', e.data);
      // }
    }
    //
    if (e.data?.method === 'navigate') {
      if (e.source) {
        e.source.postMessage({
          method: 'navigate-verified'
        }, '*');
      }
    }
    else if (e.data?.method === 'loaded') {
      const tabId = tabs.find(e.source);
      if (tabId !== -1) {
        tabs.update(tabId, {
          state: 'ready'
        });
      }
    }
  });

  self.navigate = navigate;
}

// chrome.webRequest.onHeadersReceived.addListener(d => {
//   console.log(d);
// }, {
//   urls: ['*://*/*']
// });
// console.log(chrome.webRequest.onBeforeRequest.addListener);
