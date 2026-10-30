/* ==========================================================================
   PATATI PATATÁ — GERENCIADOR DE COMPONENTES REUTILIZÁVEIS
   Arquivo: js/components.js
   Controladores de Modais, Estrelas, Confetes, Feedback de Respostas e Áudio
   ========================================================================== */

class PPComponents {
  constructor() {
    this.initGlobalButtonSounds();
    this.initAchievementToasts();
  }

  // 1. Vincula automaticamente o som de clique aos botões de navegação e controle
  initGlobalButtonSounds() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('.pp-btn, .pp-btn-circle, .pp-option-pill, .pp-nav__link, .pp-game-card, .pp-game-btn-back, .pp-game-btn-speaker, .pp-btn-listen-again, [data-pp-click]');
      if (target && window.ppAudio) {
        window.ppAudio.playClick();
      }
    });
  }

  // Aviso flutuante quando uma conquista é desbloqueada
  initAchievementToasts() {
    window.addEventListener('pp:achievement', (e) => {
      this.showToast(`Conquista desbloqueada: ${e.detail.title}!`, e.detail.description);
    });
  }

  // Avisos entram em fila para aparecer um de cada vez
  showToast(title, text = '') {
    this.toastQueue = this.toastQueue || [];
    this.toastQueue.push({ title, text });
    if (!this.toastBusy) this.nextToast();
  }

  nextToast() {
    const item = this.toastQueue.shift();
    if (!item) {
      this.toastBusy = false;
      return;
    }
    this.toastBusy = true;
    const { title, text } = item;
    let stack = document.getElementById('pp-toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.id = 'pp-toast-stack';
      stack.className = 'pp-toast-stack';
      stack.setAttribute('role', 'status');
      stack.setAttribute('aria-live', 'polite');
      document.body.appendChild(stack);
    }
    const toast = document.createElement('div');
    toast.className = 'pp-toast';
    toast.innerHTML = `
      <span class="pp-toast__icon" aria-hidden="true">★</span>
      <div><strong class="pp-toast__title"></strong><span class="pp-toast__text"></span></div>`;
    toast.querySelector('.pp-toast__title').textContent = title;
    toast.querySelector('.pp-toast__text').textContent = text;
    stack.appendChild(toast);
    if (window.ppAudio) window.ppAudio.playStar();
    setTimeout(() => toast.classList.add('is-leaving'), 2800);
    setTimeout(() => {
      toast.remove();
      this.nextToast();
    }, 3200);
  }

  // 3. Renderizador de Estrelas Interativo
  renderStars(container, count = 3, total = 3, animate = false) {
    if (!container) return;
    container.innerHTML = '';
    container.setAttribute('role', 'img');
    container.setAttribute('aria-label', `${count} de ${total} estrelas`);
    for (let i = 1; i <= total; i++) {
      const star = document.createElement('span');
      star.className = `pp-star ${i <= count ? 'pp-star--filled' : 'pp-star--empty'}${animate && i <= count ? ' pp-star--pop' : ''}`;
      if (animate) star.style.animationDelay = `${(i - 1) * 220}ms`;
      star.setAttribute('aria-hidden', 'true');
      star.innerHTML = '★';
      container.appendChild(star);
    }
  }

  // 4. Modal de Vitória Infantil com Confetes
  showVictoryModal({
    title = 'Parabéns, Amiguinho!',
    subtitle = 'Você completou a atividade com muito brilho!',
    stars = 3,
    onRetry = null,
    onNext = null,
    onHome = null
  } = {}) {
    let overlay = document.getElementById('pp-global-modal');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'pp-global-modal';
      overlay.className = 'pp-modal-overlay';
      document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div class="pp-modal" role="dialog" aria-modal="true">
        <div class="pp-modal__confetti-box" id="pp-modal-confetti"></div>
        <div class="pp-character-badge" style="width: 5rem; height: 5rem; margin: -4.0625rem auto 0.75rem; border: 0.25rem solid #fff;">
          <img src="assets/extracted/patati_avatar_helper.png" alt="Patati" />
        </div>
        <h2 class="pp-modal__title">${title}</h2>
        <p class="pp-modal__subtitle">${subtitle}</p>
        
        <div class="pp-modal__stars" id="pp-modal-stars"></div>

        <div class="pp-modal__actions">
          ${onRetry ? `<button class="pp-btn pp-btn--yellow-cta" id="pp-modal-btn-retry" style="font-size: 1.15rem; padding: 0.65rem 1.6rem;">↺ Jogar de Novo</button>` : ''}
          ${onNext ? `<button class="pp-btn pp-btn--green-confirm" id="pp-modal-btn-next" style="font-size: 1.15rem; padding: 0.65rem 1.8rem;">Próximo Jogo ➔</button>` : ''}
          ${onHome ? `<button class="pp-btn pp-btn--blue" id="pp-modal-btn-home" style="font-size: 1.15rem; padding: 0.65rem 1.6rem;">Ver Todos os Jogos</button>` : ''}
        </div>
      </div>
    `;

    // Renderiza as estrelas conquistadas
    const starsContainer = overlay.querySelector('#pp-modal-stars');
    this.renderStars(starsContainer, stars, 3);

    // Gera confetes festivos
    this.spawnConfetti(overlay.querySelector('#pp-modal-confetti'));

    // Toca som de vitória e narra parabéns
    if (window.ppAudio) {
      window.ppAudio.playVictory();
      setTimeout(() => {
        window.ppAudio.speak(title);
      }, 400);
    }

    // Configura botões de ação
    if (onRetry) {
      overlay.querySelector('#pp-modal-btn-retry')?.addEventListener('click', () => {
        this.closeModal();
        onRetry();
      });
    }
    if (onNext) {
      overlay.querySelector('#pp-modal-btn-next')?.addEventListener('click', () => {
        this.closeModal();
        onNext();
      });
    }
    if (onHome) {
      overlay.querySelector('#pp-modal-btn-home')?.addEventListener('click', () => {
        this.closeModal();
        onHome();
      });
    }

    // Mostra o modal
    requestAnimationFrame(() => overlay.classList.add('active'));
  }

  closeModal() {
    const overlay = document.getElementById('pp-global-modal');
    if (overlay) {
      overlay.classList.remove('active');
    }
  }

  // 5. Chuva de Confetes Coloridos
  spawnConfetti(container) {
    if (!container) return;
    const colors = ['#ffea55', '#22c55e', '#38bdf8', '#ec4899', '#f97316', '#a855f7'];
    for (let i = 0; i < 28; i++) {
      const piece = document.createElement('div');
      piece.className = 'pp-confetti-piece';
      piece.style.left = `${Math.random() * 90 + 5}%`;
      piece.style.top = `${Math.random() * 20}px`;
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = `${Math.random() * 0.6}s`;
      piece.style.animationDuration = `${1.2 + Math.random() * 0.8}s`;
      container.appendChild(piece);
    }
  }

  // 6. Feedback de Respostas (Certo / Tente Novamente)
  handleAnswerFeedback(element, isCorrect, callback) {
    if (!element) return;

    if (isCorrect) {
      element.classList.add('is-correct');
      if (window.ppAudio) {
        window.ppAudio.playSuccess();
      }
      setTimeout(() => {
        element.classList.remove('is-correct');
        if (callback) callback(true);
      }, 1000);
    } else {
      element.classList.add('is-wrong');
      if (window.ppAudio) {
        window.ppAudio.playTryAgain();
      }
      setTimeout(() => {
        element.classList.remove('is-wrong');
        if (callback) callback(false);
      }, 900);
    }
  }
}

// Instância global de componentes
window.ppComponents = new PPComponents();
