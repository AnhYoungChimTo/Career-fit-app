"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResultsPDF = generateResultsPDF;
const pdfkit_1 = __importDefault(require("pdfkit"));
/**
 * Generate a PDF report for career matching results
 * Returns a Buffer instead of a stream for more reliable HTTP responses
 */
async function generateResultsPDF(results, userEmail) {
    return new Promise((resolve, reject) => {
        try {
            // Create PDF document
            const doc = new pdfkit_1.default({
                size: 'A4',
                margins: { top: 50, bottom: 50, left: 50, right: 50 },
            });
            // Collect PDF data in chunks
            const chunks = [];
            doc.on('data', (chunk) => {
                chunks.push(chunk);
            });
            doc.on('end', () => {
                // Combine all chunks into a single buffer
                const pdfBuffer = Buffer.concat(chunks);
                console.log(`✅ PDF buffer created: ${pdfBuffer.length} bytes`);
                resolve(pdfBuffer);
            });
            doc.on('error', (error) => {
                console.error('❌ PDF generation error:', error);
                reject(error);
            });
            // Add content to PDF
            addHeader(doc, results, userEmail);
            addSummary(doc, results);
            addCareerMatches(doc, results.matches);
            addFooter(doc);
            // Finalize PDF
            doc.end();
        }
        catch (error) {
            console.error('❌ PDF service error:', error);
            reject(error);
        }
    });
}
/**
 * Add header section
 */
function addHeader(doc, results, userEmail) {
    // Title
    doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .fillColor('#4F46E5')
        .text('Career Fit Analysis Report', { align: 'center' });
    doc.moveDown(0.5);
    // Subtitle with version badge
    const versionBadge = results.interviewType === 'lite'
        ? '⚡ Quick Analysis'
        : '🎯 Comprehensive Analysis';
    doc
        .fontSize(12)
        .font('Helvetica')
        .fillColor('#6B7280')
        .text(versionBadge, { align: 'center' });
    doc.moveDown(1);
    // User info and analysis date
    doc
        .fontSize(10)
        .fillColor('#374151')
        .text(`Generated for: ${userEmail}`, { align: 'left' });
    doc
        .text(`Analysis Date: ${new Date(results.analysisDate).toLocaleDateString()}`, { align: 'left' });
    doc
        .text(`Data Completeness: ${results.dataCompleteness}%`, { align: 'left' });
    // Horizontal line
    doc
        .moveDown(1)
        .strokeColor('#E5E7EB')
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke();
    doc.moveDown(1);
}
/**
 * Add summary section
 */
function addSummary(doc, results) {
    doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .fillColor('#1F2937')
        .text('Executive Summary');
    doc.moveDown(0.5);
    const matchCount = results.matches.length;
    const analysisType = results.interviewType === 'lite' ? 'quick' : 'comprehensive';
    doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#4B5563')
        .text(`Based on your ${analysisType} career assessment, we've identified ${matchCount} career ${matchCount === 1 ? 'path' : 'paths'} that align with your skills, values, and preferences. Each recommendation includes a detailed fit analysis, your key strengths, areas for growth, and a personalized 6-month roadmap to help you transition into the role.`);
    doc.moveDown(1.5);
}
/**
 * Add career matches section
 */
function addCareerMatches(doc, matches) {
    matches.forEach((match, index) => {
        // Check if we need a new page
        if (doc.y > 650) {
            doc.addPage();
        }
        // Career title with ranking
        doc
            .fontSize(14)
            .font('Helvetica-Bold')
            .fillColor('#1F2937')
            .text(`${index + 1}. ${match.careerTitle}`, { underline: true });
        doc.moveDown(0.3);
        // Category and fit score
        doc
            .fontSize(10)
            .font('Helvetica')
            .fillColor('#6B7280')
            .text(`Category: ${match.careerCategory}`);
        const fitScoreColor = match.fitScore >= 80 ? '#10B981' : match.fitScore >= 60 ? '#3B82F6' : '#F59E0B';
        doc
            .fillColor(fitScoreColor)
            .font('Helvetica-Bold')
            .text(`Fit Score: ${match.fitScore}% • Confidence: ${capitalizeFirst(match.confidence)}`);
        doc.moveDown(0.5);
        // Explanation
        doc
            .fontSize(10)
            .font('Helvetica')
            .fillColor('#374151')
            .text(match.explanation, { align: 'justify' });
        doc.moveDown(0.5);
        // Strengths
        doc
            .fontSize(11)
            .font('Helvetica-Bold')
            .fillColor('#10B981')
            .text('✓ Key Strengths:');
        doc.fontSize(9).font('Helvetica').fillColor('#374151');
        match.strengths.forEach((strength) => {
            doc.text(`  • ${strength}`, { indent: 10 });
        });
        doc.moveDown(0.5);
        // Growth Areas
        doc
            .fontSize(11)
            .font('Helvetica-Bold')
            .fillColor('#3B82F6')
            .text('⚠ Growth Areas:');
        doc.fontSize(9).font('Helvetica').fillColor('#374151');
        match.growthAreas.forEach((area) => {
            doc.text(`  • ${area}`, { indent: 10 });
        });
        doc.moveDown(0.5);
        // Roadmap Summary
        doc
            .fontSize(11)
            .font('Helvetica-Bold')
            .fillColor('#8B5CF6')
            .text('🗺 Career Roadmap Summary:');
        doc
            .fontSize(9)
            .font('Helvetica')
            .fillColor('#374151')
            .text(match.roadmap, { align: 'left', indent: 10 });
        doc.moveDown(0.5);
        // Check if we need a new page before detailed sections
        if (doc.y > 600) {
            doc.addPage();
        }
        // Detailed Analysis (only if available)
        if (match.detailedAnalysis) {
            doc
                .fontSize(11)
                .font('Helvetica-Bold')
                .fillColor('#9333EA')
                .text('📊 In-Depth Analysis:');
            doc
                .fontSize(9)
                .font('Helvetica')
                .fillColor('#374151')
                .text(match.detailedAnalysis, { align: 'justify', indent: 10 });
            doc.moveDown(0.5);
        }
        // Check if we need a new page
        if (doc.y > 650) {
            doc.addPage();
        }
        // Career Pattern (only if available)
        if (match.careerPattern) {
            doc
                .fontSize(11)
                .font('Helvetica-Bold')
                .fillColor('#4F46E5')
                .text('🎯 Career Pattern:');
            doc.moveDown(0.3);
            if (match.careerPattern.progression) {
                doc
                    .fontSize(10)
                    .font('Helvetica-Bold')
                    .fillColor('#6366F1')
                    .text('Career Progression:', { indent: 10 });
                doc
                    .fontSize(9)
                    .font('Helvetica')
                    .fillColor('#374151')
                    .text(match.careerPattern.progression, { indent: 15 });
                doc.moveDown(0.3);
            }
            if (match.careerPattern.dailyResponsibilities) {
                doc
                    .fontSize(10)
                    .font('Helvetica-Bold')
                    .fillColor('#6366F1')
                    .text('Daily Responsibilities:', { indent: 10 });
                doc
                    .fontSize(9)
                    .font('Helvetica')
                    .fillColor('#374151')
                    .text(match.careerPattern.dailyResponsibilities, { indent: 15 });
                doc.moveDown(0.3);
            }
            if (match.careerPattern.industryOutlook) {
                doc
                    .fontSize(10)
                    .font('Helvetica-Bold')
                    .fillColor('#6366F1')
                    .text('Industry Outlook (Vietnam):', { indent: 10 });
                doc
                    .fontSize(9)
                    .font('Helvetica')
                    .fillColor('#374151')
                    .text(match.careerPattern.industryOutlook, { indent: 15 });
                doc.moveDown(0.3);
            }
            doc.moveDown(0.2);
        }
        // Check if we need a new page
        if (doc.y > 650) {
            doc.addPage();
        }
        // Salary Information (only if available)
        if (match.salaryInfo) {
            doc
                .fontSize(11)
                .font('Helvetica-Bold')
                .fillColor('#10B981')
                .text('💰 Salary Information (Vietnam Market):');
            doc.moveDown(0.3);
            doc.fontSize(9).font('Helvetica').fillColor('#374151');
            if (match.salaryInfo.entryLevel) {
                doc.text(`Entry Level: ${match.salaryInfo.entryLevel.range} (${match.salaryInfo.entryLevel.experience})`, { indent: 10 });
            }
            if (match.salaryInfo.midLevel) {
                doc.text(`Mid Level: ${match.salaryInfo.midLevel.range} (${match.salaryInfo.midLevel.experience})`, { indent: 10 });
            }
            if (match.salaryInfo.seniorLevel) {
                doc.text(`Senior Level: ${match.salaryInfo.seniorLevel.range} (${match.salaryInfo.seniorLevel.experience})`, { indent: 10 });
            }
            doc.moveDown(0.5);
        }
        // Skill Stack (only if available)
        if (match.skillStack && match.skillStack.length > 0) {
            doc
                .fontSize(11)
                .font('Helvetica-Bold')
                .fillColor('#3B82F6')
                .text('🎓 Skills to Acquire:');
            doc.fontSize(9).font('Helvetica').fillColor('#374151');
            match.skillStack.forEach((skill) => {
                doc.text(`  • ${skill}`, { indent: 10 });
            });
            doc.moveDown(0.5);
        }
        // Check if we need a new page
        if (doc.y > 650) {
            doc.addPage();
        }
        // 6-Month Learning Plan (only if available)
        if (match.learningPlan) {
            doc
                .fontSize(11)
                .font('Helvetica-Bold')
                .fillColor('#F97316')
                .text('📅 6-Month Learning & Development Plan:');
            doc.moveDown(0.3);
            const learningPlanEntries = Object.entries(match.learningPlan);
            learningPlanEntries.forEach(([month, plan], i) => {
                if (plan) {
                    doc
                        .fontSize(10)
                        .font('Helvetica-Bold')
                        .fillColor('#FB923C')
                        .text(`Month ${i + 1}:`, { indent: 10 });
                    doc
                        .fontSize(9)
                        .font('Helvetica')
                        .fillColor('#374151')
                        .text(plan, { indent: 15 });
                    doc.moveDown(0.3);
                }
            });
        }
        // Separator line
        doc.moveDown(1);
        doc
            .strokeColor('#E5E7EB')
            .lineWidth(0.5)
            .moveTo(50, doc.y)
            .lineTo(545, doc.y)
            .stroke();
        doc.moveDown(1);
    });
}
/**
 * Add footer
 */
function addFooter(doc) {
    const bottomY = 750;
    doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#9CA3AF')
        .text('Generated by Career Fit Analysis | Powered by AI-driven career matching', 50, bottomY, { align: 'center' });
}
/**
 * Helper function to capitalize first letter
 */
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
