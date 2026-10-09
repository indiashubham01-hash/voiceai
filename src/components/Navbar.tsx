import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  FileText, 
  Users, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Languages, 
  CheckCircle2, 
  LogOut, 
  Lock, 
  Cpu, 
  Network, 
  Menu, 
  Calendar as CalendarIcon, 
  Layers,
  Flame,
  Zap,
  ChevronDown
} from 'lucide-react';
import { LessonPlan } from '../types';
import { AuthUser } from '../services/authService';

interface NavbarProps {
  currentPersona: 'teacher' | 'student';
  setCurrentPersona: (persona: 'teacher' | 'student') => void;
  activeTeacherTab: 'lesson' | 'curriculum' | 'calendar' | 'sources' | 'students' | 'graph';
  setActiveTeacherTab: (tab: 'lesson' | 'curriculum' | 'calendar' | 'sources' | 'students' | 'graph') => void;
  lessonPlan: LessonPlan;
  isSpeaking: boolean;
  onToggleSpeech: () => void;
  onOpenAuditTrail: () => void;
  onOpenAgnesConfig: () => void;
  onOpenBhashiniConfig?: () => void;
  selectedLanguage: 'English' | 'Hindi' | 'Kannada' | 'Bilingual';
  setSelectedLanguage: (lang: 'English' | 'Hindi' | 'Kannada' | 'Bilingual') => void;
  isTeacherAuthenticated: boolean;
  onRequestTeacherAccess: () => void;
  onLockTeacherAccess: () => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  onOpenMobileDrawer?: () => void;
  onTogglePageReader?: () => void;
  isPageReaderOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPersona,
  setCurrentPersona,
  activeTeacherTab,
  setActiveTeacherTab,
  lessonPlan,
  isSpeaking,
  onToggleSpeech,
  onOpenAuditTrail,
  onOpenAgnesConfig,
  onOpenBhashiniConfig,
  selectedLanguage,
  setSelectedLanguage,
  isTeacherAuthenticated,
  onRequestTeacherAccess,
  onLockTeacherAccess,
  currentUser,
  onLogout,
  onOpenMobileDrawer,
  onTogglePageReader,
  isPageReaderOpen,
}) => {
  const [showAiMenu, setShowAiMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      
      {/* 1. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4">
          
          {/* Left: Brand Identity */}
          <div className="flex items-center space-x-2.5 sm:space-x-3.5 flex-shrink-0">
            <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 font-outfit">
                  MINDMESH<span className="text-blue-600">-NEXUS</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold tracking-wide">
                  <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                  VOICE AI EDTECH
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Grade {lessonPlan.grade} {lessonPlan.subject}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-700 font-semibold">NCERT 2026 Ground Truth</span>
              </p>
            </div>
          </div>

          {/* Center: Role-Based Workspace Indicator (Strictly Locked to Authenticated Role) */}
          <div className="hidden md:flex items-center">
            {currentUser ? null : (
              <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  onClick={() => setCurrentPersona('teacher')}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    currentPersona === 'teacher'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>👩‍🏫 Teacher Studio</span>
                </button>

                <button
                  onClick={() => setCurrentPersona('student')}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    currentPersona === 'student'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>🎓 Student Arena</span>
                </button>
              </div>
            )}
          </div>

          {/* Right: Consolidated Action Toolbar */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5">
            
            {/* Language Selector Pill */}
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs">
              <Languages className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-0.5 hidden lg:inline" />
              <button
                onClick={() => setSelectedLanguage('English')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  selectedLanguage === 'English' 
                    ? 'bg-white text-blue-700 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="English Curriculum"
              >
                EN
              </button>
              <button
                onClick={() => setSelectedLanguage('Hindi')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  selectedLanguage === 'Hindi' 
                    ? 'bg-white text-blue-700 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="हिंदी (Hindi)"
              >
                हिं
              </button>
              <button
                onClick={() => setSelectedLanguage('Kannada')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  selectedLanguage === 'Kannada' 
                    ? 'bg-white text-blue-700 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="ಕನ್ನಡ (Kannada)"
              >
                ಕನ್ನ
              </button>
              <button
                onClick={() => setSelectedLanguage('Bilingual')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  selectedLanguage === 'Bilingual' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Multilingual Tri-Lingual Mode"
              >
                ALL
              </button>
            </div>

            {/* Voice TTS Speaker Toggle */}
            <button
              onClick={onToggleSpeech}
              title={isSpeaking ? "Mute Voice Tutor" : "Play Socratic Voice Audio"}
              className={`p-2 rounded-lg border transition-all flex items-center justify-center cursor-pointer ${
                isSpeaking 
                  ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-200'
                  : 'bg-white border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              {isSpeaking ? (
                <div className="flex items-center gap-0.5">
                  <span className="w-1 h-3 bg-white rounded-full animate-bounce" />
                  <span className="w-1 h-4 bg-white rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1 h-2 bg-white rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            {/* Bhashini Page Reader Toggle Button */}
            {onTogglePageReader && (
              <button
                onClick={onTogglePageReader}
                className={`hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  isPageReaderOpen
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
                title="Open Bhashini Indic Page Reader to listen to this view"
              >
                <Volume2 className={`w-3.5 h-3.5 ${isPageReaderOpen ? 'text-white animate-pulse' : 'text-emerald-600'}`} />
                <span>Read Page</span>
              </button>
            )}

            {/* AI Brain Hub Modal Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowAiMenu(!showAiMenu)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold transition-all cursor-pointer"
                title="AI Brain Engines (Bhashini Indic AI, Agnes 3.0, FastAPI 8000)"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="hidden sm:inline">AI Engines</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {/* AI Engines Dropdown Menu */}
              {showAiMenu && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-lg p-2.5 space-y-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setShowAiMenu(false)}
                >
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1.5 py-1">
                    Connected AI Engines
                  </div>

                  {/* Groq Cloud Ultra-Fast AI */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/80 hover:bg-amber-100/80 text-amber-950 text-xs font-medium border border-amber-200 transition-all text-left">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
                      <div>
                        <div className="font-semibold flex items-center gap-1">
                          <span>Groq Cloud LPU</span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-200 text-amber-900 font-mono font-bold">1st Layer</span>
                        </div>
                        <div className="text-[10px] text-amber-700">Voice Recognition & Dynamic Scheduler</div>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-200/80 text-[9px] text-emerald-950 font-bold">&lt;200ms</span>
                  </div>

                  {onOpenBhashiniConfig && (
                    <button
                      onClick={() => { setShowAiMenu(false); onOpenBhashiniConfig(); }}
                      className="w-full flex items-center justify-between p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 text-xs font-medium border border-emerald-200 transition-all text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🇮🇳</span>
                        <div>
                          <div className="font-semibold">Bhashini Indic AI</div>
                          <div className="text-[10px] text-emerald-700">Conformer ASR & IndicTTS</div>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-200/80 text-[9px] text-emerald-950 font-bold">Active</span>
                    </button>
                  )}

                  <button
                    onClick={() => { setShowAiMenu(false); onOpenAgnesConfig(); }}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-blue-50 hover:bg-blue-100/80 text-blue-900 text-xs font-medium border border-blue-200 transition-all text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="font-semibold">Agnes 3.0 Flash</div>
                        <div className="text-[10px] text-blue-700">512K Context Gateway</div>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-blue-200/80 text-[9px] text-blue-950 font-bold">10 RPM</span>
                  </button>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <div>
                        <div className="font-semibold">FastAPI Brain</div>
                        <div className="text-[10px] text-slate-500">Port :8000 GNN Engine</div>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 text-[9px] text-slate-700 font-mono font-bold">Live</span>
                  </div>

                  <button
                    onClick={() => { setShowAiMenu(false); onOpenAuditTrail(); }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-slate-700 text-xs font-medium transition-all text-left cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-500" />
                    <span>View AI Decision Audit Trail</span>
                  </button>
                </div>
              )}
            </div>

            {/* Authenticated User Profile Chip */}
            {currentUser && (
              <div className="flex items-center space-x-1.5 pl-1.5 sm:pl-2 border-l border-slate-200">
                <div className="flex items-center space-x-2 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="w-6 h-6 rounded-md bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-900 leading-none truncate max-w-[90px]">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium mt-0.5">
                      {currentUser.role === 'teacher' ? '👨‍🏫 Educator' : '⭐ Student'}
                    </span>
                  </div>
                </div>

                {onLogout && (
                  <button
                    onClick={onLogout}
                    title="Sign Out"
                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-700 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Mobile Drawer Toggle */}
            {onOpenMobileDrawer && (
              <button
                onClick={onOpenMobileDrawer}
                className="md:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                title="Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

          </div>

        </div>
      </div>

      {/* 2. Secondary Teacher Command Bar */}
      {currentPersona === 'teacher' && (
        <div className="hidden md:block w-full bg-slate-50/90 border-t border-slate-200 py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 overflow-x-auto">
            
            {/* Teacher Category Tabs */}
            <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5 scrollbar-none">
              <button
                onClick={() => setActiveTeacherTab('lesson')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeTeacherTab === 'lesson'
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>3-Tier Lesson Studio</span>
                {lessonPlan.isReplanned && (
                  <span className={`ml-1 px-1.5 py-0.2 text-[9px] rounded font-bold ${
                    activeTeacherTab === 'lesson' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'
                  }`}>
                    20m
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTeacherTab('curriculum')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeTeacherTab === 'curriculum'
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Curriculum Modules</span>
              </button>

              <button
                onClick={() => setActiveTeacherTab('calendar')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeTeacherTab === 'calendar'
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Classroom Planner</span>
              </button>

              <button
                onClick={() => setActiveTeacherTab('sources')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeTeacherTab === 'sources'
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Source Trust & Conflicts</span>
                {lessonPlan.ignoredSources.length > 0 && (
                  <span className={`ml-1 px-1.5 py-0.2 text-[9px] rounded font-bold ${
                    activeTeacherTab === 'sources' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
                  }`}>
                    1 Excluded
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTeacherTab('students')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeTeacherTab === 'students'
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Learner Twins & Risk</span>
                <span className={`ml-1 px-1.5 py-0.2 text-[9px] rounded font-bold ${
                  activeTeacherTab === 'students' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
                }`}>
                  {lessonPlan.predictedGapsCount} At Risk
                </span>
              </button>

              <button
                onClick={() => setActiveTeacherTab('graph')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeTeacherTab === 'graph'
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <Network className="w-3.5 h-3.5 text-blue-500" />
                <span>GNN Knowledge Graph</span>
              </button>
            </div>

            {/* Right: Approval State & Lock */}
            <div className="flex items-center space-x-2">
              <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border ${
                lessonPlan.approvalState === 'approved' 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : lessonPlan.approvalState === 'reviewing'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}>
                {lessonPlan.approvalState === 'approved' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                )}
                <span className="uppercase tracking-wide text-[11px]">{lessonPlan.approvalState}</span>
              </div>

              <button
                onClick={onLockTeacherAccess}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-xs text-slate-600 hover:text-rose-700 transition-all cursor-pointer font-medium"
                title="Lock Teacher Controls"
              >
                <Lock className="w-3 h-3 text-slate-500" />
                <span>Lock</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </header>
  );
};
