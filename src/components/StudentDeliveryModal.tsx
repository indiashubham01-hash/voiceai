import React, { useState } from 'react';
import { 
  Sparkles, 
  Languages, 
  UserCheck
} from 'lucide-react';
import { LessonPlan, Student } from '../types';
import { FormativeQuizEngine } from './FormativeQuizEngine';

interface StudentDeliveryModalProps {
  lessonPlan: LessonPlan;
  students: Student[];
  onUpdateStudentScore: (studentId: string, quizScore: number) => void;
  onSpeakText: (text: string, lang?: string) => void;
}

export const StudentDeliveryModal: React.FC<StudentDeliveryModalProps> = ({
  lessonPlan,
  students,
  onUpdateStudentScore,
  onSpeakText,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students.length > 0 ? students[0].id : 's-rahul'
  );
  const [deliveryLanguage, setDeliveryLanguage] = useState<'English' | 'Hindi' | 'Kannada'>('English');

  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Student Mode Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 mr-1" /> Student Learning Portal & Formative Check
            </span>
            <span className="text-xs text-slate-400 font-mono">Live Classroom Delivery (11 Qs)</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1 font-outfit">
            {deliveryLanguage === 'Hindi' ? lessonPlan.topicHindi : (deliveryLanguage === 'Kannada' ? (lessonPlan.topicKannada || lessonPlan.topic) : lessonPlan.topic)}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Simulate the interactive learner experience with multi-level questions and DKT live mastery telemetry.
          </p>
        </div>

        {/* Student Selector & Language Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
            <UserCheck className="w-4 h-4 text-indigo-400 ml-1" />
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="bg-slate-900 text-xs text-white rounded-lg px-2.5 py-1.5 border border-slate-700 outline-none cursor-pointer"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.preferredLanguage || 'Bilingual'} • Risk: {s.riskScore}%)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            {(['English', 'Hindi', 'Kannada'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setDeliveryLanguage(lang)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  deliveryLanguage === lang ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'English' ? 'EN' : (lang === 'Hindi' ? 'हिंदी' : 'ಕನ್ನಡ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interactive Formative Engine & Live DKT Telemetry */}
      <FormativeQuizEngine
        lessonPlan={lessonPlan}
        students={students}
        currentStudentId={selectedStudentId}
        selectedLanguage={deliveryLanguage}
        onUpdateStudentScore={onUpdateStudentScore}
        onSpeakText={onSpeakText}
        initialMode="quiz"
      />

    </div>
  );
};
