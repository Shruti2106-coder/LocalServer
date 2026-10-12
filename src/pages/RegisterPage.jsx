import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, AlertCircle, Wrench, Shield, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'provider' ? 'provider' : 'customer';

  const { register } = useAuth();
  const { t, tCategory } = useLanguage();
  const navigate = useNavigate();

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Provider specific fields
  const [category, setCategory] = useState('Plumbing');
  const [businessName, setBusinessName] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('passwords_dont_match', 'Passwords do not match.'));
      return;
    }

    if (password.length < 6) {
      setError(t('password_min_length', 'Password must be at least 6 characters long.'));
      return;
    }

    setLoading(true);

    try {
      const res = await register({
        name,
        email,
        phone,
        password,
        role,
        city,
        address,
        category: role === 'provider' ? category : undefined,
        businessName: role === 'provider' ? businessName : undefined
      });

      if (res.success) {
        if (role === 'provider') navigate('/provider/dashboard');
        else navigate('/customer/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: 520 }}>
        <div className="card" style={{ padding: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.7rem', margin: 0 }}>{t('create_account_title')}</h2>
            <p style={{ fontSize: '0.9rem', color: '#5C6B5E', margin: '4px 0 0 0' }}>
              {t('register_subtitle')}
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            <button
              type="button"
              onClick={() => setRole('customer')}
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: role === 'customer' ? '2px solid var(--color-dark-olive)' : '1px solid rgba(38,53,42,0.12)',
                backgroundColor: role === 'customer' ? 'var(--color-sage)' : '#FFFDF7',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              {t('i_am_customer')}
            </button>
            <button
              type="button"
              onClick={() => setRole('provider')}
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: role === 'provider' ? '2px solid var(--color-dark-olive)' : '1px solid rgba(38,53,42,0.12)',
                backgroundColor: role === 'provider' ? 'var(--color-sage)' : '#FFFDF7',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              {t('i_am_provider')}
            </button>
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
              <label className="form-label">{t('full_name')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g. Priya Sharma"
                className="form-input"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">{t('email_address')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('phone_number')}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98200 00000"
                  className="form-input"
                  required
                />
              </div>
            </div>

            {role === 'provider' && (
              <>
                <div className="form-group">
                  <label className="form-label">{t('business_trade_name')}</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="E.g. Verma Leak Repair & Plumbing Works"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('primary_category')}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-select"
                  >
                    <option value="Plumbing">{tCategory('Plumbing')}</option>
                    <option value="Electrical">{tCategory('Electrical')}</option>
                    <option value="Cleaning">{tCategory('Cleaning')}</option>
                    <option value="Computer Repair">{tCategory('Computer Repair')}</option>
                    <option value="Tutoring">{tCategory('Tutoring')}</option>
                    <option value="Mechanic">{tCategory('Mechanic')}</option>
                    <option value="Carpentry">{tCategory('Carpentry')}</option>
                    <option value="Painting">{tCategory('Painting')}</option>
                    <option value="Appliance Repair">{tCategory('Appliance Repair')}</option>
                  </select>
                </div>
              </>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">{t('table_city')}</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Mumbai, Pune, etc."
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('locality_label')}</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Andheri West, Bandra, etc."
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">{t('password_label')}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('confirm_password_label')}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-full mt-4"
            >
              {loading ? t('registering') : role === 'provider' ? t('register_as_provider') : t('register_as_customer')}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.88rem', color: '#5C6B5E', margin: '20px 0 0 0' }}>
            {t('already_have_account')}{' '}
            <Link to="/login" style={{ fontWeight: 700, color: 'var(--color-dark-olive)', textDecoration: 'underline' }}>
              {t('nav_signin')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

