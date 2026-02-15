"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLiteQuestions = getLiteQuestions;
exports.getDeepModulesMetadata = getDeepModulesMetadata;
exports.getDeepModule = getDeepModule;
exports.startInterview = startInterview;
exports.saveAnswer = saveAnswer;
exports.updatePosition = updatePosition;
exports.getInterviewStatus = getInterviewStatus;
exports.completeModule = completeModule;
exports.completeInterview = completeInterview;
exports.getMyInterviews = getMyInterviews;
const interviewService = __importStar(require("../services/interview.service"));
/**
 * GET /api/interviews/questions/lite
 * Get all Lite interview questions
 */
async function getLiteQuestions(_req, res) {
    try {
        const questions = await interviewService.getLiteQuestions();
        res.json({
            success: true,
            data: {
                interviewType: 'lite',
                estimatedMinutes: questions.reduce((sum, q) => sum + q.estimatedMinutes, 0),
                categories: questions,
                totalQuestions: questions.reduce((sum, q) => sum + q.questions.length, 0),
            },
        });
    }
    catch (error) {
        console.error('Error loading Lite questions:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'QUESTIONS_LOAD_ERROR',
                message: error.message,
            },
        });
    }
}
/**
 * GET /api/interviews/questions/deep/modules
 * Get all Deep modules metadata
 */
async function getDeepModulesMetadata(_req, res) {
    try {
        const modules = await interviewService.getDeepModulesMetadata();
        res.json({
            success: true,
            data: {
                interviewType: 'deep',
                modules,
                totalQuestions: modules.reduce((sum, m) => sum + m.questionCount, 0),
                totalMinutes: modules.reduce((sum, m) => sum + m.estimatedMinutes, 0),
            },
        });
    }
    catch (error) {
        console.error('Error loading Deep modules:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'MODULES_LOAD_ERROR',
                message: error.message,
            },
        });
    }
}
/**
 * GET /api/interviews/questions/deep/:moduleId
 * Get specific Deep module questions
 */
async function getDeepModule(req, res) {
    try {
        const moduleId = String(req.params.moduleId);
        const module = await interviewService.getDeepModule(moduleId);
        res.json({
            success: true,
            data: module,
        });
    }
    catch (error) {
        console.error(`Error loading module ${req.params.moduleId}:`, error);
        res.status(404).json({
            success: false,
            error: {
                code: 'MODULE_NOT_FOUND',
                message: error.message,
            },
        });
    }
}
/**
 * POST /api/interviews/start
 * Start a new interview
 */
async function startInterview(req, res) {
    try {
        const userId = req.userId; // From auth middleware
        const { interviewType, selectedModules } = req.body;
        if (!interviewType || !['lite', 'deep'].includes(interviewType)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_INTERVIEW_TYPE',
                    message: 'Interview type must be "lite" or "deep"',
                },
            });
        }
        const interview = await interviewService.startInterview({
            userId,
            interviewType,
            selectedModules,
        });
        res.status(201).json({
            success: true,
            data: interview,
            message: 'Interview started successfully',
        });
    }
    catch (error) {
        console.error('Error starting interview:', error);
        if (error.message.includes('already has an in-progress interview')) {
            return res.status(409).json({
                success: false,
                error: {
                    code: 'INTERVIEW_IN_PROGRESS',
                    message: error.message,
                },
            });
        }
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERVIEW_START_ERROR',
                message: error.message,
            },
        });
    }
}
/**
 * PUT /api/interviews/:id/answer
 * Save an answer to the current interview
 */
async function saveAnswer(req, res) {
    try {
        const id = String(req.params.id);
        const { questionId, answer, moduleId, category } = req.body;
        if (!questionId || answer === undefined) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_REQUIRED_FIELDS',
                    message: 'questionId and answer are required',
                },
            });
        }
        const interview = await interviewService.saveAnswer(id, {
            questionId,
            answer,
            moduleId,
            category,
        });
        res.json({
            success: true,
            data: interview,
            message: 'Answer saved successfully',
        });
    }
    catch (error) {
        console.error('Error saving answer:', error);
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'INTERVIEW_NOT_FOUND',
                    message: error.message,
                },
            });
        }
        if (error.message.includes('not in progress')) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INTERVIEW_NOT_IN_PROGRESS',
                    message: error.message,
                },
            });
        }
        res.status(500).json({
            success: false,
            error: {
                code: 'ANSWER_SAVE_ERROR',
                message: error.message,
            },
        });
    }
}
/**
 * PUT /api/interviews/:id/position
 * Update current position in interview
 */
async function updatePosition(req, res) {
    try {
        const id = String(req.params.id);
        const { currentModule, currentQuestion } = req.body;
        if (!currentModule || currentQuestion === undefined) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_REQUIRED_FIELDS',
                    message: 'currentModule and currentQuestion are required',
                },
            });
        }
        const interview = await interviewService.updateInterviewPosition(id, currentModule, currentQuestion);
        res.json({
            success: true,
            data: interview,
            message: 'Position updated successfully',
        });
    }
    catch (error) {
        console.error('Error updating position:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'POSITION_UPDATE_ERROR',
                message: error.message,
            },
        });
    }
}
/**
 * GET /api/interviews/:id
 * Get interview status and progress
 */
async function getInterviewStatus(req, res) {
    try {
        const id = String(req.params.id);
        const status = await interviewService.getInterviewStatus(id);
        res.json({
            success: true,
            data: status,
        });
    }
    catch (error) {
        console.error('Error getting interview status:', error);
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'INTERVIEW_NOT_FOUND',
                    message: error.message,
                },
            });
        }
        res.status(500).json({
            success: false,
            error: {
                code: 'STATUS_GET_ERROR',
                message: error.message,
            },
        });
    }
}
/**
 * POST /api/interviews/:id/complete-module
 * Mark a module as complete
 */
async function completeModule(req, res) {
    try {
        const id = String(req.params.id);
        const { moduleId } = req.body;
        if (!moduleId) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_MODULE_ID',
                    message: 'moduleId is required',
                },
            });
        }
        const interview = await interviewService.completeModule(id, moduleId);
        res.json({
            success: true,
            data: interview,
            message: `Module ${moduleId} completed`,
        });
    }
    catch (error) {
        console.error('Error completing module:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'MODULE_COMPLETE_ERROR',
                message: error.message,
            },
        });
    }
}
/**
 * POST /api/interviews/:id/complete
 * Mark interview as complete
 */
async function completeInterview(req, res) {
    try {
        const id = String(req.params.id);
        const interview = await interviewService.completeInterview(id);
        res.json({
            success: true,
            data: interview,
            message: 'Interview completed successfully',
        });
    }
    catch (error) {
        console.error('Error completing interview:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERVIEW_COMPLETE_ERROR',
                message: error.message,
            },
        });
    }
}
/**
 * GET /api/interviews/my-interviews
 * Get current user's interviews
 */
async function getMyInterviews(req, res) {
    try {
        const userId = req.userId; // From auth middleware
        const interviews = await interviewService.getUserInterviews(userId);
        res.json({
            success: true,
            data: interviews,
        });
    }
    catch (error) {
        console.error('Error getting user interviews:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'GET_INTERVIEWS_ERROR',
                message: error.message,
            },
        });
    }
}
