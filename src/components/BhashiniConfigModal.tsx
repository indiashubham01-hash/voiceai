import React, { useState, useEffect } from 'react';
import { bhashiniService, BhashiniConfig } from '../services/bhashiniService';
import { voiceService } from '../services/voiceService';

interface BhashiniConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BhashiniConfigModal: React.FC<BhashiniConfigModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<BhashiniConfig>(bhashiniService.getConfig());
  const [isSaved, setIsSaved] = useState(false);
  const [testLang, setTestLang] = useState<'en' | 'hi' | 'kn'>('hi');
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [testTranscript, setTestTranscript] = useState('');
  const [isPlayingSample, setIsPlayingSample] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = bhashiniService.getConfig();
      setConfig({
        userId: current.userId || 'bhashini_mindmesh_educator',
        apiKey: current.apiKey || 'bhashini_nltm_auth_key_2026',
        pipelineId: current.pipelineId || '64392f96daac500b55c543d6',
        inferenceUrl: current.inferenceUrl || 'https://dhruva-api.bhashini.gov.in/services/inference/pipeline',
        activeMode: current.activeMode || 'hybrid',
        backendProxyUrl: current.backendProxyUrl || '/api/bhashini'
      });
      setIsSaved(false);
      setTestTranscript('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    bhashiniService.saveConfig(config);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleToggleTestMic = async () => {
    if (isTestingMic) {
      setIsTestingMic(false);
      const text = await voiceService.stopListening();
      if (text) setTestTranscript(text);
    } else {
      setTestTranscript('Listening... Speak now into your microphone...');
      setIsTestingMic(true);
      const langCode = testLang === 'kn' ? 'kn-IN' : (testLang === 'hi' ? 'hi-IN' : 'en-IN');
      voiceService.setCallbacks(
        (text) => setTestTranscript(text),
        (listening) => setIsTestingMic(listening),
        (level) => setAudioLevel(level)
      );
      await voiceService.startListening(langCode);
    }
  };

  const handleTestTTS = () => {
    setIsPlayingSample(true);
    const sampleTexts = {
      en: 'Welcome to MINDMESH-NEXUS! Digital India Bhashini Indic Voice AI is active and ready for your classroom.',
      hi: 'माइंडमेश नेक्सस में आपका स्वागत है! डिजिटल इंडिया भाषिणी इंडिक वॉयस एआई सक्रिय है।',
      kn: 'ಮೈಂಡ್‌ಮೆಶ್ ನೆಕ್ಸಸ್‌ಗೆ ಸುಸ್ವಾಗತ! ಡಿಜಿಟಲ್ ಇಂಡಿಯಾ ಭಾಷಿಣಿ ಇಂಡಿಕ್ ವಾಯ್ಸ್ ಎಐ ಸಕ್ರಿಯವಾಗಿದೆ.'
    };
    const text = sampleTexts[testLang];
    const langCode = testLang === 'kn' ? 'kn-IN' : (testLang === 'hi' ? 'hi-IN' : 'en-IN');
    voiceService.speak(text, () => setIsPlayingSample(false), langCode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Digital India Bhashini Tricolor Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-500" />
        
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-orange-500/20 to-emerald-500/20 border border-emerald-500/30 rounded-xl text-2xl">
              🎙️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-white tracking-wide">
                  Digital India Bhashini AI
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  NLTM Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                National Language Translation Mission • Indic ASR & TTS Gateway
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (isTestingMic) voiceService.stopListening();
              voiceService.stopSpeaking();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          
          {/* Live Mic Diagnostic & Audio Visualizer Section */}
          <div className="bg-slate-950/70 border border-emerald-500/30 rounded-xl p-4.5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-emerald-300 flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  Live Microphone & Audio Engine Test
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Test your microphone with Bhashini Indic ASR & Waveform Visualizer
                </p>
              </div>

              {/* Language Selector */}
              <div className="flex bg-slate-900 border border-slate-700 rounded-lg p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setTestLang('en')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${testLang === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setTestLang('hi')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${testLang === 'hi' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  हिंदी
                </button>
                <button
                  type="button"
                  onClick={() => setTestLang('kn')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${testLang === 'kn' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  ಕನ್ನಡ
                </button>
              </div>
            </div>

            {/* Visualizer Waveform Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span>Input Stream Audio Level</span>
                  <span className="font-mono text-emerald-400">{audioLevel}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-0.5 p-0.5">
                  {Array.from({ length: 24 }).map((_, idx) => {
                    const threshold = (idx / 24) * 100;
                    const isActive = audioLevel >= threshold;
                    return (
                      <div
                        key={idx}
                        className={`flex-1 rounded-sm transition-all duration-75 ${
                          isActive
                            ? idx > 18
                              ? 'bg-rose-500'
                              : idx > 12
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                            : 'bg-slate-700/40'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleTestMic}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
                    isTestingMic
                      ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {isTestingMic ? '⏹️ Stop & Transcribe' : '🎙️ Test Mic'}
                </button>
                <button
                  type="button"
                  onClick={handleTestTTS}
                  disabled={isPlayingSample}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  {isPlayingSample ? '🔊 Speaking...' : '🔊 Test Indic TTS'}
                </button>
              </div>
            </div>

            {/* Live Transcript Box */}
            {testTranscript && (
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 text-xs">
                <div className="text-slate-400 font-medium mb-1 flex items-center justify-between">
                  <span>Detected Spoken Audio:</span>
                  <span className="text-emerald-400 font-mono">Bhashini ASR Ready</span>
                </div>
                <p className="text-emerald-200 font-mono bg-slate-950 p-2 rounded-lg border border-slate-800">
                  {testTranscript}
                </p>
              </div>
            )}
          </div>

          {/* Supported Models Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-800/40 border border-slate-700/60 p-3 rounded-xl">
              <div className="text-orange-400 text-xs font-semibold mb-1">🗣️ Indic ASR Model</div>
              <div className="text-slate-200 font-medium text-xs">AI4Bharat / Conformer</div>
              <div className="text-[11px] text-slate-400 mt-1">Noise-robust Indic Speech-to-Text</div>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/60 p-3 rounded-xl">
              <div className="text-emerald-400 text-xs font-semibold mb-1">🔊 Indic TTS Engine</div>
              <div className="text-slate-200 font-medium text-xs">IndicTTS / FastSpeech2</div>
              <div className="text-[11px] text-slate-400 mt-1">Natural Indian voice synthesis</div>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/60 p-3 rounded-xl">
              <div className="text-indigo-400 text-xs font-semibold mb-1">🌐 Translation Engine</div>
              <div className="text-slate-200 font-medium text-xs">IndicTrans2 NMT</div>
              <div className="text-[11px] text-slate-400 mt-1">Direct EN ↔ HI ↔ KN translation</div>
            </div>
          </div>

          {/* Configuration Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Bhashini User ID
                </label>
                <input
                  type="text"
                  value={config.userId}
                  onChange={(e) => setConfig({ ...config, userId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="bhashini_user_id"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Bhashini API Key / ULCA Key
                </label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="sk-bhashini-key"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Pipeline ID (Multi-Task)
                </label>
                <input
                  type="text"
                  value={config.pipelineId}
                  onChange={(e) => setConfig({ ...config, pipelineId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="64392f96daac500b55c543d6"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Voice Engine Mode
                </label>
                <select
                  value={config.activeMode}
                  onChange={(e) => setConfig({ ...config, activeMode: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="hybrid">Hybrid (Bhashini Indic + WebSpeech Streaming)</option>
                  <option value="bhashini">Bhashini Cloud ASR / TTS Only</option>
                  <option value="webspeech">WebSpeech Native Only</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Dhruva Pipeline Inference Endpoint URL
              </label>
              <input
                type="text"
                value={config.inferenceUrl}
                onChange={(e) => setConfig({ ...config, inferenceUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div>
                {isSaved && (
                  <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                    ✓ Bhashini Configuration Saved Successfully
                  </span>
                )}
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-900/30"
              >
                Save Configuration
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};
