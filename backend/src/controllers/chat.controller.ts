import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/chat/:connectionId
export async function getMessages(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const connectionId = req.params.connectionId as string;

    // Verify connection exists and user has access
    const connection = await prisma.mentorConnection.findUnique({
      where: { id: connectionId },
      include: { mentor: { include: { user: true } } },
    });

    if (!connection) {
      return res.status(404).json({ data: null, error: 'Connection not found.' });
    }

    const isMentor = connection.mentor.userId === userId;
    const isMentee = connection.menteeId === userId;
    if (!isMentor && !isMentee) {
      return res.status(403).json({ data: null, error: 'Not authorized to view messages for this connection.' });
    }

    // Fetch messages ordered by createdAt ASC
    const messages = await prisma.chatMessage.findMany({
      where: { connectionId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, name: true } },
      },
    });

    // Mark unread messages as read for the authenticated user
    await prisma.chatMessage.updateMany({
      where: {
        connectionId,
        isRead: false,
        senderId: { not: userId },
      },
      data: { isRead: true },
    });

    return res.status(200).json({ data: messages, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// POST /api/chat/:connectionId
export async function sendMessage(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const connectionId = req.params.connectionId as string;
    const { content, fileUrl, fileType } = req.body;

    if (!content && !fileUrl) {
      return res.status(400).json({ data: null, error: 'content or fileUrl is required.' });
    }

    // Verify connection exists and user has access
    const connection = await prisma.mentorConnection.findUnique({
      where: { id: connectionId },
      include: { mentor: { include: { user: true } } },
    });

    if (!connection) {
      return res.status(404).json({ data: null, error: 'Connection not found.' });
    }

    const isMentor = connection.mentor.userId === userId;
    const isMentee = connection.menteeId === userId;
    if (!isMentor && !isMentee) {
      return res.status(403).json({ data: null, error: 'Not authorized to send messages in this connection.' });
    }

    if (connection.status !== 'active') {
      return res.status(400).json({ data: null, error: 'Messages can only be sent in active connections.' });
    }

    const message = await prisma.chatMessage.create({
      data: {
        connectionId,
        senderId: userId,
        content: content ?? '',
        fileUrl: fileUrl ?? null,
        fileType: fileType ?? null,
        isRead: false,
      },
      include: {
        sender: { select: { id: true, name: true } },
      },
    });

    // Determine the recipient and notify them
    const recipientId = isMentor ? connection.menteeId : connection.mentor.userId;

    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'new_message',
        title: 'New message',
        body: content ? (content.length > 60 ? content.substring(0, 60) + '...' : content) : 'You received a file.',
        data: { connectionId, messageId: message.id },
      },
    });

    return res.status(201).json({ data: message, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}
