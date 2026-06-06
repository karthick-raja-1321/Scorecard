(() => {
  function download(name, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  function toCsv(participants) {
    const header = ['id', 'name', 'score', 'rank', 'actionsCount', 'badges', 'createdAt'];
    const lines = participants.map((p) => [
      p.id,
      `"${p.name.replaceAll('"', '""')}"`,
      p.score,
      p.rank,
      p.actionsCount,
      `"${p.badges.map((b) => b.label).join('|')}"`,
      new Date(p.createdAt).toISOString()
    ].join(','));
    return [header.join(','), ...lines].join('\n');
  }

  function exportCsv(state) {
    const csv = toCsv(state.participants);
    download(`eduarena-leaderboard-${Date.now()}.csv`, csv, 'text/csv;charset=utf-8');
  }

  function exportJson(state) {
    const json = JSON.stringify({ participants: state.participants, stats: window.EduArena.statistics.compute(state) }, null, 2);
    download(`eduarena-leaderboard-${Date.now()}.json`, json, 'application/json;charset=utf-8');
  }

  window.EduArena = window.EduArena || {};
  window.EduArena.exports = { exportCsv, exportJson };
})();
