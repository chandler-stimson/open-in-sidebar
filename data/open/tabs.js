{
  let active = 1;

  const locate = href => {
    if (href.startsWith('chrome-extension:/')) {
      document.getElementById('address').value = '';
    }
    else {
      document.getElementById('address').value = href;
    }
  };

  const change = n => {
    active = n;
    document.getElementById('active').textContent = n;

    locate(tabs.has(n) ? tabs.get(n).href : '');
  };
  change.navs = tabId => {
    const o = tabs.get(tabId);
    if (o) {
      document.getElementById('forward').disabled = o.current === o.max;
      document.getElementById('back').disabled = o.current === 0;
    }
  };

  const tabs = new Map();
  tabs.update = (id = active, options, act = true) => {
    if (tabs.has(id) === false) {
      tabs.set(id, {
        current: -1,
        max: -1,
        stack: []
      });
    }
    const o = tabs.get(id);
    Object.assign(o, options);

    if ('state' in options) {
      if (id === active) {
        document.body.setAttribute('state', options.state);
      }
    }
    if ('href' in options) {
      if (id === active) {
        locate(options.href);
      }
      if (act) {
        const frame = document.querySelector(`iframe:nth-of-type(${id})`);
        frame.src = options.href;
      }
    }
    if (options.active) {
      document.querySelector(`iframe:nth-of-type(${id})`).focus();
      delete o.active;
    }
  };

  Object.defineProperty(tabs, 'active', {
    get() {
      return active;
    }
  });

  tabs.find = source => {
    for (let n = 0; n < 4; n += 1) {
      if (frames[n] === source) {
        return n + 1;
      }
    }
    return -1;
  };

  addEventListener('message', e => {
    if (e.data?.method === 'focus') {
      const tabId = tabs.find(e.source);

      if (tabId !== -1) {
        change(tabId);
        change.navs(tabId);
      }
    }

    // history
    if (e.data?.method === 'navigate') {
      const tabId = tabs.find(e.source);
      if (tabId !== -1) {
        const o = tabs.get(tabId);
        if (o.ignore !== true) {
          if (o.stack[o.current] !== e.data.href) { // refresh
            o.current += 1;

            if (o.stack[o.current] !== e.data.href) {
              o.max = o.current;
              o.stack[o.current] = e.data.href;
            }
          }
        }
        else {
          delete o.ignore;
        }
        if (tabId === tabs.active) {
          change.navs(tabId);
        }
      }
    }
  });

  tabs.remove = id => {
    const frame = document.querySelector(`iframe:nth-of-type(${id})`);
    frame.removeAttribute('src');

    if (active === id) {
      change(1);
    }
  };

  tabs.sendMessage = (id, msg) => frames[id - 1].postMessage(msg, '*');

  tabs.prepare = (tabId, direction) => new Promise(resolve => {
    const o = tabs.get(tabId);
    if (direction === 'backward') {
      if (o.current > 0) {
        o.current -= 1;
        o.ignore = true;
        resolve(o.stack[o.current]);
      }
    }
    else if (direction === 'forward') {
      if (o.current < o.max) {
        resolve(o.stack[o.current + 1]);
      }
    }
  });

  self.tabs = tabs;
}
