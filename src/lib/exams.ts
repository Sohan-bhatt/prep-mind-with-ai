export interface Exam {
  id: string;
  name: string;
  fullName: string;
  icon: string;
  color: string;
  description: string;
  phases: ExamPhase[];
  duration: number;
  syllabus: SyllabusSection[];
}

export interface ExamPhase {
  name: string;
  papers: Paper[];
}

export interface Paper {
  name: string;
  topics: string[];
  weightage: number | string;
}

export interface SyllabusSection {
  name: string;
  topics: string[];
  subtopics?: string[];
}

export interface DailyTask {
  id: string;
  day: number;
  phase: string;
  subject: string;
  topic: string;
  tasks: TaskItem[];
  estimatedHours: number;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  type: 'reading' | 'practice' | 'revision' | 'mock' | 'current_affairs';
  resource?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface UserProgress {
  examId: string;
  currentDay: number;
  completedTasks: string[];
  partialTasks: string[];
  confusedTasks: string[];
  notes: UserNote[];
  monthlyProgress: MonthlyProgress[];
  startedAt: string;
}

export interface UserNote {
  id: string;
  day: number;
  topic: string;
  content: string;
  aiFeedback?: string;
  writingScore?: number;
  createdAt: string;
}

export interface MonthlyProgress {
  month: string;
  skills: SkillProgress[];
  topicsCovered: number;
  totalTopics: number;
  weakAreas: string[];
  strongAreas: string[];
}

export interface SkillProgress {
  skill: string;
  score: number;
  previousScore: number;
}

export const EXAMS: Exam[] = [
  {
    id: 'upsc',
    name: 'UPSC CSE',
    fullName: 'Civil Services Examination',
    icon: '🏛️',
    color: '#46B1BD',
    description: 'Indian Civil Services including IAS, IPS, IFS',
    duration: 365,
    phases: [
      {
        name: 'Prelims',
        papers: [
          { name: 'GS Paper I', topics: ['History', 'Geography', 'Polity', 'Economy', 'Science & Tech', 'Current Affairs'], weightage: 200 },
          { name: 'CSAT', topics: ['Reasoning', 'Quantitative Aptitude', 'English Comprehension'], weightage: 200 }
        ]
      },
      {
        name: 'Mains',
        papers: [
          { name: 'GS Paper I', topics: ['Indian Heritage', 'History', 'Geography'], weightage: 250 },
          { name: 'GS Paper II', topics: ['Polity', 'Governance', 'International Relations'], weightage: 250 },
          { name: 'GS Paper III', topics: ['Economy', 'Science & Tech', 'Environment', 'Disaster Management'], weightage: 250 },
          { name: 'GS Paper IV', topics: ['Ethics', 'Integrity', 'Aptitude'], weightage: 250 },
          { name: 'Essay', topics: ['Essay Writing'], weightage: 250 },
          { name: 'Optional', topics: ['Optional Subject'], weightage: 500 }
        ]
      },
      {
        name: 'Interview',
        papers: [
          { name: 'Personality Test', topics: ['Current Affairs', 'General Knowledge', 'Personal Background'], weightage: 275 }
        ]
      }
    ],
    syllabus: [
      { name: 'History', topics: ['Ancient India', 'Medieval India', 'Modern India', 'World History'] },
      { name: 'Geography', topics: ['Physical Geography', 'Indian Geography', 'World Geography', 'Economic Geography'] },
      { name: 'Polity', topics: ['Constitution', 'Parliament', 'Judiciary', 'Federalism', 'Local Government'] },
      { name: 'Economy', topics: ['Microeconomics', 'Macroeconomics', 'Indian Economy', 'Economic Reforms'] },
      { name: 'Science & Tech', topics: ['Physics', 'Chemistry', 'Biology', 'IT & AI', 'Space'] },
      { name: 'Environment', topics: ['Ecology', 'Biodiversity', 'Climate Change', 'Disaster Management'] },
      { name: 'Current Affairs', topics: ['National', 'International', 'Economy', 'Science & Tech', 'Awards'] },
      { name: 'Ethics', topics: ['Ethics Concepts', 'Case Studies', 'Emotional Intelligence'] }
    ]
  },
  {
    id: 'rbi_grade_b',
    name: 'RBI Grade B',
    fullName: 'Reserve Bank of India Grade B Officer',
    icon: '🏦',
    color: '#7C3AED',
    description: 'Officer in Reserve Bank of India',
    duration: 180,
    phases: [
      {
        name: 'Phase I (Prelims)',
        papers: [
          { name: 'General Awareness', topics: ['Banking', 'Economy', 'Current Affairs', 'Static GK'], weightage: 80 },
          { name: 'Quantitative Aptitude', topics: ['Number Series', 'DI', 'Quadratic Equations', 'Arithmetic'], weightage: 30 },
          { name: 'Reasoning', topics: ['Puzzles', 'Coding-Decoding', 'Logical Reasoning'], weightage: 60 },
          { name: 'English', topics: ['Reading Comprehension', 'Cloze Test', 'Para Jumbles'], weightage: 30 }
        ]
      },
      {
        name: 'Phase II (Mains)',
        papers: [
          { name: 'Economic & Social Issues', topics: ['Indian Economy', 'Social Issues', 'Economic Reforms'], weightage: 100 },
          { name: 'English (Descriptive)', topics: ['Essay', 'Precise Writing', 'Comprehension'], weightage: 100 },
          { name: 'Finance & Management', topics: ['Financial System', 'Management Principles', 'Banking'], weightage: 100 }
        ]
      },
      {
        name: 'Interview',
        papers: [
          { name: 'Personality Test', topics: ['Economics', 'Finance', 'Banking', 'Current Affairs'], weightage: 75 }
        ]
      }
    ],
    syllabus: [
      { name: 'Economic & Social Issues', topics: ['Growth & Development', 'Economic Reforms', 'Social Issues', 'Demographics', 'Human Development'] },
      { name: 'Finance', topics: ['Financial System', 'Money Market', 'Capital Market', 'Banking System', 'Financial Institutions', 'Risk Management'] },
      { name: 'Management', topics: ['Principles of Management', 'Organizational Behavior', 'Leadership', 'Motivation', 'Communication'] },
      { name: 'General Awareness', topics: ['RBI Functions', 'Monetary Policy', 'Banking Awareness', 'Government Schemes', 'Current Affairs'] },
      { name: 'Quantitative Aptitude', topics: ['Number Series', 'DI', 'Quadratic Equations', 'Profit & Loss', 'Average'] },
      { name: 'Reasoning', topics: ['Puzzles', 'Seating Arrangement', 'Blood Relations', 'Coding-Decoding', 'Syllogism'] }
    ]
  },
  {
    id: 'ssc_cgl',
    name: 'SSC CGL',
    fullName: 'Staff Selection Commission Combined Graduate Level',
    icon: '📊',
    color: '#F59E0B',
    description: 'Graduate Level Examination for Government Jobs',
    duration: 150,
    phases: [
      {
        name: 'Tier I',
        papers: [
          { name: 'Computer Based', topics: ['General Intelligence', 'General Awareness', 'Quantitative Aptitude', 'English'], weightage: 200 }
        ]
      },
      {
        name: 'Tier II',
        papers: [
          { name: 'Quantitative Abilities', topics: ['Arithmetic', 'Advanced Math'], weightage: 200 },
          { name: 'English Language', topics: ['Grammar', 'Vocabulary', 'Comprehension'], weightage: 200 },
          { name: 'Statistics', topics: ['Statistical Methods', 'Data Interpretation'], weightage: 200 },
          { name: 'Finance & Economics', topics: ['Financial Accounting', 'Economics'], weightage: 200 }
        ]
      },
      {
        name: 'Tier III',
        papers: [
          { name: 'Descriptive', topics: ['Essay', 'Letter', 'Application'], weightage: 100 }
        ]
      },
      {
        name: 'Tier IV',
        papers: [
          { name: 'Skill Test', topics: ['Data Entry', 'Typing'], weightage: 'Qualifying' }
        ]
      }
    ],
    syllabus: [
      { name: 'General Intelligence', topics: ['Analogies', 'Classification', 'Coding-Decoding', 'Puzzles'] },
      { name: 'General Awareness', topics: ['History', 'Geography', 'Polity', 'Economy', 'Science'] },
      { name: 'Quantitative Aptitude', topics: ['Number System', 'Algebra', 'Geometry', 'Trigonometry'] },
      { name: 'English', topics: ['Grammar', 'Vocabulary', 'Comprehension', 'Writing Skills'] }
    ]
  },
  {
    id: 'bank_po',
    name: 'Bank PO',
    fullName: 'IBPS PO / SBI PO',
    icon: '💼',
    color: '#10B981',
    description: 'Probationary Officer in Public Sector Banks',
    duration: 120,
    phases: [
      {
        name: 'Preliminary',
        papers: [
          { name: 'Quantitative Aptitude', topics: ['Number Series', 'DI', 'Quadratic Equations', 'Arithmetic'], weightage: 35 },
          { name: 'Reasoning', topics: ['Puzzles', 'Coding-Decoding', 'Logical Reasoning'], weightage: 35 },
          { name: 'English', topics: ['Reading Comprehension', 'Cloze Test', 'Error Spotting'], weightage: 30 }
        ]
      },
      {
        name: 'Mains',
        papers: [
          { name: 'Reasoning', topics: ['Puzzles', 'Seating Arrangement', 'Critical Reasoning'], weightage: 60 },
          { name: 'Quantitative Aptitude', topics: ['DI', 'Number Series', 'Quadratic Equations'], weightage: 60 },
          { name: 'English', topics: ['Reading Comprehension', 'Summary', 'Error Correction'], weightage: 40 },
          { name: 'General Awareness', topics: ['Banking', 'Economy', 'Current Affairs'], weightage: 40 }
        ]
      },
      {
        name: 'Interview',
        papers: [
          { name: 'Group Discussion', topics: ['Case Study', 'Topic Discussion'], weightage: 20 },
          { name: 'Interview', topics: ['Personal', 'Banking', 'Current Affairs'], weightage: 30 }
        ]
      }
    ],
    syllabus: [
      { name: 'Quantitative Aptitude', topics: ['Simplification', 'Number Series', 'DI', 'Quadratic Equations', 'Profit & Loss'] },
      { name: 'Reasoning', topics: ['Puzzles', 'Seating Arrangement', 'Blood Relations', 'Direction Test'] },
      { name: 'English', topics: ['Reading Comprehension', 'Cloze Test', 'Error Spotting', 'Para Jumbles'] },
      { name: 'General Awareness', topics: ['Banking Awareness', 'Static GK', 'Current Affairs'] }
    ]
  }
];

export const generateRoadmap = (examId: string): DailyTask[] => {
  const exam = EXAMS.find(e => e.id === examId);
  if (!exam) return [];

  const tasks: DailyTask[] = [];
  const phaseOrder = exam.phases.map(p => p.name);
  
  let currentDay = 1;
  
  // Phase 1: Foundation (30% of time)
  const foundationDays = Math.floor(exam.duration * 0.30);
  for (let day = 1; day <= foundationDays; day++) {
    const phase = exam.phases[0];
    const subjects = phase.papers.map(p => p.name);
    const subject = subjects[(day - 1) % subjects.length];
    
    tasks.push({
      id: `day-${day}`,
      day,
      phase: phase.name,
      subject,
      topic: getTopicForDay(examId, day, 'foundation'),
      tasks: generateDailyTasks(examId, day, 'foundation'),
      estimatedHours: 5 + Math.random() * 2
    });
    currentDay++;
  }

  // Phase 2: Advanced (45% of time)
  const advancedDays = Math.floor(exam.duration * 0.45);
  for (let day = foundationDays + 1; day <= foundationDays + advancedDays; day++) {
    const phase = exam.phases[1] || exam.phases[0];
    const subjects = phase.papers.map(p => p.name);
    const subject = subjects[(day - foundationDays - 1) % subjects.length];
    
    tasks.push({
      id: `day-${day}`,
      day,
      phase: phase.name,
      subject,
      topic: getTopicForDay(examId, day, 'advanced'),
      tasks: generateDailyTasks(examId, day, 'advanced'),
      estimatedHours: 6 + Math.random() * 2
    });
    currentDay++;
  }

  // Phase 3: Revision & Mock (25% of time)
  const revisionDays = exam.duration - foundationDays - advancedDays;
  for (let day = foundationDays + advancedDays + 1; day <= exam.duration; day++) {
    tasks.push({
      id: `day-${day}`,
      day,
      phase: 'Revision & Mocks',
      subject: 'Full Syllabus',
      topic: 'Mock Tests & Revision',
      tasks: [
        {
          id: `task-${day}-1`,
          title: 'Full Length Mock Test',
          description: 'Attempt complete mock test under timed conditions',
          type: 'mock',
          priority: 'high'
        },
        {
          id: `task-${day}-2`,
          title: 'Analyze Mock Results',
          description: 'Review all questions and identify weak areas',
          type: 'practice',
          priority: 'high'
        },
        {
          id: `task-${day}-3`,
          title: 'Quick Revision',
          description: 'Revise key formulas, facts, and concepts',
          type: 'revision',
          priority: 'medium'
        },
        {
          id: `task-${day}-4`,
          title: 'Current Affairs',
          description: 'Read daily current affairs from reliable sources',
          type: 'current_affairs',
          priority: 'medium'
        }
      ],
      estimatedHours: 7
    });
  }

  return tasks;
};

function getTopicForDay(examId: string, day: number, phase: string): string {
  const topics: Record<string, { foundation: string[]; advanced: string[] }> = {
    upsc: {
      foundation: ['Indian History - Ancient', 'Indian History - Medieval', 'Indian History - Modern', 'World History', 'Physical Geography', 'Indian Geography', 'Indian Constitution', 'Political System', 'Economic Planning', 'Agriculture'],
      advanced: ['GS Paper II Topics', 'GS Paper III Topics', 'Ethics Case Studies', 'Essay Writing', 'Current Affairs Deep Dive', 'Answer Writing Practice']
    },
    rbi_grade_b: {
      foundation: ['Economic Growth & Development', 'Indian Financial System', 'Monetary Policy', 'Banking System', 'Capital Markets', 'Money Market Instruments'],
      advanced: ['Economic & Social Issues', 'Finance & Management', 'Descriptive Writing', 'Current Affairs - Economy', 'RBI Policies', 'Case Studies']
    },
    ssc_cgl: {
      foundation: ['Number System', 'Algebra Basics', 'Geometry Basics', 'Trigonometry Basics', 'Reasoning - Analogies', 'Reasoning - Classification'],
      advanced: ['Advanced Mathematics', 'English Grammar', 'Vocabulary Building', 'Comprehension Skills']
    },
    bank_po: {
      foundation: ['Simplification', 'Number Series', 'DI Basics', 'Puzzles Basics', 'Blood Relations', 'Coding-Decoding'],
      advanced: ['Advanced Puzzles', 'Critical Reasoning', 'Reading Comprehension', 'Descriptive Writing', 'Banking Awareness']
    }
  };

  const phaseTopics = topics[examId]?.[phase as 'foundation' | 'advanced'] || topics['upsc'][phase as 'foundation' | 'advanced'];
  return phaseTopics[(day - 1) % phaseTopics.length];
}

function generateDailyTasks(examId: string, day: number, phase: string): TaskItem[] {
  const baseTasks: TaskItem[] = [
    {
      id: `task-${day}-1`,
      title: 'Study Concept',
      description: 'Read and understand the core concepts',
      type: 'reading',
      priority: 'high'
    },
    {
      id: `task-${day}-2`,
      title: 'Practice Questions',
      description: 'Solve topic-wise practice questions',
      type: 'practice',
      priority: 'high'
    },
    {
      id: `task-${day}-3`,
      title: 'Quick Revision',
      description: 'Revise key points from previous topics',
      type: 'revision',
      priority: 'medium'
    },
    {
      id: `task-${day}-4`,
      title: 'Current Affairs',
      description: 'Read daily current affairs',
      type: 'current_affairs',
      priority: 'medium'
    }
  ];

  // Add exam-specific tasks
  if (examId === 'rbi_grade_b' && phase === 'advanced') {
    baseTasks.push({
      id: `task-${day}-5`,
      title: 'Descriptive Writing',
      description: 'Practice essay/precis writing',
      type: 'practice',
      priority: 'high',
      resource: 'V Pathak + Previous Papers'
    });
  }

  if (examId === 'upsc') {
    baseTasks.push({
      id: `task-${day}-5`,
      title: 'Answer Writing',
      description: 'Practice GS answer writing (250 words)',
      type: 'practice',
      priority: 'high'
    });
  }

  return baseTasks;
}

export const getExamById = (id: string): Exam | undefined => {
  return EXAMS.find(exam => exam.id === id);
};

export const getTodayTask = (roadmap: DailyTask[], currentDay: number): DailyTask | undefined => {
  return roadmap.find(task => task.day === currentDay);
};

export const getTasksForConfirmation = (task: DailyTask): { taskId: string; title: string; status: 'pending' | 'completed' | 'partial' | 'confused' }[] => {
  return task.tasks.map(t => ({
    taskId: t.id,
    title: t.title,
    status: 'pending' as const
  }));
};
