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
const profileController = __importStar(require("../controllers/profile.controller"));
const router = (0, express_1.Router)();
// Profile
router.get('/me', auth_middleware_1.authMiddleware, profileController.getMyProfile);
router.get('/:userId', auth_middleware_1.optionalAuthMiddleware, profileController.getProfile);
router.post('/', auth_middleware_1.authMiddleware, profileController.upsertProfile);
// Skills
router.post('/skills', auth_middleware_1.authMiddleware, profileController.addSkill);
router.put('/skills/:skillId', auth_middleware_1.authMiddleware, profileController.updateSkill);
router.delete('/skills/:skillId', auth_middleware_1.authMiddleware, profileController.deleteSkill);
// Experience
router.post('/experience', auth_middleware_1.authMiddleware, profileController.addExperience);
router.put('/experience/:expId', auth_middleware_1.authMiddleware, profileController.updateExperience);
router.delete('/experience/:expId', auth_middleware_1.authMiddleware, profileController.deleteExperience);
// Education
router.post('/education', auth_middleware_1.authMiddleware, profileController.addEducation);
router.put('/education/:eduId', auth_middleware_1.authMiddleware, profileController.updateEducation);
router.delete('/education/:eduId', auth_middleware_1.authMiddleware, profileController.deleteEducation);
// Portfolio
router.post('/portfolio', auth_middleware_1.authMiddleware, profileController.addPortfolioItem);
router.put('/portfolio/:itemId', auth_middleware_1.authMiddleware, profileController.updatePortfolioItem);
router.delete('/portfolio/:itemId', auth_middleware_1.authMiddleware, profileController.deletePortfolioItem);
exports.default = router;
