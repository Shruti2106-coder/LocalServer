import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench,
  Zap,
  Sparkles,
  BookOpen,
  Laptop,
  Car,
  Hammer,
  Paintbrush,
  Tv,
  Flower2,
  Search,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { api } from '../services/api.js';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export const ServicesPage = () => {
  const { t, tCategory } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const iconMap = {
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
    api.get('/categories')
      .then(res => {
        if (res.success) setCategories(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    tCategory(c.name).toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="section">
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 36px auto' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#5C6B5E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {t('services_directory')}
          </span>
          <h1 style={{ marginTop: 6, marginBottom: 12 }}>{t('services_title')}</h1>
          <p style={{ fontSize: '1.05rem', color: '#5C6B5E' }}>
            {t('services_subtitle')}
          </p>

          <div style={{ maxWidth: 440, margin: '20px auto 0 auto', position: 'relative' }}>
            <Search size={18} color="#5C6B5E" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('services_search_placeholder')}
              className="form-input"
              style={{ paddingLeft: 42, borderRadius: 'var(--radius-full)' }}
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text={t('loading')} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {filtered.map((cat) => {
              const Icon = iconMap[cat.name] || Wrench;
              return (
                <div
                  key={cat._id}
                  className="card card-interactive"
                  onClick={() => navigate(`/providers?category=${encodeURIComponent(cat.slug)}`)}
                  style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{
                      width: 52,
                      height: 52,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-sage)',
                      color: 'var(--color-dark-olive)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={26} />
                    </div>

                    {cat.popular && (
                      <span style={{
                        backgroundColor: 'var(--color-peach)',
                        color: 'var(--color-dark-olive)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)'
                      }}>
                        {t('popular_badge')}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: 6 }}>{tCategory(cat.name)}</h3>
                    <p style={{ fontSize: '0.88rem', color: '#5C6B5E', margin: 0, lineHeight: 1.45 }}>
                      {cat.description}
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 'auto',
                    paddingTop: 12,
                    borderTop: '1px solid rgba(38,53,42,0.06)'
                  }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-dark-olive)' }}>
                      {t('view_available_pros')}
                    </span>
                    <ArrowRight size={15} color="var(--color-dark-olive)" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
