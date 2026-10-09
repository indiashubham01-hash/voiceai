import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { VoiceCoPilotBar } from './components/VoiceCoPilotBar';
import { LessonPlanView } from './components/LessonPlanView';
import { ConflictResolutionView } from './components/ConflictResolutionView';
import { LearnerRiskDashboard } from './components/LearnerRiskDashboard';
import { InteractiveKnowledgeGraph } from './components/InteractiveKnowledgeGraph';
import { CurriculumMapView } from './components/CurriculumMapView';
import { CalendarView } from './components/CalendarView';
import { StudentDashboard } from './components/StudentDashboard';
import { StudentDeliveryModal } from './components/StudentDeliveryModal';
import { ApprovalBar } from './components/ApprovalBar';
import { Footer } from './components/Footer';
import { AuditTrailModal } from './components/AuditTrailModal';
import { AgnesConfigModal } from './components/AgnesConfigModal';
import { BhashiniConfigModal } from './components/BhashiniConfigModal';
import { TeacherAuthModal } from './components/TeacherAuthModal';
import { AuthPortal } from './components/AuthPortal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileQuickDrawer } from './components/MobileQuickDrawer';
import { ExplainableAIChatBot } from './components/ExplainableAIChatBot';
import { PageVoiceReader } from './components/PageVoiceReader';
import { HierarchicalCurriculumBreadcrumb } from './components/HierarchicalCurriculumBreadcrumb';
import { voiceService } from './services/voiceService';
import { AgentEngine } from './services/agentEngine';
import { authService, AuthUser } from './services/authService';
import { sharedState } from './services/sharedStateManager';
import { curriculumStateManager } from './services/curriculumState';
import { 
  DEFAULT_PHOTOSYNTHESIS_LESSON_40MIN, 
  INITIAL_DOCUMENTS, 
  INITIAL_STUDENTS 
} from './data/mockData';
import { 
  AgentDecisionStep, 
  DocumentSource, 
  LessonPlan, 
  Student,
  CurriculumTopic,
  CalendarEvent
} from './types';
import confetti from 'canvas-confetti';

export function App() {
  // Global Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  const [currentPersona, setCurrentPersona] = useState<'teacher' | 'student'>(() => {
    const user = authService.getCurrentUser();
    return user ? user.role : 'student';
  });
  const [activeTeacherTab, setActiveTeacherTab] = useState<'lesson' | 'curriculum' | 'calendar' | 'sources' | 'students' | 'graph'>('lesson');
  const [selectedLanguage, setSelectedLanguage] = useState<'English' | 'Hindi' | 'Kannada' | 'Bilingual'>(() => {
    const user = authService.getCurrentUser();
    return user?.preferredLanguage || 'English';
  });
  const [lessonPlan, setLessonPlan] = useState<LessonPlan>(() => {
    const activeCurr = curriculumStateManager.getState();
    return activeCurr?.subject?.lessonPlan || DEFAULT_PHOTOSYNTHESIS_LESSON_40MIN;
  });
  const [documents, setDocuments] = useState<DocumentSource[]>(INITIAL_DOCUMENTS);
  const [students, setStudents] = useState<Student[]>(() => sharedState.getStudents());
  const [curriculumTopics, setCurriculumTopics] = useState<CurriculumTopic[]>(() => sharedState.getCurriculumTopics());
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => sharedState.getCalendarEvents());
  
  // Teacher Authentication State
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState<boolean>(() => {
    const user = authService.getCurrentUser();
    return user ? user.role === 'teacher' : true;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  
  // Agent & Voice States
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [agentSpeechSummary, setAgentSpeechSummary] = useState<string>(
    'Welcome teacher! I am MINDMESH-NEXUS, your voice-first AI teaching co-pilot. Speak naturally in English, Hindi, or Kannada to generate or replan your lessons, resolve document conflicts, and scaffold for at-risk students.'
  );
  const [steps, setSteps] = useState<AgentDecisionStep[]>([]);
  const [isAuditTrailOpen, setIsAuditTrailOpen] = useState<boolean>(false);
  const [isAgnesModalOpen, setIsAgnesModalOpen] = useState<boolean>(false);
  const [isBhashiniModalOpen, setIsBhashiniModalOpen] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [isPageReaderOpen, setIsPageReaderOpen] = useState<boolean>(false);

  // Initialize Speech Recognition callbacks & Auto-Read Page on Open
  useEffect(() => {
    voiceService.setCallbacks(
      (text: string, isFinal: boolean) => {
        setTranscript(text);
        if (isFinal && text.trim().length > 3) {
          handleExecuteCommand(text);
        }
      },
      (listening: boolean) => {
        setIsListening(listening);
      }
    );

    // Subscribe to multi-tab shared browser storage synchronization
    const unsubscribeSharedState = sharedState.subscribe(() => {
      setStudents(sharedState.getStudents());
      setCurriculumTopics(sharedState.getCurriculumTopics());
      setCalendarEvents(sharedState.getCalendarEvents());
    });

    // Subscribe to real-time hierarchical curriculum changes (University > Scheme > Branch > Subject)
    const unsubscribeCurriculum = curriculumStateManager.subscribe((currState) => {
      if (currState?.subject?.lessonPlan) {
        setLessonPlan(currState.subject.lessonPlan);
        const welcomeAnnouncement = `Curriculum context synchronized: ${currState.university.name} - ${currState.scheme.name} - ${currState.subject.code} ${currState.subject.title}`;
        setAgentSpeechSummary(welcomeAnnouncement);
      }
    });

    // Auto-Read Welcome Speech on Page Open
    const welcomeIntro =
      selectedLanguage === 'Hindi'
        ? 'माइंडमेश नेक्सस में आपका स्वागत है! आज का पाठ कक्षा 7 विज्ञान प्रकाश संश्लेषण है। हमने आपकी कक्षा के लिए 3-स्तरीय अनुकूलित पाठ तैयार किया है।'
        : selectedLanguage === 'Kannada'
        ? 'ಮೈಂಡ್‌ಮೆಶ್ ನೆಕ್ಸಸ್‌ಗೆ ಸುಸ್ವಾಗತ! ಇಂದಿನ ಪಾಠ 7ನೇ ತರಗತಿಯ ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ. ನಿಮ್ಮ ತರಗತಿಗಾಗಿ 3 ಹಂತದ ಪಾಠವನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ.'
        : 'Welcome to MINDMESH-NEXUS! Today\'s lesson is Grade 7 Science Photosynthesis. We have adapted 3-tier scaffolds for your classroom and verified NCERT ground truth.';

    const voiceLang = selectedLanguage === 'Kannada' ? 'kn-IN' : (selectedLanguage === 'Hindi' ? 'hi-IN' : 'en-IN');
    
    // Initial pipeline execution to populate initial audit trail
    AgentEngine.executePipeline('I need a 40-minute Grade 7 science lesson on photosynthesis in English, Hindi, and Kannada.').then((res) => {
      setSteps(res.steps);
      setAgentSpeechSummary(res.speechSummary);
    }).catch(err => {
      console.warn('Initial pipeline warm up notice:', err);
    });

    return () => {
      unsubscribeSharedState();
      unsubscribeCurriculum();
    };
  }, []);

  // Handle Dynamic Language Switching with Instant Voice Readout
  const handleLanguageChange = (newLang: 'English' | 'Hindi' | 'Kannada' | 'Bilingual') => {
    setSelectedLanguage(newLang);
    const user = authService.getCurrentUser();
    if (user) {
      authService.updateUserLanguage(user.id, newLang);
      setCurrentUser(prev => prev ? { ...prev, preferredLanguage: newLang } : null);
    }

    const langFeedback: Record<string, { summary: string; voiceLang: string }> = {
      English: {
        summary: 'English curriculum active. Grade 7 Photosynthesis lesson loaded with 3-tier differentiated scaffolding.',
        voiceLang: 'en-IN'
      },
      Hindi: {
        summary: 'हिंदी पाठ्यक्रम सक्रिय है। कक्षा 7 प्रकाश संश्लेषण पाठ और बहुभाषी व्याख्या लोड हो गई है।',
        voiceLang: 'hi-IN'
      },
      Kannada: {
        summary: 'ಕನ್ನಡ ಪಠ್ಯಕ್ರಮ ಸಕ್ರಿಯವಾಗಿದೆ. 7ನೇ ತರಗತಿಯ ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ ಪಾಠ ಮತ್ತು ಪ್ರಶ್ನೋತ್ತರಗಳು ಸಿದ್ಧವಾಗಿವೆ.',
        voiceLang: 'kn-IN'
      },
      Bilingual: {
        summary: 'Multilingual mode active in English, Hindi, and Kannada. प्रकाश संश्लेषण ಮತ್ತು ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ.',
        voiceLang: 'Bilingual'
      }
    };

    const target = langFeedback[newLang] || langFeedback.English;
    setAgentSpeechSummary(target.summary);
    setIsSpeaking(true);
    voiceService.speak(target.summary, () => {
      setIsSpeaking(false);
    }, target.voiceLang);
  };

  // Handle Voice Command Execution
  const handleExecuteCommand = async (commandText: string) => {
    if (!commandText || !commandText.trim()) return;
    setIsProcessing(true);
    await voiceService.stopListening().catch(() => {});

    try {
      const pipelinePromise = AgentEngine.executePipeline(commandText.trim(), (newStep) => {
        setSteps(prev => [...prev, newStep]);
      });

      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Pipeline execution timeout')), 5000)
      );

      const result = await Promise.race([pipelinePromise, timeoutPromise]).catch(async (e) => {
        console.warn('Pipeline race timeout, executing local fallback:', e);
        return await AgentEngine.executePipeline(commandText.trim());
      });

      if (result) {
        setLessonPlan(result.lessonPlan);
        setSteps(result.steps);
        setAgentSpeechSummary(result.speechSummary);

        // Multi-tab shared state sync
        setStudents(sharedState.getStudents());
        setCalendarEvents(sharedState.getCalendarEvents());
        setCurriculumTopics(sharedState.getCurriculumTopics());

        // Route persona if requested
        if (result.intent?.actionOutcome?.targetPersona) {
          setCurrentPersona(result.intent.actionOutcome.targetPersona);
        }

        // Route tab if requested, else maintain or switch to lesson
        if (result.intent?.actionOutcome?.targetTab) {
          setActiveTeacherTab(result.intent.actionOutcome.targetTab);
        } else if (!result.intent?.actionOutcome) {
          setActiveTeacherTab('lesson');
        }

        // Trigger celebratory confetti if approval action
        if (result.intent?.action === 'approve') {
          confetti({
            particleCount: 75,
            spread: 60,
            origin: { y: 0.85 }
          });
        }

        // Speak Siri/Alexa response aloud to the user
        if (result.speechSummary) {
          setIsSpeaking(true);
          voiceService.speak(result.speechSummary, () => {
            setIsSpeaking(false);
          }, selectedLanguage);
        }
      }

    } catch (err) {
      console.error('Pipeline execution error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleListen = async () => {
    if (isListening) {
      setIsListening(false);
      const text = await voiceService.stopListening();
      const commandToRun = (text && text.trim().length > 2) ? text.trim() : transcript.trim();
      if (commandToRun.length > 2) {
        setTranscript(commandToRun);
        handleExecuteCommand(commandToRun);
      }
    } else {
      const langCode = selectedLanguage === 'Kannada' ? 'kn-IN' : (selectedLanguage === 'Hindi' ? 'hi-IN' : 'en-IN');
      voiceService.setCallbacks(
        (text: string, isFinal: boolean) => {
          setTranscript(text);
          if (isFinal && text.trim().length > 3) {
            handleExecuteCommand(text);
          }
        },
        (listening: boolean) => {
          setIsListening(listening);
        }
      );
      setIsListening(true);
      await voiceService.startListening(langCode);
    }
  };

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    } else if (agentSpeechSummary) {
      setIsSpeaking(true);
      voiceService.speak(agentSpeechSummary, () => {
        setIsSpeaking(false);
      }, selectedLanguage);
    }
  };

  const handleSpeakCustomText = (text: string, lang?: string) => {
    setIsSpeaking(true);
    voiceService.speak(text, () => {
      setIsSpeaking(false);
    }, lang || (selectedLanguage === 'Bilingual' ? 'Bilingual' : selectedLanguage));
  };

  const handleApprove = () => {
    setLessonPlan(prev => ({
      ...prev,
      approvalState: 'approved',
      lastUpdated: 'Just now (Approved by Teacher)'
    }));

    // Workflow Item 4: Approval publishes the lesson and adds its topic to the student path
    sharedState.publishLesson(
      lessonPlan.topic,
      lessonPlan.subject || 'NCERT Grade 7 Science',
      ['Chloroplast Anatomy', 'Stomata Gas Dynamics', 'Balanced Stoichiometry']
    );

    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.85 }
    });
  };

  const handleTriggerReplan = () => {
    const replanPrompt = 'The class is behind; reduce this to 20 minutes.';
    setTranscript(replanPrompt);
    handleExecuteCommand(replanPrompt);
  };

  const handleDeliverToStudents = () => {
    setCurrentPersona('student');
    setLessonPlan(prev => ({
      ...prev,
      approvalState: 'delivered'
    }));
  };

  const handleUpdateStudentScore = (studentId: string, score: number) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId) {
          const newRisk = Math.max(12, s.riskScore - score * 16);
          const updatedTwin = s.learningTwin ? {
            ...s.learningTwin,
            conceptBreakdown: s.learningTwin.conceptBreakdown.map(c => {
              if (c.status === 'struggling') {
                const newPct = Math.min(95, c.masteryPercentage + score * 12);
                return {
                  ...c,
                  masteryPercentage: newPct,
                  status: newPct >= 75 ? ('mastered' as const) : (newPct >= 60 ? ('moderate' as const) : ('struggling' as const)),
                  trend: 'improving' as const
                };
              }
              return c;
            }),
            learningTrajectory: [
              ...s.learningTwin.learningTrajectory,
              {
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                concept: s.weakConcepts[0] || 'Formative Quiz Check',
                deltaScore: Math.round((score / 3) * 100),
                action: 'Quiz Completed in Student View'
              }
            ]
          } : undefined;

          return {
            ...s,
            riskScore: newRisk,
            riskReason: score >= 2 ? 'Mastery dynamically improved through formative checkpoint!' : s.riskReason,
            learningTwin: updatedTwin
          };
        }
        return s;
      })
    );
  };

  const handleRequestTeacherAccess = () => {
    setIsAuthModalOpen(true);
  };

  const handleAuthenticateTeacher = () => {
    setIsTeacherAuthenticated(true);
    setCurrentPersona('teacher');
  };

  const handleLockTeacherAccess = () => {
    setIsTeacherAuthenticated(false);
    setCurrentPersona('student');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setCurrentPersona(user.role);
    setIsTeacherAuthenticated(user.role === 'teacher');
    if (user.preferredLanguage) {
      setSelectedLanguage(user.preferredLanguage);
    }
  };

  // If user is not authenticated, show the full WhatsApp 2FA Auth Portal
  if (!currentUser) {
    return <AuthPortal onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col selection:bg-sky-500/20 selection:text-sky-900">
      
      {/* Top Navigation with Persona Switcher & Auth Profile */}
      <Navbar
        currentPersona={currentPersona}
        setCurrentPersona={setCurrentPersona}
        activeTeacherTab={activeTeacherTab}
        setActiveTeacherTab={setActiveTeacherTab}
        lessonPlan={lessonPlan}
        isSpeaking={isSpeaking}
        onToggleSpeech={handleToggleSpeech}
        onOpenAuditTrail={() => setIsAuditTrailOpen(true)}
        onOpenAgnesConfig={() => setIsAgnesModalOpen(true)}
        onOpenBhashiniConfig={() => setIsBhashiniModalOpen(true)}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={handleLanguageChange}
        isTeacherAuthenticated={isTeacherAuthenticated}
        onRequestTeacherAccess={handleRequestTeacherAccess}
        onLockTeacherAccess={handleLockTeacherAccess}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
        onTogglePageReader={() => setIsPageReaderOpen(prev => !prev)}
        isPageReaderOpen={isPageReaderOpen}
      />

      {/* Hierarchical Curriculum Breadcrumb Selector Bar (University > Scheme > Branch/Sem > Subject) */}
      <HierarchicalCurriculumBreadcrumb />

      {/* Main Dynamic View Content (Safe bottom margin for mobile dock) */}
      <main className="flex-1 pb-24 md:pb-12">
        {currentPersona === 'teacher' ? (
          <>
            {/* Main Voice Co-Pilot Bar for Teacher */}
            <VoiceCoPilotBar
              isListening={isListening}
              isProcessing={isProcessing}
              isSpeaking={isSpeaking}
              transcript={transcript}
              setTranscript={setTranscript}
              onToggleListen={handleToggleListen}
              onSubmitCommand={handleExecuteCommand}
              onToggleSpeech={handleToggleSpeech}
              agentSpeechSummary={agentSpeechSummary}
              onOpenBhashiniConfig={() => setIsBhashiniModalOpen(true)}
              onTogglePageReader={() => setIsPageReaderOpen(prev => !prev)}
              isPageReaderOpen={isPageReaderOpen}
            />

            {/* Teacher Dashboard Tabs */}
            {activeTeacherTab === 'lesson' && (
              <LessonPlanView
                lessonPlan={lessonPlan}
                selectedLanguage={selectedLanguage}
                onSpeakText={handleSpeakCustomText}
              />
            )}

            {activeTeacherTab === 'curriculum' && (
              <CurriculumMapView
                currentPersona="teacher"
                topics={curriculumTopics}
                onOpenLesson={(topicId) => setActiveTeacherTab('lesson')}
                onScheduleTopic={(topic) => setActiveTeacherTab('calendar')}
              />
            )}

            {activeTeacherTab === 'calendar' && (
              <CalendarView
                currentPersona="teacher"
                events={calendarEvents}
                onOpenLesson={(topicId) => setActiveTeacherTab('lesson')}
              />
            )}

            {activeTeacherTab === 'sources' && (
              <ConflictResolutionView
                documents={documents}
                lessonPlan={lessonPlan}
              />
            )}

            {activeTeacherTab === 'students' && (
              <LearnerRiskDashboard
                students={students}
                onOpenGraphTab={() => setActiveTeacherTab('graph')}
              />
            )}

            {activeTeacherTab === 'graph' && (
              <InteractiveKnowledgeGraph
                students={students}
                onLaunchMicroLesson={(concept) => {
                  const prompt = `Explain the prerequisite concept '${concept}' using a bilingual analogy and generate an inquiry checkpoint.`;
                  setTranscript(prompt);
                  handleExecuteCommand(prompt);
                }}
              />
            )}

            {/* Sticky Bottom Teacher Approval & Governance Bar */}
            <ApprovalBar
              lessonPlan={lessonPlan}
              onApprove={handleApprove}
              onDeliverToStudents={handleDeliverToStudents}
              onTriggerReplan={handleTriggerReplan}
            />
          </>
        ) : (
          /* Student Multimodal Voice Workspace Dashboard (Isolated Account) */
          <StudentDashboard
            lessonPlan={lessonPlan}
            students={students}
            currentUser={currentUser}
            onUpdateStudentScore={handleUpdateStudentScore}
            onSpeakText={handleSpeakCustomText}
            isSpeaking={isSpeaking}
            onToggleSpeech={handleToggleSpeech}
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Dock for Easy One-Thumb Access */}
      <MobileBottomNav
        currentPersona={currentPersona}
        setCurrentPersona={setCurrentPersona}
        activeTeacherTab={activeTeacherTab}
        setActiveTeacherTab={setActiveTeacherTab}
        isListening={isListening}
        isProcessing={isProcessing}
        onToggleListen={handleToggleListen}
        lessonPlan={lessonPlan}
        isTeacherAuthenticated={isTeacherAuthenticated}
        onRequestTeacherAccess={handleRequestTeacherAccess}
      />

      {/* Mobile Quick Drawer / Actions Sheet */}
      <MobileQuickDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        currentPersona={currentPersona}
        setCurrentPersona={setCurrentPersona}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={handleLanguageChange}
        isSpeaking={isSpeaking}
        onToggleSpeech={handleToggleSpeech}
        onOpenAuditTrail={() => setIsAuditTrailOpen(true)}
        onOpenAgnesConfig={() => setIsAgnesModalOpen(true)}
        onOpenBhashiniConfig={() => setIsBhashiniModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onSelectPrompt={(p) => {
          setTranscript(p);
          handleExecuteCommand(p);
        }}
        lessonPlan={lessonPlan}
      />

      {/* Institutional Footer */}
      <Footer />

      {/* Educator Passcode Protection Modal */}
      <TeacherAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticate={handleAuthenticateTeacher}
      />

      {/* Agent Decision Audit Trail Modal */}
      <AuditTrailModal
        isOpen={isAuditTrailOpen}
        onClose={() => setIsAuditTrailOpen(false)}
        steps={steps}
        lessonPlan={lessonPlan}
      />

      {/* Official Agnes 3.0 Flash & Rate Limiter Configuration Modal */}
      <AgnesConfigModal
        isOpen={isAgnesModalOpen}
        onClose={() => setIsAgnesModalOpen(false)}
      />

      {/* Digital India Bhashini Indic Voice AI Configuration & Mic Diagnostics Modal */}
      <BhashiniConfigModal
        isOpen={isBhashiniModalOpen}
        onClose={() => setIsBhashiniModalOpen(false)}
      />

      {/* Grounded Photosynthesis Explainable AI (XAI) Socratic Chatbot */}
      <ExplainableAIChatBot
        currentLanguage={selectedLanguage}
        students={students}
        onSpeakText={handleSpeakCustomText}
      />

      {/* Floating Indic Voice Page Reader Toolbar */}
      {isPageReaderOpen && (
        <PageVoiceReader
          activeTab={currentPersona === 'student' ? 'learners' : activeTeacherTab}
          selectedLanguage={selectedLanguage}
          lessonPlan={lessonPlan}
          students={students}
          conflicts={documents}
          isOpen={isPageReaderOpen}
          onToggleOpen={() => setIsPageReaderOpen(!isPageReaderOpen)}
        />
      )}

    </div>
  );
}

export default App;
