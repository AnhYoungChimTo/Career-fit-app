import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/roadmaps
export async function createRoadmap(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { connectionId, title } = req.body;

    if (!connectionId) {
      return res.status(400).json({ data: null, error: 'connectionId is required.' });
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
      return res.status(403).json({ data: null, error: 'Not authorized to create a roadmap for this connection.' });
    }

    // Check if roadmap already exists
    const existing = await prisma.roadmap.findUnique({ where: { connectionId } });
    if (existing) {
      return res.status(409).json({ data: null, error: 'A roadmap already exists for this connection.' });
    }

    const roadmap = await prisma.roadmap.create({
      data: {
        connectionId,
        title: title ?? 'My Mentorship Roadmap',
      },
      include: {
        milestones: { orderBy: { sortOrder: 'asc' } },
      },
    });

    return res.status(201).json({ data: roadmap, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// GET /api/roadmaps/:connectionId
export async function getRoadmap(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const connectionId = req.params.connectionId as string;

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
      return res.status(403).json({ data: null, error: 'Not authorized to view this roadmap.' });
    }

    const roadmap = await prisma.roadmap.findUnique({
      where: { connectionId },
      include: {
        milestones: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!roadmap) {
      return res.status(404).json({ data: null, error: 'Roadmap not found for this connection.' });
    }

    return res.status(200).json({ data: roadmap, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// POST /api/roadmaps/:id/milestones
export async function addMilestone(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const roadmapId = req.params.id as string;
    const { title, description, category, phaseLabel, dueDate, sortOrder } = req.body;

    if (!title) {
      return res.status(400).json({ data: null, error: 'title is required.' });
    }

    const roadmap = await prisma.roadmap.findUnique({
      where: { id: roadmapId },
      include: { connection: { include: { mentor: { include: { user: true } } } } },
    });

    if (!roadmap) {
      return res.status(404).json({ data: null, error: 'Roadmap not found.' });
    }

    const isMentor = roadmap.connection.mentor.userId === userId;
    const isMentee = roadmap.connection.menteeId === userId;
    if (!isMentor && !isMentee) {
      return res.status(403).json({ data: null, error: 'Not authorized to add milestones to this roadmap.' });
    }

    // Auto-assign sortOrder if not provided
    let finalSortOrder = sortOrder;
    if (finalSortOrder === undefined || finalSortOrder === null) {
      const lastMilestone = await prisma.roadmapMilestone.findFirst({
        where: { roadmapId },
        orderBy: { sortOrder: 'desc' },
      });
      finalSortOrder = lastMilestone ? lastMilestone.sortOrder + 1 : 0;
    }

    const milestone = await prisma.roadmapMilestone.create({
      data: {
        roadmapId,
        title,
        description: description ?? null,
        category: category ?? 'other',
        phaseLabel: phaseLabel ?? null,
        dueDate: dueDate ? new Date(dueDate) : null,
        sortOrder: finalSortOrder,
      },
    });

    return res.status(201).json({ data: milestone, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// PATCH /api/milestones/:id
export async function updateMilestone(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;

    const milestone = await prisma.roadmapMilestone.findUnique({
      where: { id },
      include: {
        roadmap: {
          include: { connection: { include: { mentor: { include: { user: true } } } } },
        },
      },
    });

    if (!milestone) {
      return res.status(404).json({ data: null, error: 'Milestone not found.' });
    }

    const isMentor = milestone.roadmap.connection.mentor.userId === userId;
    const isMentee = milestone.roadmap.connection.menteeId === userId;
    if (!isMentor && !isMentee) {
      return res.status(403).json({ data: null, error: 'Not authorized to update this milestone.' });
    }

    const {
      id: _id,
      roadmapId: _roadmapId,
      mentorConfirmed: _mc,
      menteeConfirmed: _mec,
      ...updateData
    } = req.body;

    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    const updated = await prisma.roadmapMilestone.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({ data: updated, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// PATCH /api/milestones/:id/mentor-confirm
export async function mentorConfirmMilestone(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;

    const milestone = await prisma.roadmapMilestone.findUnique({
      where: { id },
      include: {
        roadmap: {
          include: { connection: { include: { mentor: { include: { user: true } } } } },
        },
      },
    });

    if (!milestone) {
      return res.status(404).json({ data: null, error: 'Milestone not found.' });
    }

    // Only the mentor can mentor-confirm
    const isMentor = milestone.roadmap.connection.mentor.userId === userId;
    if (!isMentor) {
      return res.status(403).json({ data: null, error: 'Only the mentor can confirm this milestone.' });
    }

    const updated = await prisma.roadmapMilestone.update({
      where: { id },
      data: {
        mentorConfirmed: true,
        status: 'pending_confirmation',
      },
    });

    // Notify the mentee
    await prisma.notification.create({
      data: {
        userId: milestone.roadmap.connection.menteeId,
        type: 'milestone_mentor_confirmed',
        title: 'Milestone confirmed by mentor',
        body: `Your mentor has confirmed the milestone: "${milestone.title}". Please confirm from your side.`,
        data: { milestoneId: id, roadmapId: milestone.roadmapId },
      },
    });

    return res.status(200).json({ data: updated, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// PATCH /api/milestones/:id/mentee-confirm
export async function menteeConfirmMilestone(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;

    const milestone = await prisma.roadmapMilestone.findUnique({
      where: { id },
      include: {
        roadmap: {
          include: { connection: { include: { mentor: { include: { user: true } } } } },
        },
      },
    });

    if (!milestone) {
      return res.status(404).json({ data: null, error: 'Milestone not found.' });
    }

    // Only the mentee can mentee-confirm
    const isMentee = milestone.roadmap.connection.menteeId === userId;
    if (!isMentee) {
      return res.status(403).json({ data: null, error: 'Only the mentee can confirm this milestone.' });
    }

    const updated = await prisma.roadmapMilestone.update({
      where: { id },
      data: {
        menteeConfirmed: true,
        status: 'complete',
      },
    });

    return res.status(200).json({ data: updated, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// PATCH /api/roadmaps/:id/milestones/reorder
export async function reorderMilestones(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const roadmapId = req.params.id as string;
    const { milestones } = req.body;

    if (!Array.isArray(milestones)) {
      return res.status(400).json({ data: null, error: 'milestones must be an array of { id, sortOrder }.' });
    }

    const roadmap = await prisma.roadmap.findUnique({
      where: { id: roadmapId },
      include: { connection: { include: { mentor: { include: { user: true } } } } },
    });

    if (!roadmap) {
      return res.status(404).json({ data: null, error: 'Roadmap not found.' });
    }

    const isMentor = roadmap.connection.mentor.userId === userId;
    const isMentee = roadmap.connection.menteeId === userId;
    if (!isMentor && !isMentee) {
      return res.status(403).json({ data: null, error: 'Not authorized to reorder milestones for this roadmap.' });
    }

    // Update each milestone's sortOrder in a transaction
    const updates = await prisma.$transaction(
      milestones.map(({ id, sortOrder }: { id: string; sortOrder: number }) =>
        prisma.roadmapMilestone.update({
          where: { id },
          data: { sortOrder },
        })
      )
    );

    return res.status(200).json({ data: updates, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// DELETE /api/milestones/:id
export async function deleteMilestone(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;

    const milestone = await prisma.roadmapMilestone.findUnique({
      where: { id },
      include: {
        roadmap: {
          include: { connection: { include: { mentor: { include: { user: true } } } } },
        },
      },
    });

    if (!milestone) {
      return res.status(404).json({ data: null, error: 'Milestone not found.' });
    }

    const isMentor = milestone.roadmap.connection.mentor.userId === userId;
    const isMentee = milestone.roadmap.connection.menteeId === userId;
    if (!isMentor && !isMentee) {
      return res.status(403).json({ data: null, error: 'Not authorized to delete this milestone.' });
    }

    await prisma.roadmapMilestone.delete({ where: { id } });

    return res.status(200).json({ data: { deleted: true, id }, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}
