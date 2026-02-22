import React, { useState } from 'react';
import { Language, MuhuratItem } from '../types';
import { useTranslation } from '../utils/translations';
import { generateMuhuratPlanner } from '../services/geminiService';
import { getGlobalProfile } from '../utils/profileStorageService';
import { BackButton, ModuleIntro } from './common';
import Logo from './Logo';
import AdBanner from './AdBanner';

interface MuhuratLabProps {
  language: Language;
  onBack: () => void;
}

const ACTIVITIES: { value: string; labelEn: string; labelHi: string }[] = [
  { value: 'general', labelEn: 'General — All activities', labelHi: 'सामान्य — सभी गतिविधियाँ' },
  { value: 'marriage', labelEn: 'Marriage / Wedding', labelHi: 'विवाह' },
  { value: 'travel', labelEn: 'Travel / Journey', labelHi: 'यात्रा' },
  { value: 'griha_pravesh', labelEn: 'Housewarming', labelHi: 'गृह प्रवेश' },
  { value: 'business', labelEn: 'Business / New venture', labelHi: 'व्यापार / नया उद्यम' },
  { value: 'education', labelEn: 'Education / Admissions', labelHi: 'शिक्षा / प्रवेश' },
];

const STATUS_COLORS: Record<string, string> = {
  Excellent: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300',
  Good: 'border-green-500/40 bg-green-500/10 text-green-300',
  Average: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  Avoid: 'border-red-500/30 bg-red-500/10 text-red-300',
};

const MuhuratLab: React.FC<MuhuratLabProps> = ({ language, onBack }) => {
  const t = useTranslation(language);
  const profile = getGlobalProfile();
  const defaultLocation = profile?.self?.location || 'New Delhi, India';
  const today = new Date().toISOString().slice(0, 10);

  const [location, setLocation] = useState(defaultLocation);
  const [date, setDate] = useState(today);
  const [activity, setActivity] = useState('general');
  const [items, setItems] = useState<MuhuratItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setItems(null);
    try {
      const result = await generateMuhuratPlanner(location, language, date, activity);
      setItems(result);
    } catch (err: any) {
      setError(err?.message || (language === 'hi' ? 'मुहूर्त लोड नहीं हुआ। पुनः प्रयास करें।' : 'Could not load muhurat. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-12 animate-fade-in-up">
      <div className="mb-6 flex items-center justify-between">
        <BackButton onClick={onBack} label={language === 'hi' ? 'वापस' : 'Back'} />
      </div>
      <div className="bg-slate-800/80 border border-amber-500/30 rounded-2xl p-6 md:p-10 shadow-2xl">
        <ModuleIntro
          language={language}
          subtitleEn="Muhurat planner – auspicious time (shubh muhurat) for marriage, travel, griha pravesh, business by date & place."
          subtitleHi="मुहूर्त प्लानर – विवाह, यात्रा, गृह प्रवेश, व्यापार के लिए शुभ मुहूर्त तारीख और स्थान के अनुसार।"
          descriptionEn="Get daily muhurat based on Vedic Panchang and planetary positions. Choose activity type and location for accurate auspicious and inauspicious timings."
          descriptionHi="वैदिक पंचांग और ग्रह स्थिति के आधार पर दैनिक मुहूर्त पाएं। गतिविधि और स्थान चुनें – शुभ और अशुभ समय।"
        />
        <h2 className="text-2xl md:text-3xl font-serif text-amber-200 text-center mb-2">
          {t.muhuratPlanner}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-xs uppercase tracking-wider mb-1">{language === 'hi' ? 'तारीख' : 'Date'}</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-slate-100 [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs uppercase tracking-wider mb-1">{language === 'hi' ? 'स्थान' : 'Location'}</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-400 text-xs uppercase tracking-wider mb-1">{language === 'hi' ? 'गतिविधि' : 'Activity'}</label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-slate-100 [color-scheme:dark]"
            >
              {ACTIVITIES.map((a) => (
                <option key={a.value} value={a.value}>
                  {language === 'hi' ? a.labelHi : a.labelEn}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-60 text-white font-bold rounded-xl transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Logo className="w-5 h-5 animate-spin-slow" />
                {language === 'hi' ? 'प्राप्त कर रहे हैं...' : 'Getting Muhurat...'}
              </span>
            ) : (
              language === 'hi' ? 'शुभ मुहूर्त देखें' : 'Get Auspicious Times'
            )}
          </button>
        </form>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        {items && items.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-serif text-amber-200">
              {language === 'hi' ? 'आज के शुभ समय' : "Today's Auspicious Times"}
            </h3>
            {items.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border ${STATUS_COLORS[item.status] || 'border-slate-600 bg-slate-800/50'}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-slate-100">{item.activity}</span>
                  <span className="text-xs font-bold uppercase tracking-wider opacity-90">{item.status}</span>
                </div>
                <p className="text-sm font-medium text-amber-200/90">{item.timeRange}</p>
                {item.reason && <p className="text-slate-500 text-xs mt-1">{item.reason}</p>}
              </div>
            ))}
          </div>
        )}

        {items && items.length === 0 && !loading && (
          <p className="text-slate-500 text-center py-6">
            {t.noMuhuratAvailable || (language === 'hi' ? 'इस समय कोई मुहूर्त उपलब्ध नहीं है।' : 'No muhurat available at this time.')}
          </p>
        )}
        <AdBanner variant="display" className="mt-8" />
      </div>
    </div>
  );
};

export default MuhuratLab;
