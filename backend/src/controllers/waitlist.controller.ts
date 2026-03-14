import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/waitlist
export async function joinWaitlist(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { mentorId } = req.body;

    if (!mentorId) {
      return res.status(400).json({ data: null, error: 'mentorId is required.' });
    }

    const mentor = await prisma.mentor.findUnique({ where: { id: mentorId } });
    if (!mentor) {
      return res.status(404).json({ data: null, error: 'Mentor not found.' });
    }

    // Check for duplicate waitlist entry
    const existing = await prisma.mentorWaitlist.findUnique({
      where: { mentorId_menteeId: { mentorId, menteeId: userId } },
    });
    if (existing) {
      return res.status(409).json({ data: null, error: 'You are already on the waitlist for this mentor.' });
    }

    const entry = await prisma.mentorWaitlist.create({
      data: {
        mentorId,
        menteeId: userId,
        status: 'waiting',
      },
      include: {
        mentor: { select: { id: true, displayName: true, username: true } },
        mentee: { select: { id: true, name: true, email: true } },
      },
    });

    return res.status(201).json({ data: entry, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// GET /api/mentors/me/waitlist
export async function getMentorWaitlist(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    const mentor = await prisma.mentor.findUnique({ where: { userId } });
    if (!mentor) {
      return res.status(404).json({ data: null, error: 'Mentor profile not found.' });
    }

    const waitlist = await prisma.mentorWaitlist.findMany({
      where: { mentorId: mentor.id },
      orderBy: { createdAt: 'asc' },
      include: {
        mentee: {
          select: {
            id: true,
            name: true,
            email: true,
            currentRole: true,
            headline: true,
            profile: {
              include: {
                experiences: true,
                educationRecords: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({ data: waitlist, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// POST /api/waitlist/:id/invite
export async function inviteFromWaitlist(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;

    const entry = await prisma.mentorWaitlist.findUnique({
      where: { id },
      include: { mentor: { include: { user: true } } },
    });

    if (!entry) {
      return res.status(404).json({ data: null, error: 'Waitlist entry not found.' });
    }

    // Only the mentor can invite from their waitlist
    if (entry.mentor.userId !== userId) {
      return res.status(403).json({ data: null, error: 'Not authorized to invite from this waitlist.' });
    }

    const invitedAt = new Date();
    const inviteExpiresAt = new Date(invitedAt.getTime() + 48 * 60 * 60 * 1000); // 48 hours

    const updated = await prisma.mentorWaitlist.update({
      where: { id },
      data: {
        invitedAt,
        inviteExpiresAt,
        status: 'invited',
      },
    });

    // Notify the mentee
    await prisma.notification.create({
      data: {
        userId: entry.menteeId,
        type: 'waitlist_invited',
        title: 'You have been invited!',
        body: `${entry.mentor.displayName ?? 'Your mentor'} has invited you to connect. This invitation expires in 48 hours.`,
        data: { waitlistEntryId: id, mentorId: entry.mentorId },
      },
    });

    return res.status(200).json({ data: updated, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// DELETE /api/waitlist/:id
export async function leaveWaitlist(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;

    const entry = await prisma.mentorWaitlist.findUnique({ where: { id } });
    if (!entry) {
      return res.status(404).json({ data: null, error: 'Waitlist entry not found.' });
    }

    // Only the mentee can remove themselves
    if (entry.menteeId !== userId) {
      return res.status(403).json({ data: null, error: 'Not authorized to remove this waitlist entry.' });
    }

    await prisma.mentorWaitlist.delete({ where: { id } });

    return res.status(200).json({ data: { deleted: true, id }, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}
