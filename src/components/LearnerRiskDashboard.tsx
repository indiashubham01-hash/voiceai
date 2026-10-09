import React, { useState } from 'react';
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Brain, 
  CheckCircle2, 
  Languages, 
  Sparkles, 
  Activity, 
  HelpCircle,
  Clock,
  ArrowUpRight,
  ArrowRight,
  GitBranch,
  Layers,
  ShieldCheck,
  Check,
  X,
  Edit3,
  Compass,
  FileCheck,
  Split,
  Target,
  FileText,
  Search,
  ArrowUpDown,
  GraduationCap,
  Award,
  Trophy,
  Download,
  BarChart3
} from 'lucide-react';
import { Student, AdaptiveRoute, TeacherCopilotRecommendation } from '../types';
import { Network, Plus, CheckCircle, Calendar } from 'lucide-react';
import { MOCK_ADAPTIVE_ROUTES, MOCK_TEACHER_RECOMMENDATIONS } from '../data/mockData';
import { sharedState } from '../services/sharedStateManager';
import { apiClient } from '../services/apiClient';

interface LearnerRiskDashboardProps {
  students: Student[];
  onSelectStudent?: (student: Student) => void;
  onOpenGraphTab?: () => void;
}

export const LearnerRiskDashboard: React.FC<LearnerRiskDashboardProps> = ({
  students,
  onOpenGraphTab,
}) => {
  const [selectedStudent, setSelectedStudent] = useState<Student>(students[0]);
  const [mainTab, setMainTab] = useState<'cohort' | 'diagnostics'>('cohort');
  const [filterRisk, setFilterRisk] = useState<'all' | 'high' | 'moderate' | 'safe'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'success-desc' | 'success-asc' | 'risk-desc' | 'name-asc'>('success-desc');
  const [twinViewMode, setTwinViewMode] = useState<'twin' | 'adaptation' | 'evidence' | 'routes' | 'simulator' | 'overview'>('twin');
  const [recommendationState, setRecommendationState] = useState<'pending' | 'applied' | 'modified' | 'ignored'>('pending');
  const [recommendationMinutes, setRecommendationMinutes] = useState<number>(7);
  const [showModifyModal, setShowModifyModal] = useState<boolean>(false);

  // Edit Assessment Marks Modal State
  const [isEditMarksOpen, setIsEditMarksOpen] = useState<boolean>(false);
  const [markConcept, setMarkConcept] = useState<string>('Slow Start (Exponential)');
  const [markScore, setMarkScore] = useState<number>(8);
  const [markMaxScore, setMarkMaxScore] = useState<number>(10);
  const [markQuizTitle, setMarkQuizTitle] = useState<string>('Classroom Formative Assessment');

  // Schedule Intervention Modal State
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState<boolean>(false);
  const [interventionConcept, setInterventionConcept] = useState<string>('Slow Start Exponential Doubling');
  const [interventionTopic, setInterventionTopic] = useState<string>('Module 3: Transport Layer & TCP Flow');
  const [interventionNotes, setInterventionNotes] = useState<string>('Assigned 3-minute physical reservoir analogy review. Please proceed to reassessment.');

  const handleSaveMarksSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sharedState.updateStudentMarks(
      selectedStudent.id,
      markConcept,
      Number(markScore),
      Number(markMaxScore),
      markQuizTitle
    );
    // Refresh selected student from updated state
    const fresh = sharedState.getStudents().find(s => s.id === selectedStudent.id);
    if (fresh) setSelectedStudent(fresh);
    setIsEditMarksOpen(false);
  };

  const handleScheduleInterventionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sharedState.scheduleIntervention(
      selectedStudent.id,
      selectedStudent.name,
      interventionTopic,
      interventionConcept,
      interventionNotes
    );
    setIsInterventionModalOpen(false);
  };

  const getStudentSuccessScore = (s: Student): number => {
    if (s.recentScores && s.recentScores.length > 0) {
      const avgQuizPct = s.recentScores.reduce((acc, q) => acc + (q.score / (q.maxScore || 10)) * 100, 0) / s.recentScores.length;
      const masteryPct = 100 - s.riskScore;
      return Math.round(avgQuizPct * 0.5 + masteryPct * 0.5);
    }
    return Math.max(10, 100 - s.riskScore);
  };

  const processedStudents = students.map(s => ({
    ...s,
    successScore: getStudentSuccessScore(s)
  }));

  const highRiskStudents = processedStudents.filter(s => s.riskScore >= 70);
  const mediumRiskStudents = processedStudents.filter(s => s.riskScore >= 40 && s.riskScore < 70);
  const lowRiskStudents = processedStudents.filter(s => s.riskScore < 40);

  const classAvgRisk = Math.round(students.reduce((acc, s) => acc + s.riskScore, 0) / (students.length || 1));
  const classAvgSuccess = Math.max(10, 100 - classAvgRisk);
  const proficiencyRate = Math.round((processedStudents.filter(s => s.riskScore < 70).length / (students.length || 1)) * 100);

  const filteredAndSortedStudents = processedStudents
    .filter(s => {
      const matchesSearch = 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.weakConcepts && s.weakConcepts.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        (s.masteredConcepts && s.masteredConcepts.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())));

      if (!matchesSearch) return false;

      if (filterRisk === 'high') return s.riskScore >= 70;
      if (filterRisk === 'moderate') return s.riskScore >= 40 && s.riskScore < 70;
      if (filterRisk === 'safe') return s.riskScore < 40;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'success-desc') return b.successScore - a.successScore;
      if (sortBy === 'success-asc') return a.successScore - b.successScore;
      if (sortBy === 'risk-desc') return b.riskScore - a.riskScore;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return 0;
    });

  const filteredStudents = filteredAndSortedStudents;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Banner: ML Predictive Risk Model */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-1">
                <Brain className="w-3.5 h-3.5 mr-1 text-amber-600" /> Predictive Learner-Gap Risk Engine (ML)
              </span>
              <span className="text-xs text-slate-500 font-medium">Exam Horizon: Next Week</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Classroom Telemetry & Proactive Intervention Planning
            </h2>
            <p className="text-sm text-slate-600 max-w-3xl">
              Analyzes multi-week quiz telemetry, response latency, and concept mastery curves to predict which students will struggle with upcoming topics before exams occur.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
            <div className="text-center px-2">
              <div className="text-xl font-black text-rose-600">{highRiskStudents.length}</div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">High Risk</div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center px-2">
              <div className="text-xl font-black text-amber-600">{mediumRiskStudents.length}</div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Moderate</div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center px-2">
              <div className="text-xl font-black text-emerald-600">{lowRiskStudents.length}</div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Mastered</div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Teacher Copilot — But Not an AI Teacher (AI prepares. Teacher decides.) */}
      <div className="rounded-2xl bg-slate-900 text-white p-5 sm:p-6 shadow-xs border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 mr-1 text-blue-400" /> Human-in-the-Loop Teacher Copilot
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                "AI prepares. Teacher decides."
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              SHIKSHA RECOMMENDS: 8 students are struggling with Flow Control & Slow Start
            </h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Based on live DKT telemetry and GNN risk propagation, 8 students show hesitation on sliding window calculations. Consider adding a <strong>{recommendationMinutes}-minute prerequisite bridge activity</strong> before direct instruction.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            {recommendationState === 'pending' && (
              <>
                <button
                  onClick={() => setRecommendationState('applied')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply ({recommendationMinutes}m Bridge)</span>
                </button>
                <button
                  onClick={() => setShowModifyModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-sky-300" />
                  <span>Modify</span>
                </button>
                <button
                  onClick={() => setRecommendationState('ignored')}
                  className="px-3 py-2 rounded-xl bg-transparent hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 font-medium text-xs transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 mr-1 inline" />
                  <span>Ignore</span>
                </button>
              </>
            )}

            {recommendationState === 'applied' && (
              <div className="flex items-center space-x-2 bg-emerald-950/80 border border-emerald-500/60 px-3.5 py-2 rounded-xl text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>✓ Applied: {recommendationMinutes}m Prerequisite Activity Scheduled</span>
                <button 
                  onClick={() => setRecommendationState('pending')} 
                  className="ml-2 text-[10px] text-slate-300 underline hover:text-white cursor-pointer"
                >
                  Undo
                </button>
              </div>
            )}

            {recommendationState === 'ignored' && (
              <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700 px-3.5 py-2 rounded-xl text-slate-400 text-xs font-medium">
                <X className="w-4 h-4 text-slate-500" />
                <span>Recommendation Ignored (Logged in Audit Trail)</span>
                <button 
                  onClick={() => setRecommendationState('pending')} 
                  className="ml-2 text-[10px] text-sky-400 underline hover:text-white cursor-pointer"
                >
                  Re-evaluate
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Inline Modal to Modify Recommendation */}
        {showModifyModal && (
          <div className="mt-3 p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-300">Modify Prerequisite Activity Parameters:</span>
              <button onClick={() => setShowModifyModal(false)} className="text-slate-400 hover:text-white text-xs">✕ Close</button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs text-slate-300">Duration:</label>
              {[5, 7, 10, 15].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setRecommendationMinutes(mins)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    recommendationMinutes === mins ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {mins} Minutes
                </button>
              ))}
              <button
                onClick={() => {
                  setRecommendationState('applied');
                  setShowModifyModal(false);
                }}
                className="ml-auto px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Save & Apply {recommendationMinutes}m
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mode Switcher Bar: All Students Detail & Cohort Success vs Deep Diagnostics & GNN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMainTab('cohort')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              mainTab === 'cohort'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>All Students Detail & Cohort Success Summary ({students.length})</span>
          </button>

          <button
            onClick={() => setMainTab('diagnostics')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              mainTab === 'diagnostics'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Brain className="w-4 h-4 text-amber-400" />
            <span>Individual Living Twin & GNN Studio</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 font-medium">Cohort Health:</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {classAvgSuccess}% Avg Mastery
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB A: ALL STUDENTS DETAIL & COHORT SUCCESS SUMMARY VIEW      */}
      {/* ------------------------------------------------------------- */}
      {mainTab === 'cohort' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* 1. Cohort Success Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
                <span>Class Success Index</span>
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">{classAvgSuccess}%</div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded-full" style={{ width: `${classAvgSuccess}%` }} />
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Classroom mastery average</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
                <span>Proficiency Pass Rate</span>
                <Award className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-emerald-600">{proficiencyRate}%</div>
              <div className="text-[11px] text-slate-600 font-medium">
                {processedStudents.filter(s => s.riskScore < 70).length} of {students.length} students on track
              </div>
              <div className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded w-fit font-bold">
                Threshold &gt;= 70%
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
                <span>Active Enrollment</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">{students.length} Students</div>
              <div className="text-[11px] text-slate-600 font-medium">CSE Semester 3 • 2026</div>
              <div className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded w-fit font-bold">
                100% Verified Attendance
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
                <span>Intervention Queue</span>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-rose-600">{highRiskStudents.length} Students</div>
              <div className="text-[11px] text-slate-600 font-medium">Requires Socratic Scaffolding</div>
              <div className="text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded w-fit font-bold">
                Active Queue
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
                <span>Quiz Completion</span>
                <FileCheck className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-black text-purple-700">96.4%</div>
              <div className="text-[11px] text-slate-600 font-medium">Formative telemetry synced</div>
              <div className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded w-fit font-bold">
                11 Questions Active
              </div>
            </div>
          </div>

          {/* 2. 5-Module Cohort Mastery Distribution Breakdown */}
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Curriculum 5-Module Cohort Mastery Distribution
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                Aggregated from 147,000+ DKT Graph Interactions
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[
                { mod: 'Module 1', title: 'Stacks & Dynamic Memory', mastery: 91 },
                { mod: 'Module 2', title: 'Queues & Circular Buffers', mastery: 78 },
                { mod: 'Module 3', title: 'Linked Node Chains', mastery: 65 },
                { mod: 'Module 4', title: 'Trees, BST & AVL Balance', mastery: 58 },
                { mod: 'Module 5', title: 'Graphs & BFS/DFS Traversal', mastery: 52 }
              ].map((m, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{m.mod}</span>
                    <span className={`font-black text-xs ${m.mastery >= 75 ? 'text-emerald-700' : (m.mastery >= 60 ? 'text-amber-700' : 'text-rose-600')}`}>
                      {m.mastery}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium truncate">{m.title}</p>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${m.mastery >= 75 ? 'bg-emerald-500' : (m.mastery >= 60 ? 'bg-amber-500' : 'bg-rose-500')}`} 
                      style={{ width: `${m.mastery}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Search, Filter, Sort & Action Controls */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student by name, USN, roll #, or concept..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Filter Tabs & Sort Controls */}
              <div className="flex flex-wrap items-center gap-2">
                
                <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs">
                  <button
                    onClick={() => setFilterRisk('all')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      filterRisk === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({students.length})
                  </button>
                  <button
                    onClick={() => setFilterRisk('high')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      filterRisk === 'high' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🚨 At-Risk ({highRiskStudents.length})
                  </button>
                  <button
                    onClick={() => setFilterRisk('moderate')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      filterRisk === 'moderate' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ⚠️ Moderate ({mediumRiskStudents.length})
                  </button>
                  <button
                    onClick={() => setFilterRisk('safe')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      filterRisk === 'safe' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🌟 Mastered ({lowRiskStudents.length})
                  </button>
                </div>

                <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="success-desc">Sort: Highest Success %</option>
                    <option value="success-asc">Sort: Lowest Success %</option>
                    <option value="risk-desc">Sort: Highest Risk Score</option>
                    <option value="name-asc">Sort: Name (A-Z)</option>
                  </select>
                </div>

              </div>

            </div>

            {/* 4. Complete Student Detailed Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-700 font-extrabold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Student Profile</th>
                    <th className="p-3.5">Overall Success</th>
                    <th className="p-3.5">Risk Level</th>
                    <th className="p-3.5">Mastered Topics</th>
                    <th className="p-3.5">Bottlenecks & Gaps</th>
                    <th className="p-3.5">Recent Quizzes</th>
                    <th className="p-3.5 text-right">Teacher Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredStudents.map((st) => {
                    const isHigh = st.riskScore >= 70;
                    const isMod = st.riskScore >= 40 && st.riskScore < 70;

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* Student Info */}
                        <td className="p-3.5">
                          <div className="flex items-center space-x-3">
                            <img
                              src={st.avatar}
                              alt={st.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs"
                            />
                            <div>
                              <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                                <span>{st.name}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono font-bold">
                                  {st.id}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                                <span>Grade {st.grade}</span>
                                <span>•</span>
                                <span>{st.preferredLanguage}</span>
                                <span>•</span>
                                <span className="capitalize">{st.learningPace} Pace</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Overall Success Score */}
                        <td className="p-3.5 min-w-[140px]">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className={st.successScore >= 75 ? 'text-emerald-700' : (st.successScore >= 60 ? 'text-amber-700' : 'text-rose-600')}>
                                {st.successScore}%
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {st.successScore >= 75 ? 'Mastered' : (st.successScore >= 60 ? 'Moderate' : 'Struggling')}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  st.successScore >= 75 ? 'bg-emerald-500' : (st.successScore >= 60 ? 'bg-amber-400' : 'bg-rose-500')
                                }`}
                                style={{ width: `${st.successScore}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Risk Score */}
                        <td className="p-3.5 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold inline-flex items-center gap-1 border ${
                            isHigh
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : (isMod ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200')
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isHigh ? 'bg-rose-500' : (isMod ? 'bg-amber-500' : 'bg-emerald-500')}`} />
                            {st.riskScore}% Risk
                          </span>
                        </td>

                        {/* Mastered Topics */}
                        <td className="p-3.5 max-w-[180px]">
                          <div className="flex flex-wrap gap-1">
                            {st.masteredConcepts.slice(0, 2).map((c, idx) => (
                              <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium truncate max-w-[150px]">
                                ✓ {c}
                              </span>
                            ))}
                            {st.masteredConcepts.length === 0 && (
                              <span className="text-[10px] text-slate-400 italic">In progress</span>
                            )}
                          </div>
                        </td>

                        {/* Bottlenecks */}
                        <td className="p-3.5 max-w-[180px]">
                          <div className="flex flex-wrap gap-1">
                            {st.weakConcepts.slice(0, 2).map((c, idx) => (
                              <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 font-medium truncate max-w-[150px]">
                                ⚠ {c}
                              </span>
                            ))}
                            {st.weakConcepts.length === 0 && (
                              <span className="text-[10px] text-emerald-700 font-semibold">None detected</span>
                            )}
                          </div>
                        </td>

                        {/* Recent Quizzes */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            {st.recentScores?.slice(-3).map((q, idx) => (
                              <span
                                key={idx}
                                title={`${q.quizName}: ${q.score}/${q.maxScore} (${q.date})`}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                                  q.score >= 7 
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-rose-50 text-rose-800 border-rose-200'
                                }`}
                              >
                                {q.score}/{q.maxScore}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => {
                                setSelectedStudent(st);
                                setMainTab('diagnostics');
                                setTwinViewMode('twin');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                              title="Inspect Living Learner Twin & Diagnostics"
                            >
                              <Brain className="w-3.5 h-3.5 text-sky-600" />
                              <span>Twin</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedStudent(st);
                                setIsEditMarksOpen(true);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                              title="Edit / Add Assessment Marks"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-sky-600" />
                              <span>Marks</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedStudent(st);
                                setIsInterventionModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                              title="Schedule Remedial Intervention"
                            >
                              <Target className="w-3.5 h-3.5 text-amber-600" />
                              <span>Intervene</span>
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB B: INDIVIDUAL LIVING TWIN & GNN DEEP DIAGNOSTICS VIEW     */}
      {/* ------------------------------------------------------------- */}
      {mainTab === 'diagnostics' && (
        <div className="space-y-6 animate-fadeIn">

      {/* DKT Concept DAG & Interactive GNN (Graph Attention Network) Studio */}
      <div className="rounded-xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <span>Graph Neural Network (GNN: GAT) Knowledge Tracing Studio</span>
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
              Architecture: 2-Head GATConv + LeakyReLU Attention
            </span>
            {onOpenGraphTab && (
              <button
                onClick={onOpenGraphTab}
                className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
              >
                <Network className="w-3.5 h-3.5 mr-1" />
                <span>Open Full DAG Visualizer</span>
              </button>
            )}
          </div>
        </div>

        {/* GNN Pipeline Flow Architecture */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold">Pipeline Flow</span>
            <span className="font-mono text-slate-700">[Student Stream] ➔ [Dynamic DAG x_i] ➔ [GAT Layer h_i^(l+1)] ➔ [Sigmoid P(fail)] ➔ [Agnes 3.0 Flash 512K]</span>
          </div>
          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Latency: &lt; 2.1 ms</span>
        </div>

        {/* Interactive Knowledge Graph DAG Nodes with GAT Message Passing */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          
          {/* Node 0: Anatomy */}
          <div className="p-4 rounded-xl bg-slate-50 border border-emerald-200 shadow-sm relative group hover:border-emerald-400 transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">Node 0: Foundational</span>
              <span className="text-[10px] text-slate-500 font-mono">α₀₁ = 0.88</span>
            </div>
            <div className="font-bold text-slate-900 text-sm">Plant Cell & Chloroplasts</div>
            <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
              <div>Accuracy: <strong className="text-emerald-700 font-bold">92%</strong></div>
              <div>Attempts: <strong className="text-slate-800">2 (Fast)</strong></div>
              <div>Hesitation: <strong className="text-emerald-700 font-bold">0.20s</strong></div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-200 flex justify-between items-center text-[10px]">
              <span className="text-slate-500">Prereq Status</span>
              <span className="text-emerald-700 font-bold">MASTERED (ŷ = 0.08)</span>
            </div>
          </div>

          {/* Node 1: Stomata Gas Exchange */}
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-300 shadow-sm relative group hover:border-amber-400 transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">Node 1: Intermediate</span>
              <span className="text-[10px] text-amber-800 font-bold">Root Cause</span>
            </div>
            <div className="font-bold text-amber-900 text-sm">Stomata Gas Dynamics</div>
            <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
              <div>Accuracy: <strong className="text-rose-600 font-bold">35% (Fail)</strong></div>
              <div>Attempts: <strong className="text-amber-800 font-bold">5 (Struggling)</strong></div>
              <div>Hesitation: <strong className="text-rose-600 font-bold">0.85s (High)</strong></div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-amber-200 flex justify-between items-center text-[10px]">
              <span className="text-slate-500">Prereq Status</span>
              <span className="text-rose-600 font-bold">FAILURE POINT (ŷ = 0.65)</span>
            </div>
          </div>

          {/* Node 2: Balanced Stoichiometry */}
          <div className="p-4 rounded-xl bg-rose-50/70 border-2 border-rose-300 shadow-sm relative group transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">Node 2: Downstream</span>
              <span className="text-[10px] text-rose-700 font-bold">● CRITICAL</span>
            </div>
            <div className="font-bold text-rose-950 text-sm">Chemical Stoichiometry</div>
            <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
              <div>Student Status: <span className="text-slate-500 italic">Unattempted</span></div>
              <div>GAT Propagated Risk:</div>
              <div className="text-sm font-black text-rose-700">P(Failure) = 84.6%</div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-rose-200 flex justify-between items-center text-[10px]">
              <span className="text-rose-800 font-bold">FLAG_PROACTIVE_GAP</span>
              <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold text-[9px]">INTERCEPT</span>
            </div>
          </div>

          {/* Node 3: Calvin Cycle */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 opacity-90 group hover:opacity-100 transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">Node 3: Extension</span>
              <span className="text-[10px] text-slate-400 font-medium">Locked</span>
            </div>
            <div className="font-bold text-slate-800 text-sm">Calvin Cycle & Fixation</div>
            <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
              <div>Status: <span className="text-slate-400">Unattempted</span></div>
              <div>Cascaded Risk: <strong className="text-amber-700 font-bold">76.2%</strong></div>
              <div>Pacing: <span className="text-slate-500">Gated until mastery</span></div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-200 flex justify-between items-center text-[10px]">
              <span className="text-slate-400">Prereq Action</span>
              <span className="text-amber-800 font-semibold">Gated by Node 1 & 2</span>
            </div>
          </div>

        </div>

        {/* Attention Weights & Math Formula Visualizer */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-600">
            <div>
              <strong className="text-slate-900 font-bold">GAT Message Passing Equation: </strong>
              <span className="font-mono text-slate-700">h_i^(l+1) = σ( ∑_j α_ij W h_j^(l) )  |  α_ij = softmax( LeakyReLU( a^T [Wh_i || Wh_j] ) )</span>
            </div>
            <div className="text-emerald-700 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
              Attention: α₀₁ = 0.38, α₁₂ = 0.94 (High Dependency)
            </div>
          </div>
          
          <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-[11px] text-slate-700 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
              <span><strong>Autonomous Redirection Rule:</strong> When P(Fail) &gt; 0.65 on target node, pause linear lesson delivery & launch Socratic dialogue on Node 1 (Stomata).</span>
            </div>
            <button 
              onClick={() => alert("GNN Autonomous Intervention Triggered! Calling Agnes 3.0 Flash (POST /v1/chat/completions) with 512K context to generate bilingual Socratic Plant-Kitchen analogies for Aarav Sharma.")}
              className="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Trigger Agnes 3.0 Socratic Path Redesign</span>
            </button>
          </div>
        </div>
      </div>

      {/* Trained ML Models Benchmark Comparison */}
      <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Student Performance & Style Model (1,200 Records)
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
            Best Model: Random Forest (91.25% Acc)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-brand-200 space-y-1">
            <div className="text-[10px] text-slate-500 font-semibold">Random Forest</div>
            <div className="text-xl font-black text-emerald-700">91.25%</div>
            <div className="text-[9px] text-slate-500 font-medium">CV Mean: 92.60% • F1: 91.21%</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] text-slate-500 font-semibold">K-Nearest Neighbors (KNN)</div>
            <div className="text-xl font-black text-blue-700">89.58%</div>
            <div className="text-[9px] text-slate-500 font-medium">CV Mean: 90.10% • F1: 89.52%</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] text-slate-500 font-semibold">Gaussian Naive Bayes</div>
            <div className="text-xl font-black text-amber-700">88.33%</div>
            <div className="text-[9px] text-slate-500 font-medium">CV Mean: 87.81% • F1: 88.57%</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] text-slate-500 font-semibold">Decision Tree (Depth=6)</div>
            <div className="text-xl font-black text-purple-700">85.00%</div>
            <div className="text-[9px] text-slate-500 font-medium">CV Mean: 87.08% • F1: 84.72%</div>
          </div>
        </div>

        <div className="text-[11px] text-slate-600 pt-1 flex flex-wrap items-center justify-between gap-2">
          <span>
            <strong className="text-slate-800">Top Predictive Features: </strong>
            PrerequisiteScore (38.4%) • QuizScore (31.2%) • StudyHours (18.5%) • Attendance (8.2%)
          </span>
          <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">✓ Artifact: backend/models/trained_student_model.pkl</span>
        </div>
      </div>

      {/* Riiid Answer Correctness Deep Knowledge Tracing (DKT) Model */}
      <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              2. Riiid Deep Knowledge Tracing (DKT) Model (147,227 Interactions)
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            Best Model: Random Forest DKT (78.65% ROC-AUC)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-emerald-200 space-y-1">
            <div className="text-[10px] text-slate-500 font-semibold">Random Forest DKT</div>
            <div className="text-xl font-black text-emerald-700">78.65% <span className="text-xs font-normal text-slate-500">AUC</span></div>
            <div className="text-[9px] text-slate-500 font-medium">Acc: 73.82% • F1: 82.11%</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] text-slate-500 font-semibold">Logistic Regression DKT</div>
            <div className="text-xl font-black text-blue-700">78.18% <span className="text-xs font-normal text-slate-500">AUC</span></div>
            <div className="text-[9px] text-slate-500 font-medium">Acc: 73.75% • F1: 82.02%</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] text-slate-500 font-semibold">Decision Tree DKT</div>
            <div className="text-xl font-black text-amber-700">78.09% <span className="text-xs font-normal text-slate-500">AUC</span></div>
            <div className="text-[9px] text-slate-500 font-medium">Acc: 73.42% • F1: 81.50%</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] text-slate-500 font-semibold">Gaussian Naive Bayes</div>
            <div className="text-xl font-black text-purple-700">73.25% <span className="text-xs font-normal text-slate-500">AUC</span></div>
            <div className="text-[9px] text-slate-500 font-medium">Acc: 71.34% • F1: 80.11%</div>
          </div>
        </div>

        <div className="text-[11px] text-slate-600 pt-1 flex flex-wrap items-center justify-between gap-2">
          <span>
            <strong className="text-slate-800">Dataset Scope: </strong>
            147,227 records • 557 unique learners • 11,738 concept questions • User latency & prior explanation features
          </span>
          <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">✓ Artifact: backend/models/trained_riiid_dkt_model.pkl</span>
        </div>
      </div>

      {/* Concept Risk Breakdown Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900">Chemical Equation Balancing</span>
            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold">84% Risk</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full w-[84%]" />
          </div>
          <p className="text-[11px] text-slate-500">
            3 students struggle with conservation of atoms (Aarav, Rohan, Priya).
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900">Stomata Gas Exchange Dynamics</span>
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">58% Risk</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full w-[58%]" />
          </div>
          <p className="text-[11px] text-slate-500">
            Students confuse CO₂ absorption with nocturnal respiration.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900">Chlorophyll & Solar Absorption</span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">24% Risk</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-[24%]" />
          </div>
          <p className="text-[11px] text-slate-500">
            High general understanding; solar trapping concept well retained.
          </p>
        </div>
      </div>

      {/* Main Content: Student Grid + Selected Student Detailed Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Student Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Users className="w-4 h-4 text-brand-600" />
              <span>Student Roster (Grade 7 Science)</span>
            </h3>

            <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setFilterRisk('all')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${filterRisk === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
              >
                All ({students.length})
              </button>
              <button
                onClick={() => setFilterRisk('high')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${filterRisk === 'high' ? 'bg-white text-rose-600 font-bold shadow-sm' : 'text-slate-600'}`}
              >
                At Risk ({highRiskStudents.length})
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredStudents.map((student) => {
              const isSelected = selectedStudent.id === student.id;
              const isHighRisk = student.riskScore >= 70;

              return (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-amber-50/60 border-amber-400 shadow-sm ring-1 ring-amber-300'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{student.name}</h4>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                            {student.preferredLanguage}
                          </span>
                          <span className="text-[10px] text-slate-300">•</span>
                          <span className="text-[10px] text-slate-500 capitalize">{student.learningPace} Pace</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                        isHighRisk
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {student.riskScore}% Risk
                      </div>
                      <div className="text-[9px] text-slate-500 mt-1 uppercase font-semibold">
                        {isHighRisk ? 'Needs Scaffolding' : 'On Track'}
                      </div>
                    </div>
                  </div>

                  {student.weakConcepts.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                      {student.weakConcepts.map((c, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Living Learning Twin & In-Depth Diagnostic */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm h-full flex flex-col">
            
            {/* Student Header with Mode Selector */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3.5">
                <img
                  src={selectedStudent.avatar}
                  alt={selectedStudent.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-sky-400 shadow-sm"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold text-slate-900">{selectedStudent.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-semibold border border-sky-200">
                      Grade {selectedStudent.grade}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Lang: <strong className="text-slate-800">{selectedStudent.preferredLanguage}</strong> • Pace: <strong className="text-slate-800 capitalize">{selectedStudent.learningPace}</strong>
                  </p>
                </div>
              </div>

              {/* Teacher Direct Actions for Selected Student */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsEditMarksOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
                  title="Teacher: Edit assessment marks & recalibrate mastery"
                >
                  <Edit3 className="w-3.5 h-3.5 text-sky-600" />
                  <span>Edit Marks</span>
                </button>

                <button
                  onClick={() => setIsInterventionModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
                  title="Teacher: Schedule an intervention review for this student"
                >
                  <Target className="w-3.5 h-3.5 text-amber-600" />
                  <span>Schedule Intervention</span>
                </button>
              </div>
            </div>

            {/* View Switcher: Living Twin vs Explainable vs Evidence vs Adaptive Routes vs Simulator vs Overview */}
            <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs self-start sm:self-auto gap-1">
                <button
                  onClick={() => setTwinViewMode('twin')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                    twinViewMode === 'twin'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Living Learner Model Tree"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>Living Twin</span>
                </button>
                <button
                  onClick={() => setTwinViewMode('adaptation')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                    twinViewMode === 'adaptation'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Explainable Path Adaptation"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Explainable</span>
                </button>
                <button
                  onClick={() => setTwinViewMode('evidence')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                    twinViewMode === 'evidence'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Learning Evidence Telemetry"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Evidence</span>
                </button>
                <button
                  onClick={() => setTwinViewMode('routes')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                    twinViewMode === 'routes'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Adaptive Content Routes"
                >
                  <Split className="w-3.5 h-3.5" />
                  <span>Routes</span>
                </button>
                <button
                  onClick={() => setTwinViewMode('simulator')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                    twinViewMode === 'simulator'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Live Formative Quiz Simulator"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Live Test</span>
                </button>
                <button
                  onClick={() => setTwinViewMode('overview')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                    twinViewMode === 'overview'
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Overview</span>
                </button>
              </div>

            {/* TAB 1: LIVING LEARNER TWIN (As per User Specification) */}
            {twinViewMode === 'twin' && (
              <div className="space-y-4 flex-1">
                
                {/* Novelty Paradigm Callout */}
                <div className="bg-slate-900 text-white rounded-xl p-3.5 shadow-xs border border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-blue-400">
                      ★ Paradigm Shift: Dynamic Learning Twin
                    </span>
                    <p className="text-xs text-slate-200 font-medium leading-relaxed">
                      Instead of a static number (e.g. <em>"{selectedStudent.name} scored 7/10"</em>), Shiksha represents each learner as a <strong>living, changing learning state</strong> with GAT-propagated concept dependencies.
                    </p>
                  </div>
                </div>

                {/* Living Learner Profile Tree Box (Terminal-Style with Live Bars) */}
                <div className="bg-slate-950 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-md font-mono text-xs space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-sm font-bold text-white tracking-wide">
                        {selectedStudent.name} (Learner Model)
                      </span>
                    </div>
                    <span className="text-[10px] text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                      {selectedStudent.learningTwin?.subjectDomain || 'Science / Engineering'}
                    </span>
                  </div>

                  {/* ASCII Concept Hierarchy */}
                  <div className="space-y-2 text-slate-300">
                    <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                      Concept Mastery Breakdown:
                    </div>

                    {(selectedStudent.learningTwin?.conceptBreakdown || [
                      { conceptName: 'Foundational Principles', masteryPercentage: 91, status: 'mastered' },
                      { conceptName: 'Mechanism Dynamics', masteryPercentage: 72, status: 'moderate' },
                      { conceptName: 'Mathematical Balancing', masteryPercentage: 48, status: 'struggling' },
                      { conceptName: 'Downstream Reactions', masteryPercentage: 55, status: 'struggling' }
                    ]).map((c, idx, arr) => {
                      const isLast = idx === arr.length - 1;
                      const prefix = isLast ? '└── ' : '├── ';
                      const isStruggling = c.masteryPercentage < 60;
                      const isModerate = c.masteryPercentage >= 60 && c.masteryPercentage < 80;

                      return (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pl-1">
                          <div className="flex items-center space-x-2 min-w-[200px]">
                            <span className="text-slate-500 font-bold">{prefix}</span>
                            <span className={isStruggling ? 'text-rose-400 font-bold' : (isModerate ? 'text-amber-300' : 'text-emerald-300')}>
                              {c.conceptName}:
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 flex-1 sm:justify-end">
                            <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isStruggling ? 'bg-rose-500' : (isModerate ? 'bg-amber-400' : 'bg-emerald-400')
                                }`}
                                style={{ width: `${c.masteryPercentage}%` }}
                              />
                            </div>
                            <span className={`font-bold w-10 text-right ${
                              isStruggling ? 'text-rose-400' : (isModerate ? 'text-amber-300' : 'text-emerald-400')
                            }`}>
                              {c.masteryPercentage}%
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                              isStruggling ? 'bg-rose-950 text-rose-300' : (isModerate ? 'bg-amber-950 text-amber-300' : 'bg-emerald-950 text-emerald-300')
                            }`}>
                              {isStruggling ? 'Root Gap' : (isModerate ? 'Moderate' : 'Mastered')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Cognitive Traits Breakdown */}
                  <div className="pt-2 border-t border-slate-800 space-y-1.5 text-slate-300">
                    <div className="flex items-start space-x-2">
                      <span className="text-slate-500">├── </span>
                      <span>
                        <strong className="text-emerald-400">Strong at: </strong>
                        {selectedStudent.learningTwin?.cognitiveTraits.strongAt.join(', ') || 'Real-world physical examples & visual packet diagrams'}
                      </span>
                    </div>

                    <div className="flex items-start space-x-2">
                      <span className="text-slate-500">├── </span>
                      <span>
                        <strong className="text-rose-400">Weak at: </strong>
                        {selectedStudent.learningTwin?.cognitiveTraits.weakAt.join(', ') || 'Multi-step window calculations & application questions under pressure'}
                      </span>
                    </div>

                    <div className="flex items-start space-x-2">
                      <span className="text-slate-500">├── </span>
                      <span>
                        <strong className="text-sky-400">Modality: </strong>
                        {selectedStudent.learningTwin?.cognitiveTraits.modalityPreference || 'Prefers voice explanations in Hindi/English + interactive visual simulators'}
                      </span>
                    </div>

                    <div className="flex items-start space-x-2">
                      <span className="text-slate-500">├── </span>
                      <span>
                        <strong className="text-amber-300">Learning pace: </strong>
                        <span className="capitalize">{selectedStudent.learningPace}</span> (requires 2-minute checkpoint intervals)
                      </span>
                    </div>
                  </div>

                  {/* Predicted Next Difficulty */}
                  <div className="pt-2 border-t border-slate-800 flex items-start space-x-2 text-rose-300">
                    <span className="text-slate-500">└── </span>
                    <div className="space-y-0.5">
                      <div className="font-bold text-rose-400 flex items-center space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Predicted difficulty: {selectedStudent.learningTwin?.predictedDifficulty.targetConcept || 'Congestion Avoidance & Window Scaling'}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans">
                        Intervention: {selectedStudent.learningTwin?.predictedDifficulty.recommendedIntervention || selectedStudent.recommendedScaffolding}
                      </p>
                    </div>
                  </div>

                </div>

                {/* Quick Action to Test Student */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                  <div className="text-xs text-indigo-950 font-medium">
                    Want to see how this student's learning state evolves with a formative quiz?
                  </div>
                  <button
                    onClick={() => setTwinViewMode('simulator')}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors flex items-center space-x-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Launch Live Quiz Simulator</span>
                  </button>
                </div>

              </div>
            )}

            {/* TAB 2: EXPLAINABLE ADAPTATION ("7. Explainable Adaptation") */}
            {twinViewMode === 'adaptation' && (
              <div className="space-y-4 flex-1">
                
                {/* Novelty Card */}
                <div className="bg-slate-900 text-white rounded-xl p-4 shadow-xs border border-slate-800 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-amber-300 bg-amber-900/40 px-2 py-0.5 rounded border border-amber-800/60">
                      ★ Novelty: Transparent Explainability
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium">
                    Don't just show: <em>"AI personalized your path."</em> Instead, Shiksha shows: <strong>"Here's exactly why your path changed."</strong>
                  </p>
                </div>

                {/* Why did Shiksha do this Card */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                    <GitBranch className="w-4 h-4 text-amber-600" />
                    <h4 className="text-sm font-bold text-slate-900">
                      Why did Shiksha adapt {selectedStudent.name}'s learning path?
                    </h4>
                  </div>

                  <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-2">
                    <div className="text-xs font-bold text-amber-900">
                      {selectedStudent.learningTwin?.explainableAdaptation?.adaptationHeadline || `We moved Flow Control & Stomata revision earlier because:`}
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {(selectedStudent.learningTwin?.explainableAdaptation?.whyShikshaDidThis || [
                        '4 recent diagnostic answers were incorrect on prerequisite concepts',
                        'Average student response time increased by 31% (latency hesitation)',
                        'Flow Control is a strict prerequisite before downstream Congestion Control'
                      ]).map((reason, ri) => (
                        <li key={ri} className="flex items-start space-x-2">
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Previous Path vs New Path Comparison */}
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Path Trajectory Comparison:
                    </div>

                    {/* Previous Path */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        Previous Path (Default Curriculum Sequence)
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-700">
                        {(selectedStudent.learningTwin?.explainableAdaptation?.previousPath || [
                          'Flow Control', 'Congestion Control', 'Slow Start'
                        ]).map((step, si, arr) => (
                          <React.Fragment key={si}>
                            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-600 line-through">
                              {step}
                            </span>
                            {si < arr.length - 1 && <span className="text-slate-400 font-bold">→</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* New Path (Adapted) */}
                    <div className="p-3.5 rounded-xl bg-emerald-50/80 border-2 border-emerald-300 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                          <span>New Adapted Path (GNN Scaffolding Applied)</span>
                        </span>
                        <span className="text-[9px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                          ACTIVE ROUTE
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-emerald-950">
                        {(selectedStudent.learningTwin?.explainableAdaptation?.newPath || [
                          'Flow Control Revision', 'Water Pipe Physical Analogy', 'Quick Assessment', 'Congestion Control'
                        ]).map((step, si, arr) => (
                          <React.Fragment key={si}>
                            <span className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-900 shadow-2xs">
                              {step}
                            </span>
                            {si < arr.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: LEARNING EVIDENCE INSTEAD OF JUST MARKS ("8. Learning Evidence") */}
            {twinViewMode === 'evidence' && (
              <div className="space-y-4 flex-1">
                
                {/* Headline Callout */}
                <div className="bg-slate-900 text-white rounded-xl p-4 shadow-xs border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400">
                    ★ Deep Assessment Engine: Learning Evidence
                  </span>
                  <p className="text-xs text-slate-200 font-medium">
                    Don't store only: <code>Score = 7/10</code>. Shiksha stores multi-dimensional evidence across questions, confidence, latency, and mistake patterns.
                  </p>
                </div>

                {/* Evidence Pipeline Flowchart Box */}
                <div className="p-4 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 space-y-2.5 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-teal-400">Evidence Telemetry Pipeline</span>
                    <span className="text-[10px] text-slate-400">Real-time DKT Feed</span>
                  </div>

                  <div className="text-slate-300 text-[11px] leading-relaxed pl-1 space-y-1">
                    <div className="text-slate-400 font-sans text-xs mb-1">How telemetry converts to mastery state:</div>
                    <div className="text-slate-300">Question</div>
                    <div className="text-slate-500 pl-2">↓</div>
                    <div className="text-slate-300">Concept tested</div>
                    <div className="text-slate-500 pl-2">↓</div>
                    <div className="text-slate-300">Correct / incorrect</div>
                    <div className="text-slate-500 pl-2">↓</div>
                    <div className="text-slate-300">Confidence rating</div>
                    <div className="text-slate-500 pl-2">↓</div>
                    <div className="text-slate-300">Time taken (latency)</div>
                    <div className="text-slate-500 pl-2">↓</div>
                    <div className="text-slate-300">Repeated mistake?</div>
                    <div className="text-slate-500 pl-2">↓</div>
                    <div className="text-emerald-400 font-bold">Mastery update</div>
                  </div>
                </div>

                {/* Concept Evidence Cards */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Concept Evidence Dossier ({selectedStudent.name}):
                  </div>

                  {(selectedStudent.learningTwin?.conceptEvidences || [
                    {
                      conceptName: selectedStudent.name === 'Rahul Sharma' ? 'Slow Start' : 'Stomata Gas Dynamics',
                      masteryPercentage: selectedStudent.name === 'Rahul Sharma' ? 48 : 42,
                      evidenceItems: [
                        { type: 'correct', icon: '✓', text: '3 correct conceptual definitions (Handshake & basic terms)', severity: 'success' },
                        { type: 'mistake', icon: '✗', text: '2 application calculation mistakes on window formula', severity: 'danger' },
                        { type: 'latency', icon: '⚠', text: 'High response latency (42.6s avg vs 18s class benchmark)', severity: 'warning' },
                        { type: 'confidence', icon: '⚠', text: 'Low self-reported confidence score (0.34)', severity: 'warning' },
                        { type: 'repetition', icon: '↺', text: 'Repeated mistake: Confusing linear with exponential growth', severity: 'danger' }
                      ],
                      evidenceFlow: [
                        { step: 'Question', value: 'TCP cwnd = 4 MSS, 4 ACKs return. What is new cwnd?' },
                        { step: 'Concept tested', value: 'Slow Start Exponential Doubling' },
                        { step: 'Correct/incorrect', value: 'Incorrect (Selected 5 MSS instead of 8 MSS)' },
                        { step: 'Confidence', value: '0.34 (Low / Hesitant)' },
                        { step: 'Time taken', value: '46.2 seconds (+31% hesitation)' },
                        { step: 'Repeated mistake?', value: 'Yes (Repeated on 2 consecutive tests)' },
                        { step: 'Mastery update', value: 'Recalculated: 58% → 48%' }
                      ]
                    }
                  ]).map((ev, ei) => (
                    <div key={ei} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold">Concept Evidence</span>
                          <h4 className="text-sm font-bold text-slate-900">{ev.conceptName}</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 uppercase font-bold">Calculated Mastery</span>
                          <div className={`text-base font-black ${ev.masteryPercentage < 60 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {ev.masteryPercentage}%
                          </div>
                        </div>
                      </div>

                      {/* Evidence Checklist */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-600">Empirical Telemetry Evidence:</div>
                        {ev.evidenceItems.map((item, ii) => (
                          <div
                            key={ii}
                            className={`p-2 rounded-xl text-xs flex items-center space-x-2 border ${
                              item.severity === 'success'
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                                : item.severity === 'danger'
                                ? 'bg-rose-50 text-rose-900 border-rose-200'
                                : 'bg-amber-50 text-amber-900 border-amber-200'
                            }`}
                          >
                            <span className="font-bold">{item.icon}</span>
                            <span>{item.text}</span>
                          </div>
                        ))}
                      </div>

                      {/* Evidence Flow Step Card */}
                      {ev.evidenceFlow && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Recent Evidence Log Trace:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            {ev.evidenceFlow.map((ef, efi) => (
                              <div key={efi} className="p-1.5 bg-white rounded border border-slate-200">
                                <span className="font-bold text-slate-500">{ef.step}: </span>
                                <span className="text-slate-800 font-medium">{ef.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* TAB 4: ADAPTIVE CONTENT ROUTES ("5. Adaptive Content, Not Just Adaptive Difficulty") */}
            {twinViewMode === 'routes' && (
              <div className="space-y-4 flex-1">
                
                {/* Novelty Card */}
                <div className="bg-slate-900 text-white rounded-xl p-4 shadow-xs border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-blue-400">
                    ★ Paradigm: Adaptive Content, Not Just Adaptive Difficulty
                  </span>
                  <p className="text-xs text-slate-200 font-medium leading-relaxed">
                    Not: <em>"Different students get different questions."</em> Instead: <strong>"Different students can take different paths toward the same learning objective."</strong>
                  </p>
                </div>

                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  3 Multimodal Pathways for Same Learning Objective:
                </div>

                {/* 3 Pathway Cards */}
                <div className="space-y-3">
                  {MOCK_ADAPTIVE_ROUTES.map((route) => (
                    <div
                      key={route.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5 hover:border-purple-300 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 text-[11px] font-bold">
                              {route.studentPersona}
                            </span>
                            <span className="text-xs font-bold text-slate-900">({route.studentName})</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Learning Style: <strong>{route.preferenceDescription}</strong>
                          </p>
                        </div>

                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          3-Phase Route
                        </span>
                      </div>

                      {/* Route Steps */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Generated Route:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          {route.routeSteps.map((step, sidx) => (
                            <div key={sidx} className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-200 space-y-1">
                              <span className="text-[9px] font-bold text-purple-700 uppercase">{step.phase}</span>
                              <p className="text-[11px] text-slate-800 font-medium leading-snug">{step.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                        <span className="flex items-center space-x-1">
                          <Target className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Same Goal: <strong>{route.sameLearningObjective}</strong></span>
                        </span>
                        <span className="text-purple-700 font-bold">Adaptive Route ›</span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* TAB 5: LIVE QUIZ & COMPREHENSION SIMULATOR */}
            {twinViewMode === 'simulator' && (
              <div className="space-y-4 flex-1">
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                        Live Formative Assessment Simulator for {selectedStudent.name}
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      Real-Time Twin Sync
                    </span>
                  </div>
                  <p className="text-xs text-indigo-900">
                    Simulate how answering questions on the student's weakest concept updates their Learning Twin and reduces predicted risk score.
                  </p>
                </div>

                {/* Interactive Question Card */}
                <div className="p-4 rounded-2xl bg-white border border-slate-300 space-y-3 shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-xs font-bold">
                      Diagnostic Checkpoint
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Target: {selectedStudent.weakConcepts[0] || 'Core Prerequisite'}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-900 leading-relaxed">
                    {selectedStudent.name === 'Rahul Sharma'
                      ? 'In TCP Slow Start, if current cwnd is 4 MSS and all 4 ACKs return successfully, what is the new Congestion Window size?'
                      : 'Which gas is taken in by green leaves through stomata during daytime photosynthesis?'}
                  </p>

                  <div className="space-y-2 pt-1">
                    {(selectedStudent.name === 'Rahul Sharma' ? [
                      { text: '5 MSS (Linear increase by 1)', isCorrect: false },
                      { text: '8 MSS (Exponential doubling: 4 → 8 MSS)', isCorrect: true },
                      { text: '16 MSS (Squares)', isCorrect: false }
                    ] : [
                      { text: 'Oxygen (O2)', isCorrect: false },
                      { text: 'Carbon Dioxide (CO2)', isCorrect: true },
                      { text: 'Nitrogen (N2)', isCorrect: false }
                    ]).map((opt, oi) => (
                      <button
                        key={oi}
                        onClick={() => {
                          if (opt.isCorrect) {
                            // Update student mastery
                            selectedStudent.riskScore = Math.max(15, selectedStudent.riskScore - 20);
                            if (selectedStudent.learningTwin) {
                              const weak = selectedStudent.learningTwin.conceptBreakdown.find(c => c.status === 'struggling');
                              if (weak) {
                                weak.masteryPercentage = Math.min(95, weak.masteryPercentage + 25);
                                weak.status = 'moderate';
                              }
                              selectedStudent.learningTwin.learningTrajectory.push({
                                timestamp: 'Just now',
                                concept: weak?.conceptName || 'Prerequisite',
                                deltaScore: 85,
                                action: 'Simulated Quiz Passed'
                              });
                            }
                            alert(`✓ Correct Answer! ${selectedStudent.name}'s Learning Twin updated in real-time. Mastery improved from 48% to 73% and Risk reduced to ${selectedStudent.riskScore}%.`);
                          } else {
                            alert(`Incorrect attempt. Socratic voice intervention triggered for ${selectedStudent.name}.`);
                          }
                        }}
                        className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-xs font-medium text-slate-800 transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <span>{opt.text}</span>
                        <span className="text-[10px] text-slate-400 group-hover:text-indigo-600 font-bold">Select ›</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trajectory Log */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Recent Learning State Trajectory
                  </div>
                  <div className="space-y-1">
                    {(selectedStudent.learningTwin?.learningTrajectory || []).map((tr, ti) => (
                      <div key={ti} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-bold text-slate-900">{tr.concept}</span>
                          <span className="text-slate-500">({tr.action})</span>
                        </div>
                        <span className="text-emerald-700 font-bold">{tr.deltaScore}%</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 6: DIAGNOSTIC OVERVIEW (Legacy View) */}
            {twinViewMode === 'overview' && (
              <div className="space-y-3 flex-1">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mr-1.5" />
                    <span>Agent Diagnostic RCA (Root Cause Analysis)</span>
                  </h4>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed font-normal">
                    {selectedStudent.riskReason}
                  </p>
                </div>

                {/* Recommended Scaffolding in Lesson Plan */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Proactive Scaffolding Integrated into Lesson Plan</span>
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                    {selectedStudent.recommendedScaffolding}
                  </p>
                </div>

                {/* Historical Diagnostic Scores */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Recent Formative Scores
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedStudent.recentScores.map((score, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="text-[11px] text-slate-600 font-medium truncate">{score.quizName}</div>
                        <div className="flex items-baseline space-x-1 mt-1">
                          <span className={`text-lg font-bold ${
                            score.score / score.maxScore < 0.6 ? 'text-rose-600' : 'text-emerald-600'
                          }`}>
                            {score.score}
                          </span>
                          <span className="text-xs text-slate-500">/{score.maxScore}</span>
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5">{score.date}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mastered vs Weak Concepts */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] font-bold text-rose-700 uppercase mb-1.5">Struggling Concepts</div>
                    <div className="space-y-1">
                      {selectedStudent.weakConcepts.map((w, i) => (
                        <div key={i} className="text-xs text-rose-800 flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>{w}</span>
                        </div>
                      ))}
                      {selectedStudent.weakConcepts.length === 0 && (
                        <div className="text-xs text-slate-400 italic">None identified</div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] font-bold text-emerald-800 uppercase mb-1.5">Mastered Concepts</div>
                    <div className="space-y-1">
                      {selectedStudent.masteredConcepts.map((m, i) => (
                        <div key={i} className="text-xs text-emerald-800 flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>
      </div>
      )}

      {/* MODAL 1: EDIT ASSESSMENT MARKS (Teacher Workflow Item 6) */}
      {isEditMarksOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-sky-600" />
                <span>Edit Assessment Marks: {selectedStudent.name}</span>
              </h3>
              <button onClick={() => setIsEditMarksOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSaveMarksSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Assessment / Quiz Title</label>
                <input
                  type="text"
                  value={markQuizTitle}
                  onChange={(e) => setMarkQuizTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Concept</label>
                <select
                  value={markConcept}
                  onChange={(e) => setMarkConcept(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
                >
                  <option value="Slow Start (Exponential)">Slow Start (Exponential Doubling)</option>
                  <option value="Flow Control (rwnd)">Flow Control (Sliding Window rwnd)</option>
                  <option value="Congestion Control (AIMD)">Congestion Avoidance (AIMD)</option>
                  <option value="Chemical Equation Balancing">Chemical Equation Balancing</option>
                  <option value="Stomata Gas Exchange Dynamics">Stomata Gas Exchange Dynamics</option>
                  <option value="Binary Search Trees (BST)">Binary Search Trees (BST)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Score Obtained</label>
                  <input
                    type="number"
                    min={0}
                    max={markMaxScore}
                    value={markScore}
                    onChange={(e) => setMarkScore(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none font-bold text-sky-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Max Score</label>
                  <input
                    type="number"
                    min={1}
                    value={markMaxScore}
                    onChange={(e) => setMarkMaxScore(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800">Automatic Sync Effects:</span>
                <p>• Updates combined performance % and concept breakdown.</p>
                <p>• Recalculates GNN predicted risk score in real-time.</p>
                <p>• Scores ≥ 70% automatically <strong>unlock the next topic</strong> in the learning path!</p>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditMarksOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-xs"
                >
                  Save & Sync Mastery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SCHEDULE TARGETED INTERVENTION (Teacher Workflow Item 7) */}
      {isInterventionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Target className="w-4 h-4 text-amber-600" />
                <span>Schedule Intervention for {selectedStudent.name}</span>
              </h3>
              <button onClick={() => setIsInterventionModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleScheduleInterventionSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Topic</label>
                <input
                  type="text"
                  value={interventionTopic}
                  onChange={(e) => setInterventionTopic(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Bottleneck Concept</label>
                <input
                  type="text"
                  value={interventionConcept}
                  onChange={(e) => setInterventionConcept(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Teacher Review Instructions & Remedial Notes</label>
                <textarea
                  rows={3}
                  value={interventionNotes}
                  onChange={(e) => setInterventionNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl text-[11px] text-amber-900 border border-amber-200 space-y-1">
                <span className="font-bold">Student Portal Alert:</span>
                <p>The student will immediately see this assigned review in their dashboard with a <strong>"Proceed to Reassessment"</strong> button.</p>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInterventionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs"
                >
                  Schedule Intervention
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

