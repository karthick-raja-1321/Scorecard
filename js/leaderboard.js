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

      const tdParticipant = document.createElement('td');
      const participantCell = document.createElement('div');
      participantCell.className = 'participant-cell';
      const avatar = document.createElement('span');
      avatar.className = 'avatar';
      avatar.style.background = p.avatarBg;
      const avatarIcon = document.createElement('i');
      avatarIcon.className = `fa-solid ${p.avatar}`;
      avatar.appendChild(avatarIcon);
      const name = document.createElement('span');
      name.textContent = p.name;
      participantCell.appendChild(avatar);
      participantCell.appendChild(name);
      tdParticipant.appendChild(participantCell);

      const tdRank = document.createElement('td');
      tdRank.textContent = `#${p.rank}`;

      const tdScore = document.createElement('td');
      const strong = document.createElement('strong');
      strong.textContent = String(p.score);
      tdScore.appendChild(strong);

      const tdBadges = document.createElement('td');
      const badgeList = document.createElement('div');
      badgeList.className = 'badge-list';
      if (p.badges.length) {
        p.badges.forEach((b) => {
          const chip = document.createElement('span');
          chip.className = 'badge-chip';
          const icon = document.createElement('i');
          icon.className = `fa-solid ${b.icon}`;
          chip.appendChild(icon);
          chip.append(` ${b.label}`);
          badgeList.appendChild(chip);
        });
      } else {
        const chip = document.createElement('span');
        chip.className = 'badge-chip';
        chip.textContent = 'None';
        badgeList.appendChild(chip);
      }
      tdBadges.appendChild(badgeList);

      const tdActions = document.createElement('td');
      const rowActions = document.createElement('div');
      rowActions.className = 'row-actions';
      [10, 5, 1, -1, -5].forEach((v) => {
        const btn = document.createElement('button');
        btn.className = 'btn mini';
        btn.dataset.action = 'delta';
        btn.dataset.id = p.id;
        btn.dataset.value = String(v);
        btn.textContent = `${v > 0 ? '+' : ''}${v}`;
        rowActions.appendChild(btn);
      });
      const resetBtn = document.createElement('button');
      resetBtn.className = 'btn mini';
      resetBtn.dataset.action = 'reset';
      resetBtn.dataset.id = p.id;
      resetBtn.textContent = 'Reset';
      rowActions.appendChild(resetBtn);

      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn mini btn-danger';
      removeBtn.dataset.action = 'remove';
      removeBtn.dataset.id = p.id;
      removeBtn.textContent = 'Remove';
      rowActions.appendChild(removeBtn);
      tdActions.appendChild(rowActions);

      tr.appendChild(tdParticipant);
      tr.appendChild(tdRank);
      tr.appendChild(tdScore);
      tr.appendChild(tdBadges);
      tr.appendChild(tdActions);
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

    podiumEl.innerHTML = '';
    tiers.forEach((tier, idx) => {
      const p = top5[idx];
      const article = document.createElement('article');
      article.className = `podium-card ${tier.className}${p ? '' : ' podium-empty'}`;

      if (!p) {
        const rank = document.createElement('span');
        rank.textContent = `#${tier.rank}`;
        const waiting = document.createElement('span');
        waiting.textContent = 'Waiting...';
        article.appendChild(rank);
        article.appendChild(waiting);
        podiumEl.appendChild(article);
        return;
      }

      const rank = document.createElement('div');
      rank.className = 'podium-rank';
      rank.textContent = `#${tier.rank} • ${tier.name}`;
      const name = document.createElement('div');
      name.className = 'podium-name';
      const icon = document.createElement('i');
      icon.className = `fa-solid ${tier.icon}`;
      name.appendChild(icon);
      name.append(` ${p.name}`);

      const score = document.createElement('div');
      score.className = 'podium-score';
      score.append(`Score: `);
      const scoreStrong = document.createElement('strong');
      scoreStrong.textContent = String(p.score);
      score.appendChild(scoreStrong);
      if (tier.bonus) {
        const bonus = document.createElement('i');
        bonus.className = `fa-solid ${tier.bonus}`;
        score.append(' ');
        score.appendChild(bonus);
      }

      const badges = document.createElement('div');
      badges.className = 'badge-list';
      p.badges.forEach((b) => {
        const chip = document.createElement('span');
        chip.className = 'badge-chip';
        const badgeIcon = document.createElement('i');
        badgeIcon.className = `fa-solid ${b.icon}`;
        chip.appendChild(badgeIcon);
        badges.appendChild(chip);
      });

      article.appendChild(rank);
      article.appendChild(name);
      article.appendChild(score);
      article.appendChild(badges);
      podiumEl.appendChild(article);
    });
  }

  window.EduArena = window.EduArena || {};
  window.EduArena.leaderboard = { renderLeaderboard, renderPodium };
})();
