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
      li.innerHTML = `<strong>${item.message}</strong><span class="event-time">${item.time}</span>`;
      el.appendChild(li);
    });
    el.scrollTop = 0;
  }

  window.EduArena = window.EduArena || {};
  window.EduArena.activityFeed = { push, render };
})();
