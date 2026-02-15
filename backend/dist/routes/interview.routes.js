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
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const interviewController = __importStar(require("../controllers/interview.controller"));
const router = (0, express_1.Router)();
// Public routes (questions)
router.get('/questions/lite', interviewController.getLiteQuestions);
router.get('/questions/deep/modules', interviewController.getDeepModulesMetadata);
router.get('/questions/deep/:moduleId', interviewController.getDeepModule);
// Protected routes (require authentication)
router.post('/start', auth_middleware_1.authMiddleware, interviewController.startInterview);
router.get('/my-interviews', auth_middleware_1.authMiddleware, interviewController.getMyInterviews);
router.get('/:id', auth_middleware_1.authMiddleware, interviewController.getInterviewStatus);
router.put('/:id/answer', auth_middleware_1.authMiddleware, interviewController.saveAnswer);
router.put('/:id/position', auth_middleware_1.authMiddleware, interviewController.updatePosition);
router.post('/:id/complete-module', auth_middleware_1.authMiddleware, interviewController.completeModule);
router.post('/:id/complete', auth_middleware_1.authMiddleware, interviewController.completeInterview);
exports.default = router;
