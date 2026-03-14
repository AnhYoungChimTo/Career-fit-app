import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/mentor-sessions
export async function createSession(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { connectionId, title, scheduledAt, durationMins, meetingUrl, agenda } = req.body;

    if (!connectionId || !scheduledAt) {
      return res.status(400).json({ data: null, error: 'connectionId and scheduledAt are required.' });
    }

    const connection = await prisma.mentorConnection.findUnique({
      where: { id: connectionId },
      include: {
        mentor: true,
      },
    });

    if (!connection) {
      return res.status(404).json({ data: null, error: 'Connection not found.' });
    }

    const isMentor = connection.mentor.userId === userId;
    const isMentee = connection.menteeId === userId;
    if (!isMentor && !isMentee) {
      return res.status(403).json({ data: null, error: 'Not authorized to create a session for this connection.' });
    }

    if (connection.status !== 'active') {
      return res.status(400).json({ data: null, error: 'Sessions can only be created for active connections.' });
    }

    // Calculate pricing
    const priceUsd = Number(connection.mentor.sessionPriceUsd) || 0;
    const feeRate = connection.mentor.isPremium ? 0.15 : 0.20;
    const platformFee = priceUsd * feeRate;
    const netEarnings = priceUsd - platformFee;

    const session = await prisma.mentorSession.create({
      data: {
        connectionId,
        title: title ?? null,
        scheduledAt: new Date(scheduledAt),
        durationMins: durationMins ?? connection.mentor.sessionDuration,
        meetingUrl: meetingUrl ?? connection.mentor.externalMeetUrl ?? null,
        agenda: agenda ?? null,
        status: 'confirmed',
        priceUsd,
        platformFee,
        netEarnings,
      },
      include: {
        connection: {
          include: {
            mentor: { select: { id: true, userId: true, displayName: true } },
            mentee: { select: { id: true, name: true } },
          },
        },
      },
    });

    // Notify both parties
    await prisma.notification.createMany({
      data: [
        {
          userId: connection.mentor.userId,
          type: 'session_scheduled',
          title: 'Session scheduled',
          body: `A new session has been scheduled for ${new Date(scheduledAt).toLocaleString()}.`,
          data: { sessionId: session.id, connectionId },
        },
        {
          userId: connection.menteeId,
          type: 'session_scheduled',
          title: 'Session scheduled',
          body: `A new session has been scheduled for ${new Date(scheduledAt).toLocaleString()}.`,
          data: { sessionId: session.id, connectionId },
        },
      ],
    });

    return res.status(201).json({ data: session, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// GET /api/mentor-sessions
export async function listSessions(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    // Find mentor record for this user
    const mentor = await prisma.mentor.findUnique({ where: { userId } });

    const connectionConditions: any[] = [{ menteeId: userId }];
    if (mentor) {
      connectionConditions.push({ mentorId: mentor.id });
    }

    const connections = await prisma.mentorConnection.findMany({
      where: { OR: connectionConditions },
      select: { id: true },
    });

    const connectionIds = connections.map((c) => c.id);

    const sessions = await prisma.mentorSession.findMany({
      where: { connectionId: { in: connectionIds } },
      include: {
        connection: {
          include: {
            mentor: { select: { id: true, userId: true, displayName: true, username: true } },
            mentee: { select: { id: true, name: true, email: true } },
          },
        },
        notes: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return res.status(200).json({ data: sessions, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// GET /api/mentor-sessions/:id
export async function getSession(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;

    const session = await prisma.mentorSession.findUnique({
      where: { id },
      include: {
        connection: {
          include: {
            mentor: { include: { user: { select: { id: true, name: true } } } },
            mentee: { select: { id: true, name: true, email: true } },
          },
        },
        notes: true,
        reviews: true,
      },
    });

    if (!session) {
      return res.status(404).json({ data: null, error: 'Session not found.' });
    }

    const isMentor = session.connection.mentor.userId === userId;
    const isMentee = session.connection.menteeId === userId;
    if (!isMentor && !isMentee) {
      return res.status(403).json({ data: null, error: 'Not authorized to view this session.' });
    }

    return res.status(200).json({ data: session, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// PATCH /api/mentor-sessions/:id
export async function updateSession(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;

    const session = await prisma.mentorSession.findUnique({
      where: { id },
      include: {
        connection: { include: { mentor: { include: { user: true } } } },
      },
    });

    if (!session) {
      return res.status(404).json({ data: null, error: 'Session not found.' });
    }

    const isMentor = session.connection.mentor.userId === userId;
    const isMentee = session.connection.menteeId === userId;
    if (!isMentor && !isMentee) {
      return res.status(403).json({ data: null, error: 'Not authorized to update this session.' });
    }

    const { id: _id, connectionId: _cid, ...updateData } = req.body;

    if (updateData.scheduledAt) {
      updateData.scheduledAt = new Date(updateData.scheduledAt);
    }

    const wasCompleted = session.status !== 'completed' && updateData.status === 'completed';

    const updated = await prisma.mentorSession.update({
      where: { id },
      data: updateData,
    });

    // If session just completed, create review prompts for both parties
    if (wasCompleted) {
      await prisma.notification.createMany({
        data: [
          {
            userId: session.connection.mentor.userId,
            type: 'review_prompt',
            title: 'Leave a review',
            body: 'Your session is complete. Please leave a review for your mentee.',
            data: { sessionId: id, role: 'mentor' },
          },
          {
            userId: session.connection.menteeId,
            type: 'review_prompt',
            title: 'Leave a review',
            body: 'Your session is complete. Please leave a review for your mentor.',
            data: { sessionId: id, role: 'mentee' },
          },
        ],
      });
    }

    return res.status(200).json({ data: updated, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// DELETE /api/mentor-sessions/:id
export async function cancelSession(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;

    const session = await prisma.mentorSession.findUnique({
      where: { id },
      include: {
        connection: { include: { mentor: { include: { user: true } } } },
      },
    });

    if (!session) {
      return res.status(404).json({ data: null, error: 'Session not found.' });
    }

    const isMentor = session.connection.mentor.userId === userId;
    const isMentee = session.connection.menteeId === userId;
    if (!isMentor && !isMentee) {
      return res.status(403).json({ data: null, error: 'Not authorized to cancel this session.' });
    }

    const updated = await prisma.mentorSession.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    return res.status(200).json({ data: updated, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// GET /api/mentor-sessions/:id/notes
export async function getSessionNotes(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;

    const session = await prisma.mentorSession.findUnique({
      where: { id },
      include: {
        connection: { include: { mentor: { include: { user: true } } } },
        notes: true,
      },
    });

    if (!session) {
      return res.status(404).json({ data: null, error: 'Session not found.' });
    }

    const isMentor = session.connection.mentor.userId === userId;
    const isMentee = session.connection.menteeId === userId;
    if (!isMentor && !isMentee) {
      return res.status(403).json({ data: null, error: 'Not authorized to view notes for this session.' });
    }

    return res.status(200).json({ data: session.notes ?? null, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// PUT /api/mentor-sessions/:id/notes
export async function upsertSessionNotes(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;
    const { content } = req.body;

    const session = await prisma.mentorSession.findUnique({
      where: { id },
      include: {
        connection: { include: { mentor: { include: { user: true } } } },
      },
    });

    if (!session) {
      return res.status(404).json({ data: null, error: 'Session not found.' });
    }

    const isMentor = session.connection.mentor.userId === userId;
    const isMentee = session.connection.menteeId === userId;
    if (!isMentor && !isMentee) {
      return res.status(403).json({ data: null, error: 'Not authorized to update notes for this session.' });
    }

    const notes = await prisma.sessionNote.upsert({
      where: { sessionId: id },
      update: {
        content: content ?? null,
        updatedBy: userId,
      },
      create: {
        sessionId: id,
        content: content ?? null,
        updatedBy: userId,
      },
    });

    return res.status(200).json({ data: notes, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}
