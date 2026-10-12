import React, { useState } from 'react';
import { X, AlertCircle, FileText } from 'lucide-react';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export const ComplaintModal = ({ booking = null, isOpen, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [subject, setSubject] = useState(booking ? `${t('btn_report_issue')} #${booking._id.substring(3)}` : '');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setError(t('subject_label'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/complaints', {
        bookingId: booking ? booking._id : '',
        subject: subject.trim(),
        description: description.trim()
      });

      if (res.success) {
        setSuccess(true);
        if (onSuccess) onSuccess(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to file complaint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        {!success ? (
          <>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.4rem' }}>{t('report_issue_title')}</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem', color: '#5C6B5E' }}>
              {t('complaint_desc')}
            </p>

            {error && (
              <div style={{ padding: 10, backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: 8, marginBottom: 14 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">{t('subject_label')}</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t('subject_placeholder')}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('detailed_desc_label')}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('detailed_desc_placeholder')}
                  className="form-textarea"
                  style={{ minHeight: 120 }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg w-full mt-4"
              >
                {loading ? t('submitting_complaint') : t('submit_to_admin')}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <h4 style={{ fontSize: '1.3rem', marginBottom: 8 }}>{t('complaint_registered')}</h4>
            <p style={{ fontSize: '0.9rem', color: '#5C6B5E', marginBottom: 20 }}>
              {t('complaint_registered_desc')}
            </p>
            <button onClick={onClose} className="btn btn-primary w-full">
              {t('close')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
