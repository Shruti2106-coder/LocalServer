import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  Briefcase,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  FileText,
  RotateCcw,
  Search,
  Check,
  X,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';

export const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { t, tCategory, tStatus, tRole } = useLanguage();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [complaintsList, setComplaintsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');

  // Response text for complaint resolution modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [adminResponseText, setAdminResponseText] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }

    loadAdminData();
  }, [isAuthenticated, user]);

  const loadAdminData = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/analytics'),
      api.get('/admin/users'),
      api.get('/admin/bookings'),
      api.get('/complaints/all')
    ])
      .then(([aRes, uRes, bRes, cRes]) => {
        if (aRes.success) setAnalytics(aRes.data);
        if (uRes.success) setUsersList(uRes.data);
        if (bRes.success) setBookingsList(bRes.data);
        if (cRes.success) setComplaintsList(cRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleToggleUserActive = async (userId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/toggle-active`);
      if (res.success) {
        setUsersList(prev => prev.map(u => u._id === userId ? { ...u, isActive: res.data.isActive } : u));
      }
    } catch (e) {
      alert(e.message || 'Error toggling user status');
    }
  };

  const handleVerifyProvider = async (profileId, shouldVerify) => {
    try {
      const res = await api.patch(`/admin/providers/${profileId}/verify`, { verify: shouldVerify });
      if (res.success) {
        setUsersList(prev => prev.map(u => {
          if (u.providerProfile && (u.providerProfile._id === profileId || u.providerProfile.userId === profileId)) {
            return {
              ...u,
              providerProfile: { ...u.providerProfile, isVerified: shouldVerify }
            };
          }
          return u;
        }));
        // Reload analytics to update counter
        const aRes = await api.get('/admin/analytics');
        if (aRes.success) setAnalytics(aRes.data);
      }
    } catch (e) {
      alert(e.message || 'Error updating verification status');
    }
  };

  const handleResolveComplaint = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      const res = await api.patch(`/complaints/${selectedComplaint._id}`, {
        status: 'resolved',
        adminResponse: adminResponseText
      });
      if (res.success) {
        setComplaintsList(prev => prev.map(c => c._id === selectedComplaint._id ? res.data : c));
        setSelectedComplaint(null);
        setAdminResponseText('');
      }
    } catch (e) {
      alert(e.message || 'Error resolving complaint');
    }
  };

  if (loading) {
    return (
      <div className="section">
        <div className="container">
          <LoadingSpinner text={t('loading')} />
        </div>
      </div>
    );
  }

  const providers = usersList.filter(u => u.role === 'provider' && u.providerProfile);

  return (
    <div className="container" style={{ padding: '36px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: 'var(--color-peach)', color: 'var(--color-dark-olive)', padding: '4px 10px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 800 }}>
            <Shield size={13} />
            {t('super_admin_control')}
          </div>
          <h1 style={{ fontSize: '2.2rem', margin: '6px 0 0 0' }}>{t('admin_title')}</h1>
          <p style={{ color: '#5C6B5E', fontSize: '0.92rem', margin: '4px 0 0 0' }}>
            {t('admin_subtitle')}
          </p>
        </div>

        <button onClick={loadAdminData} className="btn btn-outline btn-sm">
          <RotateCcw size={14} />
          <span>{t('refresh_data')}</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      {analytics && (
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">{t('kpi_total_users')}</span>
            <span className="stat-value">{analytics.totalUsers}</span>
            <span style={{ fontSize: '0.75rem', color: '#7E8D80' }}>
              {analytics.customers} {t('role_customer')} &bull; {analytics.providers} {t('role_provider')}
            </span>
          </div>

          <div className="stat-card" style={{ borderColor: 'rgba(217, 130, 43, 0.3)' }}>
            <span className="stat-label" style={{ color: '#D9822B' }}>{t('kpi_pending_verifications')}</span>
            <span className="stat-value" style={{ color: '#D9822B' }}>{analytics.pendingVerifications}</span>
            <span style={{ fontSize: '0.75rem', color: '#7E8D80' }}>
              {analytics.verifiedProviders} {t('verified')}
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-label">{t('kpi_total_bookings')}</span>
            <span className="stat-value">{analytics.totalBookings}</span>
            <span style={{ fontSize: '0.75rem', color: '#7E8D80' }}>
              {analytics.completedBookings} {t('status_completed')} &bull; {analytics.activeBookings} {t('status_in_progress')}
            </span>
          </div>

          <div className="stat-card" style={{ borderColor: 'rgba(79, 119, 45, 0.3)' }}>
            <span className="stat-label" style={{ color: '#4F772D' }}>{t('kpi_gross_volume')}</span>
            <span className="stat-value" style={{ color: '#4F772D' }}>₹{analytics.totalRevenue}</span>
            <span style={{ fontSize: '0.75rem', color: '#7E8D80' }}>
              Est. Platform Fee: ₹{analytics.platformFeeEstimated}
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-label">{t('kpi_open_complaints')}</span>
            <span className="stat-value" style={{ color: analytics.openComplaints > 0 ? '#C05746' : 'inherit' }}>
              {analytics.openComplaints}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#7E8D80' }}>
              {t('rating')}: {analytics.averageRating} ★
            </span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: 12,
        borderBottom: '1px solid rgba(38,53,42,0.1)',
        marginBottom: 24,
        overflowX: 'auto'
      }}>
        {[
          { id: 'analytics', label: t('tab_platform_analytics') },
          { id: 'providers', label: `${t('tab_provider_verifications')} (${analytics?.pendingVerifications || 0})` },
          { id: 'users', label: `${t('tab_users')} (${usersList.length})` },
          { id: 'bookings', label: `${t('tab_all_bookings')} (${bookingsList.length})` },
          { id: 'complaints', label: `${t('tab_disputes')} (${complaintsList.length})` }
        ].map((tabItem) => (
          <button
            key={tabItem.id}
            onClick={() => setActiveTab(tabItem.id)}
            style={{
              padding: '10px 18px',
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

      {/* Tab: Analytics Breakdown */}
      {activeTab === 'analytics' && analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: 16 }}>{t('demand_by_category')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Object.entries(analytics.categoryCounts || {}).map(([cat, count]) => (
                <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>{tCategory(cat)}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 120,
                      height: 8,
                      backgroundColor: 'rgba(38,53,42,0.08)',
                      borderRadius: 4,
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${Math.min(100, (count / (analytics.totalBookings || 1)) * 100)}%`,
                        height: '100%',
                        backgroundColor: 'var(--color-primary)'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, width: 24, textAlign: 'right' }}>
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: 16 }}>{t('platform_health')}</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.9rem' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#5C6B5E' }}>{t('booking_completion_rate')}:</span>
                <strong>{analytics.totalBookings > 0 ? `${Math.round((analytics.completedBookings / analytics.totalBookings) * 100)}%` : '100%'}</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#5C6B5E' }}>{t('cancellation_rate')}:</span>
                <strong>{analytics.totalBookings > 0 ? `${Math.round((analytics.cancelledBookings / analytics.totalBookings) * 100)}%` : '0%'}</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#5C6B5E' }}>{t('avg_provider_satisfaction')}:</span>
                <strong>{analytics.averageRating} / 5.0 ({analytics.totalReviews} {t('reviews')})</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#5C6B5E' }}>{t('active_customer_base')}:</span>
                <strong>{analytics.customers} {t('registered_accounts')}</strong>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab: Provider Verifications */}
      {activeTab === 'providers' && (
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: 16 }}>{t('provider_verification_mgmt')}</h3>
          <p style={{ color: '#5C6B5E', fontSize: '0.9rem', marginBottom: 20 }}>
            {t('provider_verification_desc')}
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(38,53,42,0.08)' }}>
                  <th style={{ padding: '12px 14px' }}>{t('table_business_name')}</th>
                  <th style={{ padding: '12px 14px' }}>{t('table_category')}</th>
                  <th style={{ padding: '12px 14px' }}>{t('table_experience')}</th>
                  <th style={{ padding: '12px 14px' }}>{t('table_rate')}</th>
                  <th style={{ padding: '12px 14px' }}>{t('table_rating')}</th>
                  <th style={{ padding: '12px 14px' }}>{t('table_status')}</th>
                  <th style={{ padding: '12px 14px' }}>{t('table_action')}</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((p) => {
                  const prof = p.providerProfile;
                  return (
                    <tr key={p._id} style={{ borderBottom: '1px solid rgba(38,53,42,0.06)' }}>
                      <td style={{ padding: '14px' }}>
                        <strong>{prof.businessName}</strong>
                        <div style={{ fontSize: '0.78rem', color: '#7E8D80' }}>{p.name} ({p.email})</div>
                      </td>
                      <td style={{ padding: '14px' }}>{tCategory(prof.category)}</td>
                      <td style={{ padding: '14px' }}>{prof.experienceYears} {t('years')}</td>
                      <td style={{ padding: '14px', fontWeight: 700 }}>₹{prof.hourlyRate}</td>
                      <td style={{ padding: '14px' }}>{prof.rating} ★ ({prof.reviewCount})</td>
                      <td style={{ padding: '14px' }}>
                        {prof.isVerified ? (
                          <span className="badge badge-verified"><ShieldCheck size={13} /> {t('verified')}</span>
                        ) : (
                          <span className="badge badge-status-pending">{t('awaiting_verification')}</span>
                        )}
                      </td>
                      <td style={{ padding: '14px' }}>
                        {prof.isVerified ? (
                          <button
                            onClick={() => handleVerifyProvider(prof._id, false)}
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--color-danger)' }}
                          >
                            {t('btn_revoke')}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerifyProvider(prof._id, true)}
                            className="btn btn-primary btn-sm"
                          >
                            <Check size={14} />
                            <span>{t('btn_verify_pro')}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Users Management */}
      {activeTab === 'users' && (
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: 16 }}>{t('all_platform_accounts')}</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(38,53,42,0.08)' }}>
                  <th style={{ padding: '12px 14px' }}>{t('table_user_name')}</th>
                  <th style={{ padding: '12px 14px' }}>{t('table_email_phone')}</th>
                  <th style={{ padding: '12px 14px' }}>{t('table_role')}</th>
                  <th style={{ padding: '12px 14px' }}>{t('table_city')}</th>
                  <th style={{ padding: '12px 14px' }}>{t('table_status')}</th>
                  <th style={{ padding: '12px 14px' }}>{t('table_action')}</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid rgba(38,53,42,0.06)' }}>
                    <td style={{ padding: '14px', fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: '14px' }}>
                      <div>{u.email}</div>
                      <div style={{ fontSize: '0.78rem', color: '#7E8D80' }}>{u.phone || 'N/A'}</div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 6,
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        backgroundColor: u.role === 'admin' ? '#fef3c7' : u.role === 'provider' ? 'var(--color-sage)' : 'var(--color-cream)',
                        color: 'var(--color-dark-olive)'
                      }}>
                        {tRole(u.role)}
                      </span>
                    </td>
                    <td style={{ padding: '14px' }}>{u.city || 'Mumbai'}</td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ color: u.isActive ? '#03543f' : '#991b1b', fontWeight: 700 }}>
                        {u.isActive ? t('status_active') : t('status_deactivated')}
                      </span>
                    </td>
                    <td style={{ padding: '14px' }}>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserActive(u._id)}
                          className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-outline'}`}
                        >
                          {u.isActive ? t('btn_deactivate') : t('btn_activate')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: All Bookings */}
      {activeTab === 'bookings' && (
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: 16 }}>{t('all_platform_bookings')}</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(38,53,42,0.08)' }}>
                  <th style={{ padding: '12px 14px' }}>{t('table_booking_id')}</th>
                  <th style={{ padding: '12px 14px' }}>{t('table_service')}</th>
                  <th style={{ padding: '12px 14px' }}>{t('table_customer')}</th>
                  <th style={{ padding: '12px 14px' }}>{t('table_provider')}</th>
                  <th style={{ padding: '12px 14px' }}>{t('table_schedule')}</th>
                  <th style={{ padding: '12px 14px' }}>{t('table_price')}</th>
                  <th style={{ padding: '12px 14px' }}>{t('table_status')}</th>
                </tr>
              </thead>
              <tbody>
                {bookingsList.map((b) => (
                  <tr key={b._id} style={{ borderBottom: '1px solid rgba(38,53,42,0.06)' }}>
                    <td style={{ padding: '14px', fontWeight: 700 }}>#{b._id.substring(3)}</td>
                    <td style={{ padding: '14px' }}>{b.serviceName}</td>
                    <td style={{ padding: '14px' }}>{b.customerName}</td>
                    <td style={{ padding: '14px' }}>{b.providerName}</td>
                    <td style={{ padding: '14px' }}>{b.date} ({b.timeSlot})</td>
                    <td style={{ padding: '14px', fontWeight: 800 }}>₹{b.price}</td>
                    <td style={{ padding: '14px' }}>
                      <span className={`badge badge-status-${b.status}`}>
                        {tStatus(b.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Disputes & Complaints */}
      {activeTab === 'complaints' && (
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: 16 }}>{t('grievances_complaints')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {complaintsList.map((c) => (
              <div key={c._id} style={{
                padding: 18,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(244, 241, 222, 0.4)',
                border: '1px solid rgba(38,53,42,0.08)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{c.subject}</h4>
                    <span style={{ fontSize: '0.8rem', color: '#7E8D80' }}>
                      By {c.userName} ({tRole(c.userRole)}) &bull; {new Date(c.createdAt).toLocaleDateString()}
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
                    backgroundColor: '#FFFDF7',
                    padding: '10px 14px',
                    borderRadius: 8,
                    fontSize: '0.86rem',
                    marginBottom: 12
                  }}>
                    <strong>{t('official_response')}</strong> {c.adminResponse}
                  </div>
                )}

                {c.status !== 'resolved' && (
                  <button
                    onClick={() => { setSelectedComplaint(c); setAdminResponseText(''); }}
                    className="btn btn-primary btn-sm"
                  >
                    {t('btn_reply_resolve')}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complaint Response Modal */}
      {selectedComplaint && (
        <div className="modal-overlay" onClick={() => setSelectedComplaint(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <button className="modal-close" onClick={() => setSelectedComplaint(null)}>
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: 6 }}>{t('respond_to_grievance')}</h3>
            <p style={{ fontSize: '0.88rem', color: '#5C6B5E', marginBottom: 16 }}>
              User: {selectedComplaint.userName} &bull; {selectedComplaint.subject}
            </p>

            <form onSubmit={handleResolveComplaint}>
              <div className="form-group">
                <label className="form-label">{t('admin_resolution_label')}</label>
                <textarea
                  value={adminResponseText}
                  onChange={(e) => setAdminResponseText(e.target.value)}
                  placeholder={t('admin_resolution_placeholder')}
                  className="form-textarea"
                  style={{ minHeight: 120 }}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg w-full mt-4">
                {t('send_resolution_close')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

