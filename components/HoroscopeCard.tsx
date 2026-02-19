
import React, { useState, useMemo } from 'react';
import { HoroscopeResponse, ZodiacSignData, Language } from '../types';
import { useTranslation } from '../utils/translations';
import AdBanner from './AdBanner';
import RichText from './RichText';
import ModuleAskAI from './ModuleAskAI';
import { BackButton, SaveShareBar } from './common';
import { saveReport, getReportByForm } from '../utils/reportStorageService';
import { trackRemind } from '../utils/dataLayer';

interface HoroscopeCardProps {
  data: HoroscopeResponse;
  sign: ZodiacSignData;
  language: Language;
  personalizedName?: string | null;
  onBack: () => void;
}

const HoroscopeCard: React.FC<HoroscopeCardProps> = ({ data, sign, language, personalizedName, onBack }) => {
  const t = useTranslation(language);
  // Format date based on language
  const getLocaleForLanguage = (lang: Language): string => {
    const localeMap: Record<Language, string> = {
      'en': 'en-US',
      'hi': 'hi-IN',
    };
    return localeMap[lang] || 'en-US';
  };
  const today = new Date().toLocaleDateString(getLocaleForLanguage(language), { weekday: 'long', month: 'long', day: 'numeric' });
  const todayStr = new Date().toISOString().slice(0, 10);
  const formInput = { sign: sign.name, date: todayStr, language };
  const [isSaved, setIsSaved] = useState(() => !!getReportByForm('horoscope', formInput));
  const displayTitle = personalizedName
    ? (language === 'hi' ? `${personalizedName} का दैनिक राशिफल` : `Daily Forecast for ${personalizedName}`)
    : (language === 'hi' ? sign.hindiName : sign.name);
  const shareContent = useMemo(() => {
    const lines = [
      `✨ ${displayTitle} - ${today}`,
      '',
      typeof data.horoscope === 'string' ? data.horoscope : JSON.stringify(data.horoscope),
      '',
      `Mood: ${data.mood} | Lucky: ${data.luckyNumber} | Color: ${data.luckyColor}`,
      '',
      '— CosmicJyoti (100% on-device, no data collection)',
    ];
    return lines.join('\n');
  }, [data, sign, today, language, displayTitle]);
  const handleSave = () => {
    saveReport('horoscope', data, formInput, personalizedName ? `Daily Forecast for ${personalizedName}` : `${sign.name} Horoscope`);
    setIsSaved(true);
  };
  const [notifEnabled, setNotifEnabled] = useState(() => {
    return localStorage.getItem('cosmic_notifications') === 'true';
  });

  const handleNotifySub = () => {
    localStorage.setItem('cosmic_notifications', 'true');
    setNotifEnabled(true);
    const message = language === 'hi' 
      ? `सदस्यता सफल! आप ${sign.hindiName} के लिए दैनिक अपडेट प्राप्त करेंगे।`
      : `Subscription successful! You will receive daily updates for ${sign.name}.`;
    alert(message);
  };

  const handleRemindTomorrow = () => {
    trackRemind('horoscope', 'tomorrow');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().slice(0, 10);
    localStorage.setItem('cosmicjyoti_remind_tomorrow', dateStr);
    const cal = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 8, 0);
    const gcal = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent('CosmicJyoti – Daily horoscope') + '&dates=' + cal.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z/' + cal.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
    window.open(gcal, '_blank');
    alert(language === 'hi' ? 'कल 8 बजे की याद दिला दी गई।' : 'Reminder set for tomorrow 8 AM.');
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 animate-fade-in-up pb-12">
      <div className="bg-[#1e293b] border border-amber-500/30 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Mystical Background Layers */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-amber-500/10 to-transparent"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Content */}
        <div className="relative z-10 p-8 md:p-12">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <BackButton onClick={onBack} label={language === 'hi' ? 'वापस' : 'Back'} />
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={handleRemindTomorrow} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 text-xs font-medium border border-slate-600 transition-colors">
                <span>🔔</span> {language === 'hi' ? 'कल याद दिलाएं' : 'Remind me tomorrow'}
              </button>
              <SaveShareBar
              language={language}
              onSave={handleSave}
              isSaved={isSaved}
              shareContent={shareContent}
              shareTitle={personalizedName ? `Daily Forecast for ${personalizedName}` : `${sign.name} Horoscope`}
              contentType="horoscope"
            />
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-8 mb-12 border-b border-slate-700/50 pb-8">
            <div className="w-32 h-32 text-amber-500 p-6 bg-slate-900/80 rounded-full border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.15)] flex-shrink-0">
              {sign.symbol}
            </div>
            <div className="text-center md:text-left space-y-1">
              <h2 className="text-4xl md:text-5xl font-serif text-amber-100">
                {displayTitle}
              </h2>
              <p className="text-amber-500 font-bold tracking-[0.3em] uppercase text-xs">{today}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                 <span className="px-3 py-1 bg-slate-800 rounded-full text-[10px] text-slate-400 font-bold uppercase tracking-widest border border-slate-700">{t.element || 'Element'}: {sign.element}</span>
                 <span className="px-3 py-1 bg-slate-800 rounded-full text-[10px] text-slate-400 font-bold uppercase tracking-widest border border-slate-700">{t.mood || 'Mood'}: {data.mood}</span>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <div className="relative pl-6 border-l-2 border-amber-500/30">
               <span className="absolute -top-2 -left-2 text-5xl text-amber-500/20 font-serif leading-none">"</span>
               <RichText text={data.horoscope} className="text-base md:text-lg leading-relaxed text-slate-200 font-light pl-4 space-y-3" />
            </div>
            
            {!notifEnabled && (
                <div className="bg-amber-900/10 border border-amber-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                    <div className="flex items-center gap-4">
                        <span className="text-3xl animate-bounce">🔔</span>
                        <div>
                            <h4 className="text-amber-200 font-bold text-sm uppercase tracking-wider">{t.dailyAlerts}</h4>
                            <p className="text-slate-500 text-xs">
                              {language === 'hi' ? 'दैनिक पूर्वानुमान, राशिफल, टैरो और कॉस्मिक हेल्थ के लिए सूचनाएं प्राप्त करें' : 'Get notifications for Daily Forecast, Horoscope, Tarot & Cosmic Health'}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Subscribe Now button clicked');
                            handleNotifySub();
                        }}
                        className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg cursor-pointer active:scale-95"
                        type="button"
                    >
                        {t.subscribeNow}
                    </button>
                </div>
            )}

            <AdBanner variant="leaderboard" className="py-4" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50 flex flex-col items-center hover:border-amber-500/40 transition-colors group">
                <span className="text-[10px] uppercase text-slate-500 tracking-widest font-bold mb-2">{t.luckyNumber}</span>
                <span className="text-4xl font-serif text-amber-300 group-hover:scale-110 transition-transform">{data.luckyNumber}</span>
              </div>
              
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50 flex flex-col items-center hover:border-amber-500/40 transition-colors group">
                 <span className="text-[10px] uppercase text-slate-500 tracking-widest font-bold mb-2">{t.luckyColor}</span>
                 <div className="flex items-center gap-2">
                   <div className="w-5 h-5 rounded-full border border-white/20 shadow-glow" style={{ backgroundColor: data.luckyColor.toLowerCase() || 'gold' }} />
                   <span className="text-sm font-bold text-slate-200 uppercase tracking-tighter">{data.luckyColor}</span>
                 </div>
              </div>

              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50 flex flex-col items-center hover:border-amber-500/40 transition-colors group">
                 <span className="text-[10px] uppercase text-slate-500 tracking-widest font-bold mb-2">{t.compatibility}</span>
                 <span className="text-sm font-bold text-pink-300 group-hover:scale-105 transition-transform">{data.compatibility}</span>
              </div>
            </div>

            <div className="mt-8">
              <ModuleAskAI
                contextStr={[
                  `Sign: ${sign.name} (${sign.hindiName})`,
                  `Element: ${sign.element}`,
                  `Horoscope: ${typeof data.horoscope === 'string' ? data.horoscope : JSON.stringify(data.horoscope)}`,
                  `Mood: ${data.mood}`,
                  `Lucky Number: ${data.luckyNumber}`,
                  `Lucky Color: ${data.luckyColor}`,
                  `Compatibility: ${data.compatibility}`,
                ].join('. ')}
                language={language}
                moduleName={language === 'hi' ? 'राशिफल / दैनिक पूर्वानुमान' : 'Horoscope / Daily Forecast'}
                accentColor="amber"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoroscopeCard;
