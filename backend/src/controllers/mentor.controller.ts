import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/mentors/signup
export async function signupMentor(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    // Check if user already has a mentor record
    const existing = await prisma.mentor.findUnique({ where: { userId } });
    if (existing) {
      return res.status(409).json({ data: null, error: 'Mentor profile already exists for this user.' });
    }

    const {
      username,
      displayName,
      headline,
      aboutMe,
      philosophy,
      industry,
      yearsExperience,
      sessionPriceUsd,
      freeIntroSession,
      maxMentees,
      primaryLanguage,
      timezone,
      locationCity,
      locationCountry,
      mentorshipStyle,
      supportedGoals,
      mentorIndustries,
      availability,
      sessionDuration,
      bufferTime,
      advanceBooking,
      externalMeetUrl,
      credentials = [],
      workExperiences = [],
      educationEntries = [],
    } = req.body;

    if (!username) {
      return res.status(400).json({ data: null, error: 'username is required.' });
    }

    // Check username uniqueness
    const takenUsername = await prisma.mentor.findUnique({ where: { username } });
    if (takenUsername) {
      return res.status(409).json({ data: null, error: 'Username is already taken.' });
    }

    const mentor = await prisma.mentor.create({
      data: {
        userId,
        username,
        displayName: displayName ?? null,
        headline: headline ?? null,
        aboutMe: aboutMe ?? null,
        philosophy: philosophy ?? null,
        industry: industry ?? null,
        yearsExperience: yearsExperience ?? null,
        sessionPriceUsd: sessionPriceUsd ?? 0,
        freeIntroSession: freeIntroSession ?? false,
        maxMentees: maxMentees ?? null,
        primaryLanguage: primaryLanguage ?? 'english',
        timezone: timezone ?? null,
        locationCity: locationCity ?? null,
        locationCountry: locationCountry ?? null,
        mentorshipStyle: mentorshipStyle ?? null,
        supportedGoals: supportedGoals ?? [],
        mentorIndustries: mentorIndustries ?? [],
        availability: availability ?? {},
        sessionDuration: sessionDuration ?? 60,
        bufferTime: bufferTime ?? 0,
        advanceBooking: advanceBooking ?? '1_week',
        externalMeetUrl: externalMeetUrl ?? null,
        status: 'pending',
        credentials: {
          create: credentials.map((c: any) => ({
            badgeType: c.badgeType,
            badgeLabel: c.badgeLabel,
            status: 'pending',
          })),
        },
        workExperiences: {
          create: workExperiences.map((w: any) => ({
            company: w.company,
            title: w.title,
            startDate: w.startDate ?? null,
            endDate: w.endDate ?? null,
            description: w.description ?? null,
          })),
        },
        educationEntries: {
          create: educationEntries.map((e: any) => ({
            university: e.university,
            degree: e.degree,
            graduationYear: e.graduationYear ?? null,
          })),
        },
      },
      include: {
        credentials: true,
        workExperiences: true,
        educationEntries: true,
      },
    });

    // Create admin review notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'admin_review_needed',
        title: 'Mentor application submitted',
        body: 'Your mentor profile is under review. We will notify you once it is approved.',
        data: { mentorId: mentor.id },
      },
    });

    return res.status(201).json({ data: mentor, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// GET /api/mentors/me
export async function getMyMentorProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    const mentor = await prisma.mentor.findUnique({
      where: { userId },
      include: {
        credentials: true,
        workExperiences: true,
        educationEntries: true,
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    if (!mentor) {
      return res.status(404).json({ data: null, error: 'Mentor profile not found.' });
    }

    return res.status(200).json({ data: mentor, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// PATCH /api/mentors/me
export async function updateMyMentorProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    const existing = await prisma.mentor.findUnique({ where: { userId } });
    if (!existing) {
      return res.status(404).json({ data: null, error: 'Mentor profile not found.' });
    }

    // Prevent updating certain fields
    const {
      credentials,
      workExperiences,
      educationEntries,
      userId: _uid,
      id: _id,
      status: _status,
      adminVerifiedAt: _adminVerifiedAt,
      ...updateData
    } = req.body;

    const updated = await prisma.mentor.update({
      where: { userId },
      data: updateData,
      include: {
        credentials: true,
        workExperiences: true,
        educationEntries: true,
      },
    });

    return res.status(200).json({ data: updated, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// GET /api/mentors/:username (public)
export async function getPublicMentorProfile(req: Request, res: Response) {
  try {
    const username = req.params.username as string;

    const mentor = await prisma.mentor.findUnique({
      where: { username },
      include: {
        credentials: { where: { status: 'verified' } },
        workExperiences: true,
        educationEntries: true,
        user: {
          select: { id: true, name: true },
        },
      },
    });

    if (!mentor || mentor.status !== 'active') {
      return res.status(404).json({ data: null, error: 'Mentor not found.' });
    }

    // Compute average rating from public reviews on mentor's user id
    const reviewAgg = await prisma.review.aggregate({
      where: { revieweeId: mentor.userId, isPublic: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const publicReviews = await prisma.review.findMany({
      where: { revieweeId: mentor.userId, isPublic: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        reviewer: { select: { id: true, name: true } },
      },
    });

    return res.status(200).json({
      data: {
        ...mentor,
        avgRating: reviewAgg._avg.rating ?? 0,
        reviewCount: reviewAgg._count.rating,
        recentReviews: publicReviews,
      },
      error: null,
    });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// GET /api/mentors/check-username/:slug
export async function checkUsernameAvailability(req: Request, res: Response) {
  try {
    const slug = req.params.slug as string;

    const existing = await prisma.mentor.findUnique({ where: { username: slug } });

    return res.status(200).json({
      data: { available: !existing, username: slug },
      error: null,
    });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// PATCH /api/mentors/me/status
export async function updateMentorStatus(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { status } = req.body;

    const allowed = ['active', 'paused', 'on_leave'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ data: null, error: `status must be one of: ${allowed.join(', ')}` });
    }

    const mentor = await prisma.mentor.findUnique({ where: { userId } });
    if (!mentor) {
      return res.status(404).json({ data: null, error: 'Mentor profile not found.' });
    }

    const updated = await prisma.mentor.update({
      where: { userId },
      data: { mentorStatus: status },
    });

    return res.status(200).json({ data: updated, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// GET /api/mentors/me/feed
export async function getMenteeFeed(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { goal, urgency, industry } = req.query as Record<string, string>;

    const mentor = await prisma.mentor.findUnique({ where: { userId } });
    if (!mentor) {
      return res.status(404).json({ data: null, error: 'Mentor profile not found.' });
    }

    // Get IDs of users already connected to this mentor
    const existingConnections = await prisma.mentorConnection.findMany({
      where: { mentorId: mentor.id },
      select: { menteeId: true },
    });
    const excludedIds = existingConnections.map((c) => c.menteeId);
    excludedIds.push(userId); // exclude self

    // Build user filter
    const userWhere: any = {
      id: { notIn: excludedIds },
      profile: { isNot: null },
    };

    // Filter by industry using currentRole field on User
    if (industry) {
      userWhere.currentRole = { contains: industry, mode: 'insensitive' };
    }

    const candidates = await prisma.user.findMany({
      where: userWhere,
      include: {
        profile: {
          include: {
            experiences: true,
            educationRecords: true,
          },
        },
      },
      take: 100,
    });

    const mentorSupportedGoals: string[] = Array.isArray(mentor.supportedGoals)
      ? (mentor.supportedGoals as string[])
      : [];
    const mentorIndustry = (mentor.industry ?? '').toLowerCase();

    const scored = candidates.map((user) => {
      let score = 0;

      // Industry match: 40%
      const userRole = (user.currentRole ?? '').toLowerCase();
      if (mentorIndustry && userRole.includes(mentorIndustry)) {
        score += 40;
      }

      // Goal compatibility: 15% — if mentee's experiences mention goals keywords
      if (mentorSupportedGoals.length > 0 && user.profile) {
        const experienceTitles = user.profile.experiences.map((e) => e.title.toLowerCase()).join(' ');
        const goalMatches = mentorSupportedGoals.filter((g) =>
          experienceTitles.includes(g.toLowerCase())
        ).length;
        const goalScore = Math.min((goalMatches / mentorSupportedGoals.length) * 15, 15);
        score += goalScore;
      }

      // Profile completeness: 10%
      if (user.profile) {
        let fields = 0;
        if (user.profile.bio) fields++;
        if (user.profile.headline) fields++;
        if (user.profile.location) fields++;
        if (user.profile.linkedIn) fields++;
        if (user.profile.experiences.length > 0) fields++;
        if (user.profile.educationRecords.length > 0) fields++;
        score += (fields / 6) * 10;
      }

      // University pedigree: 35%
      if (user.profile && user.profile.educationRecords.length > 0) {
        score += 35;
      }

      return {
        ...user,
        match_score: Math.round(Math.min(score, 100)),
      };
    });

    // Sort by match score descending
    scored.sort((a, b) => b.match_score - a.match_score);

    return res.status(200).json({ data: scored, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// GET /api/mentors (public)
export async function browseMentors(req: Request, res: Response) {
  try {
    const { q, industry, credential, price_max, rating_min } = req.query as Record<string, string>;

    const mentorWhere: any = { status: 'active' };

    if (q) {
      mentorWhere.OR = [
        { displayName: { contains: q, mode: 'insensitive' } },
        { headline: { contains: q, mode: 'insensitive' } },
        { aboutMe: { contains: q, mode: 'insensitive' } },
        { username: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (industry) {
      mentorWhere.industry = { contains: industry, mode: 'insensitive' };
    }

    if (price_max) {
      mentorWhere.sessionPriceUsd = { lte: parseFloat(price_max) };
    }

    const mentors = await prisma.mentor.findMany({
      where: mentorWhere,
      include: {
        credentials: credential
          ? { where: { status: 'verified', badgeType: { contains: credential, mode: 'insensitive' } } }
          : { where: { status: 'verified' } },
        user: { select: { id: true, name: true } },
        _count: { select: { connections: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Enrich with average rating
    const enriched = await Promise.all(
      mentors.map(async (mentor) => {
        const agg = await prisma.review.aggregate({
          where: { revieweeId: mentor.userId, isPublic: true },
          _avg: { rating: true },
          _count: { rating: true },
        });

        const avgRating = agg._avg.rating ?? 0;

        // Filter by rating_min if provided
        if (rating_min && avgRating < parseFloat(rating_min)) return null;

        // Filter out mentors where credential filter returned no results
        if (credential && mentor.credentials.length === 0) return null;

        return {
          ...mentor,
          avgRating,
          reviewCount: agg._count.rating,
        };
      })
    );

    const filtered = enriched.filter(Boolean);

    return res.status(200).json({ data: filtered, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// POST /api/mentors/linkedin-import (STUBBED)
export async function linkedinImport(req: Request, res: Response) {
  try {
    // Stub: return mock LinkedIn data
    const mockData = {
      displayName: 'John Doe',
      headline: 'Senior Software Engineer at Acme Corp',
      linkedinUrl: 'https://linkedin.com/in/johndoe',
      workExperiences: [
        {
          company: 'Acme Corp',
          title: 'Senior Software Engineer',
          startDate: '2020-01',
          endDate: null,
          description: 'Building scalable distributed systems.',
        },
      ],
      educationEntries: [
        {
          university: 'State University',
          degree: 'B.Sc. Computer Science',
          graduationYear: '2019',
        },
      ],
    };

    return res.status(200).json({ data: mockData, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}

// PATCH /api/mentors/me/onboarding-done
export async function markOnboardingDone(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    const mentor = await prisma.mentor.findUnique({ where: { userId } });
    if (!mentor) {
      return res.status(404).json({ data: null, error: 'Mentor profile not found.' });
    }

    const updated = await prisma.mentor.update({
      where: { userId },
      data: { onboardingDone: true },
    });

    return res.status(200).json({ data: updated, error: null });
  } catch (error: any) {
    return res.status(500).json({ data: null, error: error.message });
  }
}
