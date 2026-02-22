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
exports.getInterviewModules = getInterviewModules;
exports.upgradeInterview = upgradeInterview;
exports.abandonInterview = abandonInterview;
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
// Cache for question scoringKey lookup (questionId -> scoringKey)
let scoringKeyCache = null;
function buildScoringKeyCache() {
    if (scoringKeyCache)
        return scoringKeyCache;
    const cache = {};
    // Load lite questions
    const liteDir = path_1.default.join(__dirname, '../../..', 'questions', 'lite');
    if (fs_1.default.existsSync(liteDir)) {
        const liteFiles = fs_1.default.readdirSync(liteDir).filter(f => f.endsWith('.json'));
        for (const file of liteFiles) {
            const content = fs_1.default.readFileSync(path_1.default.join(liteDir, file), 'utf8');
            const data = JSON.parse(content);
            for (const q of data.questions || []) {
                if (q.id && q.scoringKey) {
                    cache[q.id] = q.scoringKey;
                }
            }
        }
    }
    // Load deep questions
    const deepDir = path_1.default.join(__dirname, '../../..', 'questions', 'deep');
    if (fs_1.default.existsSync(deepDir)) {
        const deepFiles = fs_1.default.readdirSync(deepDir).filter(f => f.endsWith('.json'));
        for (const file of deepFiles) {
            const content = fs_1.default.readFileSync(path_1.default.join(deepDir, file), 'utf8');
            const data = JSON.parse(content);
            for (const q of data.questions || []) {
                if (q.id && q.scoringKey) {
                    cache[q.id] = q.scoringKey;
                }
            }
        }
    }
    scoringKeyCache = cache;
    return cache;
}
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
    // Note: Removed restriction - users can now have multiple in-progress interviews
    // This allows for better UX where users can explore different paths
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
    // Look up the scoringKey for this question
    const cache = buildScoringKeyCache();
    const resolvedScoringKey = cache[questionId] || questionId;
    // Determine which data field to update based on scoringKey prefix
    const scoringPrefix = resolvedScoringKey.split('_')[0]; // e.g., "a1", "a2", "a3", "session"
    let dataField;
    if (scoringPrefix === 'a1') {
        dataField = 'personalityData';
    }
    else if (scoringPrefix === 'a2') {
        dataField = 'talentsData';
    }
    else if (scoringPrefix === 'a3') {
        dataField = 'valuesData';
    }
    else {
        dataField = 'sessionData';
    }
    // Get current data
    const currentData = interview[dataField] || {};
    // Store answer keyed by scoringKey (so scoring functions can find it)
    const updatedData = {
        ...currentData,
        [resolvedScoringKey]: {
            answer,
            questionId,
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
    else if (interview.interviewType === 'deep' || interview.interviewType === 'lite_upgraded') {
        const sessionData = interview.sessionData || {};
        const selectedModules = sessionData.selectedModules || ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
        // Average 12 questions per module
        totalQuestions = selectedModules.length * 12;
        // For lite_upgraded, add the Lite questions that were already answered
        if (interview.interviewType === 'lite_upgraded') {
            totalQuestions += 37;
        }
    }
    const percentComplete = totalQuestions > 0
        ? Math.round((totalAnswered / totalQuestions) * 100)
        : 0;
    // Determine completed modules (for deep interviews)
    const completedModules = [];
    if (interview.interviewType === 'deep' || interview.interviewType === 'lite_upgraded') {
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
/**
 * Get Deep interview modules with status for a specific interview
 */
async function getInterviewModules(interviewId) {
    // Get interview
    const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
    });
    if (!interview) {
        throw new Error('Interview not found');
    }
    if (interview.interviewType !== 'deep' && interview.interviewType !== 'lite_upgraded') {
        throw new Error('This is not a Deep interview');
    }
    // Load all modules with full question data to build scoringKey -> moduleId mapping
    const questionsDir = path_1.default.join(__dirname, '../../..', 'questions', 'deep');
    const files = fs_1.default.readdirSync(questionsDir)
        .filter(f => f.startsWith('module-') && f.endsWith('.json'))
        .sort();
    const modulesData = [];
    const scoringKeyToModule = {};
    for (const file of files) {
        const filePath = path_1.default.join(questionsDir, file);
        const content = fs_1.default.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        modulesData.push(data);
        for (const q of data.questions || []) {
            if (q.scoringKey) {
                scoringKeyToModule[q.scoringKey] = data.moduleId;
            }
        }
    }
    // Get completed modules from session data
    const sessionData = interview.sessionData || {};
    const completedModules = sessionData.completedModules || [];
    // Get all answers to count how many questions per module have been answered
    const allAnswers = {
        ...(interview.personalityData || {}),
        ...(interview.talentsData || {}),
        ...(interview.valuesData || {}),
        ...(interview.sessionData || {}),
    };
    // Count answers per module using the scoringKey -> moduleId mapping
    const answerCountByModule = {};
    for (const key of Object.keys(allAnswers)) {
        const moduleId = scoringKeyToModule[key];
        if (moduleId) {
            answerCountByModule[moduleId] = (answerCountByModule[moduleId] || 0) + 1;
        }
    }
    // Build module status array
    const modules = modulesData.map((meta) => {
        const moduleId = meta.moduleId;
        const answeredCount = answerCountByModule[moduleId] || 0;
        // Determine status
        let status;
        if (completedModules.includes(moduleId)) {
            status = 'completed';
        }
        else if (answeredCount > 0) {
            status = 'in_progress';
        }
        else {
            status = 'not_started';
        }
        return {
            moduleId: meta.moduleId,
            title: meta.title,
            description: meta.description,
            estimatedMinutes: meta.estimatedMinutes,
            isRecommended: meta.isRecommended || false,
            questionsCount: meta.questions.length,
            answeredCount,
            status,
        };
    });
    return modules;
}
/**
 * Upgrade a Lite interview to Deep (lite_upgraded)
 */
async function upgradeInterview(interviewId) {
    // Get interview
    const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
    });
    if (!interview) {
        throw new Error('Interview not found');
    }
    if (interview.interviewType !== 'lite') {
        throw new Error('Only Lite interviews can be upgraded');
    }
    if (interview.status !== 'completed') {
        throw new Error('Interview must be completed before upgrading');
    }
    // Update interview to lite_upgraded and set status back to in_progress
    const updated = await prisma.interview.update({
        where: { id: interviewId },
        data: {
            interviewType: 'lite_upgraded',
            status: 'in_progress',
            currentModule: 'A', // Start with Module A
            currentQuestion: 0,
            sessionData: {
                completedModules: [], // No Deep modules completed yet
                upgradedFrom: 'lite',
                upgradedAt: new Date().toISOString(),
            },
        },
    });
    return updated;
}
/**
 * Abandon/delete an interview
 */
async function abandonInterview(interviewId) {
    const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
    });
    if (!interview) {
        throw new Error('Interview not found');
    }
    // Mark as abandoned instead of deleting (preserves data)
    const updated = await prisma.interview.update({
        where: { id: interviewId },
        data: {
            status: 'abandoned',
        },
    });
    return updated;
}
