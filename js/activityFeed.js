(() => {
  const MAX_ITEMS = 80;

  function nowLabel() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function push(state, type, message) {
    state.feed = state.feed || [];
    state.feed.unshift({ id: crypto.randomUUID(), type, message, time: nowLabel(), ts: Date.now() });
    if (state.feed.length > MAX_ITEMS) state.feed.length = MAX_ITEMS;
  }

  function render(state, el) {
    el.innerHTML = '';
    (state.feed || []).forEach((item) => {
      const li = document.createElement('li');
      const strong = document.createElement('strong');
      strong.textContent = item.message;
      const time = document.createElement('span');
      time.className = 'event-time';
      time.textContent = item.time;
      li.appendChild(strong);
      li.appendChild(time);
      el.appendChild(li);
    });
    el.scrollTop = 0;
  }

  window.EduArena = window.EduArena || {};
  window.EduArena.activityFeed = { push, render };
})();
