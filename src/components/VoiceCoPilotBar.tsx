import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Send, 
  RefreshCw, 
  Volume2, 
  Zap,
  Radio,
  Flame
} from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';

interface VoiceCoPilotBarProps {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcript: string;
  setTranscript: (text: string) => void;
  onToggleListen: () => void;
  onSubmitCommand: (text: string) => void;
  onToggleSpeech: () => void;
  agentSpeechSummary: string;
  onOpenBhashiniConfig?: () => void;
  onTogglePageReader?: () => void;
  isPageReaderOpen?: boolean;
}

export const VoiceCoPilotBar: React.FC<VoiceCoPilotBarProps> = ({
  isListening,
  isProcessing,
  isSpeaking,
  transcript,
  setTranscript,
  onToggleListen,
  onSubmitCommand,
  onToggleSpeech,
  agentSpeechSummary,
  onOpenBhashiniConfig,
  onTogglePageReader,
  isPageReaderOpen,
}) => {
  const [activeChip, setActiveChip] = useState<string | null>(null);

  const DEMO_PROMPTS = [
    {
      id: 'p-sched',
      icon: '📅',
      label: 'Schedule class in 10 min',
      prompt: 'Schedule a class for me in 10 min on Computer Networks TCP Flow Control.',
      tag: 'Calendar'
    },
    {
      id: 'p-interv',
      icon: '🎯',
      label: 'Rahul weak in Slow Start (Intervention)',
      prompt: 'My student Rahul Sharma is weak in Slow Start, schedule an intervention review and reassessment.',
      tag: 'Remedial'
    },
    {
      id: 'p-marks',
      icon: '📝',
      label: 'Edit marks for Aarav to 9/10',
      prompt: 'Edit marks for Aarav Sharma to 9 out of 10 in Slow Start.',
      tag: 'Gradebook'
    },
    {
      id: 'p-cn',
      icon: '🌐',
      label: '30m Computer Networks (CN Scaffolding)',
      prompt: 'I have a 30-minute class on Computer Networks (CN) to teach TCP Congestion Control and Flow Control. My student Rahul Sharma is weak in Slow Start and Flow Control, so please scaffold the lesson and update his Learning Twin.',
      tag: 'CN Deck'
    },
    {
      id: 'p1',
      icon: '🌱',
      label: '40m Photosynthesis (Bilingual + 3 At-Risk)',
      prompt: 'I need a 40-minute Grade 7 science lesson on photosynthesis, in English and Hindi. Use my uploaded chapter notes. Three students need simpler explanations, and the exam is next week.',
      tag: 'Primary'
    },
    {
      id: 'p2',
      icon: '⚡',
      label: 'Reduce to 20m (Class behind)',
      prompt: 'The class is behind; reduce this to 20 minutes.',
      tag: 'Replan'
    },
    {
      id: 'p-qa',
      icon: '❓',
      label: 'Siri Q&A: What is photosynthesis?',
      prompt: 'What is photosynthesis and how do stomata regulate gas exchange?',
      tag: 'Voice Q&A'
    },
    {
      id: 'p-ds',
      icon: '📊',
      label: '45m Data Science (Decision Trees & Entropy)',
      prompt: 'I have a 45-minute class on VTU Data Science to teach Decision Trees, Shannon Entropy, and Information Gain for binary classification.',
      tag: 'Data Science'
    },
    {
      id: 'p3',
      icon: '🌟',
      label: 'ಕನ್ನಡದಲ್ಲಿ ವಿವರಿಸಿ (Explain in Kannada)',
      prompt: 'ಕನ್ನಡದಲ್ಲಿ ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ (Photosynthesis) ಪಾಠವನ್ನು ವಿವರಿಸಿ ಮತ್ತು ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ರಸಪ್ರಶ್ನೆ ರಚಿಸಿ.',
      tag: 'ಕನ್ನಡ'
    }
  ];

  const handleChipClick = (prompt: string, id: string) => {
    setActiveChip(id);
    setTranscript(prompt);
    onSubmitCommand(prompt);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transcript.trim()) {
      onSubmitCommand(transcript.trim());
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-2">
      <div className="relative rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-sm overflow-hidden">
        
        <div className="relative flex flex-col space-y-4">
          
          {/* Top Row: Voice Orb, Live Status, Visualizer & Playback */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            <div className="flex items-center space-x-3 sm:space-x-4">
              
              {/* Voice Mic Button */}
              <button
                onClick={onToggleListen}
                disabled={isProcessing}
                className={`relative flex items-center justify-center w-12 h-12 rounded-xl transition-all cursor-pointer shadow-sm ${
                  isListening
                    ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-200 animate-pulse shadow-lg shadow-rose-500/30'
                    : isProcessing
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
                }`}
                title={isListening ? "Listening... Click to stop and answer" : "Click to speak with Groq Voice AI"}
              >
                {isListening ? (
                  <Mic className="w-6 h-6 text-white animate-bounce" />
                ) : isProcessing ? (
                  <RefreshCw className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Mic className="w-6 h-6 text-white" />
                )}
                {isListening && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600 text-[8px] text-white font-bold items-center justify-center">●</span>
                  </span>
                )}
              </button>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm sm:text-base font-bold text-slate-900 font-outfit flex items-center gap-1.5">
                    {isListening ? (
                      <span className="text-rose-600 flex items-center gap-1.5 font-semibold">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600" />
                        </span>
                        Listening in real-time... (Groq & Bhashini Voice AI)
                      </span>
                    ) : isProcessing ? (
                      <span className="text-amber-600 flex items-center gap-1.5 font-semibold">
                        <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
                        Autonomous Brain Reasoning & Grounding...
                      </span>
                    ) : isSpeaking ? (
                      <span className="text-blue-600 flex items-center gap-1.5 font-semibold">
                        <Volume2 className="w-4 h-4 text-blue-600" />
                        MINDMESH-NEXUS Speaking
                      </span>
                    ) : (
                      <span className="text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        Voice Teaching Co-Pilot
                      </span>
                    )}
                  </span>
                </div>
                
                <p className="text-xs text-slate-500 font-normal flex flex-wrap items-center gap-2 mt-0.5">
                  <span>Speak natural lesson requirements in English, Hindi, or Kannada</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    <Zap className="w-2.5 h-2.5 text-amber-600 fill-amber-500" />
                    Groq Cloud LPU (1st Layer)
                  </span>
                  {onOpenBhashiniConfig && (
                    <button
                      type="button"
                      onClick={onOpenBhashiniConfig}
                      className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Digital India Bhashini
                    </button>
                  )}
                </p>
              </div>
            </div>

            {/* Audio Waveform Visualizer & Playback */}
            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex items-center px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono text-slate-600 font-medium mr-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  PCM 16kHz
                </span>
                <AudioVisualizer isActive={isListening || isSpeaking} height={20} barCount={18} />
              </div>

              {agentSpeechSummary && (
                <button
                  onClick={onToggleSpeech}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-colors ${
                    isSpeaking
                      ? 'bg-blue-600 text-white border-blue-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                  title="Play response summary aloud"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-white' : 'text-slate-500'}`} />
                  <span>{isSpeaking ? 'Mute' : 'Play Response'}</span>
                </button>
              )}

              {onTogglePageReader && (
                <button
                  onClick={onTogglePageReader}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-colors ${
                    isPageReaderOpen
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                  title="Listen to entire active page with Bhashini Indic Voice"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isPageReaderOpen ? 'text-white animate-pulse' : 'text-emerald-600'}`} />
                  <span className="hidden sm:inline">Read Page</span>
                </button>
              )}
            </div>

          </div>

          {/* Interactive Input Box */}
          <form onSubmit={handleFormSubmit} className="relative flex items-center">
            <input
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Speak or type: 'I need a 40-minute Grade 7 science lesson on photosynthesis in English and Hindi...'"
              disabled={isProcessing}
              className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 text-sm text-slate-900 placeholder-slate-400 rounded-xl pl-4 pr-24 py-2.5 outline-none transition-all focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!transcript.trim() || isProcessing}
              className="absolute right-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center space-x-1.5 cursor-pointer disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <span>Execute</span>
              <Send className="w-3 h-3" />
            </button>
          </form>

          {/* Spoken Prompt Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center mr-1">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500 mr-1" /> Quick Prompts:
            </span>
            {DEMO_PROMPTS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleChipClick(item.prompt, item.id)}
                className={`group flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  activeChip === item.id
                    ? 'bg-blue-600 text-white border-blue-700 font-semibold'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
                title={item.prompt}
              >
                <span>{item.icon}</span>
                <span className="font-medium">{item.label}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                  activeChip === item.id 
                    ? 'bg-white/20 text-white' 
                    : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                }`}>
                  {item.tag}
                </span>
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};
