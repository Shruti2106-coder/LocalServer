import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Filter,
  Star,
  SlidersHorizontal,
  Layers,
  X,
  ShieldCheck,
  RotateCcw,
  Navigation,
  Loader2
} from 'lucide-react';
import { api } from '../services/api.js';
import { ProviderCard } from '../components/ProviderCard.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useLocationContext } from '../context/LocationContext.jsx';

export const ProvidersPage = ({
  onBookProvider,
  onCompareProvider,
  compareList = [],
  onOpenCompareModal
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, tCategory } = useLanguage();
  const { city, area, isLoading: isLocLoading, requestLocation } = useLocationContext();
  const navigate = useNavigate();

  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [minRating, setMinRating] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [availability, setAvailability] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating_desc');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [userCustomizedLocation, setUserCustomizedLocation] = useState(false);

  // Sync detected location if no query param location was provided
  useEffect(() => {
    if (!searchParams.get('location') && city && !userCustomizedLocation && !location) {
      setLocation(city);
    }
  }, [city, searchParams, userCustomizedLocation]);

  useEffect(() => {
    api.get('/categories')
      .then(res => {
        if (res.success) setCategories(res.data);
      })
      .catch(console.error);
  }, []);

  const fetchProviders = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (location.trim()) params.set('location', location.trim());
    if (category && category !== 'all') params.set('category', category);
    if (minRating) params.set('minRating', minRating);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (availability && availability !== 'all') params.set('availability', availability);
    if (verifiedOnly) params.set('verifiedOnly', 'true');
    if (sortBy) params.set('sortBy', sortBy);

    api.get(`/providers?${params.toString()}`)
      .then(res => {
        if (res.success) setProviders(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProviders();
  }, [category, minRating, maxPrice, availability, verifiedOnly, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProviders();
  };

  const handleResetFilters = () => {
    setSearch('');
    setLocation('');
    setCategory('all');
    setMinRating('');
    setMaxPrice('');
    setAvailability('all');
    setVerifiedOnly(false);
    setSortBy('rating_desc');
    setSearchParams({});
  };

  return (
    <div className="section" style={{ paddingTop: 36 }}>
      <div className="container">
        {/* Title */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: '2.2rem', marginBottom: 6 }}>{t('providers_title')}</h1>
          <p style={{ color: '#5C6B5E' }}>
            {t('providers_subtitle')}
          </p>
        </div>

        {/* Search & Location Bar */}
        <form onSubmit={handleSearchSubmit} className="search-box-card" style={{ marginBottom: 28 }}>
          <div className="search-field">
            <Search size={18} color="#5C6B5E" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('providers_search_placeholder')}
            />
          </div>

          <div className="search-field" style={{ position: 'relative' }}>
            <MapPin size={18} color="var(--color-primary)" />
            <input
              type="text"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setUserCustomizedLocation(true);
              }}
              placeholder={t('providers_location_placeholder')}
            />
            <button
              type="button"
              onClick={() => {
                setUserCustomizedLocation(false);
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

          <button type="submit" className="btn btn-primary">
            <Search size={16} />
            <span>{t('search')}</span>
          </button>
        </form>

        {/* Layout: Sidebar Filter + Results */}
        <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: 28, alignItems: 'start' }}>
          {/* Filters Sidebar */}
          <aside className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '1rem' }}>
                <Filter size={16} />
                <span>{t('filter_providers')}</span>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                style={{ background: 'none', border: 'none', fontSize: '0.78rem', color: '#5C6B5E', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <RotateCcw size={12} />
                {t('reset')}
              </button>
            </div>

            {/* Category dropdown */}
            <div className="form-group">
              <label className="form-label">{t('category_label')}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
              >
                <option value="all">{t('all_categories')}</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name.toLowerCase()}>{tCategory(c.name)}</option>
                ))}
              </select>
            </div>

            {/* Sort by */}
            <div className="form-group">
              <label className="form-label">{t('sort_by')}</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-select"
              >
                <option value="rating_desc">{t('sort_rating_desc')}</option>
                <option value="reviews_desc">{t('sort_reviews_desc')}</option>
                <option value="price_asc">{t('sort_price_asc')}</option>
                <option value="price_desc">{t('sort_price_desc')}</option>
                <option value="experience_desc">{t('sort_exp_desc')}</option>
              </select>
            </div>

            {/* Min Rating */}
            <div className="form-group">
              <label className="form-label">{t('min_rating')}</label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="form-select"
              >
                <option value="">{t('any_rating')}</option>
                <option value="4.8">4.8+ {t('stars_plus')} ({t('top_rated')})</option>
                <option value="4.5">4.5+ {t('stars_plus')}</option>
                <option value="4.0">4.0+ {t('stars_plus')}</option>
              </select>
            </div>

            {/* Max Hourly Rate */}
            <div className="form-group">
              <label className="form-label">{t('max_price')}</label>
              <select
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="form-select"
              >
                <option value="">{t('no_limit')}</option>
                <option value="400">{t('under_amount')} ₹400</option>
                <option value="600">{t('under_amount')} ₹600</option>
                <option value="1000">{t('under_amount')} ₹1,000</option>
                <option value="2500">{t('under_amount')} ₹2,500</option>
              </select>
            </div>

            {/* Availability */}
            <div className="form-group">
              <label className="form-label">{t('availability_label')}</label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="form-select"
              >
                <option value="all">{t('all_providers')}</option>
                <option value="available">{t('available_now')}</option>
              </select>
            </div>

            {/* Verified Only Checkbox */}
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(38,53,42,0.08)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: 'var(--color-dark-olive)' }}
                />
                <span>{t('verified_pros_only')}</span>
              </label>
            </div>
          </aside>

          {/* Results Grid */}
          <main>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: '0.92rem', color: '#5C6B5E' }}>
                {t('showing_providers')} <strong>{providers.length}</strong> {t('service_providers_count')}
              </span>
            </div>

            {loading ? (
              <LoadingSpinner text={t('loading')} />
            ) : providers.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                <h3 style={{ marginBottom: 8 }}>{t('no_providers_found')}</h3>
                <p style={{ color: '#5C6B5E', maxWidth: 420, margin: '0 auto 20px auto' }}>
                  {t('no_providers_found_desc')}
                </p>
                <button onClick={handleResetFilters} className="btn btn-outline">
                  {t('reset_filters')}
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                {providers.map((prov) => (
                  <ProviderCard
                    key={prov._id}
                    provider={prov}
                    onBookNow={onBookProvider}
                    onCompare={onCompareProvider}
                    isSelectedForCompare={compareList.some(p => p._id === prov._id)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>

        {/* Floating Comparison Drawer / Sticky Bar */}
        {compareList.length > 0 && (
          <div style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#26352A',
            color: '#FFFDF7',
            padding: '14px 24px',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            zIndex: 90
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={18} color="#A8B88A" />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                {compareList.length} {t('providers_selected')}
              </span>
            </div>

            <button
              onClick={onOpenCompareModal}
              className="btn btn-accent btn-sm"
              style={{ fontWeight: 700 }}
            >
              {t('compare_side_by_side')}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .container > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
