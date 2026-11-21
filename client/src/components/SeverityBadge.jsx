import React from 'react';
import { AlertTriangle, AlertCircle, Clock, CheckCircle } from 'lucide-react';

export const SeverityBadge = ({ severity = 'Medium', size = 'normal' }) => {
  const sev = severity.toLowerCase();

  const getStyle = () => {
    switch (sev) {
      case 'critical':
        return {
          className: 'badge-critical',
          icon: <AlertTriangle size={size === 'small' ? 12 : 14} />
        };
      case 'high':
        return {
          className: 'badge-high',
          icon: <AlertCircle size={size === 'small' ? 12 : 14} />
        };
      case 'medium':
        return {
          className: 'badge-medium',
          icon: <Clock size={size === 'small' ? 12 : 14} />
        };
      case 'low':
      default:
        return {
          className: 'badge-low',
          icon: <CheckCircle size={size === 'small' ? 12 : 14} />
        };
    }
  };

  const { className, icon } = getStyle();

  return (
    <span className={`badge ${className} ${size === 'small' ? 'text-[11px] py-0.5 px-2' : ''}`}>
      {icon}
      <span>{severity}</span>
    </span>
  );
};

export default SeverityBadge;
