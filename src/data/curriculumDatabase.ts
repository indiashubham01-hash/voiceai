// ============================================================================
// MINDMESH-NEXUS: Comprehensive Hierarchical Curriculum Database
// Covers VTU Belagavi (2025 Scheme Active, 2022 NEP, 2021 CBCS),
// Anna University, AKTU, Autonomous Colleges, and NCERT/CBSE STEM.
// ============================================================================

import { LessonPlan, FormativeQuizItem, CurriculumTopic } from '../types';

export interface SyllabusModule {
  moduleNumber: number;
  title: string;
  hours: number;
  description: string;
  topics: string[];
  courseOutcomes: string[];
  bloomsLevel: 'L1: Remember' | 'L2: Understand' | 'L3: Apply' | 'L4: Analyze' | 'L5: Evaluate';
  recommendedTextbook: string;
  importantFormulasOrCode?: string[];
  pyqFrequency?: 'High' | 'Very High' | 'Medium';
}

export interface QuizQuestionItem {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  module: number;
  difficulty: 'easy' | 'medium' | 'hard';
  topicTag: string;
}

export interface ExamPaper {
  title: string;
  year: string;
  scheme: string;
  type: 'Model Question Paper' | 'Semester End Exam (SEE)' | 'Internal Assessment Test (IAT 1)' | 'IAT 2';
  downloadUrl?: string;
  totalMarks: number;
}

export interface CurriculumSubject {
  id: string;
  code: string;
  title: string;
  shortTitle: string;
  credits: number;
  category: 'Core' | 'Integrated Professional Core' | 'Engineering Science' | 'Mathematics Core' | 'Lab Core' | 'K-12 STEM';
  seeMarks: number;
  cieMarks: number;
  totalHours: number;
  overview: string;
  modules: SyllabusModule[];
  lessonPlan: LessonPlan;
  quizQuestions: QuizQuestionItem[];
  examPapers: ExamPaper[];
  textbooks: string[];
  referenceBooks: string[];
  labExperiments?: { id: string; title: string; objective: string; codeSnippet?: string }[];
  aiSystemPromptContext: string;
}

export interface BranchSemester {
  id: string;
  branchCode: string;
  branchName: string;
  semester: number | string;
  label: string;
  iconName: string;
  subjects: CurriculumSubject[];
}

export interface AcademicScheme {
  id: string;
  name: string;
  yearRange: string;
  badge: 'Active' | 'NEP 2020' | 'CBCS' | 'Autonomous';
  isActive: boolean;
  branchSemesters: BranchSemester[];
}

export interface University {
  id: string;
  name: string;
  shortName: string;
  state: string;
  type: 'State Technical University' | 'Autonomous / Deemed' | 'National Board' | 'Central';
  icon: string;
  schemes: AcademicScheme[];
}

// ----------------------------------------------------------------------------
// Helper to Construct Full Compliant LessonPlan Objects
// ----------------------------------------------------------------------------
function makeLessonPlan(params: {
  id: string;
  topic: string;
  topicHindi: string;
  topicKannada: string;
  grade: number;
  subject: string;
  durationMinutes: number;
  beginnerSummary: string;
  beginnerAnalogy: string;
  objectives: string[];
  sections: { title: string; durationMinutes: number; content: string }[];
  advancedInquiry: string;
  quiz: any[];
  citation: string;
}): LessonPlan {
  return {
    id: params.id,
    topic: params.topic,
    topicHindi: params.topicHindi,
    topicKannada: params.topicKannada,
    grade: params.grade,
    subject: params.subject,
    totalDurationMinutes: params.durationMinutes,
    languages: ['English', 'Hindi', 'Kannada'],
    predictedGapsCount: 2,
    highRiskStudents: ['Rahul Sharma', 'Prajwal Gowda'],
    approvalState: 'approved',
    lastUpdated: 'Just now (VTU Ground Truth Verified)',
    sourcesUsed: [
      {
        sourceId: `src-${params.id}`,
        citation: params.citation,
        reason: 'Verified University syllabus curriculum ground truth'
      }
    ],
    ignoredSources: [],
    beginnerExplanation: {
      summary: params.beginnerSummary,
      summaryHindi: params.beginnerSummary,
      summaryKannada: params.beginnerSummary,
      keyAnalogy: params.beginnerAnalogy,
      keyAnalogyHindi: params.beginnerAnalogy,
      keyAnalogyKannada: params.beginnerAnalogy,
      visualCues: ['Step-by-step token state trace', 'Dynamic memory and pointer layout visualizer'],
      vocabularyGlossary: [
        { term: params.topic.split(':')[0] || 'Core Concept', hindiTerm: 'मूल अवधारणा', definition: params.beginnerSummary }
      ],
      targetStudents: ['Rahul Sharma', 'Prajwal Gowda']
    },
    standardLesson: {
      objectives: params.objectives,
      objectivesHindi: params.objectives,
      objectivesKannada: params.objectives,
      sections: params.sections.map((s, idx) => ({
        id: `sec-${params.id}-${idx}`,
        timeAllocationMinutes: s.durationMinutes,
        title: s.title,
        titleHindi: s.title,
        titleKannada: s.title,
        icon: 'Layers',
        teacherTalkingPoints: [s.content],
        teacherTalkingPointsHindi: [s.content],
        teacherTalkingPointsKannada: [s.content],
        studentActivities: ['Interactive Classroom and Whiteboard Drill'],
        groundedInCitation: params.citation
      }))
    },
    advancedActivity: {
      title: `${params.topic} - Deep Engineering Challenge`,
      titleHindi: params.topic,
      inquiryChallenge: params.advancedInquiry,
      inquiryChallengeHindi: params.advancedInquiry,
      deepQuestions: ['What are the asymptotic space-time tradeoffs under worst-case hardware memory limits?'],
      extensionMaterials: ['VTU Model Question Paper 2025/2026', 'Reference Research Papers'],
      targetStudents: ['Deepa Nair', 'Aditi Rao']
    },
    visualDiagram: {
      title: `${params.topic} System Architecture`,
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
      caption: `Visual schematic and memory organization for ${params.topic}`,
      captionHindi: `विजुअल आरेख: ${params.topic}`,
      hotspots: [
        { label: 'Control Unit / Core Logic', hindiLabel: 'नियंत्रण इकाई', description: 'Coordinates dataflow', x: 25, y: 35 },
        { label: 'Memory / Cache Hierarchy', hindiLabel: 'मेमोरी स्तर', description: 'High speed buffer', x: 70, y: 65 }
      ]
    },
    formativeQuiz: params.quiz.map((q, qidx) => ({
      id: `q-${params.id}-${qidx}`,
      question: q.question,
      questionHindi: q.questionHindi || q.question,
      questionKannada: q.questionKannada || q.question,
      options: q.options,
      optionsHindi: q.optionsHindi || q.options,
      optionsKannada: q.optionsKannada || q.options,
      correctAnswerIndex: q.correctAnswerIndex ?? 0,
      explanation: q.explanation || '',
      explanationHindi: q.explanationHindi || q.explanation || '',
      explanationKannada: q.explanationKannada || q.explanation || '',
      targetedConcept: q.targetedConcept || q.targetConcept || params.topic,
      difficulty: q.difficulty || 'Medium'
    }))
  };
}

// ----------------------------------------------------------------------------
// SUBJECT 1: VTU 1BCS305 - Data Structures and Applications (2025 Scheme)
// ----------------------------------------------------------------------------
const SUBJECT_1BCS305: CurriculumSubject = {
  id: '1bcs305',
  code: '1BCS305',
  title: 'Data Structures and Applications',
  shortTitle: '1BCS305 - Data Structures and...',
  credits: 4,
  category: 'Integrated Professional Core',
  seeMarks: 50,
  cieMarks: 50,
  totalHours: 40,
  overview: 'Comprehensive exploration of linear and non-linear data structures including Stacks, Queues, Linked Lists, Binary Trees, AVL Trees, Heaps, Graphs, Hashing, and File Organizations with C/C++ memory management.',
  textbooks: [
    'Ellis Horowitz, Sartaj Sahni and Susan Anderson-Freed, Fundamentals of Data Structures in C, 2nd Ed, Universities Press, 2024',
    'Seymour Lipschutz, Data Structures with C, Schaum’s Outlines, McGraw Hill, 2025'
  ],
  referenceBooks: [
    'Reema Thareja, Data Structures using C, Oxford University Press, 2023',
    'Mark Allen Weiss, Data Structures and Algorithm Analysis in C, Pearson Education'
  ],
  modules: [
    {
      moduleNumber: 1,
      title: 'Introduction to Data Structures, Arrays, Stacks & Infix-to-Postfix',
      hours: 8,
      description: 'Pointers, Dynamic Memory Allocation (malloc/calloc/free), Stack ADT, Stack implementation using static arrays, Applications of Stacks: Infix to Postfix conversion and Postfix expression evaluation.',
      topics: [
        'Dynamic Memory Allocation & Pointer arithmetic',
        'Stack ADT and Overflow/Underflow conditions',
        'Infix to Postfix Conversion algorithm with precedence tables',
        'Postfix Evaluation using Stack operands',
        'Recursion: Tower of Hanoi, Factorial, Fibonacci mechanisms'
      ],
      courseOutcomes: ['CO1: Understand basic linear data structures and dynamic memory operations.', 'CO2: Implement Stack ADT for arithmetic parsing.'],
      bloomsLevel: 'L3: Apply',
      recommendedTextbook: 'Horowitz & Sahni, Chapter 3',
      pyqFrequency: 'Very High',
      importantFormulasOrCode: ['top = -1; push(x): stack[++top] = x;', 'pop(): return stack[top--];']
    },
    {
      moduleNumber: 2,
      title: 'Queues: Linear, Circular, Priority Queues & Double-Ended Queues',
      hours: 8,
      description: 'Queue ADT, Array representation of Queues, Circular Queue implementation to overcome linear queue memory wastage, Double Ended Queue (DEQue), Priority Queues and Multiple Queues.',
      topics: [
        'Queue ADT: enqueue() and dequeue() algorithms',
        'Circular Queue: (rear + 1) % MAX formula and boundary conditions',
        'DEQue: Input-restricted and Output-restricted variations',
        'Priority Queues using arrays and heap introduction',
        'Real-world OS scheduling applications'
      ],
      courseOutcomes: ['CO2: Design and implement FIFO Queue variants for buffering and scheduling.'],
      bloomsLevel: 'L3: Apply',
      recommendedTextbook: 'Lipschutz, Chapter 6',
      pyqFrequency: 'High',
      importantFormulasOrCode: ['rear = (rear + 1) % MAX;', 'front = (front + 1) % MAX;']
    },
    {
      moduleNumber: 3,
      title: 'Linked Lists: Singly, Doubly, Circular & Header Linked Lists',
      hours: 8,
      description: 'Node structures, Dynamic memory nodes, Singly Linked List operations (insertion at front, end, any position, deletion, reversal), Circular Linked Lists, Doubly Linked Lists, Polynomial Addition using Linked Lists.',
      topics: [
        'Singly Linked List: Insertion, Deletion, Search, and Reversal',
        'Circular Linked Lists and Josephus problem simulation',
        'Doubly Linked Lists with prev and next pointers',
        'Header nodes and Circular Header Lists',
        'Polynomial Representation & Addition using Linked Lists'
      ],
      courseOutcomes: ['CO3: Apply dynamic node pointers to manage irregular and non-contiguous memory.'],
      bloomsLevel: 'L3: Apply',
      recommendedTextbook: 'Horowitz & Sahni, Chapter 4',
      pyqFrequency: 'Very High',
      importantFormulasOrCode: ['struct Node { int data; struct Node* next; };', 'temp->next = head; head = temp;']
    },
    {
      moduleNumber: 4,
      title: 'Trees, Binary Search Trees (BST), AVL Trees & Heaps',
      hours: 8,
      description: 'Binary Trees, Array and Linked representation of Binary Trees, Tree Traversals (Inorder, Preorder, Postorder, Level-order), Binary Search Trees (BST) search/insert/delete, Threaded Binary Trees, Introduction to AVL Trees and Balance Factors.',
      topics: [
        'Binary Tree properties and recursive traversals',
        'Binary Search Tree (BST): Insert, Delete (3 cases), and Search algorithms',
        'Threaded Binary Trees (Inorder threading)',
        'AVL Trees: LL, RR, LR, RL Rotations and Height-balancing',
        'Max Heap and Min Heap construction & HeapSort'
      ],
      courseOutcomes: ['CO4: Construct hierarchical tree structures for rapid search and sorting.'],
      bloomsLevel: 'L4: Analyze',
      recommendedTextbook: 'Horowitz & Sahni, Chapter 5',
      pyqFrequency: 'Very High',
      importantFormulasOrCode: ['Balance Factor = Height(LeftSubtree) - Height(RightSubtree)', 'Rotations: LL, RR, LR, RL']
    },
    {
      moduleNumber: 5,
      title: 'Graphs, Traversal Algorithms (DFS/BFS), Hashing & File Organizations',
      hours: 8,
      description: 'Graph representations (Adjacency Matrix, Adjacency List), Graph Traversals: Depth First Search (DFS) and Breadth First Search (BFS), Minimum Spanning Tree concepts, Hashing functions, Collision resolution (Open addressing, Chaining), File Organizations.',
      topics: [
        'Graph ADT: Adjacency Matrix vs Adjacency List tradeoffs',
        'Breadth First Search (BFS) using Queue',
        'Depth First Search (DFS) using Stack / Recursion',
        'Hash functions: Division, Mid-Square, Folding methods',
        'Collision Resolution: Linear Probing, Quadratic Probing, Separate Chaining'
      ],
      courseOutcomes: ['CO5: Analyze network topologies with graphs and design high-speed O(1) hash tables.'],
      bloomsLevel: 'L4: Analyze',
      recommendedTextbook: 'Horowitz & Sahni, Chapter 6 & 8',
      pyqFrequency: 'High',
      importantFormulasOrCode: ['hash(k) = k % TableSize', 'Linear probing: (hash(k) + i) % TableSize']
    }
  ],
  lessonPlan: makeLessonPlan({
    id: 'lesson-1bcs305-stack',
    topic: 'Infix to Postfix Conversion & Stack Arithmetic in 1BCS305',
    topicHindi: 'स्टैक का उपयोग करके इनफिक्स से पोस्टफिक्स रूपांतरण',
    topicKannada: 'ಸ್ಟ್ಯಾಕ್ ಬಳಸಿ ಇನ್‌ಫಿಕ್ಸ್‌ನಿಂದ ಪೋಸ್ಟ್‌ಫಿಕ್ಸ್ ಪರಿವರ್ತನೆ',
    grade: 3,
    subject: '1BCS305 - Data Structures & Applications',
    durationMinutes: 45,
    beginnerSummary: 'A Stack is a Last-In, First-Out (LIFO) tray where operators wait until their operands arrive, allowing computers to evaluate complex math without parentheses confusion.',
    beginnerAnalogy: 'Think of a Stack like a spring-loaded plate dispenser in a cafeteria: the last plate put on top is the first plate taken out!',
    objectives: [
      'Master the step-by-step Shunting-Yard Stack algorithm for operator precedence.',
      'Convert complex algebraic expressions to reverse polish notation (RPN).',
      'Trace stack states during runtime expression evaluation.'
    ],
    sections: [
      { title: 'Why Postfix Notation is needed in Compilers', durationMinutes: 10, content: 'Compilers cannot directly evaluate 3 + 4 * 2 because multiplication precedes addition. Postfix eliminates parentheses and precedence ambiguity.' },
      { title: 'Shunting-Yard Stack Algorithm & Precedence Table', durationMinutes: 20, content: 'Operands go straight to output. Operators are pushed onto stack. If incoming operator has lower or equal precedence, pop stack first.' },
      { title: 'Hands-on Trace Problem: (A + B) * C / D', durationMinutes: 15, content: 'Step-by-step execution on whiteboard tracing Top of Stack, Output String, and remaining token stream.' }
    ],
    advancedInquiry: 'How would you extend the Shunting-Yard algorithm to support right-associative exponentiation (^) and unary minus operators with minimal stack overhead?',
    citation: 'VTU Belagavi 2025 Scheme 1BCS305 Module 1: Horowitz & Sahni Chapter 3',
    quiz: [
      {
        question: 'In a stack-based Infix to Postfix conversion of expression A + B * C, what is the final postfix string?',
        questionHindi: 'A + B * C का पोस्टफिक्स रूपांतरण क्या होगा?',
        options: ['A B C * +', 'A B + C *', '+ A * B C', 'A B C + *'],
        optionsHindi: ['A B C * +', 'A B + C *', '+ A * B C', 'A B C + *'],
        correctAnswerIndex: 0,
        explanation: 'Multiplication (*) has higher precedence than addition (+). B and C are multiplied first, then added to A. Hence A B C * +.',
        explanationHindi: 'गुणा (*) का जोड़ (+) से अधिक वरीयता क्रम है, इसलिए B और C पहले गुणा होंगे फिर A से जुड़ेंगे।',
        bloomLevel: 'Apply',
        targetConcept: 'Stack Expression Conversion',
        misconceptionDistractors: ['Forgetting operator precedence order', 'Placing operator before operands']
      }
    ]
  }),
  quizQuestions: [
    {
      id: 'q-ds-1',
      question: 'In a stack-based Infix to Postfix conversion of expression `A + B * C`, what is the final postfix string?',
      options: ['A B C * +', 'A B + C *', '+ A * B C', 'A B C + *'],
      correctAnswerIndex: 0,
      explanation: 'Multiplication (*) has higher precedence than addition (+). B and C are multiplied first, then added to A. Hence `A B C * +`.',
      module: 1,
      difficulty: 'easy',
      topicTag: 'Stacks & Expression Conversion'
    },
    {
      id: 'q-ds-2',
      question: 'In a Circular Queue of size N implemented with front and rear pointers, what is the exact condition for Queue Full?',
      options: ['(rear + 1) % N == front', 'rear == front', 'rear == N - 1', '(front + 1) % N == rear'],
      correctAnswerIndex: 0,
      explanation: 'In a circular queue, full condition occurs when incrementing rear wraps around and hits front: (rear + 1) % N == front.',
      module: 2,
      difficulty: 'medium',
      topicTag: 'Circular Queues'
    },
    {
      id: 'q-ds-3',
      question: 'Which of the following tree traversals of a Binary Search Tree (BST) always produces keys in sorted ascending order?',
      options: ['Inorder Traversal', 'Preorder Traversal', 'Postorder Traversal', 'Level-order Traversal'],
      correctAnswerIndex: 0,
      explanation: 'Inorder traversal visits Left Subtree -> Root -> Right Subtree. Since BST property holds (Left < Root < Right), inorder traversal strictly produces sorted keys.',
      module: 4,
      difficulty: 'easy',
      topicTag: 'Binary Search Trees'
    }
  ],
  examPapers: [
    {
      title: 'VTU 2025 Scheme 1BCS305 Model Question Paper 1 (With Solutions)',
      year: '2025-2026',
      scheme: '2025 Scheme (Active)',
      type: 'Model Question Paper',
      totalMarks: 100
    },
    {
      title: 'VTU 2022 NEP Scheme 21CS32 SEE Question Paper Dec/Jan 2024',
      year: '2024',
      scheme: '2022 NEP Scheme',
      type: 'Semester End Exam (SEE)',
      totalMarks: 100
    }
  ],
  labExperiments: [
    {
      id: 'lab-ds-1',
      title: 'Program 1: Array Stack & Infix to Postfix Engine in C',
      objective: 'Design, develop and execute a program in C to convert a given valid parenthesized infix arithmetic expression to postfix and evaluate it.'
    },
    {
      id: 'lab-ds-2',
      title: 'Program 2: Circular Queue for Operating System Job Scheduling',
      objective: 'Implement circular queue operations to insert, delete and display elements simulating OS message buffering.'
    }
  ],
  aiSystemPromptContext: 'You are the MINDMESH-NEXUS AI Engineering Professor for VTU 1BCS305 (Data Structures & Applications). Answer student and teacher questions with accurate C/C++ memory explanations, big-O time/space complexities, VTU exam marking rubrics, and step-by-step algorithms.'
};

// ----------------------------------------------------------------------------
// SUBJECT 2: VTU 21CS33 - Analog and Digital Electronics (CSE Sem 3)
// ----------------------------------------------------------------------------
const SUBJECT_21CS33: CurriculumSubject = {
  id: '21cs33',
  code: '21CS33',
  title: 'Analog and Digital Electronics',
  shortTitle: '21CS33 - Analog & Digital Elec...',
  credits: 4,
  category: 'Engineering Science',
  seeMarks: 50,
  cieMarks: 50,
  totalHours: 40,
  overview: 'Operational Amplifiers, Combinational Logic Simplification with Karnaugh Maps, Multiplexers, Decoders, Sequential Circuits, Flip-Flops, Counters, Registers, and D/A & A/D Converters.',
  textbooks: [
    'Charles H. Roth Jr., Larry L. Kinney, Fundamentals of Logic Design, Cengage Learning, 7th Edition',
    'Anil K. Maini, Digital Electronics: Principles, Devices and Applications, John Wiley & Sons'
  ],
  referenceBooks: [
    'M. Morris Mano, Michael D. Ciletti, Digital Design, Pearson, 6th Edition',
    'Ramakant A. Gayakwad, Op-Amps and Linear Integrated Circuits, PHI'
  ],
  modules: [
    {
      moduleNumber: 1,
      title: 'Operational Amplifiers and Analog Applications',
      hours: 8,
      description: 'Op-Amp characteristics, Inverting and Non-inverting amplifiers, Summing amplifier, Voltage Follower, Differentiator, Integrator, Active Filters.',
      topics: ['Ideal Op-Amp properties (Infinite Ri, Zero Ro, Infinite Gain)', 'Inverting & Non-inverting gain formulas', 'Summing and Difference amplifiers', 'Integrator and Differentiator circuits'],
      courseOutcomes: ['CO1: Analyze analog signal conditioning with operational amplifiers.'],
      bloomsLevel: 'L3: Apply',
      recommendedTextbook: 'Gayakwad, Chapter 3-4'
    },
    {
      moduleNumber: 2,
      title: 'Combinational Logic Simplification & Karnaugh Maps',
      hours: 8,
      description: 'K-Map simplification up to 5 variables, POS and SOP minimal forms, Don’t care conditions, Quine-McCluskey (Tabular) minimization.',
      topics: ['SOP & POS canonical expressions', '4-variable and 5-variable K-maps with groupings', 'Don’t care condition optimization', 'Quine-McCluskey prime implicant table'],
      courseOutcomes: ['CO2: Minimize Boolean switching equations for optimal gate counts.'],
      bloomsLevel: 'L3: Apply',
      recommendedTextbook: 'Roth & Kinney, Chapter 4-5'
    }
  ],
  lessonPlan: makeLessonPlan({
    id: 'lesson-21cs33-kmap',
    topic: '4-Variable Karnaugh Map Optimization & Don’t Care Conditions in 21CS33',
    topicHindi: '4-वेरिएबल के-मैप सरलीकरण और डोंट केयर स्थितियां',
    topicKannada: '4-ವೇರಿಯಬಲ್ ಕೆ-ಮ್ಯಾಪ್ ಸರಳೀಕರಣ',
    grade: 3,
    subject: '21CS33 - Analog and Digital Electronics',
    durationMinutes: 45,
    beginnerSummary: 'A Karnaugh Map (K-Map) is a graphical grid using Gray code where adjacent 1s form groups of 2, 4, 8, or 16 to instantly eliminate redundant logic gates.',
    beginnerAnalogy: 'Think of K-Maps like grouping nearby houses on a grid map into large neighborhoods to deliver packages with the fewest possible delivery trucks!',
    objectives: [
      'Plot Boolean minterms and maxterms in a 4-variable Gray-coded grid.',
      'Form octets, quads, and pairs while utilizing Don’t Care conditions (X).',
      'Derive minimal Sum of Products (SOP) expression.'
    ],
    sections: [
      { title: 'Gray Code Grid Layout (00, 01, 11, 10)', durationMinutes: 10, content: 'Why Gray code changes only one bit at a time: Crucial for adjacent Boolean grouping.' },
      { title: 'Grouping Rules for Quads & Octets with Don’t Cares', durationMinutes: 20, content: 'Wrap-around corner grouping and selective inclusion of don’t care terms (X).' }
    ],
    advancedInquiry: 'How do you detect and eliminate static-1 hazards in SOP logic circuits by introducing redundant prime implicants?',
    citation: 'VTU 2022/2025 Scheme Module 2: Roth & Kinney Chapter 5',
    quiz: [
      {
        question: 'What is the voltage gain formula for an ideal Inverting Operational Amplifier with input resistor R1 and feedback resistor Rf?',
        questionHindi: 'इनवर्टिंग ऑप-एम्प का वोल्टेज गेन फॉर्मूला क्या है?',
        options: ['Av = - (Rf / R1)', 'Av = 1 + (Rf / R1)', 'Av = R1 / Rf', 'Av = - (R1 / Rf)'],
        optionsHindi: ['Av = - (Rf / R1)', 'Av = 1 + (Rf / R1)', 'Av = R1 / Rf', 'Av = - (R1 / Rf)'],
        correctAnswerIndex: 0,
        explanation: 'For an inverting op-amp with virtual ground at the inverting terminal, Av = Vout / Vin = - (Rf / R1).',
        explanationHindi: 'इनवर्टिंग टर्मिनल पर वर्चुअल ग्राउंड के कारण Av = - (Rf / R1) होता है।',
        bloomLevel: 'Apply',
        targetConcept: 'Inverting Op-Amp Gain',
        misconceptionDistractors: ['Confusing non-inverting gain formula 1 + Rf/R1', 'Omitting the negative inversion sign']
      }
    ]
  }),
  quizQuestions: [
    {
      id: 'q-ade-1',
      question: 'What is the voltage gain formula for an ideal Inverting Operational Amplifier with input resistor R1 and feedback resistor Rf?',
      options: ['Av = - (Rf / R1)', 'Av = 1 + (Rf / R1)', 'Av = R1 / Rf', 'Av = - (R1 / Rf)'],
      correctAnswerIndex: 0,
      explanation: 'For an inverting op-amp with virtual ground at the inverting terminal, Av = Vout / Vin = - (Rf / R1).',
      module: 1,
      difficulty: 'easy',
      topicTag: 'Operational Amplifiers'
    }
  ],
  examPapers: [
    {
      title: 'VTU 21CS33 ADE Question Paper Jan/Feb 2024 with Solutions',
      year: '2024',
      scheme: '2022 NEP Scheme',
      type: 'Semester End Exam (SEE)',
      totalMarks: 100
    }
  ],
  aiSystemPromptContext: 'You are the MINDMESH-NEXUS AI Engineering Professor for VTU 21CS33 (Analog and Digital Electronics). Provide circuit diagrams, truth tables, K-map reduction steps, and excitation tables.'
};

// ----------------------------------------------------------------------------
// SUBJECT 3: VTU 21CS34 - Computer Organization and Architecture (COA)
// ----------------------------------------------------------------------------
const SUBJECT_21CS34: CurriculumSubject = {
  id: '21cs34',
  code: '21CS34',
  title: 'Computer Organization and Architecture',
  shortTitle: '21CS34 - Computer Organization &...',
  credits: 4,
  category: 'Core',
  seeMarks: 50,
  cieMarks: 50,
  totalHours: 40,
  overview: 'Basic structure of computers, Machine instructions, Addressing modes, Arithmetic operations (ALU, Booth’s algorithm, IEEE 754), Memory systems (Cache, Virtual Memory), I/O organization, and Pipelining.',
  textbooks: [
    'Carl Hamacher, Zvonko Vranesic, Safwat Zaky, Computer Organization, 5th Edition, McGraw Hill',
    'David A. Patterson, John L. Hennessy, Computer Organization and Design: RISC-V Edition'
  ],
  referenceBooks: ['William Stallings, Computer Organization and Architecture, 10th Edition'],
  modules: [
    {
      moduleNumber: 1,
      title: 'Basic Structure of Computers & Machine Instructions',
      hours: 8,
      description: 'Functional units, Basic operational concepts, Bus structures, Performance metrics, Addressing modes.',
      topics: ['ALU, Control Unit, Registers, Memory bus', 'Addressing modes: Immediate, Direct, Indirect, Indexed'],
      courseOutcomes: ['CO1: Understand computer functional blocks.'],
      bloomsLevel: 'L2: Understand',
      recommendedTextbook: 'Hamacher, Chapter 1-2'
    }
  ],
  lessonPlan: makeLessonPlan({
    id: 'lesson-21cs34-booth',
    topic: 'Booth’s Signed Multiplication Algorithm & Register Tracing in 21CS34',
    topicHindi: 'बूथ का हस्ताक्षरित गुणन एल्गोरिदम',
    topicKannada: 'ಬೂತ್‌ನ ಗುಣಾಕಾರ ಕ್ರಮಾವಳಿ',
    grade: 3,
    subject: '21CS34 - Computer Organization & Architecture',
    durationMinutes: 45,
    beginnerSummary: 'Booth’s algorithm multiplies positive and negative signed binary numbers in 2’s complement without converting them into positive magnitudes first.',
    beginnerAnalogy: 'Instead of adding 99 nine times (+99 = +100 - 1), Booth’s looks at blocks of 1s and replaces multiple additions with one subtraction and one addition!',
    objectives: [
      'Understand how Booth’s algorithm handles signed negative multiplicands without sign extension.',
      'Construct the Multiplicand (M), Accumulator (A), Multiplier (Q), and Q_-1 register trace table.',
      'Execute arithmetic right shift (ARS) maintaining the sign bit.'
    ],
    sections: [
      { title: 'Rules of Booth’s Algorithm (10, 01, 00, 11 transitions)', durationMinutes: 15, content: 'Transition 10 -> A = A - M, Transition 01 -> A = A + M, 00/11 -> Shift only.' },
      { title: 'Step-by-step Multiplication Problem: (-5) * (+3)', durationMinutes: 20, content: 'Trace through each clock cycle and verify final 8-bit binary result.' }
    ],
    advancedInquiry: 'How does bit-pair recoding double the hardware multiplication throughput by processing 2 bits per clock cycle?',
    citation: 'VTU 2022/2025 Scheme Module 2: Hamacher Chapter 6',
    quiz: [
      {
        question: 'In Booth’s Multiplication Algorithm, what operation is performed when (Q0, Q_-1) are `1 0`?',
        questionHindi: 'बूथ एल्गोरिदम में যখন (Q0, Q_-1) `1 0` होते हैं तो क्या ऑपरेशन होता है?',
        options: ['Subtract Multiplicand from Accumulator (A = A - M), then Arithmetic Shift Right', 'Add Multiplicand (A = A + M)', 'Shift only', 'Reset Accumulator'],
        optionsHindi: ['A = A - M फिर Arithmetic Shift Right', 'A = A + M', 'केवल Shift', 'Reset'],
        correctAnswerIndex: 0,
        explanation: 'Transition 1 0 signals the start of a block of 1s, triggering subtraction (A = A - M) followed by arithmetic right shift.',
        explanationHindi: '1 0 ट्रांज़िशन घटाव (A = A - M) और शिफ्ट को ट्रिगर करता है।',
        bloomLevel: 'Apply',
        targetConcept: 'Booth Algorithm Rules',
        misconceptionDistractors: ['Adding instead of subtracting', 'Using logical shift instead of arithmetic shift']
      }
    ]
  }),
  quizQuestions: [
    {
      id: 'q-coa-1',
      question: 'In Booth’s Multiplication Algorithm, what operation is performed when (Q0, Q_-1) are `1 0`?',
      options: ['Subtract Multiplicand from Accumulator (A = A - M), then Arithmetic Shift Right', 'Add Multiplicand (A = A + M)', 'Shift only', 'Reset Accumulator'],
      correctAnswerIndex: 0,
      explanation: 'Transition 1 0 signals subtraction of M from A followed by arithmetic right shift.',
      module: 2,
      difficulty: 'medium',
      topicTag: 'Arithmetic & Booth’s Algorithm'
    }
  ],
  examPapers: [
    {
      title: 'VTU 21CS34 COA SEE Question Paper July 2024',
      year: '2024',
      scheme: '2022 NEP Scheme',
      type: 'Semester End Exam (SEE)',
      totalMarks: 100
    }
  ],
  aiSystemPromptContext: 'You are the MINDMESH-NEXUS AI Engineering Professor for VTU 21CS34 (Computer Organization & Architecture).'
};

// ----------------------------------------------------------------------------
// SUBJECT 4: VTU 21CS42 - Design and Analysis of Algorithms (CSE Sem 4)
// ----------------------------------------------------------------------------
const SUBJECT_21CS42: CurriculumSubject = {
  id: '21cs42',
  code: '21CS42',
  title: 'Design and Analysis of Algorithms',
  shortTitle: '21CS42 - Design & Analysis of A...',
  credits: 4,
  category: 'Integrated Professional Core',
  seeMarks: 50,
  cieMarks: 50,
  totalHours: 40,
  overview: 'Asymptotic Notations, Master Theorem, Divide & Conquer, Greedy Technique (Prim, Kruskal, Dijkstra), Dynamic Programming (0/1 Knapsack, Warshall-Floyd), Backtracking, and NP-Completeness.',
  textbooks: [
    'Anany Levitin, Introduction to the Design and Analysis of Algorithms, 3rd Edition, Pearson',
    'Thomas H. Cormen et al., Introduction to Algorithms (CLRS), 3rd Edition, MIT Press'
  ],
  referenceBooks: ['Ellis Horowitz et al., Fundamentals of Computer Algorithms'],
  modules: [
    {
      moduleNumber: 1,
      title: 'Introduction, Asymptotic Notations & Divide-and-Conquer',
      hours: 8,
      description: 'Notion of Algorithm, Asymptotic Notations (O, Ω, Θ), Master Theorem, MergeSort, QuickSort.',
      topics: ['Big-O, Big-Omega, Big-Theta definitions', 'Master Theorem Cases 1, 2, 3'],
      courseOutcomes: ['CO1: Analyze time and space complexity of algorithms.'],
      bloomsLevel: 'L4: Analyze',
      recommendedTextbook: 'Levitin, Chapter 1-5'
    }
  ],
  lessonPlan: makeLessonPlan({
    id: 'lesson-21cs42-knapsack',
    topic: '0/1 Knapsack Problem using Dynamic Programming Table in 21CS42',
    topicHindi: 'डायनेमिक प्रोग्रामिंग द्वारा 0/1 नैपसैक समस्या',
    topicKannada: 'ಡೈನಾಮಿಕ್ ಪ್ರೋಗ್ರಾಮಿಂಗ್ ನ್ಯಾಪ್‌ಸ್ಯಾಕ್ ಸಮಸ್ಯೆ',
    grade: 4,
    subject: '21CS42 - Design & Analysis of Algorithms',
    durationMinutes: 45,
    beginnerSummary: 'Dynamic Programming solves 0/1 Knapsack by storing the solutions to smaller weight subproblems in a 2D memory table, so we never recalculate the same subset twice.',
    beginnerAnalogy: 'Like packing a suitcase with a weight limit: you check your cheat-sheet table to pick the exact items that give the highest value without exceeding the bag weight limit!',
    objectives: [
      'Differentiate greedy fractional knapsack from DP 0/1 knapsack.',
      'Construct the (n+1) x (W+1) dynamic programming recurrence table.',
      'Backtrack through table entries to identify the selected items.'
    ],
    sections: [
      { title: 'The DP Recurrence Relation: V[i,w] = max(V[i-1,w], v_i + V[i-1,w-w_i])', durationMinutes: 15, content: 'Derivation and boundary condition setting.' },
      { title: 'Step-by-step Table Filling & Item Backtracking', durationMinutes: 20, content: 'Complete numerical example tracing 4 items and capacity W=5.' }
    ],
    advancedInquiry: 'How can we reduce the space complexity of 0/1 Knapsack from O(n*W) down to 1D array O(W)?',
    citation: 'VTU 2022/2025 Scheme Module 3: Levitin Chapter 8',
    quiz: [
      {
        question: 'What is the time complexity of Dijkstra’s Algorithm when implemented with a Min-Heap (Priority Queue)?',
        questionHindi: 'मिन-हीप के साथ डिक्सट्रा एल्गोरिदम की समय जटिलता क्या है?',
        options: ['O((V + E) log V)', 'O(V^2)', 'O(E * V)', 'O(V log E)'],
        optionsHindi: ['O((V + E) log V)', 'O(V^2)', 'O(E * V)', 'O(V log E)'],
        correctAnswerIndex: 0,
        explanation: 'With a min-heap, vertex extractions take O(V log V) and edge relaxations take O(E log V), giving total time O((V + E) log V).',
        explanationHindi: 'मिन-हीप के साथ कुल समय O((V + E) log V) होता है।',
        bloomLevel: 'Analyze',
        targetConcept: 'Dijkstra Complexity',
        misconceptionDistractors: ['Confusing adjacency matrix O(V^2) with min-heap complexity']
      }
    ]
  }),
  quizQuestions: [
    {
      id: 'q-daa-1',
      question: 'What is the exact time complexity of Dijkstra’s Algorithm when implemented with a Min-Heap?',
      options: ['O((V + E) log V)', 'O(V^2)', 'O(E * V)', 'O(V log E)'],
      correctAnswerIndex: 0,
      explanation: 'With a min-heap, total time is O((V + E) log V).',
      module: 2,
      difficulty: 'medium',
      topicTag: 'Dijkstra Shortest Path'
    }
  ],
  examPapers: [
    {
      title: 'VTU 21CS42 DAA SEE Exam Paper Jan 2025',
      year: '2025',
      scheme: '2022 NEP Scheme',
      type: 'Semester End Exam (SEE)',
      totalMarks: 100
    }
  ],
  aiSystemPromptContext: 'You are the MINDMESH-NEXUS AI Algorithms Professor for VTU 21CS42.'
};

// ----------------------------------------------------------------------------
// SUBJECT 5: K-12 STEM - Grade 7 Science (NCERT Ground Truth)
// ----------------------------------------------------------------------------
const SUBJECT_G7_SCIENCE: CurriculumSubject = {
  id: 'sci-g7-ch1',
  code: 'SCI-G7-CH1',
  title: 'Nutrition in Plants & Photosynthesis',
  shortTitle: 'SCI-G7 - Nutrition in Plants (P...',
  credits: 3,
  category: 'K-12 STEM',
  seeMarks: 80,
  cieMarks: 20,
  totalHours: 35,
  overview: 'Autotrophic and Heterotrophic nutrition in plants, Mechanism of Photosynthesis (Chlorophyll, Stomata, Carbon dioxide, Sunlight, Water), Guard cells, Starch Iodine test, and Saprotrophic Fungi.',
  textbooks: ['NCERT Grade 7 Science Textbook, 2026 Edition'],
  referenceBooks: ['Exemplar Science Grade 7, NCERT'],
  modules: [
    {
      moduleNumber: 1,
      title: 'Autotrophic Nutrition & The Photosynthesis Equation',
      hours: 7,
      description: 'Raw materials of photosynthesis, Role of stomata and chlorophyll, Word and chemical equations: 6CO2 + 6H2O -> C6H12O6 + 6O2.',
      topics: ['Autotrophs vs Heterotrophs', 'Stomata & Guard cell swelling/shrinking', 'Chlorophyll solar energy trapping', 'Glucose and Starch storage'],
      courseOutcomes: ['Understand the energy transformation from solar energy to chemical energy.'],
      bloomsLevel: 'L2: Understand',
      recommendedTextbook: 'NCERT Chapter 1'
    }
  ],
  lessonPlan: makeLessonPlan({
    id: 'lesson-photo-40',
    topic: 'Grade 7 Science: Photosynthesis and Guard Cell Dynamics (NCERT 2026)',
    topicHindi: 'कक्षा 7 विज्ञान: प्रकाश संश्लेषण और रक्षक कोशिकाएं',
    topicKannada: '7ನೇ ತರಗತಿ ವಿಜ್ಞಾನ: ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ ಮತ್ತು ಪತ್ರರಂಧ್ರಗಳು',
    grade: 7,
    subject: 'Science / Biology',
    durationMinutes: 40,
    beginnerSummary: 'Plants don’t eat food with a mouth like us—they cook their own food using sunlight, air, and water inside their leaves!',
    beginnerAnalogy: 'The "Kitchen of the Leaf": Leaf = Kitchen, Sunlight = Stove Flame, Water + CO2 = Raw Ingredients, Glucose = Cooked Meal, Oxygen = Fresh Breeze released!',
    objectives: [
      'Identify the four essential requirements for photosynthesis (Sunlight, Chlorophyll, CO2, Water).',
      'Explain how stomata open and close via guard cell turgidity.',
      'Perform the Iodine starch test to verify photosynthetic activity.'
    ],
    sections: [
      { title: 'Raw Materials & Chemical Equation (6CO2 + 6H2O -> C6H12O6 + 6O2)', durationMinutes: 15, content: 'How chlorophyll traps photons and stomata take in CO2.' },
      { title: 'Iodine Starch Test Experimentation', durationMinutes: 15, content: 'Boiling leaf in water bath and testing with iodine drops.' }
    ],
    advancedInquiry: 'Why do variegated leaves (like Coleus or Croton) only test positive for starch in green areas despite the entire leaf being exposed to sunlight?',
    citation: 'NCERT Grade 7 Science Chapter 1 (2026 Edition)',
    quiz: [
      {
        question: 'Which gas is released by green plants during the process of photosynthesis?',
        questionHindi: 'प्रकाश संश्लेषण के दौरान पौधे कौन सी गैस छोड़ते हैं?',
        options: ['Oxygen (O2)', 'Carbon Dioxide (CO2)', 'Nitrogen (N2)', 'Hydrogen (H2)'],
        optionsHindi: ['ऑक्सीजन (O2)', 'कार्बन डाइऑक्साइड (CO2)', 'नाइट्रोजन (N2)', 'हाइड्रोजन (H2)'],
        correctAnswerIndex: 0,
        explanation: 'During photosynthesis, water molecules are split by solar energy, releasing Oxygen (O2) into the atmosphere.',
        explanationHindi: 'प्रकाश संश्लेषण में जल के अणु टूटकर ऑक्सीजन (O2) वायुमंडल में छोड़ते हैं।',
        bloomLevel: 'Remember',
        targetConcept: 'Photosynthesis Gas Exchange',
        misconceptionDistractors: ['Confusing cellular respiration intake with photosynthesis output']
      }
    ]
  }),
  quizQuestions: [
    {
      id: 'q-sci-1',
      question: 'Which gas is released by green plants during the process of photosynthesis?',
      options: ['Oxygen (O2)', 'Carbon Dioxide (CO2)', 'Nitrogen (N2)', 'Hydrogen (H2)'],
      correctAnswerIndex: 0,
      explanation: 'During photosynthesis, water molecules are split by solar energy, releasing Oxygen (O2) into the atmosphere.',
      module: 1,
      difficulty: 'easy',
      topicTag: 'Photosynthesis Basics'
    }
  ],
  examPapers: [
    {
      title: 'CBSE Grade 7 Science Mid-Term Model Question Paper 2026',
      year: '2026',
      scheme: 'NCERT 2026 Ground Truth',
      type: 'Model Question Paper',
      totalMarks: 80
    }
  ],
  aiSystemPromptContext: 'You are the MINDMESH-NEXUS AI STEM Tutor for Grade 7 Science. Explain concepts simply with engaging analogies in English, Hindi, and Kannada.'
};

// ----------------------------------------------------------------------------
// SUBJECT 6: VTU 21DS35 - Foundations of Data Science & Machine Learning (CSE Data Science)
// ----------------------------------------------------------------------------
const SUBJECT_21DS35: CurriculumSubject = {
  id: '21ds35',
  code: '21DS35',
  title: 'Foundations of Data Science & Machine Learning',
  shortTitle: '21DS35 - Foundations of Data Sci...',
  credits: 4,
  category: 'Integrated Professional Core',
  seeMarks: 50,
  cieMarks: 50,
  totalHours: 40,
  overview: 'Foundational concepts of Data Science lifecycle, Statistical Inference, NumPy/Pandas exploratory data analysis, Supervised Learning (Linear/Logistic Regression, Decision Trees), Unsupervised Clustering (K-Means, PCA), and Model Evaluation.',
  textbooks: [
    'Joel Grus, Data Science from Scratch: First Principles with Python, 2nd Edition, O’Reilly',
    'Wes McKinney, Python for Data Analysis: Data Wrangling with pandas, NumPy, and Jupyter, 3rd Edition, O’Reilly'
  ],
  referenceBooks: [
    'Aurélien Géron, Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow, 3rd Edition, O’Reilly',
    'Jake VanderPlas, Python Data Science Handbook, O’Reilly'
  ],
  modules: [
    {
      moduleNumber: 1,
      title: 'Introduction to Data Science Lifecycle & Statistical Foundations',
      hours: 8,
      description: 'Data Science process, Population vs Sample, Measures of Central Tendency and Dispersion, Normal Distribution, Central Limit Theorem, Hypothesis Testing, and p-value interpretations.',
      topics: [
        'Data Science Process & Problem Formulation',
        'Descriptive Statistics: Mean, Median, Mode, Variance, IQR',
        'Probability Distributions: Gaussian, Binomial, Poisson',
        'Central Limit Theorem (CLT) and Confidence Intervals',
        'Hypothesis Testing: Null hypothesis, Type I/II errors, z-test, t-test'
      ],
      courseOutcomes: ['CO1: Apply statistical inference to analyze experimental datasets.'],
      bloomsLevel: 'L3: Apply',
      recommendedTextbook: 'Joel Grus, Chapter 5-7',
      pyqFrequency: 'Very High',
      importantFormulasOrCode: ['z = (x_bar - mu) / (sigma / sqrt(n))', 'IQR = Q3 - Q1']
    },
    {
      moduleNumber: 2,
      title: 'Data Wrangling & Exploratory Data Analysis (EDA) with Python Stack',
      hours: 8,
      description: 'NumPy vectorized array operations, Pandas DataFrames, handling missing values, Outlier detection (Z-score, IQR rule), Feature scaling (StandardScaler, MinMaxScaler), and Matplotlib/Seaborn visualizations.',
      topics: [
        'NumPy N-dimensional array broadcasting and slicing',
        'Pandas DataFrame filtering, groupby, and pivot tables',
        'Handling Missing Data (Imputation: Mean/Median/KNN)',
        'Feature Normalization & Standardization formulas',
        'Exploratory Data Analysis: Correlation heatmaps and pair plots'
      ],
      courseOutcomes: ['CO2: Clean, transform, and visualize multi-dimensional tabular datasets.'],
      bloomsLevel: 'L3: Apply',
      recommendedTextbook: 'Wes McKinney, Chapter 4-9',
      pyqFrequency: 'High',
      importantFormulasOrCode: ['df.fillna(df.median(), inplace=True)', 'X_scaled = (X - X_min) / (X_max - X_min)']
    },
    {
      moduleNumber: 3,
      title: 'Supervised Learning: Linear Regression, Logistic Regression & Decision Trees',
      hours: 8,
      description: 'Simple and Multiple Linear Regression, Ordinary Least Squares (OLS), Gradient Descent optimization, Logistic Regression for binary classification, Sigmoid function, Cost function, Decision Trees (Entropy, Information Gain, Gini Impurity).',
      topics: [
        'Linear Regression: Cost function J(theta) and OLS solution',
        'Batch & Stochastic Gradient Descent convergence',
        'Logistic Regression & Binary Cross-Entropy Loss',
        'Decision Tree Induction: ID3, C4.5, and CART algorithms',
        'Information Gain = Entropy(Parent) - Weighted Average Entropy(Children)'
      ],
      courseOutcomes: ['CO3: Train predictive regression and classification models using Scikit-Learn.'],
      bloomsLevel: 'L4: Analyze',
      recommendedTextbook: 'Aurélien Géron, Chapter 4 & 6',
      pyqFrequency: 'Very High',
      importantFormulasOrCode: ['y_pred = theta_0 + theta_1 * x', 'sigma(z) = 1 / (1 + exp(-z))', 'Gini = 1 - sum(p_i^2)']
    },
    {
      moduleNumber: 4,
      title: 'Unsupervised Learning: K-Means Clustering & Dimensionality Reduction (PCA)',
      hours: 8,
      description: 'Unsupervised learning fundamentals, K-Means clustering algorithm, Elbow method for optimal K, Silhouette coefficient, Principal Component Analysis (PCA), Covariance matrix, Eigenvalues and Eigenvectors.',
      topics: [
        'K-Means Clustering: Centroid initialization and convergence loop',
        'Elbow Method (WCSS: Within-Cluster Sum of Squares)',
        'Curse of Dimensionality in high-dimensional feature spaces',
        'Principal Component Analysis (PCA): Eigen decomposition',
        'Dimensionality reduction for data visualization and denoising'
      ],
      courseOutcomes: ['CO4: Discover hidden clusters and reduce dimensionality with PCA.'],
      bloomsLevel: 'L4: Analyze',
      recommendedTextbook: 'Joel Grus, Chapter 15 & 19',
      pyqFrequency: 'High',
      importantFormulasOrCode: ['WCSS = sum(||x_i - c_k||^2)', 'Cov(X) = (1/n) * X^T * X']
    },
    {
      moduleNumber: 5,
      title: 'Model Evaluation Metrics, Cross-Validation & Ensemble Learning',
      hours: 8,
      description: 'Confusion Matrix, Precision, Recall, F1-Score, ROC-AUC Curve, Bias-Variance Tradeoff, K-Fold Cross Validation, Bagging (Random Forest), and Boosting (AdaBoost, XGBoost) overview.',
      topics: [
        'Confusion Matrix: TP, FP, TN, FN mechanics',
        'Precision = TP / (TP + FP), Recall = TP / (TP + FN), F1 = 2 * (P * R) / (P + R)',
        'ROC Curve and Area Under Curve (AUC)',
        'Bias vs Variance Tradeoff & Regularization (L1 Lasso, L2 Ridge)',
        'K-Fold Cross Validation and Random Forest Ensembles'
      ],
      courseOutcomes: ['CO5: Evaluate model performance rigorously and prevent overfitting.'],
      bloomsLevel: 'L4: Analyze',
      recommendedTextbook: 'Aurélien Géron, Chapter 3 & 7',
      pyqFrequency: 'Very High',
      importantFormulasOrCode: ['F1_Score = 2 * (Precision * Recall) / (Precision + Recall)', 'L2_Loss = MSE + lambda * sum(theta_i^2)']
    }
  ],
  lessonPlan: makeLessonPlan({
    id: 'lesson-21ds35-ml',
    topic: 'Supervised Learning & Decision Tree Entropy Optimization in 21DS35',
    topicHindi: 'पर्यवेक्षित शिक्षण और निर्णय वृक्ष एंट्रॉपी अनुकूलन',
    topicKannada: 'ಮೇಲ್ವಿಚಾರಣೆಯ ಯಂತ್ರ ಕಲಿಕೆ ಮತ್ತು ಡಿಸಿಷನ್ ಟ್ರೀ ಆಪ್ಟಿಮೈಸೇಶನ್',
    grade: 3,
    subject: '21DS35 - Foundations of Data Science & ML',
    durationMinutes: 45,
    beginnerSummary: 'A Decision Tree asks yes-or-no questions about your data features to split rows into pure buckets, using Information Gain to find the best question at each step.',
    beginnerAnalogy: 'Think of the game "20 Questions": each question you ask cuts the mystery options in half, bringing you closer to the correct answer with the fewest questions!',
    objectives: [
      'Understand Information Entropy as a measure of disorder or uncertainty in a dataset.',
      'Calculate Shannon Entropy: H(S) = - sum(p_i * log2(p_i)).',
      'Compute Information Gain for candidate features and choose the optimal split node.'
    ],
    sections: [
      { title: 'Shannon Entropy & Gini Impurity Metrics', durationMinutes: 15, content: 'Why pure nodes have 0 entropy and uniform splits have maximum entropy.' },
      { title: 'Information Gain Calculation Problem (Play Tennis / Medical Diagnosis)', durationMinutes: 20, content: 'Step-by-step mathematical calculation comparing Outlook vs Humidity.' }
    ],
    advancedInquiry: 'How does Random Forest reduce the high variance of individual deep decision trees through bootstrap aggregation (Bagging) and random feature subsampling?',
    citation: 'VTU 2025/2022 Scheme Module 3: Aurélien Géron Chapter 6',
    quiz: [
      {
        question: 'If a binary classification dataset contains 14 instances with 9 Positives and 5 Negatives, what is the Shannon Entropy formula?',
        questionHindi: '9 सकारात्मक और 5 नकारात्मक उदाहरणों के लिए शैनन एंट्रॉपी सूत्र क्या है?',
        options: ['- (9/14) log2(9/14) - (5/14) log2(5/14)', '(9/14)^2 + (5/14)^2', '1 - (9/14) - (5/14)', 'log2(14) / 2'],
        optionsHindi: ['- (9/14) log2(9/14) - (5/14) log2(5/14)', '(9/14)^2 + (5/14)^2', '1 - (9/14) - (5/14)', 'log2(14) / 2'],
        correctAnswerIndex: 0,
        explanation: 'Shannon Entropy H(S) = - p+ log2(p+) - p- log2(p-). With p+ = 9/14 and p- = 5/14, H(S) = - (9/14) log2(9/14) - (5/14) log2(5/14) ≈ 0.940.',
        explanationHindi: 'शैनन एंट्रॉपी H(S) = - p+ log2(p+) - p- log2(p-) होता है।',
        bloomLevel: 'Apply',
        targetConcept: 'Shannon Entropy Calculation',
        misconceptionDistractors: ['Using Gini formula instead of logarithm', 'Omitting the negative sign']
      }
    ]
  }),
  quizQuestions: [
    {
      id: 'q-ds-ml-1',
      question: 'Which metric measures the purity of a node in a Decision Tree using Shannon Information Theory?',
      options: ['Information Entropy / Gain', 'Mean Squared Error', 'Euclidean Distance', 'Cosine Similarity'],
      correctAnswerIndex: 0,
      explanation: 'Information Entropy measures uncertainty; Information Gain measures the reduction in entropy achieved by splitting on an attribute.',
      module: 3,
      difficulty: 'easy',
      topicTag: 'Decision Trees & Entropy'
    },
    {
      id: 'q-ds-ml-2',
      question: 'In binary classification, if Precision is 0.80 and Recall is 0.80, what is the Harmonic Mean F1-Score?',
      options: ['0.80', '0.64', '0.90', '0.75'],
      correctAnswerIndex: 0,
      explanation: 'F1 = 2 * (Precision * Recall) / (Precision + Recall) = 2 * (0.64) / 1.6 = 0.80.',
      module: 5,
      difficulty: 'medium',
      topicTag: 'Model Evaluation & F1-Score'
    }
  ],
  examPapers: [
    {
      title: 'VTU 2025 Scheme 21DS35 Model Question Paper (With Full Solutions)',
      year: '2025-2026',
      scheme: '2025 Scheme (Active)',
      type: 'Model Question Paper',
      totalMarks: 100
    }
  ],
  aiSystemPromptContext: 'You are the MINDMESH-NEXUS AI Data Science Professor for VTU 21DS35 (Foundations of Data Science & Machine Learning). Provide complete Python code snippets using NumPy, Pandas, and Scikit-Learn, mathematical derivations of loss functions, and exam rubrics.'
};

// ============================================================================
// HIERARCHY TREE OF UNIVERSITIES & SCHEMES
// ============================================================================

export const UNIVERSITIES_DATABASE: University[] = [
  // 1. VTU Belagavi (Karnataka)
  {
    id: 'vtu',
    name: 'VTU Belagavi',
    shortName: 'VTU',
    state: 'Karnataka',
    type: 'State Technical University',
    icon: '🎓',
    schemes: [
      {
        id: 'vtu-2025',
        name: '2025 Scheme (Active)',
        yearRange: '2025-2026',
        badge: 'Active',
        isActive: true,
        branchSemesters: [
          {
            id: 'vtu-cse-sem3',
            branchCode: 'CSE',
            branchName: 'Computer Science & Engineering',
            semester: 3,
            label: 'CSE Sem 3',
            iconName: 'Laptop',
            subjects: [SUBJECT_1BCS305, SUBJECT_21CS33, SUBJECT_21CS34]
          },
          {
            id: 'vtu-cseds-sem3',
            branchCode: 'CSE (Data Science)',
            branchName: 'CSE (Artificial Intelligence & Data Science)',
            semester: 3,
            label: 'CSE (Data Science) Sem 3',
            iconName: 'Database',
            subjects: [SUBJECT_21DS35, SUBJECT_1BCS305, SUBJECT_21CS34]
          },
          {
            id: 'vtu-cse-sem4',
            branchCode: 'CSE',
            branchName: 'Computer Science & Engineering',
            semester: 4,
            label: 'CSE Sem 4',
            iconName: 'Code',
            subjects: [SUBJECT_21CS42]
          },
          {
            id: 'vtu-aiml-sem3',
            branchCode: 'AI & ML',
            branchName: 'Artificial Intelligence & Machine Learning',
            semester: 3,
            label: 'AI & ML Sem 3',
            iconName: 'Cpu',
            subjects: [SUBJECT_21DS35, SUBJECT_1BCS305, SUBJECT_21CS34]
          },
          {
            id: 'vtu-ece-sem3',
            branchCode: 'ECE',
            branchName: 'Electronics & Communication Engineering',
            semester: 3,
            label: 'ECE Sem 3',
            iconName: 'Radio',
            subjects: [SUBJECT_21CS33]
          }
        ]
      },
      {
        id: 'vtu-2022-nep',
        name: '2022 NEP Scheme',
        yearRange: '2022-2024',
        badge: 'NEP 2020',
        isActive: false,
        branchSemesters: [
          {
            id: 'vtu-nep-cseds-sem3',
            branchCode: 'CSE (Data Science)',
            branchName: 'CSE (Artificial Intelligence & Data Science)',
            semester: 3,
            label: 'CSE (Data Science) Sem 3',
            iconName: 'Database',
            subjects: [SUBJECT_21DS35, SUBJECT_1BCS305, SUBJECT_21CS34]
          },
          {
            id: 'vtu-nep-cse-sem3',
            branchCode: 'CSE',
            branchName: 'Computer Science & Engineering',
            semester: 3,
            label: 'CSE Sem 3',
            iconName: 'Laptop',
            subjects: [SUBJECT_1BCS305, SUBJECT_21CS33, SUBJECT_21CS34]
          },
          {
            id: 'vtu-nep-cse-sem4',
            branchCode: 'CSE',
            branchName: 'Computer Science & Engineering',
            semester: 4,
            label: 'CSE Sem 4',
            iconName: 'Code',
            subjects: [SUBJECT_21CS42]
          }
        ]
      },
      {
        id: 'vtu-2021-cbcs',
        name: '2021 CBCS Scheme',
        yearRange: '2021-2023',
        badge: 'CBCS',
        isActive: false,
        branchSemesters: [
          {
            id: 'vtu-cbcs-cse-sem3',
            branchCode: 'CSE',
            branchName: 'Computer Science & Engineering',
            semester: 3,
            label: 'CSE Sem 3',
            iconName: 'Laptop',
            subjects: [SUBJECT_21CS33, SUBJECT_21CS34]
          }
        ]
      }
    ]
  },

  // 2. Autonomous Colleges (RVCE / BMSCE / MSRIT / PES / MIT)
  {
    id: 'autonomous-engg',
    name: 'Autonomous Engineering (RVCE / BMSCE / MSRIT)',
    shortName: 'Autonomous',
    state: 'Karnataka',
    type: 'Autonomous / Deemed',
    icon: '🏛️',
    schemes: [
      {
        id: 'auto-2025-curriculum',
        name: '2025 Industry-Aligned Scheme',
        yearRange: '2025-2026',
        badge: 'Active',
        isActive: true,
        branchSemesters: [
          {
            id: 'auto-cse-sem3',
            branchCode: 'CSE',
            branchName: 'Computer Science & Engineering',
            semester: 3,
            label: 'CSE Sem 3',
            iconName: 'Laptop',
            subjects: [SUBJECT_1BCS305, SUBJECT_21CS34]
          },
          {
            id: 'auto-cse-sem4',
            branchCode: 'CSE',
            branchName: 'Computer Science & Engineering',
            semester: 4,
            label: 'CSE Sem 4',
            iconName: 'Code',
            subjects: [SUBJECT_21CS42]
          }
        ]
      }
    ]
  },

  // 3. Anna University Chennai
  {
    id: 'anna-univ',
    name: 'Anna University Chennai',
    shortName: 'Anna Univ',
    state: 'Tamil Nadu',
    type: 'State Technical University',
    icon: '🎓',
    schemes: [
      {
        id: 'anna-2024-regulation',
        name: '2024 CBCS Regulation (Active)',
        yearRange: '2024-2026',
        badge: 'Active',
        isActive: true,
        branchSemesters: [
          {
            id: 'anna-cse-sem3',
            branchCode: 'CSE',
            branchName: 'Computer Science & Engineering',
            semester: 3,
            label: 'CSE Sem 3',
            iconName: 'Laptop',
            subjects: [SUBJECT_1BCS305, SUBJECT_21CS33]
          }
        ]
      }
    ]
  },

  // 4. AKTU Lucknow
  {
    id: 'aktu-lucknow',
    name: 'AKTU Lucknow (Dr. APJ Abdul Kalam Tech Univ)',
    shortName: 'AKTU',
    state: 'Uttar Pradesh',
    type: 'State Technical University',
    icon: '🎓',
    schemes: [
      {
        id: 'aktu-2024-scheme',
        name: '2024-25 AI Scheme',
        yearRange: '2024-2026',
        badge: 'Active',
        isActive: true,
        branchSemesters: [
          {
            id: 'aktu-cse-sem3',
            branchCode: 'CSE',
            branchName: 'Computer Science & Engineering',
            semester: 3,
            label: 'CSE Sem 3',
            iconName: 'Laptop',
            subjects: [SUBJECT_1BCS305, SUBJECT_21CS34]
          }
        ]
      }
    ]
  },

  // 5. NCERT / CBSE K-12 STEM
  {
    id: 'ncert-cbse',
    name: 'NCERT / CBSE Board (K-12 STEM)',
    shortName: 'NCERT / CBSE',
    state: 'National',
    type: 'National Board',
    icon: '🏫',
    schemes: [
      {
        id: 'ncert-2026-groundtruth',
        name: 'NCERT 2026 Ground Truth (NEP 2020)',
        yearRange: '2026',
        badge: 'Active',
        isActive: true,
        branchSemesters: [
          {
            id: 'ncert-g7-science',
            branchCode: 'Grade 7',
            branchName: 'Grade 7 Science & STEM',
            semester: 'Grade 7',
            label: 'Grade 7 Science',
            iconName: 'BookOpen',
            subjects: [SUBJECT_G7_SCIENCE]
          }
        ]
      }
    ]
  }
];

// Helper to look up active subject or default
export function getDefaultCurriculumSelection() {
  const university = UNIVERSITIES_DATABASE[0]; // VTU
  const scheme = university.schemes[0]; // 2025 Scheme
  const branchSem = scheme.branchSemesters[0]; // CSE Sem 3
  const subject = branchSem.subjects[0]; // 1BCS305

  return {
    university,
    scheme,
    branchSem,
    subject
  };
}
