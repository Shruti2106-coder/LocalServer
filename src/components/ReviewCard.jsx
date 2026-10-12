import React from 'react';
import { Star } from 'lucide-react';

export const ReviewCard = ({ review }) => {
  return (
    <div style={{
      backgroundColor: '#FFFDF7',
      borderRadius: 'var(--radius-md)',
      padding: '16px 20px',
      border: '1px solid var(--color-card-border)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: 'var(--color-sage)',
            color: 'var(--color-dark-olive)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.85rem'
          }}>
            {review.customerName ? review.customerName.charAt(0) : 'C'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#26352A' }}>
              {review.customerName}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#7E8D80' }}>
              {new Date(review.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2px', color: '#D9822B' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={15}
              fill={star <= review.rating ? '#D9822B' : 'transparent'}
              stroke="#D9822B"
            />
          ))}
        </div>
      </div>

      <p style={{ fontSize: '0.9rem', color: '#5C6B5E', margin: 0, lineHeight: 1.5 }}>
        "{review.comment}"
      </p>
    </div>
  );
};
