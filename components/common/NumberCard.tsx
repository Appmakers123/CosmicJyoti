import React from 'react';

interface NumberCardProps {
  title: string;
  number: number;
  description: string;
  className?: string;
}

/**
 * Reusable Number Card Component
 * Used for displaying numerology numbers, scores, etc.
 */
export const NumberCard: React.FC<NumberCardProps> = ({ 
  title, 
  number, 
  description,
  className = '' 
}) => {
  return (
    <div className={`bg-slate-800/60 border border-slate-700 rounded-xl p-6 hover:border-amber-500/30 transition-all ${className}`}>
      <span className="text-xs text-slate-500 uppercase block mb-2">{title}</span>
      <div className="text-4xl font-serif text-amber-200 mb-2">{number}</div>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

export default NumberCard;

