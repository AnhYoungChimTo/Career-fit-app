"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const careers_controller_1 = require("../controllers/careers.controller");
const router = (0, express_1.Router)();
/**
 * GET /api/careers/stats
 * Get career statistics
 * Public endpoint - no auth required
 */
router.get('/stats', careers_controller_1.getCareerStats);
/**
 * GET /api/careers
 * Get all careers with optional filters
 * Public endpoint - no auth required (allows users to browse before registering)
 */
router.get('/', careers_controller_1.getAllCareers);
/**
 * GET /api/careers/:id
 * Get single career by ID
 * Public endpoint - no auth required
 */
router.get('/:id', careers_controller_1.getCareerById);
exports.default = router;
