/* ==========================================================================
   PATATI PATATÁ — SISTEMA DE PROGRESSO, PONTUAÇÃO E CONQUISTAS
   Arquivo: js/core/progress.js
   Persistência em localStorage (sem backend), regra única de estrelas
   e desbloqueio automático de conquistas.
   ========================================================================== */

(function () {
  const STORAGE_KEY = 'pp_progress_v1';

  // Catálogo oficial dos cinco jogos da plataforma
  const GAMES = [
    { id: 'detetives', name: 'Detetives dos Sons', view: 'game-detetives', image: 'assets/images/jogos/illust_jogo1.png', color: '#25A9E8' },
    { id: 'mebolo', name: 'O Gato Mebolo', view: 'game-mebolo', image: 'assets/images/jogos/illust_jogo2.png', color: '#54C96B' },
    { id: 'construtores', name: 'Construtores de Palavras', view: 'game-construtores', image: 'assets/images/jogos/illust_jogo3.png', color: '#FF9838' },
    { id: 'aventura', name: 'Aventura do Re G', view: 'game-aventura', image: 'assets/images/jogos/illust_jogo4.png', color: '#9364E8' },
    { id: 'missao', name: 'Missão Palavra Mágica', view: 'game-missao', image: 'assets/images/jogos/illust_jogo5.png', color: '#F05B9B' }
  ];

  // Conquistas oficiais (regras avaliadas sobre os dados reais salvos)
  const ACHIEVEMENTS = [
    {
      id: 'primeiro-jogo',
      title: 'Primeira Aventura',
      description: 'Conclua o seu primeiro jogo.',
      color: '#25A9E8',
      test: (s) => completedCount(s) >= 1
    },
    {
      id: 'dez-atividades',
      title: 'Mão na Massa',
      description: 'Responda 10 atividades.',
      color: '#54C96B',
      test: (s) => s.activitiesAnswered >= 10
    },
    {
      id: 'sequencia-cinco',
      title: 'Sequência Brilhante',
      description: 'Acerte 5 respostas seguidas.',
      color: '#FF9838',
      test: (s) => s.bestStreak >= 5
    },
    {
      id: 'tres-estrelas',
      title: 'Estrelas Completas',
      description: 'Ganhe todas as 3 estrelas em um jogo.',
      color: '#FFD43B',
      test: (s) => Object.values(s.games).some((g) => g.bestStars >= 3)
    },
    {
      id: 'cinco-jogos',
      title: 'Grande Campeão',
      description: 'Conclua os cinco jogos.',
      color: '#9364E8',
      test: (s) => completedCount(s) >= GAMES.length
    }
  ];

  const ACTIVITIES_PER_GAME = 10;
  const MAX_STARS = 3;

  function emptyState() {
    return {
      version: 1,
      games: {},
      activitiesAnswered: 0,
      correctAnswers: 0,
      streak: 0,
      bestStreak: 0,
      achievements: {}
    };
  }

  function completedCount(state) {
    return GAMES.filter((g) => state.games[g.id] && state.games[g.id].completed).length;
  }

  function toInt(value, fallback = 0) {
    const n = parseInt(value, 10);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  }

  // Garante que dados corrompidos ou antigos não quebrem a aplicação
  function sanitize(raw) {
    const state = emptyState();
    if (!raw || typeof raw !== 'object') return state;

    state.activitiesAnswered = toInt(raw.activitiesAnswered);
    state.correctAnswers = toInt(raw.correctAnswers);
    state.streak = toInt(raw.streak);
    state.bestStreak = Math.max(toInt(raw.bestStreak), state.streak);

    if (raw.games && typeof raw.games === 'object') {
      GAMES.forEach(({ id }) => {
        const g = raw.games[id];
        if (!g || typeof g !== 'object') return;
        state.games[id] = {
          completed: Boolean(g.completed),
          plays: toInt(g.plays),
          bestScore: toInt(g.bestScore),
          bestCorrect: Math.min(ACTIVITIES_PER_GAME, toInt(g.bestCorrect)),
          bestStars: Math.min(MAX_STARS, toInt(g.bestStars)),
          lastPlayed: typeof g.lastPlayed === 'string' ? g.lastPlayed : null
        };
      });
    }

    if (raw.achievements && typeof raw.achievements === 'object') {
      ACHIEVEMENTS.forEach(({ id }) => {
        if (typeof raw.achievements[id] === 'string') state.achievements[id] = raw.achievements[id];
      });
    }
    return state;
  }

  class PPProgress {
    constructor() {
      this.state = this.load();
    }

    load() {
      let state = emptyState();
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          state = sanitize(JSON.parse(stored));
        } else {
          state = this.migrateLegacy(state);
        }
      } catch (e) {
        state = emptyState();
      }
      return state;
    }

    // Converte o recorde antigo do Detetives dos Sons (versão anterior) para o novo formato
    migrateLegacy(state) {
      try {
        const oldScore = toInt(localStorage.getItem('pp_detetives_score'));
        const oldStars = toInt(localStorage.getItem('pp_detetives_stars'));
        if (oldScore > 0) {
          state.games.detetives = {
            completed: true,
            plays: 1,
            bestScore: oldScore,
            bestCorrect: 0,
            bestStars: Math.min(MAX_STARS, oldStars),
            lastPlayed: null
          };
        }
        localStorage.removeItem('pp_detetives_score');
        localStorage.removeItem('pp_detetives_stars');
      } catch (e) { /* armazenamento indisponível */ }
      return state;
    }

    persist() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) { /* modo privado ou cota cheia: segue apenas em memória */ }
      window.dispatchEvent(new CustomEvent('pp:progress', { detail: this.getSummary() }));
    }

    // Regra única de estrelas da plataforma (baseada em acertos de primeira)
    starsFor(correct) {
      if (correct >= 9) return 3;
      if (correct >= 5) return 2;
      return 1;
    }

    // Cada tentativa de resposta alimenta a sequência de acertos
    recordAttempt(isCorrect) {
      if (isCorrect) {
        this.state.streak += 1;
        this.state.bestStreak = Math.max(this.state.bestStreak, this.state.streak);
      } else {
        this.state.streak = 0;
      }
      this.evaluate();
      this.persist();
    }

    // Uma atividade concluída (acertada ou com resposta revelada)
    recordActivity(firstTryCorrect) {
      this.state.activitiesAnswered += 1;
      if (firstTryCorrect) this.state.correctAnswers += 1;
      this.evaluate();
      this.persist();
    }

    // Salva o resultado final sem perder um recorde melhor
    saveResult(gameId, { score, correct }) {
      const stars = this.starsFor(correct);
      const prev = this.state.games[gameId] || {
        completed: false, plays: 0, bestScore: 0, bestCorrect: 0, bestStars: 0, lastPlayed: null
      };
      const isNewBest = !prev.completed || score > prev.bestScore;

      this.state.games[gameId] = {
        completed: true,
        plays: prev.plays + 1,
        bestScore: Math.max(prev.bestScore, score),
        bestCorrect: Math.max(prev.bestCorrect, correct),
        bestStars: Math.max(prev.bestStars, stars),
        lastPlayed: new Date().toISOString()
      };

      this.evaluate();
      this.persist();
      return { stars, isNewBest, best: this.state.games[gameId] };
    }

    // Desbloqueia conquistas cujas regras foram atendidas
    evaluate() {
      ACHIEVEMENTS.forEach((a) => {
        if (!this.state.achievements[a.id] && a.test(this.state)) {
          this.state.achievements[a.id] = new Date().toISOString();
          window.dispatchEvent(new CustomEvent('pp:achievement', { detail: { id: a.id, title: a.title, description: a.description } }));
        }
      });
    }

    getGame(gameId) {
      return this.state.games[gameId] || null;
    }

    getSummary() {
      const s = this.state;
      const totalStars = GAMES.reduce((sum, g) => sum + (s.games[g.id] ? s.games[g.id].bestStars : 0), 0);
      const completed = completedCount(s);
      const unlocked = ACHIEVEMENTS.filter((a) => s.achievements[a.id]).length;
      return {
        totalStars,
        maxStars: GAMES.length * MAX_STARS,
        completedGames: completed,
        totalGames: GAMES.length,
        activitiesAnswered: s.activitiesAnswered,
        correctAnswers: s.correctAnswers,
        bestStreak: s.bestStreak,
        unlockedAchievements: unlocked,
        totalAchievements: ACHIEVEMENTS.length
      };
    }

    getAchievements() {
      return ACHIEVEMENTS.map(({ id, title, description, color }) => ({
        id, title, description, color, unlockedAt: this.state.achievements[id] || null
      }));
    }

    getGames() {
      return GAMES.map((g) => ({ ...g, result: this.state.games[g.id] || null }));
    }
  }

  window.PP_ACTIVITIES_PER_GAME = ACTIVITIES_PER_GAME;
  window.ppProgress = new PPProgress();
})();
