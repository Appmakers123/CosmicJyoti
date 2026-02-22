import React, { useState } from 'react';
import { Language } from '../types';
import { generateMobileNumerologyAnalysis } from '../services/geminiService';
import { setErrorSafely } from '../utils/errorHandler';
import AdBanner from './AdBanner';
import RichText from './RichText';
import { BackButton, ModuleIntro } from './common';

const normalizeNumber = (raw: string): string => raw.replace(/\D/g, '').slice(0, 15);

const MobileNumerology: React.FC<{ language: Language; onBack?: () => void }> = ({ language, onBack }) => {
  const [rawInput, setRawInput] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mobileNumber = normalizeNumber(rawInput);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileNumber.length < 10) {
      setError(language === 'hi' ? 'कृपया कम से कम 10 अंक डालें' : 'Please enter at least 10 digits');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const text = await generateMobileNumerologyAnalysis(mobileNumber, language);
      setResult(text);
    } catch (err) {
      setErrorSafely(setError, err, language, 'MobileNumerology');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-12 animate-fade-in-up">
      <div className="bg-slate-800/80 backdrop-blur-md border border-amber-500/30 rounded-2xl p-8 shadow-2xl">
        {onBack && (
          <div className="mb-6">
            <BackButton onClick={onBack} label={language === 'hi' ? 'वापस' : 'Back'} />
          </div>
        )}
        <ModuleIntro
          language={language}
          subtitleEn="Mobile number numerology – phone number vibration and its impact on business, luck and personal energy."
          subtitleHi="मोबाइल अंक ज्योतिष – नंबर की कंपन और व्यवसाय, भाग्य व व्यक्तिगत ऊर्जा पर प्रभाव।"
          descriptionEn="Enter your mobile number to get a free analysis. Numerology looks at digit patterns, root number and vibrations linked to success and luck."
          descriptionHi="मोबाइल नंबर डालें और मुफ्त विश्लेषण पाएं। अंक ज्योतिष में अंकों के पैटर्न, मूलांक और कंपन देखी जाती है।"
        />
        <h2 className="text-2xl sm:text-3xl font-serif text-amber-200 mb-2 break-words">
          {language === 'hi' ? 'मोबाइल अंक ज्योतिष' : 'Mobile Numerology'}
        </h2>
        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-xs uppercase tracking-wider mb-1">{language === 'hi' ? 'मोबाइल नंबर' : 'Mobile number'}</label>
              <input type="tel" value={rawInput} onChange={(e) => setRawInput(e.target.value)} placeholder={language === 'hi' ? 'बिना +91 या स्पेस के' : 'e.g. 9876543210 (no +91 or spaces)'} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500" maxLength={15} />
              <p className="text-slate-500 text-xs mt-1">{language === 'hi' ? 'कम से कम 10 अंक' : 'At least 10 digits'} — {language === 'hi' ? 'व्यवसाय / भाग्य विश्लेषण' : 'business & luck analysis'}</p>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold text-white disabled:opacity-50">
              {loading ? (language === 'hi' ? 'विश्लेषण हो रहा है...' : 'Analyzing...') : (language === 'hi' ? 'विश्लेषण देखें' : 'Get analysis')}
            </button>
          </form>
        ) : (
          <div className="space-y-6 min-w-0">
            <AdBanner variant="leaderboard" />
            <div className="bg-slate-900/60 p-4 sm:p-6 rounded-2xl border border-amber-500/20 min-w-0 w-full overflow-visible">
              <div className="break-words text-slate-300 text-sm leading-relaxed overflow-visible">
                <RichText text={result} className="break-words" />
              </div>
            </div>
            <button type="button" onClick={() => { setResult(null); setError(null); setRawInput(''); }} className="px-4 py-2 bg-slate-700 rounded-lg text-slate-300 text-sm">
              {language === 'hi' ? 'दूसरा नंबर' : 'Another number'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileNumerology;
