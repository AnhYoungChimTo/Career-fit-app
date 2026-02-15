// User types
export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

// Interview types
export type InterviewType = 'lite' | 'deep' | 'lite_upgraded';
export type InterviewStatusType = 'in_progress' | 'completed' | 'abandoned';

export interface Question {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'slider' | 'ranking';
  question: string;
  description?: string;
  required: boolean;
  scoringKey: string;
  options?: Array<{ value: string; label: string; description?: string }>;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  sliderConfig?: {
    min: number;
    max: number;
    step: number;
    labels: { [key: number]: string };
  };
  triggersRecommendation?: boolean;
}

export interface QuestionSet {
  category?: string;
  moduleId?: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  questions: Question[];
  isRecommended?: boolean;
}

export interface ModuleMetadata {
  moduleId: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  totalQuestions: number;
  isRecommended: boolean;
  categories: string[];
}

export interface Interview {
  id: string;
  userId: string;
  interviewType: InterviewType;
  status: InterviewStatusType;
  currentModule?: string;
  currentQuestion?: number;
  startedAt: string;
  completedAt?: string;
  lastActivityAt: string;
}

export interface InterviewStatus {
  id: string;
  userId: string;
  interviewType: InterviewType;
  status: InterviewStatusType;
  currentModule?: string;
  currentQuestion?: number;
  completedModules?: string[];
  progress: {
    totalQuestions: number;
    answeredQuestions: number;
    percentComplete: number;
  };
  answers: {
    personality: any;
    talents: any;
    values: any;
    session: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface StartInterviewRequest {
  interviewType: InterviewType;
  selectedModules?: string[];
}

export interface SaveAnswerRequest {
  questionId: string;
  answer: any;
  moduleId?: string;
  category?: string;
}

// Results types
export interface CareerMatch {
  careerId: string;
  careerTitle: string;
  careerCategory: string;
  fitScore: number;
  confidence: 'low' | 'medium' | 'high';
  explanation: string;
  strengths: string[];
  growthAreas: string[];
  roadmap: string;
  // Enhanced detailed information
  detailedAnalysis: string; // 6-10 paragraphs in-depth analysis
  careerPattern: {
    progression: string; // Career progression path
    dailyResponsibilities: string; // Day-to-day work by level
    industryOutlook: string; // Trends and future in Vietnam
  };
  salaryInfo: {
    entryLevel: { range: string; experience: string };
    midLevel: { range: string; experience: string };
    seniorLevel: { range: string; experience: string };
  };
  skillStack: string[]; // Required skills to acquire
  learningPlan: {
    month1: string;
    month2: string;
    month3: string;
    month4: string;
    month5: string;
    month6: string;
  };
}

export interface MatchingResult {
  interviewId: string;
  interviewType: string;
  matches: CareerMatch[];
  analysisDate: string;
  dataCompleteness: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}
