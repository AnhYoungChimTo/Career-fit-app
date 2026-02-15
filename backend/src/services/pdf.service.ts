import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';

interface CareerMatch {
  careerId: string;
  careerTitle: string;
  careerCategory: string;
  fitScore: number;
  confidence: 'low' | 'medium' | 'high';
  explanation: string;
  strengths: string[];
  growthAreas: string[];
  roadmap: string;
}

interface MatchingResult {
  interviewId: string;
  interviewType: string;
  matches: CareerMatch[];
  analysisDate: Date;
  dataCompleteness: number;
}

/**
 * Generate a PDF report for career matching results
 */
export async function generateResultsPDF(
  results: MatchingResult,
  userEmail: string
): Promise<NodeJS.ReadableStream> {
  return new Promise((resolve, reject) => {
    try {
      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      // Create a stream to collect PDF data
      const stream = new PassThrough();
      doc.pipe(stream);

      // Add content to PDF
      addHeader(doc, results, userEmail);
      addSummary(doc, results);
      addCareerMatches(doc, results.matches);
      addFooter(doc);

      // Finalize PDF
      doc.end();

      resolve(stream);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Add header section
 */
function addHeader(doc: PDFKit.PDFDocument, results: MatchingResult, userEmail: string) {
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
function addSummary(doc: PDFKit.PDFDocument, results: MatchingResult) {
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
    .text(
      `Based on your ${analysisType} career assessment, we've identified ${matchCount} career ${matchCount === 1 ? 'path' : 'paths'} that align with your skills, values, and preferences. Each recommendation includes a detailed fit analysis, your key strengths, areas for growth, and a personalized 6-month roadmap to help you transition into the role.`
    );

  doc.moveDown(1.5);
}

/**
 * Add career matches section
 */
function addCareerMatches(doc: PDFKit.PDFDocument, matches: CareerMatch[]) {
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

    // Roadmap
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#8B5CF6')
      .text('🗺 6-Month Career Roadmap:');

    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#374151')
      .text(match.roadmap, { align: 'left', indent: 10 });

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
function addFooter(doc: PDFKit.PDFDocument) {
  const bottomY = 750;

  doc
    .fontSize(8)
    .font('Helvetica')
    .fillColor('#9CA3AF')
    .text(
      'Generated by Career Fit Analysis | Powered by AI-driven career matching',
      50,
      bottomY,
      { align: 'center' }
    );
}

/**
 * Helper function to capitalize first letter
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
