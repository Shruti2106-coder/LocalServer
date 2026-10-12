import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  ArrowLeft,
  MessageCircle,
  Share2
} from 'lucide-react';
import { api } from '../services/api.js';
import { VerifiedBadge } from '../components/Badge.jsx';
import { ReviewCard } from '../components/ReviewCard.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export const ProviderDetailPage = ({ onBookProvider, onSelectServiceForBooking }) => {
  const { id } = useParams();
  const { t, tCategory } = useLanguage();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [reviewsData, setReviewsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/providers/${id}`)
      .then(res => {
        if (res.success) {
          setProvider(res.data);
          return api.get(`/reviews/provider/${res.data.userId}`);
        }
      })
      .then(revRes => {
        if (revRes && revRes.success) {
          setReviewsData(revRes);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="section">
        <div className="container">
          <LoadingSpinner text={t('loading')} />
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="section">
        <div className="container text-center">
          <h2>{t('provider_not_found')}</h2>
          <p style={{ marginTop: 8 }}>{t('provider_not_found_desc')}</p>
          <button onClick={() => navigate('/providers')} className="btn btn-primary mt-4">
            {t('back_to_providers')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="section" style={{ paddingTop: 32 }}>
      <div className="container">
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: 18 }}
        >
          <ArrowLeft size={16} />
          <span>{t('back_to_search')}</span>
        </button>

        {/* Profile Header Card */}
        <div className="card" style={{ padding: 32, marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <img
              src={provider.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
              alt={provider.businessName}
              style={{
                width: 110,
                height: 110,
                borderRadius: 'var(--radius-lg)',
                objectFit: 'cover',
                border: '3px solid var(--color-sage)'
              }}
            />

            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.9rem', margin: 0 }}>
                  {provider.businessName}
                </h1>
                {provider.isVerified && <VerifiedBadge />}
              </div>

              <p style={{ fontSize: '1rem', color: '#5C6B5E', margin: '4px 0 10px 0' }}>
                {t('operated_by')} <strong>{provider.providerName}</strong> &bull; {tCategory(provider.category)} {t('specialist')}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, color: '#D9822B' }}>
                  <Star size={18} fill="#D9822B" stroke="#D9822B" />
                  <span style={{ fontSize: '1.1rem' }}>{Number(provider.rating).toFixed(1)}</span>
                  <span style={{ color: '#7E8D80', fontSize: '0.88rem' }}>({provider.reviewCount} {t('reviews')})</span>
                </div>

                <div style={{ fontSize: '0.88rem', color: '#5C6B5E' }}>
                  <strong>{provider.experienceYears || 3}+ {t('years')}</strong> {t('in_service')}
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: 20,
                flexWrap: 'wrap',
                fontSize: '0.88rem',
                color: '#26352A'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={16} color="#5C6B5E" />
                  <span>{provider.city} ({provider.serviceArea})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={16} color="#5C6B5E" />
                  <span>{provider.workingHours}</span>
                </div>
              </div>
            </div>

            {/* Action Box on Right */}
            <div style={{
              backgroundColor: 'rgba(244, 241, 222, 0.45)',
              padding: 20,
              borderRadius: 'var(--radius-lg)',
              minWidth: 220,
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.82rem', color: '#7E8D80', display: 'block' }}>{t('base_consultation')}</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-dark-olive)', margin: '4px 0 14px 0' }}>
                ₹{provider.hourlyRate}
                <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#5C6B5E' }}> {t('per_visit')}</span>
              </div>

              <button
                onClick={() => onBookProvider(provider)}
                className="btn btn-primary btn-lg w-full"
                style={{ fontWeight: 700 }}
              >
                {t('book_service')}
              </button>
            </div>
          </div>
        </div>

        {/* Two Column Layout: Details & Services + Reviews */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
          {/* Main Column */}
          <div>
            {/* About / Bio */}
            <div className="card" style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: 12 }}>{t('about_pro')}</h3>
              <p style={{ fontSize: '0.96rem', lineHeight: 1.6, color: '#26352A', margin: 0 }}>
                {provider.bio}
              </p>
            </div>

            {/* Services Offered */}
            <div className="card" style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: 16 }}>{t('services_and_rates')}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {provider.services && provider.services.length > 0 ? (
                  provider.services.map((srv, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: 16,
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(38,53,42,0.08)',
                        backgroundColor: '#FFFDF7',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 12
                      }}
                    >
                      <div style={{ maxWidth: 420 }}>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#26352A' }}>{srv.name}</div>
                        <div style={{ fontSize: '0.88rem', color: '#5C6B5E', margin: '3px 0' }}>{srv.description}</div>
                        <div style={{ fontSize: '0.78rem', color: '#7E8D80' }}>
                          <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                          {t('estimated_time')} {srv.estimatedDuration}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-dark-olive)' }}>
                          ₹{srv.price}
                        </div>
                        <button
                          onClick={() => {
                            if (onSelectServiceForBooking) onSelectServiceForBooking(provider, srv);
                            else onBookProvider(provider);
                          }}
                          className="btn btn-primary btn-sm"
                        >
                          {t('btn_book_now')}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#7E8D80' }}>Standard service inspection available upon booking.</p>
                )}
              </div>
            </div>

            {/* Customer Reviews */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 style={{ fontSize: '1.3rem', margin: 0 }}>
                  {t('customer_reviews')} ({reviewsData?.total || provider.reviews?.length || 0})
                </h3>
              </div>

              {/* Review List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {reviewsData?.data && reviewsData.data.length > 0 ? (
                  reviewsData.data.map((rev) => (
                    <ReviewCard key={rev._id} review={rev} />
                  ))
                ) : (
                  <p style={{ color: '#7E8D80', fontSize: '0.9rem', fontStyle: 'italic' }}>
                    {t('no_reviews_yet')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Trust, Safety & Service Area */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card" style={{ padding: 22 }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: 12 }}>{t('guarantee_title')}</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem', color: '#26352A' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={16} color="#52796F" />
                  <span>{t('guarantee_1')}</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={16} color="#52796F" />
                  <span>{t('guarantee_2')}</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={16} color="#52796F" />
                  <span>{t('guarantee_3')}</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={16} color="#52796F" />
                  <span>{t('guarantee_4')}</span>
                </li>
              </ul>
            </div>

            <div className="card" style={{ padding: 22 }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: 10 }}>{t('service_area_title')}</h4>
              <p style={{ fontSize: '0.88rem', color: '#5C6B5E', margin: '0 0 10px 0' }}>
                {t('covering_area')} <strong>{provider.city}</strong> {t('and_nearby')}: {provider.serviceArea}.
              </p>
              <div style={{ fontSize: '0.8rem', color: '#7E8D80' }}>
                {t('arrival_estimate')}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .container > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
