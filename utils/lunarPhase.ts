/**
 * Simple lunar phase from date (approximate).
 * New moon reference: Jan 6, 2000 18:14 UTC. Synodic month ~29.53 days.
 */

export type LunarPhaseId = 'new' | 'waxing-crescent' | 'first-quarter' | 'waxing-gibbous' | 'full' | 'waning-gibbous' | 'last-quarter' | 'waning-crescent';

export interface LunarPhaseInfo {
  id: LunarPhaseId;
  labelEn: string;
  labelHi: string;
  shortEn: string;
  shortHi: string;
  emoji: string;
  /** 0–1: 0 = new, 0.5 = full */
  cyclePosition: number;
}

const NEW_MOON_REF = new Date('2000-01-06T18:14:00Z').getTime();
const SYNODIC_DAYS = 29.530588853;

export function getLunarPhase(date: Date = new Date()): LunarPhaseInfo {
  const dayMs = 86400000;
  const elapsed = (date.getTime() - NEW_MOON_REF) / dayMs;
  const cycle = ((elapsed % SYNODIC_DAYS) + SYNODIC_DAYS) % SYNODIC_DAYS;
  const position = cycle / SYNODIC_DAYS;

  const phases: { id: LunarPhaseId; threshold: number; labelEn: string; labelHi: string; shortEn: string; shortHi: string; emoji: string }[] = [
    { id: 'new', threshold: 0.0, labelEn: 'New Moon', labelHi: 'अमावस्या', shortEn: 'New', shortHi: 'अमावस्या', emoji: '🌑' },
    { id: 'waxing-crescent', threshold: 0.0625, labelEn: 'Waxing Crescent', labelHi: 'शुक्ल पक्ष प्रारंभ', shortEn: 'Waxing', shortHi: 'शुक्ल', emoji: '🌒' },
    { id: 'first-quarter', threshold: 0.25, labelEn: 'First Quarter', labelHi: 'प्रथम चतुर्थी', shortEn: 'First Qtr', shortHi: 'प्रथम चतुर्थी', emoji: '🌓' },
    { id: 'waxing-gibbous', threshold: 0.4375, labelEn: 'Waxing Gibbous', labelHi: 'शुक्ल पक्ष', shortEn: 'Waxing', shortHi: 'शुक्ल', emoji: '🌔' },
    { id: 'full', threshold: 0.5, labelEn: 'Full Moon', labelHi: 'पूर्णिमा', shortEn: 'Full', shortHi: 'पूर्णिमा', emoji: '🌕' },
    { id: 'waning-gibbous', threshold: 0.5625, labelEn: 'Waning Gibbous', labelHi: 'कृष्ण पक्ष', shortEn: 'Waning', shortHi: 'कृष्ण', emoji: '🌖' },
    { id: 'last-quarter', threshold: 0.75, labelEn: 'Last Quarter', labelHi: 'अंतिम चतुर्थी', shortEn: 'Last Qtr', shortHi: 'अंतिम चतुर्थी', emoji: '🌗' },
    { id: 'waning-crescent', threshold: 0.9375, labelEn: 'Waning Crescent', labelHi: 'कृष्ण पक्ष अंत', shortEn: 'Waning', shortHi: 'कृष्ण', emoji: '🌘' },
  ];

  let chosen = phases[0];
  for (const p of phases) {
    if (position >= p.threshold) chosen = p;
  }
  if (position < 0.0625) chosen = phases[0];

  return {
    id: chosen.id,
    labelEn: chosen.labelEn,
    labelHi: chosen.labelHi,
    shortEn: chosen.shortEn,
    shortHi: chosen.shortHi,
    emoji: chosen.emoji,
    cyclePosition: position,
  };
}
