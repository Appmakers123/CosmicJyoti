import React, { useState, useMemo } from 'react';
import { Language } from '../types';
import { useTranslation } from '../utils/translations';
import { calculateLifePath, calculateBirthday } from '../utils/numerologyUtils';
import { ModuleIntro } from './common';

const LOSHU_GRID = [[4, 9, 2], [3, 5, 7], [8, 1, 6]];

const NUM_KEYS = ['loshuNum1', 'loshuNum2', 'loshuNum3', 'loshuNum4', 'loshuNum5', 'loshuNum6', 'loshuNum7', 'loshuNum8', 'loshuNum9'] as const;
const MISS_KEYS = ['loshuMiss1', 'loshuMiss2', 'loshuMiss3', 'loshuMiss4', 'loshuMiss5', 'loshuMiss6', 'loshuMiss7', 'loshuMiss8', 'loshuMiss9'] as const;

/** Build interpretation using translation keys so Marathi/other locales get translated content. */
function buildInterpretation(
  present: Set<number>,
  missing: number[],
  lifePath: number,
  t: Record<string, string>
): { heading: string; paragraph: string } {
  const presentList = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => present.has(n));
  const presentCount = presentList.length;
  const numbersStr = presentList.join(', ');
  const meaningsStr = presentList.map((n) => t[NUM_KEYS[n - 1]] || '').join(', ');
  const missingStr = missing.join(', ');

  let paragraph = (t.loshuInterpretationIntro || '')
    .replace(/\{numbers\}/g, numbersStr)
    .replace(/\{meanings\}/g, meaningsStr);
  if (missing.length > 0) {
    paragraph += ' ' + (t.loshuInterpretationMissing || '').replace(/\{missing\}/g, missingStr);
  }
  if (presentCount >= 7) {
    paragraph += ' ' + (t.loshuInterpretationMost || '');
  } else if (presentCount <= 4) {
    paragraph += ' ' + (t.loshuInterpretationFew || '');
  }
  paragraph += ' ' + (t.loshuInterpretationLifePath || '').replace(/\{lifePath\}/g, String(lifePath));

  return {
    heading: t.loshuInterpretationHeading || 'What your Lo Shu grid means',
    paragraph: paragraph.trim(),
  };
}

export default function LoshuGrid({ language }: { language: Language }) {
  const t = useTranslation(language);
  const [dob, setDob] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { present, missing, lifePath, birthdayNum } = useMemo(() => {
    if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob))
      return { present: new Set<number>(), missing: [] as number[], lifePath: 0, birthdayNum: 0 };
    const lp = calculateLifePath(dob);
    const bd = calculateBirthday(dob);
    const digits = new Set<number>();
    dob.replace(/\D/g, '').split('').forEach((d) => digits.add(parseInt(d, 10)));
    [lp, bd].forEach((n) => n.toString().split('').forEach((d) => digits.add(parseInt(d, 10))));
    const miss: number[] = [];
    for (let n = 1; n <= 9; n++) if (!digits.has(n)) miss.push(n);
    return { present: digits, missing: miss, lifePath: lp, birthdayNum: bd };
  }, [dob]);

  const interpretation = submitted && dob ? buildInterpretation(present, missing, lifePath, t as Record<string, string>) : null;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 animate-fade-in-up">
      <div className="bg-slate-900/80 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6 md:p-8 shadow-2xl">
        <ModuleIntro
          language={language}
          subtitleEn="Lo Shu Grid – numerology grid from date of birth; missing numbers and life path."
          subtitleHi="लो शू ग्रिड – जन्म तारीख से अंक ज्योतिष ग्रिड; गायब अंक और लाइफ पाथ।"
          descriptionEn="Enter your date of birth to see which numbers 1–9 appear in your Lo Shu grid. Missing numbers suggest areas to develop. Used in Chinese and Vedic numerology."
          descriptionHi="जन्म तारीख डालें – 1–9 में कौन से अंक आते हैं। गायब अंक विकास के क्षेत्र बताते हैं।"
        />
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-widest text-purple-400 font-bold block mb-2">{t.loshuTitle}</span>
          <h1 className="text-3xl md:text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-br from-white via-purple-200 to-purple-400">{t.loshuTitle}</h1>
          <p className="text-slate-400 text-sm mt-2">{t.loshuSubtitle}</p>
        </div>
        <div className="mb-6">
          <label className="block text-slate-400 text-sm font-medium mb-2">{t.loshuDobLabel}</label>
          <input type="date" value={dob} onChange={(e) => { setDob(e.target.value); setSubmitted(false); }} className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 text-amber-100 focus:border-purple-500" />
          <button type="button" onClick={() => setSubmitted(true)} disabled={!dob} className="mt-3 w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold disabled:opacity-50">{t.loshuViewGrid}</button>
        </div>
        {submitted && dob && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
              {LOSHU_GRID.flat().map((num, idx) => (
                <div key={idx} className={`aspect-square flex items-center justify-center rounded-xl border-2 text-2xl font-bold ${present.has(num) ? 'bg-purple-500/30 border-purple-400 text-purple-200' : 'bg-slate-800/50 border-slate-600 text-slate-500'}`}>{num}</div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <span className="text-slate-500 text-xs uppercase block mb-1">{t.loshuLifePath}</span>
                <span className="text-2xl font-bold text-purple-300">{lifePath}</span>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <span className="text-slate-500 text-xs uppercase block mb-1">{t.loshuBirthdayNum}</span>
                <span className="text-2xl font-bold text-purple-300">{birthdayNum}</span>
              </div>
            </div>

            {interpretation && (
              <div className="border-t border-slate-700 pt-6">
                <h3 className="text-amber-200 font-serif text-lg mb-3">{interpretation.heading}</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{interpretation.paragraph}</p>
              </div>
            )}

            {missing.length > 0 && (
              <div className="border-t border-slate-700 pt-6">
                <h3 className="text-amber-200 font-serif text-lg mb-3">{t.loshuMissingNumbers}</h3>
                <ul className="space-y-2">
                  {missing.map((n) => (
                    <li key={n} className="flex gap-3 items-start bg-slate-800/40 rounded-lg p-3">
                      <span className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center font-bold text-slate-300">{n}</span>
                      <div>
                        <p className="text-slate-300 text-sm">{t[NUM_KEYS[n - 1]]}</p>
                        <p className="text-slate-500 text-xs">{t[MISS_KEYS[n - 1]]}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
