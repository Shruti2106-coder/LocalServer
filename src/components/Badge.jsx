import React from 'react';
import { CheckCircle2, Clock, AlertCircle, Check, X, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export const StatusBadge = ({ status }) => {
  const { tStatus } = useLanguage();

  const iconMap = {
    pending: Clock,
    confirmed: CheckCircle2,
    on_the_way: Clock,
    in_progress: Clock,
    completed: Check,
    cancelled: X,
    rejected: X
  };

  const Icon = iconMap[status] || Clock;
  const label = tStatus(status);

  return (
    <span className={`badge badge-status-${status}`}>
      <Icon size={12} />
      {label}
    </span>
  );
};

export const VerifiedBadge = () => {
  const { t } = useLanguage();
  return (
    <span className="badge badge-verified" title={t('verified_pro')}>
      <ShieldCheck size={13} color="#26352A" />
      {t('verified_pro')}
    </span>
  );
};
