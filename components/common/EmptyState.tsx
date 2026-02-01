import React from 'react';
import { Language } from '../../types';

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
  language?: Language;
  className?: string;
}

/**
 * Reusable Empty State Component
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ 
  message, 
  icon,
  language = 'en',
  className = '' 
}) => {
  const defaultIcon = (
    <svg className="w-16 h-16 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  );

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      {icon || defaultIcon}
      <p className="text-slate-400 text-sm mt-4">{message}</p>
    </div>
  );
};

export default EmptyState;

