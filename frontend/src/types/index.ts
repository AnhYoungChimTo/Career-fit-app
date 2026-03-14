// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  headline?: string;
  location?: string;
  phoneNumber?: string;
  linkedinUrl?: string;
  about?: string;
  currentRole?: string;
  currentCompany?: string;
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
  fullStructuredAnalysis?: string; // Full PHẦN I-VI structured analysis report (deep only)
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

// Career types
export interface Career {
  id: string;
  name: string;
  vietnameseName: string;
  description: string;
  avgSalaryVND?: string;
  salaryRange: {
    min: number;
    max: number;
  };
  workHoursPerWeek?: number;
  stressLevel?: string;
  growthPotential?: string;
  category: string;
  experienceLevel: string;
  requirements: any;
  cachedAnalysis?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CareerFilters {
  search?: string;
  category?: string;
  experienceLevel?: string;
  minSalary?: number;
  maxSalary?: number;
  stressLevel?: string;
  growthPotential?: string;
  limit?: number;
  offset?: number;
}

export interface CareerStats {
  totalCareers: number;
  byCategory: Record<string, number>;
  byStressLevel: Record<string, number>;
  byGrowthPotential: Record<string, number>;
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

// ─────────────────────────────────────────────
// MENTOR FEATURE TYPES
// ─────────────────────────────────────────────

export type MentorStatus = 'pending' | 'active' | 'paused' | 'full' | 'on_leave' | 'rejected';
export type ConnectionStatus = 'pending' | 'active' | 'declined' | 'ended';
export type MilestoneStatus = 'not_started' | 'in_progress' | 'pending_confirmation' | 'complete';
export type SessionStatus = 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type WaitlistStatus = 'waiting' | 'invited' | 'accepted' | 'expired' | 'removed';

export interface MentorCredential {
  id: string;
  mentorId: string;
  badgeType: 'ex_tier1_bank' | 'cfa_cpa_mba' | 'vc_pe' | 'university' | 'years_exp';
  badgeLabel: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
  createdAt: string;
}

export interface MentorWorkExperience {
  id: string;
  company: string;
  title: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface MentorEducation {
  id: string;
  university: string;
  degree: string;
  graduationYear?: string;
}

export interface Mentor {
  id: string;
  userId: string;
  displayName?: string;
  username: string;
  headline?: string;
  aboutMe?: string;
  philosophy?: string;
  industry?: string;
  yearsExperience?: number;
  sessionPriceUsd: number;
  freeIntroSession: boolean;
  maxMentees?: number;
  status: MentorStatus;
  linkedinUrl?: string;
  linkedinVerified: boolean;
  externalMeetUrl?: string;
  isPremium: boolean;
  adminVerifiedAt?: string;
  primaryLanguage: string;
  timezone?: string;
  locationCity?: string;
  locationCountry?: string;
  mentorshipStyle?: string;
  supportedGoals: string[];
  mentorIndustries: string[];
  availability: Record<string, boolean>;
  sessionDuration: number;
  bufferTime: number;
  advanceBooking: string;
  mentorStatus: string;
  onboardingDone: boolean;
  createdAt: string;
  updatedAt: string;
  // Relations
  credentials?: MentorCredential[];
  workExperiences?: MentorWorkExperience[];
  educationEntries?: MentorEducation[];
  user?: User;
  // Computed
  matchScore?: number;
  avgRating?: number;
  totalReviews?: number;
  totalMentees?: number;
  totalSessions?: number;
}

export interface MentorConnection {
  id: string;
  mentorId: string;
  menteeId: string;
  status: ConnectionStatus;
  introMessage?: string;
  initiatedBy?: string;
  declineReason?: string;
  acceptedAt?: string;
  endedAt?: string;
  createdAt: string;
  mentor?: Mentor;
  mentee?: User & { profile?: any };
  roadmap?: Roadmap;
}

export interface Roadmap {
  id: string;
  connectionId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  milestones?: RoadmapMilestone[];
}

export interface RoadmapMilestone {
  id: string;
  roadmapId: string;
  title: string;
  description?: string;
  category: 'cv_application' | 'networking' | 'technical' | 'interview' | 'research' | 'other';
  phaseLabel?: string;
  dueDate?: string;
  status: MilestoneStatus;
  mentorConfirmed: boolean;
  menteeConfirmed: boolean;
  sortOrder: number;
  autoConfirmedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MentorSession {
  id: string;
  connectionId: string;
  title?: string;
  scheduledAt: string;
  durationMins: number;
  meetingUrl?: string;
  agenda?: string;
  status: SessionStatus;
  priceUsd: number;
  platformFee?: number;
  netEarnings?: number;
  createdAt: string;
  connection?: MentorConnection;
  notes?: SessionNote;
}

export interface SessionNote {
  id: string;
  sessionId: string;
  content?: string;
  updatedBy?: string;
  updatedAt: string;
  createdAt: string;
}

export interface Review {
  id: string;
  sessionId: string;
  reviewerId: string;
  revieweeId: string;
  reviewerRole: 'mentor' | 'mentee';
  rating: number;
  body: string;
  tags: string[];
  isPublic: boolean;
  mentorReply?: string;
  expiresAt?: string;
  createdAt: string;
  reviewer?: User;
}

export interface MentorWaitlist {
  id: string;
  mentorId: string;
  menteeId: string;
  invitedAt?: string;
  inviteExpiresAt?: string;
  status: WaitlistStatus;
  createdAt: string;
  mentee?: User & { profile?: any };
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title?: string;
  body?: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  connectionId: string;
  senderId: string;
  content: string;
  fileUrl?: string;
  fileType?: string;
  isRead: boolean;
  createdAt: string;
  sender?: User;
}

// Wizard step data
export interface MentorSignupData {
  // Step 1
  displayName?: string;
  primaryLanguage: string;
  timezone?: string;
  locationCity?: string;
  locationCountry?: string;
  // Step 2 (LinkedIn)
  linkedinUrl?: string;
  linkedinVerified?: boolean;
  // Step 3
  currentRoleTitle?: string;
  currentCompany?: string;
  industry?: string;
  yearsExperience?: number;
  workExperiences?: MentorWorkExperience[];
  educationEntries?: MentorEducation[];
  credentials?: Array<{ badgeType: string; badgeLabel: string }>;
  // Step 4
  supportedGoals?: string[];
  mentorIndustries?: string[];
  mentorshipStyle?: string;
  sessionPriceUsd?: number;
  freeIntroSession?: boolean;
  maxMentees?: number;
  // Step 5
  availability?: Record<string, boolean>;
  sessionDuration?: number;
  externalMeetUrl?: string;
  bufferTime?: number;
  advanceBooking?: string;
  // Step 6
  headline?: string;
  aboutMe?: string;
  philosophy?: string;
  username?: string;
}
