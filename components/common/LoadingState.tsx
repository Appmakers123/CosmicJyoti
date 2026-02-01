import React from 'react';
import { Language } from '../../types';

interface LoadingStateProps {
  message?: string;
  language?: Language;
  className?: string;
}

/**
 * Reusable Loading State Component
 */
export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message, 
  language = 'en',
  className = '' 
}) => {
  const defaultMessage = language === 'hi' ? 'लोड हो रहा है...' : 'Loading...';
  const displayMessage = message || defaultMessage;

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mb-4"></div>
      <p className="text-slate-400 text-sm">{displayMessage}</p>
    </div>
  );
};

export default LoadingState;

