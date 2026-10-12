import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle, Wrench, Shield, User, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export const LoginPage = () => {
  const { login, switchDemoRole } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.user.role === 'admin') navigate('/admin');
        else if (res.user.role === 'provider') navigate('/provider/dashboard');
        else navigate('/customer/dashboard');
      }
    } catch (err) {
      setError(err.message || t('invalid_credentials', 'Invalid credentials.'));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    setLoading(true);
    setError('');
    try {
      const res = await switchDemoRole(role);
      if (res.success) {
        if (role === 'admin') navigate('/admin');
        else if (role === 'provider') navigate('/provider/dashboard');
        else navigate('/customer/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: 440 }}>
        <div className="card" style={{ padding: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: 'var(--color-sage)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-dark-olive)',
              marginBottom: 12
            }}>
              <Wrench size={24} />
            </div>
            <h2 style={{ fontSize: '1.7rem', margin: 0 }}>{t('welcome_back')}</h2>
            <p style={{ fontSize: '0.9rem', color: '#5C6B5E', margin: '4px 0 0 0' }}>
              {t('signin_subtitle')}
            </p>
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: 12,
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: 'var(--radius-md)',
              marginBottom: 16,
              fontSize: '0.88rem'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('email_address')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">{t('password_label')}</label>
                <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--color-dark-olive)', textDecoration: 'underline' }}>
                  {t('forgot_password_link')}
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-full mt-4"
            >
              {loading ? t('signing_in') : t('nav_signin')}
            </button>
          </form>

          {/* Quick Demo Personas */}
          <div style={{ margin: '24px 0 16px', textAlign: 'center', borderTop: '1px solid rgba(38,53,42,0.1)', paddingTop: 18 }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#7E8D80', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('instant_demo_access')}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => handleQuickDemo('customer')}
                className="btn btn-outline btn-sm"
                style={{ justifyContent: 'flex-start', padding: '8px 12px' }}
              >
                <User size={15} />
                <span>{t('customer_priya')}</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('provider')}
                className="btn btn-outline btn-sm"
                style={{ justifyContent: 'flex-start', padding: '8px 12px' }}
              >
                <Briefcase size={15} />
                <span>{t('provider_rahul')}</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="btn btn-outline btn-sm"
                style={{ justifyContent: 'flex-start', padding: '8px 12px' }}
              >
                <Shield size={15} />
                <span>{t('admin_overseer')}</span>
              </button>
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.88rem', color: '#5C6B5E', margin: 0 }}>
            {t('dont_have_account')}{' '}
            <Link to="/register" style={{ fontWeight: 700, color: 'var(--color-dark-olive)', textDecoration: 'underline' }}>
              {t('register_here')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

