(() => {
  function createTimer(initialMs = 0) {
    let status = 'stopped';
    let elapsedMs = initialMs;
    let startedAt = 0;

    function getElapsed() {
      return status === 'running' ? elapsedMs + (performance.now() - startedAt) : elapsedMs;
    }

    function start() {
      if (status === 'running') return status;
      if (status === 'stopped') elapsedMs = 0;
      startedAt = performance.now();
      status = 'running';
      return status;
    }

    function pause() {
      if (status !== 'running') return status;
      elapsedMs = getElapsed();
      status = 'paused';
      return status;
    }

    function resume() {
      if (status !== 'paused') return status;
      startedAt = performance.now();
      status = 'running';
      return status;
    }

    function stop() {
      if (status === 'running') elapsedMs = getElapsed();
      status = 'stopped';
      return status;
    }

    function reset() {
      elapsedMs = 0;
      if (status === 'running') startedAt = performance.now();
    }

    function setStatus(nextStatus) {
      status = nextStatus;
      if (status === 'running') startedAt = performance.now();
    }

    return { start, pause, resume, stop, reset, getElapsed, setStatus, get status() { return status; } };
  }

  function fmt(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = String(Math.floor(total / 3600)).padStart(2, '0');
    const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
    const s = String(total % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  window.EduArena = window.EduArena || {};
  window.EduArena.timer = { createTimer, fmt };
})();
