import React from 'react';
import { Send, Search, UserCheck, Play, CheckCircle2, XCircle } from 'lucide-react';

export const StatusBadge = ({ status = 'Submitted', size = 'normal' }) => {
  const s = status.toLowerCase();

  const getStyle = () => {
    switch (s) {
      case 'submitted':
        return {
          className: 'status-submitted',
          icon: <Send size={size === 'small' ? 12 : 14} />
        };
      case 'under review':
        return {
          className: 'status-under-review',
          icon: <Search size={size === 'small' ? 12 : 14} />
        };
      case 'assigned':
        return {
          className: 'status-assigned',
          icon: <UserCheck size={size === 'small' ? 12 : 14} />
        };
      case 'in progress':
        return {
          className: 'status-in-progress',
          icon: <Play size={size === 'small' ? 12 : 14} />
        };
      case 'resolved':
        return {
          className: 'status-resolved',
          icon: <CheckCircle2 size={size === 'small' ? 12 : 14} />
        };
      case 'rejected':
      default:
        return {
          className: 'status-rejected',
          icon: <XCircle size={size === 'small' ? 12 : 14} />
        };
    }
  };

  const { className, icon } = getStyle();

  return (
    <span className={`badge ${className} ${size === 'small' ? 'text-[11px] py-0.5 px-2' : ''}`}>
      {icon}
      <span>{status}</span>
    </span>
  );
};

export default StatusBadge;
