import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Heart, Shield, Users, Award, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export const AboutPage = () => {
  const { t } = useLanguage();

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 840 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: 'var(--color-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-dark-olive)',
            marginBottom: 12
          }}>
            <Wrench size={24} />
          </div>
          <h1 style={{ fontSize: '2.4rem', margin: '0 0 10px 0' }}>{t('about_title')}</h1>
          <p style={{ fontSize: '1.2rem', color: '#5C6B5E', fontWeight: 600 }}>
            "{t('tagline')}"
          </p>
        </div>

        <div className="card" style={{ padding: 36, marginBottom: 32 }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: 14 }}>{t('our_mission')}</h3>
          <p style={{ fontSize: '1rem', lineHeight: 1.7, color: '#26352A', marginBottom: 16 }}>
            {t('mission_p1')}
          </p>
          <p style={{ fontSize: '1rem', lineHeight: 1.7, color: '#26352A', margin: 0 }}>
            {t('mission_p2')}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 36 }}>
          <div className="card" style={{ padding: 24 }}>
            <Shield size={26} color="#52796F" style={{ marginBottom: 10 }} />
            <h4 style={{ marginBottom: 6 }}>{t('pillar_trust_title')}</h4>
            <p style={{ fontSize: '0.88rem', color: '#5C6B5E', margin: 0 }}>
              {t('pillar_trust_desc')}
            </p>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <Users size={26} color="#D9822B" style={{ marginBottom: 10 }} />
            <h4 style={{ marginBottom: 6 }}>{t('pillar_trades_title')}</h4>
            <p style={{ fontSize: '0.88rem', color: '#5C6B5E', margin: 0 }}>
              {t('pillar_trades_desc')}
            </p>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <Heart size={26} color="#C05746" style={{ marginBottom: 10 }} />
            <h4 style={{ marginBottom: 6 }}>{t('pillar_community_title')}</h4>
            <p style={{ fontSize: '0.88rem', color: '#5C6B5E', margin: 0 }}>
              {t('pillar_community_desc')}
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link to="/providers" className="btn btn-primary btn-lg">
            {t('btn_explore_providers')}
          </Link>
        </div>
      </div>
    </div>
  );
};

