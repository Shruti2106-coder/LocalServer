import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, ShieldCheck, ArrowRight, Layers } from 'lucide-react';
import { VerifiedBadge } from './Badge.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export const ProviderCard = ({
  provider,
  onBookNow,
  onCompare,
  isSelectedForCompare = false
}) => {
  const { t, tCategory } = useLanguage();

  return (
    <div className="provider-card">
      <div className="provider-header">
        <img
          src={provider.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
          alt={provider.providerName || provider.businessName}
          className="provider-avatar"
        />
        <div className="provider-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h4 style={{ margin: 0, fontSize: '1.15rem' }}>
              {provider.businessName || provider.providerName}
            </h4>
            {provider.isVerified && <VerifiedBadge />}
          </div>

          <p style={{ fontSize: '0.86rem', color: '#5C6B5E', margin: '3px 0 6px 0' }}>
            {tCategory(provider.category)} &bull; {provider.experienceYears || 3} {t('years_exp')}
          </p>

          <div className="provider-rating-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#D9822B' }}>
              <Star size={15} fill="#D9822B" stroke="#D9822B" />
              <span>{Number(provider.rating).toFixed(1)}</span>
            </div>
            <span style={{ color: '#7E8D80', fontWeight: 500, fontSize: '0.82rem' }}>
              ({provider.reviewCount || 0} {t('reviews')})
            </span>
          </div>
        </div>
      </div>

      <p style={{
        fontSize: '0.9rem',
        color: '#5C6B5E',
        lineHeight: 1.45,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {provider.bio || `Specialist in ${tCategory(provider.category)} services.`}
      </p>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '10px 14px',
        backgroundColor: 'rgba(221, 229, 200, 0.35)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.84rem',
        color: '#26352A'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={14} color="#5C6B5E" />
          <span>{provider.city} &bull; {provider.serviceArea || 'Citywide coverage'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={14} color="#5C6B5E" />
          <span>{provider.workingHours || '9:00 AM - 7:00 PM'}</span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid rgba(38, 53, 42, 0.08)',
        paddingTop: '14px',
        marginTop: 'auto'
      }}>
        <div>
          <span style={{ fontSize: '0.78rem', color: '#7E8D80', display: 'block' }}>{t('starting_from')}</span>
          <div className="provider-price">
            ₹{provider.hourlyRate}
            <span> {t('per_visit')}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {onCompare && (
            <button
              onClick={() => onCompare(provider)}
              className={`btn btn-sm ${isSelectedForCompare ? 'btn-peach' : 'btn-outline'}`}
              title="Compare with other providers"
            >
              <Layers size={14} />
              <span>{isSelectedForCompare ? t('btn_added') : t('btn_compare')}</span>
            </button>
          )}

          <Link
            to={`/providers/${provider._id}`}
            className="btn btn-outline btn-sm"
          >
            {t('btn_view_profile')}
          </Link>

          <button
            onClick={() => onBookNow(provider)}
            className="btn btn-primary btn-sm"
          >
            {t('btn_book_now')}
          </button>
        </div>
      </div>
    </div>
  );
};
