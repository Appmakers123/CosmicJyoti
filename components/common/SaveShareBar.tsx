import React, { useState } from 'react';
import { Language } from '../../types';
import { trackShare } from '../../utils/dataLayer';

interface SaveShareBarProps {
  language: Language;
  onSave?: () => void;
  onShare?: () => void;
  isSaved?: boolean;
  shareContent: string;
  shareTitle?: string;
  /** For GTM: e.g. 'horoscope', 'kundali', 'panchang', 'matchmaking' */
  contentType?: string;
  saveLabel?: string;
  shareLabel?: string;
  savedLabel?: string;
  dontSaveLabel?: string;
  showDontSave?: boolean;
  onDontSave?: () => void;
  /** When report is saved, its ID for unsave. If set with isSaved, show "Saved in My Reports" and Unsave. */
  savedReportId?: string | null;
  onUnsave?: (id: string) => void;
  /** e.g. "My Reports" or "Saved Reports" */
  savedLocationLabel?: string;
}

const SaveShareBar: React.FC<SaveShareBarProps> = ({
  language,
  onSave,
  onShare,
  isSaved = false,
  shareContent,
  shareTitle = 'CosmicJyoti Report',
  contentType,
  saveLabel,
  shareLabel,
  savedLabel,
  dontSaveLabel,
  showDontSave = false,
  onDontSave,
  savedReportId,
  onUnsave,
  savedLocationLabel,
}) => {
  const [shareSuccess, setShareSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const savedLocation = savedLocationLabel || (language === 'hi' ? 'मेरी रिपोर्ट' : 'My Reports');
  const t = {
    save: saveLabel || (language === 'hi' ? 'सेव करें' : 'Save'),
    share: shareLabel || (language === 'hi' ? 'शेयर करें' : 'Share'),
    saved: savedLabel || (language === 'hi' ? 'सेव हो गया' : 'Saved'),
    dontSave: dontSaveLabel || (language === 'hi' ? 'सेव न करें' : "Don't save"),
    savedIn: language === 'hi' ? 'सेव की गई: ' : 'Saved in ',
    unsave: language === 'hi' ? 'हटाएं' : 'Unsave',
  };

  const reportShareSuccess = (method: string) => {
    setShareSuccess(true);
    onShare?.();
    if (contentType) trackShare(contentType, method);
    setTimeout(() => setShareSuccess(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareContent,
        });
        reportShareSuccess('native');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard(shareContent);
        }
      }
    } else {
      copyToClipboard(shareContent);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      reportShareSuccess('copy');
    });
  };

  const handleSave = () => {
    onSave?.();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {onSave && (
        <>
          <button
            onClick={handleSave}
            disabled={isSaved}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              isSaved || saveSuccess
                ? 'bg-green-600/30 text-green-300 border border-green-500/50 cursor-default'
                : 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-200 border border-amber-500/30'
            }`}
          >
            {isSaved || saveSuccess ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t.saved}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                {t.save}
              </>
            )}
          </button>
          {(isSaved || saveSuccess) && (
            <span className="text-[10px] sm:text-xs text-slate-400" title={savedLocation}>
              {t.savedIn}<span className="text-amber-400/90 font-medium">{savedLocation}</span>
            </span>
          )}
          {isSaved && savedReportId && onUnsave && (
            <button
              type="button"
              onClick={() => onUnsave(savedReportId)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-red-300 border border-slate-600 hover:border-red-500/50 transition-all"
            >
              {t.unsave}
            </button>
          )}
        </>
      )}
      <button
        onClick={handleShare}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
          shareSuccess
            ? 'bg-green-600/30 text-green-300 border border-green-500/50'
            : 'bg-slate-600/30 hover:bg-slate-500/40 text-slate-200 border border-slate-500/30'
        }`}
      >
        {shareSuccess ? (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {language === 'hi' ? 'कॉपी हो गया' : 'Copied!'}
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {t.share}
          </>
        )}
      </button>
      {showDontSave && onDontSave && (
        <button
          onClick={onDontSave}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-300 text-xs border border-slate-600/50 hover:border-slate-500/50 transition-all"
        >
          {t.dontSave}
        </button>
      )}
    </div>
  );
};

export default SaveShareBar;
