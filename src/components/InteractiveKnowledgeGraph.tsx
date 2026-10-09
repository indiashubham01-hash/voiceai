import React, { useState, useRef, useEffect } from 'react';
import { 
  Network, 
  Sparkles, 
  Brain, 
  Zap, 
  ArrowRight, 
  RefreshCw, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Filter, 
  Users, 
  Info,
  ChevronRight,
  Eye
} from 'lucide-react';
import { 
  CurriculumGraphData, 
  GraphNode, 
  GraphEdge, 
  PRESET_GRAPHS, 
  graphService 
} from '../services/graphService';
import { Student } from '../types';

interface InteractiveKnowledgeGraphProps {
  students?: Student[];
  currentStudent?: Student;
  onSelectStudent?: (student: Student) => void;
  onLaunchMicroLesson?: (conceptName: string) => void;
}

export const InteractiveKnowledgeGraph: React.FC<InteractiveKnowledgeGraphProps> = ({
  students = [],
  currentStudent,
  onLaunchMicroLesson,
}) => {
  // Graph Data State
  const [activePreset, setActivePreset] = useState<string>('science_photosynthesis');
  const [graphData, setGraphData] = useState<CurriculumGraphData>(PRESET_GRAPHS.science_photosynthesis);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(PRESET_GRAPHS.science_photosynthesis.nodes[1]);
  
  // Ingestion & Text Extraction State
  const [curriculumInputText, setCurriculumInputText] = useState<string>(
    'NCERT Grade 7 Science Chapter 1: Nutrition in Plants. Leaves contain chloroplasts with chlorophyll capturing radiant sunlight energy. Tiny pores called stomata bounded by guard cells control gas exchange (CO2 intake and O2 release). Light reaction generates chemical energy used in stroma to synthesize glucose via 6CO2 + 6H2O -> C6H12O6 + 6O2 stoichiometry. Starch storage is verified by Iodine solution drop test.'
  );
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractSuccess, setExtractSuccess] = useState<string>('');

  // Student State
  const [selectedStudentName, setSelectedStudentName] = useState<string>(
    currentStudent ? currentStudent.name : 'Aarav Sharma (High Risk - Stomata Gap)'
  );

  // View Controls State
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [filterGapOnly, setFilterGapOnly] = useState<boolean>(false);
  const [layoutMode, setLayoutMode] = useState<'hierarchical' | 'compact'>('hierarchical');
  const canvasRef = useRef<HTMLDivElement | null>(null);

  // Sync student mastery changes
  useEffect(() => {
    const updated = graphService.applyStudentMastery(graphData, selectedStudentName);
    setGraphData(updated);
    if (selectedNode) {
      const refreshedSelected = updated.nodes.find(n => n.id === selectedNode.id) || updated.nodes[0];
      setSelectedNode(refreshedSelected);
    }
  }, [selectedStudentName]);

  const handleSelectPreset = (presetKey: string) => {
    setActivePreset(presetKey);
    const baseGraph = PRESET_GRAPHS[presetKey] || PRESET_GRAPHS.science_photosynthesis;
    const withStudent = graphService.applyStudentMastery(baseGraph, selectedStudentName);
    setGraphData(withStudent);
    setSelectedNode(withStudent.nodes[1] || withStudent.nodes[0]);
  };

  const handleExtractGraph = async () => {
    if (!curriculumInputText.trim()) return;
    setIsExtracting(true);
    setExtractSuccess('');

    try {
      const extracted = await graphService.extractGraphFromCurriculum(curriculumInputText, 'Extracted DAG Module');
      const withStudent = graphService.applyStudentMastery(extracted, selectedStudentName);
      setGraphData(withStudent);
      setSelectedNode(withStudent.nodes[0]);
      setExtractSuccess(`✓ Knowledge Graph generated with ${withStudent.nodes.length} nodes and ${withStudent.edges.length} prerequisite edges via Agnes 3.0 Flash!`);
      setTimeout(() => setExtractSuccess(''), 5000);
    } catch (err) {
      console.error('Extraction failed:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const getNodeColor = (mastery: number = 0.5, isRootCause?: boolean, isPropagated?: boolean) => {
    if (isRootCause || mastery < 0.5) {
      return {
        bg: 'bg-rose-50',
        border: 'border-rose-400 ring-2 ring-rose-200',
        badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
        text: 'text-rose-900',
        accent: '#EF4444',
        label: 'CRITICAL GAP (Root Cause)'
      };
    }
    if (isPropagated) {
      return {
        bg: 'bg-amber-50/70',
        border: 'border-amber-400 border-dashed ring-1 ring-amber-200',
        badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
        text: 'text-amber-900',
        accent: '#F59E0B',
        label: 'PROPAGATED RISK'
      };
    }
    if (mastery >= 0.7) {
      return {
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        text: 'text-emerald-900',
        accent: '#10B981',
        label: 'MASTERED'
      };
    }
    return {
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
      text: 'text-amber-900',
      accent: '#F59E0B',
      label: 'IN-PROGRESS'
    };
  };

  const filteredNodes = filterGapOnly 
    ? graphData.nodes.filter(n => (n.mastery || 0) < 0.7 || n.isRootCauseGap || n.isPropagatedRisk)
    : graphData.nodes;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* 1. Header Banner */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-sky-50 text-sky-800 border border-sky-200 flex items-center space-x-1">
                <Network className="w-3.5 h-3.5 mr-1 text-sky-600" /> Automated DAG Knowledge Graph
              </span>
              <span className="text-xs text-slate-500 font-mono font-medium">Agnes 3.0 Flash Extracted</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                2-Head GAT Message Passing
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Curriculum Knowledge Graph & Prerequisite Dependency Tracing
            </h2>
            <p className="text-sm text-slate-600 max-w-3xl font-medium">
              Automatically converts raw curriculum text or educator notes into a strict Directed Acyclic Graph (DAG). 
              GNN knowledge tracing overlays real-time student mastery, dynamically highlighting unmastered prerequisites in red.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center space-x-3 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200 shadow-xs flex-shrink-0">
            <div className="text-center px-2">
              <div className="text-xl font-black text-sky-700">{graphData.nodes.length}</div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Concepts (Nodes)</div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center px-2">
              <div className="text-xl font-black text-teal-700">{graphData.edges.length}</div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Prerequisites (Edges)</div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center px-2">
              <div className="text-xl font-black text-rose-700">
                {graphData.nodes.filter(n => (n.mastery || 0) < 0.5 || n.isRootCauseGap).length}
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Red-Flagged Gaps</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Extraction & Ingestion Studio (Text to DAG in 1-Click) */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">
              Auto-Extract Knowledge Graph from Notes / Syllabus
            </h3>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="text-xs text-slate-500 font-bold mr-1">Curriculum Presets:</span>
            <button
              onClick={() => handleSelectPreset('science_photosynthesis')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePreset === 'science_photosynthesis'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🌱 Science (Photosynthesis)
            </button>
            <button
              onClick={() => handleSelectPreset('math_algebra')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePreset === 'math_algebra'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📐 Algebra (Quadratics)
            </button>
            <button
              onClick={() => handleSelectPreset('math_fractions')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePreset === 'math_fractions'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              🍕 Math (Fractions)
            </button>
          </div>
        </div>

        {/* Textarea + Extract Action */}
        <div className="space-y-3">
          <textarea
            value={curriculumInputText}
            onChange={(e) => setCurriculumInputText(e.target.value)}
            rows={2}
            placeholder="Paste raw lecture notes, chapter text, or syllabus outline here to auto-generate a structured DAG..."
            className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none text-slate-800 font-sans leading-relaxed resize-none shadow-inner"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Agnes 3.0 Flash constructs Directed Prerequisite Edges ($A \to B \to C$) automatically</span>
            </div>

            <button
              onClick={handleExtractGraph}
              disabled={isExtracting}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center space-x-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isExtracting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Extracting DAG Nodes & Edges...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>⚡ Auto-Generate Knowledge Graph with Agnes 3.0</span>
                </>
              )}
            </button>
          </div>

          {extractSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{extractSuccess}</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Graph Toolbar: Student Mastery Overlay, Filters & Zoom */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
        
        {/* Left: Student Selector */}
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-slate-600 ml-1" />
          <span className="text-xs font-bold text-slate-800">Learner Mastery Overlay:</span>
          <select
            value={selectedStudentName}
            onChange={(e) => setSelectedStudentName(e.target.value)}
            className="bg-white text-xs text-slate-900 rounded-xl px-3 py-1.5 border border-slate-300 outline-none font-bold cursor-pointer shadow-xs"
          >
            <option value="Aarav Sharma (High Risk - Stomata Gap)">Aarav Sharma (Risk: 86% • Stomata Root Gap)</option>
            <option value="Priya Patel (Moderate Risk - Gas Dynamics)">Priya Patel (Risk: 78% • Gas Dynamics Gap)</option>
            <option value="Prajwal Gowda (Kannada First - Equation Gap)">Prajwal Gowda (Risk: 82% • Stoichiometry Gap)</option>
            <option value="Rohan Verma (High Risk - Factorization)">Rohan Verma (Risk: 84% • Concept Hesitation)</option>
            <option value="Sneha Gupta (Standard Mastery)">Sneha Gupta (Risk: 32% • Standard Pace)</option>
            <option value="Vihaan Reddy (High Mastery 98%)">Vihaan Reddy (Risk: 12% • Mastered All)</option>
          </select>
        </div>

        {/* Right: Controls & Filters */}
        <div className="flex items-center space-x-2">
          {/* Gap Filter */}
          <button
            onClick={() => setFilterGapOnly(!filterGapOnly)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              filterGapOnly 
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs' 
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{filterGapOnly ? 'Showing Red Gaps Only' : 'Filter Red Gaps'}</span>
          </button>

          {/* Zoom In/Out */}
          <div className="flex items-center space-x-1 bg-white border border-slate-300 rounded-xl p-0.5 shadow-xs">
            <button
              onClick={() => setZoomScale(prev => Math.max(0.7, prev - 0.15))}
              className="p-1 rounded text-slate-600 hover:text-slate-900 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-bold text-slate-700 px-1">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={() => setZoomScale(prev => Math.min(1.4, prev + 0.15))}
              className="p-1 rounded text-slate-600 hover:text-slate-900 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* 4. Main Interactive Canvas: Left-to-Right (LR) Directed Graph View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Graph Canvas Panel (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl relative overflow-hidden min-h-[480px] flex flex-col justify-between">
          
          {/* Subtle Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ 
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', 
              backgroundSize: '24px 24px' 
            }} 
          />

          {/* Canvas Header */}
          <div className="relative flex items-center justify-between z-10 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                {graphData.topicTitle} • Hierarchical LR DAG
              </span>
            </div>

            <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Mastered (&ge;70%)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Root Cause Gap (&lt;50%)</span>
              </span>
            </div>
          </div>

          {/* Interactive DAG Nodes Container (Horizontal LR Flow) */}
          <div 
            ref={canvasRef}
            style={{ transform: `scale(${zoomScale})`, transformOrigin: 'left center' }}
            className="relative py-8 my-auto overflow-x-auto transition-transform duration-150 flex items-center justify-start space-x-6 sm:space-x-10 min-w-max px-4"
          >
            {filteredNodes.map((node, index) => {
              const isSelected = selectedNode?.id === node.id;
              const style = getNodeColor(node.mastery, node.isRootCauseGap, node.isPropagatedRisk);
              const masteryPercent = Math.round((node.mastery || 0) * 100);

              return (
                <React.Fragment key={node.id}>
                  {/* Node Card */}
                  <div
                    onClick={() => setSelectedNode(node)}
                    className={`relative w-64 rounded-2xl p-4 cursor-pointer transition-all duration-200 shadow-lg ${
                      isSelected
                        ? 'bg-slate-800 border-2 border-sky-400 ring-4 ring-sky-500/30 scale-105'
                        : 'bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {/* Header Level & ID */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono">
                        Node #{node.id} • {node.level}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.badgeBg}`}>
                        {style.label}
                      </span>
                    </div>

                    {/* Node Title */}
                    <h4 className="text-sm font-black text-white leading-tight mb-2">
                      {node.name}
                    </h4>

                    {/* Description */}
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {node.description}
                    </p>

                    {/* Mastery Bar */}
                    <div className="space-y-1 pt-2 border-t border-slate-700/80">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-mono">Learner Mastery</span>
                        <span className="font-mono font-bold" style={{ color: style.accent }}>
                          {masteryPercent}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ width: `${masteryPercent}%`, backgroundColor: style.accent }}
                        />
                      </div>
                    </div>

                    {/* Intercept Badge if Critical Gap */}
                    {node.isRootCauseGap && (
                      <div className="mt-2.5 py-1 px-2 rounded-lg bg-rose-950/80 border border-rose-500/50 text-[10px] text-rose-300 font-bold flex items-center space-x-1 animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-rose-400 flex-shrink-0" />
                        <span>FLAG_PROACTIVE_GAP: Intercept Required</span>
                      </div>
                    )}
                  </div>

                  {/* Directed Connecting Arrow (if not last node) */}
                  {index < filteredNodes.length - 1 && (
                    <div className="flex flex-col items-center justify-center space-y-1 flex-shrink-0">
                      <div className="w-8 sm:w-12 h-0.5 bg-slate-400 relative">
                        <ArrowRight className="w-3.5 h-3.5 text-blue-500 absolute -right-2 -top-1.5" />
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 font-semibold">
                        &alpha; = 0.89
                      </span>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Canvas Footer */}
          <div className="relative border-t border-slate-800 pt-3 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 z-10">
            <span>Graph Attention Network (GAT: 2-Head Attention) Protocol</span>
            <span className="text-sky-400 font-bold">Click any node to inspect pedagogical diagnostics</span>
          </div>

        </div>

        {/* Node Inspector Drawer Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedNode ? (
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-5 h-full flex flex-col justify-between">
              
              <div className="space-y-4">
                {/* Header */}
                <div className="border-b border-slate-100 pb-3.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                      Node #{selectedNode.id} • {selectedNode.level}
                    </span>
                    {selectedNode.isRootCauseGap && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                        Root Cause Gap
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1.5">
                    {selectedNode.name}
                  </h3>
                </div>

                {/* Concept Overview */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Concept Scope & Explanation
                  </h4>
                  <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed font-medium">
                    {selectedNode.description}
                  </p>
                </div>

                {/* Diagnostic Mastery Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-bold">DKT Mastery</span>
                    <span className={`font-black text-sm ${
                      (selectedNode.mastery || 0) >= 0.7 ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {Math.round((selectedNode.mastery || 0) * 100)}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-bold">Hesitation</span>
                    <span className="font-black text-sm text-slate-800 font-mono">
                      {selectedNode.hesitation !== undefined ? `${selectedNode.hesitation}s` : '0.4s'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-bold">Attempts</span>
                    <span className="font-black text-sm text-slate-800 font-mono">
                      {selectedNode.attempts || 0}
                    </span>
                  </div>
                </div>

                {/* Scaffolding Recommendation if Gap */}
                {selectedNode.isRootCauseGap ? (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                    <div className="flex items-center space-x-1.5 text-xs font-black text-rose-900">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Agnes 3.0 Socratic Intervention</span>
                    </div>
                    <p className="text-xs text-rose-950 leading-relaxed font-medium">
                      Student is struggling with guard cell mechanics. Do not proceed to balanced chemical equations. 
                      Reinforce with the <strong>"Bilingual Plant Kitchen / Stomata Gate"</strong> visual analogy in Hindi / Kannada.
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Prerequisite Solidified</span>
                    </div>
                    <p className="text-xs text-emerald-950 font-medium">
                      Concept firmly grasped. Ready for downstream stoichiometry and experimental validation.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {onLaunchMicroLesson && (
                <button
                  onClick={() => onLaunchMicroLesson(selectedNode.name)}
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Brain className="w-4 h-4" />
                  <span>Launch Socratic Voice Micro-Lesson</span>
                </button>
              )}

            </div>
          ) : (
            <div className="rounded-3xl bg-white border border-slate-200 p-8 text-center text-slate-400 space-y-2">
              <Network className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-bold">Select any node on the graph canvas to view prerequisite diagnostics.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
