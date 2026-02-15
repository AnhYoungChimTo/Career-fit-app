interface Question {
    id: string;
    type: string;
    required: boolean;
    question: string;
    scoringKey: string;
    [key: string]: any;
}
interface QuestionSet {
    category?: string;
    moduleId?: string;
    title: string;
    description: string;
    estimatedMinutes: number;
    questions: Question[];
    isRecommended?: boolean;
}
interface StartInterviewRequest {
    userId: string;
    interviewType: 'lite' | 'deep';
    selectedModules?: string[];
}
interface SaveAnswerRequest {
    questionId: string;
    answer: any;
    moduleId?: string;
    category?: string;
}
interface InterviewStatus {
    id: string;
    userId: string;
    interviewType: string;
    status: string;
    currentModule?: string | null;
    currentQuestion?: number | null;
    completedModules?: string[];
    progress: {
        totalQuestions: number;
        answeredQuestions: number;
        percentComplete: number;
    };
    answers: any;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Load Lite questions from JSON files
 */
export declare function getLiteQuestions(): Promise<QuestionSet[]>;
/**
 * Load a specific Deep module
 */
export declare function getDeepModule(moduleId: string): Promise<QuestionSet>;
/**
 * Get all Deep modules metadata (without full questions)
 */
export declare function getDeepModulesMetadata(): Promise<Array<{
    moduleId: string;
    title: string;
    description: string;
    estimatedMinutes: number;
    isRecommended: boolean;
    questionCount: number;
}>>;
/**
 * Start a new interview
 */
export declare function startInterview(data: StartInterviewRequest): Promise<{
    id: string;
    userId: string;
    interviewType: string;
    status: string;
    currentModule: string | null;
    currentQuestion: number | null;
    startedAt: Date;
    completedAt: Date | null;
    lastActivityAt: Date;
    personalityData: import("@prisma/client/runtime/library").JsonValue | null;
    talentsData: import("@prisma/client/runtime/library").JsonValue | null;
    valuesData: import("@prisma/client/runtime/library").JsonValue | null;
    sessionData: import("@prisma/client/runtime/library").JsonValue | null;
}>;
/**
 * Save an answer and update interview progress
 */
export declare function saveAnswer(interviewId: string, data: SaveAnswerRequest): Promise<{
    id: string;
    userId: string;
    interviewType: string;
    status: string;
    currentModule: string | null;
    currentQuestion: number | null;
    startedAt: Date;
    completedAt: Date | null;
    lastActivityAt: Date;
    personalityData: import("@prisma/client/runtime/library").JsonValue | null;
    talentsData: import("@prisma/client/runtime/library").JsonValue | null;
    valuesData: import("@prisma/client/runtime/library").JsonValue | null;
    sessionData: import("@prisma/client/runtime/library").JsonValue | null;
}>;
/**
 * Update current position in interview (for navigation)
 */
export declare function updateInterviewPosition(interviewId: string, currentModule: string, currentQuestion: number): Promise<{
    id: string;
    userId: string;
    interviewType: string;
    status: string;
    currentModule: string | null;
    currentQuestion: number | null;
    startedAt: Date;
    completedAt: Date | null;
    lastActivityAt: Date;
    personalityData: import("@prisma/client/runtime/library").JsonValue | null;
    talentsData: import("@prisma/client/runtime/library").JsonValue | null;
    valuesData: import("@prisma/client/runtime/library").JsonValue | null;
    sessionData: import("@prisma/client/runtime/library").JsonValue | null;
}>;
/**
 * Get interview status and progress
 */
export declare function getInterviewStatus(interviewId: string): Promise<InterviewStatus>;
/**
 * Complete a module (for deep interviews)
 */
export declare function completeModule(interviewId: string, moduleId: string): Promise<{
    id: string;
    userId: string;
    interviewType: string;
    status: string;
    currentModule: string | null;
    currentQuestion: number | null;
    startedAt: Date;
    completedAt: Date | null;
    lastActivityAt: Date;
    personalityData: import("@prisma/client/runtime/library").JsonValue | null;
    talentsData: import("@prisma/client/runtime/library").JsonValue | null;
    valuesData: import("@prisma/client/runtime/library").JsonValue | null;
    sessionData: import("@prisma/client/runtime/library").JsonValue | null;
}>;
/**
 * Complete interview
 */
export declare function completeInterview(interviewId: string): Promise<{
    id: string;
    userId: string;
    interviewType: string;
    status: string;
    currentModule: string | null;
    currentQuestion: number | null;
    startedAt: Date;
    completedAt: Date | null;
    lastActivityAt: Date;
    personalityData: import("@prisma/client/runtime/library").JsonValue | null;
    talentsData: import("@prisma/client/runtime/library").JsonValue | null;
    valuesData: import("@prisma/client/runtime/library").JsonValue | null;
    sessionData: import("@prisma/client/runtime/library").JsonValue | null;
}>;
/**
 * Get user's interviews
 */
export declare function getUserInterviews(userId: string): Promise<{
    id: string;
    userId: string;
    interviewType: string;
    status: string;
    currentModule: string | null;
    currentQuestion: number | null;
    startedAt: Date;
    completedAt: Date | null;
    lastActivityAt: Date;
    personalityData: import("@prisma/client/runtime/library").JsonValue | null;
    talentsData: import("@prisma/client/runtime/library").JsonValue | null;
    valuesData: import("@prisma/client/runtime/library").JsonValue | null;
    sessionData: import("@prisma/client/runtime/library").JsonValue | null;
}[]>;
export {};
//# sourceMappingURL=interview.service.d.ts.map