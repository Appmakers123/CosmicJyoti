
import React, { useMemo } from 'react';
import { DailyPanchangResponse, Language } from '../types';
import { useTranslation } from '../utils/translations';
import AdBanner from './AdBanner';
import { BackButton, SaveShareBar } from './common';
import { saveReport, getReportByForm } from '../utils/reportStorageService';

interface DailyPanchangProps {
  data: DailyPanchangResponse;
  language: Language;
  onBack?: () => void;
  formInput?: { date: string; location: string };
}

const DailyPanchang: React.FC<DailyPanchangProps> = ({ data, language, onBack, formInput }) => {
  const t = useTranslation(language);
  const [isSaved, setIsSaved] = React.useState(() => formInput ? !!getReportByForm('panchang', formInput) : false);

  const shareContent = useMemo(() => {
    const lines = [
      `📅 ${t.todaysPanchang} - ${data.date} • ${data.location}`,
      '',
      `Sunrise: ${data.sunrise} | Sunset: ${data.sunset} | Moonrise: ${data.moonrise}`,
      `Tithi: ${data.tithi.name} | Nakshatra: ${data.nakshatra.name}`,
      `Yoga: ${data.yoga.name} | Karana: ${data.karana.name}`,
      `Rahu Kalam: ${data.rahuKalam} | Abhijit: ${data.abhijitMuhurat}`,
      '',
      '— CosmicJyoti (100% on-device, no data collection)',
    ];
    return lines.join('\n');
  }, [data, t.todaysPanchang]);

  const handleSave = () => {
    if (formInput) {
      saveReport('panchang', data, formInput, `Panchang ${data.date}`);
      setIsSaved(true);
    }
  };

  const handleRemindTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().slice(0, 10);
    localStorage.setItem('cosmicjyoti_remind_tomorrow', dateStr);
    const cal = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 8, 0);
    const gcal = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent('CosmicJyoti – Today\'s Panchang') + '&dates=' + cal.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z/' + cal.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
    window.open(gcal, '_blank');
    alert(language === 'hi' ? 'कल 8 बजे की याद दिला दी गई।' : 'Reminder set for tomorrow 8 AM.');
  };

  const DataRow = ({ label, value, subValue }: { label: string, value: string, subValue?: string }) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b border-slate-700/50 last:border-0">
      <span className="text-slate-400 text-sm uppercase tracking-wider font-medium">{label}</span>
      <div className="text-right mt-1 sm:mt-0">
        <span className="text-amber-100 font-serif text-lg block">{value}</span>
        {subValue && <span className="text-slate-500 text-xs">Ends: {subValue}</span>}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 animate-fade-in-up pb-12">
      <div className="bg-slate-800/80 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
        {onBack && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <BackButton onClick={onBack} label={language === 'hi' ? 'वापस' : 'Back'} />
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={handleRemindTomorrow} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 text-xs font-medium border border-slate-600 transition-colors">
                <span>🔔</span> {language === 'hi' ? 'कल याद दिलाएं' : 'Remind me tomorrow'}
              </button>
              <SaveShareBar
              language={language}
              onSave={formInput ? handleSave : undefined}
              isSaved={isSaved}
              shareContent={shareContent}
              shareTitle={`Panchang ${data.date}`}
            />
            </div>
          </div>
        )}
        {/* Background Decorative */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-bl-full pointer-events-none"></div>

        <div className="text-center mb-10 relative z-10">
          <h2 className="text-3xl md:text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-200 to-yellow-200 mb-3">
             {t.todaysPanchang}
          </h2>
          <div className="inline-flex items-center gap-2 bg-slate-900/50 px-4 py-1 rounded-full border border-slate-700">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
             <p className="text-slate-300 text-sm">{data.date} • {data.location}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
           
           {/* Sun & Moon */}
           <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700 hover:border-amber-500/20 transition-colors">
             <h3 className="text-amber-500 font-serif text-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                Solar & Lunar
             </h3>
             <DataRow label={t.sunrise} value={data.sunrise} />
             <DataRow label={t.sunset} value={data.sunset} />
             <DataRow label={t.moonrise} value={data.moonrise} />
           </div>

           {/* Core Panchang */}
           <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700 hover:border-amber-500/20 transition-colors">
             <h3 className="text-amber-500 font-serif text-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                Elements
             </h3>
             <DataRow label={t.tithi} value={data.tithi.name} subValue={data.tithi.endTime} />
             <DataRow label={t.nakshatra} value={data.nakshatra.name} subValue={data.nakshatra.endTime} />
             <DataRow label={t.yoga} value={data.yoga.name} subValue={data.yoga.endTime} />
             <DataRow label={t.karana} value={data.karana.name} subValue={data.karana.endTime} />
           </div>

           {/* Timings */}
           <div className="lg:col-span-2 bg-slate-900/50 rounded-xl p-6 border border-slate-700 hover:border-amber-500/20 transition-colors">
             <h3 className="text-amber-500 font-serif text-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Muhurats (Timings)
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-red-900/20 border border-red-700/30 rounded-lg group/item transition-all hover:bg-red-900/30">
                   <p className="text-red-300 text-[10px] uppercase font-bold mb-1 tracking-widest">{t.rahuKalam}</p>
                   <p className="text-white text-lg font-serif">{data.rahuKalam}</p>
                </div>
                <div className="p-4 bg-orange-900/20 border border-orange-700/30 rounded-lg group/item transition-all hover:bg-orange-900/30">
                   <p className="text-orange-300 text-[10px] uppercase font-bold mb-1 tracking-widest">{t.yamaganda}</p>
                   <p className="text-white text-lg font-serif">{data.yamaganda}</p>
                </div>
                <div className="p-4 bg-green-900/20 border border-green-700/30 rounded-lg group/item transition-all hover:bg-green-900/30">
                   <p className="text-green-300 text-[10px] uppercase font-bold mb-1 tracking-widest">{t.abhijit}</p>
                   <p className="text-white text-lg font-serif">{data.abhijitMuhurat}</p>
                </div>
             </div>
           </div>
        </div>
        
        <AdBanner variant="leaderboard" className="mt-8" />
        
      </div>
    </div>
  );
};

export default DailyPanchang;
