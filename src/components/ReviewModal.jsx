import React, { useState } from 'react';
import { X, Star, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export const ReviewModal = ({ booking, isOpen, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError(t('your_review_label'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/reviews', {
        bookingId: booking._id,
        rating,
        comment: comment.trim()
      });

      if (res.success) {
        if (onSuccess) onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  const ratingLabels = {
    5: t('rating_5'),
    4: t('rating_4'),
    3: t('rating_3'),
    2: t('rating_2'),
    1: t('rating_1')
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <h3 style={{ margin: '0 0 6px 0', fontSize: '1.4rem' }}>{t('rate_and_review')}</h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem', color: '#5C6B5E' }}>
          {booking.serviceName} {t('performed_by')} <strong>{booking.providerName}</strong>
        </p>

        {error && (
          <div style={{
            padding: 10,
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: 'var(--radius-md)',
            marginBottom: 14,
            fontSize: '0.85rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#5C6B5E', display: 'block', marginBottom: 8 }}>
              {t('select_overall_rating')}
            </span>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                >
                  <Star
                    size={32}
                    fill={(hoverRating || rating) >= star ? '#D9822B' : 'transparent'}
                    stroke="#D9822B"
                  />
                </button>
              ))}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#D9822B', marginTop: 4, display: 'block' }}>
              {ratingLabels[rating] || ratingLabels[5]}
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">{t('your_review_label')}</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('review_placeholder')}
              className="form-textarea"
              style={{ minHeight: 110 }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg w-full mt-4"
          >
            {loading ? t('submitting_review') : t('post_verified_review')}
          </button>
        </form>
      </div>
    </div>
  );
};
