import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export const ForgotPasswordPage = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('123456');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.success) {
        setMessage(res.message);
        setStep(2);
      }
    } catch (err) {
      setError(err.message || 'Unable to request reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/reset-password', { email, code, newPassword });
      if (res.success) {
        setMessage(res.message);
        setStep(3);
      }
    } catch (err) {
      setError(err.message || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: 440 }}>
        <div className="card" style={{ padding: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: 'var(--color-peach)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-dark-olive)',
              marginBottom: 10
            }}>
              <KeyRound size={24} />
            </div>
            <h2 style={{ fontSize: '1.6rem', margin: 0 }}>{t('reset_password_title')}</h2>
            <p style={{ fontSize: '0.88rem', color: '#5C6B5E', margin: '4px 0 0 0' }}>
              {t('recover_account')}
            </p>
          </div>

          {error && (
            <div style={{ padding: 10, backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: 8, marginBottom: 14 }}>
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendCode}>
              <div className="form-group">
                <label className="form-label">{t('account_email_label')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="form-input"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full mt-4">
                {loading ? t('sending_code') : t('send_code')}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleReset}>
              <p style={{ fontSize: '0.85rem', color: '#03543f', backgroundColor: '#def7ec', padding: 10, borderRadius: 8, marginBottom: 14 }}>
                {message}
              </p>

              <div className="form-group">
                <label className="form-label">{t('verification_code_label')}</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('new_password_label')}</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full mt-4">
                {loading ? t('saving_password') : t('save_new_password')}
              </button>
            </form>
          )}

          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <CheckCircle2 size={44} color="#03543f" style={{ margin: '0 auto 12px' }} />
              <h4>{t('password_changed_title')}</h4>
              <p style={{ fontSize: '0.88rem', color: '#5C6B5E', marginBottom: 20 }}>
                {t('password_changed_desc')}
              </p>
              <Link to="/login" className="btn btn-primary w-full">
                {t('go_to_signin')}
              </Link>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 18 }}>
            <Link to="/login" style={{ fontSize: '0.88rem', color: 'var(--color-dark-olive)', textDecoration: 'underline' }}>
              {t('back_to_login')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

