/* ==========================================================================
   PATATI PATATÁ — NAVEGAÇÃO PRINCIPAL
   Arquivo: js/app.js
   Alterna as telas da aplicação, abre os jogos e conecta os controles
   do jogo Detetives dos Sons.
   ========================================================================== */

(function () {
  // Cartões da tela Jogos -> identificador do jogo
  const GAME_BY_CARD = { 1: 'detetives', 2: 'mebolo', 3: 'construtores', 4: 'aventura', 5: 'missao' };

  // Telas que usam layout flexível em tela cheia
  const FLEX_VIEWS = ['inicio', 'jogos'];

  class PPApp {
    constructor() {
      this.views = document.querySelectorAll('.pp-view');
      this.navLinks = document.querySelectorAll('.pp-nav__link');
      this.homeVideo = document.getElementById('home-bg-video');
      this.current = 'inicio';
      this.trackHeaderHeight();
      this.bindNavigation();
      this.bindDetetives();
    }

    // O cabeçalho fixo muda de altura conforme a tela (uma ou duas linhas);
    // o conteúdo usa --pp-header-offset para nunca ficar escondido atrás dele
    trackHeaderHeight() {
      const header = document.querySelector('.pp-header');
      if (!header) return;
      const update = () => {
        const bottom = header.getBoundingClientRect().bottom;
        if (bottom > 0) document.documentElement.style.setProperty('--pp-header-offset', `${Math.ceil(bottom)}px`);
      };
      update();
      if (window.ResizeObserver) new ResizeObserver(update).observe(header);
      window.addEventListener('resize', update);
    }

    showView(viewName) {
      const target = document.getElementById(`view-${viewName}`);
      if (!target) return;

      // Pausa o jogo que estava aberto
      const leaving = this.current && this.current.startsWith('game-') ? this.current.slice(5) : null;
      const leavingGame = leaving === 'detetives' ? window.ppDetetivesGame : window.ppGames && window.ppGames[leaving];
      if (leavingGame && leaving !== viewName.slice(5)) {
        leavingGame.pause();
      }

      this.views.forEach((v) => {
        v.style.display = 'none';
        v.classList.remove('pp-view-enter');
      });
      this.navLinks.forEach((l) => {
        const active = l.getAttribute('data-view') === viewName || (viewName.startsWith('game-') && l.getAttribute('data-view') === 'jogos');
        l.classList.toggle('active', active);
        if (active) l.setAttribute('aria-current', 'page');
        else l.removeAttribute('aria-current');
      });

      const isFlex = FLEX_VIEWS.includes(viewName) || target.classList.contains('pp-game-view');
      target.style.display = isFlex ? 'flex' : 'block';
      void target.offsetWidth;
      target.classList.add('pp-view-enter');
      this.current = viewName;
      document.body.dataset.page = viewName;
      window.scrollTo({ top: 0 });

      if (this.homeVideo) {
        if (viewName === 'inicio') this.homeVideo.play().catch(() => {});
        else this.homeVideo.pause();
      }

      if (viewName === 'conquistas' && window.ppConquistas) window.ppConquistas.render();
    }

    openGame(gameId) {
      if (gameId === 'detetives') {
        this.showView('game-detetives');
        if (window.ppDetetivesGame) window.ppDetetivesGame.init();
        return;
      }
      const game = window.ppGames && window.ppGames[gameId];
      if (!game) return;
      game.mount();
      this.showView(`game-${gameId}`);
      game.start();
    }

    bindNavigation() {
      document.querySelectorAll('[data-view]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const view = btn.getAttribute('data-view');
          if (view) this.showView(view);
        });
      });

      document.getElementById('pp-nav-logo')?.addEventListener('click', (e) => {
        e.preventDefault();
        this.showView('inicio');
      });

      document.getElementById('btn-vamos-la')?.addEventListener('click', () => {
        if (window.ppAudio) window.ppAudio.playClick();
        setTimeout(() => this.showView('jogos'), 250);
      });

      // Cartões de jogos (clique e teclado)
      document.querySelectorAll('[data-game-target]').forEach((card) => {
        const gameId = GAME_BY_CARD[card.getAttribute('data-game-target')];
        card.addEventListener('click', () => this.openGame(gameId));
      });

      // Links internos (ex.: página Sobre e Conquistas)
      document.querySelectorAll('[data-open-game]').forEach((btn) => {
        btn.addEventListener('click', () => this.openGame(btn.getAttribute('data-open-game')));
      });
    }

    // Controles do jogo Detetives dos Sons (marcação estática no index.html)
    bindDetetives() {
      const toGames = () => {
        if (window.ppAudio) window.ppAudio.stopSpeech();
        this.showView('jogos');
      };
      document.getElementById('btn-detetives-back-to-games')?.addEventListener('click', toGames);
      document.getElementById('btn-detetives-return')?.addEventListener('click', toGames);

      document.getElementById('btn-detetives-retry')?.addEventListener('click', () => {
        if (window.ppDetetivesGame) window.ppDetetivesGame.init();
      });

      document.getElementById('btn-detetives-instruction-audio')?.addEventListener('click', () => {
        if (window.ppAudio) window.ppAudio.speakInstruction('Preste atenção e clique na palavra escrita corretamente!');
      });

      document.getElementById('btn-detetives-phoneme-sound')?.addEventListener('click', () => {
        if (window.ppDetetivesGame) window.ppDetetivesGame.speakPhoneme();
      });

      document.getElementById('detetives-figure-content')?.addEventListener('click', () => {
        if (window.ppDetetivesGame) window.ppDetetivesGame.speakCurrentWord();
      });

      document.getElementById('btn-detetives-listen-again')?.addEventListener('click', () => {
        if (window.ppDetetivesGame) window.ppDetetivesGame.speakCurrentWord();
      });

      document.getElementById('char-patati-detetive')?.addEventListener('click', () => {
        if (window.ppAudio) {
          window.ppAudio.playClick();
          window.ppAudio.speak('Olá! Eu sou o Patati Detetive! Vamos encontrar a palavra certa com a minha lupa?');
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.ppApp = new PPApp();
  });
})();
