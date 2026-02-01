import React from 'react';

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

/**
 * Reusable Info Card Component
 * Used for displaying information sections with consistent styling
 */
export const InfoCard: React.FC<InfoCardProps> = ({ 
  title, 
  children, 
  className = '',
  titleClassName = ''
}) => {
  return (
    <div className={`bg-slate-800/50 border border-slate-700 rounded-xl p-6 ${className}`}>
      <h3 className={`text-amber-400 font-serif mb-4 text-lg border-b border-slate-700 pb-2 ${titleClassName}`}>
        {title}
      </h3>
      {children}
    </div>
  );
};

export default InfoCard;

