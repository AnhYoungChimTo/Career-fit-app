import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/admin/mentors/pending
export async function getPendingMentors(req: Request, res: Response) {
  try {
    const mentors = await prisma.mentor.findMany({
      where: { status: 'pending' },
      include: {
        user: { select: { id: true, name: true, email: true, createdAt: true } },
        credentials: true,
        workExperiences: true,
        educationEntries: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return res.status(200).json({ data: mentors, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// PATCH /api/admin/mentors/:id/approve
export async function approveMentor(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const mentor = await prisma.mentor.findUnique({ where: { id } });
    if (!mentor) {
      return res.status(404).json({ data: null, error: 'Mentor not found.' });
    }

    const updated = await prisma.mentor.update({
      where: { id },
      data: {
        status: 'active',
        adminVerifiedAt: new Date(),
      },
    });

    await prisma.notification.create({
      data: {
        userId: mentor.userId,
        type: 'mentor_approved',
        title: 'Your mentor application has been approved!',
        body: 'Congratulations! Your mentor profile is now active and visible to mentees.',
        data: { mentorId: id },
      },
    });

    return res.status(200).json({ data: updated, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// PATCH /api/admin/mentors/:id/reject
export async function rejectMentor(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;

    const mentor = await prisma.mentor.findUnique({ where: { id } });
    if (!mentor) {
      return res.status(404).json({ data: null, error: 'Mentor not found.' });
    }

    const updated = await prisma.mentor.update({
      where: { id },
      data: { status: 'rejected' },
    });

    await prisma.notification.create({
      data: {
        userId: mentor.userId,
        type: 'mentor_rejected',
        title: 'Your mentor application was not approved',
        body: reason ?? 'Unfortunately your mentor application did not meet our current requirements.',
        data: { mentorId: id, reason: reason ?? null },
      },
    });

    return res.status(200).json({ data: updated, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// PATCH /api/admin/credentials/:id/verify
export async function verifyCredential(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const credential = await prisma.mentorCredential.findUnique({ where: { id } });
    if (!credential) {
      return res.status(404).json({ data: null, error: 'Credential not found.' });
    }

    const updated = await prisma.mentorCredential.update({
      where: { id },
      data: {
        status: 'verified',
        verifiedAt: new Date(),
      },
    });

    return res.status(200).json({ data: updated, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// PATCH /api/admin/credentials/:id/reject
export async function rejectCredential(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const credential = await prisma.mentorCredential.findUnique({ where: { id } });
    if (!credential) {
      return res.status(404).json({ data: null, error: 'Credential not found.' });
    }

    const updated = await prisma.mentorCredential.update({
      where: { id },
      data: { status: 'rejected' },
    });

    return res.status(200).json({ data: updated, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// GET /api/admin/mentors
export async function listAllMentors(req: Request, res: Response) {
  try {
    const { status } = req.query as Record<string, string>;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const mentors = await prisma.mentor.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, createdAt: true } },
        credentials: true,
        _count: {
          select: { connections: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ data: mentors, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// PATCH /api/admin/mentors/:id/suspend
export async function suspendMentor(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const mentor = await prisma.mentor.findUnique({ where: { id } });
    if (!mentor) {
      return res.status(404).json({ data: null, error: 'Mentor not found.' });
    }

    const updated = await prisma.mentor.update({
      where: { id },
      data: { status: 'rejected' },
    });

    await prisma.notification.create({
      data: {
        userId: mentor.userId,
        type: 'mentor_suspended',
        title: 'Your mentor account has been suspended',
        body: 'Your mentor account has been suspended. Please contact support for more information.',
        data: { mentorId: id },
      },
    });

    return res.status(200).json({ data: updated, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}
