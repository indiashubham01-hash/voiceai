import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Languages, 
  Brain, 
  Zap, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  RotateCcw, 
  BookOpen, 
  Eye, 
  Ear, 
  FileText, 
  AlertTriangle,
  Flame,
  Award,
  Calendar,
  FileCheck,
  Target,
  Send,
  Radio,
  Trophy,
  Star,
  Check,
  Users,
  GraduationCap,
  Building2,
  TrendingUp,
  BarChart3,
  Layers,
  Clock,
  Compass,
  ShieldCheck,
  Cpu,
  ExternalLink,
  Bookmark
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LessonPlan, Student, StudentIntervention, StudentAssessmentRecord, CalendarEvent } from '../types';
import { AuthUser } from '../services/authService';
import { sharedState } from '../services/sharedStateManager';
import { apiClient } from '../services/apiClient';
import { CalendarView } from './CalendarView';
import { FormativeQuizEngine } from './FormativeQuizEngine';

interface StudentDashboardProps {
  lessonPlan: LessonPlan;
  students: Student[];
  onUpdateStudentScore: (studentId: string, quizScore: number) => void;
  onSpeakText: (text: string, lang?: string) => void;
  isSpeaking: boolean;
  onToggleSpeech: () => void;
  currentUser?: AuthUser | null;
  selectedLanguage?: 'English' | 'Hindi' | 'Kannada' | 'Bilingual';
  onLanguageChange?: (lang: 'English' | 'Hindi' | 'Kannada' | 'Bilingual') => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  lessonPlan,
  students,
  onUpdateStudentScore,
  onSpeakText,
  isSpeaking,
  onToggleSpeech,
  currentUser,
  selectedLanguage = 'English',
  onLanguageChange,
}) => {
  // Determine the authenticated student profile securely
  const currentStudent = React.useMemo<Student>(() => {
    if (currentUser) {
      const match = students.find(
        (s) =>
          (currentUser.usn && s.id.toLowerCase() === currentUser.usn.toLowerCase()) ||
          s.name.toLowerCase() === currentUser.name.toLowerCase() ||
          s.id === currentUser.id
      );
      if (match) return match;

      return {
        id: currentUser.usn || currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        grade: currentUser.grade || 7,
        learningPace: 'standard',
        preferredLanguage: currentUser.preferredLanguage || 'English',
        recentScores: [
          { quizName: 'Module Diagnostic Assessment', score: 9, maxScore: 10, date: '2026-10-08' }
        ],
        weakConcepts: [],
        masteredConcepts: ['Foundational Concepts & Principles'],
        riskScore: 18,
        riskReason: 'Active learner performing consistently on track.',
        recommendedScaffolding: 'Interactive self-paced exploration and formative checkpoints.'
      };
    }
    return students[0];
  }, [currentUser, students]);

  const [studentLanguage, setStudentLanguage] = useState<'English' | 'Hindi' | 'Kannada'>(
    selectedLanguage === 'Hindi' ? 'Hindi' : (selectedLanguage === 'Kannada' ? 'Kannada' : 'English')
  );
  const [studentNavTab, setStudentNavTab] = useState<'profile' | 'learning' | 'quiz' | 'calendar' | 'assessments'>('profile');
  
  // Learning Mode: 'visual' | 'text' | 'voice' | 'quiz'
  const [activeLearningMode, setActiveLearningMode] = useState<'visual' | 'text' | 'voice' | 'quiz'>('visual');
  const [explanationTier, setExplanationTier] = useState<'beginner' | 'standard' | 'advanced'>('beginner');
  
  // Voice Interaction Hub State
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [studentSpokenInput, setStudentSpokenInput] = useState<string>('');
  const [voiceMessages, setVoiceMessages] = useState<Array<{ sender: 'ai' | 'student'; text: string; timestamp: string }>>(() => {
    const welcomeText = selectedLanguage === 'Kannada'
      ? 'ನಮಸ್ಕಾರ! ಇಂದು ನಾವು ಸಸ್ಯಗಳು ಸೂರ್ಯನ ಬೆಳಕಿನಿಂದ ಆಹಾರವನ್ನು ಹೇಗೆ ತಯಾರಿಸುತ್ತವೆ ಎಂಬುದನ್ನು ಕಲಿಯುತ್ತಿದ್ದೇವೆ (ಸಸ್ಯದ ಅಡುಗೆಮನೆ). ಮಾತನಾಡಲು ಮೈಕ್ ಒತ್ತಿರಿ!'
      : (selectedLanguage === 'Hindi'
        ? 'नमस्ते! आज हम सीख रहे हैं कि पत्तियां सौर रसोई की तरह भोजन कैसे बनाती हैं। बोलने के लिए कभी भी माइक दबाएं!'
        : 'Welcome! Today we are exploring how leaves make food like a busy solar kitchen. Tap the mic anytime to speak or ask me anything!');
    return [{
      sender: 'ai',
      text: welcomeText,
      timestamp: 'Just now'
    }];
  });

  // Quiz state
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState<boolean>(false);

  // Interventions State
  const [interventions, setInterventions] = useState<StudentIntervention[]>(() => sharedState.getInterventions());
  const [assessments, setAssessments] = useState<StudentAssessmentRecord[]>(() => sharedState.getAssessments());
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => sharedState.getCalendarEvents());
  const [isReassessmentOpen, setIsReassessmentOpen] = useState<boolean>(false);
  const [activeIntervention, setActiveIntervention] = useState<StudentIntervention | null>(null);

  // Reassessment Quiz State
  const [reassessmentQIndex, setReassessmentQIndex] = useState<number>(0);
  const [reassessmentAnswers, setReassessmentAnswers] = useState<Record<number, number>>({});
  const [isReassessmentSubmitted, setIsReassessmentSubmitted] = useState<boolean>(false);

  const questions = lessonPlan?.formativeQuiz || [];
  const currentQ = (questions.length > 0 && currentQIndex < questions.length) ? questions[currentQIndex] : (questions[0] || {
    question: 'How do leaves absorb sunlight and carbon dioxide during photosynthesis?',
    options: ['Via Chloroplasts & Stomata', 'Via Roots Only', 'Through Bark', 'From Soil Minerals'],
    correctAnswerIndex: 0,
    explanation: 'Leaves absorb sunlight through chlorophyll in chloroplasts and take in CO2 through stomata pores.'
  });

  // Subscribe to shared browser state updates
  useEffect(() => {
    const unsub = sharedState.subscribe(() => {
      setInterventions(sharedState.getInterventions());
      setAssessments(sharedState.getAssessments());
      setCalendarEvents(sharedState.getCalendarEvents());
    });
    return unsub;
  }, []);

  // Check active intervention for current student
  const studentActiveIntervention = interventions.find(
    (i) => (i.studentId === currentStudent.id || i.studentName.toLowerCase().includes(currentStudent.name.toLowerCase())) && i.status === 'assigned'
  );

  // Synchronize language when selectedLanguage prop changes
  useEffect(() => {
    if (selectedLanguage === 'Hindi') {
      setStudentLanguage('Hindi');
    } else if (selectedLanguage === 'Kannada') {
      setStudentLanguage('Kannada');
    } else {
      setStudentLanguage('English');
    }
  }, [selectedLanguage]);

  // Auto-set explanation tier based on risk score
  useEffect(() => {
    if ((currentStudent?.riskScore ?? 0) >= 70) {
      setExplanationTier('beginner');
    } else {
      setExplanationTier('standard');
    }
  }, [currentStudent?.riskScore]);

  const handleSetStudentLanguage = (lang: 'English' | 'Hindi' | 'Kannada') => {
    setStudentLanguage(lang);
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  const handleSendVoiceQuestion = (text: string) => {
    if (!text.trim()) return;
    
    const userMsg = { sender: 'student' as const, text, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setVoiceMessages(prev => [...prev, userMsg]);
    setStudentSpokenInput('');

    // Socratic AI Voice response with intelligent fallback
    setTimeout(() => {
      let aiReply = '';
      const lower = text.toLowerCase();
      if (lower.includes('stomata') || lower.includes('gate') || lower.includes('pore') || lower.includes('ಪತ್ರರಂಧ್ರ')) {
        if (studentLanguage === 'Kannada') {
          aiReply = `ಖಂಡಿತ ${currentStudent.name}! ಪತ್ರರಂಧ್ರಗಳು (Stomata) ಎಲೆಗಳ ಸೂಕ್ಷ್ಮ ಬಾಗಿಲುಗಳು, ಇವು CO2 ಅನ್ನು ಒಳಗೆ ತಂದು O2 ಅನ್ನು ಹೊರಬಿಡುತ್ತವೆ.`;
        } else if (studentLanguage === 'Hindi') {
          aiReply = `बिल्कुल सही ${currentStudent.name}! स्टोमेटा पत्तियों के छोटे दरवाजे हैं जो CO2 को अंदर लेते हैं और O2 छोड़ते हैं।`;
        } else {
          aiReply = `Spot on ${currentStudent.name}! Stomata act like microscopic automatic gates that open to let CO2 in and release Oxygen out.`;
        }
      } else if (lower.includes('slow start') || lower.includes('cwnd') || lower.includes('window') || lower.includes('tcp')) {
        aiReply = `Great question ${currentStudent.name}! In Slow Start, cwnd doubles every RTT (*2 exponential growth) until ssthresh is reached. Think of it like a funnel doubling its water flow!`;
      } else if (lower.includes('kitchen') || lower.includes('cook') || lower.includes('food') || lower.includes('ಅಡುಗೆ')) {
        if (studentLanguage === 'Kannada') {
          aiReply = `ಅದ್ಭುತ! ಕ್ಲೋರೋಪ್ಲಾಸ್ಟ್ ಸಸ್ಯದ ಅಡುಗೆಮನೆ, ಅಲ್ಲಿ ಸೂರ್ಯನ ಬೆಳಕು, ನೀರು ಮತ್ತು CO2 ಸೇರಿ ಗ್ಲೂಕೋಸ್ ತಯಾರಾಗುತ್ತವೆ.`;
        } else if (studentLanguage === 'Hindi') {
          aiReply = `शाबाश! क्लोरोप्लास्ट पौधे की रसोई है, जहाँ धूप, पानी और CO2 मिलकर ग्लूकोज बनाते हैं।`;
        } else {
          aiReply = `Awesome intuition! Chloroplasts are the solar chef stations cooking up Glucose food.`;
        }
      } else {
        if (studentLanguage === 'Kannada') {
          aiReply = `ತುಂಬಾ ಉತ್ತಮ ಪ್ರಶ್ನೆ! ಸೂರ್ಯನ ಬೆಳಕು ಎಲೆಯ ಮೇಲೆ ಬಿದ್ದಾಗ, ಕ್ಲೋರೋಫಿಲ್ ಆ ಶಕ್ತಿಯನ್ನು ಹೀರಿಕೊಳ್ಳುತ್ತದೆ. ಕತ್ತಲೆಯಲ್ಲಿ ಸಸ್ಯಗಳು ಆಹಾರ ತಯಾರಿಸಲು ಸಾಧ್ಯವೇ?`;
        } else if (studentLanguage === 'Hindi') {
          aiReply = `बहुत बढ़िया सवाल! जब धूप पत्ती पर पड़ती है, तो क्लोरोफिल ऊर्जा को पकड़ता है। क्या अंधेरे में यह प्रक्रिया संभव है?`;
        } else {
          aiReply = `Great question! When sunlight hits the leaf, chlorophyll traps radiant photons. Do you think plants can do this in the dark without light?`;
        }
      }

      const aiMsg = { sender: 'ai' as const, text: aiReply, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setVoiceMessages(prev => [...prev, aiMsg]);
      onSpeakText(aiReply, studentLanguage);
    }, 500);
  };

  const handleSelectOption = (optIndex: number) => {
    if (isQuizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [currentQIndex]: optIndex }));
  };

  const handleNextQuiz = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      let correct = 0;
      questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctAnswerIndex) {
          correct += 1;
        }
      });
      setIsQuizSubmitted(true);
      onUpdateStudentScore(currentStudent.id, correct);

      // Submit attempt to backend DKT model
      apiClient.submitQuizAttempt('quiz-photo-1', currentStudent.id, selectedAnswers).catch(() => {});

      if (correct === questions.length) {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.7 }
        });
      }
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setCurrentQIndex(0);
    setIsQuizSubmitted(false);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        correct += 1;
      }
    });
    return correct;
  };

  // Reassessment questions
  const REASSESSMENT_QUESTIONS = [
    {
      question: 'In TCP Slow Start, if cwnd is 4 MSS and 4 ACKs arrive in 1 RTT, what is the new cwnd?',
      options: ['5 MSS (+1 linear)', '8 MSS (*2 exponential doubling)', '16 MSS', '4 MSS (unchanged)'],
      correctAnswerIndex: 1,
      explanation: 'Slow Start doubles cwnd every RTT upon arrival of ACKs: 4 MSS * 2 = 8 MSS.'
    },
    {
      question: 'What triggers TCP to transition from Slow Start to Congestion Avoidance?',
      options: ['Reaching the Slow Start Threshold (ssthresh)', 'Receiver Buffer Zero Window', 'Three Duplicate ACKs', 'Router Queue Timeout'],
      correctAnswerIndex: 0,
      explanation: 'When cwnd reaches ssthresh, TCP switches to AIMD linear growth (cwnd += 1 per RTT).'
    },
    {
      question: 'Which raw materials are converted into Glucose during Photosynthesis?',
      options: ['Carbon Dioxide (CO2) + Water (H2O) + Sunlight', 'Oxygen (O2) + Nitrogen (N2)', 'Glucose + Starch', 'Carbon Dioxide + Oxygen'],
      correctAnswerIndex: 0,
      explanation: '6CO2 + 6H2O + Light -> C6H12O6 + 6O2.'
    }
  ];

  const handleReassessmentSubmit = () => {
    let correct = 0;
    REASSESSMENT_QUESTIONS.forEach((q, i) => {
      if (reassessmentAnswers[i] === q.correctAnswerIndex) correct += 1;
    });

    setIsReassessmentSubmitted(true);

    if (activeIntervention) {
      sharedState.completeIntervention(activeIntervention.id, correct);
      sharedState.updateStudentMarks(currentStudent.id, activeIntervention.concept, correct, REASSESSMENT_QUESTIONS.length, 'Intervention Reassessment');
    }

    if (correct >= 2) {
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.7 } });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      
      {/* 1. MODERN EDUCATIONAL PLATFORM LMS BANNER */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 shadow-xl border border-slate-800/80 overflow-hidden">
        {/* Soft Background Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          
          {/* Left: Avatar, Academic Credentials & Standing */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
            <div className="relative flex-shrink-0">
              <img
                src={currentStudent.avatar}
                alt={currentStudent.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-indigo-400 shadow-md ring-4 ring-indigo-500/20"
              />
              <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[11px] font-black shadow-md flex items-center gap-1">
                <Trophy className="w-3 h-3 fill-slate-950" />
                LVL 7
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-outfit">
                  {currentStudent.name}
                </h2>
                <span className="px-3 py-0.5 rounded-full bg-indigo-900/80 border border-indigo-500/40 text-indigo-200 text-xs font-mono font-bold shadow-xs">
                  USN: {currentUser?.usn || currentStudent.id}
                </span>
                <span className="px-3 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Verified Enrolled Learner
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 font-medium flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 text-slate-300 font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  {currentUser?.university || 'Visvesvaraya Technological University (VTU) • Dept of CSE'}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-indigo-200 font-medium">Grade {currentStudent.grade} / Sem 5</span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-300 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  GPA: 9.4 / 10.0 (Grade A+)
                </span>
              </p>

              <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2 pt-0.5">
                <span className="text-slate-400 font-semibold">Active Syllabus:</span>
                <span className="text-amber-300 font-bold bg-amber-400/15 px-2.5 py-0.5 rounded-lg border border-amber-400/30">
                  {studentLanguage === 'Kannada' ? (lessonPlan.topicKannada || lessonPlan.topic) : (studentLanguage === 'Hindi' ? lessonPlan.topicHindi : lessonPlan.topic)}
                </span>
                <button
                  onClick={() => {
                    const topicText = studentLanguage === 'Kannada'
                      ? (lessonPlan.topicKannada || lessonPlan.topic)
                      : (studentLanguage === 'Hindi' ? lessonPlan.topicHindi : lessonPlan.topic);
                    const summaryText = studentLanguage === 'Kannada'
                      ? (lessonPlan.beginnerExplanation.keyAnalogyKannada || lessonPlan.beginnerExplanation.keyAnalogy)
                      : (studentLanguage === 'Hindi' ? lessonPlan.beginnerExplanation.keyAnalogyHindi : lessonPlan.beginnerExplanation.keyAnalogy);
                    onSpeakText(`${topicText}. ${summaryText}`, studentLanguage);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                  title="Listen to Lesson Audio"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Audio Summary</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Modern Educational Navigation Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs shadow-inner">
              <button
                onClick={() => setStudentNavTab('profile')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  studentNavTab === 'profile' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-indigo-300" />
                <span>Academic Profile</span>
              </button>

              <button
                onClick={() => setStudentNavTab('learning')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  studentNavTab === 'learning' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <BookOpen className="w-4 h-4 text-blue-300" />
                <span>Study & Lecture Arena</span>
              </button>

              <button
                onClick={() => setStudentNavTab('quiz')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  studentNavTab === 'quiz' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>Formative Check (11 Qs)</span>
              </button>

              <button
                onClick={() => setStudentNavTab('calendar')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  studentNavTab === 'calendar' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Calendar className="w-4 h-4 text-teal-300" />
                <span>Path & Schedule</span>
              </button>

              <button
                onClick={() => setStudentNavTab('assessments')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  studentNavTab === 'assessments' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <FileCheck className="w-4 h-4 text-emerald-300" />
                <span>Scores ({assessments.filter(a => a.studentId === currentStudent.id).length})</span>
              </button>
            </div>
          </div>

        </div>

        {/* Live Academic Telemetry Metric Pills */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50 flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">CGPA Standing</div>
              <div className="text-xs font-extrabold text-white">9.4 / 10.0 (A+)</div>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50 flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">DKT Knowledge</div>
              <div className="text-xs font-extrabold text-indigo-300">92.4% Mastery</div>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50 flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Study Streak</div>
              <div className="text-xs font-extrabold text-amber-300">14 Days Active</div>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50 flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Knowledge XP</div>
              <div className="text-xs font-extrabold text-cyan-300">3,850 XP</div>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50 flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Hours Logged</div>
              <div className="text-xs font-extrabold text-purple-300">48.5 Hours</div>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50 flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Cohort Rank</div>
              <div className="text-xs font-extrabold text-rose-300">Top 4% (#3)</div>
            </div>
          </div>
        </div>

      </div>

      {/* 2. Active Remedial Intervention Alert Banner */}
      {studentActiveIntervention && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-700" />
                Assigned Review & Reassessment: {studentActiveIntervention.concept}
              </h3>
            </div>

            <button
              onClick={() => {
                setActiveIntervention(studentActiveIntervention);
                setIsReassessmentOpen(true);
                setReassessmentAnswers({});
                setReassessmentQIndex(0);
                setIsReassessmentSubmitted(false);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto transition-colors"
            >
              <span>Proceed to Reassessment (3 Questions)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <p className="text-xs sm:text-sm text-amber-900 font-normal leading-relaxed bg-white/80 p-3 rounded-xl border border-amber-200">
            <strong>Teacher Remedial Instructions:</strong> {studentActiveIntervention.reviewNotes}
          </p>
        </div>
      )}

      {/* TAB 0: ACADEMIC PROFILE & LMS EDUCATION HUB */}
      {studentNavTab === 'profile' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Top 2-Column Grid: Academic ID Card + DKT Knowledge Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left (7 cols): Academic Identity, Program & University Enrollment Details */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 font-outfit">
                      Academic Identity & Program Profile
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Official Institutional Enrollment Details & Academic Standing
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                  Active Enrolled
                </span>
              </div>

              {/* Grid of Academic Attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Institution / University</span>
                  <div className="text-xs font-bold text-slate-900">{currentUser?.university || 'Visvesvaraya Technological University (VTU)'}</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department / Degree</span>
                  <div className="text-xs font-bold text-slate-900">{currentUser?.department || 'Computer Science & Engineering / CBSE'}</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">University Seat Number (USN)</span>
                  <div className="text-xs font-mono font-black text-indigo-700">{currentUser?.usn || currentStudent.id}</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Institutional Student Email</span>
                  <div className="text-xs font-mono font-semibold text-slate-800">{currentUser?.email || `${currentStudent.name.toLowerCase().replace(/\s+/g, '.')}@student.edu.in`}</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Academic Supervisor / Mentor</span>
                  <div className="text-xs font-bold text-slate-900">Dr. Aditi Sharma (HOD / Senior Supervisor)</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">2FA Security / WhatsApp Contact</span>
                  <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{currentUser?.phone || '+91 91234 56789'} (Verified)</span>
                  </div>
                </div>
              </div>

              {/* Learning Preferences */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <Languages className="w-4 h-4 text-indigo-600" />
                    <span>Active Learning Language: <strong className="text-indigo-700">{studentLanguage}</strong></span>
                  </div>
                  <p className="text-[11px] text-indigo-900/80 mt-0.5">
                    AI Socratic Tutor adapts speech synthesis, notes, and quiz explanations to {studentLanguage}.
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {(['English', 'Hindi', 'Kannada'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleSetStudentLanguage(lang)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                        studentLanguage === lang
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white hover:bg-indigo-100 text-indigo-900 border border-indigo-200'
                      }`}
                    >
                      {lang === 'English' ? 'English' : (lang === 'Hindi' ? 'हिंदी' : 'ಕನ್ನಡ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right (5 cols): DKT Latent Knowledge State & Mastery Breakdown */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-700">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-outfit">
                      Deep Knowledge Tracing (DKT)
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      LSTM Latent Mastery & Graph Twin Predictor
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded-lg">
                  92.4% Mastery
                </span>
              </div>

              {/* Concept Progress Bars */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-slate-700">🌱 Chloroplasts & Photosynthesis Bioenergetics</span>
                    <span className="font-mono font-bold text-emerald-600">96%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '96%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-slate-700">🔬 Stomata Microscopic Gas Exchange</span>
                    <span className="font-mono font-bold text-emerald-600">92%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-slate-700">🌐 TCP Sliding Window & Flow Control</span>
                    <span className="font-mono font-bold text-indigo-600">88%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: '88%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-slate-700">🚀 TCP Congestion Avoidance (AIMD & Fast Retransmit)</span>
                    <span className="font-mono font-bold text-amber-600">84%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '84%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-slate-700">🌳 Binary Search Trees & AVL Rotations</span>
                    <span className="font-mono font-bold text-emerald-600">94%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '94%' }} />
                  </div>
                </div>
              </div>

              {/* GNN Adaptive Routing Note */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-indigo-600" />
                  GNN Pedagogical Routing:
                </span>
                <p>
                  Prerequisites satisfied across Module 1 & 2. Ready for advanced formative inquiry and multi-variable synthesis.
                </p>
              </div>
            </div>

          </div>

          {/* Section 2: Enrolled Courses & Learning Modules (Educational LMS Grid) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 font-outfit flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Enrolled Courses & Active Modules
                </h3>
                <p className="text-xs text-slate-500">
                  Current semester curriculum enrolled with real-time syllabus tracking
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                4 Active Courses • 15 Credits Total
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Course 1: Science & Photosynthesis */}
              <div className="rounded-2xl border border-slate-200 p-5 bg-gradient-to-br from-slate-50 to-white hover:border-indigo-300 hover:shadow-md transition-all space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                      SCI-701 • 4 Credits
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 mt-1.5 font-outfit">
                      Grade 7 Science: Plant Nutrition & Bioenergetics
                    </h4>
                    <p className="text-xs text-slate-500">Instructor: Dr. Aditi Sharma • CBSE 2026</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold">
                    Grade A+ (95%)
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Syllabus Completion (5/5 Modules)</span>
                    <span className="text-indigo-600 font-bold">95%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '95%' }} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">Autotrophic Nutrition</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">Chloroplasts</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">Stomata</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">Glucose Synthesis</span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Next: Formative Diagnostic</span>
                  <button
                    onClick={() => setStudentNavTab('learning')}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Launch Study Arena</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Course 2: Computer Networks */}
              <div className="rounded-2xl border border-slate-200 p-5 bg-gradient-to-br from-slate-50 to-white hover:border-indigo-300 hover:shadow-md transition-all space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono text-[10px] font-bold">
                      CS-501 • 4 Credits
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 mt-1.5 font-outfit">
                      Computer Networks & Transport Layer Protocols
                    </h4>
                    <p className="text-xs text-slate-500">Instructor: Prof. Rajesh Kulkarni • VTU Scheme 2022</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-extrabold">
                    Grade A (88%)
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Syllabus Completion (5/6 Modules)</span>
                    <span className="text-blue-600 font-bold">85%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">TCP Slow Start</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">Sliding Window</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">AIMD</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">Fast Recovery</span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Next: Congestion Simulation</span>
                  <button
                    onClick={() => setStudentNavTab('learning')}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Resume Module</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Course 3: Operating Systems */}
              <div className="rounded-2xl border border-slate-200 p-5 bg-gradient-to-br from-slate-50 to-white hover:border-indigo-300 hover:shadow-md transition-all space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 font-mono text-[10px] font-bold">
                      CS-502 • 4 Credits
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 mt-1.5 font-outfit">
                      Operating Systems & Process Synchronization
                    </h4>
                    <p className="text-xs text-slate-500">Instructor: Dr. Meera Nambiar • VTU Scheme 2022</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 text-xs font-extrabold">
                    Grade B+ (78%)
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Syllabus Completion (4/5 Modules)</span>
                    <span className="text-purple-600 font-bold">78%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: '78%' }} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">Semaphores</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">Banker's Algorithm</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">Page Replacement</span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Next: Deadlock Detection</span>
                  <button
                    onClick={() => setStudentNavTab('quiz')}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Take Practice Quiz</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Course 4: Data Structures */}
              <div className="rounded-2xl border border-slate-200 p-5 bg-gradient-to-br from-slate-50 to-white hover:border-indigo-300 hover:shadow-md transition-all space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-800 font-mono text-[10px] font-bold">
                      CS-503 • 3 Credits
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 mt-1.5 font-outfit">
                      Data Structures & Non-Linear Graph Algorithms
                    </h4>
                    <p className="text-xs text-slate-500">Instructor: Prof. Anand Rao • VTU Scheme 2022</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-extrabold">
                    Grade A+ (92%)
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Syllabus Completion (4/4 Modules)</span>
                    <span className="text-teal-600 font-bold">92%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-teal-600 h-full rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">AVL Trees</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">B-Trees</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">Dijkstra Shortest Path</span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Status: All Modules Mastered</span>
                  <button
                    onClick={() => setStudentNavTab('assessments')}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
                  >
                    <span>View Transcript</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Section 3: Verified Micro-Credentials & Gamification Badges */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-outfit">
                    Verified Micro-Credentials & Achievement Badges
                  </h3>
                  <p className="text-xs text-slate-500">
                    Blockchain-verifiable pedagogical masteries earned through continuous formative checkpoints
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                5 Badges Unlocked
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-white border border-amber-200/80 flex items-start space-x-3.5 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-xs flex-shrink-0">
                  🏆
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900">Master of TCP Flow Control</h4>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Demonstrated 100% accuracy on Slow Start and Congestion Avoidance algorithms.
                  </p>
                  <span className="text-[10px] text-amber-700 font-semibold block">Issued: Oct 2026 • Verified</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200/80 flex items-start space-x-3.5 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shadow-xs flex-shrink-0">
                  🌱
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900">NCERT Biology Scholar</h4>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Completed 3-Tier differentiated Bioenergetics and stomata inquiry challenge.
                  </p>
                  <span className="text-[10px] text-emerald-700 font-semibold block">Issued: Sep 2026 • Verified</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-200/80 flex items-start space-x-3.5 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold text-lg shadow-xs flex-shrink-0">
                  🗣️
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900">Bhashini Multilingual Pioneer</h4>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Engaged with AI voice co-pilot across English, Hindi, and Kannada modules.
                  </p>
                  <span className="text-[10px] text-indigo-700 font-semibold block">Issued: Oct 2026 • Verified</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-50 to-white border border-cyan-200/80 flex items-start space-x-3.5 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center font-bold text-lg shadow-xs flex-shrink-0">
                  ⚡
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900">14-Day Consecutive Streak</h4>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Logged in daily and maintained consistent active inquiry in curriculum graphs.
                  </p>
                  <span className="text-[10px] text-cyan-700 font-semibold block">Active Streak • Level 7</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-white border border-purple-200/80 flex items-start space-x-3.5 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center font-bold text-lg shadow-xs flex-shrink-0">
                  🎖️
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900">Top 5% Cohort Mastery</h4>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Placed in top percentile for cumulative formative assessment scores.
                  </p>
                  <span className="text-[10px] text-purple-700 font-semibold block">Rank #3 in Cohort</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 1: STUDY ARENA */}
      {studentNavTab === 'learning' && (
        <div className="space-y-6">
          
          {/* 3D Modality Control Deck */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 bg-white rounded-3xl border border-slate-200/90 shadow-md">
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider mr-1">Study Mode:</span>
              
              <button
                onClick={() => setActiveLearningMode('visual')}
                className={`btn-3d px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1.5 cursor-pointer ${
                  activeLearningMode === 'visual' ? 'btn-3d-indigo' : 'btn-3d-white text-slate-700'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>3D Visuals</span>
              </button>

              <button
                onClick={() => setActiveLearningMode('text')}
                className={`btn-3d px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1.5 cursor-pointer ${
                  activeLearningMode === 'text' ? 'btn-3d-sky' : 'btn-3d-white text-slate-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Notes & Formula</span>
              </button>

              <button
                onClick={() => setActiveLearningMode('voice')}
                className={`btn-3d px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1.5 cursor-pointer ${
                  activeLearningMode === 'voice' ? 'btn-3d-emerald' : 'btn-3d-white text-slate-700'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Voice AI Tutor</span>
              </button>

              <button
                onClick={() => setStudentNavTab('quiz')}
                className="btn-3d btn-3d-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1.5 cursor-pointer border border-slate-200"
              >
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Formative Check (11 Qs)</span>
              </button>
            </div>

            {/* Language & Scaffolding Tier Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                <button
                  onClick={() => handleSetStudentLanguage('English')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    studentLanguage === 'English' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => handleSetStudentLanguage('Hindi')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    studentLanguage === 'Hindi' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  हिंदी
                </button>
                <button
                  onClick={() => handleSetStudentLanguage('Kannada')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    studentLanguage === 'Kannada' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  ಕನ್ನಡ
                </button>
              </div>

              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
                <button
                  onClick={() => setExplanationTier('beginner')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    explanationTier === 'beginner' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {studentLanguage === 'Kannada' ? 'ಅಡುಗೆಮನೆ' : '🌱 Tier 1 (Plant Kitchen)'}
                </button>
                <button
                  onClick={() => setExplanationTier('standard')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    explanationTier === 'standard' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  📘 Tier 2 (Core)
                </button>
              </div>

            </div>

          </div>

          {/* Main 2-Column Grid Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column (7 cols): Visual Concept Card & Differentiated Content */}
            <div className="lg:col-span-7 space-y-5">
              
              <div className="card-3d p-5 sm:p-6 space-y-5">
                
                {/* Visual Scientific Diagram */}
                {(activeLearningMode === 'visual' || activeLearningMode === 'text') && (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-100 bg-slate-900 group shadow-md">
                    <img
                      src={lessonPlan.visualDiagram?.imageUrl || "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200"}
                      alt="Photosynthesis Concept Diagram"
                      className="w-full h-56 sm:h-64 object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-slate-950/70 flex flex-col justify-end p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-blue-600 text-white uppercase tracking-wider">
                            Interactive Scientific Concept Model
                          </span>
                          <h4 className="text-base sm:text-lg font-bold text-white mt-1 font-outfit">
                            {studentLanguage === 'Kannada' 
                              ? 'ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆಯ ರೇಖಾಚಿತ್ರ (Photosynthesis)' 
                              : (studentLanguage === 'Hindi' ? 'प्रकाश संश्लेषण आरेख (Photosynthesis)' : 'Chloroplast & Stomata Mechanics')}
                          </h4>
                        </div>
                        
                        <button
                          onClick={() => {
                            const text = studentLanguage === 'Kannada'
                              ? (lessonPlan.beginnerExplanation.keyAnalogyKannada || lessonPlan.beginnerExplanation.keyAnalogy)
                              : (studentLanguage === 'Hindi' ? lessonPlan.beginnerExplanation.keyAnalogyHindi : lessonPlan.beginnerExplanation.keyAnalogy);
                            onSpeakText(text, studentLanguage);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg cursor-pointer transition-colors"
                          title="Listen to Audio Explanation"
                        >
                          <Volume2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Differentiated Content Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
                  
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                    <span className="uppercase tracking-wider font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      {explanationTier === 'beginner' && '🌱 Tier 1 Scaffold: Concrete Plant Kitchen Analogy'}
                      {explanationTier === 'standard' && '📘 Tier 2 Standard: NCERT 2026 Core Curriculum'}
                      {explanationTier === 'advanced' && '🚀 Tier 3 Inquiry: Calvin Cycle & Extension'}
                    </span>
                  </div>

                  {/* Tier 1 Analogy */}
                  {explanationTier === 'beginner' && (
                    <div className="space-y-3 text-sm">
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 font-medium leading-relaxed">
                        <div className="flex items-center justify-between mb-1">
                          <strong className="text-amber-900 block">
                            {studentLanguage === 'Kannada' ? '🍳 ಸಸ್ಯದ ಅಡುಗೆಮನೆ (Plant Kitchen Analogy):' : (studentLanguage === 'Hindi' ? '🍳 पौधे की रसोई (Plant Kitchen Analogy):' : '🍳 The Plant Solar Kitchen Analogy:')}
                          </strong>
                          <button
                            onClick={() => {
                              const text = studentLanguage === 'Kannada'
                                ? (lessonPlan.beginnerExplanation.keyAnalogyKannada || lessonPlan.beginnerExplanation.keyAnalogy)
                                : (studentLanguage === 'Hindi' ? lessonPlan.beginnerExplanation.keyAnalogyHindi : lessonPlan.beginnerExplanation.keyAnalogy);
                              onSpeakText(text, studentLanguage);
                            }}
                            className="p-1 rounded-md bg-amber-200/80 hover:bg-amber-300 text-amber-900 cursor-pointer transition-colors"
                            title="Listen to Analogy"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {studentLanguage === 'Kannada'
                          ? (lessonPlan.beginnerExplanation.keyAnalogyKannada || lessonPlan.beginnerExplanation.keyAnalogy)
                          : (studentLanguage === 'Hindi' ? lessonPlan.beginnerExplanation.keyAnalogyHindi : lessonPlan.beginnerExplanation.keyAnalogy)}
                      </div>

                      {/* Chemical Equation Highlight */}
                      <div className="p-3.5 rounded-xl bg-indigo-900 text-white font-mono text-xs sm:text-sm text-center font-bold tracking-wide shadow-inner">
                        6CO₂ + 6H₂O + Sunlight (Photons) ➔ C₆H₁₂O₆ (Glucose) + 6O₂
                      </div>

                      {/* Bilingual Glossary */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {lessonPlan.beginnerExplanation.vocabularyGlossary.map((v, i) => (
                          <div key={i} className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                            <span className="font-bold text-indigo-700">{v.term}</span>
                            <span className="text-xs text-slate-500 ml-1.5">({studentLanguage === 'Kannada' ? (v.kannadaTerm || v.hindiTerm) : (studentLanguage === 'Hindi' ? v.hindiTerm : v.term)})</span>
                            <p className="text-[11px] text-slate-600 mt-0.5">{v.definition}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tier 2 Standard */}
                  {explanationTier === 'standard' && (
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-700">NCERT Core Definition:</span>
                        <button
                          onClick={() => {
                            const text = studentLanguage === 'Hindi'
                              ? 'हरे पौधे सूर्य के प्रकाश, कार्बन डाइऑक्साइड और जल की सहायता से ग्लूकोज और ऑक्सीजन का निर्माण करते हैं।'
                              : (studentLanguage === 'Kannada' 
                                ? 'ಹಸಿರು ಸಸ್ಯಗಳು ಸೂರ್ಯನ ಬೆಳಕು, ಇಂಗಾಲದ ಡೈಆಕ್ಸೈಡ್ ಮತ್ತು ನೀರಿನ ಸಹಾಯದಿಂದ ಗ್ಲೂಕೋಸ್ ಮತ್ತು ಆಮ್ಲಜನಕವನ್ನು ತಯಾರಿಸುತ್ತವೆ.' 
                                : 'Photosynthesis is the biochemical synthesis where chlorophyll in leaf chloroplasts converts Carbon Dioxide and Water into glucose sugar and oxygen gas.');
                            onSpeakText(text, studentLanguage);
                          }}
                          className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                          title="Listen to Definition"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-slate-700 leading-relaxed font-medium">
                        {studentLanguage === 'Hindi'
                          ? 'हरे पौधे सूर्य के प्रकाश, कार्बन डाइऑक्साइड और जल की सहायता से ग्लूकोज और ऑक्सीजन का निर्माण करते हैं।'
                          : (studentLanguage === 'Kannada' 
                            ? 'ಹಸಿರು ಸಸ್ಯಗಳು ಸೂರ್ಯನ ಬೆಳಕು, ಇಂಗಾಲದ ಡೈಆಕ್ಸೈಡ್ ಮತ್ತು ನೀರಿನ ಸಹಾಯದಿಂದ ಗ್ಲೂಕೋಸ್ ಮತ್ತು ಆಮ್ಲಜನಕವನ್ನು ತಯಾರಿಸುತ್ತವೆ.' 
                            : 'Photosynthesis is the biochemical synthesis where chlorophyll in leaf chloroplasts converts CO2 and H2O into glucose sugar and oxygen gas.')}
                      </p>

                      <div className="p-3.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs text-center font-bold">
                        Verified Citation: NCERT Grade 7 Science Ch 1 (pp. 12–16) • Standard CBSE 2026
                      </div>
                    </div>
                  )}

                </div>

              </div>

            </div>

            {/* Right Column (5 cols): Socratic Voice AI Chat Companion & Quiz */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Socratic Chat Companion Deck */}
              <div className="card-3d p-4 sm:p-5 flex flex-col h-[480px]">
                
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 font-outfit">
                        Socratic AI Voice Tutor
                      </h3>
                      <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        Bhashini Indic AI Ready
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onToggleSpeech}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    {isSpeaking ? <Volume2 className="w-4 h-4 text-indigo-600 animate-bounce" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                </div>

                {/* Chat Message Stream */}
                <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
                  {voiceMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                          msg.sender === 'student'
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <span className={`text-[9px] block text-right mt-1 ${msg.sender === 'student' ? 'text-blue-100' : 'text-slate-400'}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Spoken Query Suggestions */}
                <div className="flex flex-wrap gap-1.5 pb-2 pt-1 border-t border-slate-200/60">
                  <button
                    onClick={() => handleSendVoiceQuestion('What is the role of stomata?')}
                    className="text-[10px] px-2 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-semibold transition-colors"
                  >
                    🍃 How do stomata open?
                  </button>
                  <button
                    onClick={() => handleSendVoiceQuestion('Explain the plant kitchen analogy')}
                    className="text-[10px] px-2 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-semibold transition-colors"
                  >
                    🍳 Plant Kitchen Analogy
                  </button>
                </div>

                {/* Interactive Voice/Text Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendVoiceQuestion(studentSpokenInput);
                  }}
                  className="relative flex items-center"
                >
                  <input
                    type="text"
                    value={studentSpokenInput}
                    onChange={(e) => setStudentSpokenInput(e.target.value)}
                    placeholder="Ask a doubt or question..."
                    className="w-full bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-indigo-500 rounded-xl pl-3 pr-20 py-2.5 text-xs text-slate-900 outline-none shadow-inner"
                  />
                  <div className="absolute right-1 flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleSendVoiceQuestion('What are stomata?')}
                      className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 cursor-pointer"
                      title="Voice Input"
                    >
                      <Mic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="submit"
                      disabled={!studentSpokenInput.trim()}
                      className="btn-3d btn-3d-indigo p-1.5 rounded-lg text-white disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>

              </div>

              {/* Formative Arena Quiz Card */}
              <div className="card-3d p-4 sm:p-5 space-y-4">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-900 font-outfit">
                      Formative Diagnostic Check ({currentQIndex + 1}/{questions.length})
                    </h3>
                  </div>

                  <button
                    onClick={() => setStudentNavTab('quiz')}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Full 11-Q Engine</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                </div>

                {!isQuizSubmitted ? (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 flex items-center justify-between">
                      <span>
                        {studentLanguage === 'Hindi' 
                          ? (currentQ.questionHindi || currentQ.question) 
                          : (studentLanguage === 'Kannada' ? (currentQ.questionKannada || currentQ.question) : currentQ.question)}
                      </span>
                      <button
                        onClick={() => {
                          const qText = studentLanguage === 'Hindi'
                            ? (currentQ.questionHindi || currentQ.question)
                            : (studentLanguage === 'Kannada' ? (currentQ.questionKannada || currentQ.question) : currentQ.question);
                          onSpeakText(qText, studentLanguage);
                        }}
                        className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 cursor-pointer transition-colors ml-2 flex-shrink-0"
                        title="Listen to Question"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(studentLanguage === 'Hindi'
                        ? (currentQ.optionsHindi && currentQ.optionsHindi.length > 0 ? currentQ.optionsHindi : currentQ.options)
                        : (studentLanguage === 'Kannada'
                          ? (currentQ.optionsKannada && currentQ.optionsKannada.length > 0 ? currentQ.optionsKannada : currentQ.options)
                          : currentQ.options)
                      ).map((opt, optIdx) => {
                        const isSelected = selectedAnswers[currentQIndex] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(optIdx)}
                            className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-950 font-bold ring-2 ring-indigo-200'
                                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span>{opt}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={handleResetQuiz}
                        className="text-slate-500 hover:text-slate-700 text-xs font-semibold"
                      >
                        Reset
                      </button>

                      <button
                        onClick={handleNextQuiz}
                        disabled={selectedAnswers[currentQIndex] === undefined}
                        className="btn-3d btn-3d-indigo px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer"
                      >
                        {currentQIndex < questions.length - 1 ? 'Next Question' : 'Submit & Score'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                      🎉
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900 font-outfit">
                      Score: {calculateScore()} / {questions.length} Correct!
                    </h4>
                    <p className="text-xs text-slate-500">
                      Telemetry updated. Living Learning Twin risk score reduced by formative practice.
                    </p>
                    <button
                      onClick={handleResetQuiz}
                      className="btn-3d btn-3d-emerald px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Try Quiz Again
                    </button>
                  </div>
                )}

              </div>

            </div>

          </div>

        </div>
      )}

      {/* TAB 2: FORMATIVE CHECK & LIVE DKT TELEMETRY */}
      {studentNavTab === 'quiz' && (
        <FormativeQuizEngine
          lessonPlan={lessonPlan}
          students={students}
          currentStudentId={currentStudent.id}
          selectedLanguage={studentLanguage}
          onUpdateStudentScore={onUpdateStudentScore}
          onSpeakText={onSpeakText}
          initialMode="quiz"
        />
      )}

      {/* TAB 3: CALENDAR & PATH */}
      {studentNavTab === 'calendar' && (
        <CalendarView currentPersona="student" events={calendarEvents} />
      )}

      {/* TAB 3: ASSESSMENTS TELEMETRY */}
      {studentNavTab === 'assessments' && (
        <div className="card-3d p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 font-outfit">
              Completed Assessments & Living Twin Mastery Records
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Student ID: {currentStudent.id}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Topic / Concept</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Percentage</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assessments.filter(a => a.studentId === currentStudent.id).map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-900">{rec.topic}</td>
                    <td className="p-3 font-mono">{rec.score} / {rec.maxScore}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold">
                        {Math.round((rec.score / rec.maxScore) * 100)}%
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Mastered
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{rec.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. REASSESSMENT & REMEDIAL INTERVENTION MODAL */}
      {isReassessmentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-outfit">
                    Remedial Reassessment ({currentStudent.name})
                  </h3>
                  <p className="text-[10px] text-amber-700 font-semibold">
                    Target Concept: {activeIntervention?.concept || 'Remedial Review'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsReassessmentOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {!isReassessmentSubmitted ? (
              <div className="space-y-4 text-xs">
                {/* Progress bar */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                  <span>Question {reassessmentQIndex + 1} of {REASSESSMENT_QUESTIONS.length}</span>
                  <span className="font-mono text-amber-700 font-bold">
                    Pass criteria: ≥ 2/3 correct
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${((reassessmentQIndex + 1) / REASSESSMENT_QUESTIONS.length) * 100}%` }}
                  />
                </div>

                {/* Question */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 font-semibold text-amber-950 text-sm leading-relaxed">
                  {REASSESSMENT_QUESTIONS[reassessmentQIndex].question}
                </div>

                {/* Options */}
                <div className="space-y-2">
                  {REASSESSMENT_QUESTIONS[reassessmentQIndex].options.map((opt, optIdx) => {
                    const isSelected = reassessmentAnswers[reassessmentQIndex] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => setReassessmentAnswers(prev => ({ ...prev, [reassessmentQIndex]: optIdx }))}
                        className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-100 border-amber-500 text-amber-950 font-bold ring-2 ring-amber-300'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="text-xs">{opt}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      if (reassessmentQIndex > 0) setReassessmentQIndex(prev => prev - 1);
                    }}
                    disabled={reassessmentQIndex === 0}
                    className="text-xs text-slate-500 hover:text-slate-700 disabled:opacity-30 cursor-pointer font-semibold"
                  >
                    Previous
                  </button>

                  {reassessmentQIndex < REASSESSMENT_QUESTIONS.length - 1 ? (
                    <button
                      onClick={() => setReassessmentQIndex(prev => prev + 1)}
                      disabled={reassessmentAnswers[reassessmentQIndex] === undefined}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs disabled:opacity-40 cursor-pointer flex items-center space-x-1"
                    >
                      <span>Next Question</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleReassessmentSubmit}
                      disabled={reassessmentAnswers[reassessmentQIndex] === undefined}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs disabled:opacity-40 cursor-pointer flex items-center space-x-1"
                    >
                      <Check className="w-4 h-4" />
                      <span>Submit Reassessment</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
                  🎉
                </div>
                <h4 className="text-base font-extrabold text-slate-900 font-outfit">
                  Reassessment Complete!
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  Mastery telemetry synchronized for <strong>{currentStudent.name}</strong>. Intervention marked completed and risk score updated!
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setIsReassessmentOpen(false);
                      setIsReassessmentSubmitted(false);
                      setReassessmentAnswers({});
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    Return to Arena
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
