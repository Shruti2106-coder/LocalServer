import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  Shield,
  Star,
  Clock,
  CheckCircle2,
  Users,
  Wrench,
  Zap,
  BookOpen,
  Laptop,
  Car,
  Hammer,
  Paintbrush,
  Tv,
  Flower2,
  Navigation,
  Loader2
} from 'lucide-react';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useLocationContext } from '../context/LocationContext.jsx';
import { ProviderCard } from '../components/ProviderCard.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';

export const HomePage = ({ onOpenAiModal, onBookProvider, onCompareProvider, compareList = [] }) => {
  const { t, tCategory } = useLanguage();
  const { city, area, isLoading: isLocLoading, requestLocation } = useLocationContext();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [popularProviders, setPopularProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [userEditedLocation, setUserEditedLocation] = useState(false);

  // Sync detected location into locationQuery unless user manually changed it
  useEffect(() => {
    if (city && !userEditedLocation) {
      setLocationQuery(area ? `${area}, ${city}` : city);
    }
  }, [city, area, userEditedLocation]);

  const categoryIcons = {
    Plumbing: Wrench,
    Electrical: Zap,
    Cleaning: Sparkles,
    Tutoring: BookOpen,
    'Computer Repair': Laptop,
    Mechanic: Car,
    Carpentry: Hammer,
    Painting: Paintbrush,
    'Appliance Repair': Tv,
    Gardening: Flower2
  };

  useEffect(() => {
    Promise.all([
      api.get('/categories'),
      api.get('/providers?sortBy=rating_desc')
    ])
      .then(([catRes, provRes]) => {
        if (catRes.success) setCategories(catRes.data);
        if (provRes.success) setPopularProviders(provRes.data.slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (locationQuery.trim()) params.set('location', locationQuery.trim());
    navigate(`/providers?${params.toString()}`);
  };

  const testimonials = [
    {
      name: 'Rohan Kulkarni',
      area: 'Bandra West, Mumbai',
      role: 'Homeowner',
      text: 'Found a certified plumber within 10 minutes on a Sunday morning. Rahul arrived on time, had all parts, and fixed our leaking pipeline cleanly.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    },
    {
      name: 'Meera Iyer',
      area: 'Powai, Mumbai',
      role: 'Software Architect',
      text: 'SparklePro deep cleaning team was courteous and efficient. The transparent pricing without hidden charges makes LocalServe my go-to choice.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'
    },
    {
      name: 'Tanvi Nair',
      area: 'Thane West',
      role: 'Parent',
      text: 'Sneha coached my 10th-grade son in ICSE mathematics. His confidence jumped two grades in two months. Truly grateful for verified local tutors.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-content">
          <div className="hero-tagline">
            <Sparkles size={16} />
            <span>{t('tagline')}</span>
          </div>

          <h1 className="hero-title">{t('hero_headline')}</h1>
          <p className="hero-subtitle">{t('hero_subheading')}</p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="search-box-card">
            <div className="search-field">
              <Search size={18} color="#5C6B5E" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_service_placeholder')}
              />
            </div>

            <div className="search-field" style={{ position: 'relative' }}>
              <MapPin size={18} color="var(--color-primary)" />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => {
                  setLocationQuery(e.target.value);
                  setUserEditedLocation(true);
                }}
                placeholder={t('search_location_placeholder')}
              />
              <button
                type="button"
                onClick={() => {
                  setUserEditedLocation(false);
                  requestLocation({ isRetry: true });
                }}
                title={t('loc_use_current')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: isLocLoading ? '#7E8D80' : 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: 'auto'
                }}
              >
                {isLocLoading ? (
                  <Loader2 size={16} className="spin-animation" />
                ) : (
                  <Navigation size={16} />
                )}
              </button>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
              <Search size={16} />
              <span>{t('btn_find_service')}</span>
            </button>
          </form>

          {/* Quick AI Help trigger button */}
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.88rem', color: '#5C6B5E' }}>{t('not_sure_what_to_search')}</span>
            <button
              onClick={onOpenAiModal}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 700 }}
            >
              <Sparkles size={14} />
              <span>{t('describe_issue_to_ai')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Popular Service Categories Section */}
      <section className="section" style={{ backgroundColor: 'transparent' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2>{t('popular_categories')}</h2>
              <p style={{ marginTop: 4 }}>{t('popular_categories_subtitle')}</p>
            </div>
            <Link to="/services" className="btn btn-outline btn-sm">
              <span>{t('view_all_categories')}</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner text={t('loading')} />
          ) : (
            <div className="category-grid">
              {categories.slice(0, 8).map((cat) => {
                const IconComponent = categoryIcons[cat.name] || Wrench;
                return (
                  <div
                    key={cat._id}
                    className="category-card"
                    onClick={() => navigate(`/providers?category=${encodeURIComponent(cat.slug)}`)}
                  >
                    <div className="category-icon-wrapper">
                      <IconComponent size={26} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1rem', marginBottom: 4 }}>{tCategory(cat.name)}</h4>
                      <p style={{ fontSize: '0.78rem', color: '#7E8D80', margin: 0 }}>
                        {t('verified_pro')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* AI Assistant Banner */}
      <div className="container">
        <div className="ai-assistant-banner">
          <div style={{ maxWidth: 540 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: 'rgba(233, 184, 156, 0.25)', color: '#E9B89C', padding: '4px 12px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 700, marginBottom: 12 }}>
              <Sparkles size={14} />
              <span>{t('ai_banner_tag')}</span>
            </div>
            <h3 style={{ color: '#FFFDF7', fontSize: '1.8rem', marginBottom: 10 }}>
              {t('ai_banner_title')}
            </h3>
            <p style={{ color: '#DDE5C8', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
              {t('ai_banner_desc')}
            </p>
          </div>

          <div>
            <button
              onClick={onOpenAiModal}
              className="btn btn-peach btn-lg"
              style={{ fontWeight: 800 }}
            >
              <Sparkles size={18} />
              <span>{t('ai_banner_btn')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* How LocalServe Works */}
      <section className="section" style={{ backgroundColor: 'rgba(221, 229, 200, 0.25)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 12px auto' }}>
            <h2>{t('how_it_works_title')}</h2>
            <p style={{ marginTop: 6 }}>{t('how_it_works_subtitle')}</p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <span className="step-number">{t('step_01')}</span>
              <div className="step-icon">
                <Search size={28} />
              </div>
              <h4>{t('step_1_title')}</h4>
              <p style={{ fontSize: '0.88rem', marginTop: 8 }}>{t('step_1_desc')}</p>
            </div>

            <div className="step-card">
              <span className="step-number">{t('step_02')}</span>
              <div className="step-icon">
                <Users size={28} />
              </div>
              <h4>{t('step_2_title')}</h4>
              <p style={{ fontSize: '0.88rem', marginTop: 8 }}>{t('step_2_desc')}</p>
            </div>

            <div className="step-card">
              <span className="step-number">{t('step_03')}</span>
              <div className="step-icon">
                <Clock size={28} />
              </div>
              <h4>{t('step_3_title')}</h4>
              <p style={{ fontSize: '0.88rem', marginTop: 8 }}>{t('step_3_desc')}</p>
            </div>

            <div className="step-card">
              <span className="step-number">{t('step_04')}</span>
              <div className="step-icon">
                <CheckCircle2 size={28} />
              </div>
              <h4>{t('step_4_title')}</h4>
              <p style={{ fontSize: '0.88rem', marginTop: 8 }}>{t('step_4_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Providers Section */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2>{t('verified_pros_title')}</h2>
              <p style={{ marginTop: 4 }}>{t('verified_pros_subtitle')}</p>
            </div>
            <Link to="/providers" className="btn btn-primary btn-sm">
              <span>{t('view_all_providers')}</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="providers-grid">
            {popularProviders.map((prov) => (
              <ProviderCard
                key={prov._id}
                provider={prov}
                onBookNow={onBookProvider}
                onCompare={onCompareProvider}
                isSelectedForCompare={compareList.some(p => p._id === prov._id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section" style={{ backgroundColor: 'rgba(244, 241, 222, 0.6)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 36px' }}>
            <h2>{t('testimonials_title')}</h2>
            <p style={{ marginTop: 6 }}>{t('testimonials_subtitle')}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {testimonials.map((item, idx) => (
              <div key={idx} className="card">
                <div style={{ display: 'flex', gap: 3, color: '#D9822B', marginBottom: 12 }}>
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="#D9822B" stroke="#D9822B" />
                  ))}
                </div>
                <p style={{ fontSize: '0.94rem', color: '#26352A', fontStyle: 'italic', marginBottom: 18, lineHeight: 1.5 }}>
                  "{item.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid rgba(38,53,42,0.08)', paddingTop: 12 }}>
                  <img
                    src={item.avatar}
                    alt={item.name}
                    style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#7E8D80' }}>{item.area}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Become a Provider CTA Banner */}
      <section className="section" style={{ paddingBottom: 20 }}>
        <div className="container">
          <div style={{
            backgroundColor: 'var(--color-sage)',
            borderRadius: 'var(--radius-xl)',
            padding: '48px 36px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 24
          }}>
            <div style={{ maxWidth: 520 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#FFFDF7', padding: '4px 12px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 700, color: '#26352A', marginBottom: 12 }}>
                <Shield size={14} color="#52796F" />
                <span>{t('cta_provider_tag')}</span>
              </div>
              <h2 style={{ fontSize: '2rem', marginBottom: 10 }}>{t('cta_provider_title')}</h2>
              <p style={{ fontSize: '1rem', color: '#26352A', margin: 0 }}>
                {t('cta_provider_desc')}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <Link to="/register?role=provider" className="btn btn-primary btn-lg">
                <span>{t('btn_join_provider')}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
