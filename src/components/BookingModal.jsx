import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useLocationContext } from '../context/LocationContext.jsx';
import { useNavigate } from 'react-router-dom';

export const BookingModal = ({ provider, initialService = null, isOpen, onClose, onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const { t, tCategory } = useLanguage();
  const { city: locCity, location: locData } = useLocationContext();
  const navigate = useNavigate();

  const [selectedService, setSelectedService] = useState(
    initialService || (provider?.services && provider.services[0]) || { name: `${provider?.category} Visit`, price: provider?.hourlyRate || 399 }
  );

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState(defaultDateStr);
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 11:00 AM');
  const [address, setAddress] = useState(user?.address || locData?.formattedAddress || 'B-402, Green View Apts, Andheri West');
  const [city, setCity] = useState(user?.city || locCity || provider?.city || 'Mumbai');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !provider) return null;

  const timeSlots = [
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:30 AM - 12:30 PM',
    '02:00 PM - 03:00 PM',
    '03:30 PM - 04:30 PM',
    '05:00 PM - 06:00 PM',
    '06:30 PM - 07:30 PM'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!address.trim()) {
      setError(t('service_address_label'));
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/bookings', {
        providerId: provider.userId || provider._id,
        serviceName: selectedService.name,
        category: provider.category,
        date,
        timeSlot,
        address,
        city,
        price: selectedService.price,
        notes,
        paymentMethod
      });

      if (res.success) {
        onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to place booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--color-sage)', color: 'var(--color-dark-olive)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '8px' }}>
            <ShieldCheck size={14} />
            {t('verified_booking')}
          </div>
          <h3 style={{ margin: 0, fontSize: '1.5rem' }}>
            {t('book_with')} {provider.businessName || provider.providerName}
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#5C6B5E' }}>
            {tCategory(provider.category)} &bull; {provider.city}
          </p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            fontSize: '0.88rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Service selection */}
          <div className="form-group">
            <label className="form-label">{t('select_service_label')}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(provider.services && provider.services.length > 0) ? (
                provider.services.map((srv, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedService(srv)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: selectedService.name === srv.name ? '2px solid var(--color-dark-olive)' : '1px solid rgba(38,53,42,0.12)',
                      backgroundColor: selectedService.name === srv.name ? 'rgba(221,229,200,0.3)' : '#FFFDF7',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#26352A' }}>{srv.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#7E8D80' }}>{srv.estimatedDuration} &bull; {srv.description}</div>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-dark-olive)' }}>
                      ₹{srv.price}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '12px', background: 'var(--color-cream)', borderRadius: 8, fontWeight: 600 }}>
                  {t('base_consultation')} – ₹{provider.hourlyRate || 399}
                </div>
              )}
            </div>
          </div>

          {/* Date & Time Slot */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">{t('preferred_date_label')}</label>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('time_slot_label')}</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="form-select"
              >
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Address & City */}
          <div className="form-group">
            <label className="form-label">{t('service_address_label')}</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t('address_placeholder')}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('issue_details_label')}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('issue_details_placeholder')}
              className="form-textarea"
            />
          </div>

          {/* Payment Method */}
          <div className="form-group">
            <label className="form-label">{t('payment_preference_label')}</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                style={{
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  border: paymentMethod === 'online' ? '2px solid var(--color-dark-olive)' : '1px solid rgba(38,53,42,0.12)',
                  backgroundColor: paymentMethod === 'online' ? 'var(--color-sage)' : '#FFFDF7',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.88rem'
                }}
              >
                {t('pay_online_upi')}
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                style={{
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  border: paymentMethod === 'cash' ? '2px solid var(--color-dark-olive)' : '1px solid rgba(38,53,42,0.12)',
                  backgroundColor: paymentMethod === 'cash' ? 'var(--color-sage)' : '#FFFDF7',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.88rem'
                }}
              >
                {t('cash_on_service')}
              </button>
            </div>
          </div>

          {/* Total & Submit */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(38,53,42,0.1)'
          }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#7E8D80', display: 'block' }}>{t('total_payable')}</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-dark-olive)' }}>
                ₹{selectedService.price}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
            >
              {loading ? t('booking_in_progress') : (paymentMethod === 'online' ? t('proceed_and_book') : t('confirm_cash_booking'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
