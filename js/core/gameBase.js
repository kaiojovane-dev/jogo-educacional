/* ==========================================================================
   PATATI PATATÁ — ESTRUTURA COMUM DOS JOGOS
   Arquivo: js/core/gameBase.js
   Monta a moldura padrão de cada jogo (topo, título, painel, progresso,
   pontuação, estrelas, feedback e tela de conclusão). Cada jogo herda
   desta classe e implementa apenas a sua mecânica.
   ========================================================================== */

// Pequeno utilitário de criação de elementos (evita innerHTML com dados)
function ppEl(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

// Embaralha sem alterar o original (Fisher–Yates)
function ppShuffle(list) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Embaralha garantindo que a ordem final seja diferente da original
function ppShuffleDifferent(list, key = (x) => x) {
  if (list.length < 2) return list.slice();
  const original = list.map(key).join('|');
  let result = ppShuffle(list);
  for (let tries = 0; tries < 10 && result.map(key).join('|') === original; tries++) {
    result = ppShuffle(list);
  }
  return result;
}

const PP_ICONS = {
  home: '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>',
  speaker: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>',
  check: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
  arrow: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>',
  retry: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>',
  erase: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>'
};

class PPGameBase {
  /**
   * @param {object} cfg
   *  id, view, theme, title, titleBig, icon, subtitle, instruction, intro, heroImage, heroAlt,
   *  activities[], maxAttempts, resultTitle
   */
  constructor(cfg) {
    this.cfg = Object.assign({ maxAttempts: 3, resultTitle: 'Parabéns!' }, cfg);
    this.activities = this.cfg.activities;
    this.timers = [];
    this.mounted = false;
    this.resetState();
  }

  resetState() {
    this.index = 0;
    this.score = 0;
    this.correct = 0;
    this.attempts = 0;
    this.locked = false;
  }

  get root() {
    return document.getElementById(`view-${this.cfg.view}`);
  }

  // Agenda ações que podem ser canceladas ao sair do jogo
  later(fn, ms) {
    const id = setTimeout(() => {
      this.timers = this.timers.filter((t) => t !== id);
      fn();
    }, ms);
    this.timers.push(id);
    return id;
  }

  clearTimers() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }

  // ------------------------------------------------------------------
  // Montagem da moldura
  // ------------------------------------------------------------------
  mount() {
    const root = this.root;
    if (!root || this.mounted) return;
    this.mounted = true;
    root.classList.add('pp-gs', `pp-theme-${this.cfg.theme}`);
    root.innerHTML = '';

    // Cabeçalho (no lugar da navbar): voltar + título + instrução com alto-falante
    const top = ppEl('header', 'pp-game-header');
    const back = ppEl('button', 'pp-game-btn-back');
    back.type = 'button';
    back.title = 'Voltar aos Jogos';
    back.setAttribute('aria-label', 'Voltar aos Jogos');
    back.innerHTML = PP_ICONS.home;
    back.addEventListener('click', () => this.exit());

    const titleBox = ppEl('div', 'pp-game-header__title');
    const icon = ppEl('span', 'pp-game-header__icon', this.cfg.icon || '⭐');
    icon.setAttribute('aria-hidden', 'true');
    const text = ppEl('div', 'pp-game-header__text');
    text.append(this.buildLogo());
    this.instructionEl = ppEl('p', 'pp-game-header__hint', this.cfg.instruction);
    text.append(this.instructionEl);
    titleBox.append(icon, text);

    const speakerBtn = ppEl('button', 'pp-game-btn-speaker');
    speakerBtn.type = 'button';
    speakerBtn.title = 'Ouvir instrução';
    speakerBtn.setAttribute('aria-label', 'Ouvir instrução');
    speakerBtn.innerHTML = PP_ICONS.speaker;
    speakerBtn.addEventListener('click', () => this.speakInstruction());
    top.append(back, titleBox, speakerBtn);

    // Painel central
    const card = ppEl('div', 'pp-gs-card');
    this.stageEl = ppEl('div', 'pp-gs-stage');

    const head = ppEl('div', 'pp-gs-head');
    this.promptEl = ppEl('h2', 'pp-gs-prompt');
    this.hintEl = ppEl('p', 'pp-gs-hint');
    head.append(this.promptEl, this.hintEl);

    this.activityEl = ppEl('div', 'pp-gs-activity');

    this.feedbackEl = ppEl('div', 'pp-gs-feedback');
    this.feedbackEl.hidden = true;
    this.feedbackEl.setAttribute('role', 'status');
    this.feedbackEl.setAttribute('aria-live', 'polite');
    this.feedbackText = ppEl('p', 'pp-gs-feedback__text');
    this.nextBtn = ppEl('button', 'pp-btn pp-btn--green-confirm pp-gs-next');
    this.nextBtn.type = 'button';
    this.nextBtn.addEventListener('click', () => this.next());
    this.feedbackEl.append(this.feedbackText, this.nextBtn);

    const status = ppEl('div', 'pp-gs-status');
    this.counterEl = ppEl('span', 'pp-round-counter');
    const bar = ppEl('div', 'pp-gs-progress');
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', String(this.activities.length));
    bar.setAttribute('aria-label', 'Progresso do jogo');
    this.progressBar = bar;
    this.progressFill = ppEl('div', 'pp-gs-progress__fill');
    bar.appendChild(this.progressFill);
    this.scoreEl = ppEl('span', 'pp-score-badge');
    this.starsEl = ppEl('div', 'pp-stars-badge pp-stars-badge--small');
    status.append(this.counterEl, bar, this.scoreEl, this.starsEl);

    this.stageEl.append(head, this.activityEl, this.feedbackEl, status);

    this.resultEl = ppEl('div', 'pp-gs-result');
    this.resultEl.hidden = true;

    card.append(this.stageEl, this.resultEl);
    root.append(top, card);

    this.onMount();
  }

  // Título em texto: parte menor + palavra de destaque com letras coloridas.
  // Usa cfg.titleBig quando definido; senão destaca a última palavra.
  buildLogo() {
    const title = this.cfg.title;
    const big = this.cfg.titleBig || title.split(' ').pop();
    const small = title.slice(0, title.length - big.length).trim();

    const logo = ppEl('h1', 'pp-game-logo');
    logo.setAttribute('aria-label', title);
    if (small) logo.append(ppEl('span', 'pp-game-logo__small', small));
    const bigEl = ppEl('span', 'pp-game-logo__big');
    bigEl.setAttribute('aria-hidden', 'true');
    for (const ch of big.toUpperCase()) {
      bigEl.append(ch === ' ' ? ppEl('span', 'pp-game-logo__gap') : ppEl('span', '', ch));
    }
    logo.append(bigEl);
    return logo;
  }

  // Ganchos opcionais para cada jogo
  onMount() {}
  onStart() {}
  revealAnswer() {}

  // ------------------------------------------------------------------
  // Ciclo de vida
  // ------------------------------------------------------------------
  start() {
    this.mount();
    this.clearTimers();
    this.resetState();
    this.onStart();
    this.resultEl.hidden = true;
    this.stageEl.hidden = false;
    this.renderCurrent(false);
    if (window.ppAudio && this.cfg.intro) {
      window.ppAudio.speakInstruction(this.cfg.intro);
    }
  }

  exit() {
    this.clearTimers();
    if (window.ppAudio) window.ppAudio.stopSpeech();
    if (window.ppApp) window.ppApp.showView('jogos');
  }

  // Chamado pelo roteador ao sair da tela do jogo
  pause() {
    this.clearTimers();
  }

  currentActivity() {
    return this.activities[this.index];
  }

  instructionFor(activity) {
    return (activity && activity.instruction) || this.cfg.instruction;
  }

  speakInstruction() {
    const a = this.currentActivity();
    if (!window.ppAudio) return;
    const text = this.resultEl && !this.resultEl.hidden ? this.cfg.instruction : this.instructionFor(a);
    window.ppAudio.speakInstruction(text);
  }

  renderCurrent(speak = true) {
    const activity = this.currentActivity();
    if (!activity) {
      this.finish();
      return;
    }
    this.attempts = 0;
    this.locked = false;
    this.hideFeedback();

    this.instructionEl.textContent = this.instructionFor(activity);
    this.promptEl.textContent = activity.prompt || '';
    this.hintEl.textContent = activity.hint || '';
    this.hintEl.hidden = !activity.hint;

    this.activityEl.classList.remove('is-locked', 'pp-gs-enter');
    this.activityEl.innerHTML = '';
    // Reinicia a animação de entrada da atividade
    void this.activityEl.offsetWidth;
    this.activityEl.classList.add('pp-gs-enter');

    this.renderActivity(activity, this.activityEl, this.index);
    this.updateStatus();

    if (speak) this.later(() => this.onActivityShown(activity), 350);
  }

  // Áudio automático ao abrir cada atividade (sobrescrito pelos jogos)
  onActivityShown(activity) {
    if (window.ppAudio) window.ppAudio.speakInstruction(this.instructionFor(activity));
  }

  updateStatus() {
    const total = this.activities.length;
    const shown = Math.min(this.index + 1, total);
    this.counterEl.textContent = `Atividade ${shown} de ${total}`;
    const done = this.index + (this.locked ? 1 : 0);
    this.progressFill.style.width = `${Math.round((done / total) * 100)}%`;
    this.progressBar.setAttribute('aria-valuenow', String(done));
    this.scoreEl.textContent = `${this.score} pontos`;
    const answered = this.index + (this.locked ? 1 : 0);
    const stars = answered === 0 ? 0 : window.ppProgress.starsFor(this.correct);
    window.ppComponents.renderStars(this.starsEl, stars, 3);
  }

  // ------------------------------------------------------------------
  // Validação padrão: 10 pontos de primeira, 5 após um erro.
  // Depois de três tentativas a resposta é revelada (0 ponto).
  // ------------------------------------------------------------------
  submit(isCorrect, messages = {}) {
    if (this.locked) return;
    const activity = this.currentActivity();
    window.ppProgress.recordAttempt(isCorrect);

    if (isCorrect) {
      const firstTry = this.attempts === 0;
      this.score += firstTry ? 10 : 5;
      if (firstTry) this.correct += 1;
      this.lockActivity(firstTry);
      this.showFeedback('success', messages.success || 'Muito bem! Você acertou!');
      if (window.ppAudio) {
        window.ppAudio.playSuccess();
        this.later(() => window.ppAudio.speak(messages.successSpeech || messages.success || 'Muito bem!'), 250);
      }
      return true;
    }

    this.attempts += 1;
    if (this.attempts >= this.cfg.maxAttempts) {
      this.revealAnswer(activity);
      this.lockActivity(false);
      this.showFeedback('reveal', messages.reveal || 'Vamos aprender juntos! Veja a resposta certa.');
      if (window.ppAudio) {
        window.ppAudio.playTryAgain();
        this.later(() => window.ppAudio.speak(messages.revealSpeech || messages.reveal || 'Veja a resposta certa.'), 250);
      }
      return false;
    }

    this.showFeedback('error', messages.error || 'Quase! Tente mais uma vez.');
    if (window.ppAudio) {
      window.ppAudio.playTryAgain();
      this.later(() => window.ppAudio.speak(messages.errorSpeech || messages.error || 'Tente mais uma vez!'), 250);
    }
    return false;
  }

  lockActivity(firstTryCorrect) {
    this.locked = true;
    this.activityEl.classList.add('is-locked');
    window.ppProgress.recordActivity(firstTryCorrect);
    this.updateStatus();
    const last = this.index >= this.activities.length - 1;
    this.nextBtn.innerHTML = '';
    this.nextBtn.append(document.createTextNode(last ? 'Ver resultado ' : 'Próxima atividade '));
    this.nextBtn.insertAdjacentHTML('beforeend', PP_ICONS.arrow);
    this.nextBtn.hidden = false;
    this.later(() => this.nextBtn.focus({ preventScroll: true }), 50);
  }

  showFeedback(type, text) {
    this.feedbackEl.hidden = false;
    this.feedbackEl.className = `pp-gs-feedback pp-gs-feedback--${type}`;
    this.feedbackText.textContent = text;
    this.nextBtn.hidden = type === 'error';
    // Garante que a criança veja o retorno, mesmo em telas baixas
    const box = this.feedbackEl.getBoundingClientRect();
    if (box.bottom > window.innerHeight || box.top < 0) {
      this.feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  hideFeedback() {
    this.feedbackEl.hidden = true;
    this.nextBtn.hidden = true;
  }

  next() {
    if (!this.locked) return;
    if (window.ppAudio) window.ppAudio.stopSpeech();
    this.clearTimers();
    this.index += 1;
    this.renderCurrent();
  }

  // ------------------------------------------------------------------
  // Conclusão
  // ------------------------------------------------------------------
  finish() {
    this.clearTimers();
    const total = this.activities.length;
    const { stars, isNewBest, best } = window.ppProgress.saveResult(this.cfg.id, {
      score: this.score,
      correct: this.correct
    });

    this.stageEl.hidden = true;
    this.resultEl.hidden = false;
    this.resultEl.innerHTML = '';
    this.instructionEl.textContent = this.cfg.instruction;

    const messages = {
      3: 'Incrível! Você brilhou do começo ao fim!',
      2: 'Muito bem! Você está aprendendo cada vez mais!',
      1: 'Bom trabalho! Jogue de novo para ganhar mais estrelas!'
    };

    const confetti = ppEl('div', 'pp-modal__confetti-box');
    const badge = ppEl('div', 'pp-character-badge pp-gs-result__badge');
    const badgeImg = ppEl('img');
    badgeImg.src = ppAsset(this.cfg.heroImage);
    badgeImg.alt = '';
    badge.appendChild(badgeImg);

    const title = ppEl('h2', 'pp-gs-result__title', this.cfg.resultTitle);
    const starsBox = ppEl('div', 'pp-stars-badge pp-gs-result__stars');
    window.ppComponents.renderStars(starsBox, stars, 3, true);

    const grid = ppEl('div', 'pp-result-summary-grid');
    const stat = (label, value) => {
      const box = ppEl('div', 'pp-result-stat-box');
      box.append(ppEl('span', 'pp-stat-label', label), ppEl('span', 'pp-stat-value', value));
      return box;
    };
    grid.append(
      stat('Pontuação', `${this.score} pontos`),
      stat('Acertos', `${this.correct} de ${total}`),
      stat('Recorde', `${best.bestScore} pontos`)
    );

    const message = ppEl('p', 'pp-gs-result__message', messages[stars]);
    const note = ppEl('p', 'pp-gs-result__note',
      isNewBest ? 'Novo recorde salvo nas suas conquistas!' : 'Seu melhor resultado continua guardado.');

    const actions = ppEl('div', 'pp-gs-result__actions');
    const retry = ppEl('button', 'pp-btn pp-btn--yellow-cta');
    retry.type = 'button';
    retry.innerHTML = `${PP_ICONS.retry}<span>Jogar novamente</span>`;
    retry.addEventListener('click', () => this.start());
    const back = ppEl('button', 'pp-btn pp-btn--blue');
    back.type = 'button';
    back.innerHTML = `<span>Voltar aos jogos</span>${PP_ICONS.arrow}`;
    back.addEventListener('click', () => this.exit());
    actions.append(retry, back);

    this.resultEl.append(confetti, badge, title, starsBox, grid, message, note, actions);
    window.ppComponents.spawnConfetti(confetti);

    if (window.ppAudio) {
      window.ppAudio.playVictory();
      this.later(() => {
        window.ppAudio.speak(`${this.cfg.resultTitle} Você acertou ${this.correct} de ${total} e ganhou ${stars} ${stars === 1 ? 'estrela' : 'estrelas'}! ${messages[stars]}`);
      }, 700);
    }
    this.resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

window.PPGameBase = PPGameBase;
window.ppEl = ppEl;
window.ppShuffle = ppShuffle;
window.ppShuffleDifferent = ppShuffleDifferent;
window.PP_ICONS = PP_ICONS;
