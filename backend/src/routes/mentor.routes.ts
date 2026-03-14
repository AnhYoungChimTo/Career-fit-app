import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware';
import * as MentorController from '../controllers/mentor.controller';
import * as ConnectionController from '../controllers/connection.controller';
import * as RoadmapController from '../controllers/roadmap.controller';
import * as SessionController from '../controllers/session.controller';
import * as ReviewController from '../controllers/review.controller';
import * as NotificationController from '../controllers/notification.controller';
import * as WaitlistController from '../controllers/waitlist.controller';
import * as AdminController from '../controllers/admin.mentor.controller';
import * as ChatController from '../controllers/chat.controller';

const router = Router();

// ─── Mentor profile ──────────────────────────────────────────────────────────

// IMPORTANT: specific /mentors/me* and /mentors/check-username* routes must
// come BEFORE the wildcard /mentors/:username route to avoid route shadowing.

router.post('/mentors/signup', authMiddleware, MentorController.signupMentor);
router.get('/mentors/me', authMiddleware, MentorController.getMyMentorProfile);
router.patch('/mentors/me', authMiddleware, MentorController.updateMyMentorProfile);
router.patch('/mentors/me/status', authMiddleware, MentorController.updateMentorStatus);
router.patch('/mentors/me/onboarding-done', authMiddleware, MentorController.markOnboardingDone);
router.get('/mentors/me/feed', authMiddleware, MentorController.getMenteeFeed);
router.get('/mentors/me/waitlist', authMiddleware, WaitlistController.getMentorWaitlist);
router.get('/mentors/check-username/:slug', MentorController.checkUsernameAvailability);
router.post('/mentors/linkedin-import', authMiddleware, MentorController.linkedinImport);
router.get('/mentors', MentorController.browseMentors); // public
router.get('/mentors/:username', MentorController.getPublicMentorProfile); // public

// ─── Connections ─────────────────────────────────────────────────────────────

router.post('/connections', authMiddleware, ConnectionController.createConnection);
router.patch('/connections/:id/accept', authMiddleware, ConnectionController.acceptConnection);
router.patch('/connections/:id/reject', authMiddleware, ConnectionController.rejectConnection);
router.get('/connections', authMiddleware, ConnectionController.listConnections);
router.get('/connections/:id', authMiddleware, ConnectionController.getConnection);
router.delete('/connections/:id', authMiddleware, ConnectionController.endConnection);

// ─── Roadmaps & Milestones ───────────────────────────────────────────────────

router.post('/roadmaps', authMiddleware, RoadmapController.createRoadmap);
router.get('/roadmaps/:connectionId', authMiddleware, RoadmapController.getRoadmap);
router.post('/roadmaps/:id/milestones', authMiddleware, RoadmapController.addMilestone);
router.patch('/roadmaps/:id/milestones/reorder', authMiddleware, RoadmapController.reorderMilestones);
router.patch('/milestones/:id', authMiddleware, RoadmapController.updateMilestone);
router.patch('/milestones/:id/mentor-confirm', authMiddleware, RoadmapController.mentorConfirmMilestone);
router.patch('/milestones/:id/mentee-confirm', authMiddleware, RoadmapController.menteeConfirmMilestone);
router.delete('/milestones/:id', authMiddleware, RoadmapController.deleteMilestone);

// ─── Sessions ────────────────────────────────────────────────────────────────

router.post('/mentor-sessions', authMiddleware, SessionController.createSession);
router.get('/mentor-sessions', authMiddleware, SessionController.listSessions);
router.get('/mentor-sessions/:id', authMiddleware, SessionController.getSession);
router.patch('/mentor-sessions/:id', authMiddleware, SessionController.updateSession);
router.delete('/mentor-sessions/:id', authMiddleware, SessionController.cancelSession);
router.get('/mentor-sessions/:id/notes', authMiddleware, SessionController.getSessionNotes);
router.put('/mentor-sessions/:id/notes', authMiddleware, SessionController.upsertSessionNotes);

// ─── Reviews ─────────────────────────────────────────────────────────────────

router.post('/reviews', authMiddleware, ReviewController.createReview);
router.get('/reviews', optionalAuthMiddleware, ReviewController.getReviews);
router.patch('/reviews/:id/reply', authMiddleware, ReviewController.replyToReview);

// ─── Notifications ───────────────────────────────────────────────────────────

router.get('/notifications', authMiddleware, NotificationController.getNotifications);
// read-all must come before /:id/read to avoid Express treating "read-all" as an :id
router.patch('/notifications/read-all', authMiddleware, NotificationController.markAllRead);
router.patch('/notifications/:id/read', authMiddleware, NotificationController.markNotificationRead);

// ─── Waitlist ────────────────────────────────────────────────────────────────

router.post('/waitlist', authMiddleware, WaitlistController.joinWaitlist);
router.post('/waitlist/:id/invite', authMiddleware, WaitlistController.inviteFromWaitlist);
router.delete('/waitlist/:id', authMiddleware, WaitlistController.leaveWaitlist);

// ─── Chat ─────────────────────────────────────────────────────────────────────

router.get('/chat/:connectionId', authMiddleware, ChatController.getMessages);
router.post('/chat/:connectionId', authMiddleware, ChatController.sendMessage);

// ─── Admin ───────────────────────────────────────────────────────────────────

// Specific admin routes must precede parameterised ones
router.get('/admin/mentors/pending', authMiddleware, AdminController.getPendingMentors);
router.get('/admin/mentors', authMiddleware, AdminController.listAllMentors);
router.patch('/admin/mentors/:id/approve', authMiddleware, AdminController.approveMentor);
router.patch('/admin/mentors/:id/reject', authMiddleware, AdminController.rejectMentor);
router.patch('/admin/mentors/:id/suspend', authMiddleware, AdminController.suspendMentor);
router.patch('/admin/credentials/:id/verify', authMiddleware, AdminController.verifyCredential);
router.patch('/admin/credentials/:id/reject', authMiddleware, AdminController.rejectCredential);

export default router;
