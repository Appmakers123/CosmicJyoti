import React from 'react';

interface StatusBadgeProps {
  status: 'Excellent' | 'Good' | 'Average' | 'Avoid' | string;
  className?: string;
}

/**
 * Reusable Status Badge Component
 * Used for displaying status with color coding
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Excellent': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Good': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Average': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'Avoid': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(status)} ${className}`}>
      {status}
    </span>
  );
};

export default StatusBadge;

