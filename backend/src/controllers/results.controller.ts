import { Request, Response } from 'express';
import * as matchingService from '../services/matching.service';
import * as pdfService from '../services/pdf.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/results/:interviewId
 * Get career matching results for a completed interview
 */
export async function getResults(req: Request, res: Response) {
  try {
    const interviewId = String(req.params.interviewId);

    // Generate matches
    const results = await matchingService.generateMatches(interviewId);

    res.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
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
export async function downloadPDF(req: Request, res: Response) {
  try {
    const interviewId = String(req.params.interviewId);
    const userId = (req as any).userId; // From auth middleware

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

    console.log(`🔄 Generating matches for PDF...`);
    // Generate matches
    const results = await matchingService.generateMatches(interviewId);
    console.log(`✅ Matches generated. Creating PDF with ${results.matches.length} matches...`);

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
  } catch (error: any) {
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
