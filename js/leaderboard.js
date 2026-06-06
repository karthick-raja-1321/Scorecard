(() => {
  const tiers = [
    { rank: 1, name: 'Diamond', className: 'tier-1', icon: 'fa-crown', bonus: 'fa-gem' },
    { rank: 2, name: 'Platinum', className: 'tier-2', icon: 'fa-shield-halved' },
    { rank: 3, name: 'Gold', className: 'tier-3', icon: 'fa-medal' },
    { rank: 4, name: 'Silver', className: 'tier-4', icon: 'fa-trophy' },
    { rank: 5, name: 'Bronze', className: 'tier-5', icon: 'fa-award' }
  ];

  function floatDelta(target, value) {
    const span = document.createElement('span');
    span.className = 'float-text';
    span.style.color = value > 0 ? 'var(--success)' : 'var(--danger)';
    span.textContent = value > 0 ? `+${value}` : `${value}`;
    const box = target.getBoundingClientRect();
    span.style.left = `${box.left + window.scrollX + 6}px`;
    span.style.top = `${box.top + window.scrollY + 4}px`;
    document.body.appendChild(span);
    setTimeout(() => span.remove(), 780);
  }

  function renderLeaderboard(state, bodyEl, onAction) {
    const visible = window.EduArena.participants.filter(state.participants, state.settings.search);
    bodyEl.innerHTML = '';

    visible.forEach((p) => {
      const tr = document.createElement('tr');
      tr.dataset.id = p.id;
      if (p.previousRank && p.rank < p.previousRank) tr.classList.add('rank-up');
      if (p.lastDelta > 0) tr.classList.add('score-up');
      if (p.lastDelta < 0) tr.classList.add('score-down');

      tr.innerHTML = `
        <td>
          <div class="participant-cell">
            <span class="avatar" style="background:${p.avatarBg}"><i class="fa-solid ${p.avatar}"></i></span>
            <span>${p.name}</span>
          </div>
        </td>
        <td>#${p.rank}</td>
        <td><strong>${p.score}</strong></td>
        <td>
          <div class="badge-list">
            ${p.badges.map((b) => `<span class="badge-chip"><i class="fa-solid ${b.icon}"></i>${b.label}</span>`).join('') || '<span class="badge-chip">None</span>'}
          </div>
        </td>
        <td>
          <div class="row-actions">
            ${[10, 5, 1, -1, -5].map((v) => `<button class="btn mini" data-action="delta" data-id="${p.id}" data-value="${v}">${v > 0 ? '+' : ''}${v}</button>`).join('')}
            <button class="btn mini" data-action="reset" data-id="${p.id}"><i class="fa-solid fa-rotate-left"></i><span>Reset</span></button>
            <button class="btn mini btn-danger" data-action="remove" data-id="${p.id}"><i class="fa-solid fa-user-minus"></i><span>Remove</span></button>
          </div>
        </td>
      `;
      bodyEl.appendChild(tr);
    });

    bodyEl.querySelectorAll('button[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        onAction(btn.dataset.action, btn.dataset.id, Number(btn.dataset.value || 0), btn);
      });
    });

    setTimeout(() => {
      bodyEl.querySelectorAll('tr').forEach((tr) => tr.classList.remove('score-up', 'score-down', 'rank-up'));
    }, 520);

    if (state.pendingDeltaRef) {
      const row = bodyEl.querySelector(`tr[data-id="${state.pendingDeltaRef.id}"] td:nth-child(3)`);
      if (row) floatDelta(row, state.pendingDeltaRef.delta);
      state.pendingDeltaRef = null;
    }
  }

  function renderPodium(state, podiumEl, bannerEl) {
    const top5 = [...state.participants].slice(0, 5);
    const prevLeader = state.lastLeaderId;
    const leader = top5[0];

    if (leader && prevLeader && leader.id !== prevLeader) {
      bannerEl.textContent = `⚡ New Leader: ${leader.name}`;
      window.EduArena.ui.confetti();
      setTimeout(() => { bannerEl.textContent = ''; }, 2600);
    }

    state.lastLeaderId = leader?.id || null;

    podiumEl.innerHTML = tiers
      .map((tier, idx) => {
        const p = top5[idx];
        if (!p) return `<article class="podium-card podium-empty ${tier.className}"><span>#${tier.rank}</span><span>Waiting...</span></article>`;
        return `
          <article class="podium-card ${tier.className}">
            <div class="podium-rank">#${tier.rank} • ${tier.name}</div>
            <div class="podium-name"><i class="fa-solid ${tier.icon}"></i> ${p.name}</div>
            <div class="podium-score">Score: <strong>${p.score}</strong> ${tier.bonus ? `<i class="fa-solid ${tier.bonus}"></i>` : ''}</div>
            <div class="badge-list">${p.badges.map((b) => `<span class="badge-chip"><i class="fa-solid ${b.icon}"></i></span>`).join('')}</div>
          </article>`;
      })
      .join('');
  }

  window.EduArena = window.EduArena || {};
  window.EduArena.leaderboard = { renderLeaderboard, renderPodium };
})();
