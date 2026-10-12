import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  MessageCircle,
  CreditCard,
  Star,
  X,
  Check,
  Truck,
  Play,
  CheckCircle2,
  FileQuestion
} from 'lucide-react';
import { StatusBadge } from './Badge.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export const BookingCard = ({
  booking,
  isProviderView = false,
  isAdminView = false,
  onOpenChat,
  onOpenPayment,
  onOpenReview,
  onOpenComplaint,
  onUpdateStatus,
  onCancelBooking
}) => {
  const { t, tStatus } = useLanguage();
  const steps = ['pending', 'confirmed', 'on_the_way', 'in_progress', 'completed'];
  const currentStepIndex = steps.indexOf(booking.status);

  return (
    <div className="booking-item">
      {/* Header */}
      <div className="booking-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{booking.serviceName}</h4>
            <StatusBadge status={booking.status} />
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: booking.paymentStatus === 'paid' ? '#def7ec' : '#fef3c7',
              color: booking.paymentStatus === 'paid' ? '#03543f' : '#92400e'
            }}>
              {t('payment_colon')} {tStatus(booking.paymentStatus)} ({booking.paymentMethod})
            </span>
          </div>

          <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: '#5C6B5E' }}>
            {isProviderView ? (
              <>{t('customer_colon')} <strong>{booking.customerName}</strong> {booking.customerPhone && `(${booking.customerPhone})`}</>
            ) : (
              <>{t('provider_colon')} <strong>{booking.providerName}</strong> {booking.providerPhone && `(${booking.providerPhone})`}</>
            )}
            &bull; {t('booking_hash')}{booking._id.substring(3)}
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-dark-olive)' }}>
            ₹{booking.price}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#7E8D80' }}>
            {t('booked_on')} {new Date(booking.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Progress tracker for active bookings */}
      {!['cancelled', 'rejected'].includes(booking.status) && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          backgroundColor: '#faf8f0',
          borderRadius: 'var(--radius-md)',
          position: 'relative'
        }}>
          {steps.map((st, i) => {
            const isDone = currentStepIndex >= i;
            const isCurrent = currentStepIndex === i;

            return (
              <div key={st} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                zIndex: 2,
                flex: 1
              }}>
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: isDone ? 'var(--color-dark-olive)' : '#e5e2d1',
                  color: '#FFFDF7',
                  fontSize: '0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  border: isCurrent ? '2px solid var(--color-peach)' : 'none'
                }}>
                  {isDone ? '✓' : i + 1}
                </div>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? 'var(--color-dark-olive)' : '#7E8D80',
                  textAlign: 'center'
                }}>
                  {tStatus(st)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '10px',
        padding: '12px 14px',
        backgroundColor: 'rgba(244, 241, 222, 0.45)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.86rem',
        color: '#26352A'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={15} color="#5C6B5E" />
          <span><strong>{t('date_colon')}</strong> {booking.date}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={15} color="#5C6B5E" />
          <span><strong>{t('time_colon')}</strong> {booking.timeSlot}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', gridColumn: 'span 2' }}>
          <MapPin size={15} color="#5C6B5E" />
          <span><strong>{t('address_colon')}</strong> {booking.address}, {booking.city}</span>
        </div>
      </div>

      {booking.notes && (
        <div style={{ fontSize: '0.86rem', color: '#5C6B5E', fontStyle: 'italic' }}>
          <strong>{t('note_from_customer')}</strong> "{booking.notes}"
        </div>
      )}

      {booking.cancellationReason && (
        <div style={{
          fontSize: '0.84rem',
          color: 'var(--color-danger)',
          backgroundColor: '#fae8e8',
          padding: '8px 12px',
          borderRadius: 'var(--radius-sm)'
        }}>
          <strong>{t('cancellation_reason_colon')}</strong> {booking.cancellationReason}
        </div>
      )}

      {/* Actions Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(38, 53, 42, 0.08)'
      }}>
        {/* Left actions: Chat & Complaint */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onOpenChat(booking)}
            className="btn btn-outline btn-sm"
            title={t('btn_chat')}
          >
            <MessageCircle size={15} />
            <span>{t('btn_chat')} ({isProviderView ? booking.customerName?.split(' ')[0] : (booking.providerName?.split(' ')[0] || t('role_provider'))})</span>
          </button>

          {onOpenComplaint && (
            <button
              onClick={() => onOpenComplaint(booking)}
              className="btn btn-ghost btn-sm"
              style={{ color: '#7E8D80' }}
              title={t('btn_report_issue')}
            >
              <FileQuestion size={14} />
              <span>{t('btn_report_issue')}</span>
            </button>
          )}
        </div>

        {/* Right actions: Role-dependent state transitions */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Customer Actions */}
          {!isProviderView && !isAdminView && (
            <>
              {booking.paymentStatus === 'pending' && booking.status !== 'cancelled' && onOpenPayment && (
                <button
                  onClick={() => onOpenPayment(booking)}
                  className="btn btn-peach btn-sm"
                >
                  <CreditCard size={15} />
                  <span>{t('btn_pay_amount')} ₹{booking.price}</span>
                </button>
              )}

              {booking.status === 'completed' && !booking.hasReviewed && onOpenReview && (
                <button
                  onClick={() => onOpenReview(booking)}
                  className="btn btn-secondary btn-sm"
                >
                  <Star size={15} />
                  <span>{t('btn_leave_review')}</span>
                </button>
              )}

              {['pending', 'confirmed'].includes(booking.status) && onCancelBooking && (
                <button
                  onClick={() => onCancelBooking(booking)}
                  className="btn btn-danger btn-sm"
                >
                  <X size={14} />
                  <span>{t('btn_cancel_booking')}</span>
                </button>
              )}
            </>
          )}

          {/* Provider Actions */}
          {isProviderView && onUpdateStatus && (
            <>
              {booking.status === 'pending' && (
                <>
                  <button
                    onClick={() => onUpdateStatus(booking._id, 'confirmed')}
                    className="btn btn-accent btn-sm"
                  >
                    <Check size={14} />
                    <span>{t('btn_accept_booking')}</span>
                  </button>
                  <button
                    onClick={() => onUpdateStatus(booking._id, 'rejected')}
                    className="btn btn-danger btn-sm"
                  >
                    <X size={14} />
                    <span>{t('btn_decline')}</span>
                  </button>
                </>
              )}

              {booking.status === 'confirmed' && (
                <button
                  onClick={() => onUpdateStatus(booking._id, 'on_the_way')}
                  className="btn btn-primary btn-sm"
                >
                  <Truck size={14} />
                  <span>{t('btn_on_the_way')}</span>
                </button>
              )}

              {booking.status === 'on_the_way' && (
                <button
                  onClick={() => onUpdateStatus(booking._id, 'in_progress')}
                  className="btn btn-primary btn-sm"
                >
                  <Play size={14} />
                  <span>{t('btn_start_service')}</span>
                </button>
              )}

              {booking.status === 'in_progress' && (
                <button
                  onClick={() => onUpdateStatus(booking._id, 'completed')}
                  className="btn btn-accent btn-sm"
                >
                  <CheckCircle2 size={14} />
                  <span>{t('btn_mark_completed')}</span>
                </button>
              )}
            </>
          )}

          {/* Admin Actions */}
          {isAdminView && onUpdateStatus && (
            <select
              value={booking.status}
              onChange={(e) => onUpdateStatus(booking._id, e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '6px 10px', fontSize: '0.85rem' }}
            >
              <option value="pending">{t('status_pending')}</option>
              <option value="confirmed">{t('status_confirmed')}</option>
              <option value="on_the_way">{t('status_on_the_way')}</option>
              <option value="in_progress">{t('status_in_progress')}</option>
              <option value="completed">{t('status_completed')}</option>
              <option value="cancelled">{t('status_cancelled')}</option>
              <option value="rejected">{t('status_rejected')}</option>
            </select>
          )}
        </div>
      </div>
    </div>
  );
};
