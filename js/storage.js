(() => {
  const KEY = 'eduarena-live-v1';

  const defaultState = () => ({
    participants: [],
    totals: { awarded: 0 },
    settings: { theme: 'dark', sound: true, sort: 'score-desc', search: '' },
    session: { status: 'stopped', elapsedMs: 0 }
  });

  const save = (state) => {
    localStorage.setItem(KEY, JSON.stringify(state));
  };

  const load = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || '{}');
      return {
        ...defaultState(),
        ...parsed,
        totals: { ...defaultState().totals, ...(parsed.totals || {}) },
        settings: { ...defaultState().settings, ...(parsed.settings || {}) },
        session: { ...defaultState().session, ...(parsed.session || {}) }
      };
    } catch {
      return defaultState();
    }
  };

  const clear = () => localStorage.removeItem(KEY);

  window.EduArena = window.EduArena || {};
  window.EduArena.storage = { load, save, clear, defaultState };
})();
