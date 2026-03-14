import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/reviews
export async function createReview(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { sessionId, revieweeId, reviewerRole, rating, body, tags } = req.body;

    if (!sessionId || !revieweeId || !reviewerRole || rating === undefined || !body) {
      return res.status(400).json({ data: null, error: 'sessionId, revieweeId, reviewerRole, rating, and body are required.' });
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ data: null, error: 'rating must be a number between 1 and 5.' });
    }

    const allowedRoles = ['mentor', 'mentee'];
    if (!allowedRoles.includes(reviewerRole)) {
      return res.status(400).json({ data: null, error: 'reviewerRole must be "mentor" or "mentee".' });
    }

    // Verify the session exists and user is a participant
    const session = await prisma.mentorSession.findUnique({
      where: { id: sessionId },
      include: {
        connection: { include: { mentor: true } },
      },
    });

    if (!session) {
      return res.status(404).json({ data: null, error: 'Session not found.' });
    }

    const isMentorUser = session.connection.mentor.userId === userId;
    const isMenteeUser = session.connection.menteeId === userId;
    if (!isMentorUser && !isMenteeUser) {
      return res.status(403).json({ data: null, error: 'Not authorized to review this session.' });
    }

    // Check if reviewer already reviewed this session
    const existingReview = await prisma.review.findUnique({
      where: { sessionId_reviewerId: { sessionId, reviewerId: userId } },
    });
    if (existingReview) {
      return res.status(409).json({ data: null, error: 'You have already reviewed this session.' });
    }

    // mentor → mentee reviews are private, mentee → mentor reviews are public
    const isPublic = reviewerRole === 'mentee';

    // Set expiresAt to 14 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const review = await prisma.review.create({
      data: {
        sessionId,
        reviewerId: userId,
        revieweeId,
        reviewerRole,
        rating,
        body,
        tags: tags ?? [],
        isPublic,
        expiresAt,
      },
      include: {
        reviewer: { select: { id: true, name: true } },
        reviewee: { select: { id: true, name: true } },
      },
    });

    return res.status(201).json({ data: review, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// GET /api/reviews
export async function getReviews(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { mentor_id, mentee_id } = req.query as Record<string, string>;

    if (!mentor_id && !mentee_id) {
      return res.status(400).json({ data: null, error: 'Either mentor_id or mentee_id query parameter is required.' });
    }

    if (mentor_id) {
      // Get the mentor's userId for reviews lookup
      const mentor = await prisma.mentor.findUnique({ where: { id: mentor_id } });
      if (!mentor) {
        return res.status(404).json({ data: null, error: 'Mentor not found.' });
      }

      const reviews = await prisma.review.findMany({
        where: {
          revieweeId: mentor.userId,
          isPublic: true,
        },
        include: {
          reviewer: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({ data: reviews, error: null });
    }

    if (mentee_id) {
      // Only the mentee themselves can see their private reviews
      if (!userId) {
        return res.status(401).json({ data: null, error: 'Authentication required to view mentee reviews.' });
      }
      if (userId !== mentee_id) {
        return res.status(403).json({ data: null, error: 'You can only view your own mentee reviews.' });
      }

      const reviews = await prisma.review.findMany({
        where: {
          revieweeId: mentee_id,
          isPublic: false,
        },
        include: {
          reviewer: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({ data: reviews, error: null });
    }
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// PATCH /api/reviews/:id/reply
export async function replyToReview(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ data: null, error: 'reply is required.' });
    }

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return res.status(404).json({ data: null, error: 'Review not found.' });
    }

    // Only the reviewee (mentor) can reply
    if (review.revieweeId !== userId) {
      return res.status(403).json({ data: null, error: 'Only the reviewee can reply to this review.' });
    }

    const updated = await prisma.review.update({
      where: { id: id },
      data: { mentorReply: reply },
    });

    return res.status(200).json({ data: updated, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}
