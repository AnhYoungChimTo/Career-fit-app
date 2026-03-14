import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import SidePanel from '../../components/mentor/SidePanel';
import type { MentorSession, MentorConnection, Review } from '../../types';

const REVIEW_TAGS = [
  'Clear communication',
  'Very helpful',
  'Knowledgeable',
  'Encouraging',
  'Actionable advice',
  'Good listener',
  'Professional',
  'Punctual',
];

interface ReviewForm {
  rating: number;
  body: string;
  tags: string[];
}

const EMPTY_REVIEW: ReviewForm = { rating: 0, body: '', tags: [] };

export default function SessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [session, setSession] = useState<MentorSession | null>(null);
  const [connection, setConnection] = useState<MentorConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [notesContent, setNotesContent] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  const [completing, setCompleting] = useState(false);
  const [reviewForm, setReviewForm] = useState<ReviewForm>(EMPTY_REVIEW);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!sessionId) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const sessionRes = await api.getMentorSession(sessionId);
        const sessionData: MentorSession = sessionRes?.data || sessionRes;
        setSession(sessionData);
        setNotesContent(sessionData?.notes?.content || '');

        if (sessionData?.connectionId) {
          const connRes = await api.getConnection(sessionData.connectionId);
          setConnection(connRes?.data || connRes);
        }
      } catch (err: any) {
        setError(err?.response?.data?.error?.message || err?.message || 'Failed to load session');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sessionId]);

  const isMentor = user?.id === connection?.mentor?.userId;

  const handleSaveNotes = async () => {
    if (!sessionId) return;
    setSavingNotes(true);
    try {
      await api.upsertSessionNotes(sessionId, notesContent);
      setNotesSaved(true);
      showToast('Notes saved');
      setTimeout(() => setNotesSaved(false), 3000);
    } catch (err: any) {
      showToast(err?.response?.data?.error?.message || 'Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!sessionId) return;
    setCompleting(true);
    try {
      const res = await api.updateMentorSession(sessionId, { status: 'completed' });
      const updated: MentorSession = res?.data || res;
      setSession(updated);
      showToast('Session marked as completed');
    } catch (err: any) {
      showToast(err?.response?.data?.error?.message || 'Failed to update session');
    } finally {
      setCompleting(false);
    }
  };

  const toggleReviewTag = (tag: string) => {
    setReviewForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }));
  };

  const handleSubmitReview = async () => {
    if (!sessionId || reviewForm.rating === 0) return;
    setSubmittingReview(true);
    try {
      const revieweeId =
        isMentor
          ? connection?.menteeId || ''
          : connection?.mentor?.userId || '';
      await api.createReview({
        sessionId,
        revieweeId,
        reviewerRole: isMentor ? 'mentor' : 'mentee',
        rating: reviewForm.rating,
        body: reviewForm.body.trim(),
        tags: reviewForm.tags,
        isPublic: true,
      });
      setReviewSubmitted(true);
      showToast('Review submitted');
    } catch (err: any) {
      showToast(err?.response?.data?.error?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatDateTime = (iso: string) => {
    return new Date(iso).toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const STATUS_CHIP: Record<string, string> = {
    confirmed: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    no_show: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#FFF8F0' }}>
      <SidePanel activeTab="calendar" onTabChange={() => {}} />

      <main className="flex-1 overflow-y-auto">
        {/* Toast */}
        {toast && (
          <div
            className="fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium"
            style={{ backgroundColor: '#4ECDC4' }}
          >
            {toast}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center h-full">
            <div
              className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: '#FF6B6B', borderTopColor: 'transparent' }}
            />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <p className="text-red-500 font-medium">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 hover:bg-gray-50"
            >
              ← Go Back
            </button>
          </div>
        )}

        {!loading && !error && session && (
          <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
            {/* Back */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              ← Back
            </button>

            {/* Session header */}
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {session.title || 'Mentoring Session'}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDateTime(session.scheduledAt)}
                  </p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Duration: {session.durationMins} min
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                      STATUS_CHIP[session.status] || 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {session.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Meeting link */}
              {session.meetingUrl && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
                  <span className="text-gray-400 text-sm">Meeting link:</span>
                  <a
                    href={session.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-1.5 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#4ECDC4' }}
                  >
                    Join Meeting →
                  </a>
                </div>
              )}

              {/* Agenda */}
              {session.agenda && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Agenda</h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {session.agenda}
                  </p>
                </div>
              )}

              {/* Mark completed action */}
              {session.status === 'confirmed' && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={handleMarkCompleted}
                    disabled={completing}
                    className="px-5 py-2.5 rounded-lg text-white text-sm font-semibold transition-opacity disabled:opacity-60"
                    style={{ backgroundColor: '#FF6B6B' }}
                  >
                    {completing ? 'Updating...' : 'Mark as Completed'}
                  </button>
                </div>
              )}
            </div>

            {/* Shared Notes */}
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900">Shared Notes</h2>
                {session.notes?.updatedAt && (
                  <span className="text-xs text-gray-400">
                    Last updated{' '}
                    {new Date(session.notes.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {session.notes.updatedBy ? ` by ${session.notes.updatedBy}` : ''}
                  </span>
                )}
              </div>

              <textarea
                value={notesContent}
                onChange={(e) => {
                  if (isMentor) setNotesContent(e.target.value);
                }}
                readOnly={!isMentor}
                placeholder={
                  isMentor
                    ? 'Write shared session notes here...'
                    : 'No notes yet for this session.'
                }
                rows={8}
                className={`w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none resize-none leading-relaxed ${
                  !isMentor ? 'bg-gray-50 text-gray-500 cursor-default' : 'focus:border-orange-300'
                }`}
                maxLength={5000}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">{notesContent.length}/5000 characters</span>
                {isMentor && (
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-60 ${
                      notesSaved
                        ? 'text-white'
                        : 'text-white'
                    }`}
                    style={{ backgroundColor: notesSaved ? '#4ECDC4' : '#FF6B6B' }}
                  >
                    {savingNotes ? 'Saving...' : notesSaved ? 'Saved!' : 'Save Notes'}
                  </button>
                )}
              </div>
            </div>

            {/* Review section */}
            {session.status === 'completed' && !existingReview && !reviewSubmitted && (
              <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-1">Leave a Review</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Share your experience from this session.
                </p>

                {/* Star rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                      className="text-2xl transition-transform hover:scale-110"
                    >
                      <span
                        style={{
                          color: star <= reviewForm.rating ? '#FF6B6B' : '#D1D5DB',
                        }}
                      >
                        ★
                      </span>
                    </button>
                  ))}
                  {reviewForm.rating > 0 && (
                    <span className="ml-2 text-sm text-gray-500">
                      {reviewForm.rating}/5
                    </span>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {REVIEW_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleReviewTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        reviewForm.tags.includes(tag)
                          ? 'text-white border-transparent'
                          : 'text-gray-600 border-gray-200 hover:border-orange-200 bg-white'
                      }`}
                      style={
                        reviewForm.tags.includes(tag)
                          ? { backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' }
                          : {}
                      }
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Review body */}
                <textarea
                  value={reviewForm.body}
                  onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))}
                  placeholder="Write a detailed review (optional)..."
                  rows={4}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none resize-none focus:border-orange-300 mb-4"
                />

                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview || reviewForm.rating === 0}
                  className="px-5 py-2.5 rounded-lg text-white text-sm font-semibold transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: '#FF6B6B' }}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            )}

            {reviewSubmitted && (
              <div
                className="bg-white rounded-2xl shadow-sm border p-6 text-center"
                style={{ borderColor: '#4ECDC4' }}
              >
                <p className="text-2xl mb-2">🌟</p>
                <p className="text-sm font-semibold text-gray-800">Review submitted!</p>
                <p className="text-sm text-gray-500 mt-1">Thank you for your feedback.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
