import React, { useState, useEffect } from 'react';
import { useTranslation } from '../utils/translations';
import { getGlobalProfile } from '../utils/profileStorageService';
import { listReports, getReport } from '../utils/reportStorageService';
import { getExternalLinkProps } from '../utils/linkHandler';
import { Language, KundaliFormData, KundaliResponse } from '../types';
import { calculateLifePath } from '../utils/numerologyUtils';
import { generateKundali } from '../services/geminiService';
import { generateAshtakootaFromBackend } from '../services/backendService';
import AdBanner from './AdBanner';
import RichText from './RichText';
import CompatibilityAskAI from './CompatibilityAskAI';
import { setErrorSafely } from '../utils/errorHandler';
import { getCachedAI, setCachedAI } from '../utils/aiCacheService';

interface CompatibilityTabProps {
  language: Language;
}

// Sign compatibility matrix (based on elements and friendly signs)
const SIGN_COMPATIBILITY: { [key: string]: { compatible: string[], neutral: string[], incompatible: string[] } } = {
  'Aries': { compatible: ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'], neutral: ['Libra', 'Cancer'], incompatible: ['Taurus', 'Virgo', 'Capricorn', 'Scorpio', 'Pisces'] },
  'Taurus': { compatible: ['Virgo', 'Capricorn', 'Cancer', 'Pisces'], neutral: ['Scorpio', 'Leo'], incompatible: ['Aries', 'Gemini', 'Libra', 'Sagittarius', 'Aquarius'] },
  'Gemini': { compatible: ['Libra', 'Aquarius', 'Aries', 'Leo'], neutral: ['Sagittarius', 'Virgo'], incompatible: ['Taurus', 'Cancer', 'Scorpio', 'Capricorn', 'Pisces'] },
  'Cancer': { compatible: ['Scorpio', 'Pisces', 'Taurus', 'Virgo'], neutral: ['Capricorn', 'Aries'], incompatible: ['Gemini', 'Leo', 'Libra', 'Sagittarius', 'Aquarius'] },
  'Leo': { compatible: ['Sagittarius', 'Aries', 'Gemini', 'Libra'], neutral: ['Aquarius', 'Taurus'], incompatible: ['Virgo', 'Cancer', 'Scorpio', 'Capricorn', 'Pisces'] },
  'Virgo': { compatible: ['Capricorn', 'Taurus', 'Cancer', 'Scorpio'], neutral: ['Pisces', 'Gemini'], incompatible: ['Leo', 'Libra', 'Sagittarius', 'Aquarius', 'Aries'] },
  'Libra': { compatible: ['Aquarius', 'Gemini', 'Leo', 'Sagittarius'], neutral: ['Aries', 'Cancer'], incompatible: ['Virgo', 'Scorpio', 'Capricorn', 'Pisces', 'Taurus'] },
  'Scorpio': { compatible: ['Pisces', 'Cancer', 'Virgo', 'Capricorn'], neutral: ['Taurus', 'Libra'], incompatible: ['Sagittarius', 'Aquarius', 'Aries', 'Gemini', 'Leo'] },
  'Sagittarius': { compatible: ['Aries', 'Leo', 'Libra', 'Aquarius'], neutral: ['Gemini', 'Scorpio'], incompatible: ['Capricorn', 'Pisces', 'Taurus', 'Cancer', 'Virgo'] },
  'Capricorn': { compatible: ['Taurus', 'Virgo', 'Scorpio', 'Pisces'], neutral: ['Cancer', 'Sagittarius'], incompatible: ['Aquarius', 'Aries', 'Gemini', 'Leo', 'Libra'] },
  'Aquarius': { compatible: ['Gemini', 'Libra', 'Sagittarius', 'Aries'], neutral: ['Leo', 'Capricorn'], incompatible: ['Pisces', 'Taurus', 'Cancer', 'Virgo', 'Scorpio'] },
  'Pisces': { compatible: ['Cancer', 'Scorpio', 'Capricorn', 'Taurus'], neutral: ['Virgo', 'Aquarius'], incompatible: ['Aries', 'Gemini', 'Leo', 'Libra', 'Sagittarius'] }
};

// Nakshatra compatibility (same nakshatra = 100%, same pada = 90%, same group = 70%, different = 50%)
const calculateNakshatraScore = (nakshatra1: string, nakshatra2: string): number => {
  if (!nakshatra1 || !nakshatra2) return 50;
  
  const n1 = nakshatra1.toLowerCase().trim();
  const n2 = nakshatra2.toLowerCase().trim();
  
  // Same nakshatra
  if (n1 === n2) return 100;
  
  // Same pada (first 3 characters match)
  if (n1.substring(0, 3) === n2.substring(0, 3)) return 90;
  
  // Same group (Deva, Manushya, Rakshasa)
  const deva = ['ashwini', 'mrigashira', 'punarvasu', 'pushya', 'hasta', 'swati', 'anuradha', 'shravana', 'revati'];
  const manushya = ['bharani', 'rohini', 'ardra', 'purva phalguni', 'uttara phalguni', 'purva ashadha', 'uttara ashadha', 'purva bhadrapada', 'uttara bhadrapada'];
  const rakshasa = ['krittika', 'ashlesha', 'magha', 'chitra', 'vishakha', 'jyeshtha', 'mula', 'dhanishta', 'shatabhisha'];
  
  const getGroup = (n: string) => {
    if (deva.some(d => n.includes(d))) return 'deva';
    if (manushya.some(m => n.includes(m))) return 'manushya';
    if (rakshasa.some(r => n.includes(r))) return 'rakshasa';
    return 'unknown';
  };
  
  const group1 = getGroup(n1);
  const group2 = getGroup(n2);
  
  if (group1 === group2 && group1 !== 'unknown') return 70;
  
  // Different groups
  return 50;
};

// Sign compatibility score
const calculateSignScore = (sign1: string, sign2: string): number => {
  if (!sign1 || !sign2) return 50;
  
  const s1 = sign1.trim();
  const s2 = sign2.trim();
  
  // Same sign
  if (s1 === s2) return 100;
  
  const compat = SIGN_COMPATIBILITY[s1];
  if (!compat) return 50;
  
  // Compatible signs
  if (compat.compatible.includes(s2)) return 85;
  
  // Neutral signs
  if (compat.neutral.includes(s2)) return 65;
  
  // Incompatible signs
  if (compat.incompatible.includes(s2)) return 40;
  
  return 50;
};

// Numerology compatibility (life path numbers)
const calculateNumerologyScore = (lp1: number, lp2: number): number => {
  if (!lp1 || !lp2) return 50;
  
  // Same life path
  if (lp1 === lp2) return 100;
  
  // Compatible numbers (same family: 1-4-7, 2-8, 3-6-9, 5 stands alone)
  const families = [
    [1, 4, 7],
    [2, 8],
    [3, 6, 9],
    [5]
  ];
  
  const family1 = families.find(f => f.includes(lp1));
  const family2 = families.find(f => f.includes(lp2));
  
  if (family1 && family2 && family1 === family2) return 85;
  
  // Master numbers compatibility
  if ((lp1 === 11 || lp1 === 22 || lp1 === 33) && (lp2 === 11 || lp2 === 22 || lp2 === 33)) return 90;
  
  // Neutral compatibility
  return 60;
};

const CompatibilityTab: React.FC<CompatibilityTabProps> = ({ language }) => {
  const t = useTranslation(language);
  const [personA, setPersonA] = useState<KundaliFormData>({ 
    name: '', 
    date: '', 
    time: '12:00', 
    location: 'New Delhi, India',
    gender: undefined,
    observationPoint: 'topocentric',
    ayanamsha: 'lahiri',
    language: language
  });
  const [personB, setPersonB] = useState<KundaliFormData>({ 
    name: '', 
    date: '', 
    time: '12:00', 
    location: 'New Delhi, India',
    gender: undefined,
    observationPoint: 'topocentric',
    ayanamsha: 'lahiri',
    language: language
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedKundalis, setSavedKundalis] = useState<{ id: string; title: string; formInput: KundaliFormData }[]>([]);

  // Load saved Kundali charts for "Compare with friend" (Co-Star style)
  useEffect(() => {
    const reports = listReports('kundali');
    const items = reports
      .map((m) => {
        const r = getReport<KundaliResponse>(m.id);
        if (!r?.meta?.formInput) return null;
        const fi = r.meta.formInput as Record<string, unknown>;
        const formInput: KundaliFormData = {
          name: String(fi.name || ''),
          date: String(fi.date || ''),
          time: String(fi.time || '12:00'),
          location: String(fi.location || 'New Delhi, India'),
          gender: fi.gender as KundaliFormData['gender'],
        };
        return { id: m.id, title: m.title || formInput.name, formInput };
      })
      .filter(Boolean) as { id: string; title: string; formInput: KundaliFormData }[];
    setSavedKundalis(items);
  }, []);

  // Pre-fill from global profile on mount (Person A = self, Person B = partner)
  useEffect(() => {
    const profile = getGlobalProfile();
    if (profile?.self && (profile.self.name || profile.self.date || profile.self.location)) {
      setPersonA(prev => ({
        ...prev,
        name: profile.self.name || prev.name,
        date: profile.self.date || prev.date,
        time: profile.self.time || prev.time,
        location: profile.self.location || prev.location,
        gender: profile.self.gender ?? prev.gender,
      }));
    }
    if (profile?.partner && (profile.partner.name || profile.partner.date || profile.partner.location)) {
      setPersonB(prev => ({
        ...prev,
        name: profile.partner!.name || prev.name,
        date: profile.partner!.date || prev.date,
        time: profile.partner!.time || prev.time,
        location: profile.partner!.location || prev.location,
        gender: profile.partner!.gender ?? prev.gender,
      }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError(null);
    
    // Validate inputs
    if (!personA.date || !personB.date) {
      setError(language === 'hi' ? 'कृपया दोनों व्यक्तियों की जन्म तिथि दर्ज करें' : 'Please enter birth dates for both persons');
      return;
    }
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const dateA = new Date(personA.date);
    const dateB = new Date(personB.date);
    if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
      setError(language === 'hi' ? 'कृपया मान्य जन्म तिथि दर्ज करें' : 'Please enter valid birth dates');
      return;
    }
    if (dateA > today || dateB > today) {
      setError(language === 'hi' ? 'जन्म तिथि भविष्य में नहीं हो सकती' : 'Date of birth cannot be in the future');
      return;
    }
    if (!personA.name.trim() || !personB.name.trim()) {
      setError(language === 'hi' ? 'कृपया दोनों व्यक्तियों के नाम दर्ज करें' : 'Please enter names for both persons');
      return;
    }
    const cacheInput = { a: personA.name, aDate: personA.date, aTime: personA.time, aLoc: personA.location, b: personB.name, bDate: personB.date, bTime: personB.time, bLoc: personB.location };
    const cached = getCachedAI<any>('compatibility', cacheInput);
    if (cached) {
      setResult(cached);
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      // Generate kundali for both people using the main generateKundali function (handles backend/fallback internally)
      let kundaliA, kundaliB;
      
      console.log('Generating kundali for Person A:', personA.name);
      try {
        kundaliA = await generateKundali(personA, language);
        console.log('Person A kundali generated:', {
          moonSign: kundaliA.basicDetails?.moonSign,
          nakshatra: kundaliA.basicDetails?.nakshatra
        });
      } catch (errA: any) {
        console.error('Error generating kundali for Person A:', errA);
        throw new Error(language === 'hi' 
          ? `व्यक्ति A की कुंडली बनाने में त्रुटि: ${errA?.message || 'अज्ञात त्रुटि'}`
          : `Error generating kundali for Person A: ${errA?.message || 'Unknown error'}`);
      }
      
      console.log('Generating kundali for Person B:', personB.name);
      try {
        kundaliB = await generateKundali(personB, language);
        console.log('Person B kundali generated:', {
          moonSign: kundaliB.basicDetails?.moonSign,
          nakshatra: kundaliB.basicDetails?.nakshatra
        });
      } catch (errB: any) {
        console.error('Error generating kundali for Person B:', errB);
        throw new Error(language === 'hi' 
          ? `व्यक्ति B की कुंडली बनाने में त्रुटि: ${errB?.message || 'अज्ञात त्रुटि'}`
          : `Error generating kundali for Person B: ${errB?.message || 'Unknown error'}`);
      }

      // Extract astrological data
      const signA = kundaliA.basicDetails?.moonSign || kundaliA.basicDetails?.sunSign || 'Unknown';
      const signB = kundaliB.basicDetails?.moonSign || kundaliB.basicDetails?.sunSign || 'Unknown';
      const nakshatraA = kundaliA.basicDetails?.nakshatra || 'Unknown';
      const nakshatraB = kundaliB.basicDetails?.nakshatra || 'Unknown';
      
      console.log('Extracted data:', { signA, signB, nakshatraA, nakshatraB });
      
      // Calculate numerology
      const lpA = calculateLifePath(personA.date);
      const lpB = calculateLifePath(personB.date);
      
      // Calculate compatibility scores
      const signScore = Math.round(calculateSignScore(signA, signB));
      const nakshatraScore = Math.round(calculateNakshatraScore(nakshatraA, nakshatraB));
      const numerologyScore = Math.round(calculateNumerologyScore(lpA, lpB));
      
      console.log('✅ Compatibility scores calculated:', {
        signScore,
        nakshatraScore,
        numerologyScore,
        signA,
        signB,
        nakshatraA,
        nakshatraB,
        lpA,
        lpB
      });
      
      // Calculate Ashtakoota (8 Gunas) - optional but preferred
      let ashtakootaData = null;
      try {
        console.log('🔄 Calculating Ashtakoota...');
        const ashtakootaResult = await generateAshtakootaFromBackend(personA, personB, language);
        ashtakootaData = ashtakootaResult?.ashtakoot_score || ashtakootaResult;
        console.log('✅ Ashtakoota calculated successfully:', {
          points: ashtakootaData?.total?.obtained_points,
          max: ashtakootaData?.total?.maximum_points,
          rating: ashtakootaData?.total?.rating
        });
      } catch (ashtakootaErr: any) {
        console.warn('⚠️ Ashtakoota calculation failed (continuing without it):', ashtakootaErr?.message || ashtakootaErr);
        // Continue without Ashtakoota - it's optional, we have other scores
        // This is fine - we'll show Sign, Nakshatra, and Numerology scores
      }
      
      // Overall score (weighted average: Sign 40%, Nakshatra 40%, Numerology 20%)
      // If Ashtakoota is available, use it for overall score instead
      let overallScore: number;
      if (ashtakootaData?.total?.obtained_points) {
        const ashtakootaPoints = ashtakootaData.total.obtained_points;
        const ashtakootaMax = ashtakootaData.total.maximum_points || 36;
        const ashtakootaPercentage = Math.round((ashtakootaPoints / ashtakootaMax) * 100);
        // Combine Ashtakoota (60%) with other scores (40%)
        const otherScoresAvg = (signScore * 0.4) + (nakshatraScore * 0.4) + (numerologyScore * 0.2);
        overallScore = Math.round((ashtakootaPercentage * 0.6) + (otherScoresAvg * 0.4));
      } else {
        overallScore = Math.round((signScore * 0.4) + (nakshatraScore * 0.4) + (numerologyScore * 0.2));
      }
      
      // Generate compatibility report
      const report = generateCompatibilityReport(
        personA.name, personB.name,
        signA, signB,
        nakshatraA, nakshatraB,
        lpA, lpB,
        signScore, nakshatraScore, numerologyScore, overallScore,
        ashtakootaData,
        language
      );
      
      const finalResult = {
        personA: {
          name: personA.name,
          sign: signA,
          nakshatra: nakshatraA,
          lifePath: lpA,
          gender: personA.gender
        },
        personB: {
          name: personB.name,
          sign: signB,
          nakshatra: nakshatraB,
          lifePath: lpB,
          gender: personB.gender
        },
        scores: {
          sign: signScore,
          nakshatra: nakshatraScore,
          numerology: numerologyScore,
          overall: overallScore
        },
        ashtakoota: ashtakootaData,
        report: report
      };
      
      console.log('✅ Final compatibility result ready:', {
        overallScore: finalResult.scores.overall,
        hasAshtakoota: !!finalResult.ashtakoota,
        ashtakootaPoints: finalResult.ashtakoota?.total?.obtained_points
      });
      
      setCachedAI('compatibility', cacheInput, finalResult);
      setResult(finalResult);
    } catch (err: any) {
      setErrorSafely(setError, err, language, 'CompatibilityTab');
    } finally {
      setLoading(false);
    }
  };

  const ScoreBar = ({ label, score, color }: { label: string, score: number, color: string }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        <span className={`text-xl font-serif font-bold ${color}`}>{score}%</span>
      </div>
      <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color.replace('text-', 'bg-')} transition-all duration-1000`} 
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pb-12 animate-fade-in-up">
      {!result ? (
        <div className="bg-slate-800/80 backdrop-blur-md border border-pink-500/30 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-white to-pink-200 mb-2">
              {t.compTitle || (language === 'hi' ? 'प्रेम सामंजस्य' : 'Love Harmony')}
            </h2>
            <p className="text-slate-400 text-sm">
              {t.compSubtitle || (language === 'hi' ? 'कुंडली आधारित संगतता विश्लेषण' : 'Kundali-based compatibility analysis')}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-300 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <div>
                  <strong className="block mb-1">{language === 'hi' ? 'त्रुटि' : 'Error'}</strong>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative">
               <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px bg-slate-700"></div>
               
               {/* Person A Details */}
               <div className="space-y-4">
                 <h3 className="text-center text-pink-300 font-serif uppercase tracking-widest">
                   {t.personA || (language === 'hi' ? 'व्यक्ति A' : 'Person A')}
                 </h3>
                 <input 
                   type="text" 
                   placeholder={t.fullName || (language === 'hi' ? 'पूरा नाम' : 'Full Name')}
                   className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:border-pink-500 outline-none"
                   value={personA.name}
                   onChange={e => setPersonA({...personA, name: e.target.value})}
                   required
                 />
                 <div className="space-y-2">
                   <label className="block text-xs uppercase tracking-wider text-pink-500/80 font-bold">
                     {language === 'hi' ? 'लिंग' : 'Gender'}
                   </label>
                   <div className="flex gap-3 flex-wrap">
                     {(['male', 'female', 'other'] as const).map((g) => (
                       <label key={g} className="flex items-center gap-2 cursor-pointer group">
                         <input
                           type="radio"
                           name="genderA"
                           value={g}
                           checked={personA.gender === g}
                           onChange={() => setPersonA(prev => ({ ...prev, gender: g }))}
                           className="w-4 h-4 rounded-full border-pink-500/50 bg-slate-800 text-pink-500 focus:ring-pink-500/50"
                         />
                         <span className="text-slate-300 text-sm group-hover:text-pink-200 transition-colors">
                           {language === 'hi'
                             ? g === 'male' ? 'पुरुष' : g === 'female' ? 'महिला' : 'अन्य'
                             : g === 'male' ? 'Male' : g === 'female' ? 'Female' : 'Other'}
                         </span>
                       </label>
                     ))}
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                     <input 
                       type="date" 
                       placeholder={t.dobPlaceholder || (language === 'hi' ? 'जन्म तिथि (वर्ष-महीना-दिन)' : 'Date of birth (YYYY-MM-DD)')}
                       className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white [color-scheme:dark]"
                       value={personA.date}
                       onChange={e => setPersonA({...personA, date: e.target.value})}
                       required
                     />
                     <input 
                       type="time" 
                       className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white [color-scheme:dark]"
                       value={personA.time}
                       onChange={e => setPersonA({...personA, time: e.target.value})}
                       required
                     />
                 </div>
                 <p className="text-xs text-slate-500 -mt-2">{t.dobPlaceholder || (language === 'hi' ? 'जन्म तिथि (वर्ष-महीना-दिन)' : 'Date of birth (YYYY-MM-DD)')}</p>
                 <input 
                   type="text" 
                   placeholder={t.pobPlaceholder || (language === 'hi' ? 'जन्म स्थान' : 'Birth Place')}
                   className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:border-pink-500 outline-none"
                   value={personA.location}
                   onChange={e => setPersonA({...personA, location: e.target.value})}
                   required
                 />
                 <p className="text-xs text-slate-500 mt-1">{t.locationOrEnterHint || (language === 'hi' ? 'सूची से चुनें या कोई भी शहर, देश टाइप करें' : 'Pick from list or type any city, country')}</p>
               </div>

               {/* Person B Details */}
               <div className="space-y-4">
                 <h3 className="text-center text-indigo-300 font-serif uppercase tracking-widest">
                   {t.personB || (language === 'hi' ? 'व्यक्ति B' : 'Person B')}
                 </h3>
                 {savedKundalis.length > 0 && (
                   <div className="p-3 bg-indigo-900/20 border border-indigo-500/30 rounded-xl">
                     <label className="block text-xs uppercase tracking-wider text-indigo-400 font-bold mb-2">
                       {language === 'hi' ? 'सहेजी गई कुंडली से चुनें' : 'Compare with saved chart'}
                     </label>
                     <select
                       className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-white text-sm"
                       onChange={(e) => {
                         const id = e.target.value;
                         if (!id) return;
                         const item = savedKundalis.find((s) => s.id === id);
                         if (item) setPersonB({ ...personB, ...item.formInput });
                       }}
                     >
                       <option value="">{language === 'hi' ? '-- चुनें --' : '-- Select --'}</option>
                       {savedKundalis.map((s) => (
                         <option key={s.id} value={s.id}>{s.title}</option>
                       ))}
                     </select>
                   </div>
                 )}
                 <input 
                   type="text" 
                   placeholder={t.fullName || (language === 'hi' ? 'पूरा नाम' : 'Full Name')}
                   className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                   value={personB.name}
                   onChange={e => setPersonB({...personB, name: e.target.value})}
                   required
                 />
                 <div className="space-y-2">
                   <label className="block text-xs uppercase tracking-wider text-indigo-500/80 font-bold">
                     {language === 'hi' ? 'लिंग' : 'Gender'}
                   </label>
                   <div className="flex gap-3 flex-wrap">
                     {(['male', 'female', 'other'] as const).map((g) => (
                       <label key={g} className="flex items-center gap-2 cursor-pointer group">
                         <input
                           type="radio"
                           name="genderB"
                           value={g}
                           checked={personB.gender === g}
                           onChange={() => setPersonB(prev => ({ ...prev, gender: g }))}
                           className="w-4 h-4 rounded-full border-indigo-500/50 bg-slate-800 text-indigo-500 focus:ring-indigo-500/50"
                         />
                         <span className="text-slate-300 text-sm group-hover:text-indigo-200 transition-colors">
                           {language === 'hi'
                             ? g === 'male' ? 'पुरुष' : g === 'female' ? 'महिला' : 'अन्य'
                             : g === 'male' ? 'Male' : g === 'female' ? 'Female' : 'Other'}
                         </span>
                       </label>
                     ))}
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                     <input 
                       type="date" 
                       placeholder={t.dobPlaceholder || (language === 'hi' ? 'जन्म तिथि (वर्ष-महीना-दिन)' : 'Date of birth (YYYY-MM-DD)')}
                       className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white [color-scheme:dark]"
                       value={personB.date}
                       onChange={e => setPersonB({...personB, date: e.target.value})}
                       required
                     />
                     <input 
                       type="time" 
                       className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white [color-scheme:dark]"
                       value={personB.time}
                       onChange={e => setPersonB({...personB, time: e.target.value})}
                       required
                     />
                 </div>
                 <p className="text-xs text-slate-500 -mt-2">{t.dobPlaceholder || (language === 'hi' ? 'जन्म तिथि (वर्ष-महीना-दिन)' : 'Date of birth (YYYY-MM-DD)')}</p>
                 <input 
                   type="text" 
                   placeholder={t.pobPlaceholder || (language === 'hi' ? 'जन्म स्थान' : 'Birth Place')}
                   className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                   value={personB.location}
                   onChange={e => setPersonB({...personB, location: e.target.value})}
                   required
                 />
                 <p className="text-xs text-slate-500 mt-1">{t.locationOrEnterHint || (language === 'hi' ? 'सूची से चुनें या कोई भी शहर, देश टाइप करें' : 'Pick from list or type any city, country')}</p>
               </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full max-w-md mx-auto block bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-serif font-bold py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 disabled:opacity-50"
            >
              {loading ? (language === 'hi' ? 'जांच रहा है...' : 'Checking...') : (t.checkBond || (language === 'hi' ? 'संगतता जांचें' : 'Check Compatibility'))}
            </button>
          </form>
          <div className="mt-8">
            <AdBanner variant="box" />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
           <div className="flex justify-between items-center">
              <button onClick={() => setResult(null)} className="text-pink-400 hover:text-white transition-colors text-sm font-bold uppercase flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                {t.return || (language === 'hi' ? 'वापस' : 'Back')}
              </button>
              <h2 className="text-xl font-serif text-white">{result.personA.name} + {result.personB.name}</h2>
           </div>

           {/* Overall Score */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-slate-800/80 border border-pink-500/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5 text-9xl font-serif">❤️</div>
                 <h3 className="text-slate-400 uppercase tracking-widest text-xs mb-4">
                   {t.overallScore || (language === 'hi' ? 'कुल स्कोर' : 'Overall Score')}
                 </h3>
                 <div className="w-32 h-32 rounded-full border-4 border-pink-500 flex items-center justify-center mb-4">
                    <span className="text-5xl font-serif font-bold text-white">{result.scores.overall}%</span>
                 </div>
                 <div className="text-xs text-slate-400 mt-2">
                   {result.scores.overall >= 80 ? (language === 'hi' ? 'उत्कृष्ट' : 'Excellent') :
                    result.scores.overall >= 65 ? (language === 'hi' ? 'अच्छा' : 'Good') :
                    result.scores.overall >= 50 ? (language === 'hi' ? 'स्वीकार्य' : 'Acceptable') :
                    (language === 'hi' ? 'कम' : 'Low')}
                 </div>
                 {result.ashtakoota?.total && (
                   <div className="mt-6 pt-6 border-t border-slate-700 w-full">
                     <div className="text-xs text-slate-500 mb-2">{language === 'hi' ? 'अष्टकूट स्कोर' : 'Ashtakoota Score'}</div>
                     <div className="text-2xl font-bold text-pink-400">
                       {result.ashtakoota.total.obtained_points}/{result.ashtakoota.total.maximum_points}
                     </div>
                     <div className="text-xs text-slate-400 mt-1">
                       {language === 'hi' ? result.ashtakoota.total.ratingHi : result.ashtakoota.total.rating}
                     </div>
                   </div>
                 )}
              </div>

              <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700 p-8 rounded-2xl space-y-8">
                 <ScoreBar 
                   label={t.signMatch || (language === 'hi' ? 'राशि मिलान' : 'Sign Match')} 
                   score={result.scores.sign} 
                   color="text-indigo-400" 
                 />
                 <ScoreBar 
                   label={t.nakshatraMatch || (language === 'hi' ? 'नक्षत्र मिलान' : 'Nakshatra Match')} 
                   score={result.scores.nakshatra} 
                   color="text-teal-400" 
                 />
                 <ScoreBar 
                   label={t.numerologyMatch || (language === 'hi' ? 'अंक ज्योतिष मिलान' : 'Numerology Match')} 
                   score={result.scores.numerology} 
                   color="text-amber-400" 
                 />
              </div>
           </div>

           {/* Ashtakoota Detailed Breakdown */}
           {result.ashtakoota && (
             <div className="bg-slate-900/80 border border-purple-500/20 p-8 rounded-2xl shadow-inner">
               <h3 className="text-xl font-serif text-purple-300 mb-6 flex items-center gap-2">
                 <span>🔮</span>
                 {language === 'hi' ? 'अष्टकूट मिलान विवरण' : 'Ashtakoota Matching Details'}
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 {[
                   { key: 'varna', color: 'from-amber-500 to-amber-700' },
                   { key: 'vashya', color: 'from-blue-500 to-blue-700' },
                   { key: 'tara', color: 'from-green-500 to-green-700' },
                   { key: 'yoni', color: 'from-pink-500 to-pink-700' },
                   { key: 'graha_maitri', color: 'from-purple-500 to-purple-700' },
                   { key: 'gana', color: 'from-indigo-500 to-indigo-700' },
                   { key: 'bhakoot', color: 'from-teal-500 to-teal-700' },
                   { key: 'nadi', color: 'from-red-500 to-red-700' }
                 ].map(({ key, color }) => {
                   const koota = language === 'hi' ? result.ashtakoota[`${key}_hi`] : result.ashtakoota[key];
                   if (!koota) return null;
                   
                   return (
                     <div key={key} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 hover:border-purple-500/50 transition-all">
                       <div className="flex items-center justify-between mb-2">
                         <span className="text-sm font-bold text-slate-300">{koota.name}</span>
                         <span className={`text-xs px-2 py-1 rounded ${
                           koota.status === 'Excellent' || koota.status === 'उत्कृष्ट' 
                             ? 'bg-green-500/20 text-green-400' 
                             : koota.status === 'Good' || koota.status === 'अच्छा'
                             ? 'bg-blue-500/20 text-blue-400'
                             : 'bg-red-500/20 text-red-400'
                         }`}>
                           {koota.status}
                         </span>
                       </div>
                       <div className="text-xs text-slate-400 mb-2">{koota.description}</div>
                       <div className="flex items-center gap-2">
                         <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
                           <div 
                             className={`h-full bg-gradient-to-r ${color} transition-all`}
                             style={{ width: `${koota.percentage}%` }}
                           />
                         </div>
                         <span className="text-xs font-bold text-slate-300">
                           {koota.obtained}/{koota.maximum}
                         </span>
                       </div>
                     </div>
                   );
                 })}
               </div>
               <div className="mt-6 p-4 bg-slate-800/40 rounded-lg border border-slate-700">
                 <p className="text-sm text-slate-400">
                   {language === 'hi' 
                     ? '• 18+ अंक: स्वीकार्य | 25+ अंक: अच्छा | 33+ अंक: उत्कृष्ट'
                     : '• 18+ points: Acceptable | 25+ points: Good | 33+ points: Excellent'}
                   <br />
                   {language === 'hi'
                     ? '• नाड़ी मिलान महत्वपूर्ण है - समान नाड़ी से बचें'
                     : '• Nadi matching is critical - avoid same Nadi'}
                 </p>
               </div>
             </div>
           )}

           {/* Details Card */}
           <div className="bg-slate-900/80 border border-purple-500/20 p-8 rounded-2xl shadow-inner">
              <h3 className="text-xl font-serif text-purple-300 mb-6 flex items-center gap-2">
                <span>📊</span>
                {language === 'hi' ? 'विवरण' : 'Details'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/60 p-6 rounded-xl border border-slate-700">
                  <h4 className="text-pink-300 font-bold mb-4">{result.personA.name}</h4>
                  <div className="space-y-2 text-sm">
                    {result.personA.gender && (
                      <div><span className="text-slate-400">{language === 'hi' ? 'लिंग:' : 'Gender:'}</span> <span className="text-white">{language === 'hi' ? (result.personA.gender === 'male' ? 'पुरुष' : result.personA.gender === 'female' ? 'महिला' : 'अन्य') : result.personA.gender}</span></div>
                    )}
                    <div><span className="text-slate-400">{language === 'hi' ? 'राशि:' : 'Sign:'}</span> <span className="text-white">{result.personA.sign}</span></div>
                    <div><span className="text-slate-400">{language === 'hi' ? 'नक्षत्र:' : 'Nakshatra:'}</span> <span className="text-white">{result.personA.nakshatra}</span></div>
                    <div><span className="text-slate-400">{language === 'hi' ? 'जीवन पथ:' : 'Life Path:'}</span> <span className="text-white">{result.personA.lifePath}</span></div>
                  </div>
                </div>
                <div className="bg-slate-800/60 p-6 rounded-xl border border-slate-700">
                  <h4 className="text-indigo-300 font-bold mb-4">{result.personB.name}</h4>
                  <div className="space-y-2 text-sm">
                    {result.personB.gender && (
                      <div><span className="text-slate-400">{language === 'hi' ? 'लिंग:' : 'Gender:'}</span> <span className="text-white">{language === 'hi' ? (result.personB.gender === 'male' ? 'पुरुष' : result.personB.gender === 'female' ? 'महिला' : 'अन्य') : result.personB.gender}</span></div>
                    )}
                    <div><span className="text-slate-400">{language === 'hi' ? 'राशि:' : 'Sign:'}</span> <span className="text-white">{result.personB.sign}</span></div>
                    <div><span className="text-slate-400">{language === 'hi' ? 'नक्षत्र:' : 'Nakshatra:'}</span> <span className="text-white">{result.personB.nakshatra}</span></div>
                    <div><span className="text-slate-400">{language === 'hi' ? 'जीवन पथ:' : 'Life Path:'}</span> <span className="text-white">{result.personB.lifePath}</span></div>
                  </div>
                </div>
              </div>
           </div>

           {/* Compatibility Report */}
           <div className="bg-slate-900/80 border border-purple-500/20 p-8 rounded-2xl shadow-inner">
              <h3 className="text-xl font-serif text-pink-300 mb-4">
                {t.aiAnalysis || (language === 'hi' ? 'संगतता विश्लेषण' : 'Compatibility Analysis')}
              </h3>
              <RichText text={result.report} className="text-slate-300 leading-relaxed text-lg font-light" />
           </div>

           {/* Ask AI about your compatibility - Paid: one question = one ad */}
           <CompatibilityAskAI result={result} language={language} />

           {/* WhatsApp Contact Section */}
           <div className="mt-8 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-2xl p-6">
             <div className="flex flex-col md:flex-row items-center justify-between gap-4">
               <div className="flex-1 text-center md:text-left">
                 <h3 className="text-lg font-serif text-green-200 mb-2 flex items-center justify-center md:justify-start gap-2">
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                   </svg>
                   {language === 'hi' ? 'प्रेम और संगतता परामर्श के लिए संपर्क करें' : 'Get Expert Love & Compatibility Consultation'}
                 </h3>
                 <p className="text-slate-400 text-sm">
                   {language === 'hi' 
                     ? 'विशेषज्ञ ज्योतिषी से व्यक्तिगत संगतता विश्लेषण और रिश्ते की सलाह प्राप्त करें'
                     : 'Get personalized compatibility analysis and relationship advice from our expert astrologer'}
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
           
           <AdBanner variant="leaderboard" />
        </div>
      )}
    </div>
  );
};

// Generate compatibility report
function generateCompatibilityReport(
  nameA: string, nameB: string,
  signA: string, signB: string,
  nakshatraA: string, nakshatraB: string,
  lpA: number, lpB: number,
  signScore: number, nakshatraScore: number, numerologyScore: number, overallScore: number,
  ashtakootaData: any,
  language: Language
): string {
  const isHi = language === 'hi';
  
  let report = '';
  
  // Overall assessment
  report += isHi 
    ? `## ${nameA} और ${nameB} की संगतता\n\n`
    : `## Compatibility Analysis: ${nameA} & ${nameB}\n\n`;
  
  report += isHi
    ? `**कुल संगतता स्कोर: ${overallScore}%**\n\n`
    : `**Overall Compatibility Score: ${overallScore}%**\n\n`;
  
  if (overallScore >= 80) {
    report += isHi
      ? 'यह एक उत्कृष्ट संगतता है! आप दोनों एक-दूसरे के लिए बहुत अच्छे हैं।\n\n'
      : 'This is an excellent match! You both are very compatible with each other.\n\n';
  } else if (overallScore >= 65) {
    report += isHi
      ? 'यह एक अच्छी संगतता है। आप दोनों के बीच सामंजस्य है।\n\n'
      : 'This is a good match. There is harmony between you both.\n\n';
  } else if (overallScore >= 50) {
    report += isHi
      ? 'यह एक स्वीकार्य संगतता है। कुछ समझौते करने की आवश्यकता हो सकती है।\n\n'
      : 'This is an acceptable match. Some compromises may be needed.\n\n';
  } else {
    report += isHi
      ? 'इस संगतता में सुधार की आवश्यकता है। धैर्य और समझ की आवश्यकता होगी।\n\n'
      : 'This match needs improvement. Patience and understanding will be required.\n\n';
  }
  
  // Sign compatibility
  report += isHi ? '### राशि संगतता\n\n' : '### Sign Compatibility\n\n';
  report += isHi
    ? `**${signA} और ${signB}**: ${signScore}%\n\n`
    : `**${signA} & ${signB}**: ${signScore}%\n\n`;
  
  if (signScore >= 85) {
    report += isHi
      ? 'आपकी राशियां बहुत अच्छी तरह से मेल खाती हैं।\n\n'
      : 'Your signs match very well together.\n\n';
  } else if (signScore >= 65) {
    report += isHi
      ? 'आपकी राशियां सामान्य रूप से संगत हैं।\n\n'
      : 'Your signs are moderately compatible.\n\n';
  } else {
    report += isHi
      ? 'आपकी राशियों में अंतर है, लेकिन यह चुनौतीपूर्ण हो सकता है।\n\n'
      : 'There are differences in your signs, but this can be challenging.\n\n';
  }
  
  // Nakshatra compatibility
  report += isHi ? '### नक्षत्र संगतता\n\n' : '### Nakshatra Compatibility\n\n';
  report += isHi
    ? `**${nakshatraA} और ${nakshatraB}**: ${nakshatraScore}%\n\n`
    : `**${nakshatraA} & ${nakshatraB}**: ${nakshatraScore}%\n\n`;
  
  if (nakshatraScore >= 85) {
    report += isHi
      ? 'आपके नक्षत्र बहुत अच्छी तरह से मेल खाते हैं।\n\n'
      : 'Your nakshatras match very well together.\n\n';
  } else if (nakshatraScore >= 65) {
    report += isHi
      ? 'आपके नक्षत्र सामान्य रूप से संगत हैं।\n\n'
      : 'Your nakshatras are moderately compatible.\n\n';
  } else {
    report += isHi
      ? 'आपके नक्षत्रों में अंतर है।\n\n'
      : 'There are differences in your nakshatras.\n\n';
  }
  
  // Numerology compatibility
  report += isHi ? '### अंक ज्योतिष संगतता\n\n' : '### Numerology Compatibility\n\n';
  report += isHi
    ? `**जीवन पथ ${lpA} और ${lpB}**: ${numerologyScore}%\n\n`
    : `**Life Path ${lpA} & ${lpB}**: ${numerologyScore}%\n\n`;
  
  if (numerologyScore >= 85) {
    report += isHi
      ? 'आपके जीवन पथ संख्याएं बहुत अच्छी तरह से मेल खाती हैं।\n\n'
      : 'Your life path numbers match very well together.\n\n';
  } else if (numerologyScore >= 65) {
    report += isHi
      ? 'आपके जीवन पथ संख्याएं सामान्य रूप से संगत हैं।\n\n'
      : 'Your life path numbers are moderately compatible.\n\n';
  } else {
    report += isHi
      ? 'आपके जीवन पथ संख्याओं में अंतर है।\n\n'
      : 'There are differences in your life path numbers.\n\n';
  }
  
  // Ashtakoota section
  if (ashtakootaData?.total) {
    report += isHi ? '### अष्टकूट मिलान\n\n' : '### Ashtakoota Matching\n\n';
    const points = ashtakootaData.total.obtained_points;
    const max = ashtakootaData.total.maximum_points || 36;
    report += isHi
      ? `**अष्टकूट स्कोर: ${points}/${max}**\n\n`
      : `**Ashtakoota Score: ${points}/${max}**\n\n`;
    
    if (points >= 33) {
      report += isHi
        ? 'यह एक उत्कृष्ट अष्टकूट मिलान है।\n\n'
        : 'This is an excellent Ashtakoota match.\n\n';
    } else if (points >= 25) {
      report += isHi
        ? 'यह एक अच्छा अष्टकूट मिलान है।\n\n'
        : 'This is a good Ashtakoota match.\n\n';
    } else if (points >= 18) {
      report += isHi
        ? 'यह एक स्वीकार्य अष्टकूट मिलान है।\n\n'
        : 'This is an acceptable Ashtakoota match.\n\n';
    } else {
      report += isHi
        ? 'अष्टकूट मिलान कम है। कुछ उपाय करने की आवश्यकता हो सकती है।\n\n'
        : 'Ashtakoota match is low. Some remedies may be needed.\n\n';
    }
  }
  
  // Conclusion
  report += isHi ? '### निष्कर्ष\n\n' : '### Conclusion\n\n';
  report += isHi
    ? 'यह विश्लेषण आपकी संगतता का एक सामान्य दृष्टिकोण प्रदान करता है। अधिक विस्तृत विश्लेषण के लिए, कृपया एक अनुभवी ज्योतिषी से परामर्श करें।\n\n'
    : 'This analysis provides a general overview of your compatibility. For a more detailed analysis, please consult with an experienced astrologer.\n\n';
  
  return report;
}

export default CompatibilityTab;
