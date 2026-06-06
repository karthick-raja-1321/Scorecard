(() => {
  const defs = {
    topScorer: { icon: 'fa-crown', label: 'Top Scorer' },
    hotStreak: { icon: 'fa-fire', label: 'Hot Streak' },
    mostActive: { icon: 'fa-rocket', label: 'Most Active' },
    fastResponder: { icon: 'fa-bolt', label: 'Fast Responder' },
    quizMaster: { icon: 'fa-brain', label: 'Quiz Master' }
  };

  function assign(state) {
    const list = state.participants;
    if (!list.length) return;

    const topScore = Math.max(...list.map((p) => p.score));
    const maxActions = Math.max(...list.map((p) => p.actionsCount));

    list.forEach((p) => {
      const badges = [];
      if (p.score === topScore && topScore > 0) badges.push(defs.topScorer);
      if (p.lastDelta >= 10) badges.push(defs.hotStreak);
      if (p.actionsCount === maxActions && maxActions > 0) badges.push(defs.mostActive);
      if (p.actionsCount >= 8) badges.push(defs.fastResponder);
      if (p.score >= 50) badges.push(defs.quizMaster);
      p.badges = badges;
    });
  }

  function renderTracker(state, el) {
    const rows = [
      ['Top Scorer', state.participants.find((p) => p.badges.some((b) => b.label === 'Top Scorer'))?.name || '—'],
      ['Most Active', state.participants.find((p) => p.badges.some((b) => b.label === 'Most Active'))?.name || '—'],
      ['Quiz Master', state.participants.find((p) => p.badges.some((b) => b.label === 'Quiz Master'))?.name || '—']
    ];

    el.innerHTML = rows.map(([k, v]) => `<div class="achievement-row"><span>${k}</span><strong>${v}</strong></div>`).join('');
  }

  window.EduArena = window.EduArena || {};
  window.EduArena.achievements = { assign, renderTracker };
})();
