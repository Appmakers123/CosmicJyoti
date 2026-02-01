import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

/**
 * Reusable Section Header Component
 * Used for consistent section titles across the app
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  subtitle, 
  icon,
  className = '',
  titleClassName = ''
}) => {
  return (
    <div className={`text-center mb-10 relative z-10 ${className}`}>
      {icon && (
        <div className="flex justify-center mb-4">
          {icon}
        </div>
      )}
      <h2 className={`text-3xl md:text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-200 to-yellow-200 mb-3 ${titleClassName}`}>
        {title}
      </h2>
      {subtitle && (
        <div className="inline-flex items-center gap-2 bg-slate-900/50 px-4 py-1 rounded-full border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <p className="text-slate-300 text-sm">{subtitle}</p>
        </div>
      )}
    </div>
  );
};

export default SectionHeader;

