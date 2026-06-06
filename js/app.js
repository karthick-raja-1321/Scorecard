(() => {
  const app = window.EduArena;

  const ui = {
    timerDisplay: document.getElementById('timerDisplay'),
    sessionStatus: document.getElementById('sessionStatus'),
    sessionStatusText: document.getElementById('sessionStatusText'),
    leaderboardBody: document.getElementById('leaderboardBody'),
    podium: document.getElementById('podium'),
    celebrationBanner: document.getElementById('celebrationBanner'),
    activityFeed: document.getElementById('activityFeed'),
    statsGrid: document.getElementById('statsGrid'),
    tracker: document.getElementById('achievementTracker'),
    searchInput: document.getElementById('searchInput'),
    sortSelect: document.getElementById('sortSelect'),
    addForm: document.getElementById('addParticipantForm'),
    nameInput: document.getElementById('participantName'),
    themeToggle: document.getElementById('themeToggle'),
    soundToggle: document.getElementById('soundToggle'),
    fullscreenToggle: document.getElementById('fullscreenToggle')
  };

  const loaded = app.storage.load();

  const state = {
    ...loaded,
    feed: loaded.feed || [],
    lastLeaderId: null,
    pendingDeltaRef: null
  };

  app.ui = {
    confetti() {
      for (let i = 0; i < 18; i += 1) {
        const c = document.createElement('span');
        c.className = 'confetti-piece';
        c.style.left = `${Math.random() * 100}vw`;
        c.style.top = `${Math.random() * 20 + 8}vh`;
        c.style.background = ['#00E5FF', '#7B61FF', '#22C55E', '#FFD700'][i % 4];
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 1500);
      }
    }
  };

  const timer = app.timer.createTimer(state.session.elapsedMs || 0);
  timer.setStatus(state.session.status || 'stopped');

  function save() {
    state.session.elapsedMs = timer.getElapsed();
    state.session.status = timer.status;
    app.storage.save({
      participants: state.participants,
      totals: state.totals,
      settings: state.settings,
      session: state.session,
      feed: state.feed
    });
  }

  function setStatus(status) {
    ui.sessionStatusText.textContent = status[0].toUpperCase() + status.slice(1);
    ui.sessionStatus.querySelector('.dot').className = `dot ${status}`;
  }

  function play(name) {
    app.sound.play(name, state.settings.sound);
  }

  function rerender() {
    app.participants.sortAndRank(state.participants, state.settings.sort);
    app.achievements.assign(state);

    state.participants.forEach((p) => {
      if (p.previousRank && p.rank !== p.previousRank) {
        addFeed('rank', `${p.name} moved to rank #${p.rank}`);
        if (p.rank < p.previousRank) play('rankUp');
      }
    });

    const currentLeader = state.participants[0];
    if (currentLeader && state.lastLeaderId && state.lastLeaderId !== currentLeader.id) {
      addFeed('leader', `${currentLeader.name} is the new leader`);
      play('newLeader');
    }

    app.leaderboard.renderLeaderboard(state, ui.leaderboardBody, onRowAction);
    app.leaderboard.renderPodium(state, ui.podium, ui.celebrationBanner);
    app.activityFeed.render(state, ui.activityFeed);
    app.statistics.render(state, ui.statsGrid);
    app.achievements.renderTracker(state, ui.tracker);
    save();
  }

  function addFeed(type, message) {
    app.activityFeed.push(state, type, message);
  }

  function onRowAction(action, id, value) {
    const p = state.participants.find((item) => item.id === id);
    if (!p) return;

    if (action === 'delta') {
      p.score += value;
      p.actionsCount += 1;
      p.lastDelta = value;
      state.pendingDeltaRef = { id, delta: value };
      if (value > 0) {
        state.totals.awarded += value;
        addFeed('score', `${p.name} gained ${value} points`);
        play('pointAdd');
      } else {
        addFeed('score', `${p.name} lost ${Math.abs(value)} points`);
        play('pointRemove');
      }
    } else if (action === 'reset') {
      p.score = 0;
      p.lastDelta = -1;
      addFeed('score', `${p.name}'s score was reset`);
    } else if (action === 'remove') {
      state.participants = state.participants.filter((item) => item.id !== id);
      addFeed('participant', `${p.name} was removed`);
    }

    rerender();
  }

  function bindControls() {
    ui.addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = ui.nameInput.value.trim();
      if (!name) return;
      const person = app.participants.create(name);
      person.lastDelta = 0;
      state.participants.push(person);
      ui.nameInput.value = '';
      addFeed('participant', `${person.name} joined the arena`);
      rerender();
    });

    document.querySelectorAll('[data-generate]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const count = Number(btn.dataset.generate);
        const generated = app.participants.generateMany(count);
        generated.forEach((g) => (g.lastDelta = 0));
        state.participants.push(...generated);
        addFeed('participant', `${count} random participants generated`);
        rerender();
      });
    });

    ui.searchInput.value = state.settings.search || '';
    ui.searchInput.addEventListener('input', () => {
      state.settings.search = ui.searchInput.value;
      rerender();
    });

    ui.sortSelect.value = state.settings.sort || 'score-desc';
    ui.sortSelect.addEventListener('change', () => {
      state.settings.sort = ui.sortSelect.value;
      rerender();
    });

    document.getElementById('startBtn').addEventListener('click', () => {
      const prev = timer.status;
      timer.start();
      setStatus(timer.status);
      if (prev !== 'running') {
        addFeed('session', 'Session started');
        play('sessionStart');
      }
      save();
    });

    document.getElementById('pauseBtn').addEventListener('click', () => {
      if (timer.pause() === 'paused') {
        setStatus('paused');
        addFeed('session', 'Session paused');
        save();
      }
    });

    document.getElementById('resumeBtn').addEventListener('click', () => {
      if (timer.resume() === 'running') {
        setStatus('running');
        addFeed('session', 'Session resumed');
        play('sessionStart');
        save();
      }
    });

    document.getElementById('stopBtn').addEventListener('click', () => {
      timer.stop();
      setStatus('stopped');
      addFeed('session', 'Session stopped');
      play('sessionEnd');
      save();
    });

    document.getElementById('resetTimerBtn').addEventListener('click', () => {
      timer.reset();
      ui.timerDisplay.textContent = app.timer.fmt(timer.getElapsed());
      addFeed('session', 'Timer reset');
      save();
    });

    document.getElementById('exportCsvBtn').addEventListener('click', () => app.exports.exportCsv(state));
    document.getElementById('exportJsonBtn').addEventListener('click', () => app.exports.exportJson(state));

    document.getElementById('resetScoresBtn').addEventListener('click', () => {
      state.participants.forEach((p) => {
        p.score = 0;
        p.lastDelta = 0;
      });
      addFeed('session', 'All scores reset');
      rerender();
    });

    document.getElementById('clearAllBtn').addEventListener('click', () => {
      state.participants = [];
      state.totals.awarded = 0;
      state.feed = [];
      addFeed('session', 'All participants cleared');
      rerender();
    });

    ui.themeToggle.addEventListener('click', () => {
      state.settings.theme = app.theme.toggle(state.settings.theme);
      app.theme.apply(state.settings.theme);
      save();
    });

    const setSoundIcon = () => {
      ui.soundToggle.innerHTML = `<i class="fa-solid ${state.settings.sound ? 'fa-volume-high' : 'fa-volume-xmark'}"></i><span>Sound</span>`;
    };

    ui.soundToggle.addEventListener('click', () => {
      state.settings.sound = !state.settings.sound;
      setSoundIcon();
      save();
    });
    setSoundIcon();

    ui.fullscreenToggle.addEventListener('click', async () => {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    });

    document.addEventListener('fullscreenchange', () => {
      document.body.classList.toggle('presentation-mode', Boolean(document.fullscreenElement));
      ui.fullscreenToggle.innerHTML = `<i class="fa-solid ${document.fullscreenElement ? 'fa-compress' : 'fa-expand'}"></i><span>Fullscreen</span>`;
    });
  }

  function animateParticles() {
    const box = document.getElementById('particles');
    box.innerHTML = '';
    for (let i = 0; i < 22; i += 1) {
      const p = document.createElement('span');
      p.className = 'particle';
      p.style.left = `${Math.random() * 100}%`;
      p.style.top = `${Math.random() * 100}%`;
      p.style.opacity = (Math.random() * 0.7 + 0.2).toFixed(2);
      p.style.animation = `floatUp ${Math.random() * 5 + 8}s linear infinite`;
      p.style.animationDelay = `${Math.random() * 6}s`;
      box.appendChild(p);
    }
  }

  function bootstrap() {
    app.theme.apply(state.settings.theme);
    bindControls();
    setStatus(timer.status);
    animateParticles();

    if (timer.status === 'running') {
      timer.resume();
      addFeed('session', 'Session resumed automatically');
    }

    rerender();

    setInterval(() => {
      ui.timerDisplay.textContent = app.timer.fmt(timer.getElapsed());
      if (timer.status === 'running') save();
    }, 250);
  }

  bootstrap();
})();
