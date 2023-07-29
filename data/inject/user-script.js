// run user-script if loaded on side panel

if (window.top !== window && window.parent === window.top) {
  const port = document.createElement('span');
  port.id = 'gfr-uyJjfsas';
  port.addEventListener('run', e => {
    e.stopPropagation();
    const script = document.createElement('script');
    script.textContent = e.detail['user-script'];
    document.documentElement.append(script);
    script.remove();
  });
  document.documentElement.append(port);
}
