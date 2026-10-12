import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  DollarSign,
  Star,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ShieldCheck,
  RefreshCw,
  Users
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { BookingCard } from '../components/BookingCard.jsx';
import { ReviewCard } from '../components/ReviewCard.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';

export const ProviderDashboard = ({ onOpenChat }) => {
  const { user, providerProfile, isAuthenticated, refreshMe } = useAuth();
  const { t, tCategory, tStatus } = useLanguage();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [profile, setProfile] = useState(providerProfile);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');

  // Service form state for adding a new service
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('1 hour');
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    loadProviderData();
  }, [isAuthenticated]);

  const loadProviderData = () => {
    setLoading(true);
    Promise.all([
      api.get('/bookings/provider'),
      api.get(`/reviews/provider/${user?._id || ''}`),
      api.get('/auth/me')
    ])
      .then(([bRes, rRes, meRes]) => {
        if (bRes.success) setBookings(bRes.data);
        if (rRes && rRes.success) setReviews(rRes.data);
        if (meRes.success && meRes.providerProfile) setProfile(meRes.providerProfile);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const res = await api.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      if (res.success) {
        setBookings(prev => prev.map(b => b._id === bookingId ? res.data : b));
      }
    } catch (e) {
      alert(e.message || 'Error updating booking status');
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!newServiceName || !newServicePrice) return;

    try {
      const res = await api.post('/providers/services', {
        name: newServiceName,
        description: newServiceDesc,
        price: Number(newServicePrice),
        estimatedDuration: newServiceDuration
      });

      if (res.success) {
        setProfile(prev => ({ ...prev, services: res.data }));
        setShowAddServiceModal(false);
        setNewServiceName('');
        setNewServiceDesc('');
        setNewServicePrice('');
      }
    } catch (e) {
      alert(e.message || 'Error adding service');
    }
  };

  const handleDeleteService = async (index) => {
    if (!confirm('Are you sure you want to remove this service?')) return;
    try {
      const res = await api.delete(`/providers/services/${index}`);
      if (res.success) {
        setProfile(prev => ({ ...prev, services: res.data }));
      }
    } catch (e) {
      alert(e.message || 'Error deleting service');
    }
  };

  const handleToggleAvailability = async (newStatus) => {
    try {
      const res = await api.put('/providers/profile', { availabilityStatus: newStatus });
      if (res.success) {
        setProfile(res.data);
      }
    } catch (e) {
      alert(e.message || 'Error updating availability');
    }
  };

  const total = bookings.length;
  const pendingRequests = bookings.filter(b => b.status === 'pending');
  const activeBookings = bookings.filter(b => ['confirmed', 'on_the_way', 'in_progress'].includes(b.status));
  const completedBookings = bookings.filter(b => b.status === 'completed');

  const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.paymentStatus === 'paid' ? b.price : 0), 0);

  return (
    <div className="container" style={{ padding: '36px 24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#5C6B5E', textTransform: 'uppercase' }}>
              {t('provider_console')}
            </span>
            {profile?.isVerified ? (
              <span className="badge badge-verified"><ShieldCheck size={13} /> {t('verified')}</span>
            ) : (
              <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                {t('pending_verification')}
              </span>
            )}
          </div>
          <h1 style={{ fontSize: '2.1rem', margin: '4px 0 0 0' }}>
            {profile?.businessName || user?.name}
          </h1>
          <p style={{ color: '#5C6B5E', fontSize: '0.92rem', margin: '4px 0 0 0' }}>
            {tCategory(profile?.category)} {t('specialist')} &bull; {profile?.city} &bull; {profile?.serviceArea}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Availability Status Switcher */}
          <div style={{
            display: 'flex',
            backgroundColor: '#FFFDF7',
            padding: 4,
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(38,53,42,0.12)'
          }}>
            {['available', 'busy', 'offline'].map((st) => (
              <button
                key={st}
                onClick={() => handleToggleAvailability(st)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: profile?.availabilityStatus === st ? 'var(--color-primary)' : 'transparent',
                  color: 'var(--color-dark-olive)',
                  textTransform: 'capitalize'
                }}
              >
                {tStatus(st)}
              </button>
            ))}
          </div>

          <button onClick={loadProviderData} className="btn btn-outline btn-sm">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderColor: 'rgba(217, 130, 43, 0.3)' }}>
          <span className="stat-label" style={{ color: '#D9822B' }}>{t('pending_requests')}</span>
          <span className="stat-value" style={{ color: '#D9822B' }}>{pendingRequests.length}</span>
        </div>

        <div className="stat-card" style={{ borderColor: 'rgba(79, 119, 45, 0.3)' }}>
          <span className="stat-label" style={{ color: '#4F772D' }}>{t('active_in_prog')}</span>
          <span className="stat-value" style={{ color: '#4F772D' }}>{activeBookings.length}</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">{t('total_completed')}</span>
          <span className="stat-value">{completedBookings.length}</span>
        </div>

        <div className="stat-card" style={{ borderColor: 'rgba(38, 53, 42, 0.2)' }}>
          <span className="stat-label">{t('total_earnings')}</span>
          <span className="stat-value" style={{ color: 'var(--color-dark-olive)' }}>₹{totalEarnings}</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">{t('rating')}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Star size={24} fill="#D9822B" stroke="#D9822B" />
            <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{Number(profile?.rating || 5.0).toFixed(1)}</span>
            <span style={{ fontSize: '0.8rem', color: '#7E8D80' }}>({profile?.reviewCount || 0})</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 12,
        borderBottom: '1px solid rgba(38,53,42,0.1)',
        marginBottom: 24,
        overflowX: 'auto'
      }}>
        {[
          { id: 'bookings', label: `${t('tab_booking_requests')} (${bookings.length})` },
          { id: 'services', label: `${t('tab_my_services')} (${profile?.services?.length || 0})` },
          { id: 'earnings', label: `${t('tab_earnings_payouts')} (₹${totalEarnings})` },
          { id: 'reviews', label: `${t('tab_customer_reviews')} (${reviews.length})` },
          { id: 'profile', label: t('tab_profile_hours') }
        ].map((tabItem) => (
          <button
            key={tabItem.id}
            onClick={() => setActiveTab(tabItem.id)}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              fontSize: '0.92rem',
              fontWeight: activeTab === tabItem.id ? 800 : 600,
              color: activeTab === tabItem.id ? 'var(--color-dark-olive)' : '#7E8D80',
              borderBottom: activeTab === tabItem.id ? '3px solid var(--color-dark-olive)' : 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {loading ? (
        <LoadingSpinner text={t('loading')} />
      ) : activeTab === 'bookings' ? (
        <div>
          {bookings.length === 0 ? (
            <div className="card text-center" style={{ padding: '48px 24px' }}>
              <Clock size={40} color="#7E8D80" style={{ margin: '0 auto 12px' }} />
              <h3>{t('no_booking_requests')}</h3>
              <p style={{ color: '#5C6B5E', marginTop: 6 }}>
                {t('no_booking_requests_desc')}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {bookings.map((b) => (
                <BookingCard
                  key={b._id}
                  booking={b}
                  isProviderView={true}
                  onOpenChat={onOpenChat}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'services' ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{t('service_catalog')}</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: '#5C6B5E' }}>
                {t('service_catalog_desc')}
              </p>
            </div>
            <button onClick={() => setShowAddServiceModal(true)} className="btn btn-primary btn-sm">
              <Plus size={15} />
              <span>{t('add_new_service')}</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {profile?.services?.map((srv, idx) => (
              <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{srv.name}</h4>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-dark-olive)' }}>
                    ₹{srv.price}
                  </span>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#5C6B5E', flex: 1, margin: 0 }}>
                  {srv.description}
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 10,
                  borderTop: '1px solid rgba(38,53,42,0.08)'
                }}>
                  <span style={{ fontSize: '0.78rem', color: '#7E8D80' }}>
                    <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                    {srv.estimatedDuration}
                  </span>
                  <button
                    onClick={() => handleDeleteService(idx)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--color-danger)' }}
                    title="Delete service"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Service Modal */}
          {showAddServiceModal && (
            <div className="modal-overlay" onClick={() => setShowAddServiceModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
                <button className="modal-close" onClick={() => setShowAddServiceModal(false)}>
                  <X size={20} />
                </button>
                <h3 style={{ marginBottom: 16 }}>{t('add_new_service_offering')}</h3>
                <form onSubmit={handleAddService}>
                  <div className="form-group">
                    <label className="form-label">{t('service_title_label')}</label>
                    <input
                      type="text"
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      placeholder="E.g. Tap Installation, MCB Replacement..."
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('description_label')}</label>
                    <textarea
                      value={newServiceDesc}
                      onChange={(e) => setNewServiceDesc(e.target.value)}
                      placeholder={t('included_in_service_placeholder')}
                      className="form-textarea"
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">{t('price_label')}</label>
                      <input
                        type="number"
                        value={newServicePrice}
                        onChange={(e) => setNewServicePrice(e.target.value)}
                        placeholder="499"
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('est_duration_label')}</label>
                      <input
                        type="text"
                        value={newServiceDuration}
                        onChange={(e) => setNewServiceDuration(e.target.value)}
                        placeholder="45 mins"
                        className="form-input"
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg w-full mt-4">
                    {t('save_service')}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'earnings' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ marginBottom: 16 }}>{t('earnings_summary')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div style={{ padding: 16, backgroundColor: 'rgba(244, 241, 222, 0.5)', borderRadius: 12 }}>
                <span style={{ fontSize: '0.8rem', color: '#7E8D80' }}>{t('total_gross_earned')}</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>₹{totalEarnings}</div>
              </div>
              <div style={{ padding: 16, backgroundColor: 'rgba(244, 241, 222, 0.5)', borderRadius: 12 }}>
                <span style={{ fontSize: '0.8rem', color: '#7E8D80' }}>{t('platform_commission')}</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>₹{Math.round(totalEarnings * 0.1)}</div>
              </div>
              <div style={{ padding: 16, backgroundColor: 'var(--color-sage)', borderRadius: 12 }}>
                <span style={{ fontSize: '0.8rem', color: '#26352A' }}>{t('net_payable_payout')}</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-dark-olive)' }}>
                  ₹{Math.round(totalEarnings * 0.9)}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h4 style={{ marginBottom: 14 }}>{t('completed_ledger')}</h4>
            {completedBookings.length === 0 ? (
              <p style={{ color: '#7E8D80' }}>{t('no_completed_bookings')}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {completedBookings.map((b) => (
                  <div key={b._id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    borderRadius: 8,
                    backgroundColor: 'rgba(244, 241, 222, 0.35)',
                    fontSize: '0.9rem'
                  }}>
                    <div>
                      <strong>{b.serviceName}</strong> &bull; {t('customer_colon')} {b.customerName}
                      <div style={{ fontSize: '0.78rem', color: '#7E8D80' }}>{b.date} at {b.timeSlot}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>₹{b.price}</span>
                      <div style={{ fontSize: '0.75rem', color: '#03543f', fontWeight: 700 }}>
                        {tStatus(b.paymentStatus)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'reviews' ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ margin: 0 }}>{t('customer_reviews_ratings')}</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: '#5C6B5E' }}>
                {t('customer_reviews_ratings_desc')}
              </p>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="card text-center" style={{ padding: '48px 24px' }}>
              <Star size={40} color="#7E8D80" style={{ margin: '0 auto 12px' }} />
              <h3>{t('no_reviews_provider')}</h3>
              <p style={{ color: '#5C6B5E', marginTop: 6 }}>{t('complete_first_booking')}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {reviews.map((r) => (
                <ReviewCard key={r._id} review={r} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Profile Tab */
        <div className="card" style={{ maxWidth: 640 }}>
          <h3 style={{ marginBottom: 18 }}>{t('provider_settings')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: '0.82rem', color: '#7E8D80', fontWeight: 600 }}>{t('business_name')}</label>
              <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{profile?.businessName}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', color: '#7E8D80', fontWeight: 600 }}>{t('specialization_category')}</label>
              <div style={{ fontSize: '1rem' }}>{tCategory(profile?.category)}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', color: '#7E8D80', fontWeight: 600 }}>{t('experience')}</label>
              <div style={{ fontSize: '1rem' }}>{profile?.experienceYears} {t('years')}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', color: '#7E8D80', fontWeight: 600 }}>{t('working_hours')}</label>
              <div style={{ fontSize: '1rem' }}>{profile?.workingHours}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', color: '#7E8D80', fontWeight: 600 }}>{t('coverage_area')}</label>
              <div style={{ fontSize: '1rem' }}>{profile?.city} &bull; {profile?.serviceArea}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', color: '#7E8D80', fontWeight: 600 }}>{t('professional_bio')}</label>
              <div style={{ fontSize: '0.92rem', color: '#26352A' }}>{profile?.bio}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

