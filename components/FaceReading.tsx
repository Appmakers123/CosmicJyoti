import React, { useState } from 'react';
import { useTranslation } from '../utils/translations';
import { getExternalLinkProps } from '../utils/linkHandler';
import { setErrorSafely } from '../utils/errorHandler';
import { Language } from '../types';
import { generateFaceReading } from '../services/geminiService';
import { isCapacitor } from '../utils/linkHandler';
import admobService from '../services/admobService';
import AdBanner from './AdBanner';
import RichText from './RichText';
import { getCachedAI, setCachedAI } from '../utils/aiCacheService';

interface FaceReadingProps {
  language: Language;
}

const FaceReading: React.FC<FaceReadingProps> = ({ language }) => {
  const t = useTranslation(language);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [reading, setReading] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setError(t.chooseImage);
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setReading(null);
      setError(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        resolve(base64 || '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const getMimeType = (file: File): 'image/jpeg' | 'image/png' | 'image/webp' => {
    const type = file.type.toLowerCase();
    if (type === 'image/png') return 'image/png';
    if (type === 'image/webp') return 'image/webp';
    return 'image/jpeg';
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    const cacheKey = `face-${imageFile.name}-${imageFile.size}-${language}`;
    const cached = getCachedAI<string>('face', { key: cacheKey });
    if (cached) {
      setReading(cached);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const base64 = await fileToBase64(imageFile);
      const mime = getMimeType(imageFile);
      const interpretation = await generateFaceReading(base64, mime, language);
      setCachedAI('face', { key: cacheKey }, interpretation);
      setReading(interpretation);
      if (isCapacitor()) {
        setTimeout(async () => {
          try {
            const isReady = await admobService.isInterstitialReady();
            if (!isReady) await admobService.loadInterstitial();
            await new Promise((r) => setTimeout(r, 1000));
            await admobService.showInterstitial();
          } catch {
            // ignore
          }
        }, 2000);
      }
    } catch (err) {
      setErrorSafely(setError, err, language, 'FaceReading');
    } finally {
      setLoading(false);
    }
  };

  const faceTitle = t.faceReadingTitle;
  const faceSubtitle = t.faceReadingSubtitle;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-12 animate-fade-in-up">
      <div className="bg-slate-800/80 backdrop-blur-md border border-amber-500/30 rounded-2xl p-8 shadow-2xl relative">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <div className="flex-1">
            <h2 className="text-3xl font-serif text-amber-200 mb-2">{faceTitle}</h2>
            <p className="text-slate-400 text-sm">{faceSubtitle}</p>
          </div>
        </div>

        <div className="mb-8 bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-serif text-amber-200 mb-2">
                {language === 'hi' ? 'चेहरा पढ़ने की विशेषज्ञ परामर्श' : 'Expert Face Reading Consultation'}
              </h3>
              <p className="text-slate-400 text-sm">
                {language === 'hi'
                  ? 'विशेषज्ञ समुद्रिक शास्त्र ज्योतिषी से व्यक्तिगत विश्लेषण प्राप्त करें'
                  : 'Get a personalized face reading from our expert Samudrik Shastra astrologer'}
              </p>
            </div>
            <a
              {...getExternalLinkProps('https://wa.me/919326715739', language)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <span>{language === 'hi' ? 'WhatsApp पर संपर्क करें' : 'Contact on WhatsApp'}</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          {!previewUrl ? (
            <label className="w-full h-64 border-2 border-slate-700 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer bg-slate-900/40 hover:bg-slate-800/40 transition-colors">
              <span className="text-4xl mb-2">👤</span>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                {t.chooseImage}
              </p>
              <p className="text-slate-600 text-xs mt-1">JPEG, PNG or WebP • Clear, front-facing</p>
              <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
            </label>
          ) : (
            <div className="relative w-full max-w-sm rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
              <img src={previewUrl} alt="Face" className="w-full h-auto" />
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl(null);
                  setImageFile(null);
                  setReading(null);
                  setError(null);
                }}
                className="absolute top-2 right-2 bg-slate-900/80 p-2 rounded-full text-white hover:bg-slate-800"
                aria-label="Remove"
              >
                ×
              </button>
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          {previewUrl && !reading && (
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-800 text-white font-serif font-bold rounded-xl shadow-lg disabled:opacity-50"
            >
              {loading ? t.loadingFaceReading : t.analyzeFace}
            </button>
          )}
        </div>

        {reading && (
          <div className="mt-12 animate-fade-in space-y-6">
            <AdBanner variant="leaderboard" />
            <div className="bg-slate-900/60 p-8 rounded-2xl border border-amber-500/20 shadow-inner">
              <h3 className="text-xl font-serif text-amber-100 mb-4">
                {language === 'hi' ? 'समुद्रिक विश्लेषण' : 'Face Reading — Your Analysis'}
              </h3>
              <RichText text={reading} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceReading;
