import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  Star,
  Loader2
} from 'lucide-react';
import { api } from '../services/api.js';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';

export const AiAssistantModal = ({ isOpen, onClose, onSelectProviderForBooking }) => {
  const { t, tCategory } = useLanguage();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const quickPrompts = [
    'My kitchen tap is leaking water under the cabinet.',
    'My laptop does not turn on and screen is blank.',
    'Living room MCB keeps tripping whenever AC turns on.',
    'Need intensive bathroom scrubbing and deep descaling.',
    'Two-wheeler battery dead, need doorstep jumpstart.'
  ];

  const handleAsk = async (queryText) => {
    const textToSubmit = queryText || prompt;
    if (!textToSubmit.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.post('/ai/recommend', { prompt: textToSubmit });
      if (res.success) {
        setResult(res.data);
      }
    } catch (err) {
      setError(err.message || 'Unable to analyze request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBrowseCategory = (category) => {
    navigate(`/providers?category=${encodeURIComponent(category.toLowerCase())}`);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: 'var(--color-peach)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-dark-olive)'
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{t('ai_modal_title')}</h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#5C6B5E' }}>
              {t('ai_modal_subtitle')}
            </p>
          </div>
        </div>

        {/* Input area */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleAsk(prompt); }}
          style={{ margin: '18px 0 12px 0' }}
        >
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t('ai_input_placeholder')}
              className="form-input"
              style={{
                paddingRight: 100,
                borderRadius: 'var(--radius-lg)',
                paddingTop: 14,
                paddingBottom: 14,
                fontSize: '0.98rem'
              }}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="btn btn-primary btn-sm"
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 16px'
              }}
            >
              {loading ? <Loader2 size={16} className="pulse" /> : <Send size={16} />}
              <span>{t('btn_ask_ai')}</span>
            </button>
          </div>
        </form>

        {/* Quick suggestions chips */}
        {!result && (
          <div style={{ marginBottom: 20 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#7E8D80', display: 'block', marginBottom: 8 }}>
              {t('try_common_examples')}
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setPrompt(q); handleAsk(q); }}
                  style={{
                    backgroundColor: 'rgba(244, 241, 222, 0.7)',
                    border: '1px solid rgba(38, 53, 42, 0.1)',
                    borderRadius: 'var(--radius-full)',
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    color: '#26352A',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: 'var(--radius-md)',
            marginBottom: 16,
            fontSize: '0.88rem'
          }}>
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '36px 0', color: '#5C6B5E' }}>
            <Loader2 size={32} className="pulse" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 600 }}>{t('analyzing_problem')}</p>
            <p style={{ fontSize: '0.8rem', color: '#7E8D80' }}>{t('matching_symptoms')}</p>
          </div>
        )}

        {/* Results view */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Recommendation Card */}
            <div style={{
              backgroundColor: 'rgba(221, 229, 200, 0.35)',
              border: '1px solid var(--color-primary)',
              borderRadius: 'var(--radius-lg)',
              padding: 20
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#5C6B5E', textTransform: 'uppercase' }}>
                    {t('recommended_service')}
                  </span>
                  <h4 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--color-dark-olive)' }}>
                    {tCategory(result.recommendation.recommendedCategory)}
                  </h4>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#26352A', marginTop: 2 }}>
                    {result.recommendation.serviceTitle}
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'var(--color-sage)',
                  color: 'var(--color-dark-olive)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: 800
                }}>
                  {result.recommendation.confidence}% {t('match_percentage')}
                </div>
              </div>

              <p style={{ fontSize: '0.92rem', color: '#26352A', lineHeight: 1.5, margin: '8px 0 12px 0' }}>
                <strong>{t('reason_colon')}</strong> {result.recommendation.reason}
              </p>

              {result.recommendation.troubleshootingTip && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  backgroundColor: '#FFFDF7',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.84rem',
                  color: '#26352A',
                  marginBottom: 12
                }}>
                  <Lightbulb size={16} color="#D9822B" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong>{t('immediate_tip_colon')}</strong> {result.recommendation.troubleshootingTip}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem', color: '#5C6B5E' }}>
                <span>{t('typical_pricing_colon')} <strong>{result.recommendation.estimatedPriceRange || '₹399 - ₹799'}</strong></span>
                <button
                  onClick={() => handleBrowseCategory(result.recommendation.recommendedCategory)}
                  className="btn btn-outline btn-sm"
                >
                  <span>{t('browse_all_category')} {tCategory(result.recommendation.recommendedCategory)}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Suggested verified professionals */}
            <div>
              <h5 style={{ fontSize: '1rem', marginBottom: 10, color: 'var(--color-dark-olive)' }}>
                {t('available_top_pros')}
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.matchedProviders && result.matchedProviders.length > 0 ? (
                  result.matchedProviders.slice(0, 2).map((prov) => (
                    <div
                      key={prov._id}
                      style={{
                        backgroundColor: '#FFFDF7',
                        border: '1px solid var(--color-card-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img
                          src={prov.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                          alt={prov.businessName}
                          style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{prov.businessName}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#5C6B5E' }}>
                            <Star size={12} fill="#D9822B" stroke="#D9822B" />
                            <span>{prov.rating} ({prov.reviewCount} {t('reviews')})</span>
                            &bull;
                            <span>₹{prov.hourlyRate}{t('per_visit')}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onClose();
                          if (onSelectProviderForBooking) onSelectProviderForBooking(prov);
                        }}
                        className="btn btn-primary btn-sm"
                      >
                        {t('btn_book_this_pro')}
                      </button>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '0.85rem', color: '#7E8D80' }}>
                    {t('view_all_providers')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
