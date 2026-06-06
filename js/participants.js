(() => {
  const avatars = [
    'fa-user-graduate',
    'fa-user-astronaut',
    'fa-user-ninja',
    'fa-user-secret',
    'fa-user-tie',
    'fa-user'
  ];

  const gradients = [
    'linear-gradient(135deg,#00E5FF,#7B61FF)',
    'linear-gradient(135deg,#6DF7FF,#00A3FF)',
    'linear-gradient(135deg,#A855F7,#7B61FF)',
    'linear-gradient(135deg,#22C55E,#00E5FF)',
    'linear-gradient(135deg,#F59E0B,#EF4444)'
  ];

  const firstNames = ['Ari', 'Nova', 'Luca', 'Maya', 'Iris', 'Theo', 'Zoe', 'Nia', 'Kai', 'Ravi', 'Tara', 'Milo'];
  const suffixes = ['Coder', 'Scholar', 'Rocket', 'Logic', 'Matrix', 'Spark', 'Pilot', 'Nexus', 'Byte'];

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function create(name) {
    return {
      id: crypto.randomUUID(),
      avatar: pick(avatars),
      avatarBg: pick(gradients),
      name: (name || 'Participant').trim(),
      score: 0,
      rank: 0,
      badges: [],
      actionsCount: 0,
      createdAt: Date.now(),
      previousRank: null,
      lastDelta: 0
    };
  }

  function generateMany(count) {
    return Array.from({ length: count }, () => create(`${pick(firstNames)} ${pick(suffixes)} ${Math.floor(Math.random() * 99) + 1}`));
  }

  function sortAndRank(participants, sortBy = 'score-desc') {
    const before = new Map(participants.map((p) => [p.id, p.rank || participants.length + 1]));

    const sorters = {
      'score-desc': (a, b) => b.score - a.score || a.createdAt - b.createdAt,
      'score-asc': (a, b) => a.score - b.score || a.createdAt - b.createdAt,
      'name-asc': (a, b) => a.name.localeCompare(b.name),
      'name-desc': (a, b) => b.name.localeCompare(a.name),
      'created-desc': (a, b) => b.createdAt - a.createdAt,
      'created-asc': (a, b) => a.createdAt - b.createdAt
    };

    participants.sort(sorters[sortBy] || sorters['score-desc']);

    participants.forEach((p, i) => {
      p.previousRank = before.get(p.id) || i + 1;
      p.rank = i + 1;
    });
  }

  function filter(participants, text) {
    const q = (text || '').trim().toLowerCase();
    if (!q) return participants;
    return participants.filter((p) => p.name.toLowerCase().includes(q));
  }

  window.EduArena = window.EduArena || {};
  window.EduArena.participants = { create, generateMany, sortAndRank, filter };
})();
