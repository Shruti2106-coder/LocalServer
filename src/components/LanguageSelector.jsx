import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export const LanguageSelector = ({ variant = 'navbar', className = '' }) => {
  const { language, setLanguage, supportedLanguages, currentLanguageInfo, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  // Mobile list variant (for mobile navigation drawer)
  if (variant === 'mobile-grid') {
    return (
      <div className={`lang-mobile-container ${className}`} style={{ width: '100%' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '0.8rem',
          fontWeight: 700,
          color: 'var(--color-text-muted)',
          marginBottom: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}>
          <Globe size={14} color="var(--color-primary)" />
          <span>{t('choose_language', 'Select Language / भाषा चुनें')}</span>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 8
        }}>
          {supportedLanguages.map((lang) => {
            const isCurrent = lang.code === language;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: isCurrent ? '2px solid var(--color-primary)' : '1px solid rgba(38,53,42,0.12)',
                  backgroundColor: isCurrent ? 'var(--color-sage)' : '#FFFDF7',
                  color: 'var(--color-dark-olive)',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{lang.nativeName}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{lang.name}</div>
                </div>
                {isCurrent && <Check size={14} color="var(--color-primary)" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Footer inline selector variant
  if (variant === 'footer') {
    return (
      <div className={`lang-footer-container ${className}`} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#FFFDF7', fontWeight: 600 }}>
          <Globe size={15} color="var(--color-primary)" />
          <span>Language:</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {supportedLanguages.map((lang) => {
            const isCurrent = lang.code === language;
            return (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: isCurrent ? '1px solid var(--color-primary)' : '1px solid rgba(255,253,247,0.15)',
                  backgroundColor: isCurrent ? 'rgba(168,184,138,0.25)' : 'transparent',
                  color: isCurrent ? 'var(--color-primary)' : '#FFFDF7',
                  fontSize: '0.8rem',
                  fontWeight: isCurrent ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title={`${lang.name} (${lang.region})`}
              >
                {lang.nativeName}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Default navbar dropdown variant
  return (
    <div className={`lang-selector-wrapper ${className}`} ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-outline btn-sm lang-trigger-btn"
        title="Change website language / भाषा बदलें"
        aria-label="Select Language"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '0.84rem',
          padding: '6px 10px',
          backgroundColor: '#FFFDF7',
          borderColor: isOpen ? 'var(--color-primary)' : 'rgba(38,53,42,0.18)',
          color: 'var(--color-dark-olive)',
          fontWeight: 600,
          borderRadius: 10,
          cursor: 'pointer',
          boxShadow: isOpen ? '0 0 0 2px rgba(168,184,138,0.3)' : 'none'
        }}
      >
        <Globe size={14} color="var(--color-primary)" />
        <span style={{ fontWeight: 700 }}>
          {currentLanguageInfo.nativeName}
        </span>
        <ChevronDown size={13} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            background: '#FFFDF7',
            border: '1px solid rgba(38,53,42,0.14)',
            borderRadius: 14,
            boxShadow: '0 12px 32px rgba(38,53,42,0.16)',
            padding: '12px',
            zIndex: 100,
            width: 290,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 8,
            borderBottom: '1px solid rgba(38,53,42,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Globe size={15} color="var(--color-primary)" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-dark-olive)' }}>
                {t('select_language', 'Select Language / भाषा')}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                padding: 2
              }}
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>

          {/* Languages Grid */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            maxHeight: 340,
            overflowY: 'auto'
          }}>
            {supportedLanguages.map((lang) => {
              const isCurrent = lang.code === language;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: isCurrent ? '1.5px solid var(--color-primary)' : '1px solid transparent',
                    background: isCurrent ? 'var(--color-sage)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent) e.currentTarget.style.backgroundColor = 'rgba(221,229,200,0.35)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-dark-olive)' }}>
                        {lang.nativeName}
                      </span>
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '1px 6px',
                        borderRadius: 4,
                        backgroundColor: isCurrent ? 'var(--color-primary)' : 'rgba(38,53,42,0.06)',
                        color: 'var(--color-dark-olive)',
                        fontWeight: 600
                      }}>
                        {lang.code.toUpperCase()}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                      {lang.name} • {lang.region}
                    </span>
                  </div>

                  {isCurrent && (
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Check size={12} color="#FFFDF7" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
