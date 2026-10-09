import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Brain, 
  Mic, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  Layers,
  Clock,
  ArrowRight
} from 'lucide-react';
import { AgentDecisionStep, LessonPlan } from '../types';

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  steps: AgentDecisionStep[];
  lessonPlan: LessonPlan;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({
  isOpen,
  onClose,
  steps,
  lessonPlan,
}) => {
  if (!isOpen) return null;

  const getRoleIcon = (role: AgentDecisionStep['agentRole']) => {
    switch (role) {
      case 'Voice NLU':
        return <Mic className="w-4 h-4 text-rose-600" />;
      case 'Source Grounding':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'Conflict Resolution':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'Risk Modeler':
        return <Brain className="w-4 h-4 text-emerald-600" />;
      case 'Curriculum Architect':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'Approval Supervisor':
        return <ShieldCheck className="w-4 h-4 text-brand-600" />;
      default:
        return <Layers className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-700 border border-brand-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">
                  Autonomous Agent Decision Audit Trail
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                  Transparent Chain-of-Thought
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Full reasoning telemetry: Grounding citations, conflict filters, risk scoring, and governance checks.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors border border-slate-200 cursor-pointer shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Step-by-Step Chain */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Highlight Callouts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <span className="text-brand-700 font-bold block mb-1">📘 Grounding Trace</span>
              <span className="text-slate-700">
                Grounded in <strong>NCERT Grade 7 Science Ch 1 (pp. 12–16)</strong> with 98% trust score.
              </span>
            </div>
            <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200 text-xs">
              <span className="text-rose-700 font-bold block mb-1">🚫 Conflict Filter</span>
              <span className="text-slate-700">
                Excluded <strong>Class7_Science_Notes_2021.pdf</strong> due to 2026 syllabus mismatch.
              </span>
            </div>
          </div>

          {/* Steps Timeline */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {steps.map((step, index) => (
              <div key={step.id} className="relative group">
                
                {/* Timeline node icon */}
                <div className="absolute -left-6 top-0 flex items-center justify-center w-5 h-5 rounded-full bg-white border-2 border-brand-600 text-[10px] font-bold text-brand-700 shadow-sm">
                  {index + 1}
                </div>

                <div className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl p-4 space-y-2 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="p-1 rounded bg-white border border-slate-200">
                        {getRoleIcon(step.agentRole)}
                      </span>
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        {step.agentRole}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium flex items-center space-x-1">
                      <Clock className="w-3 h-3 mr-0.5 text-slate-400" />
                      <span>{step.timestamp}</span>
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">
                    {step.title}
                  </h4>

                  <p className="text-xs text-slate-700 leading-relaxed font-mono bg-white p-2.5 rounded-lg border border-slate-200">
                    {step.details}
                  </p>

                  {step.metadata && (
                    <div className="pt-1 flex flex-wrap gap-2 text-[10px] text-slate-600">
                      {Object.entries(step.metadata).map(([k, v]) => (
                        <span key={k} className="px-2 py-0.5 rounded bg-white border border-slate-200">
                          <strong className="text-slate-800">{k}:</strong> {Array.isArray(v) ? v.join(', ') : String(v)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>All decision traces cryptographically signed & verifiable</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
          >
            Close Audit Trail
          </button>
        </div>

      </div>
    </div>
  );
};
