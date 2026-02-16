# User Profile & Portfolio System - Implementation Guide

**Component**: Phase 1 - User Profiles
**Style**: Modern & Professional (Upwork/LinkedIn inspired)
**Timeline**: Side project (no rush - build it right!)

---

## 🎯 What We're Building

A comprehensive user profile system where job seekers can:
- ✅ Create a professional profile with photo, headline, bio
- ✅ Showcase their assessment results (personality, career matches)
- ✅ List skills with proficiency levels
- ✅ Add work experience and education
- ✅ Build a portfolio (projects, certificates, awards)
- ✅ See their skill gaps relative to dream careers
- ✅ Track learning progress

---

## 📐 Step-by-Step Implementation Plan

### **STEP 1: Database Schema** (30 mins)

Create the Prisma models for user profiles.

**File**: `backend/prisma/schema.prisma`

Add these models:

```prisma
// User Profile (Main profile info)
model UserProfile {
  id                String   @id @default(uuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Basic Info
  firstName         String
  lastName          String
  profilePhoto      String?  // URL to uploaded photo
  headline          String?  // "Marketing Professional | MBA Candidate"
  location          String?  // "Ho Chi Minh City, Vietnam"
  bio               String?  // Long-form about me

  // Social Links
  linkedIn          String?
  github            String?
  portfolioUrl      String?
  twitter           String?

  // Privacy
  visibility        String   @default("public") // public, employers_only, private

  // Metadata
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  skills            Skill[]
  experiences       Experience[]
  educationRecords  Education[]
  portfolioItems    PortfolioItem[]

  @@index([userId])
}

// Skills
model Skill {
  id              String      @id @default(uuid())
  profileId       String
  profile         UserProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  name            String      // "Digital Marketing", "Python", etc.
  level           String      // beginner, intermediate, advanced, expert
  verified        Boolean     @default(false) // Verified through assessment or endorsement

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([profileId])
  @@unique([profileId, name]) // Can't add same skill twice
}

// Work Experience
model Experience {
  id              String      @id @default(uuid())
  profileId       String
  profile         UserProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  title           String      // "Marketing Coordinator"
  company         String      // "ABC Company"
  location        String?     // "Ho Chi Minh City"
  startDate       DateTime
  endDate         DateTime?
  current         Boolean     @default(false) // Still working here
  description     String      // Rich text description

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([profileId])
}

// Education
model Education {
  id              String      @id @default(uuid())
  profileId       String
  profile         UserProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  degree          String      // "Bachelor of Arts", "MBA"
  institution     String      // "Vietnam National University"
  major           String?     // "Marketing"
  graduationYear  String      // "2024" or "Expected 2025"
  description     String?     // Additional details

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([profileId])
}

// Portfolio Items
model PortfolioItem {
  id              String      @id @default(uuid())
  profileId       String
  profile         UserProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  title           String      // "Marketing Campaign for XYZ"
  description     String      // What it is, what you did
  type            String      // project, certificate, publication, award
  url             String?     // Link to project/certificate
  imageUrl        String?     // Thumbnail image
  attachments     Json?       // Array of file URLs (PDFs, images, etc.)
  skills          Json        // Array of skill names used: ["SEO", "Content Writing"]
  startDate       DateTime?
  endDate         DateTime?

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([profileId])
  @@index([type])
}
```

**Also update the existing User model** to add the relation:

```prisma
model User {
  // ... existing fields ...

  // Add this relation
  profile         UserProfile?

  // ... rest of existing fields ...
}
```

**Run the migration**:
```bash
cd backend
npx prisma migrate dev --name add_user_profiles
```

---

### **STEP 2: Backend API** (2-3 hours)

Create API endpoints for managing profiles.

#### 2.1 Profile Controller

**File**: `backend/src/controllers/profile.controller.ts`

```typescript
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/profile/:userId
 * Get user profile with all related data
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        skills: { orderBy: { level: 'desc' } },
        experiences: { orderBy: { startDate: 'desc' } },
        educationRecords: { orderBy: { graduationYear: 'desc' } },
        portfolioItems: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found' },
      });
    }

    // Check privacy settings
    const requestingUserId = (req as any).user?.id;
    if (profile.visibility === 'private' && requestingUserId !== userId) {
      return res.status(403).json({
        success: false,
        error: { code: 'PROFILE_PRIVATE', message: 'This profile is private' },
      });
    }

    return res.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'FETCH_PROFILE_ERROR', message: 'Failed to fetch profile' },
    });
  }
};

/**
 * POST /api/profile
 * Create or update user profile
 */
export const upsertProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id; // From auth middleware
    const {
      firstName,
      lastName,
      profilePhoto,
      headline,
      location,
      bio,
      linkedIn,
      github,
      portfolioUrl,
      twitter,
      visibility,
    } = req.body;

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        firstName,
        lastName,
        profilePhoto,
        headline,
        location,
        bio,
        linkedIn,
        github,
        portfolioUrl,
        twitter,
        visibility,
      },
      create: {
        userId,
        firstName,
        lastName,
        profilePhoto,
        headline,
        location,
        bio,
        linkedIn,
        github,
        portfolioUrl,
        twitter,
        visibility,
      },
    });

    return res.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    console.error('Error upserting profile:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'UPSERT_PROFILE_ERROR', message: 'Failed to update profile' },
    });
  }
};

/**
 * POST /api/profile/skills
 * Add a skill to profile
 */
export const addSkill = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, level, verified } = req.body;

    // Get profile
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found. Create profile first.' },
      });
    }

    const skill = await prisma.skill.create({
      data: {
        profileId: profile.id,
        name,
        level: level || 'beginner',
        verified: verified || false,
      },
    });

    return res.json({
      success: true,
      data: skill,
    });
  } catch (error: any) {
    console.error('Error adding skill:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'ADD_SKILL_ERROR', message: 'Failed to add skill' },
    });
  }
};

/**
 * PUT /api/profile/skills/:skillId
 * Update skill
 */
export const updateSkill = async (req: Request, res: Response) => {
  try {
    const { skillId } = req.params;
    const { name, level, verified } = req.body;

    const skill = await prisma.skill.update({
      where: { id: skillId },
      data: { name, level, verified },
    });

    return res.json({
      success: true,
      data: skill,
    });
  } catch (error: any) {
    console.error('Error updating skill:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'UPDATE_SKILL_ERROR', message: 'Failed to update skill' },
    });
  }
};

/**
 * DELETE /api/profile/skills/:skillId
 * Delete skill
 */
export const deleteSkill = async (req: Request, res: Response) => {
  try {
    const { skillId } = req.params;

    await prisma.skill.delete({ where: { id: skillId } });

    return res.json({
      success: true,
      data: { message: 'Skill deleted successfully' },
    });
  } catch (error: any) {
    console.error('Error deleting skill:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'DELETE_SKILL_ERROR', message: 'Failed to delete skill' },
    });
  }
};

// Similar CRUD functions for Experience, Education, PortfolioItem
// (addExperience, updateExperience, deleteExperience, etc.)
// I'll provide these if you want, but they follow the same pattern
```

#### 2.2 Routes

**File**: `backend/src/routes/profile.routes.ts`

```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as profileController from '../controllers/profile.controller';

const router = Router();

// Profile
router.get('/profile/:userId', profileController.getProfile);
router.post('/profile', authMiddleware, profileController.upsertProfile);

// Skills
router.post('/profile/skills', authMiddleware, profileController.addSkill);
router.put('/profile/skills/:skillId', authMiddleware, profileController.updateSkill);
router.delete('/profile/skills/:skillId', authMiddleware, profileController.deleteSkill);

// Experience (TODO: implement similar to skills)
// router.post('/profile/experience', authMiddleware, profileController.addExperience);
// router.put('/profile/experience/:expId', authMiddleware, profileController.updateExperience);
// router.delete('/profile/experience/:expId', authMiddleware, profileController.deleteExperience);

// Education (TODO)
// Portfolio (TODO)

export default router;
```

#### 2.3 Register Routes

**File**: `backend/src/server.ts` (add this line)

```typescript
import profileRoutes from './routes/profile.routes';

// ... existing code ...

app.use('/api', profileRoutes);
```

---

### **STEP 3: Frontend Components** (4-6 hours)

Build the profile page and all its components.

#### 3.1 Profile Page

**File**: `frontend/src/pages/Profile.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import ProfileHeader from '../components/profile/ProfileHeader';
import SkillsSection from '../components/profile/SkillsSection';
import ExperienceSection from '../components/profile/ExperienceSection';
import EducationSection from '../components/profile/EducationSection';
import PortfolioSection from '../components/profile/PortfolioSection';

export default function Profile() {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Determine if this is the current user's profile
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isOwnProfile = !userId || userId === currentUser.id;
  const targetUserId = userId || currentUser.id;

  useEffect(() => {
    loadProfile();
  }, [targetUserId]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/profile/${targetUserId}`);

      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        setError(response.error?.message || 'Profile not found');
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err.response?.data?.error?.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          {isOwnProfile && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700"
            >
              Create Your Profile
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Return to Dashboard Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Return to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <ProfileHeader
          profile={profile}
          isOwnProfile={isOwnProfile}
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onSave={() => {
            setIsEditing(false);
            loadProfile();
          }}
          onCancel={() => setIsEditing(false)}
        />

        {/* Main Content Grid */}
        <div className="mt-8 space-y-6">
          {/* Skills */}
          <SkillsSection
            skills={profile.skills || []}
            isOwnProfile={isOwnProfile}
            onUpdate={loadProfile}
          />

          {/* Experience */}
          <ExperienceSection
            experiences={profile.experiences || []}
            isOwnProfile={isOwnProfile}
            onUpdate={loadProfile}
          />

          {/* Education */}
          <EducationSection
            educationRecords={profile.educationRecords || []}
            isOwnProfile={isOwnProfile}
            onUpdate={loadProfile}
          />

          {/* Portfolio */}
          <PortfolioSection
            portfolioItems={profile.portfolioItems || []}
            isOwnProfile={isOwnProfile}
            onUpdate={loadProfile}
          />
        </div>
      </div>
    </div>
  );
}
```

#### 3.2 Profile Header Component

**File**: `frontend/src/components/profile/ProfileHeader.tsx`

```typescript
import { useState } from 'react';
import { api } from '../../services/api';

interface ProfileHeaderProps {
  profile: any;
  isOwnProfile: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function ProfileHeader({
  profile,
  isOwnProfile,
  isEditing,
  onEdit,
  onSave,
  onCancel,
}: ProfileHeaderProps) {
  const [formData, setFormData] = useState({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    headline: profile.headline || '',
    location: profile.location || '',
    bio: profile.bio || '',
    linkedIn: profile.linkedIn || '',
    github: profile.github || '',
    portfolioUrl: profile.portfolioUrl || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await api.post('/profile', formData);

      if (response.success) {
        onSave();
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>

        <div className="grid grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Headline */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
          <input
            type="text"
            value={formData.headline}
            onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
            placeholder="e.g., Marketing Professional | MBA Candidate"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Location */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., Ho Chi Minh City, Vietnam"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Bio */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">About Me</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
            placeholder="Tell us about yourself, your passions, and career goals..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Social Links */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h3>
          <div className="space-y-3">
            <input
              type="url"
              value={formData.linkedIn}
              onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
              placeholder="LinkedIn URL"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="url"
              value={formData.github}
              onChange={(e) => setFormData({ ...formData, github: e.target.value })}
              placeholder="GitHub URL"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="url"
              value={formData.portfolioUrl}
              onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
              placeholder="Portfolio Website"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={onCancel}
            className="bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Cover Image (optional - could add later) */}
      <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>

      {/* Profile Info */}
      <div className="px-8 pb-8">
        <div className="flex items-start -mt-16 mb-4">
          {/* Profile Photo */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-600 overflow-hidden">
              {profile.profilePhoto ? (
                <img src={profile.profilePhoto} alt={`${profile.firstName} ${profile.lastName}`} className="w-full h-full object-cover" />
              ) : (
                `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`
              )}
            </div>
          </div>

          {/* Edit Button (if own profile) */}
          {isOwnProfile && (
            <button
              onClick={onEdit}
              className="ml-auto mt-16 bg-white border-2 border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Name & Headline */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            {profile.firstName} {profile.lastName}
          </h1>
          {profile.headline && (
            <p className="text-lg text-gray-600 mt-1">{profile.headline}</p>
          )}
          {profile.location && (
            <p className="text-sm text-gray-500 mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {profile.location}
            </p>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mb-6">
            <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Social Links */}
        {(profile.linkedIn || profile.github || profile.portfolioUrl) && (
          <div className="flex gap-4">
            {profile.linkedIn && (
              <a
                href={profile.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                LinkedIn
              </a>
            )}
            {profile.github && (
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-gray-900 flex items-center gap-1"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
            )}
            {profile.portfolioUrl && (
              <a
                href={profile.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                </svg>
                Portfolio
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### **STEP 4: Skills Section Component** (1 hour)

**File**: `frontend/src/components/profile/SkillsSection.tsx`

```typescript
import { useState } from 'react';
import { api } from '../../services/api';

interface SkillsSectionProps {
  skills: any[];
  isOwnProfile: boolean;
  onUpdate: () => void;
}

export default function SkillsSection({ skills, isOwnProfile, onUpdate }: SkillsSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', level: 'beginner' });

  const handleAddSkill = async () => {
    try {
      await api.post('/profile/skills', newSkill);
      setNewSkill({ name: '', level: 'beginner' });
      setIsAdding(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to add skill:', error);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    if (!confirm('Are you sure you want to remove this skill?')) return;

    try {
      await api.delete(`/profile/skills/${skillId}`);
      onUpdate();
    } catch (error) {
      console.error('Failed to delete skill:', error);
    }
  };

  const getLevelStars = (level: string) => {
    const levels = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    const count = levels[level as keyof typeof levels] || 1;
    return '⭐'.repeat(count) + '☆'.repeat(4 - count);
  };

  const getLevelColor = (level: string) => {
    const colors = {
      beginner: 'bg-gray-100 text-gray-800',
      intermediate: 'bg-blue-100 text-blue-800',
      advanced: 'bg-indigo-100 text-indigo-800',
      expert: 'bg-purple-100 text-purple-800',
    };
    return colors[level as keyof typeof colors] || colors.beginner;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Skills</h2>
        {isOwnProfile && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 text-sm"
          >
            + Add Skill
          </button>
        )}
      </div>

      {/* Add Skill Form */}
      {isAdding && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skill Name</label>
              <input
                type="text"
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                placeholder="e.g., Digital Marketing, Python"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Proficiency Level</label>
              <select
                value={newSkill.level}
                onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="beginner">Beginner ⭐</option>
                <option value="intermediate">Intermediate ⭐⭐</option>
                <option value="advanced">Advanced ⭐⭐⭐</option>
                <option value="expert">Expert ⭐⭐⭐⭐</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleAddSkill}
              disabled={!newSkill.name}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              Add Skill
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewSkill({ name: '', level: 'beginner' });
              }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Skills List */}
      {skills.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          {isOwnProfile ? 'Add your skills to showcase your expertise!' : 'No skills added yet.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                  {skill.verified && (
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-600">{getLevelStars(skill.level)}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getLevelColor(skill.level)}`}>
                    {skill.level}
                  </span>
                </div>
              </div>
              {isOwnProfile && (
                <button
                  onClick={() => handleDeleteSkill(skill.id)}
                  className="text-red-500 hover:text-red-700 ml-4"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### **STEP 5: Register Profile Route** (5 mins)

**File**: `frontend/src/App.tsx`

Add the profile route:

```typescript
import Profile from './pages/Profile';

// ... in Routes:

<Route
  path="/profile/:userId?"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>
```

---

### **STEP 6: Add Link to Profile from Dashboard** (5 mins)

**File**: `frontend/src/pages/Dashboard.tsx`

Add a "View Profile" button:

```typescript
<button
  onClick={() => navigate('/profile')}
  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
>
  View My Profile
</button>
```

---

## ✅ Testing Checklist

Once you've built everything:

- [ ] Can create a new profile
- [ ] Can edit profile information
- [ ] Can add skills
- [ ] Can remove skills
- [ ] Profile displays correctly
- [ ] "Return to Dashboard" button works
- [ ] Privacy: Can't view private profiles
- [ ] Mobile responsive design

---

## 📸 Visual Reference (Upwork-style)

Your profile should look similar to:

```
┌──────────────────────────────────────────────────────┐
│  [Purple gradient cover]                              │
│                                                       │
│     ┌───────┐                                        │
│     │ Photo │  John Doe                    [Edit]    │
│     └───────┘  Marketing Professional               │
│                📍 Ho Chi Minh City                   │
│                                                       │
│     Passionate marketer with 5 years experience...  │
│                                                       │
│     🔗 LinkedIn | GitHub | Portfolio                 │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  SKILLS                                     [+ Add]   │
│                                                       │
│  ┌──────────────────┐  ┌──────────────────┐         │
│  │ Digital Marketing│  │ Data Analytics   │         │
│  │ ⭐⭐⭐⭐ Expert  │  │ ⭐⭐⭐ Advanced  │         │
│  └──────────────────┘  └──────────────────┘         │
└──────────────────────────────────────────────────────┘
```

---

## 🚀 Ready to Start?

You now have everything you need to build the profile system!

**Would you like me to**:
1. **Start building now** - I'll create the files step by step
2. **Create more component examples** - Experience, Education, Portfolio sections
3. **Answer questions first** - Clarify anything before we begin

Let me know and we'll get started! 🎉
