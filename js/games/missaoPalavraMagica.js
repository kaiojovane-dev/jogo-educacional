/* ==========================================================================
   PATATI PATATÁ — JOGO: MISSÃO PALAVRA MÁGICA
   Arquivo: js/games/missaoPalavraMagica.js
   Livro mágico com 10 desafios que integram os outros jogos:
   sons, segmentação, montagem, ortografia contextual e escrita correta.
   ========================================================================== */

(function () {
  const TYPES = {
    som: {
      label: 'Magia dos Sons',
      prompt: 'Qual palavra você ouviu?',
      instruction: 'Ouça a palavra mágica e toque na palavra que você escutou.'
    },
    segmentar: {
      label: 'Magia das Frases',
      prompt: 'Qual é a frase separada corretamente?',
      instruction: 'As palavras grudaram! Escolha a frase com as palavras bem separadas.'
    },
    montar: {
      label: 'Magia das Sílabas',
      prompt: 'Monte a palavra mágica!',
      instruction: 'Ouça a palavra e toque nas sílabas na ordem certa.'
    },
    ortografia: {
      label: 'Magia das Letras',
      prompt: 'Complete a palavra da frase!',
      instruction: 'Leia a frase e escolha as letras que completam a palavra.'
    },
    correta: {
      label: 'Magia da Escrita',
      prompt: 'Qual palavra está escrita corretamente?',
      instruction: 'Ouça a palavra e toque na que está escrita corretamente.'
    }
  };

  const ACTIVITIES = [
    { type: 'som', word: 'VACA', options: ['FACA', 'VACA', 'VALA'], answer: 'VACA' },
    {
      type: 'segmentar', glued: 'amamãebeijouobebê', sentence: 'A mamãe beijou o bebê.',
      options: ['Amamãe beijou o bebê.', 'A mamãe beijou o bebê.', 'A mamãe beijouo bebê.'],
      answer: 'A mamãe beijou o bebê.'
    },
    { type: 'montar', word: 'BONECA', syllables: ['BO', 'NE', 'CA'], extras: [] },
    {
      type: 'ortografia', before: 'Plantei a semente na ', pattern: 'TE_A', after: '.', word: 'TERRA',
      options: ['R', 'RR'], answer: 'RR', rule: 'Entre vogais, o som forte do R se escreve com RR.'
    },
    { type: 'correta', word: 'BRUXA', options: ['BRUCHA', 'BRUXA', 'BURXA'], answer: 'BRUXA' },
    { type: 'som', word: 'BOLO', options: ['POLO', 'BOLA', 'BOLO'], answer: 'BOLO' },
    {
      type: 'segmentar', glued: 'osapopulounolago', sentence: 'O sapo pulou no lago.',
      options: ['O sapo pulou no lago.', 'Osapo pulou no lago.', 'O sapo pulouno lago.'],
      answer: 'O sapo pulou no lago.'
    },
    { type: 'montar', word: 'PIPOCA', syllables: ['PI', 'PO', 'CA'], extras: ['BI'] },
    {
      type: 'ortografia', before: 'A ', pattern: 'MAN_EIRA', after: ' molha o jardim.', word: 'MANGUEIRA',
      options: ['G', 'GU', 'C', 'QU'], answer: 'GU', rule: 'Antes de E e I, usamos GU para fazer o som de GUE.'
    },
    { type: 'correta', word: 'ESTRELA', options: ['ESTERLA', 'ETRELA', 'ESTRELA'], answer: 'ESTRELA' }
  ].map((a) => Object.assign({}, TYPES[a.type], a));

  class MissaoPalavraMagicaGame extends PPGameBase {
    constructor() {
      super({
        id: 'missao',
        view: 'game-missao',
        theme: 'missao',
        title: 'Missão Palavra Mágica',
        icon: '✨',
        subtitle: 'Resolva os desafios e acenda as estrelas!',
        instruction: 'Resolva cada desafio do livro mágico para acender uma estrela!',
        intro: 'Abra o livro mágico! Resolva os desafios para acender todas as estrelas da missão.',
        heroImage: 'assets/images/jogos/illust_jogo5.png',
        heroAlt: 'Missão Palavra Mágica',
        resultTitle: 'Missão cumprida!',
        activities: ACTIVITIES
      });
    }

    onMount() {
      // Constelação com uma estrela para cada desafio
      this.sky = ppEl('div', 'pp-mm-sky');
      this.sky.setAttribute('aria-hidden', 'true');
      this.skyStars = ACTIVITIES.map(() => {
        const s = ppEl('span', 'pp-mm-sky__star', '★');
        this.sky.appendChild(s);
        return s;
      });
      this.stageEl.insertBefore(this.sky, this.stageEl.firstChild);
    }

    onStart() {
      this.skyStars.forEach((s) => s.classList.remove('is-lit', 'is-dim', 'is-current'));
    }

    lightStar(firstTry) {
      const star = this.skyStars[this.index];
      if (star) star.classList.add(firstTry ? 'is-lit' : 'is-dim');
    }

    lockActivity(firstTryCorrect) {
      this.lightStar(firstTryCorrect);
      super.lockActivity(firstTryCorrect);
    }

    speakTarget(activity) {
      if (!window.ppAudio) return;
      if (activity.type === 'segmentar') window.ppAudio.speakSentence(activity.sentence);
      else if (activity.type === 'ortografia') window.ppAudio.speakSentence(`${activity.before}${activity.word.toLowerCase()}${activity.after}`);
      else window.ppAudio.speakWord(activity.word);
    }

    onActivityShown(activity) {
      if (!window.ppAudio) return;
      window.ppAudio.speakInstruction(activity.instruction, () => {
        this.later(() => this.speakTarget(activity), 250);
      });
    }

    renderActivity(activity, container) {
      this.skyStars.forEach((s, i) => s.classList.toggle('is-current', i === this.index));

      const book = ppEl('div', 'pp-mm-book');
      const left = ppEl('div', 'pp-mm-page pp-mm-page--left');
      const right = ppEl('div', 'pp-mm-page pp-mm-page--right');
      left.appendChild(ppEl('span', 'pp-mm-badge', activity.label));

      const listen = ppEl('button', 'pp-mm-listen');
      listen.type = 'button';
      listen.setAttribute('aria-label', 'Ouvir');
      listen.innerHTML = `${PP_ICONS.speaker}<span>${activity.type === 'segmentar' || activity.type === 'ortografia' ? 'Ouvir a frase' : 'Ouvir a palavra'}</span>`;
      listen.addEventListener('click', () => this.speakTarget(activity));

      const renderers = {
        som: () => this.renderChoice(activity, left, right, listen),
        correta: () => this.renderChoice(activity, left, right, listen),
        segmentar: () => this.renderSegmentar(activity, left, right, listen),
        montar: () => this.renderMontar(activity, left, right, listen),
        ortografia: () => this.renderOrtografia(activity, left, right, listen)
      };
      renderers[activity.type]();

      book.append(left, ppEl('span', 'pp-mm-spine'), right);
      container.appendChild(book);
    }

    // Botões de alternativa com validação padrão
    optionButtons(activity, right, options, onPick, messages) {
      const short = options.every((o) => o.length <= 3);
      const grid = ppEl('div', `pp-mm-options${short ? ' pp-mm-options--short' : ''}`);
      options.forEach((opt) => {
        const btn = ppEl('button', 'pp-mm-option', opt);
        btn.type = 'button';
        btn.addEventListener('click', () => {
          const ok = opt === activity.answer;
          btn.classList.add(ok ? 'is-correct' : 'is-wrong');
          if (!ok) btn.disabled = true;
          if (onPick) onPick(opt, ok);
          this.submit(ok, messages(opt));
        });
        grid.appendChild(btn);
      });
      right.appendChild(grid);
      this.revealAnswer = () => {
        grid.querySelectorAll('.pp-mm-option').forEach((b) => {
          if (b.textContent === activity.answer) b.classList.add('is-correct');
        });
        if (onPick) onPick(activity.answer, true);
      };
    }

    renderChoice(activity, left, right, listen) {
      const orb = ppEl('button', 'pp-mm-orb');
      orb.type = 'button';
      orb.setAttribute('aria-label', 'Ouvir a palavra mágica');
      orb.innerHTML = PP_ICONS.speaker;
      orb.addEventListener('click', () => this.speakTarget(activity));
      left.append(orb, listen);
      const word = activity.word.toLowerCase();
      this.optionButtons(activity, right, activity.options, null, () => ({
        success: activity.type === 'som' ? `Isso! Você ouviu ${activity.word}.` : `Perfeito! ${activity.word} está escrita certinho.`,
        successSpeech: activity.type === 'som' ? `Isso! Você ouviu ${word}.` : `Perfeito! ${word}.`,
        error: activity.type === 'som' ? 'Escute com atenção o primeiro som e tente de novo!' : 'Essa não está certa. Observe as letras com cuidado!',
        reveal: `A palavra certa é ${activity.word}.`,
        revealSpeech: `A palavra certa é ${word}.`
      }));
    }

    renderSegmentar(activity, left, right, listen) {
      left.append(ppEl('p', 'pp-mm-glued', activity.glued), listen);
      this.optionButtons(activity, right, activity.options, null, () => ({
        success: `Mágico! "${activity.sentence}"`,
        successSpeech: `Mágico! ${activity.sentence}`,
        error: 'Ainda há palavras grudadas nessa frase. Tente outra!',
        reveal: `A frase certa é: "${activity.sentence}"`
      }));
    }

    renderOrtografia(activity, left, right, listen) {
      const [pre, post] = activity.pattern.split('_');
      const phrase = ppEl('p', 'pp-mm-phrase');
      const target = ppEl('strong', 'pp-mm-target');
      const gap = ppEl('span', 'pp-mm-gap', '?');
      target.append(document.createTextNode(pre), gap, document.createTextNode(post));
      phrase.append(document.createTextNode(activity.before), target, document.createTextNode(activity.after));
      left.append(phrase, listen);
      this.optionButtons(activity, right, activity.options, (opt, ok) => {
        gap.textContent = opt;
        gap.classList.toggle('is-correct', ok);
        if (!ok) this.later(() => { if (!this.locked) gap.textContent = '?'; }, 900);
      }, (opt) => ({
        success: `Isso! ${activity.word}. ${activity.rule}`,
        successSpeech: `Isso! ${activity.word.toLowerCase()}. ${activity.rule}`,
        error: `Com ${opt} a palavra não fica certa. Tente outra vez!`,
        reveal: `A palavra é ${activity.word}. ${activity.rule}`
      }));
    }

    renderMontar(activity, left, right, listen) {
      const orb = ppEl('button', 'pp-mm-orb');
      orb.type = 'button';
      orb.setAttribute('aria-label', 'Ouvir a palavra mágica');
      orb.innerHTML = PP_ICONS.speaker;
      orb.addEventListener('click', () => this.speakTarget(activity));
      left.append(orb, listen);

      const pieces = ppShuffleDifferent(
        activity.syllables.concat(activity.extras).map((text, id) => ({ id, text })),
        (p) => p.text
      );
      let placed = [];
      const slots = activity.syllables.length;

      const line = ppEl('div', 'pp-mm-build');
      const bank = ppEl('div', 'pp-mm-bank');
      const actions = ppEl('div', 'pp-gs-actions');
      const clear = ppEl('button', 'pp-btn pp-btn--soft');
      clear.type = 'button';
      clear.innerHTML = `${PP_ICONS.erase}<span>Limpar</span>`;
      clear.addEventListener('click', () => { placed = []; draw(); });
      const confirm = ppEl('button', 'pp-btn pp-btn--green-confirm');
      confirm.type = 'button';
      confirm.innerHTML = `${PP_ICONS.check}<span>Confirmar</span>`;
      confirm.addEventListener('click', () => {
        const built = placed.map((p) => p.text).join('');
        this.submit(built === activity.word, {
          success: `Encantador! ${activity.syllables.join('-')}: ${activity.word}!`,
          successSpeech: `Encantador! ${activity.word.toLowerCase()}!`,
          error: 'As sílabas não estão na ordem certa. Ouça a palavra de novo!',
          reveal: `A palavra é ${activity.syllables.join('-')}: ${activity.word}.`,
          revealSpeech: `A palavra é ${activity.word.toLowerCase()}.`
        });
      });
      actions.append(clear, confirm);

      const draw = () => {
        line.innerHTML = '';
        for (let i = 0; i < slots; i++) {
          const p = placed[i];
          const slot = ppEl('button', `pp-mm-slot${p ? ' is-filled' : ''}`, p ? p.text : '');
          slot.type = 'button';
          slot.setAttribute('aria-label', p ? `${p.text} — remover` : `Espaço ${i + 1} vazio`);
          slot.disabled = !p;
          if (p) slot.addEventListener('click', () => { placed = placed.filter((x) => x !== p); draw(); });
          line.appendChild(slot);
        }
        bank.innerHTML = '';
        pieces.forEach((p) => {
          const used = placed.includes(p);
          const btn = ppEl('button', `pp-mm-syllable${used ? ' is-used' : ''}`, p.text);
          btn.type = 'button';
          btn.disabled = used;
          btn.addEventListener('click', () => {
            if (placed.length >= slots || placed.includes(p)) return;
            placed.push(p);
            draw();
          });
          bank.appendChild(btn);
        });
        confirm.disabled = placed.length !== slots;
      };

      this.revealAnswer = () => {
        placed = activity.syllables.map((s) => pieces.find((p) => p.text === s));
        draw();
        line.classList.add('is-revealed');
      };

      right.append(line, bank, actions);
      draw();
    }
  }

  window.ppGames = window.ppGames || {};
  window.ppGames.missao = new MissaoPalavraMagicaGame();
})();
