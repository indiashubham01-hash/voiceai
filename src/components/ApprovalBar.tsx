import React from 'react';
import { 
  CheckCircle2, 
  Send, 
  Download, 
  Share2, 
  Zap, 
  ShieldAlert, 
  Sparkles,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LessonPlan } from '../types';

interface ApprovalBarProps {
  lessonPlan: LessonPlan;
  onApprove: () => void;
  onDeliverToStudents: () => void;
  onTriggerReplan: () => void;
}

export const ApprovalBar: React.FC<ApprovalBarProps> = ({
  lessonPlan,
  onApprove,
  onDeliverToStudents,
  onTriggerReplan,
}) => {
  const isApproved = lessonPlan.approvalState === 'approved' || lessonPlan.approvalState === 'delivered';

  const handleApproveClick = () => {
    onApprove();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.9 },
      colors: ['#16a34a', '#22c55e', '#0284c7', '#d97706']
    });
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="sticky bottom-15 md:bottom-0 z-30 w-full bg-white/95 border-t border-slate-200 backdrop-blur-md py-3 px-3 sm:px-6 lg:px-8 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
        
        {/* Left: Approval Status & Governance Shield */}
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl border flex items-center justify-center ${
            isApproved
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {isApproved ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <ShieldAlert className="w-5 h-5 text-amber-600" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Teacher Governance State:
              </span>
              <span className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded-full ${
                isApproved
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                {lessonPlan.approvalState}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {isApproved
                ? 'Approved by Teacher • Verified safe and aligned for student classroom delivery'
                : 'Pending Teacher Approval • Content is isolated and not yet published to learners'}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Replan 20m Shortcut if not yet replanned */}
          {!lessonPlan.isReplanned && (
            <button
              onClick={onTriggerReplan}
              className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
              title="Simulate teacher saying: 'The class is behind; reduce this to 20 minutes.'"
            >
              <Zap className="w-3.5 h-3.5 text-amber-700" />
              <span>Voice Replan (20m)</span>
            </button>
          )}

          {/* Export to PDF / Classroom */}
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
            title="Export / Print Lesson Plan"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>

          {/* Teacher Approve Button */}
          {!isApproved ? (
            <button
              onClick={handleApproveClick}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <FileCheck className="w-4 h-4 text-white" />
              <span>Approve Lesson Plan</span>
            </button>
          ) : (
            <button
              onClick={onDeliverToStudents}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4 text-white" />
              <span>Launch Student Delivery</span>
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
