import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  MessageCircle,
  FileText,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { BookingCard } from '../components/BookingCard.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';

export const CustomerDashboard = ({
  onOpenChat,
  onOpenPayment,
  onOpenReview,
  onOpenComplaint
}) => {
  const { user, isAuthenticated } = useAuth();
  const { t, tStatus } = useLanguage();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    loadDashboardData();
  }, [isAuthenticated]);

  const loadDashboardData = () => {
    setLoading(true);
    Promise.all([
      api.get('/bookings/customer'),
      api.get('/complaints/my')
    ])
      .then(([bRes, cRes]) => {
        if (bRes.success) setBookings(bRes.data);
        if (cRes.success) setComplaints(cRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleCancelBooking = async (booking) => {
    const reason = prompt('Please specify why you wish to cancel this booking:');
    if (reason === null) return;

    try {
      const res = await api.patch(`/bookings/${booking._id}/status`, {
        status: 'cancelled',
        reason: reason || 'Customer requested cancellation'
      });
      if (res.success) {
        setBookings(prev => prev.map(b => b._id === booking._id ? res.data : b));
      }
    } catch (e) {
      alert(e.message || 'Unable to cancel booking.');
    }
  };

  const total = bookings.length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const activeCount = bookings.filter(b => ['confirmed', 'on_the_way', 'in_progress'].includes(b.status)).length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const cancelledCount = bookings.filter(b => b.status === 'cancelled' || b.status === 'rejected').length;

  const filteredBookings = bookings.filter(b => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return ['pending', 'confirmed', 'on_the_way', 'in_progress'].includes(b.status);
    if (statusFilter === 'completed') return b.status === 'completed';
    if (statusFilter === 'cancelled') return ['cancelled', 'rejected'].includes(b.status);
    return b.status === statusFilter;
  });

  return (
    <div className="container" style={{ padding: '36px 24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#5C6B5E', textTransform: 'uppercase' }}>
            {t('customer_portal')}
          </span>
          <h1 style={{ fontSize: '2.1rem', margin: '4px 0 0 0' }}>
            {t('welcome_user')}, {user?.name}
          </h1>
          <p style={{ color: '#5C6B5E', fontSize: '0.92rem', margin: '4px 0 0 0' }}>
            {t('customer_subtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={loadDashboardData} className="btn btn-outline btn-sm">
            <RefreshCw size={14} />
            <span>{t('refresh')}</span>
          </button>
          <button onClick={() => navigate('/providers')} className="btn btn-primary btn-sm">
            {t('book_new_service')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">{t('total_bookings')}</span>
          <span className="stat-value">{total}</span>
        </div>

        <div className="stat-card" style={{ borderColor: 'rgba(217, 130, 43, 0.3)' }}>
          <span className="stat-label" style={{ color: '#D9822B' }}>{t('pending_approval')}</span>
          <span className="stat-value" style={{ color: '#D9822B' }}>{pendingCount}</span>
        </div>

        <div className="stat-card" style={{ borderColor: 'rgba(79, 119, 45, 0.3)' }}>
          <span className="stat-label" style={{ color: '#4F772D' }}>{t('active_in_progress')}</span>
          <span className="stat-value" style={{ color: '#4F772D' }}>{activeCount}</span>
        </div>

        <div className="stat-card" style={{ borderColor: 'rgba(82, 121, 111, 0.3)' }}>
          <span className="stat-label" style={{ color: '#52796F' }}>{t('status_completed')}</span>
          <span className="stat-value" style={{ color: '#52796F' }}>{completedCount}</span>
        </div>
      </div>

      {/* Tabs navigation */}
      <div style={{
        display: 'flex',
        gap: 12,
        borderBottom: '1px solid rgba(38,53,42,0.1)',
        marginBottom: 24
      }}>
        <button
          onClick={() => setActiveTab('bookings')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontSize: '0.95rem',
            fontWeight: activeTab === 'bookings' ? 800 : 600,
            color: activeTab === 'bookings' ? 'var(--color-dark-olive)' : '#7E8D80',
            borderBottom: activeTab === 'bookings' ? '3px solid var(--color-dark-olive)' : 'none',
            cursor: 'pointer'
          }}
        >
          {t('tab_my_bookings')} ({bookings.length})
        </button>

        <button
          onClick={() => setActiveTab('complaints')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontSize: '0.95rem',
            fontWeight: activeTab === 'complaints' ? 800 : 600,
            color: activeTab === 'complaints' ? 'var(--color-dark-olive)' : '#7E8D80',
            borderBottom: activeTab === 'complaints' ? '3px solid var(--color-dark-olive)' : 'none',
            cursor: 'pointer'
          }}
        >
          {t('tab_support_complaints')} ({complaints.length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontSize: '0.95rem',
            fontWeight: activeTab === 'profile' ? 800 : 600,
            color: activeTab === 'profile' ? 'var(--color-dark-olive)' : '#7E8D80',
            borderBottom: activeTab === 'profile' ? '3px solid var(--color-dark-olive)' : 'none',
            cursor: 'pointer'
          }}
        >
          {t('tab_my_profile')}
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <LoadingSpinner text={t('loading')} />
      ) : activeTab === 'bookings' ? (
        <div>
          {/* Subfilter Pills */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: t('filter_all_requests') },
              { id: 'active', label: t('filter_active') },
              { id: 'completed', label: t('filter_completed') },
              { id: 'cancelled', label: t('filter_cancelled') }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`btn btn-sm ${statusFilter === f.id ? 'btn-primary' : 'btn-outline'}`}
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filteredBookings.length === 0 ? (
            <div className="card text-center" style={{ padding: '48px 24px' }}>
              <Calendar size={40} color="#7E8D80" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ marginBottom: 6 }}>{t('no_bookings_tab')}</h3>
              <p style={{ color: '#5C6B5E', maxWidth: 400, margin: '0 auto 20px auto' }}>
                {t('no_bookings_tab_desc')}
              </p>
              <button onClick={() => navigate('/providers')} className="btn btn-primary">
                {t('browse_providers')}
              </button>
            </div>
          ) : (
            <div>
              {filteredBookings.map((b) => (
                <BookingCard
                  key={b._id}
                  booking={b}
                  isProviderView={false}
                  onOpenChat={onOpenChat}
                  onOpenPayment={onOpenPayment}
                  onOpenReview={onOpenReview}
                  onOpenComplaint={onOpenComplaint}
                  onCancelBooking={handleCancelBooking}
                />
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'complaints' ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <p style={{ color: '#5C6B5E', margin: 0 }}>
              {t('track_support_desc')}
            </p>
            <button
              onClick={() => onOpenComplaint()}
              className="btn btn-outline btn-sm"
            >
              {t('file_new_ticket')}
            </button>
          </div>

          {complaints.length === 0 ? (
            <div className="card text-center" style={{ padding: '48px 24px' }}>
              <FileText size={40} color="#7E8D80" style={{ margin: '0 auto 12px' }} />
              <h3>{t('no_complaints_filed')}</h3>
              <p style={{ color: '#5C6B5E', marginTop: 6 }}>{t('no_complaints_filed_desc')}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {complaints.map((c) => (
                <div key={c._id} className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{c.subject}</h4>
                      <span style={{ fontSize: '0.78rem', color: '#7E8D80' }}>
                        {t('filed_on')} {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: 999,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: c.status === 'resolved' ? '#def7ec' : '#fef3c7',
                      color: c.status === 'resolved' ? '#03543f' : '#92400e',
                      textTransform: 'uppercase'
                    }}>
                      {tStatus(c.status)}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: '#26352A', margin: '8px 0 12px 0' }}>
                    "{c.description}"
                  </p>

                  {c.adminResponse && (
                    <div style={{
                      backgroundColor: 'rgba(221, 229, 200, 0.4)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.86rem',
                      color: '#26352A'
                    }}>
                      <strong>{t('admin_resolution')}</strong> {c.adminResponse}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Profile Tab */
        <div className="card" style={{ maxWidth: 600 }}>
          <h3 style={{ marginBottom: 18 }}>{t('customer_account_info')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: '0.82rem', color: '#7E8D80', fontWeight: 600 }}>{t('full_name')}</label>
              <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{user?.name}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', color: '#7E8D80', fontWeight: 600 }}>{t('email_address')}</label>
              <div style={{ fontSize: '1rem' }}>{user?.email}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', color: '#7E8D80', fontWeight: 600 }}>{t('phone_number')}</label>
              <div style={{ fontSize: '1rem' }}>{user?.phone || t('not_provided')}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', color: '#7E8D80', fontWeight: 600 }}>{t('default_city')}</label>
              <div style={{ fontSize: '1rem' }}>{user?.city || 'Mumbai'}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', color: '#7E8D80', fontWeight: 600 }}>{t('saved_address')}</label>
              <div style={{ fontSize: '1rem' }}>{user?.address || t('not_specified')}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
