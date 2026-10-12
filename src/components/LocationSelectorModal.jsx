import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Check,
  X,
  RotateCcw,
  Loader2,
  Building2,
  Compass
} from 'lucide-react';
import { useLocationContext } from '../context/LocationContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export const LocationSelectorModal = ({ isOpen, onClose }) => {
  const {
    location,
    city,
    area,
    status,
    isLoading,
    requestLocation,
    setManualLocation,
    clearLocation
  } = useLocationContext();
  const { t } = useLanguage();

  const [inputCity, setInputCity] = useState('');
  const [inputArea, setInputArea] = useState('');

  if (!isOpen) return null;

  const POPULAR_CITIES = [
    'Mumbai',
    'Pune',
    'Thane',
    'Navi Mumbai',
    'Delhi',
    'Bengaluru',
    'Hyderabad',
    'Chennai',
    'Ahmedabad',
    'Kolkata'
  ];

  const handleApplyManual = (e) => {
    e.preventDefault();
    if (inputCity.trim()) {
      setManualLocation(inputCity.trim(), inputArea.trim());
      setInputCity('');
      setInputArea('');
      onClose();
    }
  };

  const handleSelectCity = (c) => {
    setManualLocation(c);
    onClose();
  };

  const handleAutoDetect = () => {
    requestLocation({ isRetry: true });
    // Keep modal open or close after brief delay
  };

  const displayLocationText = area && city ? `${area}, ${city}` : city || t('loc_select_city');

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 110 }}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 440, padding: 24 }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: 'var(--color-sage)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-dark-olive)'
              }}
            >
              <Compass size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>{t('loc_select_city')}</h3>
              <div style={{ fontSize: '0.78rem', color: '#5C6B5E' }}>
                {location?.source === 'geolocation'
                  ? t('loc_auto_detected')
                  : location
                  ? t('loc_manual_selected')
                  : t('tagline')}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-outline"
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Current Active Location display */}
        {location && (
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--color-cream)',
              borderRadius: 10,
              border: '1px solid rgba(168,184,138,0.5)',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MapPin size={18} color="var(--color-dark-olive)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{displayLocationText}</div>
                {location.formattedAddress && location.formattedAddress !== displayLocationText && (
                  <div style={{ fontSize: '0.75rem', color: '#5C6B5E' }}>
                    {location.formattedAddress}
                  </div>
                )}
              </div>
            </div>
            <span
              style={{
                fontSize: '0.72rem',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-dark-olive)',
                padding: '2px 8px',
                borderRadius: 6,
                fontWeight: 700
              }}
            >
              {location.source === 'geolocation' ? 'GPS' : 'Manual'}
            </span>
          </div>
        )}

        {/* Action: Use Current GPS Location */}
        <button
          onClick={handleAutoDetect}
          disabled={isLoading}
          className="btn btn-outline"
          style={{
            width: '100%',
            marginBottom: 18,
            justifyContent: 'center',
            backgroundColor: '#FFFDF7',
            borderColor: 'var(--color-primary)',
            padding: '10px 14px',
            fontSize: '0.9rem'
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="spin-animation" />
              <span>{t('loc_detecting')}</span>
            </>
          ) : (
            <>
              <Navigation size={16} color="var(--color-dark-olive)" />
              <span style={{ fontWeight: 600 }}>{t('loc_use_current')}</span>
            </>
          )}
        </button>

        {/* Quick Popular Cities */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#5C6B5E', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Building2 size={14} />
            <span>{t('loc_popular_cities')}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {POPULAR_CITIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleSelectCity(c)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: '0.82rem',
                  border: '1px solid rgba(38,53,42,0.12)',
                  background: city === c ? 'var(--color-primary)' : '#FFFDF7',
                  color: 'var(--color-dark-olive)',
                  cursor: 'pointer',
                  fontWeight: city === c ? 700 : 500,
                  transition: 'all 0.15s ease'
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Manual Address Input Form */}
        <form onSubmit={handleApplyManual} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#5C6B5E' }}>
            {t('loc_enter_manually')}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={inputCity}
              onChange={(e) => setInputCity(e.target.value)}
              placeholder={t('loc_manual_placeholder')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid rgba(38,53,42,0.2)',
                fontSize: '0.86rem',
                backgroundColor: '#FFFDF7'
              }}
            />
            <button
              type="submit"
              disabled={!inputCity.trim()}
              className="btn btn-primary btn-sm"
              style={{ padding: '8px 16px' }}
            >
              <Check size={14} />
              <span>{t('loc_save_location')}</span>
            </button>
          </div>
        </form>

        {/* Footer actions */}
        {location && (
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <button
              onClick={() => {
                clearLocation();
                onClose();
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#888',
                fontSize: '0.78rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {t('loc_clear')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
