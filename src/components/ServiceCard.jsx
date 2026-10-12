import React from 'react';
import { Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export const ServiceCard = ({ service, onSelect }) => {
  const { t } = useLanguage();

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{service.name}</h4>
        <span style={{
          backgroundColor: 'var(--color-sage)',
          color: 'var(--color-dark-olive)',
          fontSize: '0.78rem',
          fontWeight: 700,
          padding: '3px 8px',
          borderRadius: 'var(--radius-sm)'
        }}>
          ₹{service.price}
        </span>
      </div>

      <p style={{ fontSize: '0.88rem', color: '#5C6B5E', flex: 1, margin: 0 }}>
        {service.description || 'Professional service by certified local technician.'}
      </p>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '10px',
        borderTop: '1px solid rgba(38,53,42,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', color: '#7E8D80' }}>
          <Clock size={14} />
          <span>{service.estimatedDuration || `1 ${t('hours')}`}</span>
        </div>

        <button
          onClick={() => onSelect(service)}
          className="btn btn-primary btn-sm"
        >
          <span>{t('select_service_label')}</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};
