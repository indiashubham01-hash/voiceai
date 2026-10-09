import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  BookOpen, 
  Lock, 
  Unlock, 
  Plus, 
  Video, 
  Image as ImageIcon, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Upload,
  Calendar,
  Zap,
  GraduationCap,
  FileText,
  Download,
  BookMarked,
  Clock,
  Award,
  Code2,
  HelpCircle,
  FolderOpen
} from 'lucide-react';
import { CurriculumTopic } from '../types';
import { sharedState } from '../services/sharedStateManager';
import { curriculumStateManager, CurriculumSelectionState } from '../services/curriculumState';
import { SyllabusModule, CurriculumSubject } from '../data/curriculumDatabase';

interface CurriculumMapViewProps {
  currentPersona: 'teacher' | 'student';
  topics: CurriculumTopic[];
  onOpenLesson?: (topicId: string) => void;
  onScheduleTopic?: (topic: CurriculumTopic) => void;
}

export const CurriculumMapView: React.FC<CurriculumMapViewProps> = ({
  currentPersona,
  topics,
  onOpenLesson,
  onScheduleTopic,
}) => {
  const [currState, setCurrState] = useState<CurriculumSelectionState>(() => curriculumStateManager.getState());
  const [activeTab, setActiveTab] = useState<'modules' | 'pyqs' | 'labs' | 'textbooks'>('modules');
  const [selectedModuleIdx, setSelectedModuleIdx] = useState<number>(0);

  // Fallback selected topic from topics
  const [selectedTopic, setSelectedTopic] = useState<CurriculumTopic>(topics[0] || {
    id: 'top-0',
    title: 'Data Structures Introduction',
    module: 'Module 1: Fundamentals',
    description: 'Introduction to dynamic memory and pointers.',
    isUnlocked: true,
    masteryScore: 85,
    prerequisites: ['Basic C Programming']
  });

  // Attach Diagram / Note Modal
  const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);
  const [noteTitle, setNoteTitle] = useState<string>('');
  const [noteContent, setNoteContent] = useState<string>('');
  const [noteImageUrl, setNoteImageUrl] = useState<string>('');

  // Attach Video Modal
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState<string>('15 min');

  // Subscribe to real-time curriculum changes
  useEffect(() => {
    const unsubscribe = curriculumStateManager.subscribe((newState) => {
      setCurrState(newState);
      setSelectedModuleIdx(0);
    });
    return unsubscribe;
  }, []);

  const activeSubject = currState.subject;
  const activeModule = activeSubject.modules[selectedModuleIdx] || activeSubject.modules[0];

  const handleAttachNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    sharedState.attachDiagramNote(selectedTopic.id, {
      title: noteTitle,
      note: noteContent,
      imageUrl: noteImageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600'
    });

    setIsNoteModalOpen(false);
    setNoteTitle('');
    setNoteContent('');
    setNoteImageUrl('');
  };

  const handleAttachVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim() || !videoUrl.trim()) return;

    sharedState.attachVideoLink(selectedTopic.id, {
      title: videoTitle,
      url: videoUrl,
      duration: videoDuration
    });

    setIsVideoModalOpen(false);
    setVideoTitle('');
    setVideoUrl('');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      
      {/* 1. Dynamic Course Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-700/80 p-5 sm:p-6 shadow-xl text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                {currState.university.name}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-500/40">
                {currState.scheme.name}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-950/80 text-purple-300 border border-purple-500/40">
                {currState.branchSem.label}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Real-Time Synchronized
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span className="text-cyan-400 font-mono">{activeSubject.code}</span>
              <span>-</span>
              <span>{activeSubject.title}</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {activeSubject.overview}
            </p>
          </div>

          {/* Quick Metrics Badge Group */}
          <div className="flex flex-row md:flex-col gap-2 flex-shrink-0">
            <div className="flex items-center gap-3 bg-slate-950/60 backdrop-blur-md border border-slate-800 p-3 rounded-2xl">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Credits</p>
                <p className="text-sm font-extrabold text-white">{activeSubject.credits} Credits</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-950/60 backdrop-blur-md border border-slate-800 p-3 rounded-2xl">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Teaching</p>
                <p className="text-sm font-extrabold text-white">{activeSubject.totalHours} Hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-800/80 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('modules')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'modules'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Syllabus Modules (5 Units)</span>
          </button>

          <button
            onClick={() => setActiveTab('pyqs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'pyqs'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Model Papers & PYQs ({activeSubject.examPapers?.length || 0})</span>
          </button>

          {activeSubject.labExperiments && activeSubject.labExperiments.length > 0 && (
            <button
              onClick={() => setActiveTab('labs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'labs'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Lab Programs ({activeSubject.labExperiments.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('textbooks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'textbooks'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Textbooks & References</span>
          </button>
        </div>
      </div>

      {/* 2. Main Content Area according to Active Tab */}
      {activeTab === 'modules' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left Column: 5 Modules Accordion/List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-600" />
                <span>Units & Modules</span>
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {activeSubject.modules.length} Modules Total
              </span>
            </div>

            {activeSubject.modules.map((mod, idx) => {
              const isSelected = selectedModuleIdx === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedModuleIdx(idx)}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/10 border-cyan-500/60 ring-2 ring-cyan-500/20 shadow-md'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                          isSelected ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          Module {mod.moduleNumber}
                        </span>
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {mod.hours} Hours
                        </span>
                        {mod.pyqFrequency && (
                          <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                            mod.pyqFrequency === 'Very High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            PYQ: {mod.pyqFrequency}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 pt-0.5 leading-snug">
                        {mod.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {mod.description}
                      </p>
                    </div>

                    <ArrowRight className={`w-4 h-4 mt-1 transition-transform ${
                      isSelected ? 'text-cyan-600 translate-x-1' : 'text-slate-300'
                    }`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Module View */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-5 sticky top-20">
              
              {/* Module Header */}
              <div className="border-b border-slate-100 pb-4 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 font-bold text-xs">
                    Module {activeModule.moduleNumber} of 5
                  </span>
                  <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-semibold text-xs">
                    Bloom's: {activeModule.bloomsLevel}
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                  {activeModule.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {activeModule.description}
                </p>
              </div>

              {/* Topics Breakdown */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Key Syllabus Topics & Sub-Sections</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeModule.topics.map((topic, i) => (
                    <div 
                      key={i} 
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-800 flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" />
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Outcomes */}
              {activeModule.courseOutcomes && activeModule.courseOutcomes.length > 0 && (
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/70 space-y-1.5">
                  <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Mapped Course Outcomes (COs)</span>
                  </h4>
                  <ul className="space-y-1">
                    {activeModule.courseOutcomes.map((co, i) => (
                      <li key={i} className="text-xs text-indigo-950 font-medium">
                        • {co}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Formulas or Code Snippets */}
              {activeModule.importantFormulasOrCode && activeModule.importantFormulasOrCode.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Key Formulas & Standard Algorithms</span>
                  </h4>
                  <div className="space-y-1">
                    {activeModule.importantFormulasOrCode.map((code, i) => (
                      <pre key={i} className="text-xs font-mono text-cyan-200 bg-slate-950 p-2 rounded-lg overflow-x-auto border border-slate-800">
                        {code}
                      </pre>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Textbook Reference */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">Prescribed Reading: </span>
                  <span>{activeModule.recommendedTextbook}</span>
                </div>
                <button
                  onClick={() => onOpenLesson && onOpenLesson(`mod-${activeModule.moduleNumber}`)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Launch Lesson Plan</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* 2. PYQs & Model Papers Tab */}
      {activeTab === 'pyqs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-600" />
              <span>Past Year Question Papers (PYQs) & Model Sets for {activeSubject.code}</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Ground truth verified for {currState.scheme.name}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSubject.examPapers.map((paper, idx) => (
              <div 
                key={idx} 
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-cyan-400 transition-all shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 uppercase">
                    {paper.type}
                  </span>
                  <span className="text-xs font-bold text-slate-600 font-mono">
                    Max: {paper.totalMarks} Marks
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {paper.title}
                </h3>

                <p className="text-xs text-slate-500">
                  Academic Year: <span className="font-semibold text-slate-700">{paper.year}</span> • Scheme: <span className="font-semibold text-slate-700">{paper.scheme}</span>
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Solutions Attached
                  </span>
                  <button
                    onClick={() => alert(`Opening ${paper.title}`)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>View Paper</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Lab Programs Tab */}
      {activeTab === 'labs' && activeSubject.labExperiments && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-600" />
              <span>Prescribed Hands-on Laboratory Experiments for {activeSubject.code}</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              VTU / Board Approved Lab Syllabus
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSubject.labExperiments.map((exp, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">
                    {exp.id.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Practical Core</span>
                </div>

                <h3 className="text-sm font-extrabold text-slate-900">
                  {exp.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {exp.objective}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-indigo-600 font-bold">
                    C / C++ Compiler Ready
                  </span>
                  <button
                    onClick={() => alert(`Launching compiler workspace for ${exp.title}`)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Code2 className="w-3 h-3" />
                    <span>Open in Code Runner</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Textbooks Tab */}
      {activeTab === 'textbooks' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-cyan-600" />
              <span>Official Prescribed Textbooks & References</span>
            </h2>

            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Prescribed Textbooks:
              </h3>
              <div className="space-y-2">
                {activeSubject.textbooks.map((tb, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-800 font-bold flex items-center justify-center flex-shrink-0">
                      T{i + 1}
                    </span>
                    <span className="font-semibold">{tb}</span>
                  </div>
                ))}
              </div>

              {activeSubject.referenceBooks && activeSubject.referenceBooks.length > 0 && (
                <>
                  <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider pt-2">
                    Reference Books:
                  </h3>
                  <div className="space-y-2">
                    {activeSubject.referenceBooks.map((rb, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-800 font-bold flex items-center justify-center flex-shrink-0">
                          R{i + 1}
                        </span>
                        <span className="font-medium">{rb}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
