/* ==========================================================================
   PATATI PATATÁ — JOGO: AVENTURA DO RE G
   Arquivo: js/games/aventuraReG.js
   Trilha na floresta com 10 placas: ortografia contextual
   (R / RR, G / GU, C / QU). A cada acerto o Patati avança no caminho.
   ========================================================================== */

(function () {
  // pattern: palavra com "_" no lugar da lacuna; answer: letras corretas
  const ACTIVITIES = [
    {
      pattern: '_ATO', answer: 'R', options: ['R', 'RR'], word: 'RATO',
      context: 'O {w} é pequeno e tem um rabo comprido.',
      rule: 'No começo da palavra, o R sozinho já tem som forte: RATO.'
    },
    {
      pattern: 'ARA_A', answer: 'R', options: ['R', 'RR'], word: 'ARARA',
      context: 'A {w} colorida voa alto.',
      rule: 'Entre vogais, o R sozinho tem som fraco: A-RA-RA.'
    },
    {
      pattern: 'CA_O', answer: 'RR', options: ['R', 'RR'], word: 'CARRO',
      context: 'Vrum! O {w} anda na rua.',
      rule: 'Entre vogais, o som forte do R se escreve com RR: CARRO.'
    },
    {
      pattern: '_ATO', answer: 'G', options: ['G', 'GU'], word: 'GATO',
      context: 'O {w} dorme no sofá.',
      rule: 'Antes de A, O e U, o G sozinho já faz o som de GA: GATO.'
    },
    {
      pattern: '_ITARRA', answer: 'GU', options: ['G', 'GU'], word: 'GUITARRA',
      context: 'O músico toca {w}.',
      rule: 'Antes de E e I, usamos GU para fazer o som de GUI: GUITARRA.'
    },
    {
      pattern: '_ASA', answer: 'C', options: ['C', 'QU'], word: 'CASA',
      context: 'Eu moro em uma {w} amarela.',
      rule: 'Antes de A, O e U, o C faz o som de CA: CASA.'
    },
    {
      pattern: '_EIJO', answer: 'QU', options: ['C', 'QU'], word: 'QUEIJO',
      context: 'O ratinho adora {w}.',
      rule: 'Antes de E e I, usamos QU para fazer o som de QUE: QUEIJO.'
    },
    {
      pattern: 'FO_ETE', answer: 'GU', options: ['G', 'GU', 'C', 'QU'], word: 'FOGUETE',
      context: 'O {w} voa até a Lua.',
      rule: 'Para o som de GUE antes do E, escrevemos GU: FOGUETE.'
    },
    {
      pattern: 'ES_ILO', answer: 'QU', options: ['C', 'QU', 'G', 'GU'], word: 'ESQUILO',
      context: 'O {w} guarda nozes na árvore.',
      rule: 'Para o som de QUI antes do I, escrevemos QU: ESQUILO.'
    },
    {
      pattern: 'CACHO_O', answer: 'RR', options: ['R', 'RR', 'G', 'GU'], word: 'CACHORRO',
      context: 'O {w} late para o carteiro.',
      rule: 'Entre vogais, o som forte do R se escreve com RR: CACHORRO.'
    }
  ].map((a) => Object.assign({
    prompt: 'Complete a palavra da placa!',
    // A frase escrita mostra a lacuna; somente o áudio diz a palavra inteira
    hint: a.context.replace('{w}', a.pattern.replace('_', '__')),
    spoken: a.context.replace('{w}', a.word.toLowerCase()),
    instruction: 'Leia a frase, ouça a palavra e escolha as letras que completam a placa.'
  }, a));

  const STOPS = ACTIVITIES.length;

  class AventuraReGGame extends PPGameBase {
    constructor() {
      super({
        id: 'aventura',
        view: 'game-aventura',
        theme: 'aventura',
        title: 'Aventura do Re G',
        icon: '🗺️',
        titleBig: 'Re G',
        subtitle: 'Siga a trilha e complete as placas!',
        instruction: 'Leia a frase, ouça a palavra e escolha as letras que completam a placa.',
        intro: 'Vamos explorar a floresta! Complete as placas para seguir pela trilha.',
        heroImage: 'assets/extracted/illust_jogo4.png',
        heroAlt: 'Aventura do Re G',
        resultTitle: 'Trilha completa!',
        activities: ACTIVITIES
      });
    }

    onMount() {
      // Trilha permanente acima do painel da atividade
      this.trail = ppEl('div', 'pp-ad-trail');
      this.trail.setAttribute('aria-hidden', 'true');
      const path = ppEl('div', 'pp-ad-trail__path');
      this.trail.appendChild(path);
      this.stopEls = [];
      for (let i = 0; i < STOPS; i++) {
        const stop = ppEl('span', 'pp-ad-stop', String(i + 1));
        stop.style.left = `${this.stopX(i)}%`;
        path.appendChild(stop);
        this.stopEls.push(stop);
      }
      const flag = ppEl('span', 'pp-ad-flag');
      flag.style.left = `${this.stopX(STOPS)}%`;
      path.appendChild(flag);
      ['pp-ad-tree pp-ad-tree--1', 'pp-ad-tree pp-ad-tree--2', 'pp-ad-tree pp-ad-tree--3', 'pp-ad-bush'].forEach((c) => {
        this.trail.appendChild(ppEl('span', c));
      });
      this.walker = ppEl('img', 'pp-ad-walker');
      this.walker.src = 'assets/extracted/patati_avatar_helper.png';
      this.walker.alt = '';
      path.appendChild(this.walker);
      this.stageEl.insertBefore(this.trail, this.stageEl.firstChild);
    }

    stopX(i) {
      return 4 + (i * 88) / STOPS;
    }

    onStart() {
      this.moveWalker(0);
    }

    moveWalker(position) {
      if (!this.walker) return;
      this.walker.style.left = `${this.stopX(position)}%`;
      this.stopEls.forEach((s, i) => {
        s.classList.toggle('is-done', i < position);
        s.classList.toggle('is-current', i === position);
      });
    }

    onActivityShown(activity) {
      if (!window.ppAudio) return;
      window.ppAudio.speakSentence(activity.spoken, () => {
        this.later(() => window.ppAudio.speakWord(activity.word), 250);
      });
    }

    renderActivity(activity, container) {
      this.moveWalker(this.index);
      const [before, after] = activity.pattern.split('_');

      const scene = ppEl('div', 'pp-ad-scene');
      const sign = ppEl('div', 'pp-ad-sign');
      const board = ppEl('div', 'pp-ad-sign__board');
      const gap = ppEl('span', 'pp-ad-gap', '?');
      board.append(ppEl('span', '', before), gap, ppEl('span', '', after));
      sign.append(board, ppEl('span', 'pp-ad-sign__post'));

      const listen = ppEl('button', 'pp-btn-listen-again');
      listen.type = 'button';
      listen.innerHTML = `${PP_ICONS.speaker}<span>Ouvir a palavra</span>`;
      listen.addEventListener('click', () => window.ppAudio && window.ppAudio.speakWord(activity.word));
      scene.append(sign, listen);

      const options = ppEl('div', `pp-ad-options pp-ad-options--${activity.options.length}`);
      const fill = (letters, cls) => {
        gap.textContent = letters;
        gap.className = `pp-ad-gap ${cls}`;
      };

      activity.options.forEach((opt) => {
        const btn = ppEl('button', 'pp-ad-option', opt);
        btn.type = 'button';
        btn.setAttribute('aria-label', `Letras ${opt}`);
        btn.addEventListener('click', () => {
          const ok = opt === activity.answer;
          if (ok) {
            btn.classList.add('is-correct');
            fill(activity.answer, 'is-correct');
            this.moveWalker(this.index + 1);
          } else {
            btn.classList.add('is-wrong');
            btn.disabled = true;
            fill(opt, 'is-wrong');
            this.later(() => {
              if (!this.locked) fill('?', '');
            }, 900);
          }
          this.submit(ok, {
            success: `Isso! ${activity.word}. ${activity.rule}`,
            successSpeech: `Isso! ${activity.word.toLowerCase()}! ${activity.rule}`,
            error: `Com ${opt} a palavra não fica certa. Ouça de novo e tente outra opção!`,
            reveal: `A palavra é ${activity.word}. ${activity.rule}`
          });
        });
        options.appendChild(btn);
      });

      this.revealAnswer = () => {
        fill(activity.answer, 'is-revealed');
        options.querySelectorAll('.pp-ad-option').forEach((b) => {
          if (b.textContent === activity.answer) b.classList.add('is-correct');
        });
        this.moveWalker(this.index + 1);
      };

      container.append(scene, options);
    }
  }

  window.ppGames = window.ppGames || {};
  window.ppGames.aventura = new AventuraReGGame();
})();
