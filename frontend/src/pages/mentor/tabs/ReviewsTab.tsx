import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import MentorPageLayout from '../../../components/mentor/MentorPageLayout';
import type { Review, Mentor } from '../../../types';

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className="text-sm" style={{ color: i <= rating ? '#F6AD55' : '#E2E8F0' }}>★</span>
      ))}
    </div>
  );
}

export default function ReviewsTab() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyOpen, setReplyOpen] = useState<Record<string, boolean>>({});
  const [replying, setReplying] = useState<Record<string, boolean>>({});

  useEffect(() => {
    api.getMyMentorProfile().then((mRes: any) => {
      const m = mRes.data as Mentor;
      setMentor(m);
      return api.getMentorReviews(m.id);
    }).then((rRes: any) => {
      setReviews(rRes.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  const handleReply = async (reviewId: string) => {
    setReplying(r => ({ ...r, [reviewId]: true }));
    try {
      await api.replyToReview(reviewId, replyText[reviewId] || '');
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, mentorReply: replyText[reviewId] } : r));
      setReplyOpen(o => ({ ...o, [reviewId]: false }));
    } finally {
      setReplying(r => ({ ...r, [reviewId]: false }));
    }
  };

  return (
    <MentorPageLayout>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Reviews &amp; Reputation</h1>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#FF6B6B', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <>
            {/* Overall rating */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6 flex items-center gap-6">
              <div className="text-center">
                <p className="text-5xl font-bold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{avgRating}</p>
                <div className="flex gap-0.5 justify-center mt-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <span key={i} className="text-lg" style={{ color: i <= Math.round(Number(avgRating)) ? '#F6AD55' : '#E2E8F0' }}>★</span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex-1">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = reviews.filter(r => r.rating === star).length;
                  const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400 w-3">{star}</span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: '#F6AD55' }} />
                      </div>
                      <span className="text-xs text-gray-300 w-4">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviews list */}
            {reviews.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
                <p className="text-3xl mb-3">⭐</p>
                <p className="font-semibold text-gray-600 mb-1">No reviews yet</p>
                <p className="text-sm text-gray-400">Complete sessions to start receiving reviews from mentees</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: '#4ECDC4' }}>
                          {(review.reviewer?.name || '?').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{review.reviewer?.name || 'Mentee'}</p>
                          <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <StarRow rating={review.rating} />
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{review.body}</p>
                    {review.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {review.tags.map(tag => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{tag}</span>
                        ))}
                      </div>
                    )}

                    {/* Mentor reply */}
                    {review.mentorReply && (
                      <div className="mt-3 pl-3 border-l-2 border-gray-200">
                        <p className="text-xs font-medium text-gray-500 mb-1">Your reply:</p>
                        <p className="text-sm text-gray-600">{review.mentorReply}</p>
                      </div>
                    )}

                    {!review.mentorReply && (
                      <div className="mt-3">
                        {replyOpen[review.id] ? (
                          <div>
                            <textarea
                              rows={2}
                              value={replyText[review.id] || ''}
                              onChange={e => setReplyText(r => ({ ...r, [review.id]: e.target.value }))}
                              placeholder="Write a public reply…"
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none resize-none mb-2"
                            />
                            <div className="flex gap-2">
                              <button onClick={() => setReplyOpen(o => ({ ...o, [review.id]: false }))} className="text-xs px-3 py-1.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50">Cancel</button>
                              <button onClick={() => handleReply(review.id)} disabled={replying[review.id]} className="text-xs px-3 py-1.5 rounded-xl text-white font-medium disabled:opacity-60" style={{ backgroundColor: '#FF6B6B' }}>
                                {replying[review.id] ? 'Posting…' : 'Post Reply'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setReplyOpen(o => ({ ...o, [review.id]: true }))} className="text-xs text-gray-400 hover:text-gray-600 underline">Reply to this review</button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </MentorPageLayout>
  );
}
