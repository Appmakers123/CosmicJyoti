
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../utils/translations';
import { getExternalLinkProps } from '../utils/linkHandler';
import { setErrorSafely } from '../utils/errorHandler';
import { Language, PalmPrediction } from '../types';
import { generatePalmInterpretation } from '../services/geminiService';
import { isCapacitor } from '../utils/linkHandler';
import admobService from '../services/admobService';
import AdBanner from './AdBanner';
import RichText from './RichText';
import { getCachedAI, setCachedAI } from '../utils/aiCacheService';

interface PalmReadingProps {
  language: Language;
}

const PalmReading: React.FC<PalmReadingProps> = ({ language }) => {
  const t = useTranslation(language);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [reading, setReading] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setReading(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    const cacheInput = { palm: 'default', lang: language };
    const cached = getCachedAI<string>('palm', cacheInput);
    if (cached) {
      setReading(cached);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Pass standard palm lines for Gemini to interpret (full line detection coming soon)
      const detectedLines = ["Life Line", "Heart Line", "Head Line"];
      const interpretation = await generatePalmInterpretation(detectedLines, language);
      setCachedAI('palm', cacheInput, interpretation);
      setReading(interpretation);
      // Show interstitial ad after reading (Android only)
      if (isCapacitor()) {
        setTimeout(async () => {
          try {
            const isReady = await admobService.isInterstitialReady();
            if (!isReady) await admobService.loadInterstitial();
            await new Promise(r => setTimeout(r, 1000));
            await admobService.showInterstitial();
          } catch (adErr) {
            console.log('[AdMob] Interstitial after palm:', adErr);
          }
        }, 2000);
      }
    } catch (err) {
      setErrorSafely(setError, err, language, 'PalmReading');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-12 animate-fade-in-up">
        <div className="bg-slate-800/80 backdrop-blur-md border border-amber-500/30 rounded-2xl p-8 shadow-2xl relative">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
                <div className="flex-1">
                    <h2 className="text-3xl font-serif text-amber-200 mb-2">{t.palmReading}</h2>
                    <p className="text-slate-400 text-sm">Study the lines of fate upon your hand</p>
                </div>
                <button
                  onClick={() => {
                    // Navigate directly to PalmistryGuide
                    const event = new CustomEvent('switchMode', { detail: { mode: 'palmistry-guide' } });
                    window.dispatchEvent(event);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 rounded-full text-xs font-bold text-rose-300 uppercase tracking-wider transition-all min-h-[44px]"
                >
                  <span>📚</span>
                  {language === 'hi' ? 'हस्तरेखा सीखें' : 'Learn Palmistry'}
                </button>
            </div>

            {/* WhatsApp Contact Section */}
            <div className="mb-8 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-serif text-green-200 mb-2 flex items-center justify-center md:justify-start gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    {language === 'hi' ? 'हस्तरेखा परामर्श के लिए संपर्क करें' : 'Get Expert Palmistry Consultation'}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {language === 'hi' 
                      ? 'विशेषज्ञ हस्तरेखा ज्योतिषी से व्यक्तिगत रीडिंग प्राप्त करें'
                      : 'Get personalized palm reading from our expert palmistry astrologer'}
                  </p>
                </div>
                <a 
                  {...getExternalLinkProps("https://wa.me/919326715739", language)}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all hover:shadow-green-500/50 flex items-center gap-2 whitespace-nowrap"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span>{language === 'hi' ? 'WhatsApp पर संपर्क करें' : 'Contact on WhatsApp'}</span>
                </a>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6">
                {!previewUrl ? (
                    <label className="w-full h-64 border-2 border-slate-700 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer bg-slate-900/40 hover:bg-slate-800/40 transition-colors">
                        <span className="text-4xl mb-2">✋</span>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Upload your palm photo</p>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                ) : (
                    <div className="relative w-full max-w-sm rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
                        <img ref={imgRef} src={previewUrl} alt="Palm" className="w-full h-auto" />
                        <button onClick={() => {setPreviewUrl(null); setReading(null);}} className="absolute top-2 right-2 bg-slate-900/80 p-2 rounded-full text-white">×</button>
                    </div>
                )}

                {previewUrl && !reading && (
                    <button onClick={handleAnalyze} disabled={loading} className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-800 text-white font-serif font-bold rounded-xl shadow-lg disabled:opacity-50">
                        {loading ? "Analyzing fate lines..." : "Interpret Palm"}
                    </button>
                )}
            </div>

            {reading && (
                <div className="mt-12 animate-fade-in space-y-6">
                     <AdBanner variant="leaderboard" />
                     <div className="bg-slate-900/60 p-8 rounded-2xl border border-amber-500/20 shadow-inner">
                        <h3 className="text-xl font-serif text-amber-100 mb-4">Vedic Interpretation</h3>
                        <RichText text={reading} />
                     </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default PalmReading;
