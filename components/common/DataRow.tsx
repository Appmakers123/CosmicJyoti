import React from 'react';

interface DataRowProps {
  label: string;
  value: string;
  subValue?: string;
  className?: string;
}

/**
 * Reusable Data Row Component
 * Used for displaying key-value pairs in a consistent format
 */
export const DataRow: React.FC<DataRowProps> = ({ label, value, subValue, className = '' }) => {
  return (
    <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b border-slate-700/50 last:border-0 ${className}`}>
      <span className="text-slate-400 text-sm uppercase tracking-wider font-medium">{label}</span>
      <div className="text-right mt-1 sm:mt-0">
        <span className="text-amber-100 font-serif text-lg block">{value}</span>
        {subValue && <span className="text-slate-500 text-xs">Ends: {subValue}</span>}
      </div>
    </div>
  );
};

export default DataRow;

