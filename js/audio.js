/* ==========================================================================
   PATATI PATATÁ — SISTEMA DE ÁUDIO E NARRADOR
   Arquivo: js/audio.js
   Áudios locais (.wav), Web Audio API (síntese de reserva) e
   SpeechSynthesis (pt-BR) com volume geral e controle de mudo.
   ========================================================================== */

class PPAudioSystem {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.synth = window.speechSynthesis || null;
    this.ptVoice = null;
    this.muted = false;

    this.volume = 0.8;

    // Cache de efeitos sonoros locais
    this.audioCache = {
      clique: new Audio('assets/audio/clique.wav'),
      acerto: new Audio('assets/audio/acerto.wav'),
      erro: new Audio('assets/audio/erro.wav'),
      estrela: new Audio('assets/audio/estrela.wav'),
      vitoria: new Audio('assets/audio/vitoria.wav')
    };
    Object.values(this.audioCache).forEach((a) => {
      a.preload = 'auto';
    });

    // Inicializa voz pt-BR quando disponível
    if (this.synth) {
      this.initVoice();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoice();
      }
    }
  }

  readPref(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  writePref(key, value) {
    try {
      localStorage.setItem(key, String(value));
    } catch (e) { /* armazenamento indisponível */ }
  }

  // Contexto Web Audio criado somente após interação (política de autoplay)
  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.volume;
        this.master.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Prioriza vozes naturais em português do Brasil
  initVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    const ptBR = voices.filter((v) => /^pt[-_]BR$/i.test(v.lang));
    const preferred = ptBR.find((v) => /natural|online|google|francisca|maria|luciana/i.test(v.name));
    this.ptVoice = preferred || ptBR[0] || voices.find((v) => v.lang.toLowerCase().startsWith('pt')) || null;
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
    this.writePref('pp_muted', this.muted);
    if (this.muted) {
      this.stopSpeech();
      Object.values(this.audioCache).forEach((a) => a.pause());
    }
    window.dispatchEvent(new CustomEvent('pp:audio', { detail: { muted: this.muted, volume: this.volume } }));
  }

  isMuted() {
    return this.muted;
  }

  getVolume() {
    return this.volume;
  }

  setVolume(value) {
    this.volume = Math.min(1, Math.max(0, Number(value) || 0));
    this.writePref('pp_volume', this.volume);
    if (this.master) this.master.gain.value = this.volume;
    Object.values(this.audioCache).forEach((a) => {
      a.volume = this.volume;
    });
    window.dispatchEvent(new CustomEvent('pp:audio', { detail: { muted: this.muted, volume: this.volume } }));
  }

  canPlay() {
    return !this.muted && this.volume > 0;
  }

  // Toca arquivo local com reserva sintetizada pela Web Audio API
  playFileWithFallback(cacheKey, fallbackFn) {
    if (!this.canPlay()) return;
    this.initContext();

    const audio = this.audioCache[cacheKey];
    if (audio) {
      audio.volume = this.volume;
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          if (fallbackFn) fallbackFn.call(this);
        });
        return;
      }
    }
    if (fallbackFn) fallbackFn.call(this);
  }

  // Sequência curta de notas usada pelos sons de reserva
  playTones(notes, type = 'sine', peak = 0.22) {
    if (!this.ctx || !this.master) return;
    const start = this.ctx.currentTime;
    notes.forEach(({ f, at, d }) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(f, start + at);
      gain.gain.setValueAtTime(0.0001, start + at);
      gain.gain.linearRampToValueAtTime(peak, start + at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + at + d);
      osc.connect(gain);
      gain.connect(this.master);
      osc.start(start + at);
      osc.stop(start + at + d);
    });
  }

  // 1. Som de clique
  playClick() {
    this.playFileWithFallback('clique', () => {
      this.playTones([{ f: 620, at: 0, d: 0.08 }], 'sine', 0.18);
    });
  }

  // 2. Som de resposta correta
  playSuccess() {
    this.playFileWithFallback('acerto', () => {
      this.playTones([
        { f: 523.25, at: 0, d: 0.35 },
        { f: 659.25, at: 0.07, d: 0.35 },
        { f: 783.99, at: 0.14, d: 0.35 },
        { f: 1046.5, at: 0.21, d: 0.35 }
      ], 'triangle', 0.24);
    });
  }

  // 3. Som de resposta incorreta (amigável, não punitivo)
  playTryAgain() {
    this.playFileWithFallback('erro', () => {
      this.playTones([{ f: 320, at: 0, d: 0.12 }, { f: 260, at: 0.1, d: 0.16 }], 'sine', 0.2);
    });
  }

  // 4. Som de estrela conquistada
  playStar() {
    this.playFileWithFallback('estrela', () => {
      this.playTones([
        { f: 783.99, at: 0, d: 0.4 },
        { f: 987.77, at: 0.08, d: 0.4 },
        { f: 1318.5, at: 0.16, d: 0.4 }
      ], 'sine', 0.2);
    });
  }

  // 5. Som de conclusão de jogo
  playVictory() {
    this.playFileWithFallback('vitoria', () => {
      this.playTones([
        { f: 523.25, at: 0, d: 0.15 },
        { f: 523.25, at: 0.2, d: 0.15 },
        { f: 523.25, at: 0.4, d: 0.15 },
        { f: 659.25, at: 0.6, d: 0.35 },
        { f: 783.99, at: 1.0, d: 0.5 }
      ], 'triangle', 0.22);
    });
  }

  // Interrompe qualquer fala em andamento
  stopSpeech() {
    if (this.synth) this.synth.cancel();
  }

  // 6. Narração em português brasileiro (cancela a fala anterior)
  speak(text, onEnd = null, options = {}) {
    if (!text || !this.canPlay() || !this.synth) {
      if (onEnd) onEnd();
      return;
    }

    try {
      this.synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (this.ptVoice) utterance.voice = this.ptVoice;
      utterance.lang = 'pt-BR';
      utterance.pitch = options.pitch || 1.15;
      utterance.rate = options.rate || 0.92;
      utterance.volume = this.volume;

      if (onEnd) {
        utterance.onend = () => onEnd();
        // Fala interrompida por outra pronúncia não deve disparar a continuação
        utterance.onerror = (e) => {
          if (e.error !== 'interrupted' && e.error !== 'canceled') onEnd();
        };
      }
      this.synth.speak(utterance);
    } catch (e) {
      if (onEnd) onEnd();
    }
  }

  // Instruções das atividades
  speakInstruction(text, onEnd = null) {
    this.speak(text, onEnd, { rate: 0.95 });
  }

  // Pronúncia de palavra isolada, um pouco mais pausada
  speakWord(word, onEnd = null) {
    this.speak(String(word).toLowerCase(), onEnd, { rate: 0.8 });
  }

  // Pronúncia de frase completa em ritmo claro
  speakSentence(sentence, onEnd = null) {
    this.speak(sentence, onEnd, { rate: 0.85 });
  }
}

// Instância global reutilizada por toda a plataforma
window.ppAudio = new PPAudioSystem();
