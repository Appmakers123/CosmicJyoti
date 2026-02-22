import React from 'react';
import { Language } from '../../types';

export interface ModuleIntroProps {
  /** Short keyword-rich line (e.g. "Sade Sati calculator – check by Moon sign"). Shown first for SEO. */
  subtitleEn: string;
  subtitleHi?: string;
  /** 2–3 sentences explaining what this tool is and what the user gets. */
  descriptionEn: string;
  descriptionHi: string;
  language: Language;
  /** Optional: hide subtitle and show only description block */
  subtitleOnly?: boolean;
}

/**
 * Brief intro block for each module: improves SEO (keyword-rich, useful content) and helps users understand the tool.
 * Place at the top of each module screen.
 */
const ModuleIntro: React.FC<ModuleIntroProps> = ({
  subtitleEn,
  subtitleHi,
  descriptionEn,
  descriptionHi,
  language,
  subtitleOnly = false,
}) => {
  const isHi = language === 'hi';
  const subtitle = isHi && subtitleHi ? subtitleHi : subtitleEn;
  const description = isHi ? descriptionHi : descriptionEn;

  return (
    <div className="mb-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 overflow-visible min-w-0" role="region" aria-label={isHi ? 'इस टूल के बारे में' : 'About this tool'}>
      <p className="text-amber-400/90 text-sm font-medium mb-1 break-words">
        {subtitle}
      </p>
      {!subtitleOnly && description && (
        <p className="text-slate-400 text-xs leading-relaxed break-words">
          {description}
        </p>
      )}
    </div>
  );
};

export default ModuleIntro;
