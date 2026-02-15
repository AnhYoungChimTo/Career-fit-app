export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}
export interface ApiError {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
    };
}
export interface UserDTO {
    id: string;
    email: string;
    name: string | null;
    createdAt: Date;
}
export type InterviewType = 'lite' | 'deep' | 'lite_upgraded';
export type InterviewStatus = 'in_progress' | 'completed' | 'abandoned';
export interface InterviewDTO {
    id: string;
    userId: string;
    interviewType: InterviewType;
    status: InterviewStatus;
    currentModule: string | null;
    currentQuestion: number | null;
    progress: number;
    startedAt: Date;
    completedAt: Date | null;
    lastActivityAt: Date;
}
export interface CareerMatch {
    careerName: string;
    fitScore: number;
    reasons: string[];
    gaps: string[];
    roadmap?: {
        shortTerm: string[];
        midTerm?: string[];
        longTerm?: string[];
    };
}
export interface ResultDTO {
    id: string;
    interviewId: string;
    aScore: number;
    a1Score: number;
    a2Score: number;
    a3Score: number;
    confidenceLevel: 'low' | 'medium' | 'high';
    careerMatches: CareerMatch[];
    topCareer: string;
    topFitScore: number;
    generatedAt: Date;
}
export type QuestionType = 'text_short' | 'text_long' | 'single_select' | 'multi_select' | 'slider' | 'dropdown' | 'date';
export interface QuestionOption {
    value: string;
    label: string;
}
export interface Question {
    id: string;
    module: string;
    questionNumber: number;
    type: QuestionType;
    text: string;
    description?: string;
    options?: QuestionOption[];
    min?: number;
    max?: number;
    required?: boolean;
    validation?: {
        minLength?: number;
        maxLength?: number;
        pattern?: string;
    };
}
export interface RegisterRequest {
    email: string;
    password: string;
    name?: string;
    securityQuestion: string;
    securityAnswer: string;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface PasswordResetRequest {
    email: string;
    securityAnswer: string;
    newPassword: string;
}
export interface AnswerRequest {
    questionId: string;
    answer: any;
}
//# sourceMappingURL=index.d.ts.map