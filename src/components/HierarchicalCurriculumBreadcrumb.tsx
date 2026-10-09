import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, 
  Layers, 
  BookOpen, 
  ChevronDown, 
  ChevronRight, 
  Check, 
  Search, 
  BookMarked,
  Database,
  Laptop,
  Code,
  Cpu,
  Radio
} from 'lucide-react';
import { 
  UNIVERSITIES_DATABASE, 
  University, 
  AcademicScheme, 
  BranchSemester, 
  CurriculumSubject 
} from '../data/curriculumDatabase';
import { 
  curriculumStateManager, 
  CurriculumSelectionState 
} from '../services/curriculumState';

interface BreadcrumbProps {
  className?: string;
  onSubjectChangeNotification?: (subject: CurriculumSubject) => void;
}

export const HierarchicalCurriculumBreadcrumb: React.FC<BreadcrumbProps> = ({ 
  className = '',
  onSubjectChangeNotification 
}) => {
  const [currState, setCurrState] = useState<CurriculumSelectionState>(() => curriculumStateManager.getState());
  const [openDropdown, setOpenDropdown] = useState<'university' | 'scheme' | 'branchSem' | 'subject' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [justChanged, setJustChanged] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Subscribe to global curriculum state changes
  useEffect(() => {
    const unsubscribe = curriculumStateManager.subscribe((newState) => {
      setCurrState(newState);
      setJustChanged(true);
      if (onSubjectChangeNotification) {
        onSubjectChangeNotification(newState.subject);
      }
      const timer = setTimeout(() => setJustChanged(false), 2000);
      return () => clearTimeout(timer);
    });
    return unsubscribe;
  }, [onSubjectChangeNotification]);

  // Click outside listener to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
        setSearchQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectUniversity = (univId: string) => {
    curriculumStateManager.setUniversity(univId);
    setOpenDropdown(null);
    setSearchQuery('');
  };

  const handleSelectScheme = (schemeId: string) => {
    curriculumStateManager.setScheme(schemeId);
    setOpenDropdown(null);
    setSearchQuery('');
  };

  const handleSelectBranchSem = (branchSemId: string) => {
    curriculumStateManager.setBranchSem(branchSemId);
    setOpenDropdown(null);
    setSearchQuery('');
  };

  const handleSelectSubject = (subjectId: string) => {
    curriculumStateManager.setSubject(subjectId);
    setOpenDropdown(null);
    setSearchQuery('');
  };

  // Filtered lists for searchable dropdowns
  const filteredUniversities = UNIVERSITIES_DATABASE.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSchemes = currState.university.schemes.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.badge.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBranchSemesters = currState.scheme.branchSemesters.filter(b =>
    b.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.branchName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubjects = currState.branchSem.subjects.filter(s =>
    s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      ref={containerRef}
      className={`w-full bg-[#0a0f1d] border-y border-slate-800 shadow-md relative z-40 overflow-visible ${className}`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 overflow-visible">
        <div className="flex items-center justify-between gap-3 overflow-visible">
          
          {/* Breadcrumb Navigation Dropdown Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap sm:flex-nowrap overflow-visible">
            
            {/* 1. UNIVERSITY PILL & DROPDOWN */}
            <div className="relative inline-block overflow-visible">
              <button
                type="button"
                onClick={() => {
                  setOpenDropdown(openDropdown === 'university' ? null : 'university');
                  setSearchQuery('');
                }}
                className={`group flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer select-none border ${
                  openDropdown === 'university'
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/30'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-200'
                }`}
                title="Click to choose University / Board"
              >
                <span className="text-cyan-400 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </span>
                <span className="font-bold tracking-tight text-white group-hover:text-cyan-200 transition-colors">
                  {currState.university.name}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  openDropdown === 'university' ? 'rotate-180 text-cyan-400' : ''
                }`} />
              </button>

              {/* University Scroll-Down Dropdown Menu */}
              {openDropdown === 'university' && (
                <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-slate-900 border-2 border-cyan-500/60 rounded-2xl shadow-2xl p-2.5 z-[100] animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between px-2 pb-2 mb-1.5 border-b border-slate-800">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5" />
                      Select University / Board
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {UNIVERSITIES_DATABASE.length} Options
                    </span>
                  </div>

                  {/* Search input */}
                  <div className="relative my-1.5 px-0.5">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search university or board..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      autoFocus
                    />
                  </div>

                  {/* University Options Scrollable List */}
                  <div className="max-h-64 overflow-y-auto space-y-1 mt-1 pr-1 custom-scrollbar">
                    {filteredUniversities.map((univ) => {
                      const isSelected = currState.university.id === univ.id;
                      return (
                        <button
                          key={univ.id}
                          type="button"
                          onClick={() => handleSelectUniversity(univ.id)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-cyan-950 border border-cyan-500 text-cyan-100 font-bold' 
                              : 'hover:bg-slate-800 text-slate-300 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{univ.icon}</span>
                            <div>
                              <p className="text-xs font-bold text-white">{univ.name}</p>
                              <p className="text-[10px] text-slate-400">{univ.type} • {univ.state}</p>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* SEPARATOR 1 */}
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />

            {/* 2. SCHEME PILL & DROPDOWN */}
            <div className="relative inline-block overflow-visible">
              <button
                type="button"
                onClick={() => {
                  setOpenDropdown(openDropdown === 'scheme' ? null : 'scheme');
                  setSearchQuery('');
                }}
                className={`group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer select-none border ${
                  openDropdown === 'scheme'
                    ? 'bg-indigo-950 border-indigo-400 text-indigo-200 ring-2 ring-indigo-500/30'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-200'
                }`}
                title="Click to choose Academic Scheme"
              >
                <span className="text-slate-400 text-xs">Scheme:</span>
                <span className="font-bold text-white group-hover:text-indigo-200 transition-colors">
                  {currState.scheme.name}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  openDropdown === 'scheme' ? 'rotate-180 text-indigo-400' : ''
                }`} />
              </button>

              {/* Scheme Scroll-Down Dropdown Menu */}
              {openDropdown === 'scheme' && (
                <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-slate-900 border-2 border-indigo-500/60 rounded-2xl shadow-2xl p-2.5 z-[100] animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between px-2 pb-2 mb-1.5 border-b border-slate-800">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      Select Academic Scheme
                    </span>
                    <span className="text-[10px] text-slate-400">{currState.university.shortName}</span>
                  </div>

                  {/* Scheme Options Scrollable List */}
                  <div className="max-h-60 overflow-y-auto space-y-1.5 mt-1 pr-1 custom-scrollbar">
                    {filteredSchemes.map((sch) => {
                      const isSelected = currState.scheme.id === sch.id;
                      return (
                        <button
                          key={sch.id}
                          type="button"
                          onClick={() => handleSelectScheme(sch.id)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-indigo-950 border border-indigo-500 text-indigo-100 font-bold' 
                              : 'hover:bg-slate-800 text-slate-300 border border-transparent'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-white">{sch.name}</p>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                                sch.badge === 'Active' 
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' 
                                  : 'bg-slate-800 text-slate-400'
                              }`}>
                                {sch.badge}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">Year Range: {sch.yearRange}</p>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* SEPARATOR 2 */}
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />

            {/* 3. BRANCH & SEMESTER PILL & DROPDOWN (CSE DATA SCIENCE / CSE / AIML / ECE) */}
            <div className="relative inline-block overflow-visible">
              <button
                type="button"
                onClick={() => {
                  setOpenDropdown(openDropdown === 'branchSem' ? null : 'branchSem');
                  setSearchQuery('');
                }}
                className={`group flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer select-none border ${
                  openDropdown === 'branchSem'
                    ? 'bg-purple-950 border-purple-400 text-purple-200 ring-2 ring-purple-500/30'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-200'
                }`}
                title="Click to choose Branch & Specialization"
              >
                <span className="text-purple-400 flex items-center justify-center">
                  <Database className="w-3.5 h-3.5" />
                </span>
                <span className="font-bold text-white group-hover:text-purple-200 transition-colors">
                  {currState.branchSem.label}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  openDropdown === 'branchSem' ? 'rotate-180 text-purple-400' : ''
                }`} />
              </button>

              {/* Branch/Sem Scroll-Down Dropdown Menu */}
              {openDropdown === 'branchSem' && (
                <div className="absolute left-0 top-full mt-2 w-72 sm:w-88 bg-slate-900 border-2 border-purple-500/60 rounded-2xl shadow-2xl p-2.5 z-[100] animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between px-2 pb-2 mb-1.5 border-b border-slate-800">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      Select Branch & Specialization
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {currState.scheme.branchSemesters.length} Branches
                    </span>
                  </div>

                  {/* Branch Options Scrollable List */}
                  <div className="max-h-72 overflow-y-auto space-y-1.5 mt-1 pr-1 custom-scrollbar">
                    {filteredBranchSemesters.map((b) => {
                      const isSelected = currState.branchSem.id === b.id;
                      const isDataScience = b.label.toLowerCase().includes('data science') || b.branchName.toLowerCase().includes('data science');
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => handleSelectBranchSem(b.id)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-purple-950 border border-purple-400 text-purple-100 font-bold shadow-md shadow-purple-900/20' 
                              : isDataScience
                              ? 'bg-purple-950/40 hover:bg-purple-900/50 text-purple-200 border border-purple-800/60'
                              : 'hover:bg-slate-800 text-slate-300 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {isDataScience ? (
                              <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 flex-shrink-0">
                                <Database className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                                <Laptop className="w-4 h-4" />
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-extrabold text-white">{b.label}</p>
                                {isDataScience && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-800 text-purple-200 font-bold border border-purple-600">
                                    ★ Data Science
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400">{b.branchName}</p>
                              <p className="text-[9px] text-cyan-400 font-medium mt-0.5">
                                {b.subjects.length} Subjects: {b.subjects.map(s => s.code).join(', ')}
                              </p>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* SEPARATOR 3 */}
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />

            {/* 4. SUBJECT / COURSE CODE PILL & DROPDOWN */}
            <div className="relative inline-block overflow-visible max-w-xs sm:max-w-md">
              <button
                type="button"
                onClick={() => {
                  setOpenDropdown(openDropdown === 'subject' ? null : 'subject');
                  setSearchQuery('');
                }}
                className={`group flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer select-none border truncate ${
                  openDropdown === 'subject'
                    ? 'bg-emerald-950 border-emerald-400 text-emerald-200 ring-2 ring-emerald-500/30'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-200'
                }`}
                title={`Selected Subject: ${currState.subject.code} - ${currState.subject.title}`}
              >
                <span className="text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-3.5 h-3.5" />
                </span>
                <span className="font-bold text-white group-hover:text-emerald-200 transition-colors truncate">
                  {currState.subject.code} - {currState.subject.title}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                  openDropdown === 'subject' ? 'rotate-180 text-emerald-400' : ''
                }`} />
              </button>

              {/* Subject Scroll-Down Dropdown Menu */}
              {openDropdown === 'subject' && (
                <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 bg-slate-900 border-2 border-emerald-500/60 rounded-2xl shadow-2xl p-2.5 z-[100] animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between px-2 pb-2 mb-1.5 border-b border-slate-800">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <BookMarked className="w-3.5 h-3.5" />
                      Select Course / Subject
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {currState.branchSem.subjects.length} Courses
                    </span>
                  </div>

                  {/* Search input */}
                  <div className="relative my-1.5 px-0.5">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search subject code or name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                      autoFocus
                    />
                  </div>

                  {/* Subject Options Scrollable List */}
                  <div className="max-h-72 overflow-y-auto space-y-1.5 mt-1 pr-1 custom-scrollbar">
                    {filteredSubjects.map((sub) => {
                      const isSelected = currState.subject.id === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => handleSelectSubject(sub.id)}
                          className={`w-full p-2.5 rounded-xl text-left transition-all border cursor-pointer ${
                            isSelected 
                              ? 'bg-emerald-950 border-emerald-400 text-emerald-100 shadow-md' 
                              : 'hover:bg-slate-800 text-slate-300 border-transparent'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-extrabold text-white bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                                  {sub.code}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                                  Credits: {sub.credits}
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-slate-100 mt-1">{sub.title}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {sub.modules.length} Modules • {sub.totalHours} Hours • {sub.category}
                              </p>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Status Badge: Real-Time Sync Indicator */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-300 ${
              justChanged 
                ? 'bg-emerald-950 text-emerald-200 border-emerald-400 animate-pulse shadow-sm shadow-emerald-500/30'
                : 'bg-slate-900 text-slate-300 border-slate-700'
            }`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-semibold tracking-wide">
                {justChanged ? 'Curriculum Synced!' : 'Live Curriculum Synced'}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-900/90 px-2.5 py-1 rounded-full border border-slate-800">
              <span className="text-slate-200 font-semibold">{currState.subject.code}</span>
              <span>•</span>
              <span>{currState.subject.credits} Credits</span>
              <span>•</span>
              <span className="text-cyan-400 font-medium">{currState.subject.modules.length} Modules</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
