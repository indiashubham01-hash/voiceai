import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  SkipBack, 
  Globe, 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  BookOpen, 
  Radio,
  Maximize2,
  Minimize2,
  Zap,
  Sliders,
  BellRing
} from 'lucide-react';
import { voiceService } from '../services/voiceService';
import { bhashiniService } from '../services/bhashiniService';
import { AudioVisualizer } from './AudioVisualizer';
import { LessonPlan, Student, DocumentSource } from '../types';

interface PageVoiceReaderProps {
  activeTab: string;
  selectedLanguage: 'English' | 'Hindi' | 'Kannada' | 'Bilingual';
  lessonPlan?: LessonPlan;
  students?: Student[];
  conflicts?: DocumentSource[];
  isOpen?: boolean;
  onToggleOpen?: () => void;
}

export const PageVoiceReader: React.FC<PageVoiceReaderProps> = ({
  activeTab,
  selectedLanguage,
  lessonPlan,
  students = [],
  conflicts = [],
  isOpen = false,
  onToggleOpen
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [readLang, setReadLang] = useState<'en-IN' | 'hi-IN' | 'kn-IN'>('en-IN');
  const [currentSegmentIdx, setCurrentSegmentIdx] = useState(0);
  const [segments, setSegments] = useState<string[]>([]);
  const [volumeBoost, setVolumeBoost] = useState<number>(1.6);
  const [showVolumeControls, setShowVolumeControls] = useState(false);
  const [isTestingSpeaker, setIsTestingSpeaker] = useState(false);

  // Sync default readLang with selectedLanguage
  useEffect(() => {
    if (selectedLanguage === 'Hindi') setReadLang('hi-IN');
    else if (selectedLanguage === 'Kannada') setReadLang('kn-IN');
    else setReadLang('en-IN');
  }, [selectedLanguage]);

  // Construct structured text payload based on active tab & language
  const buildPageTextSegments = (targetLang: string): string[] => {
    const isHi = targetLang.startsWith('hi');
    const isKn = targetLang.startsWith('kn');

    if (activeTab === 'lesson') {
      if (isHi) {
        return [
          'माइंडमेश नेक्सस पाठ योजना: कक्षा 7 विज्ञान प्रकाश संश्लेषण।',
          'अवधि 40 मिनट, जिसमें 3-स्तरीय विभेदित शिक्षण शामिल है।',
          'आरंभिक चरण: स्टोमेटा और हरी पत्तियों का दृश्य अवलोकन।',
          'मुख्य चरण: प्रकाश-निर्भर अभिक्रियाएं और पर्णहरित द्वारा सौर ऊर्जा का अवशोषण।',
          'संतुलित रासायनिक समीकरण: 6 कार्बन डाइऑक्साइड प्लस 6 जल सूर्य के प्रकाश में ग्लूकोज और 6 ऑक्सीजन बनाते हैं।',
          'धीमी गति से सीखने वाले विद्यार्थियों के लिए सरलीकृत हिंदी व्याख्या और प्रवाह आरेख तैयार किए गए हैं।'
        ];
      }
      if (isKn) {
        return [
          'ಮೈಂಡ್‌ಮೆಶ್ ನೆಕ್ಸಸ್ ಪಾಠ ಯೋಜನೆ: 7ನೇ ತರಗತಿ ವಿಜ್ಞಾನ ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ.',
          'ಅವಧಿ 40 ನಿಮಿಷಗಳು, 3 ಹಂತದ ಕಲಿಕಾ ವಿಧಾನದೊಂದಿಗೆ.',
          'ಆರಂಭಿಕ ಹಂತ: ಪತ್ರರಂಧ್ರ ಮತ್ತು ಹಸಿರು ಎಲೆಗಳ ವೀಕ್ಷಣೆ.',
          'ಮುಖ್ಯ ಹಂತ: ಕ್ಲೋರೋಫಿಲ್ ಮೂಲಕ ಸೌರ ಶಕ್ತಿಯ ಹೀರಿಕೊಳ್ಳುವಿಕೆ.',
          'ರಾಸಾಯನಿಕ ಸಮೀಕರಣ: ಇಂಗಾಲದ ಡೈಆಕ್ಸೈಡ್ ಮತ್ತು ನೀರು ಸೇರಿ ಗ್ಲೂಕೋಸ್ ಹಾಗೂ ಆಮ್ಲಜನಕವನ್ನು ಉತ್ಪಾದಿಸುತ್ತವೆ.',
          'ಕಲಿಕೆಯಲ್ಲಿ ಹಿಂದುಳಿದ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಸರಳ ಕನ್ನಡ ವಿವರಣೆ ಮತ್ತು ಚಟುವಟಿಕೆಗಳನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ.'
        ];
      }
      return [
        'MINDMESH-NEXUS Lesson Architecture: Grade 7 Science Photosynthesis.',
        'Total duration is 40 minutes with 3-tier differentiated scaffolding.',
        'Hook phase: Visual observation of leaf stomata and chloroplast pigments.',
        'Core inquiry: Light-dependent reactions and chemical energy storage.',
        'Balanced equation: 6 carbon dioxide molecules plus 6 water molecules yield glucose and 6 oxygen molecules.',
        'Scaffolded accommodations are active for Aarav Sharma and Rahul Sharma with multimodal diagram cards.'
      ];
    }

    if (activeTab === 'conflict') {
      if (isHi) {
        return [
          'पाठ्यक्रम टकराव समाधान दृश्य: एनसीईआरटी 2024 संस्करण के आधार पर 3 टकरावों का समाधान किया गया है।',
          'टकराव 1: स्टोमेटा गैस विनिमय तंत्र को 98 प्रतिशत विश्वसनीयता के साथ सक्रिय रखा गया है।',
          'टकराव 2: अनधिकृत संदर्भ सामग्री को पाठ्यक्रम से बाहर कर दिया गया है।'
        ];
      }
      if (isKn) {
        return [
          'ಪಠ್ಯಕ್ರಮ ಸಂಘರ್ಷ ಪರಿಹಾರ ವರದಿ: ಎನ್‌ಸಿಇಆರ್‌ಟಿ 2024 ಪಠ್ಯಪುಸ್ತಕದ ಆಧಾರದ ಮೇಲೆ 3 ಸಂಘರ್ಷಗಳನ್ನು ಪರಿಹರಿಸಲಾಗಿದೆ.',
          'ಸಂಘರ್ಷ 1: ಪತ್ರರಂಧ್ರಗಳ ಮೂಲಕ ಅನಿಲ ವಿನಿಮಯ ಪ್ರಕ್ರಿಯೆಯನ್ನು 98 ಪ್ರತಿಶತ ವಿಶ್ವಾಸಾರ್ಹತೆಯೊಂದಿಗೆ ಅಳವಡಿಸಲಾಗಿದೆ.',
          'ಸಂಘರ್ಷ 2: ಹಳೆಯ ಪಠ್ಯಕ್ರಮದ ಅಂಶಗಳನ್ನು ತೆಗೆದುಹಾಕಲಾಗಿದೆ.'
        ];
      }
      return [
        'Curriculum Conflict Resolution Engine: 3 syllabus conflicts resolved against NCERT 2024 ground truth.',
        'Conflict 1: Stomata gas exchange mechanism verified with 98% authority trust score.',
        'Conflict 2: Outdated third-party guidebooks excluded to preserve exam alignment.'
      ];
    }

    if (activeTab === 'learners') {
      if (isHi) {
        return [
          'लर्निंग ट्विन शिक्षार्थी विश्लेषण: कक्षा के 3 विद्यार्थी स्लो स्टार्ट और फ्लो कंट्रोल में सुधारात्मक सहायता की आवश्यकता में हैं।',
          'राहुल शर्मा का ज्ञान स्तर 48 प्रतिशत है। उनके लिए जल पाइप और फनल सादृश्यता प्रस्तावित की गई है।',
          'आरव शर्मा और प्रिया वर्मा का ज्ञान स्तर 85 प्रतिशत से अधिक है।'
        ];
      }
      if (isKn) {
        return [
          'ಲರ್ನಿಂಗ್ ಟ್ವಿನ್ ವಿದ್ಯಾರ್ಥಿ ವಿಶ್ಲೇಷಣೆ: 3 ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಪರಿಹಾರ ತರಗತಿಯ ಅಗತ್ಯವಿದೆ.',
          'ರಾಹುಲ್ ಶರ್ಮಾ ಕಲಿಕಾ ಮಟ್ಟ 48 ಪ್ರತಿಶತ. ಅವರಿಗೆ ಪ್ರಾಯೋಗಿಕ ಉದಾಹರಣೆಗಳನ್ನು ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.',
          'ಇತರ ವಿದ್ಯಾರ್ಥಿಗಳು ಅತ್ಯುತ್ತಮ ಪ್ರಗತಿಯಲ್ಲಿದ್ದಾರೆ.'
        ];
      }
      return [
        'Living Learning Twin Analytics: 3 students flagged with conceptual bottlenecks in TCP Congestion Control and Photosynthesis.',
        'Rahul Sharma is at 48% mastery in Slow Start. Water Pipe and Funnel tactile analogy recommended.',
        'Aarav Sharma and Priya Verma maintain above 85% mastery with advanced challenge prompts.'
      ];
    }

    if (isHi) {
      return [
        'माइंडमेश नेक्सस ऑटोनॉमस टीचिंग को-पायलट सक्रिय है।',
        'डिजिटल इंडिया भाषिणी एआई आपकी कक्षा के लिए बहुभाषी आवाज सहायता प्रदान कर रहा है।'
      ];
    }
    if (isKn) {
      return [
        'ಮೈಂಡ್‌ಮೆಶ್ ನೆಕ್ಸಸ್ ವಾಯ್ಸ್ ಬೋಧನಾ ಸಹಾಯಕ ಸಕ್ರಿಯವಾಗಿದೆ.',
        'ಡಿಜಿಟಲ್ ಇಂಡಿಯಾ ಭಾಷಿಣಿ ಎಐ ತರಗತಿಗಾಗಿ ಬಹುಭಾಷಾ ಧ್ವನಿ ಸೌಲಭ್ಯ ಒದಗಿಸುತ್ತದೆ.'
      ];
    }
    return [
      'MINDMESH-NEXUS Autonomous Teaching Co-Pilot is active.',
      'Digital India Bhashini Indic Voice AI is ready for multilingual classroom narration in English, Hindi, and Kannada.'
    ];
  };

  const startReading = async (startIndex: number = 0) => {
    voiceService.ensureAudioContext();
    const textList = buildPageTextSegments(readLang);
    setSegments(textList);
    setCurrentSegmentIdx(startIndex);
    setIsPlaying(true);
    setIsPaused(false);

    playSegment(textList, startIndex, readLang);
  };

  const playSegment = (textList: string[], index: number, lang: string) => {
    if (index >= textList.length) {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentSegmentIdx(0);
      return;
    }

    const currentText = textList[index];
    setCurrentSegmentIdx(index);

    voiceService.speak(
      currentText,
      () => {
        setTimeout(() => {
          playSegment(textList, index + 1, lang);
        }, 180);
      },
      lang
    );
  };

  const handleTogglePlay = () => {
    voiceService.ensureAudioContext();
    if (isPlaying) {
      voiceService.stopSpeaking();
      setIsPlaying(false);
      setIsPaused(true);
    } else {
      startReading(isPaused ? currentSegmentIdx : 0);
    }
  };

  const handleStop = () => {
    voiceService.stopSpeaking();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSegmentIdx(0);
  };

  const handleNext = () => {
    voiceService.ensureAudioContext();
    voiceService.stopSpeaking();
    const nextIdx = Math.min(segments.length - 1, currentSegmentIdx + 1);
    setCurrentSegmentIdx(nextIdx);
    playSegment(segments, nextIdx, readLang);
  };

  const handlePrev = () => {
    voiceService.ensureAudioContext();
    voiceService.stopSpeaking();
    const prevIdx = Math.max(0, currentSegmentIdx - 1);
    setCurrentSegmentIdx(prevIdx);
    playSegment(segments, prevIdx, readLang);
  };

  const handleLangSelect = (newLang: 'en-IN' | 'hi-IN' | 'kn-IN') => {
    voiceService.ensureAudioContext();
    setReadLang(newLang);
    if (isPlaying) {
      voiceService.stopSpeaking();
      const updated = buildPageTextSegments(newLang);
      setSegments(updated);
      setCurrentSegmentIdx(0);
      playSegment(updated, 0, newLang);
    }
  };

  const handleVolumeChange = (newVal: number) => {
    setVolumeBoost(newVal);
    voiceService.setVolumeBoost(newVal);
  };

  const handleTestSpeakerSound = () => {
    voiceService.ensureAudioContext();
    setIsTestingSpeaker(true);
    voiceService.playSpeakerTestSound();
    setTimeout(() => setIsTestingSpeaker(false), 800);
  };

  return (
    <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-3 sm:px-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden transition-all duration-200">
        
        {/* Tricolor Indicator Line */}
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-500" />

        {/* Compact Header Bar */}
        <div className="px-3.5 sm:px-4 py-2.5 flex items-center justify-between gap-2 border-b border-slate-800">
          
          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleTestSpeakerSound}
              className={`p-1.5 rounded-lg text-white transition-all cursor-pointer ${
                isPlaying || isTestingSpeaker ? 'bg-blue-600 animate-pulse ring-2 ring-blue-400/50' : 'bg-slate-800 hover:bg-slate-700'
              }`}
              title="Click to test speaker sound aloud"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                  Bhashini Indic Page Reader
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {readLang === 'hi-IN' ? 'हिंदी' : (readLang === 'kn-IN' ? 'ಕನ್ನಡ' : 'English')}
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hidden sm:inline">
                  🔊 {Math.round(volumeBoost * 100)}% Boost
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Reading active view aloud with AI neural acoustics & Web Audio Booster
              </p>
            </div>
          </div>

          {/* Controls Right */}
          <div className="flex items-center space-x-1.5">
            
            {/* Quick Language Selector */}
            <div className="flex items-center space-x-0.5 sm:space-x-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
              <button
                onClick={() => handleLangSelect('en-IN')}
                className={`px-1.5 sm:px-2 py-1 rounded font-medium transition-colors ${readLang === 'en-IN' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                EN
              </button>
              <button
                onClick={() => handleLangSelect('hi-IN')}
                className={`px-1.5 sm:px-2 py-1 rounded font-medium transition-colors ${readLang === 'hi-IN' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                हिं
              </button>
              <button
                onClick={() => handleLangSelect('kn-IN')}
                className={`px-1.5 sm:px-2 py-1 rounded font-medium transition-colors ${readLang === 'kn-IN' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                ಕನ್ನ
              </button>
            </div>

            {/* Volume Booster Toggle */}
            <button
              onClick={() => setShowVolumeControls(!showVolumeControls)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                showVolumeControls ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Adjust Volume Booster"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            {/* Toggle Expand / Collapse */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title={isExpanded ? "Collapse Player" : "Expand Player"}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            {onToggleOpen && (
              <button
                onClick={() => {
                  handleStop();
                  onToggleOpen();
                }}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close Page Reader"
              >
                ✕
              </button>
            )}
          </div>

        </div>

        {/* Volume Booster Panel */}
        {showVolumeControls && (
          <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-medium">Speaker Volume Gain:</span>
              <span className="font-mono text-amber-400 font-bold">{Math.round(volumeBoost * 100)}%</span>
            </div>
            <div className="flex items-center space-x-2 flex-1 max-w-xs">
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={volumeBoost}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => handleVolumeChange(1.0)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium ${volumeBoost === 1.0 ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                100%
              </button>
              <button
                onClick={() => handleVolumeChange(1.6)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium ${volumeBoost === 1.6 ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                160% (Loud)
              </button>
              <button
                onClick={() => handleVolumeChange(2.2)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium ${volumeBoost === 2.2 ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                220% (Max)
              </button>
              <button
                onClick={handleTestSpeakerSound}
                className="px-2.5 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <BellRing className="w-2.5 h-2.5" />
                <span>Test Sound</span>
              </button>
            </div>
          </div>
        )}

        {/* Expanded Controls & Live Subtitle Bar */}
        {isExpanded && (
          <div className="p-3 sm:p-4 space-y-3 bg-slate-900/60">
            
            {/* Live Speaking Sentence Subtitle */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-start space-x-3">
              <span className="text-base mt-0.5">💬</span>
              <div className="flex-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span>Current Speech Segment:</span>
                  <span className="font-mono text-emerald-400">
                    {segments.length > 0 ? `${currentSegmentIdx + 1} / ${segments.length}` : 'Ready to read'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed font-sans min-h-[38px]">
                  {isPlaying || isPaused
                    ? (segments[currentSegmentIdx] || 'Reading active tab...')
                    : 'Click Read Page Aloud to listen to the active lesson plan, conflict resolutions, and student gap reports.'}
                </p>
              </div>
            </div>

            {/* Audio Playback Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              
              {/* Visualizer & Speaker Status */}
              <div className="flex items-center space-x-2">
                <AudioVisualizer isActive={isPlaying} height={18} barCount={12} />
                <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                  {isPlaying ? '🔊 Speaking Aloud...' : isPaused ? '⏸️ Paused' : '⏹️ Stopped'}
                </span>
              </div>

              {/* Main Buttons */}
              <div className="flex items-center space-x-2">
                
                <button
                  onClick={handlePrev}
                  disabled={!isPlaying && !isPaused}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 rounded-xl transition-colors cursor-pointer"
                  title="Previous Sentence"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleTogglePlay}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md cursor-pointer ${
                    isPlaying
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-blue-600 hover:bg-blue-500 text-white ring-2 ring-blue-500/30'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>{isPaused ? 'Resume' : 'Read Page Aloud'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleStop}
                  disabled={!isPlaying && !isPaused}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 rounded-xl transition-colors cursor-pointer"
                  title="Stop Reading"
                >
                  <Square className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleNext}
                  disabled={!isPlaying && !isPaused}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 rounded-xl transition-colors cursor-pointer"
                  title="Next Sentence"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
