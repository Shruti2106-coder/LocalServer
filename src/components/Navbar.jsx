import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Wrench,
  Bell,
  User,
  LogOut,
  Sparkles,
  Menu,
  X,
  Shield,
  Briefcase,
  ChevronDown,
  MapPin,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useLocationContext } from '../context/LocationContext.jsx';
import { NotificationDropdown } from './NotificationDropdown.jsx';
import { LocationSelectorModal } from './LocationSelectorModal.jsx';
import { LanguageSelector } from './LanguageSelector.jsx';
import { api } from '../services/api.js';

export const Navbar = ({ onOpenAiModal }) => {
  const { user, isAuthenticated, logout, switchDemoRole } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { city, area, isLoading: isLocLoading } = useLocationContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/notifications')
        .then(res => {
          if (res.success) setUnreadCount(res.unreadCount);
        })
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleDemoSwitch = async (role) => {
    setDemoMenuOpen(false);
    await switchDemoRole(role);
    if (role === 'admin') navigate('/admin');
    else if (role === 'provider') navigate('/provider/dashboard');
    else navigate('/customer/dashboard');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'provider') return '/provider/dashboard';
    return '/customer/dashboard';
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* Brand */}
        <Link to="/" className="logo">
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            backgroundColor: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-dark-olive)'
          }}>
            <Wrench size={20} />
          </div>
          <span>{t('brand')}</span>
          <span className="logo-badge">Pro</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              {t('nav_home')}
            </Link>
            <Link to="/services" className={`nav-link ${location.pathname === '/services' ? 'active' : ''}`}>
              {t('nav_services')}
            </Link>
            <Link to="/providers" className={`nav-link ${location.pathname === '/providers' ? 'active' : ''}`}>
              {t('nav_providers')}
            </Link>
            <Link to="/how-it-works" className={`nav-link ${location.pathname === '/how-it-works' ? 'active' : ''}`}>
              {t('nav_how_it_works')}
            </Link>
            <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>
              {t('nav_about')}
            </Link>
          </div>

          <style>{`
            @media (max-width: 960px) {
              .desktop-links { display: none !important; }
            }
          `}</style>
        </div>

        {/* Right Controls */}
        <div className="nav-right">
          {/* Location Selector Pill */}
          <button
            onClick={() => setLocationModalOpen(true)}
            className="btn btn-outline btn-sm"
            title={t('loc_select_city')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.82rem',
              padding: '5px 10px',
              backgroundColor: '#FFFDF7',
              borderColor: 'rgba(38,53,42,0.18)',
              maxWidth: 165,
              whiteSpace: 'nowrap'
            }}
          >
            {isLocLoading ? (
              <Loader2 size={13} className="spin-animation" color="#7E8D80" />
            ) : (
              <MapPin size={13} color="var(--color-primary)" />
            )}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {isLocLoading
                ? t('loc_detecting')
                : city
                ? (area ? `${area}, ${city}` : city)
                : t('loc_current_location')}
            </span>
          </button>

          {/* AI Assistant Quick Trigger */}
          <button
            onClick={onOpenAiModal}
            className="btn btn-secondary btn-sm"
            title={t('nav_ai_assistant')}
            style={{ fontWeight: 700 }}
          >
            <Sparkles size={15} color="#26352A" />
            <span style={{ display: 'none' }} className="ai-btn-text">{t('nav_ai_help')}</span>
            <span className="ai-full-text">{t('nav_ai_assistant')}</span>
          </button>
          <style>{`
            @media (max-width: 600px) {
              .ai-full-text { display: none !important; }
              .ai-btn-text { display: inline !important; }
            }
          `}</style>

          {/* Language Selector */}
          <LanguageSelector />

          {/* Demo Persona Switcher Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.82rem', padding: '5px 10px', background: '#FFFDF7' }}
              title="Test with pre-configured accounts"
            >
              <span>{t('nav_demo_role')}</span>
              <ChevronDown size={13} />
            </button>
            {demoMenuOpen && (
              <div style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                background: '#FFFDF7',
                border: '1px solid rgba(38,53,42,0.12)',
                borderRadius: 12,
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                padding: '8px',
                zIndex: 60,
                width: 200,
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7E8D80', padding: '4px 8px' }}>
                  {t('quick_role_switch')}
                </div>
                <button
                  onClick={() => handleDemoSwitch('customer')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: 'none',
                    background: user?.role === 'customer' ? 'var(--color-sage)' : 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    textAlign: 'left'
                  }}
                >
                  <User size={14} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{t('role_customer')}</div>
                    <div style={{ fontSize: '0.72rem', color: '#5C6B5E' }}>{t('role_customer_desc')}</div>
                  </div>
                </button>
                <button
                  onClick={() => handleDemoSwitch('provider')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: 'none',
                    background: user?.role === 'provider' ? 'var(--color-sage)' : 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    textAlign: 'left'
                  }}
                >
                  <Briefcase size={14} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{t('role_provider')}</div>
                    <div style={{ fontSize: '0.72rem', color: '#5C6B5E' }}>{t('role_provider_desc')}</div>
                  </div>
                </button>
                <button
                  onClick={() => handleDemoSwitch('admin')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: 'none',
                    background: user?.role === 'admin' ? 'var(--color-sage)' : 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    textAlign: 'left'
                  }}
                >
                  <Shield size={14} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{t('role_admin')}</div>
                    <div style={{ fontSize: '0.72rem', color: '#5C6B5E' }}>{t('role_admin_desc')}</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Notifications */}
          {isAuthenticated && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="btn-icon btn-ghost"
                title="Notifications"
                style={{ position: 'relative' }}
              >
                <Bell size={20} color="var(--color-dark-olive)" />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    backgroundColor: 'var(--color-peach)',
                    color: 'var(--color-dark-olive)',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    width: 17,
                    height: 17,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>
              <NotificationDropdown isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>
          )}

          {/* Auth State */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to={getDashboardPath()} className="btn btn-primary btn-sm">
                <User size={15} />
                <span>{user?.name?.split(' ')[0] || t('nav_dashboard')}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="btn-icon btn-ghost"
                title={t('nav_logout')}
              >
                <LogOut size={18} color="var(--color-dark-olive)" />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to="/login" className="btn btn-ghost btn-sm">
                {t('nav_signin')}
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                {t('nav_get_started')}
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn-icon btn-ghost mobile-menu-btn"
            style={{ display: 'none' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <style>{`
            @media (max-width: 960px) {
              .mobile-menu-btn { display: inline-flex !important; }
            }
          `}</style>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#FFFDF7',
          borderBottom: '1px solid rgba(38,53,42,0.1)',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="nav-link">
            {t('nav_home')}
          </Link>
          <Link to="/services" onClick={() => setMobileMenuOpen(false)} className="nav-link">
            {t('nav_services')}
          </Link>
          <Link to="/providers" onClick={() => setMobileMenuOpen(false)} className="nav-link">
            {t('nav_providers')}
          </Link>
          <Link to="/how-it-works" onClick={() => setMobileMenuOpen(false)} className="nav-link">
            {t('nav_how_it_works')}
          </Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="nav-link">
            {t('nav_about')}
          </Link>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setLocationModalOpen(true);
            }}
            className="btn btn-outline btn-sm"
            style={{ justifyContent: 'flex-start', background: '#FFFDF7', gap: 8, padding: '8px 12px' }}
          >
            <MapPin size={16} color="var(--color-primary)" />
            <span>
              {city ? (area ? `${area}, ${city}` : city) : t('loc_select_city')}
            </span>
          </button>

          <div style={{ margin: '8px 0', borderTop: '1px solid rgba(38,53,42,0.08)', paddingTop: '10px' }}>
            <LanguageSelector variant="mobile-grid" />
          </div>

          {isAuthenticated ? (
            <>
              <Link to={getDashboardPath()} onClick={() => setMobileMenuOpen(false)} className="btn btn-primary btn-sm">
                {t('nav_dashboard')}
              </Link>
              <button onClick={handleLogout} className="btn btn-danger btn-sm">
                {t('nav_logout')}
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-outline btn-sm w-full">
                {t('nav_signin')}
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary btn-sm w-full">
                {t('nav_get_started')}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Global Location Selector Modal */}
      <LocationSelectorModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />
    </header>
  );
};
