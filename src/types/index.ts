export interface ConceptMasteryItem {
  conceptName: string;
  masteryPercentage: number; // 0 - 100
  trend?: 'improving' | 'declining' | 'stable';
  category?: string;
  status: 'mastered' | 'moderate' | 'struggling';
}

export interface ConceptEvidence {
  conceptName: string;
  masteryPercentage: number;
  evidenceItems: {
    type: 'correct' | 'mistake' | 'latency' | 'confidence' | 'repetition';
    icon: string;
    text: string;
    severity: 'success' | 'danger' | 'warning' | 'info';
  }[];
  evidenceFlow?: {
    step: string;
    value: string;
  }[];
}

export interface ExplainableAdaptation {
  studentName: string;
  conceptName: string;
  adaptationHeadline: string;
  whyShikshaDidThis: string[];
  previousPath: string[];
  newPath: string[];
  noveltyMessage: string;
}

export interface AdaptiveRoute {
  id: string;
  studentPersona: string;
  studentName: string;
  preferenceDescription: string;
  routeSteps: {
    phase: string;
    description: string;
    modality: 'example' | 'diagram' | 'audio' | 'interaction' | 'quiz';
  }[];
  sameLearningObjective: string;
}

export interface TeacherCopilotRecommendation {
  id: string;
  title: string;
  strugglingStudentCount: number;
  strugglingStudentNames: string[];
  topic: string;
  recommendationText: string;
  prerequisiteActivityMinutes: number;
  status: 'pending' | 'applied' | 'modified' | 'ignored';
  teacherFeedback?: string;
}

export interface LearningTwin {
  studentName: string;
  subjectDomain: string;
  conceptBreakdown: ConceptMasteryItem[];
  cognitiveTraits: {
    strongAt: string[];
    weakAt: string[];
    modalityPreference: string;
    learningPace: 'slow' | 'standard' | 'fast';
  };
  predictedDifficulty: {
    targetConcept: string;
    riskPercentage: number;
    recommendedIntervention: string;
  };
  learningTrajectory: {
    timestamp: string;
    concept: string;
    deltaScore: number;
    action: string;
  }[];
  explainableAdaptation?: ExplainableAdaptation;
  conceptEvidences?: ConceptEvidence[];
}

export interface Student {
  id: string;
  name: string;
  avatar: string;
  grade: number;
  learningPace: 'slow' | 'standard' | 'fast';
  preferredLanguage: 'English' | 'Hindi' | 'Kannada' | 'Bilingual';
  recentScores: {
    quizName: string;
    score: number;
    maxScore: number;
    date: string;
  }[];
  weakConcepts: string[];
  masteredConcepts: string[];
  riskScore: number; // 0 - 100
  riskReason: string;
  recommendedScaffolding: string;
  learningTwin?: LearningTwin;
  conceptEvidences?: ConceptEvidence[];
  explainableAdaptation?: ExplainableAdaptation;
}

export interface DocumentSource {
  id: string;
  title: string;
  filename: string;
  type: 'textbook' | 'notes' | 'curriculum_guide' | 'quiz_data';
  uploadDate: string;
  versionYear: number;
  trustScore: number; // 0 - 100
  status: 'active' | 'outdated_ignored' | 'conflict_flagged';
  relevantPages: string;
  summary: string;
  extractedSnippet: string;
  conflictReason?: string;
  citationKey: string;
  fileBlobUrl?: string;
  fileSize?: string;
  pdfPages?: {
    pageNumber: number;
    title: string;
    content: string;
    keyPoints?: string[];
    diagramDescription?: string;
  }[];
}

export interface LessonSection {
  id: string;
  timeAllocationMinutes: number;
  title: string;
  titleHindi?: string;
  titleKannada?: string;
  icon: string;
  teacherTalkingPoints: string[];
  teacherTalkingPointsHindi?: string[];
  teacherTalkingPointsKannada?: string[];
  studentActivities: string[];
  scaffoldingTips?: string;
  groundedInCitation: string;
}

export interface FormativeQuizItem {
  id: string;
  question: string;
  questionHindi: string;
  questionKannada?: string;
  options: string[];
  optionsHindi: string[];
  optionsKannada?: string[];
  correctAnswerIndex: number;
  explanation: string;
  explanationHindi: string;
  explanationKannada?: string;
  targetedConcept: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface LessonPlan {
  id: string;
  topic: string;
  topicHindi: string;
  topicKannada?: string;
  grade: number;
  subject: string;
  totalDurationMinutes: number;
  targetExamDate?: string;
  languages: ('English' | 'Hindi' | 'Kannada')[];
  
  // Differentiated Content Levels
  beginnerExplanation: {
    summary: string;
    summaryHindi: string;
    summaryKannada?: string;
    keyAnalogy: string;
    keyAnalogyHindi: string;
    keyAnalogyKannada?: string;
    visualCues: string[];
    vocabularyGlossary: { term: string; hindiTerm: string; kannadaTerm?: string; definition: string }[];
    targetStudents: string[];
  };

  standardLesson: {
    objectives: string[];
    objectivesHindi: string[];
    objectivesKannada?: string[];
    sections: LessonSection[];
  };

  advancedActivity: {
    title: string;
    titleHindi: string;
    titleKannada?: string;
    inquiryChallenge: string;
    inquiryChallengeHindi: string;
    inquiryChallengeKannada?: string;
    deepQuestions: string[];
    extensionMaterials: string[];
    targetStudents: string[];
  };

  visualDiagram: {
    title: string;
    imageUrl: string;
    caption: string;
    captionHindi: string;
    captionKannada?: string;
    hotspots: { label: string; hindiLabel: string; kannadaLabel?: string; description: string; x: number; y: number }[];
  };

  formativeQuiz: FormativeQuizItem[];

  // Agent Meta
  sourcesUsed: { sourceId: string; citation: string; reason: string }[];
  ignoredSources: { sourceId: string; reason: string }[];
  predictedGapsCount: number;
  highRiskStudents: string[];
  approvalState: 'draft' | 'reviewing' | 'approved' | 'delivered';
  isReplanned?: boolean;
  replannedReason?: string;
  lastUpdated: string;
}

export interface AgentDecisionStep {
  id: string;
  timestamp: string;
  agentRole: 'Voice NLU' | 'Source Grounding' | 'Conflict Resolution' | 'Risk Modeler' | 'Curriculum Architect' | 'Approval Supervisor';
  status: 'pending' | 'processing' | 'completed' | 'warning';
  title: string;
  details: string;
  metadata?: Record<string, any>;
}

export interface VoiceCommandIntent {
  rawText: string;
  topic?: string;
  grade?: number;
  subject?: string;
  durationMinutes?: number;
  languages?: string[];
  specialConstraints?: string[];
  isReplanning?: boolean;
  action?: 
    | 'generate_lesson' 
    | 'replan_duration' 
    | 'explain_concept' 
    | 'schedule_class' 
    | 'schedule_intervention' 
    | 'edit_marks' 
    | 'navigate' 
    | 'approve' 
    | 'general_qa' 
    | 'translate';
  actionOutcome?: {
    type: string;
    payload?: any;
    targetTab?: 'lesson' | 'curriculum' | 'calendar' | 'sources' | 'students' | 'graph';
    targetPersona?: 'teacher' | 'student';
    voiceResponse: string;
  };
}

export interface CurriculumTopic {
  id: string;
  module: string;
  title: string;
  titleHindi?: string;
  titleKannada?: string;
  description: string;
  prerequisites: string[];
  isUnlocked: boolean;
  masteryScore: number; // 0 - 100
  diagramNotes?: { title: string; note: string; imageUrl?: string }[];
  videoLinks?: { title: string; url: string; duration?: string }[];
  lessonPlanId?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  topicId: string;
  module: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:00 AM - 10:45 AM"
  type: 'lesson' | 'intervention' | 'assessment' | 'review' | 'holiday' | 'lab' | 'sst';
  status: 'scheduled' | 'in_progress' | 'completed';
  subjectCode?: string;
  category?: 'lecture' | 'lab' | 'sst' | 'holiday' | 'exam' | 'review';
  classroom?: string;
  facultyName?: string;
  assignedStudents?: string[];
  objectives: string[];
  prerequisites: string[];
  prerequisiteCompleted?: boolean;
  resources: { title: string; type: 'diagram' | 'video' | 'notes'; url: string; notes?: string }[];
  replanNotes?: string;
  sourceDocName?: string;
}

export interface StudentIntervention {
  id: string;
  studentId: string;
  studentName: string;
  topic: string;
  concept: string;
  assignedDate: string;
  status: 'assigned' | 'completed' | 'reassessed';
  reviewNotes: string;
  reassessmentScore?: number;
}

export interface StudentAssessmentRecord {
  id: string;
  studentId: string;
  studentName: string;
  topic: string;
  date: string;
  score: number;
  maxScore: number;
  masteryPercentage: number;
  feedback: string;
  mode: 'text' | 'voice' | 'visual' | 'quiz';
}

