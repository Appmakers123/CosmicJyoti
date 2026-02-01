import React from 'react';
import RichText from '../RichText';
import { Language } from '../../types';

interface PredictionCardProps {
  category: 'general' | 'career' | 'love' | 'health' | 'finance' | 'education' | 'family' | 'spirituality';
  title: string;
  content: string;
  language: Language;
  icon?: React.ReactNode;
}

const categoryConfig = {
  general: {
    color: 'amber',
    icon: (
      <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  },
  career: {
    color: 'blue',
    icon: (
      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  },
  love: {
    color: 'pink',
    icon: (
      <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    )
  },
  health: {
    color: 'emerald',
    icon: (
      <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  finance: {
    color: 'green',
    icon: (
      <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  education: {
    color: 'purple',
    icon: (
      <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  },
  family: {
    color: 'cyan',
    icon: (
      <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  spirituality: {
    color: 'indigo',
    icon: (
      <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    )
  }
};

/**
 * Reusable Prediction Card Component
 * Displays prediction content with category-specific styling
 */
export const PredictionCard: React.FC<PredictionCardProps> = ({ 
  category, 
  title, 
  content, 
  language,
  icon 
}) => {
  const config = categoryConfig[category];
  const color = config.color;
  const defaultIcon = config.icon;
  const displayIcon = icon || defaultIcon;

  // Map colors to Tailwind classes (can't use dynamic classes in Tailwind)
  const colorClasses = {
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      bg: 'bg-amber-500/20',
      text: 'text-amber-300'
    },
    blue: {
      border: 'border-blue-500/20 hover:border-blue-500/40',
      bg: 'bg-blue-500/20',
      text: 'text-blue-300'
    },
    pink: {
      border: 'border-pink-500/20 hover:border-pink-500/40',
      bg: 'bg-pink-500/20',
      text: 'text-pink-300'
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      bg: 'bg-emerald-500/20',
      text: 'text-emerald-300'
    },
    green: {
      border: 'border-green-500/20 hover:border-green-500/40',
      bg: 'bg-green-500/20',
      text: 'text-green-300'
    },
    purple: {
      border: 'border-purple-500/20 hover:border-purple-500/40',
      bg: 'bg-purple-500/20',
      text: 'text-purple-300'
    },
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      bg: 'bg-cyan-500/20',
      text: 'text-cyan-300'
    },
    indigo: {
      border: 'border-indigo-500/20 hover:border-indigo-500/40',
      bg: 'bg-indigo-500/20',
      text: 'text-indigo-300'
    }
  };

  const classes = colorClasses[color as keyof typeof colorClasses] || colorClasses.amber;

  return (
    <div className={`bg-gradient-to-br from-slate-900/60 to-slate-800/40 border ${classes.border} rounded-xl p-5 transition-all`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full ${classes.bg} flex items-center justify-center`}>
          {displayIcon}
        </div>
        <h4 className={`text-lg font-serif ${classes.text}`}>
          {title}
        </h4>
      </div>
      <RichText text={content} className="text-sm text-slate-300 leading-relaxed" />
    </div>
  );
};

export default PredictionCard;

