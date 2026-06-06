(() => {
  function compute(state) {
    const list = state.participants;
    const totalParticipants = list.length;
    const highest = totalParticipants ? Math.max(...list.map((p) => p.score)) : 0;
    const sum = list.reduce((a, p) => a + p.score, 0);
    const avg = totalParticipants ? (sum / totalParticipants).toFixed(1) : '0.0';
    const leader = list[0]?.name || '—';
    const mostActive = [...list].sort((a, b) => b.actionsCount - a.actionsCount)[0]?.name || '—';

    return {
      'Total Participants': totalParticipants,
      'Total Points Awarded': state.totals.awarded,
      'Highest Score': highest,
      'Average Score': avg,
      'Current Leader': leader,
      'Most Active': mostActive
    };
  }

  function render(state, el) {
    const stats = compute(state);
    el.innerHTML = Object.entries(stats)
      .map(([k, v]) => `<article class="stat-card"><span class="stat-label">${k}</span><span class="stat-value">${v}</span></article>`)
      .join('');
  }

  window.EduArena = window.EduArena || {};
  window.EduArena.statistics = { compute, render };
})();
