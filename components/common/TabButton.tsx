import React from 'react';

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * Reusable Tab Button Component
 */
export const TabButton: React.FC<TabButtonProps> = ({ 
  label, 
  isActive, 
  onClick,
  className = '' 
}) => {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
        isActive 
          ? 'bg-amber-500 text-slate-900' 
          : 'bg-slate-800 text-slate-400 hover:text-white'
      } ${className}`}
    >
      {label}
    </button>
  );
};

export default TabButton;

