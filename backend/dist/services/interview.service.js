"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLiteQuestions = getLiteQuestions;
exports.getDeepModule = getDeepModule;
exports.getDeepModulesMetadata = getDeepModulesMetadata;
exports.startInterview = startInterview;
exports.saveAnswer = saveAnswer;
exports.updateInterviewPosition = updateInterviewPosition;
exports.getInterviewStatus = getInterviewStatus;
exports.completeModule = completeModule;
exports.completeInterview = completeInterview;
exports.getUserInterviews = getUserInterviews;
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
/**
 * Load Lite questions from JSON files
 */
async function getLiteQuestions() {
    const questionsDir = path_1.default.join(__dirname, '../../..', 'questions', 'lite');
    const files = fs_1.default.readdirSync(questionsDir).filter(f => f.endsWith('.json'));
    const questionSets = [];
    for (const file of files) {
        const filePath = path_1.default.join(questionsDir, file);
        const content = fs_1.default.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        questionSets.push(data);
    }
    // Sort by a logical order: skills-talents, values-preferences, current-situation
    const order = ['skills-talents', 'values-preferences', 'current-situation'];
    questionSets.sort((a, b) => {
        const aIndex = order.indexOf(a.category || '');
        const bIndex = order.indexOf(b.category || '');
        return aIndex - bIndex;
    });
    return questionSets;
}
/**
 * Load a specific Deep module
 */
async function getDeepModule(moduleId) {
    const questionsDir = path_1.default.join(__dirname, '../../..', 'questions', 'deep');
    const filePath = path_1.default.join(questionsDir, `module-${moduleId.toLowerCase()}.json`);
    if (!fs_1.default.existsSync(filePath)) {
        throw new Error(`Module ${moduleId} not found`);
    }
    const content = fs_1.default.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
}
/**
 * Get all Deep modules metadata (without full questions)
 */
async function getDeepModulesMetadata() {
    const questionsDir = path_1.default.join(__dirname, '../../..', 'questions', 'deep');
    const files = fs_1.default.readdirSync(questionsDir)
        .filter(f => f.startsWith('module-') && f.endsWith('.json'))
        .sort();
    const modules = [];
    for (const file of files) {
        const filePath = path_1.default.join(questionsDir, file);
        const content = fs_1.default.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        modules.push({
            moduleId: data.moduleId,
            title: data.title,
            description: data.description,
            estimatedMinutes: data.estimatedMinutes,
            isRecommended: data.isRecommended || false,
            questionCount: data.questions.length,
        });
    }
    return modules;
}
/**
 * Start a new interview
 */
async function startInterview(data) {
    const { userId, interviewType, selectedModules } = data;
    // Validate user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new Error('User not found');
    }
    // Check if user already has an in-progress interview
    const existingInterview = await prisma.interview.findFirst({
        where: {
            userId,
            status: 'in_progress',
        },
    });
    if (existingInterview) {
        throw new Error('User already has an in-progress interview. Please complete or cancel it first.');
    }
    // Create new interview
    const interview = await prisma.interview.create({
        data: {
            userId,
            interviewType,
            status: 'in_progress',
            currentModule: interviewType === 'lite' ? 'skills-talents' : (selectedModules?.[0] || 'A'),
            currentQuestion: 0,
            personalityData: {},
            talentsData: {},
            valuesData: {},
            sessionData: interviewType === 'deep' && selectedModules
                ? { selectedModules }
                : {},
        },
    });
    return interview;
}
/**
 * Save an answer and update interview progress
 */
async function saveAnswer(interviewId, data) {
    const { questionId, answer, moduleId, category } = data;
    // Get interview
    const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
    });
    if (!interview) {
        throw new Error('Interview not found');
    }
    if (interview.status !== 'in_progress') {
        throw new Error('Interview is not in progress');
    }
    // Determine which data field to update based on scoring key
    const scoringKey = questionId.split('_')[0]; // e.g., "a1", "a2", "a3", "session"
    let dataField;
    if (scoringKey === 'a1') {
        dataField = 'personalityData';
    }
    else if (scoringKey === 'a2') {
        dataField = 'talentsData';
    }
    else if (scoringKey === 'a3') {
        dataField = 'valuesData';
    }
    else {
        dataField = 'sessionData';
    }
    // Get current data
    const currentData = interview[dataField] || {};
    // Add the answer
    const updatedData = {
        ...currentData,
        [questionId]: {
            answer,
            moduleId,
            category,
            answeredAt: new Date().toISOString(),
        },
    };
    // Update interview (lastActivityAt is auto-updated by Prisma @updatedAt)
    const updated = await prisma.interview.update({
        where: { id: interviewId },
        data: {
            [dataField]: updatedData,
            currentQuestion: (interview.currentQuestion || 0) + 1,
        },
    });
    return updated;
}
/**
 * Update current position in interview (for navigation)
 */
async function updateInterviewPosition(interviewId, currentModule, currentQuestion) {
    const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
    });
    if (!interview) {
        throw new Error('Interview not found');
    }
    const updated = await prisma.interview.update({
        where: { id: interviewId },
        data: {
            currentModule,
            currentQuestion,
        },
    });
    return updated;
}
/**
 * Get interview status and progress
 */
async function getInterviewStatus(interviewId) {
    const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
    });
    if (!interview) {
        throw new Error('Interview not found');
    }
    // Calculate progress
    const personalityAnswers = Object.keys(interview.personalityData || {}).length;
    const talentsAnswers = Object.keys(interview.talentsData || {}).length;
    const valuesAnswers = Object.keys(interview.valuesData || {}).length;
    const sessionAnswers = Object.keys(interview.sessionData || {}).length;
    const totalAnswered = personalityAnswers + talentsAnswers + valuesAnswers + sessionAnswers;
    // Estimate total questions based on interview type
    let totalQuestions = 0;
    if (interview.interviewType === 'lite') {
        totalQuestions = 37; // Lite has ~37 questions
    }
    else if (interview.interviewType === 'deep') {
        const sessionData = interview.sessionData || {};
        const selectedModules = sessionData.selectedModules || ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
        // Average 12 questions per module
        totalQuestions = selectedModules.length * 12;
    }
    const percentComplete = totalQuestions > 0
        ? Math.round((totalAnswered / totalQuestions) * 100)
        : 0;
    // Determine completed modules (for deep interviews)
    const completedModules = [];
    if (interview.interviewType === 'deep') {
        const sessionData = interview.sessionData || {};
        completedModules.push(...(sessionData.completedModules || []));
    }
    return {
        id: interview.id,
        userId: interview.userId,
        interviewType: interview.interviewType,
        status: interview.status,
        currentModule: interview.currentModule,
        currentQuestion: interview.currentQuestion,
        completedModules,
        progress: {
            totalQuestions,
            answeredQuestions: totalAnswered,
            percentComplete,
        },
        answers: {
            personality: interview.personalityData,
            talents: interview.talentsData,
            values: interview.valuesData,
            session: interview.sessionData,
        },
        createdAt: interview.startedAt,
        updatedAt: interview.lastActivityAt,
    };
}
/**
 * Complete a module (for deep interviews)
 */
async function completeModule(interviewId, moduleId) {
    const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
    });
    if (!interview) {
        throw new Error('Interview not found');
    }
    const sessionData = interview.sessionData || {};
    const completedModules = sessionData.completedModules || [];
    if (!completedModules.includes(moduleId)) {
        completedModules.push(moduleId);
    }
    const updated = await prisma.interview.update({
        where: { id: interviewId },
        data: {
            sessionData: {
                ...sessionData,
                completedModules,
            },
        },
    });
    return updated;
}
/**
 * Complete interview
 */
async function completeInterview(interviewId) {
    const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
    });
    if (!interview) {
        throw new Error('Interview not found');
    }
    const updated = await prisma.interview.update({
        where: { id: interviewId },
        data: {
            status: 'completed',
            completedAt: new Date(),
        },
    });
    return updated;
}
/**
 * Get user's interviews
 */
async function getUserInterviews(userId) {
    const interviews = await prisma.interview.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
    });
    return interviews;
}
