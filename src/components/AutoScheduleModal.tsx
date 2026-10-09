import React, { useState } from 'react';
import { 
  Sparkles, 
  Upload, 
  FileText, 
  Layers, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Clock, 
  Brain, 
  Zap, 
  ArrowRight,
  BookOpen,
  GraduationCap,
  FileCheck,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { aiScheduleGenerator, SchedulingStepTrace } from '../services/aiScheduleGenerator';
import { CalendarEvent } from '../types';

interface AutoScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleGenerated: (events: CalendarEvent[]) => void;
}

export const AutoScheduleModal: React.FC<AutoScheduleModalProps> = ({
  isOpen,
  onClose,
  onScheduleGenerated,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState<string>('VTU_1BCS305_DataStructures_Full_Course.pptx');
  const [documentType, setDocumentType] = useState<'ppt' | 'pdf' | 'text'>('ppt');
  const [pastedText, setPastedText] = useState<string>('');
  const [targetMonth, setTargetMonth] = useState<string>('2026-10'); // October 2026
  const [includeLabs, setIncludeLabs] = useState<boolean>(true);
  const [includeHolidays, setIncludeHolidays] = useState<boolean>(true);

  // AI Pipeline Execution State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentStepTrace, setCurrentStepTrace] = useState<SchedulingStepTrace | null>(null);
  const [completedEventsCount, setCompletedEventsCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setDocumentTitle(file.name);
      if (file.name.endsWith('.ppt') || file.name.endsWith('.pptx')) {
        setDocumentType('ppt');
      } else if (file.name.endsWith('.pdf')) {
        setDocumentType('pdf');
      } else {
        setDocumentType('text');
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setDocumentTitle(file.name);
      if (file.name.endsWith('.ppt') || file.name.endsWith('.pptx')) {
        setDocumentType('ppt');
      } else if (file.name.endsWith('.pdf')) {
        setDocumentType('pdf');
      } else {
        setDocumentType('text');
      }
    }
  };

  const handleSelectTemplate = (templateName: string, type: 'ppt' | 'pdf' | 'text') => {
    setDocumentTitle(templateName);
    setDocumentType(type);
    setSelectedFile(null);
  };

  const handleRunScheduleGeneration = async () => {
    setIsGenerating(true);
    setCompletedEventsCount(null);

    try {
      const generated = await aiScheduleGenerator.generateScheduleFromUpload({
        documentTitle: documentTitle || 'Academic_Module_Syllabus.pdf',
        documentType,
        rawContent: pastedText,
        file: selectedFile || undefined,
        targetMonth: 9, // October 2026
        targetYear: 2026,
        subjectCode: '1BCS305',
        semesterLabel: 'CSE Sem 3'
      }, (step) => {
        setCurrentStepTrace(step);
      });

      setCompletedEventsCount(generated.length);
      onScheduleGenerated(generated);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 }
      });

    } catch (err) {
      console.error('Failed to generate schedule:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>AI Autonomous Course Scheduler</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-400/40 font-bold">
                  Student Portal Synced
                </span>
              </h2>
              <p className="text-[11px] text-slate-300">
                Upload PPT slides, module PDF, or syllabus text to auto-generate class timetables.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          
          {/* Step 1: Upload or Template selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>1. Select or Upload Course Content</span>
              <span className="text-[11px] text-cyan-600 lowercase font-medium">supports .ppt, .pptx, .pdf, .txt</span>
            </label>

            {/* Drag & Drop Zone */}
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-slate-300 hover:border-cyan-500 rounded-2xl p-4 sm:p-5 text-center bg-slate-50/70 transition-all cursor-pointer relative group"
            >
              <input 
                type="file" 
                accept=".ppt,.pptx,.pdf,.txt,.docx" 
                onChange={handleFileInputChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />

              <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                <div className="p-3 rounded-2xl bg-cyan-100 text-cyan-700 group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {selectedFile ? selectedFile.name : 'Click to Browse or Drag & Drop PPT / PDF / Syllabus'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for AI Parsing` : 'PowerPoint presentation, Module Chapter PDF, or Textbook Notes'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick-Pick Templates */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Or Select Verified Module Template:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectTemplate('VTU_1BCS305_DataStructures_5Modules.pptx', 'ppt')}
                  className={`p-2.5 rounded-xl border text-left transition-all text-xs font-semibold flex items-center justify-between ${
                    documentTitle.includes('1BCS305') 
                      ? 'bg-cyan-50 border-cyan-500 text-cyan-950 font-bold ring-1 ring-cyan-400' 
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                    <span className="truncate">VTU 1BCS305 (5 Modules PPT)</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800">40 Hrs</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTemplate('SoftwareEngineering_Unix_Syllabus.pdf', 'pdf')}
                  className={`p-2.5 rounded-xl border text-left transition-all text-xs font-semibold flex items-center justify-between ${
                    documentTitle.includes('SoftwareEngineering') 
                      ? 'bg-cyan-50 border-cyan-500 text-cyan-950 font-bold ring-1 ring-cyan-400' 
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span className="truncate">Unix & Software Engg PDF</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">35 Hrs</span>
                </button>
              </div>
            </div>

            {/* Optional Raw Text / Outline Paste */}
            <div className="pt-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                Or Paste Custom Syllabus / Slide Topics:
              </label>
              <textarea
                placeholder="Paste module outline, chapters, or custom slide topics here..."
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Step 2: Scheduling Parameters */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              2. Academic Calendar Constraints
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] font-semibold text-slate-600 block mb-1">Target Academic Month</span>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800">
                  <CalendarIcon className="w-4 h-4 text-cyan-600" />
                  <span>October 2026 (Full Semester Slot Grid)</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-600 block mb-1">AI Constraints & Options</span>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={includeLabs} 
                      onChange={(e) => setIncludeLabs(e.target.checked)} 
                      className="rounded text-cyan-600"
                    />
                    <span>Schedule Lab Practicals</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={includeHolidays} 
                      onChange={(e) => setIncludeHolidays(e.target.checked)} 
                      className="rounded text-cyan-600"
                    />
                    <span>Auto-Exclude Holidays</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Live AI Progress State */}
          {isGenerating && currentStepTrace && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 animate-in fade-in duration-200 border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-cyan-400 flex items-center gap-2">
                  <Brain className="w-4 h-4 animate-spin text-cyan-400" />
                  AI Agent Reasoning: {currentStepTrace.stepName}
                </span>
                <span className="text-[10px] text-slate-400">{currentStepTrace.timestamp}</span>
              </div>
              <p className="text-xs text-slate-300 font-mono">
                &gt; {currentStepTrace.detail}
              </p>
            </div>
          )}

          {/* Success State Notification */}
          {completedEventsCount !== null && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Successfully Scheduled {completedEventsCount} Calendar Events!</span>
              </div>
              <p className="text-xs text-emerald-700">
                The academic schedule is now published and immediately visible in both the <strong>Teacher Studio</strong> and <strong>Student Portal</strong>.
              </p>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            disabled={isGenerating}
            onClick={handleRunScheduleGeneration}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all shadow-md cursor-pointer ${
              isGenerating
                ? 'bg-slate-400 text-white cursor-not-allowed'
                : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-600/20 hover:scale-[1.02]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'AI Agent Scheduling...' : 'Generate & Synchronize Calendar'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
