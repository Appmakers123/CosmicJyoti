
import React, { useState, useMemo } from 'react';
import { KundaliResponse, Language } from '../types';
import { useTranslation } from '../utils/translations';
import { translatePlanet, translateSign } from '../constants';
import { getExternalLinkProps } from '../utils/linkHandler';
import AdBanner from './AdBanner';
import RichText from './RichText';
import KundaliAskAI from './KundaliAskAI';
import SouthIndianChart from './SouthIndianChart';
import NorthIndianChart from './NorthIndianChart';
import { BackButton, InfoCard, PredictionCard, TabButton, SaveShareBar } from './common';
import { saveReport, getReportByForm } from '../utils/reportStorageService';
import { sanitizeSvg } from '../utils/sanitize';

interface KundaliResultProps {
  data: KundaliResponse;
  name: string;
  language: Language;
  onBack: () => void;
  formInput?: { name: string; date: string; time: string; location: string };
}

const KundaliResult: React.FC<KundaliResultProps> = ({ data, name, language, onBack, formInput }) => {
  const t = useTranslation(language);
  const [activeChart, setActiveChart] = useState<'d1' | 'd9'>('d1'); 
  const [chartStyle, setChartStyle] = useState<'north' | 'south'>('north');
  const [isSaved, setIsSaved] = useState(() => formInput ? !!getReportByForm('kundali', formInput) : false);

  const shareContent = useMemo(() => {
    const b = data.basicDetails;
    const p = data.predictions;
    const lines = [
      `🌟 ${t.janamKundali} - ${name}`,
      '',
      `Ascendant: ${b?.ascendant || '-'} | Moon: ${b?.moonSign || '-'} | Sun: ${b?.sunSign || '-'} | Nakshatra: ${b?.nakshatra || '-'}`,
      '',
      p?.general ? `General: ${p.general}` : '',
      p?.career ? `Career: ${p.career}` : '',
      p?.love ? `Love: ${p.love}` : '',
      p?.health ? `Health: ${p.health}` : '',
      p?.finance ? `Finance: ${p.finance}` : '',
      '',
      '— CosmicJyoti (100% on-device, no data collection)',
    ].filter(Boolean);
    return lines.join('\n');
  }, [data, name, t.janamKundali]);

  const handleSave = () => {
    if (formInput) {
      saveReport('kundali', data, formInput, `Kundali for ${name}`);
      setIsSaved(true);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pb-16 animate-fade-in-up">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <BackButton onClick={onBack} label={t.newKundali} />
        <div className="flex flex-wrap items-center gap-2">
          <SaveShareBar
            language={language}
            onSave={formInput ? handleSave : undefined}
            isSaved={isSaved}
            shareContent={shareContent}
            shareTitle={`Kundali for ${name}`}
          />
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = '';
              const event = new CustomEvent('navigateToLearning', { detail: { tab: 'kundali' } });
              window.dispatchEvent(event);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-600 hover:border-amber-500/40 text-amber-300 text-sm font-medium transition-colors"
          >
            <span>📚</span>
            {language === 'hi' ? 'कुंडली सीखें' : 'Learn Kundali'}
          </a>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Hero */}
        <div className="text-center py-8 px-6 rounded-2xl bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20">
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-orange-200 mb-2">
            {t.janamKundali}
          </h1>
          <p className="text-slate-400 text-sm font-medium">{t.vedicHoroscopeFor} {name}</p>
        </div>

        {/* Sun / Moon / Lagna cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-xl p-4 sm:p-5 bg-slate-800/80 border border-slate-600/80 text-center">
            <span className="text-[10px] uppercase text-slate-500 tracking-wider block mb-1.5">{language === 'hi' ? 'सूर्य राशि' : 'Sun Sign'}</span>
            <span className="text-lg sm:text-xl font-serif font-semibold text-amber-300">{data.basicDetails?.sunSign || '-'}</span>
          </div>
          <div className="rounded-xl p-4 sm:p-5 bg-slate-800/80 border border-slate-600/80 text-center">
            <span className="text-[10px] uppercase text-slate-500 tracking-wider block mb-1.5">{language === 'hi' ? 'चंद्र राशि' : 'Moon Sign'}</span>
            <span className="text-lg sm:text-xl font-serif font-semibold text-amber-300">{data.basicDetails?.moonSign || '-'}</span>
          </div>
          <div className="rounded-xl p-4 sm:p-5 bg-slate-800/80 border border-slate-600/80 text-center">
            <span className="text-[10px] uppercase text-slate-500 tracking-wider block mb-1.5">{language === 'hi' ? 'लग्न' : 'Lagna'}</span>
            <span className="text-lg sm:text-xl font-serif font-semibold text-amber-300">{data.basicDetails?.ascendant || '-'}</span>
          </div>
        </div>

        {/* WhatsApp CTA */}
        <div className="rounded-2xl p-4 sm:p-5 bg-slate-800/60 border border-slate-600/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-serif text-green-200 mb-2 flex items-center justify-center md:justify-start gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                {language === 'hi' ? 'कुंडली परामर्श के लिए संपर्क करें' : 'Get Expert Kundali Consultation'}
              </h3>
              <p className="text-slate-400 text-sm">
                {language === 'hi' 
                  ? 'विशेषज्ञ ज्योतिषी से व्यक्तिगत कुंडली रीडिंग प्राप्त करें'
                  : 'Get personalized Kundali reading from our expert astrologer'}
              </p>
          </div>
          <a 
            {...getExternalLinkProps("https://wa.me/919326715739", language)}
            className="shrink-0 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all hover:shadow-green-500/50 flex items-center gap-2 whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span>{language === 'hi' ? 'WhatsApp पर संपर्क करें' : 'Contact on WhatsApp'}</span>
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col items-center">
            <div className="flex gap-4 mb-4">
                <TabButton 
                  label={`${t.janamKundali} (D1)`}
                  isActive={activeChart === 'd1'}
                  onClick={() => setActiveChart('d1')}
                />
                <TabButton 
                  label={t.navamshaChart}
                  isActive={activeChart === 'd9'}
                  onClick={() => setActiveChart('d9')}
                />
            </div>
            
            <div className="flex gap-2 mb-4 bg-slate-800 rounded-lg p-1">
                <button 
                onClick={() => setChartStyle('north')}
                className={`px-3 py-1 rounded-md text-xs font-bold uppercase transition-colors ${chartStyle === 'north' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                North
                </button>
                <button 
                    onClick={() => setChartStyle('south')}
                    className={`px-3 py-1 rounded-md text-xs font-bold uppercase transition-colors ${chartStyle === 'south' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    South
                </button>
            </div>

            <div className="w-full max-w-[450px] mx-auto p-2 animate-fade-in flex justify-center relative group">
                 {activeChart === 'd1' ? (
                    data.charts?.d1ChartSvg ? (
                        <div 
                            className="w-full bg-slate-950 border-4 border-amber-900/40 rounded-xl shadow-2xl overflow-hidden"
                            style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <div 
                                className="w-full h-full"
                                dangerouslySetInnerHTML={{ __html: sanitizeSvg(data.charts.d1ChartSvg) }}
                            />
                        </div>
                    ) : (
                    (data.charts?.planetaryPositions && data.charts.planetaryPositions.length > 0) ? (
                        chartStyle === 'north' ? (
                            <NorthIndianChart 
                                planets={data.charts.planetaryPositions} 
                                ascendantSignId={data.basicDetails?.ascendantSignId || 1} 
                                language={language} 
                                importantPoints={data.charts?.importantPoints || []}
                            />
                        ) : (
                            <SouthIndianChart 
                                planets={data.charts.planetaryPositions} 
                                ascendantSignId={data.basicDetails?.ascendantSignId || 1} 
                                language={language} 
                            />
                        )
                    ) : (
                        <div className="w-full max-w-[450px] aspect-square bg-slate-950 border-4 border-amber-900/40 rounded-xl shadow-2xl flex items-center justify-center">
                            <div className="text-center p-8">
                                <p className="text-amber-400 text-lg mb-2">Chart Loading...</p>
                                <p className="text-slate-500 text-sm">Waiting for planetary data</p>
                            </div>
                        </div>
                    )
                    )
                 ) : (
                    data.charts?.d9ChartSvg ? (
                        <div 
                            className="w-full bg-slate-950 border-4 border-amber-900/40 rounded-xl shadow-2xl overflow-hidden"
                            style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <div 
                                className="w-full h-full"
                                dangerouslySetInnerHTML={{ __html: sanitizeSvg(data.charts.d9ChartSvg) }}
                            />
                        </div>
                 ) : (
                    chartStyle === 'north' ? (
                        <NorthIndianChart 
                            planets={data.charts?.navamshaPositions || []} 
                            ascendantSignId={data.charts?.navamshaAscendantSignId || 1} 
                            language={language} 
                                importantPoints={[]}
                        />
                    ) : (
                        <SouthIndianChart 
                            planets={data.charts?.navamshaPositions || []} 
                            ascendantSignId={data.charts?.navamshaAscendantSignId || 1} 
                            language={language} 
                        />
                        )
                    )
                 )}
            </div>
          </div>

          <div className="space-y-6">
             <InfoCard title="Kundali Details">
               <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                 <div>
                   <span className="text-xs text-slate-500 uppercase block">{t.lagna}</span>
                   <span className="text-slate-200 font-medium">{translateSign(data.basicDetails?.ascendant || "Aries", language)}</span>
                 </div>
                 <div>
                   <span className="text-xs text-slate-500 uppercase block">{t.rashi}</span>
                   <span className="text-slate-200 font-medium">{translateSign(data.basicDetails?.moonSign || "Aries", language)}</span>
                 </div>
                 <div>
                   <span className="text-xs text-slate-500 uppercase block">{t.sunSign}</span>
                   <span className="text-slate-200 font-medium">{translateSign(data.basicDetails?.sunSign || "Aries", language)}</span>
                 </div>
                 <div>
                   <span className="text-xs text-slate-500 uppercase block">{t.nakshatra}</span>
                   <span className="text-slate-200 font-medium">{data.basicDetails?.nakshatra || "..."}</span>
                 </div>
               </div>
             </InfoCard>

             {/* Planetary Positions Table */}
             <InfoCard title={language === 'hi' ? 'ग्रह स्थिति' : 'Planetary Positions'}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-700">
                                <th className="text-left py-2 px-2 text-amber-500/80 font-bold text-xs uppercase">{language === 'hi' ? 'ग्रह' : 'Planet'}</th>
                                <th className="text-left py-2 px-2 text-amber-500/80 font-bold text-xs uppercase">{language === 'hi' ? 'राशि' : 'Sign'}</th>
                                <th className="text-left py-2 px-2 text-amber-500/80 font-bold text-xs uppercase">{language === 'hi' ? 'भाव' : 'House'}</th>
                                <th className="text-left py-2 px-2 text-amber-500/80 font-bold text-xs uppercase">{language === 'hi' ? 'अंश' : 'Degree'}</th>
                                <th className="text-left py-2 px-2 text-amber-500/80 font-bold text-xs uppercase">{language === 'hi' ? 'नक्षत्र' : 'Nakshatra'}</th>
                                <th className="text-center py-2 px-2 text-amber-500/80 font-bold text-xs uppercase">{language === 'hi' ? 'वक्री' : 'Retro'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(data.charts?.planetaryPositions || []).map((planet, idx) => (
                                <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                                    <td className="py-2 px-2 text-slate-200 font-medium">{translatePlanet(planet.planet, language)}</td>
                                    <td className="py-2 px-2 text-slate-300">{translateSign(planet.sign || 'Aries', language)}</td>
                                    <td className="py-2 px-2 text-slate-300">{planet.house || '-'}</td>
                                    <td className="py-2 px-2 text-amber-400 font-mono">{planet.degree ? `${planet.degree}°` : '-'}</td>
                                    <td className="py-2 px-2 text-slate-400 text-xs">{planet.nakshatra || '-'}</td>
                                    <td className="py-2 px-2 text-center">
                                        {planet.isRetrograde ? (
                                            <span className="text-red-400 font-bold">R</span>
                                        ) : (
                                            <span className="text-slate-600">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </InfoCard>

             {/* Important Points Section */}
             {data.charts?.importantPoints && data.charts.importantPoints.length > 0 && (
                <InfoCard title={language === 'hi' ? 'महत्वपूर्ण बिंदु' : 'Important Points'}>
                    <div className="space-y-3">
                        {data.charts.importantPoints
                            .filter(point => {
                                // Hide GUL and Mandi as calculation logic needs correction
                                // BB is now shown with corrected anticlockwise calculation
                                const pointName = (language === 'hi' ? point.nameHi : point.name).toLowerCase();
                                return !pointName.includes('gulika') && 
                                       !pointName.includes('gul') && 
                                       !pointName.includes('mandi') &&
                                       !pointName.includes('मंडी') &&
                                       !pointName.includes('गुलिका');
                            })
                            .map((point, idx) => (
                            <div key={idx} className="bg-slate-900/40 border border-slate-700/30 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-red-400 font-bold text-sm">
                                        {language === 'hi' ? point.nameHi : point.name}
                                    </span>
                                    <span className="text-slate-400 text-xs">
                                        {language === 'hi' ? 'भाव' : 'House'} {point.house} | {translateSign(point.sign, language)}
                                    </span>
                                </div>
                                {point.degree && (
                                    <div className="text-amber-400 text-xs font-mono mb-1">
                                        {point.degree}°
                                    </div>
                                )}
                                <p className="text-slate-400 text-xs">{point.description}</p>
                            </div>
                        ))}
                    </div>
                </InfoCard>
             )}
          </div>
        </div>

        {/* Predictions Section */}
        {data.predictions && (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-amber-400 font-serif mb-6 text-2xl flex items-center gap-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    {language === 'hi' ? 'भविष्यवाणी' : 'Life Predictions'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* General Predictions */}
                    {data.predictions.general && (
                        <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-amber-500/20 rounded-xl p-5 hover:border-amber-500/40 transition-all">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-serif text-amber-300">
                                    {language === 'hi' ? 'सामान्य जीवन' : 'General Life'}
                                </h4>
                            </div>
                            <RichText text={data.predictions.general} className="text-sm text-slate-300 leading-relaxed" />
                        </div>
                    )}

                    {/* Career Predictions */}
                    {data.predictions.career && (
                        <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-blue-500/20 rounded-xl p-5 hover:border-blue-500/40 transition-all">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-serif text-blue-300">
                                    {language === 'hi' ? 'करियर और व्यवसाय' : 'Career & Business'}
                                </h4>
                            </div>
                            <RichText text={data.predictions.career} className="text-sm text-slate-300 leading-relaxed" />
                        </div>
                    )}

                    {/* Love & Relationships */}
                    {data.predictions.love && (
                        <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-pink-500/20 rounded-xl p-5 hover:border-pink-500/40 transition-all">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-serif text-pink-300">
                                    {language === 'hi' ? 'प्रेम और रिश्ते' : 'Love & Relationships'}
                                </h4>
                            </div>
                            <RichText text={data.predictions.love} className="text-sm text-slate-300 leading-relaxed" />
                        </div>
                    )}

                    {/* Health Predictions */}
                    {data.predictions.health && (
                        <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-emerald-500/20 rounded-xl p-5 hover:border-emerald-500/40 transition-all">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-serif text-emerald-300">
                                    {language === 'hi' ? 'स्वास्थ्य और कल्याण' : 'Health & Wellness'}
                                </h4>
                            </div>
                            <RichText text={data.predictions.health} className="text-sm text-slate-300 leading-relaxed" />
                        </div>
                    )}

                    {/* Finance Predictions */}
                    {data.predictions.finance && (
                        <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-green-500/20 rounded-xl p-5 hover:border-green-500/40 transition-all">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-serif text-green-300">
                                    {language === 'hi' ? 'धन और वित्त' : 'Finance & Wealth'}
                                </h4>
                            </div>
                            <RichText text={data.predictions.finance} className="text-sm text-slate-300 leading-relaxed" />
                        </div>
                    )}

                    {/* Education Predictions */}
                    {data.predictions.education && (
                        <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-purple-500/20 rounded-xl p-5 hover:border-purple-500/40 transition-all">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-serif text-purple-300">
                                    {language === 'hi' ? 'शिक्षा और ज्ञान' : 'Education & Knowledge'}
                                </h4>
                            </div>
                            <RichText text={data.predictions.education} className="text-sm text-slate-300 leading-relaxed" />
                        </div>
                    )}

                    {/* Family Predictions */}
                    {data.predictions.family && (
                        <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-cyan-500/20 rounded-xl p-5 hover:border-cyan-500/40 transition-all">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-serif text-cyan-300">
                                    {language === 'hi' ? 'परिवार और रिश्ते' : 'Family & Relationships'}
                                </h4>
                            </div>
                            <RichText text={data.predictions.family} className="text-sm text-slate-300 leading-relaxed" />
                        </div>
                    )}

                    {/* Spirituality Predictions */}
                    {data.predictions.spirituality && (
                        <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-indigo-500/20 rounded-xl p-5 hover:border-indigo-500/40 transition-all">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-serif text-indigo-300">
                                    {language === 'hi' ? 'आध्यात्मिकता और धर्म' : 'Spirituality & Dharma'}
                                </h4>
                            </div>
                            <RichText text={data.predictions.spirituality} className="text-sm text-slate-300 leading-relaxed" />
                        </div>
                    )}
                </div>
            </div>
        )}

        <AdBanner variant="in-article" />

        {/* Ask AI about your Kundali - Paid: one question = one ad */}
        <KundaliAskAI data={data} name={name} language={language} />

        {data.planetAnalysis && data.planetAnalysis.length > 0 && (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-amber-400 font-serif mb-6 text-xl">Planetary Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(data.planetAnalysis || []).map((item, idx) => (
                        <div key={idx} className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-4">
                            <h4 className="font-serif text-lg text-amber-100">{item.planet}</h4>
                            <RichText text={item.analysis} className="text-sm text-slate-300" />
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default KundaliResult;
