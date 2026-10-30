/* ==========================================================================
   PATATI PATATÁ — PÁGINA MINHAS CONQUISTAS
   Arquivo: js/pages/conquistas.js
   Mostra os dados reais salvos pelo sistema de progresso.
   ========================================================================== */

(function () {
  const MEDAL_SVG = (color) => `
    <svg viewBox="0 0 64 80" width="64" height="80" aria-hidden="true">
      <path d="M18 2 L30 30 L22 34 L10 6 Z" fill="#25A9E8"/>
      <path d="M46 2 L34 30 L42 34 L54 6 Z" fill="#F05B9B"/>
      <circle cx="32" cy="52" r="24" fill="${color}" stroke="#ffffff" stroke-width="4"/>
      <circle cx="32" cy="52" r="16" fill="#ffffff" opacity="0.35"/>
      <path d="M32 40 l3.8 7.7 8.5 1.2-6.1 6 1.4 8.4L32 59.3l-7.6 4 1.4-8.4-6.1-6 8.5-1.2z" fill="#ffffff"/>
    </svg>`;

  const LOCK_SVG = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z"/></svg>';

  function motivation(summary) {
    if (summary.completedGames === 0) return 'Escolha um jogo e comece a sua coleção de estrelas!';
    if (summary.completedGames === summary.totalGames && summary.totalStars === summary.maxStars) {
      return 'Uau! Você conquistou todas as estrelas. Você é um campeão da leitura!';
    }
    if (summary.completedGames === summary.totalGames) return 'Você completou todos os jogos! Jogue de novo para ganhar mais estrelas.';
    return `Muito bem! Faltam ${summary.totalGames - summary.completedGames} jogo(s) para completar a aventura.`;
  }

  class PPConquistasPage {
    constructor() {
      this.root = document.getElementById('conquistas-content');
      window.addEventListener('pp:progress', () => {
        const view = document.getElementById('view-conquistas');
        if (view && view.style.display !== 'none') this.render();
      });
    }

    render() {
      if (!this.root || !window.ppProgress) return;
      const s = window.ppProgress.getSummary();
      const percent = Math.round(((s.completedGames / s.totalGames) * 0.5 + (s.totalStars / s.maxStars) * 0.5) * 100);

      this.setText('cq-motivation', motivation(s));
      this.setText('cq-stars', `${s.totalStars} / ${s.maxStars}`);
      this.setText('cq-games', `${s.completedGames} / ${s.totalGames}`);
      this.setText('cq-activities', String(s.activitiesAnswered));
      this.setText('cq-streak', String(s.bestStreak));
      this.setText('cq-medals', `${s.unlockedAchievements} / ${s.totalAchievements}`);
      this.setText('cq-percent', `${percent}%`);
      const fill = document.getElementById('cq-progress-fill');
      if (fill) fill.style.width = `${percent}%`;
      const bar = document.getElementById('cq-progress');
      if (bar) bar.setAttribute('aria-valuenow', String(percent));

      this.renderMedals();
      this.renderGames();
    }

    setText(id, text) {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    }

    renderMedals() {
      const list = document.getElementById('cq-medal-list');
      if (!list) return;
      list.innerHTML = '';
      window.ppProgress.getAchievements().forEach((a) => {
        const item = ppEl('li', `pp-cq-medal${a.unlockedAt ? ' is-unlocked' : ''}`);
        const art = ppEl('div', 'pp-cq-medal__art');
        art.innerHTML = a.unlockedAt ? MEDAL_SVG(a.color) : MEDAL_SVG('#cbd5e1');
        if (!a.unlockedAt) {
          const lock = ppEl('span', 'pp-cq-medal__lock');
          lock.innerHTML = LOCK_SVG;
          art.appendChild(lock);
        }
        const info = ppEl('div', 'pp-cq-medal__info');
        info.append(ppEl('strong', 'pp-cq-medal__title', a.title), ppEl('span', 'pp-cq-medal__desc', a.description));
        const status = ppEl('span', 'pp-cq-medal__status',
          a.unlockedAt ? `Conquistada em ${new Date(a.unlockedAt).toLocaleDateString('pt-BR')}` : 'Bloqueada');
        info.appendChild(status);
        item.append(art, info);
        list.appendChild(item);
      });
    }

    renderGames() {
      const grid = document.getElementById('cq-game-list');
      if (!grid) return;
      grid.innerHTML = '';
      window.ppProgress.getGames().forEach((g) => {
        const card = ppEl('article', 'pp-cq-game');
        card.style.setProperty('--cq-color', g.color);
        const img = ppEl('img', 'pp-cq-game__img');
        img.src = g.image;
        img.alt = '';
        const body = ppEl('div', 'pp-cq-game__body');
        body.appendChild(ppEl('h3', 'pp-cq-game__name', g.name));
        const stars = ppEl('div', 'pp-stars-badge pp-stars-badge--small');
        window.ppComponents.renderStars(stars, g.result ? g.result.bestStars : 0, 3);
        body.appendChild(stars);
        body.appendChild(ppEl('p', 'pp-cq-game__info', g.result
          ? `Recorde: ${g.result.bestScore} pontos · ${g.result.bestCorrect} de 10 acertos`
          : 'Ainda não jogado'));
        const play = ppEl('button', 'pp-btn pp-btn--blue pp-cq-game__play', g.result ? 'Jogar de novo' : 'Jogar');
        play.type = 'button';
        play.addEventListener('click', () => window.ppApp && window.ppApp.openGame(g.id));
        body.appendChild(play);
        card.append(img, body);
        grid.appendChild(card);
      });
    }
  }

  window.ppConquistas = new PPConquistasPage();
})();
