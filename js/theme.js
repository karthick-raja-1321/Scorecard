(() => {
  const apply = (theme) => {
    document.body.dataset.theme = theme === 'light' ? 'light' : 'dark';
  };

  const toggle = (current) => (current === 'dark' ? 'light' : 'dark');

  window.EduArena = window.EduArena || {};
  window.EduArena.theme = { apply, toggle };
})();
