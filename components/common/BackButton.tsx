import React from 'react';

interface BackButtonProps {
  onClick: () => void;
  label: string;
  className?: string;
}

/**
 * Reusable Back Button Component
 */
export const BackButton: React.FC<BackButtonProps> = ({ onClick, label, className = '' }) => {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center text-amber-400 hover:text-amber-200 transition-colors text-sm font-bold tracking-wide uppercase ${className}`}
    >
      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      {label}
    </button>
  );
};

export default BackButton;

