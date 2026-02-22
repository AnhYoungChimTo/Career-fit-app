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
exports.getResults = getResults;
exports.downloadPDF = downloadPDF;
const matchingService = __importStar(require("../services/matching.service"));
const pdfService = __importStar(require("../services/pdf.service"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * GET /api/results/:interviewId
 * Get career matching results for a completed interview.
 * Uses cached results from the Result table if available (zero API calls on review).
 * Only calls GPT on first-time generation, then saves for future retrieval.
 */
async function getResults(req, res) {
    try {
        const interviewId = String(req.params.interviewId);
        // Step 1: Check if results already exist in the database (cached from first generation)
        const existingResult = await prisma.result.findFirst({
            where: { interviewId },
            orderBy: { generatedAt: 'desc' },
        });
        if (existingResult) {
            console.log(`✅ Returning cached results for interview: ${interviewId} (zero API calls)`);
            const cachedMatches = existingResult.careerMatches;
            return res.json({
                success: true,
                data: {
                    interviewId,
                    interviewType: cachedMatches.interviewType || 'deep',
                    matches: cachedMatches.matches || cachedMatches,
                    analysisDate: existingResult.generatedAt,
                    dataCompleteness: cachedMatches.dataCompleteness || 100,
                },
            });
        }
        // Step 2: No cached result — generate fresh matches (calls GPT API)
        console.log(`🔄 No cached results found. Generating fresh results for interview: ${interviewId}`);
        const results = await matchingService.generateMatches(interviewId);
        // Step 3: Save the full result to the database for future retrieval (zero API calls next time)
        const topMatch = results.matches[0];
        await prisma.result.create({
            data: {
                interviewId,
                aScore: topMatch ? topMatch.fitScore : 0,
                a1Score: 0,
                a2Score: 0,
                a3Score: 0,
                confidenceLevel: topMatch ? topMatch.confidence : 'low',
                careerMatches: {
                    interviewType: results.interviewType,
                    matches: results.matches,
                    dataCompleteness: results.dataCompleteness,
                },
                topCareer: topMatch ? topMatch.careerTitle : 'Unknown',
                topFitScore: topMatch ? topMatch.fitScore : 0,
            },
        });
        console.log(`💾 Saved results to database for future review (interview: ${interviewId})`);
        res.json({
            success: true,
            data: results,
        });
    }
    catch (error) {
        console.error('Error generating results:', error);
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'INTERVIEW_NOT_FOUND',
                    message: error.message,
                },
            });
        }
        if (error.message.includes('not completed')) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INTERVIEW_NOT_COMPLETED',
                    message: error.message,
                },
            });
        }
        res.status(500).json({
            success: false,
            error: {
                code: 'RESULTS_GENERATION_ERROR',
                message: error.message,
            },
        });
    }
}
/**
 * GET /api/results/:interviewId/pdf
 * Download PDF report for career matching results
 */
async function downloadPDF(req, res) {
    try {
        const interviewId = String(req.params.interviewId);
        const userId = req.userId; // From auth middleware
        console.log(`📄 PDF download requested for interview: ${interviewId}`);
        // Get interview to retrieve user email
        const interview = await prisma.interview.findUnique({
            where: { id: interviewId },
            include: { user: true },
        });
        if (!interview) {
            console.error(`❌ Interview not found: ${interviewId}`);
            return res.status(404).json({
                success: false,
                error: {
                    code: 'INTERVIEW_NOT_FOUND',
                    message: 'Interview not found',
                },
            });
        }
        // Verify ownership
        if (interview.userId !== userId) {
            console.error(`❌ Forbidden access to interview: ${interviewId}`);
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'You do not have access to this interview',
                },
            });
        }
        // Check for cached results first (avoid re-calling GPT API)
        let results;
        const existingResult = await prisma.result.findFirst({
            where: { interviewId },
            orderBy: { generatedAt: 'desc' },
        });
        if (existingResult) {
            console.log(`✅ Using cached results for PDF (zero API calls)`);
            const cachedMatches = existingResult.careerMatches;
            results = {
                interviewId,
                interviewType: cachedMatches.interviewType || interview.interviewType,
                matches: cachedMatches.matches || cachedMatches,
                analysisDate: existingResult.generatedAt,
                dataCompleteness: cachedMatches.dataCompleteness || 100,
            };
        }
        else {
            console.log(`🔄 No cached results. Generating matches for PDF...`);
            results = await matchingService.generateMatches(interviewId);
            // Save for future use
            const topMatch = results.matches[0];
            await prisma.result.create({
                data: {
                    interviewId,
                    aScore: topMatch ? topMatch.fitScore : 0,
                    a1Score: 0,
                    a2Score: 0,
                    a3Score: 0,
                    confidenceLevel: topMatch ? topMatch.confidence : 'low',
                    careerMatches: {
                        interviewType: results.interviewType,
                        matches: results.matches,
                        dataCompleteness: results.dataCompleteness,
                    },
                    topCareer: topMatch ? topMatch.careerTitle : 'Unknown',
                    topFitScore: topMatch ? topMatch.fitScore : 0,
                },
            });
            console.log(`💾 Saved results to database for future use`);
        }
        console.log(`✅ Results ready. Creating PDF with ${results.matches.length} matches...`);
        // Generate PDF buffer
        const pdfBuffer = await pdfService.generateResultsPDF(results, interview.user.email);
        console.log(`✅ PDF buffer created: ${pdfBuffer.length} bytes. Sending to client...`);
        // Set response headers for PDF download
        const filename = `career-fit-report-${new Date().toISOString().split('T')[0]}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.length.toString());
        // Send PDF buffer
        res.send(pdfBuffer);
        console.log(`✅ PDF sent successfully (${pdfBuffer.length} bytes)`);
    }
    catch (error) {
        console.error('❌ Error generating PDF:', error);
        console.error('Stack:', error.stack);
        // Check if headers already sent
        if (res.headersSent) {
            console.error('⚠️ Headers already sent, cannot send error response');
            return;
        }
        if (error.message && error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'INTERVIEW_NOT_FOUND',
                    message: error.message,
                },
            });
        }
        if (error.message && error.message.includes('not completed')) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INTERVIEW_NOT_COMPLETED',
                    message: error.message,
                },
            });
        }
        res.status(500).json({
            success: false,
            error: {
                code: 'PDF_GENERATION_ERROR',
                message: error.message || 'Unknown error generating PDF',
            },
        });
    }
}
