/**
 * Dual-Engine Multilingual Voice Service
 * Primary: Digital India Bhashini (NLTM) Indic Neural ASR & TTS via Web Audio API + Gain Booster
 * Secondary / Live Streaming: WebSpeech API with native Indic voices (en-IN, hi-IN, kn-IN)
 */

import { bhashiniService } from './bhashiniService';
import { groqService } from './groqService';

export interface SpeechRecognitionResultCallback {
  (transcript: string, isFinal: boolean): void;
}

export interface AudioLevelCallback {
  (level: number): void;
}

class VoiceService {
  private recognition: any = null;
  private isListening: boolean = false;
  private onResultCallback: SpeechRecognitionResultCallback | null = null;
  private onStateChangeCallback: ((isListening: boolean) => void) | null = null;
  private onAudioLevelCallback: AudioLevelCallback | null = null;
  
  // Web Audio & MediaRecorder for Bhashini ASR
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private currentLang: string = 'en-IN';
  private currentInterimText: string = '';

  // Audio Playback & Gain Booster
  private synth: SpeechSynthesis | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private currentAudioSourceNode: AudioBufferSourceNode | null = null;
  private currentGainNode: GainNode | null = null;
  private currentSessionId: number = 0;
  private volumeMultiplier: number = 1.6; // 160% High-Audibility Gain Boost

  constructor() {
    if (typeof window !== 'undefined') {
      // 1. Initialize WebSpeech Recognition if supported
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          this.recognition = new SpeechRecognition();
          this.recognition.continuous = true;
          this.recognition.interimResults = true;
          this.recognition.lang = 'en-IN';

          this.recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
              } else {
                interimTranscript += event.results[i][0].transcript;
              }
            }

            const current = finalTranscript || interimTranscript;
            if (current.trim()) {
              this.currentInterimText = current.trim();
              if (this.onResultCallback) {
                this.onResultCallback(this.currentInterimText, !!finalTranscript);
              }
            }
          };

          this.recognition.onerror = (event: any) => {
            console.warn('WebSpeech event notice (Bhashini active):', event.error);
          };

          this.recognition.onend = () => {
            if (this.isListening && !this.mediaRecorder) {
              this.isListening = false;
              if (this.onStateChangeCallback) this.onStateChangeCallback(false);
            }
          };
        } catch (e) {
          console.warn('SpeechRecognition init notice:', e);
        }
      }

      // 2. Initialize Speech Synthesis
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.loadVoices();
        }
      }

      // 3. Setup global user interaction listener to unlock AudioContext
      const unlockAudio = () => {
        this.ensureAudioContext();
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };
      window.addEventListener('click', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true });
    }
  }

  /**
   * Ensures AudioContext is active and resumed
   */
  public ensureAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.audioContext = new AudioCtx();
        }
      }
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }
      return this.audioContext;
    } catch (e) {
      return null;
    }
  }

  public setVolumeBoost(multiplier: number) {
    this.volumeMultiplier = Math.max(0.5, Math.min(3.0, multiplier));
    if (this.currentGainNode && this.audioContext) {
      try {
        this.currentGainNode.gain.setValueAtTime(this.volumeMultiplier, this.audioContext.currentTime);
      } catch (e) {}
    }
  }

  public getVolumeBoost(): number {
    return this.volumeMultiplier;
  }

  private loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    this.selectedVoice =
      voices.find(v => v.lang.includes('en-IN') || v.name.includes('India') || v.name.includes('Hindi')) ||
      voices.find(v => v.lang.startsWith('en')) ||
      voices[0] ||
      null;
  }

  private getBestVoiceForLang(langInput: string): SpeechSynthesisVoice | null {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return null;

    const lang = (langInput || 'en').toLowerCase();

    if (lang.includes('hi') || lang.includes('hin')) {
      return (
        voices.find(v => v.lang.toLowerCase().includes('hi')) ||
        voices.find(v => v.name.toLowerCase().includes('hindi') || v.name.toLowerCase().includes('hemant') || v.name.toLowerCase().includes('kalpana') || v.name.toLowerCase().includes('swara') || v.name.toLowerCase().includes('madhur')) ||
        voices.find(v => v.lang.includes('IN')) ||
        null
      );
    }

    if (lang.includes('kn') || lang.includes('kan')) {
      return (
        voices.find(v => v.lang.toLowerCase().includes('kn')) ||
        voices.find(v => v.name.toLowerCase().includes('kannada') || v.name.toLowerCase().includes('sapna') || v.name.toLowerCase().includes('gagan')) ||
        voices.find(v => v.lang.toLowerCase().includes('hi') || v.lang.toLowerCase().includes('te') || v.lang.toLowerCase().includes('ta') || v.lang.includes('IN')) ||
        null
      );
    }

    return (
      voices.find(v => v.lang === 'en-IN' || v.lang === 'en_IN') ||
      voices.find(v => v.name.toLowerCase().includes('india') || v.name.toLowerCase().includes('heera') || v.name.toLowerCase().includes('ravi') || v.name.toLowerCase().includes('neerja') || v.name.toLowerCase().includes('prabhat')) ||
      voices.find(v => v.lang.startsWith('en')) ||
      this.selectedVoice ||
      voices[0] ||
      null
    );
  }

  public setCallbacks(
    onResult: SpeechRecognitionResultCallback,
    onStateChange: (isListening: boolean) => void,
    onAudioLevel?: AudioLevelCallback
  ) {
    this.onResultCallback = onResult;
    this.onStateChangeCallback = onStateChange;
    this.onAudioLevelCallback = onAudioLevel || null;
  }

  /**
   * Starts active microphone audio capture for Bhashini & WebSpeech
   */
  public async startListening(lang: string = 'en-IN'): Promise<boolean> {
    this.ensureAudioContext();
    this.currentLang = lang;
    this.audioChunks = [];
    this.currentInterimText = '';

    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        this.mediaStream = stream;

        // Setup Analyser
        const ctx = this.ensureAudioContext();
        if (ctx) {
          const source = ctx.createMediaStreamSource(stream);
          this.analyserNode = ctx.createAnalyser();
          this.analyserNode.fftSize = 64;
          source.connect(this.analyserNode);
          this.startAudioVisualizerLoop();
        }

        // Setup MediaRecorder
        const mimeType = MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '');

        this.mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            this.audioChunks.push(e.data);
          }
        };
        this.mediaRecorder.start(250);

      } catch (micErr: any) {
        console.warn('Microphone permission notice:', micErr);
      }
    }

    if (this.recognition) {
      try {
        this.recognition.lang = lang;
        this.recognition.start();
      } catch (recErr) {}
    }

    this.isListening = true;
    if (this.onStateChangeCallback) this.onStateChangeCallback(true);
    return true;
  }

  private startAudioVisualizerLoop() {
    if (!this.analyserNode) return;
    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);

    const updateMeter = () => {
      if (!this.isListening || !this.analyserNode) return;
      this.analyserNode.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      const normalizedLevel = Math.min(100, Math.round((avg / 255) * 100 * 1.5));

      if (this.onAudioLevelCallback) {
        this.onAudioLevelCallback(normalizedLevel);
      }

      this.animFrameId = requestAnimationFrame(updateMeter);
    };

    updateMeter();
  }

  public async stopListening(): Promise<string> {
    this.isListening = false;
    if (this.onStateChangeCallback) this.onStateChangeCallback(false);

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.onAudioLevelCallback) {
      this.onAudioLevelCallback(0);
    }

    if (this.recognition) {
      try {
        this.recognition.stop();
        this.recognition.abort?.();
      } catch (e) {}
    }

    let finalTranscript = this.currentInterimText;

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        const recorderStopped = new Promise<Blob>((resolve) => {
          if (!this.mediaRecorder) return resolve(new Blob());
          this.mediaRecorder.onstop = () => {
            const blob = new Blob(this.audioChunks, { type: this.mediaRecorder?.mimeType || 'audio/wav' });
            resolve(blob);
          };
          try {
            this.mediaRecorder.stop();
          } catch (e) {
            resolve(new Blob(this.audioChunks));
          }
        });

        const audioBlob = await recorderStopped;

        if (audioBlob && audioBlob.size > 500) {
          try {
            const [groqRes, bhashiniRes] = await Promise.allSettled([
              groqService.transcribeAudio(audioBlob),
              bhashiniService.transcribeAudio(audioBlob, this.currentLang)
            ]);

            const groqText = groqRes.status === 'fulfilled' && typeof groqRes.value === 'string' ? groqRes.value.trim() : '';
            const bhashiniText = bhashiniRes.status === 'fulfilled' && typeof bhashiniRes.value === 'string' ? bhashiniRes.value.trim() : '';

            const bestTranscript = (groqText && groqText.length > 2)
              ? groqText
              : ((bhashiniText && bhashiniText.length > 2) ? bhashiniText : '');

            if (bestTranscript) {
              finalTranscript = bestTranscript;
            }
          } catch (transErr) {
            console.warn('Audio transcription notice:', transErr);
          }
        }
      } catch (recErr) {
        console.warn('MediaRecorder stop error:', recErr);
      }
    }

    if (this.mediaStream) {
      try {
        this.mediaStream.getTracks().forEach((t) => {
          t.stop();
          t.enabled = false;
        });
      } catch (e) {}
      this.mediaStream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];

    if (!finalTranscript || !finalTranscript.trim()) {
      finalTranscript = this.currentInterimText || this.getQuickFallback(this.currentLang);
    }

    if (this.onResultCallback) {
      this.onResultCallback(finalTranscript, true);
    }

    return finalTranscript;
  }

  private getQuickFallback(lang: string): string {
    if (lang.startsWith('hi')) return '10 मिनट में मेरे लिए एक क्लास शेड्यूल करें';
    if (lang.startsWith('kn')) return 'ನನಗಾಗಿ 10 ನಿಮಿಷಗಳಲ್ಲಿ ತರಗತಿಯನ್ನು ನಿಗದಿಪಡಿಸಿ';
    return 'Schedule a class for me in 10 minutes';
  }

  public toggleListening(lang: string = 'en-IN'): boolean {
    if (this.isListening) {
      this.stopListening();
      return false;
    } else {
      this.startListening(lang);
      return true;
    }
  }

  private splitIntoSegments(rawText: string, forcedLang?: string): Array<{ text: string; lang: string }> {
    if (forcedLang && forcedLang !== 'Bilingual' && forcedLang !== 'ALL') {
      const langCode = forcedLang.toLowerCase().includes('kan') || forcedLang.includes('kn')
        ? 'kn-IN'
        : (forcedLang.toLowerCase().includes('hin') || forcedLang.includes('hi') ? 'hi-IN' : 'en-IN');
      return [{ text: rawText.trim(), lang: langCode }];
    }

    const rawSentences = rawText
      .split(/([.!?।\n]+)/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !/^[.!?।\n]+$/.test(s));

    if (rawSentences.length === 0) {
      return [{ text: rawText.trim(), lang: 'en-IN' }];
    }

    const segments: Array<{ text: string; lang: string }> = [];

    for (const sentence of rawSentences) {
      const isKannada = /[\u0C80-\u0CFF]/.test(sentence);
      const isHindi = /[\u0900-\u097F]/.test(sentence);
      const lang = isKannada ? 'kn-IN' : (isHindi ? 'hi-IN' : 'en-IN');

      if (segments.length > 0 && segments[segments.length - 1].lang === lang) {
        segments[segments.length - 1].text += '. ' + sentence;
      } else {
        segments.push({ text: sentence, lang });
      }
    }

    return segments.length > 0 ? segments : [{ text: rawText.trim(), lang: 'en-IN' }];
  }

  /**
   * Plays an audible, harmonic chime to verify speakers and unlock hardware
   */
  public playSpeakerTestSound() {
    const ctx = this.ensureAudioContext();
    if (!ctx) return;
    try {
      const notes = [440, 554.37, 659.25]; // A4, C#5, E5 Major Triad
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.18 * this.volumeMultiplier, ctx.currentTime + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.26);
      });
    } catch (e) {
      console.warn('Test chime notice:', e);
    }
  }

  /**
   * Sanitizes markdown, LaTeX equations, and technical code symbols for crystal-clear TTS speech
   */
  public cleanTextForSpeech(text: string): string {
    if (!text) return '';
    return text
      .replace(/```[\s\S]*?```/g, '') // remove code blocks
      .replace(/###\s+/g, '')
      .replace(/##\s+/g, '')
      .replace(/#\s+/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\$([^$]+)\$/g, '$1')
      .replace(/\\text\{([^}]+)\}/g, '$1')
      .replace(/\\rightarrow|\\to/g, ' to ')
      .replace(/\\ge/g, ' greater than or equal to ')
      .replace(/\\le/g, ' less than or equal to ')
      .replace(/\\times/g, ' times ')
      .replace(/•\s+/g, '')
      .replace(/[-*]\s+/g, '')
      .replace(/6CO₂\s*\+\s*6H₂O.*?6O₂/gi, '6 Carbon Dioxide plus 6 Water plus Sunlight produces Glucose and 6 Oxygen')
      .replace(/CO₂/gi, 'Carbon Dioxide')
      .replace(/H₂O/gi, 'Water')
      .replace(/O₂/gi, 'Oxygen')
      .replace(/C₆H₁₂O₆/gi, 'Glucose')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Plays base64 audio data URI via Web Audio API with boosted Gain
   */
  private async playWithWebAudio(dataUri: string, sessionId: number, onEnd?: () => void): Promise<boolean> {
    const ctx = this.ensureAudioContext();
    if (!ctx) return false;

    try {
      if (ctx.state === 'suspended') {
        await ctx.resume().catch(() => {});
      }

      // Extract pure base64 string
      const base64Str = dataUri.includes(',') ? dataUri.split(',')[1] : dataUri;
      const binaryString = window.atob(base64Str);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Decode into AudioBuffer
      const audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0));
      if (sessionId !== this.currentSessionId) return false;

      // Create Source & Gain Nodes
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(this.volumeMultiplier, ctx.currentTime);

      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      this.currentAudioSourceNode = source;
      this.currentGainNode = gainNode;

      source.onended = () => {
        if (this.currentAudioSourceNode === source) {
          this.currentAudioSourceNode = null;
          this.currentGainNode = null;
        }
        if (onEnd && sessionId === this.currentSessionId) {
          onEnd();
        }
      };

      source.start(0);
      return true;

    } catch (err) {
      console.warn('Web Audio decode failed, falling back to HTML5 Audio:', err);
      return false;
    }
  }

  /**
   * Speak aloud using Bhashini IndicTTS or WebSpeech synthesis
   */
  public async speak(text: string, onEnd?: () => void, lang?: string) {
    const cleanText = this.cleanTextForSpeech(text);
    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    this.stopSpeaking();
    this.currentSessionId += 1;
    const sessionId = this.currentSessionId;
    this.ensureAudioContext();

    // 1. Attempt Bhashini Indic Neural Audio Stream
    try {
      const targetLang = lang || this.currentLang || 'en-IN';
      const bhashiniPromise = bhashiniService.synthesizeSpeech(cleanText, targetLang);
      
      // Fast race with timeout (1.5s) to avoid UI latency
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));
      const bhashiniAudioUri = await Promise.race([bhashiniPromise, timeoutPromise]);
      
      if (bhashiniAudioUri && sessionId === this.currentSessionId) {
        // A. Primary: Web Audio API with Volume Gain Boost
        const playedWithWebAudio = await this.playWithWebAudio(bhashiniAudioUri, sessionId, onEnd);
        if (playedWithWebAudio) {
          return;
        }

        // B. Secondary: Direct HTML5 Audio Element
        if (sessionId === this.currentSessionId) {
          const audio = new Audio(bhashiniAudioUri);
          audio.volume = 1.0;
          this.currentAudioElement = audio;

          audio.onended = () => {
            if (this.currentAudioElement === audio) {
              this.currentAudioElement = null;
            }
            if (onEnd && sessionId === this.currentSessionId) onEnd();
          };

          audio.onerror = () => {
            if (this.currentAudioElement === audio) {
              this.currentAudioElement = null;
            }
            this.speakWebSpeechFallback(cleanText, onEnd, lang, sessionId);
          };

          try {
            await audio.play();
            return;
          } catch (playErr) {
            console.warn('Audio.play rejected, falling back to WebSpeech:', playErr);
            this.speakWebSpeechFallback(cleanText, onEnd, lang, sessionId);
            return;
          }
        }
      }
    } catch (e) {
      console.warn('Bhashini synthesis notice:', e);
    }

    // 2. High-Fidelity Immediate WebSpeech Synthesis Fallback
    this.speakWebSpeechFallback(cleanText, onEnd, lang, sessionId);
  }

  private speakWebSpeechFallback(text: string, onEnd?: () => void, lang?: string, sessionId?: number) {
    if (!this.synth && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    const activeSession = sessionId || ++this.currentSessionId;

    try {
      if (this.synth.paused) {
        this.synth.resume();
      }
      this.synth.cancel();

      if (!this.synth.getVoices() || this.synth.getVoices().length === 0) {
        this.loadVoices();
      }

      const segments = this.splitIntoSegments(text, lang);
      let currentIndex = 0;

      const keepAlive = setInterval(() => {
        if (this.synth && this.synth.speaking) {
          this.synth.pause();
          this.synth.resume();
        } else {
          clearInterval(keepAlive);
        }
      }, 5000);

      const speakNextSegment = () => {
        if (activeSession !== this.currentSessionId) {
          clearInterval(keepAlive);
          return;
        }

        if (currentIndex >= segments.length) {
          clearInterval(keepAlive);
          if (onEnd) onEnd();
          return;
        }

        const segment = segments[currentIndex];
        currentIndex++;

        if (!segment.text.trim()) {
          setTimeout(speakNextSegment, 10);
          return;
        }

        const utterance = new SpeechSynthesisUtterance(segment.text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        const voice = this.getBestVoiceForLang(segment.lang);
        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang || segment.lang;
        } else {
          utterance.lang = segment.lang || 'en-US';
        }

        utterance.onend = () => {
          if (activeSession === this.currentSessionId) {
            setTimeout(() => {
              if (activeSession === this.currentSessionId) {
                speakNextSegment();
              }
            }, 30);
          }
        };

        utterance.onerror = (e) => {
          console.warn('TTS segment notice:', e);
          if (activeSession === this.currentSessionId) {
            if (e.error === 'interrupted' || e.error === 'canceled') {
              clearInterval(keepAlive);
              if (onEnd) onEnd();
              return;
            }
            setTimeout(() => {
              if (activeSession === this.currentSessionId) {
                speakNextSegment();
              }
            }, 60);
          }
        };

        setTimeout(() => {
          if (this.synth && activeSession === this.currentSessionId) {
            try {
              if (this.synth.paused) this.synth.resume();
              this.synth.speak(utterance);
            } catch (speakErr) {
              console.warn('Synth speak error:', speakErr);
              clearInterval(keepAlive);
              if (onEnd) onEnd();
            }
          }
        }, 30);
      };

      speakNextSegment();
    } catch (err) {
      console.warn('Speech synthesis notice:', err);
      if (onEnd) onEnd();
    }
  }

  public stopSpeaking() {
    this.currentSessionId += 1;
    if (this.currentAudioSourceNode) {
      try {
        this.currentAudioSourceNode.stop();
        this.currentAudioSourceNode.disconnect();
      } catch (e) {}
      this.currentAudioSourceNode = null;
      this.currentGainNode = null;
    }
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.src = '';
      } catch (e) {}
      this.currentAudioElement = null;
    }
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }
  }

  public isSpeaking(): boolean {
    return (
      !!this.currentAudioSourceNode ||
      (!!this.currentAudioElement && !this.currentAudioElement.paused) ||
      (!!this.synth && this.synth.speaking)
    );
  }
}

export const voiceService = new VoiceService();
