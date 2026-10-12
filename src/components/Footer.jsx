import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Heart, Shield, Award, Phone, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { LanguageSelector } from './LanguageSelector.jsx';

export const Footer = () => {
  const { t, tCategory } = useLanguage();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-dark-olive)'
              }}>
                <Wrench size={18} />
              </div>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFDF7' }}>{t('brand')}</span>
            </div>
            <p style={{ color: '#DDE5C8', fontSize: '0.92rem', marginBottom: '18px', maxWidth: '320px' }}>
              {t('footer_desc')}
            </p>
            <div style={{ display: 'flex', gap: '12px', color: '#DDE5C8', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Shield size={14} color="#A8B88A" />
                <span>{t('verified_pro')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Award size={14} color="#A8B88A" />
                <span>{t('transparent_rates_title')}</span>
              </div>
            </div>
          </div>

          <div className="footer-col">
            <h4>{t('quick_links')}</h4>
            <ul>
              <li><Link to="/">{t('nav_home')}</Link></li>
              <li><Link to="/services">{t('services_title')}</Link></li>
              <li><Link to="/providers">{t('nav_providers')}</Link></li>
              <li><Link to="/how-it-works">{t('nav_how_it_works')}</Link></li>
              <li><Link to="/about">{t('nav_about')}</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>{t('popular_categories')}</h4>
            <ul>
              <li><Link to="/providers?category=plumbing">{tCategory('Plumbing')}</Link></li>
              <li><Link to="/providers?category=electrical">{tCategory('Electrical')}</Link></li>
              <li><Link to="/providers?category=cleaning">{tCategory('Cleaning')}</Link></li>
              <li><Link to="/providers?category=computer-repair">{tCategory('Computer Repair')}</Link></li>
              <li><Link to="/providers?category=tutoring">{tCategory('Tutoring')}</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>{t('support_contact')}</h4>
            <ul>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DDE5C8' }}>
                <Phone size={14} color="#A8B88A" />
                <span>+91 1800 200 4567</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DDE5C8' }}>
                <Mail size={14} color="#A8B88A" />
                <span>help@localserve.in</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DDE5C8' }}>
                <MapPin size={14} color="#A8B88A" />
                <span>Mumbai, Maharashtra</span>
              </li>
              <li><Link to="/login">{t('provider_console')}</Link></li>
            </ul>
          </div>
        </div>

        <div style={{ marginTop: '28px', paddingTop: '18px', borderTop: '1px solid rgba(255,253,247,0.12)' }}>
          <LanguageSelector variant="footer" />
        </div>

        <div className="footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} LocalServe Technologies Pvt Ltd. {t('all_rights_reserved')}
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>{t('privacy_policy')}</span>
            <span>{t('terms_of_service')}</span>
            <span>{t('safety_guidelines')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
