/* ==========================================================================
   PATATI PATATÁ — JOGO: CONSTRUTORES DE PALAVRAS
   Arquivo: js/games/construtoresPalavras.js
   Oficina de montagem: observar a imagem, ouvir a palavra e montar
   o nome com blocos de letras (omissões, inversões, ordem de fonemas
   e de sílabas). 10 atividades progressivas.
   ========================================================================== */

(function () {
  const IMG = 'assets/images/';
  const ACTIVITIES = [
    { word: 'SOL', syllables: ['SOL'], image: `${IMG}construtores/sol.svg` },
    { word: 'BOLA', syllables: ['BO', 'LA'], image: `${IMG}construtores/bola.svg` },
    { word: 'CASA', syllables: ['CA', 'SA'], image: `${IMG}construtores/casa.svg` },
    { word: 'MAÇÃ', syllables: ['MA', 'ÇÃ'], image: `${IMG}construtores/maca.svg` },
    { word: 'ZEBRA', syllables: ['ZE', 'BRA'], image: `${IMG}detetives/zebra.svg` },
    { word: 'CHAVE', syllables: ['CHA', 'VE'], image: `${IMG}detetives/chave.jpg` },
    { word: 'SAPATO', syllables: ['SA', 'PA', 'TO'], image: `${IMG}detetives/sapato.svg`, extras: ['B'] },
    { word: 'GIRAFA', syllables: ['GI', 'RA', 'FA'], image: `${IMG}detetives/girafa.jpg`, extras: ['J'] },
    { word: 'FOGUETE', syllables: ['FO', 'GUE', 'TE'], image: `${IMG}detetives/foguete.jpg`, extras: ['V', 'D'] },
    { word: 'BORBOLETA', syllables: ['BOR', 'BO', 'LE', 'TA'], image: `${IMG}detetives/borboleta.jpg`, extras: ['P', 'D'] }
  ].map((a) => Object.assign({
    prompt: 'Que palavra é esta?',
    hint: a.extras ? 'Cuidado: há letras a mais na mesa!' : 'Toque nas letras na ordem certa para montar a palavra.',
    instruction: 'Observe a figura, ouça a palavra e monte o nome com as letras da mesa.',
    extras: []
  }, a));

  const TILE_COLORS = ['yellow', 'orange', 'pink', 'purple', 'green', 'blue'];

  class ConstrutoresGame extends PPGameBase {
    constructor() {
      super({
        id: 'construtores',
        view: 'game-construtores',
        theme: 'construtores',
        title: 'Construtores de Palavras',
        icon: '🧱',
        subtitle: 'Monte a palavra com os blocos!',
        instruction: 'Observe a figura, ouça a palavra e monte o nome com as letras da mesa.',
        intro: 'Bem-vindo à oficina! Observe a figura, ouça a palavra e monte o nome com os blocos de letras.',
        heroImage: 'assets/images/jogos/illust_jogo3.png',
        heroAlt: 'Construtores de Palavras',
        resultTitle: 'Obra concluída!',
        activities: ACTIVITIES
      });
    }

    onActivityShown(activity) {
      if (window.ppAudio) window.ppAudio.speakWord(activity.word);
    }

    speakWord() {
      const a = this.currentActivity();
      if (a && window.ppAudio) window.ppAudio.speakWord(a.word);
    }

    renderActivity(activity, container) {
      const letters = Array.from(activity.word);
      const tiles = ppShuffleDifferent(
        letters.concat(activity.extras).map((ch, i) => ({ id: i, ch, color: TILE_COLORS[i % TILE_COLORS.length] })),
        (t) => t.ch
      );
      const slots = new Array(letters.length).fill(null);
      let selected = -1;
      let rightPositions = new Set();

      const bench = ppEl('div', 'pp-cw-bench');

      // Quadro com a figura e o botão de pronúncia
      const easel = ppEl('div', 'pp-cw-easel');
      const figure = ppEl('button', 'pp-cw-figure');
      figure.type = 'button';
      figure.title = 'Ouvir a palavra';
      figure.setAttribute('aria-label', 'Figura: ouvir a palavra');
      const img = ppEl('img');
      img.src = ppAsset(activity.image);
      img.alt = 'Figura da palavra';
      figure.appendChild(img);
      figure.addEventListener('click', () => this.speakWord());
      const listen = ppEl('button', 'pp-btn-listen-again');
      listen.type = 'button';
      listen.innerHTML = `${PP_ICONS.speaker}<span>Ouvir a palavra</span>`;
      listen.addEventListener('click', () => this.speakWord());
      easel.append(figure, listen);

      // Patati ajudante com balão de dica
      const helper = ppEl('div', 'pp-cw-helper');
      const patati = ppEl('img', 'pp-cw-helper__img');
      patati.src = ppAsset('assets/images/personagens/patati_avatar_helper.png');
      patati.alt = 'Patati, o ajudante da oficina';
      const tip = ppEl('p', 'pp-cw-helper__tip', `Esta palavra tem ${letters.length} letras. Vamos construir?`);
      helper.append(patati, tip);

      const board = ppEl('div', 'pp-cw-board');
      board.setAttribute('aria-label', 'Painel de montagem');
      const tray = ppEl('div', 'pp-cw-tray');
      tray.setAttribute('aria-label', 'Blocos de letras');
      const help = ppEl('p', 'pp-cw-help');

      const actions = ppEl('div', 'pp-gs-actions');
      const clear = ppEl('button', 'pp-btn pp-btn--soft');
      clear.type = 'button';
      clear.innerHTML = `${PP_ICONS.erase}<span>Limpar</span>`;
      clear.addEventListener('click', () => {
        slots.fill(null);
        selected = -1;
        rightPositions = new Set();
        this.clearErrorFeedback();
        draw();
      });
      const confirm = ppEl('button', 'pp-btn pp-btn--green-confirm');
      confirm.type = 'button';
      confirm.innerHTML = `${PP_ICONS.check}<span>Confirmar</span>`;
      confirm.addEventListener('click', () => check());
      actions.append(clear, confirm);

      const makeTile = (tile, cls) => {
        const el = ppEl('button', `pp-cw-tile pp-cw-tile--${tile.color} ${cls}`.trim(), tile.ch);
        el.type = 'button';
        return el;
      };

      const draw = () => {
        board.innerHTML = '';
        slots.forEach((tile, i) => {
          const slot = ppEl('button', 'pp-cw-slot');
          slot.type = 'button';
          if (tile) {
            slot.classList.add('is-filled', `pp-cw-tile--${tile.color}`);
            slot.textContent = tile.ch;
            slot.setAttribute('aria-label', `Espaço ${i + 1}: ${tile.ch}${selected === i ? ', selecionado' : ''}`);
          } else {
            slot.setAttribute('aria-label', `Espaço ${i + 1} vazio`);
          }
          if (selected === i) slot.classList.add('is-selected');
          if (rightPositions.has(i) && tile && tile.ch === letters[i]) slot.classList.add('is-right');
          slot.addEventListener('click', () => onSlot(i));
          board.appendChild(slot);
        });

        tray.innerHTML = '';
        tiles.forEach((tile) => {
          const used = slots.includes(tile);
          const el = makeTile(tile, used ? 'is-used' : '');
          el.disabled = used;
          el.setAttribute('aria-label', used ? `${tile.ch} (já usada)` : `Letra ${tile.ch}`);
          el.addEventListener('click', () => onTile(tile));
          tray.appendChild(el);
        });

        const filled = slots.every(Boolean);
        confirm.disabled = !filled;
        help.textContent = selected >= 0
          ? 'Toque em outro espaço para trocar a letra de lugar, ou toque nela de novo para tirar.'
          : 'Toque em uma letra montada para trocar de lugar ou tirar.';
      };

      const onTile = (tile) => {
        if (slots.includes(tile)) return;
        const empty = slots.indexOf(null);
        if (empty === -1) return;
        slots[empty] = tile;
        selected = -1;
        this.clearErrorFeedback();
        draw();
      };

      const onSlot = (i) => {
        if (selected === -1) {
          if (slots[i]) selected = i;
        } else if (selected === i) {
          slots[i] = null; // remove a letra e devolve à mesa
          selected = -1;
        } else {
          [slots[i], slots[selected]] = [slots[selected], slots[i]]; // troca de lugar
          selected = -1;
        }
        if (window.ppAudio) window.ppAudio.playClick();
        this.clearErrorFeedback();
        draw();
      };

      const check = () => {
        const built = slots.map((t) => (t ? t.ch : '')).join('');
        const ok = built === activity.word;
        const sorted = (s) => Array.from(s).sort().join('');
        let error = 'Ainda não está certo. Ouça a palavra de novo e confira as letras.';
        if (!ok && sorted(built) === sorted(activity.word)) {
          error = 'Você usou as letras certas, mas algumas trocaram de lugar!';
        } else if (!ok && slots.some((t) => t && activity.extras.length && !letters.includes(t.ch))) {
          error = 'Tem uma letra que não faz parte desta palavra. Procure a intrusa!';
        }
        const syllableHint = `Dica: ${activity.syllables.join(' - ')}`;
        if (!ok) {
          rightPositions = new Set(slots.map((t, i) => (t && t.ch === letters[i] ? i : -1)).filter((i) => i >= 0));
          tip.textContent = `${syllableHint}. As letras verdes já estão no lugar certo!`;
          selected = -1;
          draw();
        }
        this.submit(ok, {
          success: `Parabéns, construtor! Você montou ${activity.word}!`,
          successSpeech: `Parabéns! Você montou ${activity.word.toLowerCase()}!`,
          error,
          reveal: `A palavra é ${activity.word} (${activity.syllables.join('-')}).`,
          revealSpeech: `A palavra é ${activity.word.toLowerCase()}.`
        });
        if (ok) {
          board.classList.add('is-done');
          tip.textContent = `${activity.syllables.join(' - ')} — muito bem!`;
        }
      };

      this.revealAnswer = () => {
        const pool = tiles.slice();
        letters.forEach((ch, i) => {
          const idx = pool.findIndex((t) => t.ch === ch);
          slots[i] = pool.splice(idx, 1)[0];
        });
        selected = -1;
        rightPositions = new Set(letters.map((_, i) => i));
        draw();
        board.classList.add('is-revealed');
      };

      const workbench = ppEl('div', 'pp-cw-table');
      workbench.append(board, tray, help);
      bench.append(easel, helper);
      container.append(bench, workbench, actions);
      draw();
    }

    clearErrorFeedback() {
      if (!this.locked && this.feedbackEl.classList.contains('pp-gs-feedback--error')) this.hideFeedback();
    }
  }

  window.ppGames = window.ppGames || {};
  window.ppGames.construtores = new ConstrutoresGame();
})();
