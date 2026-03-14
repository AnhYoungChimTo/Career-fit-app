import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/connections
export async function createConnection(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { mentorId, menteeId, introMessage, initiatedBy } = req.body;

    if (!mentorId || !menteeId) {
      return res.status(400).json({ data: null, error: 'mentorId and menteeId are required.' });
    }

    // Verify mentor exists
    const mentor = await prisma.mentor.findUnique({ where: { id: mentorId } });
    if (!mentor) {
      return res.status(404).json({ data: null, error: 'Mentor not found.' });
    }

    // Check if connection already exists
    const existingConnection = await prisma.mentorConnection.findUnique({
      where: { mentorId_menteeId: { mentorId, menteeId } },
    });
    if (existingConnection) {
      return res.status(409).json({ data: null, error: 'Connection already exists between this mentor and mentee.' });
    }

    // Enforce maxMentees limit if set
    if (mentor.maxMentees !== null) {
      const activeCount = await prisma.mentorConnection.count({
        where: { mentorId, status: 'active' },
      });
      if (activeCount >= mentor.maxMentees) {
        return res.status(403).json({ data: null, error: 'Mentor has reached their maximum mentee capacity.' });
      }
    }

    const connection = await prisma.mentorConnection.create({
      data: {
        mentorId,
        menteeId,
        introMessage: introMessage ?? null,
        initiatedBy: initiatedBy ?? null,
        status: 'pending',
      },
      include: {
        mentor: { include: { user: { select: { id: true, name: true, email: true } } } },
        mentee: { select: { id: true, name: true, email: true } },
      },
    });

    // Determine who receives the notification (the other party)
    const receiverId = initiatedBy === 'mentor' ? menteeId : mentor.userId;

    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'connection_request',
        title: 'New connection request',
        body: initiatedBy === 'mentor'
          ? 'A mentor has invited you to connect.'
          : 'A mentee has requested to connect with you.',
        data: { connectionId: connection.id },
      },
    });

    return res.status(201).json({ data: connection, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// PATCH /api/connections/:id/accept
export async function acceptConnection(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;

    const connection = await prisma.mentorConnection.findUnique({
      where: { id },
      include: { mentor: { include: { user: true } } },
    });

    if (!connection) {
      return res.status(404).json({ data: null, error: 'Connection not found.' });
    }

    // Only the mentor or mentee can accept
    const isMentor = connection.mentor.userId === userId;
    const isMentee = connection.menteeId === userId;
    if (!isMentor && !isMentee) {
      return res.status(403).json({ data: null, error: 'Not authorized to accept this connection.' });
    }

    const updated = await prisma.mentorConnection.update({
      where: { id },
      data: {
        status: 'active',
        acceptedAt: new Date(),
      },
      include: {
        mentor: { include: { user: { select: { id: true, name: true } } } },
        mentee: { select: { id: true, name: true } },
      },
    });

    // Create Roadmap for this connection
    const roadmap = await prisma.roadmap.create({
      data: {
        connectionId: id,
        title: 'My Mentorship Roadmap',
      },
    });

    // Notify both parties
    await prisma.notification.createMany({
      data: [
        {
          userId: connection.mentor.userId,
          type: 'connection_accepted',
          title: 'Connection accepted',
          body: 'Your mentorship connection has been accepted.',
          data: { connectionId: id, roadmapId: roadmap.id },
        },
        {
          userId: connection.menteeId,
          type: 'connection_accepted',
          title: 'Connection accepted',
          body: 'Your mentorship connection has been accepted.',
          data: { connectionId: id, roadmapId: roadmap.id },
        },
      ],
    });

    return res.status(200).json({ data: { ...updated, roadmap }, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// PATCH /api/connections/:id/reject
export async function rejectConnection(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;
    const { declineReason } = req.body;

    const connection = await prisma.mentorConnection.findUnique({
      where: { id },
      include: { mentor: { include: { user: true } } },
    });

    if (!connection) {
      return res.status(404).json({ data: null, error: 'Connection not found.' });
    }

    const isMentor = connection.mentor.userId === userId;
    const isMentee = connection.menteeId === userId;
    if (!isMentor && !isMentee) {
      return res.status(403).json({ data: null, error: 'Not authorized to reject this connection.' });
    }

    const updated = await prisma.mentorConnection.update({
      where: { id },
      data: {
        status: 'declined',
        declineReason: declineReason ?? null,
      },
    });

    // Notify the requester
    const notifyUserId = isMentor ? connection.menteeId : connection.mentor.userId;

    await prisma.notification.create({
      data: {
        userId: notifyUserId,
        type: 'connection_declined',
        title: 'Connection request declined',
        body: declineReason ?? 'Your connection request was declined.',
        data: { connectionId: id },
      },
    });

    return res.status(200).json({ data: updated, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// GET /api/connections
export async function listConnections(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    // Find mentor record for this user (if any)
    const mentor = await prisma.mentor.findUnique({ where: { userId } });

    const conditions: any[] = [{ menteeId: userId }];
    if (mentor) {
      conditions.push({ mentorId: mentor.id });
    }

    const connections = await prisma.mentorConnection.findMany({
      where: { OR: conditions },
      include: {
        mentor: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        mentee: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true,
          },
        },
        roadmap: { include: { milestones: { orderBy: { sortOrder: 'asc' } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ data: connections, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// GET /api/connections/:id
export async function getConnection(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;

    const connection = await prisma.mentorConnection.findUnique({
      where: { id },
      include: {
        mentor: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            credentials: true,
          },
        },
        mentee: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: { include: { experiences: true, educationRecords: true } },
          },
        },
        roadmap: { include: { milestones: { orderBy: { sortOrder: 'asc' } } } },
        sessions: { orderBy: { scheduledAt: 'asc' } },
      },
    });

    if (!connection) {
      return res.status(404).json({ data: null, error: 'Connection not found.' });
    }

    // Verify user has access
    const isMentor = connection.mentor.userId === userId;
    const isMentee = connection.menteeId === userId;
    if (!isMentor && !isMentee) {
      return res.status(403).json({ data: null, error: 'Not authorized to view this connection.' });
    }

    return res.status(200).json({ data: connection, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// DELETE /api/connections/:id
export async function endConnection(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;

    const connection = await prisma.mentorConnection.findUnique({
      where: { id },
      include: { mentor: { include: { user: true } } },
    });

    if (!connection) {
      return res.status(404).json({ data: null, error: 'Connection not found.' });
    }

    const isMentor = connection.mentor.userId === userId;
    const isMentee = connection.menteeId === userId;
    if (!isMentor && !isMentee) {
      return res.status(403).json({ data: null, error: 'Not authorized to end this connection.' });
    }

    const updated = await prisma.mentorConnection.update({
      where: { id },
      data: {
        status: 'ended',
        endedAt: new Date(),
      },
    });

    return res.status(200).json({ data: updated, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}
