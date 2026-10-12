import React from 'react';
import { X, Star, Check, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export const CompareModal = ({ providers, isOpen, onClose, onBookProvider, onRemoveProvider }) => {
  const { t, tCategory } = useLanguage();

  if (!isOpen || !providers || providers.length === 0) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 860 }}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <h3 style={{ margin: '0 0 6px 0', fontSize: '1.4rem' }}>{t('compare_title')}</h3>
        <p style={{ margin: '0 0 20px 0', fontSize: '0.88rem', color: '#5C6B5E' }}>
          {t('compare_subtitle')}
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(38,53,42,0.1)' }}>
                <th style={{ padding: '12px 16px', color: '#7E8D80', width: '22%' }}>{t('feature_label')}</th>
                {providers.map((p) => (
                  <th key={p._id} style={{ padding: '12px 16px', minWidth: 200, verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#26352A' }}>
                          {p.businessName || p.providerName}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#5C6B5E' }}>{tCategory(p.category)}</div>
                      </div>
                      {onRemoveProvider && (
                        <button
                          onClick={() => onRemoveProvider(p._id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7E8D80' }}
                          title={t('cancel')}
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(38,53,42,0.06)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#5C6B5E' }}>{t('comp_starting_rate')}</td>
                {providers.map((p) => (
                  <td key={p._id} style={{ padding: '12px 16px', fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-dark-olive)' }}>
                    ₹{p.hourlyRate} {t('per_visit')}
                  </td>
                ))}
              </tr>

              <tr style={{ borderBottom: '1px solid rgba(38,53,42,0.06)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#5C6B5E' }}>{t('comp_rating_reviews')}</td>
                {providers.map((p) => (
                  <td key={p._id} style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, color: '#D9822B' }}>
                      <Star size={15} fill="#D9822B" stroke="#D9822B" />
                      <span>{Number(p.rating).toFixed(1)}</span>
                      <span style={{ color: '#7E8D80', fontWeight: 400, fontSize: '0.8rem' }}>({p.reviewCount} {t('reviews')})</span>
                    </div>
                  </td>
                ))}
              </tr>

              <tr style={{ borderBottom: '1px solid rgba(38,53,42,0.06)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#5C6B5E' }}>{t('comp_verification')}</td>
                {providers.map((p) => (
                  <td key={p._id} style={{ padding: '12px 16px' }}>
                    {p.isVerified ? (
                      <span style={{ color: '#03543f', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <ShieldCheck size={16} /> {t('verified_pro')}
                      </span>
                    ) : (
                      <span style={{ color: '#7E8D80' }}>{t('standard_provider')}</span>
                    )}
                  </td>
                ))}
              </tr>

              <tr style={{ borderBottom: '1px solid rgba(38,53,42,0.06)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#5C6B5E' }}>{t('comp_experience')}</td>
                {providers.map((p) => (
                  <td key={p._id} style={{ padding: '12px 16px' }}>
                    {p.experienceYears || 3} {t('years')}
                  </td>
                ))}
              </tr>

              <tr style={{ borderBottom: '1px solid rgba(38,53,42,0.06)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#5C6B5E' }}>{t('comp_coverage_area')}</td>
                {providers.map((p) => (
                  <td key={p._id} style={{ padding: '12px 16px' }}>
                    {p.city} &bull; {p.serviceArea || 'Citywide'}
                  </td>
                ))}
              </tr>

              <tr style={{ borderBottom: '1px solid rgba(38,53,42,0.06)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#5C6B5E' }}>{t('comp_working_hours')}</td>
                {providers.map((p) => (
                  <td key={p._id} style={{ padding: '12px 16px', fontSize: '0.84rem' }}>
                    {p.workingHours || '9:00 AM - 7:00 PM'}
                  </td>
                ))}
              </tr>

              <tr>
                <td style={{ padding: '16px' }}></td>
                {providers.map((p) => (
                  <td key={p._id} style={{ padding: '16px' }}>
                    <button
                      onClick={() => { onClose(); onBookProvider(p); }}
                      className="btn btn-primary btn-sm w-full"
                    >
                      {t('btn_book_now')}
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
