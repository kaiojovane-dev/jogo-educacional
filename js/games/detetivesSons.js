/* ==========================================================================
   PATATI PATATÁ — JOGO: DETETIVES DOS SONS
   Arquivo: js/games/detetivesSons.js
   Aventura de Investigação Infantil (10 Atividades Reais e Sem Ambiguidade)
   ========================================================================== */

class DetetivesDosSonsGame {
  constructor() {
    // 10 Atividades Pedagógicas Sem Nenhuma Ambiguidade Linguística
    this.rounds = [
      {
        id: 1,
        phoneme: 'SS',
        word: 'Vassoura',
        question: 'Qual palavra está escrita corretamente?',
        subtitle: 'Observe a figura e use a lupa para encontrar a escrita certa!',
        options: ['Vassora', 'Vaxoura', 'Vassouxa', 'Vassoura'],
        correct: 'Vassoura',
        image: 'assets/extracted/vassoura.png'
      },
      {
        id: 2,
        phoneme: 'B / P',
        word: 'Borboleta',
        question: 'Qual palavra está escrita corretamente?',
        subtitle: 'Ouça o som do B inicial da borboleta!',
        options: ['Porpoleta', 'Porboleta', 'Bolboleta', 'Borboleta'],
        correct: 'Borboleta',
        image: 'assets/images/detetives/borboleta.jpg'
      },
      {
        id: 3,
        phoneme: 'T / D',
        word: 'Tesoura',
        question: 'Qual palavra está escrita corretamente?',
        subtitle: 'Atenção ao som do T e do S no meio da tesoura!',
        options: ['Desoura', 'Tezoura', 'Teçoura', 'Tesoura'],
        correct: 'Tesoura',
        image: 'assets/images/detetives/tesoura.jpg'
      },
      {
        id: 4,
        phoneme: 'G / J',
        word: 'Girafa',
        question: 'Qual palavra está escrita corretamente?',
        subtitle: 'Girafa se escreve com G ou com J? Descubra a pista!',
        options: ['Jirafa', 'Giraba', 'Girapa', 'Girafa'],
        correct: 'Girafa',
        image: 'assets/images/detetives/girafa.jpg'
      },
      {
        id: 5,
        phoneme: 'CH / X',
        word: 'Chave',
        question: 'Qual palavra está escrita corretamente?',
        subtitle: 'Ouça o som de CH da chave e encontre a correta!',
        options: ['Xave', 'Chafe', 'Xafe', 'Chave'],
        correct: 'Chave',
        image: 'assets/images/detetives/chave.jpg'
      },
      {
        id: 6,
        phoneme: 'F / V e G / GU',
        word: 'Foguete',
        question: 'Qual palavra está escrita corretamente?',
        subtitle: 'Foguete começa com F e tem som de GUE!',
        options: ['Voguete', 'Fogete', 'Vogete', 'Foguete'],
        correct: 'Foguete',
        image: 'assets/images/detetives/foguete.jpg'
      },
      {
        id: 7,
        phoneme: 'P / B e LH',
        word: 'Palhaço',
        question: 'Qual palavra está escrita corretamente?',
        subtitle: 'Atenção à escrita do nosso amigo Palhaço!',
        options: ['Balhaço', 'Palhasso', 'Balhasso', 'Palhaço'],
        correct: 'Palhaço',
        image: 'assets/images/detetives/palhaco.svg'
      },
      {
        id: 8,
        phoneme: 'S / Ç / X / Z',
        word: 'Sapato',
        question: 'Qual palavra está escrita corretamente?',
        subtitle: 'Sapato começa com qual letra? Investigue!',
        options: ['Çapato', 'Xapato', 'Zapato', 'Sapato'],
        correct: 'Sapato',
        image: 'assets/images/detetives/sapato.svg'
      },
      {
        id: 9,
        phoneme: 'Z / S e B / P',
        word: 'Zebra',
        question: 'Qual palavra está escrita corretamente?',
        subtitle: 'Ouça o som da Zebra e escolha a palavra certa!',
        options: ['Sebra', 'Zepra', 'Sepra', 'Zebra'],
        correct: 'Zebra',
        image: 'assets/images/detetives/zebra.svg'
      },
      {
        id: 10,
        phoneme: 'CH / X e T / D',
        word: 'Chocolate',
        question: 'Qual palavra está escrita corretamente?',
        subtitle: 'Última pista do mistério dos sons!',
        options: ['Xocolate', 'Chocolade', 'Xocolade', 'Chocolate'],
        correct: 'Chocolate',
        image: 'assets/images/detetives/chocolate.svg'
      }
    ];

    this.currentIndex = 0;
    this.score = 0;          // Pontuação total acumulada
    this.correctCount = 0;    // Quantidade de acertos
    this.isAnswering = false;
    this.firstAttempt = true; // Se está na primeira tentativa da rodada
  }

  // Inicializa o jogo e as 10 rodadas
  init() {
    this.currentIndex = 0;
    this.score = 0;
    this.correctCount = 0;
    this.isAnswering = false;
    this.firstAttempt = true;
    this.renderRound();

    if (window.ppAudio) {
      window.ppAudio.speak("Bem-vindo ao jogo Detetives dos Sons! Ouça, observe com a lupa e encontre a palavra certa!");
    }
  }

  getCurrentRound() {
    return this.rounds[this.currentIndex];
  }

  // Reproduz a pronúncia clara da palavra da atividade
  speakCurrentWord() {
    const round = this.getCurrentRound();
    if (round && window.ppAudio) {
      window.ppAudio.speakWord(round.word);
    }
  }

  // Reproduz o fonema de foco da atividade
  speakPhoneme() {
    const round = this.getCurrentRound();
    if (round && window.ppAudio) {
      window.ppAudio.speak(`Pista sonora: fonema ${round.phoneme}!`);
    }
  }

  // Renderiza a rodada atual
  renderRound() {
    const round = this.getCurrentRound();
    if (!round) {
      this.showResults();
      return;
    }

    this.firstAttempt = true;

    const stageEl = document.getElementById('detetives-game-stage');
    const resultEl = document.getElementById('detetives-game-result');
    if (stageEl) stageEl.style.display = 'flex';
    if (resultEl) resultEl.style.display = 'none';

    // 1. Atualiza Tag Fonética Superior
    const phonemeEl = document.getElementById('detetives-phoneme-tag');
    if (phonemeEl) phonemeEl.textContent = `Pista: ${round.phoneme}`;

    // 2. Atualiza Figura Central com Lupa de Investigação e Botão de Ouvir
    const figureEl = document.getElementById('detetives-figure-content');
    if (figureEl) {
      figureEl.innerHTML = `
        <div class="pp-detetive-inspect-wrap">
          <img src="${round.image}" alt="${round.word}" class="pp-detetive-inspect-img" />
          <span class="pp-inspect-glass-badge" title="Lupa do Detetive">🔍</span>
        </div>
      `;
    }

    // 3. Atualiza Textos da Pergunta e Subtítulo
    const questionEl = document.getElementById('detetives-question-text');
    if (questionEl) questionEl.textContent = round.question;

    const subEl = document.getElementById('detetives-sub-text');
    if (subEl) subEl.textContent = round.subtitle;

    // 4. Atualiza Indicadores de Progresso
    const roundCounter = document.getElementById('detetives-round-counter');
    if (roundCounter) {
      roundCounter.textContent = `Pista ${this.currentIndex + 1} de ${this.rounds.length}`;
    }

    const progressFill = document.getElementById('detetives-progress-fill');
    if (progressFill) {
      const pct = Math.round(((this.currentIndex) / this.rounds.length) * 100);
      progressFill.style.width = `${pct}%`;
    }

    const scoreBadge = document.getElementById('detetives-score-badge');
    if (scoreBadge) {
      scoreBadge.textContent = `${this.score} Pontos`;
    }

    const starsCounter = document.getElementById('detetives-stars-box');
    if (starsCounter && window.ppComponents) {
      // Estrelas parciais pela regra única da plataforma (acertos de primeira)
      const starCount = this.currentIndex === 0 ? 0 : window.ppProgress.starsFor(this.correctCount);
      window.ppComponents.renderStars(starsCounter, starCount, 3);
    }

    // 5. Renderiza as 4 Alternativas
    const optionsGrid = document.getElementById('detetives-options-grid');
    if (optionsGrid) {
      optionsGrid.innerHTML = '';
      round.options.forEach((optText) => {
        const btn = document.createElement('button');
        btn.className = 'pp-detetive-option-btn';
        btn.textContent = optText;
        btn.setAttribute('aria-label', optText);
        btn.addEventListener('click', () => this.handleOptionClick(btn, optText));
        optionsGrid.appendChild(btn);
      });
    }

    this.isAnswering = false;

    // Pronúncia da palavra após pequeno intervalo para o jogador associar com a imagem
    setTimeout(() => {
      this.speakCurrentWord();
    }, 400);
  }

  // Processa a alternativa escolhida pelo jogador
  handleOptionClick(btn, selectedWord) {
    if (this.isAnswering) return;
    this.isAnswering = true;

    const round = this.getCurrentRound();
    const isCorrect = selectedWord === round.correct;

    if (isCorrect) {
      // Pontuação: 10 pontos de primeira, 5 se teve erro anterior
      const roundPoints = this.firstAttempt ? 10 : 5;
      this.score += roundPoints;
      if (this.firstAttempt) this.correctCount++;
      window.ppProgress.recordAttempt(true);
      window.ppProgress.recordActivity(this.firstAttempt);

      btn.classList.add('is-correct');

      // Atualiza badge de pontuação imediatamente
      const scoreBadge = document.getElementById('detetives-score-badge');
      if (scoreBadge) {
        scoreBadge.textContent = `${this.score} Pontos`;
      }

      // Feedback sonoro e falado
      if (window.ppAudio) {
        window.ppAudio.playSuccess();
        setTimeout(() => {
          window.ppAudio.speak(`Muito bem! A palavra é ${round.correct}!`);
        }, 150);
      }

      // Avança para a próxima atividade após a celebração
      setTimeout(() => {
        this.currentIndex++;
        this.renderRound();
      }, 1500);

    } else {
      // Feedback de erro não-punitivo
      this.firstAttempt = false;
      window.ppProgress.recordAttempt(false);
      btn.classList.add('is-wrong');

      if (window.ppAudio) {
        window.ppAudio.playTryAgain();
        setTimeout(() => {
          window.ppAudio.speak("Atenção, detetive! Tente mais uma vez!");
        }, 150);
      }

      // Permite nova tentativa rapidamente
      setTimeout(() => {
        btn.classList.remove('is-wrong');
        this.isAnswering = false;
      }, 850);
    }
  }

  // Apresenta a Tela de Conclusão da Investigação
  showResults() {
    const stageEl = document.getElementById('detetives-game-stage');
    const resultEl = document.getElementById('detetives-game-result');
    if (stageEl) stageEl.style.display = 'none';
    if (resultEl) resultEl.style.display = 'flex';

    // Barra de progresso preenchida em 100%
    const progressFill = document.getElementById('detetives-progress-fill');
    if (progressFill) progressFill.style.width = '100%';

    // Salva o resultado (mantém o recorde) e calcula as estrelas pela regra única
    const { stars: starsEarned } = window.ppProgress.saveResult('detetives', {
      score: this.score,
      correct: this.correctCount
    });

    // Mensagem positiva e encorajadora
    let praiseMessage = "Incrível! Você é um verdadeiro Detetive dos Sons!";
    if (starsEarned === 1) {
      praiseMessage = "Bom trabalho! Continue investigando para encontrar todas as pistas!";
    } else if (starsEarned === 2) {
      praiseMessage = "Muito bem, detetive! Seu ouvido está cada vez mais afiado!";
    }

    // Exibe Pontuação e Acertos
    const scoreValEl = document.getElementById('detetives-final-score');
    if (scoreValEl) {
      scoreValEl.textContent = `${this.score} Pontos`;
    }

    const hitsValEl = document.getElementById('detetives-final-hits');
    if (hitsValEl) {
      hitsValEl.textContent = `${this.correctCount} de ${this.rounds.length}`;
    }

    const scoreDescEl = document.getElementById('detetives-final-desc');
    if (scoreDescEl) {
      scoreDescEl.textContent = praiseMessage;
    }

    // Estrelas
    const starsBox = document.getElementById('detetives-final-stars');
    if (starsBox && window.ppComponents) {
      window.ppComponents.renderStars(starsBox, starsEarned, 3, true);
    }

    // Efeito de confetes no painel
    const confettiBox = document.getElementById('detetives-confetti-container');
    if (confettiBox && window.ppComponents) {
      window.ppComponents.spawnConfetti(confettiBox);
    }

    // Fanfarra de vitória e fala
    if (window.ppAudio) {
      window.ppAudio.playVictory();
      setTimeout(() => {
        window.ppAudio.speak(`Parabéns, detetive! Você fez ${this.score} pontos e conquistou ${starsEarned} estrelas!`);
      }, 400);
    }
  }
}

// Instância global
window.ppDetetivesGame = new DetetivesDosSonsGame();
