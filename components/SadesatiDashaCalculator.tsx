import React, { useState, useEffect, useMemo } from 'react';
import { Language } from '../types';
import { getMoonSignFromBirthDetails, generateSadeSatiInterpretation } from '../services/geminiService';
import type { KundaliFormData } from '../types';
import { setErrorSafely } from '../utils/errorHandler';
import ModuleAskAI from './ModuleAskAI';
import RichText from './RichText';
import { BackButton, ModuleIntro } from './common';

/**
 * Sade Sati: Saturn in 12th, 1st, 2nd from Moon.
 *
 * PERIODIC UPDATE (manual): Saturn changes sign ~every 2.5 years (Vedic/Lahiri).
 * When to update: Before or when Saturn enters the next sign (check thevedichoroscope.com
 * or similar for "Saturn transit [sign]" / "Sade Sati [moon sign]").
 * What to change: (1) CURRENT_SATURN_SIGN_APPROX = new sign,
 *                 (2) SATURN_TRANSIT_CYCLE: adjust start/end for the sign Saturn is
 *                     entering and the one it is leaving; shift later signs if needed.
 * Next update due: ~Jun 2027 (Saturn enters Aries). Then ~Oct 2029 (Taurus), etc.
 */
const CURRENT_SATURN_SIGN_APPROX = 'Pisces';

const MOON_SIGN_ORDER = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

const MOON_SIGNS_HI: Record<string, string> = {
  Aries: 'मेष', Taurus: 'वृषभ', Gemini: 'मिथुन', Cancer: 'कर्क', Leo: 'सिंह', Virgo: 'कन्या',
  Libra: 'तुला', Scorpio: 'वृश्चिक', Sagittarius: 'धनु', Capricorn: 'मकर', Aquarius: 'कुंभ', Pisces: 'मीन',
};

/** Saturn transit dates (Vedic/Lahiri sidereal approx). Re-check source when updating. Past/future = ± ~29.5 years. */
const SATURN_CYCLE_YEARS = 29.43;
const MONTH_NAMES: Record<string, number> = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
const SATURN_TRANSIT_CYCLE: { sign: string; start: string; end: string }[] = [
  { sign: 'Capricorn', start: 'Jan 2020', end: 'Apr 2022' },
  { sign: 'Aquarius', start: 'Apr 2022', end: 'Mar 2025' },
  { sign: 'Pisces', start: 'Mar 2025', end: 'Jun 2027' },
  { sign: 'Aries', start: 'Jun 2027', end: 'Oct 2029' },
  { sign: 'Taurus', start: 'Oct 2029', end: 'Jan 2032' },
  { sign: 'Gemini', start: 'Jan 2032', end: 'Apr 2034' },
  { sign: 'Cancer', start: 'Apr 2034', end: 'Jun 2037' },
  { sign: 'Leo', start: 'Jun 2037', end: 'Sep 2039' },
  { sign: 'Virgo', start: 'Sep 2039', end: 'Nov 2042' },
  { sign: 'Libra', start: 'Nov 2042', end: 'Feb 2045' },
  { sign: 'Scorpio', start: 'Feb 2045', end: 'May 2047' },
  { sign: 'Sagittarius', start: 'May 2047', end: 'Aug 2050' },
];

/** Parse "Jan 2020" / "Mar 2025" to fractional year for comparison. */
function parseCycleDate(s: string): number {
  const [monStr, yearStr] = s.trim().split(/\s+/);
  const y = parseInt(yearStr || '0', 10);
  const m = MONTH_NAMES[monStr?.slice(0, 3) || ''] ?? 1;
  return y + (m - 1) / 12;
}

/** Derive current Saturn sign from today's date using the transit cycle (no AI). */
function getSaturnSignForDate(date: Date): string {
  const now = date.getFullYear() + date.getMonth() / 12;
  for (const entry of SATURN_TRANSIT_CYCLE) {
    const start = parseCycleDate(entry.start);
    const end = parseCycleDate(entry.end);
    if (now >= start && now < end) return entry.sign;
  }
  return CURRENT_SATURN_SIGN_APPROX;
}

function getSignAtIndex(i: number): string {
  return MOON_SIGN_ORDER[(i + 12) % 12];
}

function getTransitForSign(sign: string, cycleOffset: number): { start: string; end: string } | null {
  const base = SATURN_TRANSIT_CYCLE.find((t) => t.sign === sign);
  if (!base) return null;
  if (cycleOffset === 0) return { start: base.start, end: base.end };
  const shift = Math.round(cycleOffset * SATURN_CYCLE_YEARS);
  const startYear = parseInt(base.start.split(' ')[1], 10) + shift;
  const endYear = parseInt(base.end.split(' ')[1], 10) + shift;
  return { start: `${base.start.split(' ')[0]} ${startYear}`, end: `${base.end.split(' ')[0]} ${endYear}` };
}

function getSadeSatiStatus(moonSign: string, saturnSign: string): { inSadeSati: boolean; phase: string } {
  const idx = MOON_SIGN_ORDER.indexOf(moonSign);
  if (idx === -1) return { inSadeSati: false, phase: '' };
  const saturnIdx = MOON_SIGN_ORDER.indexOf(saturnSign);
  if (saturnIdx === -1) return { inSadeSati: false, phase: '' };
  const twelfth = (idx + 11) % 12;
  const first = idx;
  const second = (idx + 1) % 12;
  if (saturnIdx === twelfth) return { inSadeSati: true, phase: '12th' };
  if (saturnIdx === first) return { inSadeSati: true, phase: '1st' };
  if (saturnIdx === second) return { inSadeSati: true, phase: '2nd' };
  return { inSadeSati: false, phase: '' };
}

type PhaseRange = { start: string; end: string };
type SadeSatiDates = {
  current: { start: string; end: string; phaseStart?: string; phaseEnd?: string; phase12?: PhaseRange; phase1?: PhaseRange; phase2?: PhaseRange } | null;
  past: { start: string; end: string } | null;
  future: { start: string; end: string } | null;
};

function getSadeSatiDates(moonSign: string, phase: string): SadeSatiDates {
  const idx = MOON_SIGN_ORDER.indexOf(moonSign);
  if (idx === -1) return { current: null, past: null, future: null };
  const sign12 = getSignAtIndex(idx - 1);
  const sign1 = getSignAtIndex(idx);
  const sign2 = getSignAtIndex(idx + 1);
  const t12_0 = getTransitForSign(sign12, 0);
  const t1 = getTransitForSign(sign1, 0);
  const t2_0 = getTransitForSign(sign2, 0);
  const t12Past = getTransitForSign(sign12, -1);
  const t2Past = getTransitForSign(sign2, -1);
  const t12Future = getTransitForSign(sign12, 1);
  const t2Future = getTransitForSign(sign2, 1);
  if (!t12_0 || !t1 || !t2_0) return { current: null, past: null, future: null };
  const t12Start = parseCycleDate(t12_0.start);
  const t2End = parseCycleDate(t2_0.end);
  const use12FromPast = t12Start > t2End;
  const t12 = use12FromPast && t12Past ? t12Past : t12_0;
  const t2 = t2_0;
  const currentFull = { start: t12.start, end: t2.end };
  let phaseStart: string | undefined, phaseEnd: string | undefined;
  if (phase === '12th') { phaseStart = t12.start; phaseEnd = t12.end; }
  else if (phase === '1st') { phaseStart = t1.start; phaseEnd = t1.end; }
  else if (phase === '2nd') { phaseStart = t2.start; phaseEnd = t2.end; }
  const current = {
    ...currentFull,
    phaseStart,
    phaseEnd,
    phase12: t12,
    phase1: t1,
    phase2: t2,
  };
  const past = t12Past && t2Past ? { start: t12Past.start, end: t2Past.end } : null;
  const future = t12Future && t2Future ? { start: t12Future.start, end: t2Future.end } : null;
  return { current, past, future };
}

interface SadesatiDashaCalculatorProps {
  language: Language;
  onBack?: () => void;
}

export default function SadesatiDashaCalculator({ language, onBack }: SadesatiDashaCalculatorProps) {
  const [moonSign, setMoonSign] = useState('');
  const [result, setResult] = useState<{ inSadeSati: boolean; phase: string } | null>(null);
  const saturnSign = useMemo(() => getSaturnSignForDate(new Date()), []);
  const [showFindMoon, setShowFindMoon] = useState(false);
  const [dob, setDob] = useState('');
  const [tob, setTob] = useState('');
  const [pob, setPob] = useState('New Delhi, India');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [interpretationLoading, setInterpretationLoading] = useState(false);
  const isHi = language === 'hi';

  useEffect(() => {
    if (!result || !moonSign) return;
    setInterpretation(null);
    setInterpretationLoading(true);
    generateSadeSatiInterpretation(moonSign, result.inSadeSati, result.phase, language)
      .then(setInterpretation)
      .catch(() => setInterpretation(language === 'hi' ? 'व्याख्या लोड नहीं हो सकी।' : 'Interpretation could not be loaded.'))
      .finally(() => setInterpretationLoading(false));
  }, [moonSign, result, language]);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moonSign) return;
    setError(null);
    setResult(getSadeSatiStatus(moonSign, saturnSign));
    setInterpretation(null);
  };

  const handleFindMoon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const formData: KundaliFormData = {
        name: 'User',
        gender: 'other',
        date: dob.trim(),
        time: tob.trim() || '12:00',
        location: pob.trim() || 'New Delhi, India',
      };
      const basic = await getMoonSignFromBirthDetails(formData, language);
      const sign = basic?.moonSign || '';
      if (sign) {
        setMoonSign(sign);
        setResult(getSadeSatiStatus(sign, saturnSign));
      } else {
        setError(isHi ? 'चंद्र राशि प्राप्त नहीं हुई' : 'Could not get Moon sign');
      }
    } catch (err) {
      setErrorSafely(setError, err, language, 'SadesatiDasha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-fade-in-up">
      <div className="bg-slate-900/80 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 md:p-8 shadow-2xl">
        {onBack && (
          <div className="mb-6">
            <BackButton onClick={onBack} label={isHi ? 'वापस' : 'Back'} />
          </div>
        )}
        <ModuleIntro
          language={language}
          subtitleEn="Sade Sati calculator – check Sade Sati by Moon sign (Vedic Lahiri)."
          subtitleHi="साढ़े साती कैलकुलेटर – चंद्र राशि से जांचें (वैदिक लाहिरी)।"
          descriptionEn="Sade Sati is the 7.5-year period when Saturn transits the 12th, 1st and 2nd houses from your Moon sign. Enter your Moon sign to see current phase and remedies."
          descriptionHi="साढ़े साती शनि का चंद्र राशि से 12वें, 1ले और 2रे भाव में गोचर। चंद्र राशि डालें – चरण और उपाय देखें।"
        />
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold block mb-2">
            {isHi ? 'साढ़े साती' : 'Sade Sati'}
          </span>
          <h1 className="text-3xl md:text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-br from-amber-100 to-amber-400">
            {isHi ? 'साढ़े साती जाँच' : 'Sade Sati Check'}
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl mx-auto break-words">
            {isHi
              ? 'अपनी चंद्र राशि चुनें — जानें कि अभी आप साढ़े साती में हैं या नहीं। शनि चंद्र से 12वें, 1वें व 2वें भाव में होने पर साढ़े साती चलती है।'
              : 'Select your Moon sign to see if you are currently in the Sade Sati period. Sade Sati is when Saturn transits the 12th, 1st, or 2nd house from your Moon sign.'}
          </p>
        </div>

        <form onSubmit={handleCheck} className="space-y-4 mb-6">
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-1">{isHi ? 'चंद्र राशि (Moon sign)' : 'Moon sign'}</label>
            <select
              value={moonSign}
              onChange={(e) => { setMoonSign(e.target.value); setResult(null); setError(null); }}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 text-amber-100"
            >
              <option value="">{isHi ? 'चुनें' : 'Select'}</option>
              {MOON_SIGN_ORDER.map((sign) => (
                <option key={sign} value={sign}>
                  {isHi ? `${MOON_SIGNS_HI[sign] || sign} (${sign})` : sign}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold">
            {isHi ? 'साढ़े साती जाँचें' : 'Check Sade Sati'}
          </button>
        </form>

        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowFindMoon((v) => !v)}
            className="text-slate-400 hover:text-amber-400 text-sm"
          >
            {showFindMoon ? (isHi ? 'छिपाएं' : 'Hide') : (isHi ? 'चंद्र राशि नहीं पता? जन्म विवरण से ढूंढें' : "Don't know your Moon sign? Find from birth details")}
          </button>
          {showFindMoon && (
            <form onSubmit={handleFindMoon} className="mt-3 p-4 rounded-xl bg-slate-800/50 border border-slate-600 space-y-3">
              <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-amber-100 text-sm" placeholder={isHi ? 'जन्म तिथि' : 'Date of birth'} />
              <input type="time" value={tob} onChange={(e) => setTob(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-amber-100 text-sm" />
              <input type="text" value={pob} onChange={(e) => setPob(e.target.value)} placeholder={isHi ? 'जन्म स्थान' : 'Place of birth'} className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-amber-100 placeholder-slate-500 text-sm" />
              <button type="submit" disabled={loading} className="w-full py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium disabled:opacity-50">
                {loading ? (isHi ? 'ढूंढ रहे हैं...' : 'Finding...') : (isHi ? 'चंद्र राशि ढूंढें' : 'Find Moon sign')}
              </button>
            </form>
          )}
        </div>

        {result && (() => {
          const dates = getSadeSatiDates(moonSign, result.phase);
          return (
          <div className="space-y-6 animate-fade-in-up min-w-0">
            <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700">
              <h3 className="text-amber-200 font-serif text-sm mb-2">{isHi ? 'साढ़े साती' : 'Sade Sati'}</h3>
              <p className="text-2xl font-bold text-amber-300 break-words">
                {result.inSadeSati
                  ? (isHi ? `चालू — ${result.phase} भाव से` : `Active — ${result.phase} house phase`)
                  : (isHi ? 'इस समय नहीं' : 'Not active now')}
              </p>
              <p className="text-slate-400 text-xs mt-2 break-words">
                {isHi
                  ? `चंद्र राशि: ${MOON_SIGNS_HI[moonSign] || moonSign}। शनि चंद्र से 12वें, 1वें व 2वें भाव में होने पर साढ़े साती (लगभग 7.5 वर्ष) चलती है।`
                  : `Moon sign: ${moonSign}. Sade Sati runs when Saturn transits 12th, 1st, and 2nd from Moon (about 7.5 years total).`}
              </p>
            </div>

            {dates.current && (
              <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700 space-y-3">
                <h3 className="text-amber-200 font-serif text-sm">{isHi ? 'साढ़े साती — तारीखें' : 'Sade Sati — Dates'}</h3>
                <p className="text-slate-500 text-xs mb-2">{isHi ? 'तारीखें लगभग, वैदिक (लाहिरी) अनुसार।' : 'Approximate dates, Vedic (Lahiri) sidereal.'}</p>
                <div className="text-slate-300 text-sm space-y-2 break-words">
                  <p>
                    <span className="text-slate-400">
                      {result.inSadeSati
                        ? (isHi ? 'चालू साढ़े साती (कुल): ' : 'Current Sade Sati (full): ')
                        : (isHi ? 'पिछली साढ़े साती (समाप्त): ' : 'Last Sade Sati (ended): ')}
                    </span>
                    {dates.current.start} {isHi ? 'से' : 'to'} {dates.current.end}
                  </p>
                  {dates.current.phase12 && dates.current.phase1 && dates.current.phase2 && (
                    <div className="pl-2 border-l-2 border-slate-600 space-y-1 mt-2">
                      <p><span className="text-slate-400">12th {isHi ? 'भाव ' : 'house '}</span>{dates.current.phase12.start} – {dates.current.phase12.end}</p>
                      <p><span className="text-slate-400">1st {isHi ? 'भाव ' : 'house '}</span>{dates.current.phase1.start} – {dates.current.phase1.end}</p>
                      <p><span className="text-slate-400">2nd {isHi ? 'भाव ' : 'house '}</span>{dates.current.phase2.start} – {dates.current.phase2.end}</p>
                    </div>
                  )}
                  {result.inSadeSati && dates.current.phaseStart && dates.current.phaseEnd && (
                    <p className="text-amber-200/90 font-medium mt-1">
                      {isHi ? 'वर्तमान चरण: ' : 'Current phase: '}
                      {result.phase === '12th' ? (isHi ? '12वाँ भाव' : '12th house') : result.phase === '1st' ? (isHi ? '1ला भाव' : '1st house') : (isHi ? '2रा भाव' : '2nd house')}
                      {' — '}{dates.current.phaseStart} {isHi ? 'से' : 'to'} {dates.current.phaseEnd}
                    </p>
                  )}
                  {dates.past && (
                    <p className="mt-2">
                      <span className="text-slate-400">{isHi ? 'पिछली साढ़े साती: ' : 'Past Sade Sati: '}</span>
                      {dates.past.start} {isHi ? 'से' : 'to'} {dates.past.end}
                    </p>
                  )}
                  {dates.future && (
                    <p>
                      <span className="text-slate-400">{isHi ? 'आगामी साढ़े साती: ' : 'Future Sade Sati: '}</span>
                      {dates.future.start} {isHi ? 'से' : 'to'} {dates.future.end}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="p-6 rounded-xl bg-slate-800/50 border border-amber-500/20 min-w-0 overflow-visible">
              <h3 className="text-amber-200 font-serif text-sm mb-3">{isHi ? `${MOON_SIGNS_HI[moonSign] || moonSign} राशि के लिए व्याख्या` : `Interpretation for ${moonSign}`}</h3>
              {interpretationLoading ? (
                <p className="text-slate-400 text-sm">{isHi ? 'व्याख्या लोड हो रही है...' : 'Loading interpretation...'}</p>
              ) : interpretation ? (
                <div className="text-slate-300 text-sm leading-relaxed break-words">
                  <RichText text={interpretation} className="break-words" />
                </div>
              ) : null}
            </div>

            <ModuleAskAI
              language={language}
              moduleName={isHi ? 'साढ़े साती व्याख्या' : 'Sade Sati Interpretation'}
              contextStr={(() => {
                const statusLine = result.inSadeSati
                  ? `Currently in Sade Sati (${result.phase} house phase).`
                  : 'Not in Sade Sati currently.';
                const dateLines: string[] = [];
                if (dates.current) {
                  dateLines.push(`Current Sade Sati (full): ${dates.current.start} to ${dates.current.end}.`);
                  if (dates.current.phase12) dateLines.push(`12th house: ${dates.current.phase12.start} – ${dates.current.phase12.end}.`);
                  if (dates.current.phase1) dateLines.push(`1st house: ${dates.current.phase1.start} – ${dates.current.phase1.end}.`);
                  if (dates.current.phase2) dateLines.push(`2nd house: ${dates.current.phase2.start} – ${dates.current.phase2.end}.`);
                  if (result.inSadeSati && dates.current.phaseStart && dates.current.phaseEnd)
                    dateLines.push(`Current phase: ${dates.current.phaseStart} to ${dates.current.phaseEnd}.`);
                  if (dates.past) dateLines.push(`Past Sade Sati: ${dates.past.start} to ${dates.past.end}.`);
                  if (dates.future) dateLines.push(`Future Sade Sati: ${dates.future.start} to ${dates.future.end}.`);
                }
                return `User's Moon sign: ${moonSign}. Saturn's current transit sign (for reference): ${saturnSign}. Sade Sati status: ${statusLine} Saturn transits 12th, 1st, 2nd from Moon (Vedic/Lahiri). Use these exact dates when answering questions about when Sade Sati starts, ends, or phase dates: ${dateLines.join(' ')} Answer in the user's selected language. Keep answers educational and brief.`;
              })()}
            />
          </div>
          );
        })()}
      </div>
    </div>
  );
}
