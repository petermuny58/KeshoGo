import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

interface ReviewRow {
  id: string;
  rating: number;
  comment: string;
  sellerReply: string | null;
  createdAt: string;
  user: { fullName: string };
  product: { title: string };
}

export function SellerReviews() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    apiFetch<{ reviews: ReviewRow[] }>('/api/seller/reviews')
      .then((r) => setReviews(r.reviews))
      .catch(() => {});
  }, []);

  async function submitReply(reviewId: string) {
    try {
      await apiFetch(`/api/seller/reviews/${reviewId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ sellerReply: replyText }),
      });
      showToast('Reply posted', 'success');
      setReplyingTo(null);
      setReplyText('');
      const refreshed = await apiFetch<{ reviews: ReviewRow[] }>('/api/seller/reviews');
      setReviews(refreshed.reviews);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Reply failed', 'error');
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-graphite">Reviews</h1>
        <p className="text-sm text-graphite-muted">Customer feedback on your products.</p>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-sm text-graphite-muted">No reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="rounded-2xl border border-border-soft bg-white p-5">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="font-medium text-graphite">{review.user.fullName}</p>
                  <p className="text-xs text-graphite-muted">{review.product.title}</p>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={14} fill="currentColor" />
                  <span className="text-sm font-medium">{review.rating}</span>
                </div>
              </div>
              <p className="text-sm text-graphite">{review.comment}</p>
              {review.sellerReply && (
                <p className="mt-3 rounded-lg bg-surface-dim px-3 py-2 text-sm text-graphite-muted">
                  <span className="font-medium text-graphite">Your reply:</span> {review.sellerReply}
                </p>
              )}
              {!review.sellerReply && (
                <div className="mt-3">
                  {replyingTo === review.id ? (
                    <div className="flex gap-2">
                      <input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply…"
                        className="flex-1 rounded-xl border border-border-soft px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => void submitReply(review.id)}
                        className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
                      >
                        Post
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setReplyingTo(review.id)}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Reply
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
