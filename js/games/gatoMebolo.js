/* ==========================================================================
   PATATI PATATÁ — JOGO: O GATO MEBOLO
   Arquivo: js/games/gatoMebolo.js
   Consciência lexical: organizar frases, separar palavras aglutinadas
   e identificar palavras grudadas (10 atividades progressivas).
   ========================================================================== */

(function () {
  const TEXT = {
    ordenar: {
      prompt: 'Monte a frase do Mebolo!',
      hint: 'Ouça a frase e toque nas palavras na ordem certa.',
      instruction: 'Ouça a frase e toque nas palavras na ordem certa.',
      balloon: 'Miau! Ouça a minha frase e me ajude a organizar as palavras.'
    },
    separar: {
      prompt: 'Separe as palavras!',
      hint: 'As palavras ficaram grudadas. Toque nos espaços entre as letras para separar.',
      instruction: 'As palavras ficaram grudadas! Toque entre as letras para separar cada palavra.',
      balloon: 'Miau! Minhas palavras grudaram. Você me ajuda a separar?'
    },
    encontrar: {
      prompt: 'Encontre as palavras grudadas!',
      hint: 'Duas palavras ficaram juntas. Toque no bloco errado.',
      instruction: 'Leia a frase e toque no bloco em que duas palavras ficaram grudadas.',
      balloon: 'Miau! Tem duas palavras grudadas nesta frase. Você encontra?'
    }
  };

  // Atividades em ordem crescente de dificuldade
  const ACTIVITIES = [
    { type: 'ordenar', words: ['O', 'gato', 'bebe', 'leite.'] },
    { type: 'ordenar', words: ['A', 'bola', 'é', 'azul.'] },
    { type: 'separar', words: ['O', 'gato', 'bebe.'] },
    { type: 'ordenar', words: ['Mebolo', 'gosta', 'de', 'peixe.'] },
    { type: 'separar', words: ['Eu', 'amo', 'ler.'] },
    { type: 'encontrar', words: ['A', 'menina', 'comeuo', 'bolo.'], wrongIndex: 2, fix: ['comeu', 'o'] },
    { type: 'separar', words: ['O', 'Mebolo', 'é', 'um', 'gatinho.'] },
    { type: 'encontrar', words: ['Vamos', 'brincarno', 'parque.'], wrongIndex: 1, fix: ['brincar', 'no'] },
    { type: 'ordenar', words: ['O', 'gatinho', 'dorme', 'na', 'caixa', 'amarela.'] },
    { type: 'separar', words: ['O', 'gatinho', 'brinca', 'com', 'a', 'bola', 'vermelha.'] }
  ].map((a) => {
    const sentence = a.type === 'encontrar'
      ? a.words.map((w, i) => (i === a.wrongIndex ? a.fix.join(' ') : w)).join(' ')
      : a.words.join(' ');
    return Object.assign({}, TEXT[a.type], a, { sentence });
  });

  const clean = (w) => w.replace(/[.,!?]/g, '').toLowerCase();

  class GatoMeboloGame extends PPGameBase {
    constructor() {
      super({
        id: 'mebolo',
        view: 'game-mebolo',
        theme: 'mebolo',
        title: 'O Gato Mebolo',
        icon: '🐱',
        subtitle: 'Separe e organize as palavras!',
        instruction: 'Ajude o Mebolo a separar e organizar as palavras!',
        intro: 'Oi! Eu sou o gato Mebolo! Vamos separar e organizar palavras juntos?',
        heroImage: 'assets/images/jogos/illust_jogo2.png',
        heroAlt: 'O Gato Mebolo',
        resultTitle: 'Miau! Você conseguiu!',
        activities: ACTIVITIES
      });
    }

    onActivityShown(activity) {
      if (!window.ppAudio) return;
      window.ppAudio.speakInstruction(activity.instruction, () => {
        this.later(() => window.ppAudio.speakSentence(activity.sentence), 200);
      });
    }

    speakSentence() {
      const a = this.currentActivity();
      if (a && window.ppAudio) window.ppAudio.speakSentence(a.sentence);
    }

    renderActivity(activity, container) {
      // Mebolo com balão de diálogo e botão de ouvir a frase
      const scene = ppEl('div', 'pp-mb-scene');
      const cat = ppEl('button', 'pp-mb-cat');
      cat.type = 'button';
      cat.title = 'Ouvir a frase';
      cat.setAttribute('aria-label', 'Mebolo: ouvir a frase');
      cat.setAttribute('data-pp-click', '');
      const catImg = ppEl('img');
      catImg.src = 'assets/images/personagens/mebolo.svg';
      catImg.alt = '';
      cat.appendChild(catImg);
      cat.addEventListener('click', () => {
        cat.classList.remove('is-talking');
        void cat.offsetWidth;
        cat.classList.add('is-talking');
        this.speakSentence();
      });

      const balloon = ppEl('div', 'pp-mb-balloon');
      balloon.appendChild(ppEl('p', 'pp-mb-balloon__text', activity.balloon));
      const listen = ppEl('button', 'pp-btn-listen-again');
      listen.type = 'button';
      listen.innerHTML = `${PP_ICONS.speaker}<span>Ouvir a frase</span>`;
      listen.addEventListener('click', () => this.speakSentence());
      balloon.appendChild(listen);
      scene.append(cat, balloon);
      container.appendChild(scene);

      const area = ppEl('div', 'pp-mb-area');
      container.appendChild(area);
      if (activity.type === 'ordenar') this.renderOrdenar(activity, area);
      else if (activity.type === 'separar') this.renderSeparar(activity, area);
      else this.renderEncontrar(activity, area);
    }

    makeActions(onClear, onConfirm) {
      const actions = ppEl('div', 'pp-gs-actions');
      const clear = ppEl('button', 'pp-btn pp-btn--soft');
      clear.type = 'button';
      clear.innerHTML = `${PP_ICONS.erase}<span>Limpar</span>`;
      clear.addEventListener('click', onClear);
      const confirm = ppEl('button', 'pp-btn pp-btn--green-confirm');
      confirm.type = 'button';
      confirm.innerHTML = `${PP_ICONS.check}<span>Confirmar</span>`;
      confirm.addEventListener('click', onConfirm);
      actions.append(clear, confirm);
      return { actions, confirm };
    }

    // ----------------------------------------------------------------
    // Tipo 1 — Organizar as palavras da frase
    // ----------------------------------------------------------------
    renderOrdenar(activity, area) {
      const pieces = activity.words.map((text, id) => ({ id, text }));
      const bankOrder = ppShuffleDifferent(pieces, (p) => p.text);
      let placed = [];

      const line = ppEl('div', 'pp-mb-line');
      line.setAttribute('aria-label', 'Frase montada');
      const bank = ppEl('div', 'pp-mb-bank');
      bank.setAttribute('aria-label', 'Palavras disponíveis');
      const { actions, confirm } = this.makeActions(
        () => { placed = []; this.clearFeedbackIfError(); draw(); },
        () => {
          const ok = placed.map((p) => p.text).join(' ') === activity.words.join(' ');
          this.submit(ok, {
            success: `Isso! "${activity.sentence}"`,
            error: 'A ordem ainda não está certa. Ouça a frase de novo!',
            reveal: `A frase certa é: "${activity.sentence}"`
          });
        }
      );

      const draw = () => {
        line.innerHTML = '';
        bank.innerHTML = '';
        if (!placed.length) line.appendChild(ppEl('span', 'pp-mb-line__placeholder', 'Toque nas palavras abaixo'));
        placed.forEach((p) => {
          const chip = this.wordChip(p.text, 'is-placed');
          chip.title = 'Tocar para remover';
          chip.setAttribute('aria-label', `${p.text} — remover`);
          chip.addEventListener('click', () => {
            placed = placed.filter((x) => x !== p);
            this.clearFeedbackIfError();
            draw();
          });
          line.appendChild(chip);
        });
        bankOrder.forEach((p) => {
          const used = placed.includes(p);
          const chip = this.wordChip(p.text, used ? 'is-used' : '');
          chip.disabled = used;
          chip.addEventListener('click', () => {
            if (placed.includes(p)) return;
            placed.push(p);
            if (window.ppAudio) window.ppAudio.speakWord(clean(p.text));
            this.clearFeedbackIfError();
            draw();
          });
          bank.appendChild(chip);
        });
        confirm.disabled = placed.length !== pieces.length;
      };

      this.revealAnswer = () => {
        placed = pieces.slice();
        draw();
        line.classList.add('is-revealed');
      };

      area.append(line, bank, actions);
      draw();
    }

    // ----------------------------------------------------------------
    // Tipo 2 — Separar palavras aglutinadas com a tesourinha
    // ----------------------------------------------------------------
    renderSeparar(activity, area) {
      const parts = activity.words.map(clean);
      const letters = Array.from(parts.join(''));
      const expected = new Set();
      let acc = 0;
      parts.slice(0, -1).forEach((p) => {
        acc += Array.from(p).length;
        expected.add(acc);
      });
      const cuts = new Set();

      const strip = ppEl('div', 'pp-mb-letters');
      strip.setAttribute('aria-label', `Letras grudadas: ${letters.join('')}`);
      const preview = ppEl('div', 'pp-mb-preview');
      const { actions, confirm } = this.makeActions(
        () => { cuts.clear(); this.clearFeedbackIfError(); draw(); },
        () => {
          const ok = cuts.size === expected.size && [...expected].every((c) => cuts.has(c));
          this.submit(ok, {
            success: `Muito bem! "${activity.sentence}"`,
            error: 'Quase! Confira onde cada palavra começa e termina.',
            reveal: `As palavras são: "${activity.sentence}"`
          });
        }
      );

      const draw = () => {
        strip.innerHTML = '';
        letters.forEach((ch, i) => {
          const group = ppEl('span', 'pp-mb-letter-group');
          group.appendChild(ppEl('span', 'pp-mb-letter', ch));
          if (i < letters.length - 1) {
            const pos = i + 1;
            const gap = ppEl('button', `pp-mb-gap${cuts.has(pos) ? ' is-cut' : ''}`);
            gap.type = 'button';
            gap.setAttribute('aria-pressed', String(cuts.has(pos)));
            gap.setAttribute('aria-label', cuts.has(pos)
              ? `Juntar ${letters[i]} e ${letters[pos]}`
              : `Separar entre ${letters[i]} e ${letters[pos]}`);
            gap.addEventListener('click', () => {
              if (cuts.has(pos)) cuts.delete(pos);
              else cuts.add(pos);
              if (window.ppAudio) window.ppAudio.playClick();
              this.clearFeedbackIfError();
              draw();
            });
            group.appendChild(gap);
          }
          strip.appendChild(group);
        });

        // Prévia das palavras formadas
        preview.innerHTML = '';
        preview.appendChild(ppEl('span', 'pp-mb-preview__label', cuts.size ? 'Suas palavras:' : 'Ainda não há separações.'));
        if (cuts.size) {
          const sorted = [...cuts].sort((a, b) => a - b);
          let start = 0;
          [...sorted, letters.length].forEach((end) => {
            const word = letters.slice(start, end).join('');
            const chip = this.wordChip(word, 'is-preview');
            chip.addEventListener('click', () => window.ppAudio && window.ppAudio.speakWord(word));
            preview.appendChild(chip);
            start = end;
          });
        }
        confirm.disabled = cuts.size === 0;
      };

      this.revealAnswer = () => {
        cuts.clear();
        expected.forEach((c) => cuts.add(c));
        draw();
        strip.classList.add('is-revealed');
      };

      area.append(strip, preview, actions);
      draw();
    }

    // ----------------------------------------------------------------
    // Tipo 3 — Identificar e corrigir a palavra aglutinada
    // ----------------------------------------------------------------
    renderEncontrar(activity, area) {
      const line = ppEl('div', 'pp-mb-line pp-mb-line--find');
      const chips = activity.words.map((text, i) => {
        const chip = this.wordChip(text, 'is-findable');
        chip.addEventListener('click', () => {
          const ok = i === activity.wrongIndex;
          if (ok) showFix();
          else {
            chip.classList.add('is-wrong');
            this.later(() => chip.classList.remove('is-wrong'), 600);
          }
          this.submit(ok, {
            success: `Você achou! O certo é "${activity.fix.join(' ')}": ${activity.sentence}`,
            successSpeech: `Você achou! O certo é ${activity.fix.join(' ')}. ${activity.sentence}`,
            error: `"${text}" está escrito certinho. Procure duas palavras juntas!`,
            reveal: `As palavras grudadas eram "${activity.words[activity.wrongIndex].replace(/[.,!?]/g, '')}". O certo é "${activity.fix.join(' ')}".`
          });
        });
        line.appendChild(chip);
        return chip;
      });

      const corrected = ppEl('div', 'pp-mb-corrected');
      corrected.hidden = true;

      const showFix = () => {
        const target = chips[activity.wrongIndex];
        target.classList.add('is-found');
        corrected.hidden = false;
        corrected.innerHTML = '';
        corrected.appendChild(ppEl('span', 'pp-mb-preview__label', 'Frase corrigida:'));
        activity.sentence.split(' ').forEach((w) => corrected.appendChild(this.wordChip(w, 'is-preview')));
      };
      this.revealAnswer = showFix;

      area.append(line, corrected);
    }

    wordChip(text, extra = '') {
      const chip = ppEl('button', `pp-word-chip ${extra}`.trim(), text);
      chip.type = 'button';
      return chip;
    }

    clearFeedbackIfError() {
      if (!this.locked && this.feedbackEl.classList.contains('pp-gs-feedback--error')) this.hideFeedback();
    }
  }

  window.ppGames = window.ppGames || {};
  window.ppGames.mebolo = new GatoMeboloGame();
})();
