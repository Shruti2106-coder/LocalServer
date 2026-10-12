import React from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Users,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  MessageCircle,
  Award,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export const HowItWorksPage = () => {
  const { t } = useLanguage();

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 900 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#5C6B5E', textTransform: 'uppercase' }}>
            {t('tagline')}
          </span>
          <h1 style={{ marginTop: 6, marginBottom: 12 }}>{t('how_it_works_page_title')}</h1>
          <p style={{ fontSize: '1.1rem', color: '#5C6B5E' }}>
            {t('how_it_works_page_sub')}
          </p>
        </div>

        {/* Customer Guide */}
        <div className="card" style={{ padding: 36, marginBottom: 36 }}>
          <h2 style={{ fontSize: '1.6rem', marginBottom: 20 }}>{t('for_customers_title')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            <div>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: 'var(--color-sage)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                marginBottom: 12
              }}>
                1
              </div>
              <h4 style={{ marginBottom: 6 }}>{t('hiw_step_1_title')}</h4>
              <p style={{ fontSize: '0.9rem', color: '#5C6B5E' }}>
                {t('hiw_step_1_desc')}
              </p>
            </div>

            <div>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: 'var(--color-sage)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                marginBottom: 12
              }}>
                2
              </div>
              <h4 style={{ marginBottom: 6 }}>{t('hiw_step_2_title')}</h4>
              <p style={{ fontSize: '0.9rem', color: '#5C6B5E' }}>
                {t('hiw_step_2_desc')}
              </p>
            </div>

            <div>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: 'var(--color-sage)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                marginBottom: 12
              }}>
                3
              </div>
              <h4 style={{ marginBottom: 6 }}>{t('hiw_step_3_title')}</h4>
              <p style={{ fontSize: '0.9rem', color: '#5C6B5E' }}>
                {t('hiw_step_3_desc')}
              </p>
            </div>

            <div>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: 'var(--color-sage)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                marginBottom: 12
              }}>
                4
              </div>
              <h4 style={{ marginBottom: 6 }}>{t('hiw_step_4_title')}</h4>
              <p style={{ fontSize: '0.9rem', color: '#5C6B5E' }}>
                {t('hiw_step_4_desc')}
              </p>
            </div>
          </div>
        </div>

        {/* Safety & Trust Promises */}
        <div style={{
          backgroundColor: 'var(--color-sage)',
          borderRadius: 'var(--radius-xl)',
          padding: 36,
          marginBottom: 36
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 20 }}>{t('safety_promise_title')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <ShieldCheck size={28} color="#26352A" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '1rem', display: 'block', marginBottom: 4 }}>{t('id_verification_title')}</strong>
                <p style={{ fontSize: '0.86rem', color: '#26352A', margin: 0 }}>
                  {t('id_verification_desc')}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <Award size={28} color="#26352A" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '1rem', display: 'block', marginBottom: 4 }}>{t('transparent_rates_title')}</strong>
                <p style={{ fontSize: '0.86rem', color: '#26352A', margin: 0 }}>
                  {t('transparent_rates_desc')}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <MessageCircle size={28} color="#26352A" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '1rem', display: 'block', marginBottom: 4 }}>{t('direct_messaging_title')}</strong>
                <p style={{ fontSize: '0.86rem', color: '#26352A', margin: 0 }}>
                  {t('direct_messaging_desc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to actions */}
        <div style={{ textAlign: 'center' }}>
          <Link to="/providers" className="btn btn-primary btn-lg" style={{ marginRight: 12 }}>
            {t('btn_find_service_provider')}
          </Link>
          <Link to="/register?role=provider" className="btn btn-outline btn-lg">
            {t('btn_become_provider')}
          </Link>
        </div>
      </div>
    </div>
  );
};

