import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/notifications
export async function getNotifications(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const page = parseInt((req.query.page as string) ?? '1', 10);
    const limit = parseInt((req.query.limit as string) ?? '20', 10);

    if (page < 1 || limit < 1) {
      return res.status(400).json({ data: null, error: 'page and limit must be positive integers.' });
    }

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return res.status(200).json({
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        unreadCount,
      },
      error: null,
    });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// PATCH /api/notifications/:id/read
export async function markNotificationRead(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      return res.status(404).json({ data: null, error: 'Notification not found.' });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ data: null, error: 'Not authorized to update this notification.' });
    }

    const updated = await prisma.notification.update({
      where: { id: id },
      data: { isRead: true },
    });

    return res.status(200).json({ data: updated, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// PATCH /api/notifications/read-all
export async function markAllRead(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return res.status(200).json({ data: { updated: result.count }, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}
