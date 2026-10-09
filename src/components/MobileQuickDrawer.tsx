import React from 'react';
import { 
  X, 
  Sparkles, 
  Languages, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Cpu, 
  LogOut, 
  UserCheck, 
  Mic,
  BookOpen,
  Users,
  FileText,
  Network,
  Clock,
  ArrowRight
} from 'lucide-react';
import { LessonPlan } from '../types';
import { AuthUser } from '../services/authService';

interface MobileQuickDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPersona: 'teacher' | 'student';
  setCurrentPersona: (persona: 'teacher' | 'student') => void;
  selectedLanguage: 'English' | 'Hindi' | 'Kannada' | 'Bilingual';
  setSelectedLanguage: (lang: 'English' | 'Hindi' | 'Kannada' | 'Bilingual') => void;
  isSpeaking: boolean;
  onToggleSpeech: () => void;
  onOpenAuditTrail: () => void;
  onOpenAgnesConfig: () => void;
  onOpenBhashiniConfig?: () => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  onSelectPrompt: (promptText: string) => void;
  lessonPlan: LessonPlan;
}

export const MobileQuickDrawer: React.FC<MobileQuickDrawerProps> = ({
  isOpen,
  onClose,
  currentPersona,
  setCurrentPersona,
  selectedLanguage,
  setSelectedLanguage,
  isSpeaking,
  onToggleSpeech,
  onOpenAuditTrail,
  onOpenAgnesConfig,
  onOpenBhashiniConfig,
  currentUser,
  onLogout,
  onSelectPrompt,
  lessonPlan,
}) => {
  if (!isOpen) return null;

  const SHORTCUT_PROMPTS = [
    {
      label: '📅 Schedule Class in 10 min',
      prompt: 'Schedule a class for me in 10 min on Computer Networks TCP Flow Control.',
      badge: 'Calendar'
    },
    {
      label: '🎯 Rahul Weak in Slow Start',
      prompt: 'My student Rahul Sharma is weak in Slow Start, schedule an intervention review and reassessment.',
      badge: 'Remedial'
    },
    {
      label: '📝 Edit Marks for Aarav (9/10)',
      prompt: 'Edit marks for Aarav Sharma to 9 out of 10 in Slow Start.',
      badge: 'Marks'
    },
    {
      label: '🌐 30m CN (Rahul Slow Start Weak)',
      prompt: 'I have a 30-minute class on Computer Networks (CN) to teach TCP Congestion Control and Flow Control. My student Rahul Sharma is weak in Slow Start and Flow Control, so please scaffold the lesson and update his Learning Twin.',
      badge: 'CN Class'
    },
    {
      label: '🌱 40m Photosynthesis (Bilingual)',
      prompt: 'I need a 40-minute Grade 7 science lesson on photosynthesis in English and Hindi with uploaded notes.',
      badge: 'Grade 7'
    },
    {
      label: '⚡ Reduce to 20 Minutes (Behind)',
      prompt: 'The class is behind; reduce this to 20 minutes.',
      badge: 'Replan'
    },
    {
      label: '❓ Siri Q&A: Photosynthesis',
      prompt: 'What is photosynthesis and how do stomata regulate gas exchange?',
      badge: 'Voice AI'
    },
    {
      label: '🌟 ಕನ್ನಡದಲ್ಲಿ ವಿವರಿಸಿ (Kannada)',
      prompt: 'ಕನ್ನಡದಲ್ಲಿ ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ (Photosynthesis) ಪಾಠವನ್ನು ವಿವರಿಸಿ ಮತ್ತು ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ರಸಪ್ರಶ್ನೆ ರಚಿಸಿ.',
      badge: 'ಕನ್ನಡ'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      
      {/* Backdrop touch to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Slide Up Sheet */}
      <div className="bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl max-h-[85vh] overflow-y-auto p-5 space-y-4 animate-slideUp">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 leading-tight">Mobile Quick Menu</h3>
              <p className="text-[10px] text-slate-500">MINDMESH-NEXUS Co-Pilot Tools</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Primary Persona Display (Locked by Role) */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Active Workspace</label>
          {currentUser?.role === 'teacher' ? (
            <div className="p-3 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>👩‍🏫 Teacher Studio</span>
              </div>
              <span className="text-[10px] text-slate-400">Educator</span>
            </div>
          ) : currentUser?.role === 'student' ? (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span>🎓 Student Portal</span>
              </div>
              <span className="text-[10px] text-blue-600 font-semibold">Active</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setCurrentPersona('teacher');
                  onClose();
                }}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  currentPersona === 'teacher'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>👩‍🏫 Teacher View</span>
              </button>
              <button
                onClick={() => {
                  setCurrentPersona('student');
                  onClose();
                }}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  currentPersona === 'student'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>👨‍🎓 Learner View</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. Language Selection */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1">
              <Languages className="w-3.5 h-3.5 text-slate-500" />
              <span>Language Preference</span>
            </label>
            <span className="text-[10px] text-sky-700 font-bold">{selectedLanguage}</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {(['English', 'Hindi', 'Kannada', 'Bilingual'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                  selectedLanguage === lang
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {lang === 'English' ? 'EN' : lang === 'Hindi' ? 'HI (हिंदी)' : lang === 'Kannada' ? 'KN (ಕನ್ನಡ)' : 'ALL'}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Quick Spoken Command Shortcuts */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1">
            <Mic className="w-3.5 h-3.5 text-rose-500" />
            <span>Instant Voice Shortcuts</span>
          </label>
          <div className="space-y-1.5">
            {SHORTCUT_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelectPrompt(item.prompt);
                  onClose();
                }}
                className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-xs text-slate-800 transition-all flex items-center justify-between cursor-pointer"
              >
                <span className="font-semibold truncate pr-2">{item.label}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200 flex-shrink-0">
                  {item.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Utility Actions Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => {
              onToggleSpeech();
              onClose();
            }}
            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center space-x-1.5"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4 text-sky-600" />}
            <span>{isSpeaking ? 'Mute Speech' : 'Play TTS Audio'}</span>
          </button>

          <button
            onClick={() => {
              onOpenAuditTrail();
              onClose();
            }}
            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-teal-700 flex items-center justify-center space-x-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Audit Trail</span>
          </button>

          <button
            onClick={() => {
              onOpenAgnesConfig();
              onClose();
            }}
            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-indigo-700 flex items-center justify-center space-x-1.5"
          >
            <Cpu className="w-4 h-4 text-indigo-600" />
            <span>Agnes 3.0</span>
          </button>

          {onOpenBhashiniConfig && (
            <button
              onClick={() => {
                onOpenBhashiniConfig();
                onClose();
              }}
              className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-800 flex items-center justify-center space-x-1.5 col-span-2"
            >
              <span>🇮🇳 Bhashini Voice AI Settings</span>
            </button>
          )}

          {currentUser && onLogout && (
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center justify-center space-x-1.5"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Sign Out</span>
            </button>
          )}
        </div>

        {/* User Info Footer */}
        {currentUser && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Signed in as: <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.role})</span>
            <span className="text-[10px] font-mono text-emerald-600">● Online</span>
          </div>
        )}

      </div>
    </div>
  );
};
