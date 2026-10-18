// Light interactivity: theme toggle + smooth anchor offset. No tracking.

// Light / Dark theme toggle (shared Mac Upgraded behaviour, key: mu-theme)
(function () {
  var toggle = document.getElementById('themeToggle');
  if (!toggle) return;
  var root = document.documentElement;
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  function current() {
    var forced = root.getAttribute('data-theme');
    if (forced === 'light' || forced === 'dark') return forced;
    return prefersDark && prefersDark.matches ? 'dark' : 'light';
  }
  toggle.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('mu-theme', next); } catch (e) {}
  });
})();

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      const el = document.querySelector(id);
      if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
    }
  });
});
