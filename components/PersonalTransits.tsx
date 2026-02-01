
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { KundaliResponse, TransitResponse, Language, PlanetaryPosition } from '../types';
import { generateGenericTransits } from '../services/geminiService';
import { useTranslation } from '../utils/translations';
import { ZODIAC_SIGNS } from '../constants';
import NorthIndianChart from './NorthIndianChart';
import SouthIndianChart from './SouthIndianChart';
import RichText from './RichText';

interface Props {
  language: Language;
  kundali: KundaliResponse | null;
  onOpenKundali: () => void;
}

const PersonalTransits: React.FC<Props> = ({ language, kundali, onOpenKundali }) => {
  const t = useTranslation(language);
  const [data, setData] = useState<TransitResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [chartStyle, setChartStyle] = useState<'north' | 'south'>('north');
  
  // Generic Mode states - always use generic mode
  const [location, setLocation] = useState("New Delhi, India");
  const [rashi, setRashi] = useState("Aries");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setData(null); // Clear previous data
    try {
      console.log("Fetching transit data for:", { location, rashi, language });
      const result: TransitResponse = await generateGenericTransits(location, rashi, language);
      
      // Validate and log the result
      console.log("Transit data received:", result);
      console.log("Current positions count:", result?.currentPositions?.length || 0);
      console.log("Personal impact count:", result?.personalImpact?.length || 0);
      
      // Ensure we have valid data structure
      if (!result || !result.currentPositions || !Array.isArray(result.currentPositions) || result.currentPositions.length === 0) {
        console.warn("Invalid or empty currentPositions data:", result);
        throw new Error(language === 'hi' ? 'ग्रह स्थिति डेटा प्राप्त नहीं हुआ' : 'Failed to get planetary positions data');
      }
      
      if (!result.personalImpact || !Array.isArray(result.personalImpact)) {
        console.warn("Invalid personalImpact data, setting empty array");
        result.personalImpact = [];
      }
      
      setData(result);
    } catch (e: any) {
      console.error("Error fetching transit data:", e);
      const errorMessage = e?.message || e?.toString() || (language === 'hi' ? 'ट्रांजिट डेटा लोड करने में त्रुटि' : 'Error loading transit data');
      alert(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [location, rashi, language]);

  useEffect(() => {
    // Always fetch generic transit data
    fetchData();
  }, [fetchData]);

  // Determine the reference Sign ID for the chart layout
  const activeAscendantId = useMemo(() => {
    const found = ZODIAC_SIGNS.find(z => z.name === rashi);
    return found ? ZODIAC_SIGNS.indexOf(found) + 1 : 1;
  }, [rashi]);

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in-up pb-20 px-4">
      <div className="bg-slate-900/60 border border-blue-500/20 rounded-[3rem] p-6 md:p-12 shadow-3xl relative overflow-hidden backdrop-blur-3xl">
        {/* Background Animation */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="flex flex-col lg:flex-row justify-between items-center mb-12 gap-8 relative z-10">
            <div className="text-center lg:text-left">
                <span className="text-[10px] uppercase font-bold tracking-[1em] text-blue-500 mb-2 block">Gochara Almanac</span>
                <h2 className="text-5xl font-serif text-blue-100 mb-2">{t.personalSkyTracker}</h2>
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">Sidereal Lahiri Ayanamsha Sync</p>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                {data && (
                    <div className="flex bg-slate-950/80 rounded-xl p-1 border border-slate-800">
                        <button 
                            onClick={() => setChartStyle('north')}
                            className={`px-4 py-2 rounded-lg text-[9px] font-bold uppercase transition-all ${chartStyle === 'north' ? 'bg-slate-800 text-blue-400 border border-blue-900/50' : 'text-slate-600 hover:text-slate-400'}`}
                        >
                            {t.north}
                        </button>
                        <button 
                            onClick={() => setChartStyle('south')}
                            className={`px-4 py-2 rounded-lg text-[9px] font-bold uppercase transition-all ${chartStyle === 'south' ? 'bg-slate-800 text-blue-400 border border-blue-900/50' : 'text-slate-600 hover:text-slate-400'}`}
                        >
                            {t.south}
                        </button>
                    </div>
                )}
            </div>
        </div>

        <div className="bg-slate-950/40 p-10 rounded-[3rem] border border-slate-800/60 mb-12 space-y-8 relative z-10 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="flex flex-col space-y-4">
                        <label className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.3em] flex items-center gap-2 h-6">
                             <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                             <span>{t.observationCenter}</span>
                        </label>
                        <input 
                            type="text" 
                            value={location} 
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder={t.pobPlaceholder || "City, Country (e.g. London, Lagos, Tokyo)"}
                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 text-white text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all shadow-inner placeholder-slate-600 font-light"
                        />
                        <p className="text-xs text-blue-400/70 mt-1.5">{t.locationOrEnterHint || 'Pick from list or type any city, country'}</p>
                    </div>
                    <div className="flex flex-col space-y-4">
                        <label className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.3em] flex items-center gap-2 h-6">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                            <span>{t.referenceRashi}</span>
                        </label>
                        <select 
                            value={rashi} 
                            onChange={(e) => setRashi(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 text-white text-sm outline-none focus:border-blue-500 transition-all shadow-inner appearance-none cursor-pointer"
                        >
                            {ZODIAC_SIGNS.map(z => <option key={z.id} value={z.name}>{language === 'hi' ? z.hindiName : z.name}</option>)}
                        </select>
                    </div>
                </div>
                <button 
                    onClick={fetchData} 
                    disabled={loading}
                    className="w-full py-5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white font-serif font-bold rounded-2xl shadow-[0_20px_50px_rgba(29,78,216,0.3)] transition-all hover:from-blue-600 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 text-xl uppercase tracking-widest"
                >
                    {loading ? (
                        <div className="flex items-center justify-center gap-4">
                            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            <span>{t.aligningCoordinates}</span>
                        </div>
                    ) : t.syncTransitData}
                </button>
        </div>

        {loading ? (
          <div className="py-40 text-center relative z-10">
            <div className="relative w-24 h-24 mx-auto mb-10">
                <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full"></div>
                <div className="absolute inset-0 border-t-4 border-blue-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-blue-300 font-serif text-xl uppercase tracking-[0.5em] animate-pulse">{t.trackerSubtitle}</p>
          </div>
        ) : data && (
          <div className="space-y-24 animate-fade-in relative z-10">
            
            {/* Visual Sky Map Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                
                {/* Left: Interactive Chart */}
                <div className="lg:col-span-6 flex flex-col items-center">
                    <h3 className="text-sm font-serif text-blue-400 mb-8 text-center uppercase tracking-[0.4em] font-bold">
                        {`${rashi} ${t.referenceSkyMap}`}
                    </h3>
                    <div className="w-full max-w-[500px] shadow-[0_30px_100px_rgba(0,0,0,0.5),0_0_50px_rgba(37,99,235,0.1)] rounded-[3rem] overflow-hidden border-[10px] border-slate-950 relative group">
                        <div className="absolute inset-0 bg-blue-500/5 animate-pulse pointer-events-none"></div>
                        {chartStyle === 'north' ? (
                            <NorthIndianChart 
                                planets={data.currentPositions || []} 
                                ascendantSignId={activeAscendantId} 
                                language={language} 
                            />
                        ) : (
                            <SouthIndianChart 
                                planets={data.currentPositions || []} 
                                ascendantSignId={activeAscendantId} 
                                language={language} 
                            />
                        )}
                    </div>
                    <div className="mt-10 flex items-center gap-3 px-6 py-3 bg-blue-900/10 border border-blue-500/20 rounded-full text-[10px] text-blue-300 uppercase tracking-widest font-bold">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                        {t.lastComputed}: {new Date().toLocaleTimeString()}
                    </div>
                </div>

                {/* Right: Detailed Position Table (Drik Style) */}
                <div className="lg:col-span-6 space-y-8">
                    <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                        <h3 className="text-xl font-serif text-blue-200 uppercase tracking-widest">{t.planetaryState}</h3>
                        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Lahiri Sidereal</span>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[10px] text-blue-500/70 uppercase tracking-widest font-bold border-b border-slate-800">
                                    <th className="pb-4 pl-2 text-left align-bottom">{t.planet}</th>
                                    <th className="pb-4 text-left align-bottom">{t.signRashi}</th>
                                    <th className="pb-4 text-left align-bottom">{t.degree}</th>
                                    <th className="pb-4 text-left align-bottom">{t.nakshatra}</th>
                                    <th className="pb-4 text-right pr-2 align-bottom">{t.status}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {(data.currentPositions || []).length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-slate-500 text-sm">
                                            {language === 'hi' ? 'ग्रह स्थिति डेटा लोड हो रहा है...' : 'Loading planetary positions...'}
                                        </td>
                                    </tr>
                                ) : (
                                    (data.currentPositions || []).map((p: any, i) => {
                                        // Ensure planet name is properly formatted
                                        const planetName = p.planet || 'Unknown';
                                        const signName = p.sign || 'Unknown';
                                        const degree = p.degree || p.degrees || '---';
                                        const nakshatra = p.nakshatra || '---';
                                        const isRetro = p.isRetrograde === true || p.isRetrograde === 'true' || p.retrograde === true;
                                        
                                        return (
                                            <tr key={i} className="group hover:bg-blue-500/5 transition-colors">
                                                <td className="py-4 pl-2 align-middle">
                                                    <span className="text-blue-100 font-serif font-bold text-base block">{planetName}</span>
                                                </td>
                                                <td className="py-4 align-middle">
                                                    <span className="text-slate-400 text-xs font-medium bg-slate-950 px-2 py-1 rounded border border-slate-800 inline-block">{signName}</span>
                                                </td>
                                                <td className="py-4 align-middle">
                                                    <span className="text-amber-200/80 text-xs font-mono">{degree}</span>
                                                </td>
                                                <td className="py-4 align-middle">
                                                    <span className="text-slate-500 text-xs italic">{nakshatra}</span>
                                                </td>
                                                <td className="py-4 text-right pr-2 align-middle">
                                                    {isRetro ? (
                                                        <span className="text-[9px] bg-red-900/30 text-red-400 px-2 py-1 rounded-full border border-red-500/20 font-bold uppercase tracking-tighter inline-block">{t.retrograde}</span>
                                                    ) : (
                                                        <span className="text-[9px] bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/20 font-bold uppercase tracking-tighter inline-block">{t.direct}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* AI Synthesized Impact Interpretations - Only show if data is available */}
            {(data.personalImpact && data.personalImpact.length > 0) && (
                <div className="space-y-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                        <h4 className="text-2xl font-serif text-blue-300 uppercase tracking-widest flex items-center gap-4">
                            <span className="text-3xl">✨</span> {t.transmutationOracle}
                        </h4>
                        <p className="text-slate-500 text-xs italic max-w-sm">Synthesized insights based on current planetary intersections with your reference houses.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {(data.personalImpact || []).map((item: any, i) => {
                            const planetName = item.planet || 'Unknown';
                            const signName = item.sign || 'Unknown';
                            const houseNum = item.house || item.houseNumber || '?';
                            const meaning = item.meaning || item.interpretation || item.description || (language === 'hi' ? 'विश्लेषण उपलब्ध नहीं' : 'Analysis not available');
                            
                            return (
                                <div key={i} className="bg-slate-950/60 p-10 rounded-[2.5rem] border border-slate-800/80 hover:border-blue-500/40 transition-all group relative overflow-hidden flex flex-col shadow-2xl">
                                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all"></div>
                                    <div className="flex justify-between items-center mb-8">
                                        <span className="text-blue-200 font-serif text-xl group-hover:text-white transition-colors">{planetName}</span>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] text-blue-500 uppercase font-bold tracking-widest mb-1">{language === 'hi' ? 'स्थिति' : 'Position'}</span>
                                            <span className="text-xs bg-slate-900 px-3 py-1 rounded-full text-slate-400 border border-slate-800 uppercase font-bold tracking-tighter">
                                                {t.house} {houseNum}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <strong className="text-blue-300 block text-sm font-bold uppercase tracking-wide border-l-2 border-blue-500 pl-3">
                                            {t.traversing} {signName}
                                        </strong>
                                        <RichText text={meaning} className="text-slate-400 leading-relaxed text-sm font-light" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="text-center pt-10">
                 <p className="text-[9px] text-slate-700 uppercase tracking-[1.5em]">Cosmic Geometric Alignment • Vedic Realtime Engine</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PersonalTransits;
