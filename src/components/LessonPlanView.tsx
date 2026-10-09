import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Clock, 
  Layers, 
  Languages, 
  ChevronRight, 
  ChevronDown, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  Eye, 
  Zap, 
  Brain, 
  FileText,
  Edit3,
  HelpCircle,
  FlaskConical,
  Volume2,
  VolumeX,
  Split,
  Target,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { LessonPlan, LessonSection } from '../types';
import { voiceService } from '../services/voiceService';
import { MOCK_ADAPTIVE_ROUTES } from '../data/mockData';
import { FormativeQuizEngine } from './FormativeQuizEngine';

interface LessonPlanViewProps {
  lessonPlan: LessonPlan;
  selectedLanguage: 'English' | 'Hindi' | 'Kannada' | 'Bilingual';
  onSpeakText: (text: string, lang?: string) => void;
}

export const LessonPlanView: React.FC<LessonPlanViewProps> = ({
  lessonPlan,
  selectedLanguage,
  onSpeakText,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'timeline' | 'beginner' | 'advanced' | 'diagram' | 'quiz' | 'routes'>('timeline');
  const [isInteractiveQuizMode, setIsInteractiveQuizMode] = useState<boolean>(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'sec-1': true,
    'sec-2': true,
    'sec-3': true,
    'sec-replan-1': true,
    'sec-replan-2': true,
  });
  const [selectedHotspot, setSelectedHotspot] = useState<number | null>(0);
  const [activeAudioSlide, setActiveAudioSlide] = useState<{ id: string; title: string; lang: string } | null>(null);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isHindiMode = selectedLanguage === 'Hindi';
  const isKannadaMode = selectedLanguage === 'Kannada';
  const isBilingualMode = selectedLanguage === 'Bilingual';

  const getSlideSpeechText = (section: LessonSection, langOverride?: 'English' | 'Hindi' | 'Kannada' | 'Bilingual') => {
    const mode = langOverride || selectedLanguage;
    if (mode === 'Hindi') {
      const title = section.titleHindi || section.title;
      const points = (section.teacherTalkingPointsHindi && section.teacherTalkingPointsHindi.length > 0)
        ? section.teacherTalkingPointsHindi.join('. ')
        : section.teacherTalkingPoints.join('. ');
      return `प्रस्तुति स्लाइड: ${title}। शिक्षक बिंदु: ${points}।`;
    }
    if (mode === 'Kannada') {
      const title = section.titleKannada || section.title;
      const points = (section.teacherTalkingPointsKannada && section.teacherTalkingPointsKannada.length > 0)
        ? section.teacherTalkingPointsKannada.join('. ')
        : section.teacherTalkingPoints.join('. ');
      return `ಪ್ರಸ್ತುತಿ ಸ್ಲೈಡ್: ${title}। ಮುಖ್ಯ ಬೋಧನಾ ಅಂಶಗಳು: ${points}।`;
    }
    if (mode === 'Bilingual') {
      const enTitle = `Presentation Slide: ${section.title}`;
      const enPoints = section.teacherTalkingPoints.slice(0, 2).join('. ');
      const hiTitle = section.titleHindi ? `हिंदी में: ${section.titleHindi}` : '';
      const hiPoints = section.teacherTalkingPointsHindi && section.teacherTalkingPointsHindi.length > 0
        ? section.teacherTalkingPointsHindi.slice(0, 2).join('. ')
        : '';
      const knTitle = section.titleKannada ? `ಕನ್ನಡದಲ್ಲಿ: ${section.titleKannada}` : '';
      const knPoints = section.teacherTalkingPointsKannada && section.teacherTalkingPointsKannada.length > 0
        ? section.teacherTalkingPointsKannada.slice(0, 1).join('. ')
        : '';
      
      let res = `${enTitle}. ${enPoints}.`;
      if (hiTitle || hiPoints) res += ` ${hiTitle ? hiTitle + '। ' : ''}${hiPoints}।`;
      if (knTitle || knPoints) res += ` ${knTitle ? knTitle + '। ' : ''}${knPoints}।`;
      return res.trim();
    }
    return `Slide: ${section.title}. Key teaching points: ${section.teacherTalkingPoints.join('. ')}`;
  };

  const handlePlaySlideAudio = (section: LessonSection, langOverride?: 'English' | 'Hindi' | 'Kannada' | 'Bilingual') => {
    const mode = langOverride || selectedLanguage;
    setActiveAudioSlide({
      id: section.id,
      title: mode === 'Kannada' && section.titleKannada ? section.titleKannada : (mode === 'Hindi' && section.titleHindi ? section.titleHindi : section.title),
      lang: mode === 'Bilingual' ? 'ALL Multilingual' : mode
    });
    
    onSpeakText(getSlideSpeechText(section, mode), mode);
  };

  const handleStopAudio = () => {
    voiceService.stopSpeaking();
    setActiveAudioSlide(null);
  };

  const handleSpeakAllSlides = () => {
    setActiveAudioSlide({
      id: 'all',
      title: 'Complete 5-Phase Lesson Plan',
      lang: selectedLanguage === 'Bilingual' ? 'ALL Multilingual' : selectedLanguage
    });
    const allText = lessonPlan.standardLesson.sections
      .map((sec, idx) => `Phase ${idx + 1}: ` + getSlideSpeechText(sec))
      .join('. Next Phase: ');
    onSpeakText(allText, selectedLanguage);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Lesson Hero Banner */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-sm relative overflow-hidden">
        
        {/* Soft Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-100/50 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-sky-600" /> Grade {lessonPlan.grade} • {lessonPlan.subject}
              </span>
              
              {lessonPlan.isReplanned ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 flex items-center space-x-1 animate-pulse">
                  <Zap className="w-3 h-3 text-amber-600" />
                  <span>Dynamically Compressed ({lessonPlan.totalDurationMinutes}m)</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>Standard {lessonPlan.totalDurationMinutes} Minutes</span>
                </span>
              )}

              {lessonPlan.targetExamDate && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                  Target Exam: {lessonPlan.targetExamDate}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isKannadaMode ? (lessonPlan.topicKannada || lessonPlan.topic) : (isHindiMode ? lessonPlan.topicHindi : lessonPlan.topic)}
            </h1>
            {isBilingualMode && (
              <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600 font-sans">
                <span>HI: {lessonPlan.topicHindi}</span>
                <span className="text-slate-300">•</span>
                <span>KN: {lessonPlan.topicKannada || "ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ (Photosynthesis)"}</span>
              </div>
            )}

            {/* Replanned Alert if applicable */}
            {lessonPlan.isReplanned && lessonPlan.replannedReason && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start space-x-2 mt-2 max-w-2xl">
                <Zap className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span><strong>Voice Replan Trace:</strong> {lessonPlan.replannedReason}</span>
              </div>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center space-x-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex-shrink-0">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 font-outfit">
                {lessonPlan.standardLesson.sections.length}
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Phases</div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600 font-outfit">
                {lessonPlan.predictedGapsCount}
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Scaffolds</div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700 font-outfit">
                {lessonPlan.sourcesUsed.length}
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Sources Cited</div>
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Supervisory Control & Authority Bar */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-900 text-white uppercase tracking-wider flex items-center space-x-1">
                <Brain className="w-3.5 h-3.5 mr-1 text-blue-400" /> Educator Supervisory Control
              </span>
              <span className="text-xs text-slate-700 font-semibold">100% Teacher Authority</span>
            </div>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              "Educators remain in control, observe student gap evolution, distinguish textbook ground truth from obsolete notes, and dynamically replan for classroom time constraints."
            </p>
          </div>

          {/* Quick Classroom Constraint Timing Overrides */}
          <div className="flex items-center flex-wrap gap-2 flex-shrink-0">
            <span className="text-xs font-semibold text-slate-500 uppercase">Class Pacing:</span>
            <button
              onClick={() => {
                lessonPlan.totalDurationMinutes = 40;
                lessonPlan.isReplanned = false;
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-colors ${
                !lessonPlan.isReplanned 
                  ? 'bg-blue-600 text-white border-blue-700' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              ⏱️ 40m Standard
            </button>
            <button
              onClick={() => {
                lessonPlan.totalDurationMinutes = 20;
                lessonPlan.isReplanned = true;
                lessonPlan.replannedReason = 'Teacher overrode lesson duration: compressed to 20m due to classroom period constraints.';
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-colors ${
                lessonPlan.isReplanned 
                  ? 'bg-amber-600 text-white border-amber-700' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              ⚡ 20m Compressed
            </button>
          </div>
        </div>

        {/* Material Provenance Tracker */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="card-3d p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-black uppercase block">Educator Uploaded Notes</span>
              <span className="font-extrabold text-sky-900 text-sm font-outfit">65% Content Origin</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">Grounded</span>
          </div>

          <div className="card-3d p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-black uppercase block">NCERT 2026 Standard</span>
              <span className="font-extrabold text-teal-900 text-sm font-outfit">35% Standards Match</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">Authoritative</span>
          </div>

          <div className="card-3d p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-black uppercase block">AI Verification Guard</span>
              <span className="font-extrabold text-emerald-700 text-sm font-outfit">0% Hallucination</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">✓ 100% Grounded</span>
          </div>
        </div>
      </div>

      {/* 3D Sub-Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('timeline')}
          className={`btn-3d flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'timeline'
              ? 'btn-3d-sky text-white font-extrabold'
              : 'btn-3d-white text-slate-700'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Lesson Sequence ({lessonPlan.totalDurationMinutes}m)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('beginner')}
          className={`btn-3d flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'beginner'
              ? 'btn-3d-emerald text-white font-extrabold'
              : 'btn-3d-white text-slate-700'
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>🟢 Beginner Scaffold ("Plant Kitchen")</span>
          <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/20 text-white font-bold">
            3 At-Risk
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('advanced')}
          className={`btn-3d flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'advanced'
              ? 'btn-3d-indigo text-white font-extrabold'
              : 'btn-3d-white text-slate-700'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>🟣 Advanced Inquiry (Calvin Cycle)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('diagram')}
          className={`btn-3d flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'diagram'
              ? 'btn-3d-amber text-white font-extrabold'
              : 'btn-3d-white text-slate-700'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>🖼️ Visual Diagram & Hotspots</span>
        </button>

        <button
          onClick={() => setActiveSubTab('quiz')}
          className={`btn-3d flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'quiz'
              ? 'btn-3d-rose text-white font-extrabold'
              : 'btn-3d-white text-slate-700'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>📝 Formative Quiz ({lessonPlan.formativeQuiz.length} Qs)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('routes')}
          className={`btn-3d flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'routes'
              ? 'bg-purple-600 text-white shadow-md border-b-4 border-b-purple-800 font-extrabold'
              : 'btn-3d-white text-slate-700'
          }`}
        >
          <Split className="w-3.5 h-3.5" />
          <span>🔀 Adaptive Content Routes</span>
        </button>
      </div>

      {/* Tab 1: Timeline & Lesson Sequence */}
      {activeSubTab === 'timeline' && (
        <div className="space-y-4">
          
          {/* Active Audio Playback Banner */}
          {activeAudioSlide && (
            <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm flex items-center justify-between animate-fadeIn border border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Volume2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold uppercase tracking-wider border border-blue-400/30">
                      🔊 {activeAudioSlide.lang} Voice Narration Active
                    </span>
                    <span className="text-xs font-bold text-white">
                      Explaining: {activeAudioSlide.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Live natural speech synthesizer playing through classroom audio speaker...
                  </p>
                </div>
              </div>
              <button
                onClick={handleStopAudio}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors flex-shrink-0"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Stop</span>
              </button>
            </div>
          )}

          {/* Learning Objectives Box */}
          <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-xs space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-2">
                <span>Curriculum Learning Objectives</span>
                <span className="text-[10px] text-blue-700 font-mono font-bold">Grounded: NCERT Ch 1</span>
              </h3>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSpeakAllSlides}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                  title="Play full audio walkthrough of all 5 lesson slides sequentially"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>🔊 Play Full Presentation Audio (5 Slides • {isBilingualMode ? 'ALL' : selectedLanguage})</span>
                </button>
              </div>
            </div>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-800">
              {(isKannadaMode && lessonPlan.standardLesson.objectivesKannada 
                ? lessonPlan.standardLesson.objectivesKannada 
                : (isHindiMode ? lessonPlan.standardLesson.objectivesHindi : lessonPlan.standardLesson.objectives)
              ).map((obj, i) => (
                <li key={i} className="flex items-start space-x-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 mt-0.5 flex-shrink-0" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Timeline Sequence Sections */}
          <div className="space-y-3">
            {lessonPlan.standardLesson.sections.map((section, idx) => {
              const isExpanded = expandedSections[section.id] !== false;
              const sectionTitle = isKannadaMode && section.titleKannada 
                ? section.titleKannada 
                : (isHindiMode && section.titleHindi ? section.titleHindi : section.title);

              const activePoints = isKannadaMode && section.teacherTalkingPointsKannada && section.teacherTalkingPointsKannada.length > 0
                ? section.teacherTalkingPointsKannada
                : (isHindiMode && section.teacherTalkingPointsHindi && section.teacherTalkingPointsHindi.length > 0
                  ? section.teacherTalkingPointsHindi
                  : section.teacherTalkingPoints);

              const isThisSlideSpeaking = activeAudioSlide?.id === section.id;

              return (
                <div
                  key={section.id}
                  className={`rounded-xl bg-white border transition-all duration-200 shadow-xs ${
                    isThisSlideSpeaking ? 'border-sky-500 ring-2 ring-sky-300' : 'border-slate-200'
                  }`}
                >
                  <div
                    onClick={() => toggleSection(section.id)}
                    className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                      isThisSlideSpeaking ? 'bg-sky-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold border ${
                        isThisSlideSpeaking ? 'bg-sky-600 text-white border-sky-600' : 'bg-sky-100 text-sky-800 border-sky-200'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-slate-900">
                            {sectionTitle}
                          </h4>
                          {isBilingualMode && section.titleHindi && (
                            <span className="text-xs text-slate-500">({section.titleHindi})</span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-xs text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                            ⏱️ {section.timeAllocationMinutes} Minutes
                          </span>
                          
                          {/* Explicit Material Provenance Badge */}
                          {section.groundedInCitation.includes('NCERT') ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-bold">
                              📘 Source: NCERT 2026 Textbook
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 font-bold">
                              📄 Source: Teacher Uploaded Notes
                            </span>
                          )}

                          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                            Ref: {section.groundedInCitation}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlaySlideAudio(section);
                        }}
                        title={`Explain slide ${idx + 1} in ${selectedLanguage}`}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-all shadow-xs ${
                          isThisSlideSpeaking
                            ? 'bg-sky-600 text-white ring-2 ring-sky-300 animate-pulse'
                            : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Explain Slide ({isBilingualMode ? 'ALL' : selectedLanguage.slice(0, 2).toUpperCase()})</span>
                      </button>
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/60 space-y-3 mt-1">
                      
                      {/* Multilingual Voice Slide Narration Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-sky-200 shadow-xs">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-sky-950">
                          <Volume2 className="w-4 h-4 text-sky-600" />
                          <span>1-Click Voice Slide Narration:</span>
                        </div>
                        <div className="flex items-center flex-wrap gap-1.5">
                          <button
                            onClick={() => handlePlaySlideAudio(section, 'English')}
                            className={`px-2.5 py-1 rounded-lg font-bold border text-[11px] shadow-xs cursor-pointer flex items-center space-x-1 transition-all ${
                              isThisSlideSpeaking && activeAudioSlide?.lang === 'English'
                                ? 'bg-sky-600 text-white border-sky-600'
                                : 'bg-slate-50 hover:bg-sky-100 text-slate-800 border-slate-200'
                            }`}
                            title="Speak slide in English"
                          >
                            <span>🇬🇧 English</span>
                          </button>
                          <button
                            onClick={() => handlePlaySlideAudio(section, 'Hindi')}
                            className={`px-2.5 py-1 rounded-lg font-bold border text-[11px] shadow-xs cursor-pointer flex items-center space-x-1 transition-all ${
                              isThisSlideSpeaking && activeAudioSlide?.lang === 'Hindi'
                                ? 'bg-amber-600 text-white border-amber-600'
                                : 'bg-slate-50 hover:bg-amber-100 text-amber-900 border-slate-200'
                            }`}
                            title="हिंदी में स्लाइड समझें"
                          >
                            <span>🇮🇳 हिंदी</span>
                          </button>
                          <button
                            onClick={() => handlePlaySlideAudio(section, 'Kannada')}
                            className={`px-2.5 py-1 rounded-lg font-bold border text-[11px] shadow-xs cursor-pointer flex items-center space-x-1 transition-all ${
                              isThisSlideSpeaking && activeAudioSlide?.lang === 'Kannada'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-slate-50 hover:bg-emerald-100 text-emerald-900 border-slate-200'
                            }`}
                            title="ಕನ್ನಡದಲ್ಲಿ ವಿವರಣೆ ಕೇಳಿ"
                          >
                            <span>🌿 ಕನ್ನಡ</span>
                          </button>
                          <button
                            onClick={() => handlePlaySlideAudio(section, 'Bilingual')}
                            className={`px-3 py-1 rounded-lg font-bold text-[11px] shadow-xs cursor-pointer flex items-center space-x-1 transition-all ${
                              isThisSlideSpeaking && activeAudioSlide?.lang.includes('ALL')
                                ? 'bg-indigo-700 text-white ring-2 ring-indigo-300'
                                : 'bg-sky-600 hover:bg-sky-700 text-white'
                            }`}
                            title="Play Full Bilingual / Multilingual Slide Audio"
                          >
                            <span>🌐 ALL (Bilingual)</span>
                          </button>
                        </div>
                      </div>

                      {/* Teacher Talking Points */}
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                          <span>Teacher Talking Points (Classroom Script)</span>
                          <span className="text-[10px] text-slate-500 font-medium font-mono">{selectedLanguage} Script</span>
                        </div>
                        <div className="space-y-1.5">
                          {activePoints.map((point, pi) => (
                            <div key={pi} className="flex items-start space-x-2 text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200">
                              <span className="text-sky-600 font-bold font-mono">›</span>
                              <span className="leading-relaxed">{point}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Student Activity */}
                      {section.studentActivities && section.studentActivities.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            Interactive Student Activity
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {section.studentActivities.map((act, ai) => (
                              <div key={ai} className="text-xs text-teal-900 bg-teal-50 border border-teal-200 p-2 rounded-lg flex items-center space-x-1.5 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                <span>{act}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Scaffolding Tips if at-risk */}
                      {section.scaffoldingTips && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-start space-x-2 text-xs text-amber-900">
                          <Brain className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span><strong>Differentiated Scaffolding:</strong> {section.scaffoldingTips}</span>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Tab 2: Beginner Scaffold */}
      {activeSubTab === 'beginner' && (
        <div className="space-y-5">
          
          <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Beginner Differentiated Tier: The "Plant Kitchen" Framework
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                Targeted for 3 Struggling Learners
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Designed specifically for <strong>Aarav Sharma, Priya Patel, and Rohan Verma</strong> who struggled with multi-step abstract reactions in recent diagnostic assessments.
            </p>

            {/* Core Analogy Card */}
            <div className="bg-white border border-emerald-300 rounded-xl p-4 space-y-2 shadow-xs">
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex flex-wrap items-center justify-between gap-2">
                <span>The Core Visual Analogy (English, Hindi & Kannada)</span>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => onSpeakText(lessonPlan.beginnerExplanation.keyAnalogy, 'English')}
                    className="px-2 py-0.5 rounded bg-slate-50 hover:bg-sky-50 text-[10px] text-sky-800 font-bold border border-slate-200 cursor-pointer"
                    title="Speak in English"
                  >
                    🔊 EN
                  </button>
                  <button
                    onClick={() => onSpeakText(lessonPlan.beginnerExplanation.keyAnalogyHindi, 'Hindi')}
                    className="px-2 py-0.5 rounded bg-slate-50 hover:bg-amber-50 text-[10px] text-amber-900 font-bold border border-slate-200 cursor-pointer"
                    title="हिंदी में सुनें"
                  >
                    🔊 HI
                  </button>
                  <button
                    onClick={() => onSpeakText("ಸಸ್ಯದ ಅಡುಗೆಮನೆ: ಎಲೆಗಳು ಸೌರ ಅಡುಗೆಮನೆಯಂತೆ ಕೆಲಸ ಮಾಡುತ್ತವೆ, ಅಲ್ಲಿ ಸೂರ್ಯನ ಬೆಳಕು, ನೀರು ಮತ್ತು CO2 ಸೇರಿ ಆಹಾರ ತಯಾರಾಗುತ್ತವೆ.", 'Kannada')}
                    className="px-2 py-0.5 rounded bg-slate-50 hover:bg-emerald-50 text-[10px] text-emerald-900 font-bold border border-slate-200 cursor-pointer"
                    title="ಕನ್ನಡದಲ್ಲಿ ಕೇಳಿ"
                  >
                    🔊 KN
                  </button>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                "{lessonPlan.beginnerExplanation.keyAnalogy}"
              </p>
              <p className="text-xs text-emerald-900 font-sans leading-relaxed border-t border-slate-100 pt-2 font-medium">
                "{lessonPlan.beginnerExplanation.keyAnalogyHindi}"
              </p>
            </div>

            {/* Visual Anchors */}
            <div>
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Visual Conceptual Anchors
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {lessonPlan.beginnerExplanation.visualCues.map((cue, i) => (
                  <div key={i} className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 flex items-start space-x-2 shadow-xs">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="font-medium">{cue}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bilingual Vocabulary Glossary */}
            <div>
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Bilingual Science Glossary (Hindi-English Bridge)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lessonPlan.beginnerExplanation.vocabularyGlossary.map((item, i) => (
                  <div key={i} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{item.term}</span>
                      <span className="text-xs font-bold text-sky-700 font-sans">{item.hindiTerm}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">{item.definition}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Tab 3: Advanced Inquiry */}
      {activeSubTab === 'advanced' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-indigo-50/70 border border-indigo-200 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-indigo-700" />
                <h3 className="text-base font-bold text-slate-900">
                  {lessonPlan.advancedActivity.title}
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-300">
                Extension for Vihaan & Ananya
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-indigo-200 space-y-2 shadow-xs">
              <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                Inquiry-Based Scientific Challenge
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {lessonPlan.advancedActivity.inquiryChallenge}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Deep Divergent Questions (Higher-Order Thinking)
              </h4>
              <div className="space-y-2">
                {lessonPlan.advancedActivity.deepQuestions.map((q, i) => (
                  <div key={i} className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 flex items-start space-x-2 shadow-xs">
                    <span className="text-indigo-700 font-bold">Q{i + 1}:</span>
                    <span className="leading-relaxed font-medium">{q}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Hands-on Lab & Extension Apparatus
              </h4>
              <div className="flex flex-wrap gap-2">
                {lessonPlan.advancedActivity.extensionMaterials.map((mat, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 rounded-lg bg-white text-slate-800 border border-slate-200 flex items-center space-x-1.5 shadow-xs font-medium">
                    <FlaskConical className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{mat}</span>
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Tab 4: Visual Diagram & Interactive Hotspots */}
      {activeSubTab === 'diagram' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-4 shadow-xs">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-sky-600" />
                  <span>{lessonPlan.visualDiagram.title}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  High-resolution grounded scientific infographic. Click any hotspot label to inspect mechanics.
                </p>
              </div>

              <span className="text-xs px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 font-bold self-start sm:self-auto">
                Agnes AI Visual Grounding
              </span>
            </div>

            {/* High Res Image Container with Interactive Hotspots */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-md group">
              <img
                src={lessonPlan.visualDiagram.imageUrl}
                alt="Photosynthesis Process Diagram"
                className="w-full h-auto object-cover max-h-[520px]"
              />

              {/* Hotspots overlay */}
              {lessonPlan.visualDiagram.hotspots.map((h, i) => {
                const isSelected = selectedHotspot === i;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedHotspot(i)}
                    style={{ top: `${h.y}%`, left: `${h.x}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'w-7 h-7 bg-sky-600 text-white ring-4 ring-sky-300 scale-125 z-20 font-bold shadow-md'
                        : 'w-6 h-6 bg-white/95 text-sky-800 border border-sky-500/80 hover:scale-110 z-10 font-bold shadow-sm'
                    }`}
                  >
                    <span className="text-[11px] font-black">{i + 1}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Hotspot Detailed Card */}
            {selectedHotspot !== null && (
              <div className="p-4 rounded-xl bg-slate-50 border border-sky-300 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-xs font-bold flex items-center justify-center">
                      {selectedHotspot + 1}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">
                      {lessonPlan.visualDiagram.hotspots[selectedHotspot].label}
                    </h4>
                    <span className="text-xs text-sky-800 font-sans font-bold">
                      ({lessonPlan.visualDiagram.hotspots[selectedHotspot].hindiLabel})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono font-bold">Annotated Region</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {lessonPlan.visualDiagram.hotspots[selectedHotspot].description}
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Tab 5: Formative Quiz & Live Telemetry Engine */}
      {activeSubTab === 'quiz' && (
        <div className="space-y-5">
          {/* Mode Switcher Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Adaptive Item Engine & DKT Live
              </span>
              <span className="text-xs text-slate-500 font-medium">11 Graded NCERT Checkpoints</span>
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setIsInteractiveQuizMode(true)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  isInteractiveQuizMode ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🎮 Interactive Engine & Telemetry
              </button>
              <button
                onClick={() => setIsInteractiveQuizMode(false)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  !isInteractiveQuizMode ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📄 Blueprint Overview
              </button>
            </div>
          </div>

          {/* Render Interactive Engine or Static List */}
          {isInteractiveQuizMode ? (
            <FormativeQuizEngine
              lessonPlan={lessonPlan}
              selectedLanguage={selectedLanguage}
              onSpeakText={onSpeakText}
              initialMode="quiz"
            />
          ) : (
            <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4 shadow-xs">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <HelpCircle className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Formative Diagnostic Quiz ({lessonPlan.formativeQuiz.length} Questions)
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Targeting identified learning gaps for Oct 14 Exam
                </span>
              </div>

              <div className="space-y-4">
                {lessonPlan.formativeQuiz.map((q, qi) => (
                  <div key={q.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 shadow-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-2.5">
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
                          Q{qi + 1}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-relaxed">
                            {isHindiMode ? q.questionHindi : q.question}
                          </h4>
                          {isBilingualMode && (
                            <p className="text-xs text-slate-500 mt-1 font-medium">{q.questionHindi}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white text-slate-600 uppercase font-mono font-bold border border-slate-200 flex-shrink-0">
                        {q.difficulty}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                      {(isHindiMode ? q.optionsHindi : q.options).map((opt, oi) => {
                        const isCorrect = oi === q.correctAnswerIndex;
                        return (
                          <div
                            key={oi}
                            className={`p-2.5 rounded-lg border text-xs flex items-center justify-between font-medium ${
                              isCorrect
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                : 'bg-white border-slate-200 text-slate-800'
                            }`}
                          >
                            <span>{opt}</span>
                            {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-2 flex-shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-start space-x-1.5 font-medium">
                      <strong className="text-slate-900">Concept:</strong>
                      <span>{q.targetedConcept} • {isHindiMode ? q.explanationHindi : q.explanation}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      )}

      {/* Tab 6: Adaptive Content, Not Just Adaptive Difficulty */}
      {activeSubTab === 'routes' && (
        <div className="space-y-4">
          
          {/* Paradigm Card */}
          <div className="rounded-2xl bg-slate-900 text-white p-6 shadow-xs border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center space-x-1">
                <Split className="w-3.5 h-3.5 mr-1" /> Multi-Route Pedagogical Mastery
              </span>
              <span className="text-xs text-slate-400">Adaptive Content Routes</span>
            </div>
            
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Different Students Take Different Paths Toward The Same Learning Objective
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Traditional ed-tech only changes difficulty (<em>"Easy question → hard question"</em>). Shiksha differentiates the pedagogical delivery route while keeping the rigor and learning standard 100% unified.
            </p>
          </div>

          {/* 3 Routes Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MOCK_ADAPTIVE_ROUTES.map((route, idx) => (
              <div 
                key={route.id} 
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 transition-all shadow-xs space-y-3.5 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
                      {route.studentPersona}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Pathway {idx + 1}</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{route.studentName}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Preference: <strong className="text-purple-900">{route.preferenceDescription}</strong>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Differentiated Route Flow:</div>
                    <div className="space-y-1.5">
                      {route.routeSteps.map((step, si) => (
                        <div key={si} className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                            {si + 1}
                          </span>
                          <span className="font-medium text-slate-800 text-[11px] leading-tight">{step.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center space-x-1 text-emerald-700 font-bold">
                    <Target className="w-3.5 h-3.5 mr-1" />
                    <span>Same Core Objective</span>
                  </span>
                  <span className="text-purple-700 font-bold text-[11px]">Active Route</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
