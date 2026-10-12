import React, { useState } from 'react';
import { X, CheckCircle2, Shield, CreditCard, Smartphone, DollarSign, Lock } from 'lucide-react';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export const PaymentModal = ({ booking, isOpen, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [method, setMethod] = useState('upi');
  const [upiId, setUpiId] = useState('user@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [expiry, setExpiry] = useState('08/29');
  const [cvv, setCvv] = useState('321');
  const [processing, setProcessing] = useState(false);
  const [successData, setSuccessData] = useState(null);

  if (!isOpen || !booking) return null;

  const handlePay = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      await new Promise(r => setTimeout(r, 1000));

      const res = await api.post('/payments/process', {
        bookingId: booking._id,
        amount: booking.price,
        method
      });

      if (res.success) {
        setSuccessData(res.data);
        if (onSuccess) onSuccess(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        {!successData ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: 'var(--color-sage)',
                color: 'var(--color-dark-olive)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 10
              }}>
                <Lock size={22} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{t('secure_payment')}</h3>
              <p style={{ fontSize: '0.88rem', color: '#5C6B5E', margin: '4px 0 0 0' }}>
                {t('booking_hash')}{booking._id.substring(3)} &bull; {booking.serviceName}
              </p>
            </div>

            <div style={{
              backgroundColor: 'rgba(244, 241, 222, 0.5)',
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20
            }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#7E8D80', display: 'block' }}>{t('payable_amount')}</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-dark-olive)' }}>
                  ₹{booking.price}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#5C6B5E' }}>
                <Shield size={14} color="#52796F" />
                <span>{t('encrypted_badge')}</span>
              </div>
            </div>

            <form onSubmit={handlePay}>
              {/* Payment Method Switcher */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
                <button
                  type="button"
                  onClick={() => setMethod('upi')}
                  style={{
                    padding: 12,
                    borderRadius: 'var(--radius-md)',
                    border: method === 'upi' ? '2px solid var(--color-dark-olive)' : '1px solid rgba(38,53,42,0.12)',
                    backgroundColor: method === 'upi' ? 'var(--color-sage)' : '#FFFDF7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Smartphone size={16} />
                  <span>{t('upi_qr')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  style={{
                    padding: 12,
                    borderRadius: 'var(--radius-md)',
                    border: method === 'card' ? '2px solid var(--color-dark-olive)' : '1px solid rgba(38,53,42,0.12)',
                    backgroundColor: method === 'card' ? 'var(--color-sage)' : '#FFFDF7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <CreditCard size={16} />
                  <span>{t('card_label')}</span>
                </button>
              </div>

              {method === 'upi' ? (
                <div className="form-group">
                  <label className="form-label">{t('vpa_label')}</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@okhdfcbank"
                    className="form-input"
                    required
                  />
                  <div style={{ fontSize: '0.76rem', color: '#7E8D80', marginTop: 4 }}>
                    {t('vpa_helper')}
                  </div>
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">{t('card_number_label')}</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="16-digit card number"
                      className="form-input"
                      required
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div className="form-group">
                      <label className="form-label">{t('valid_thru_label')}</label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('cvv_label')}</label>
                      <input
                        type="password"
                        value={cvv}
                        maxLength={4}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="123"
                        className="form-input"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={processing}
                className="btn btn-primary btn-lg w-full mt-4"
              >
                {processing ? t('authorizing_payment') : `${t('authorize_and_pay')} ₹${booking.price}`}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: '#def7ec',
              color: '#03543f',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <CheckCircle2 size={36} />
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.4rem' }}>{t('payment_successful')}</h3>
            <p style={{ fontSize: '0.9rem', color: '#5C6B5E', marginBottom: 20 }}>
              {t('transaction_id_colon')} <strong>{successData.transactionId}</strong>
            </p>

            <div style={{
              backgroundColor: 'rgba(244, 241, 222, 0.5)',
              padding: 16,
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              marginBottom: 24
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#7E8D80' }}>{t('amount_paid_colon')}</span>
                <strong>₹{successData.amount}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#7E8D80' }}>{t('payment_mode_colon')}</span>
                <span style={{ textTransform: 'uppercase' }}>{successData.method}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#7E8D80' }}>{t('table_status')}:</span>
                <span style={{ color: '#03543f', fontWeight: 700 }}>{t('settled_status')}</span>
              </div>
            </div>

            <button onClick={onClose} className="btn btn-primary w-full">
              {t('done')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
