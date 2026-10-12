import React, { useState } from 'react';
import { MapPin, AlertCircle, RotateCcw, Edit3, X, HelpCircle, Check, Loader2 } from 'lucide-react';
import { useLocationContext } from '../context/LocationContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export const LocationBanner = () => {
  const {
    location,
    city,
    status,
    isLoading,
    isDenied,
    isError,
    isBannerVisible,
    requestLocation,
    setManualLocation,
    dismissBanner
  } = useLocationContext();
  const { t } = useLanguage();

  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCity, setManualCity] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const POPULAR_CITIES = ['Mumbai', 'Pune', 'Thane', 'Navi Mumbai', 'Delhi', 'Bengaluru'];

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCity.trim()) {
      setManualLocation(manualCity.trim());
      setShowManualInput(false);
      setManualCity('');
      dismissBanner();
    }
  };

  const handleQuickCitySelect = (c) => {
    setManualLocation(c);
    setShowManualInput(false);
    dismissBanner();
  };

  // 1. Loading State Banner (Detecting location)
  if (isLoading) {
    return (
      <div
        style={{
          backgroundColor: '#FFFDF7',
          borderBottom: '1px solid rgba(168, 184, 138, 0.4)',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          fontSize: '0.86rem',
          color: 'var(--color-dark-olive)',
          zIndex: 40,
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}
      >
        <Loader2 size={16} className="spin-animation" color="var(--color-primary)" />
        <span style={{ fontWeight: 600 }}>{t('loc_detecting')}</span>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .spin-animation {
            animation: spin 1s linear infinite;
          }
        `}</style>
      </div>
    );
  }

  // 2. Denied or Error State Banner
  if (isBannerVisible && isError) {
    return (
      <div
        style={{
          backgroundColor: '#FFF9E6',
          borderBottom: '1px solid #E9B89C',
          padding: '12px 16px',
          zIndex: 40,
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <AlertCircle size={20} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#92400E' }}>
                  {status === 'timeout'
                    ? t('loc_timeout_error')
                    : status === 'unavailable'
                    ? t('loc_unavailable_error')
                    : t('loc_permission_denied')}
                </div>
                <div style={{ fontSize: '0.84rem', color: '#78350F', marginTop: 3 }}>
                  {t('loc_permission_denied_desc')}
                </div>
              </div>
            </div>

            <button
              onClick={dismissBanner}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#92400E',
                padding: 4,
                display: 'flex',
                alignItems: 'center'
              }}
              title={t('loc_dismiss')}
            >
              <X size={18} />
            </button>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginLeft: 30 }}>
            <button
              onClick={() => requestLocation({ isRetry: true })}
              className="btn btn-sm btn-primary"
              style={{ fontSize: '0.82rem', padding: '6px 12px' }}
            >
              <RotateCcw size={14} />
              <span>{t('loc_retry')}</span>
            </button>

            <button
              onClick={() => setShowManualInput(!showManualInput)}
              className="btn btn-sm btn-outline"
              style={{ fontSize: '0.82rem', padding: '6px 12px', background: '#FFFDF7' }}
            >
              <Edit3 size={14} />
              <span>{t('loc_enter_manually')}</span>
            </button>

            <button
              onClick={() => setShowHelp(!showHelp)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#92400E',
                cursor: 'pointer',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                textDecoration: 'underline'
              }}
            >
              <HelpCircle size={14} />
              <span>{t('loc_enable_instructions')}</span>
            </button>
          </div>

          {/* Browser instructions expander */}
          {showHelp && (
            <div
              style={{
                marginLeft: 30,
                marginTop: 6,
                padding: '8px 12px',
                background: '#FFFDF7',
                borderRadius: 8,
                border: '1px solid rgba(233,184,156,0.5)',
                fontSize: '0.8rem',
                color: '#5C6B5E'
              }}
            >
              ℹ️ {t('loc_enable_instructions')}
            </div>
          )}

          {/* Inline Manual Location Picker */}
          {showManualInput && (
            <div
              style={{
                marginLeft: 30,
                marginTop: 8,
                padding: '12px',
                background: '#FFFDF7',
                borderRadius: 10,
                border: '1px solid rgba(38,53,42,0.12)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#5C6B5E' }}>
                {t('loc_popular_cities')}:
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {POPULAR_CITIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleQuickCitySelect(c)}
                    className="btn btn-sm"
                    style={{
                      fontSize: '0.78rem',
                      padding: '4px 10px',
                      background: city === c ? 'var(--color-primary)' : 'var(--color-sage)',
                      color: 'var(--color-dark-olive)',
                      border: 'none'
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <input
                  type="text"
                  value={manualCity}
                  onChange={(e) => setManualCity(e.target.value)}
                  placeholder={t('loc_manual_placeholder')}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: '1px solid rgba(38,53,42,0.2)',
                    fontSize: '0.85rem'
                  }}
                />
                <button type="submit" className="btn btn-sm btn-primary">
                  <Check size={14} />
                  <span>{t('loc_save_location')}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};
