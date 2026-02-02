
import React from 'react';

export type Language = 'en' | 'hi';

export type ViewMode = 'daily' | 'kundali' | 'panchang' | 'numerology' | 'learning' | 'transits' | 'tarot' | 'compatibility' | 'games' | 'palm-reading' | 'muhurat' | 'mantra' | 'rudraksh' | 'planets-houses' | 'zodiac-signs' | 'nakshatra-library' | 'kundali-basics' | 'palmistry-guide' | 'numerology-guide' | 'astro-lab' | 'star-legends';

export type AppViewMode = ViewMode | 'hub' | 'vastu' | 'gemstones' | 'dreams' | 'cosmic-health' | 'yantra' | 'appointment' | 'ai-blog';

export type SubscriptionPlan = 'free' | 'premium' | 'annual';

export interface User {
  id: string;
  name: string;
  email: string;
  isGuest?: boolean;
  subscriptionPlan?: SubscriptionPlan;
  subscriptionEndDate?: string;
  isPremium?: boolean;
  photoUrl?: string;
  idToken?: string;
}

export interface ZodiacSignData {
  id: string;
  name: string;
  hindiName: string; 
  dateRange: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  symbol: React.ReactNode;
  description: string;
}

export interface HoroscopeResponse {
  horoscope: string;
  luckyNumber: number;
  luckyColor: string;
  mood: string;
  compatibility: string;
}

export interface KundaliFormData {
  id?: string;
  name: string;
  date: string;
  time: string;
  location: string;
  gender?: 'male' | 'female' | 'other';
  lat?: number;
  lon?: number;
  tzone?: string;
  seconds?: number;
  observationPoint?: string;
  ayanamsha?: string;
  language?: string;
}

/** Global profile for auto-filling forms across all modules */
export interface GlobalProfile {
  self: KundaliFormData;
  partner?: KundaliFormData;
  updatedAt?: string;
}

export interface PlanetaryPosition {
  planet: string;
  sign: string;
  signId: number; 
  house: number;
  isRetrograde?: boolean;
  nakshatra?: string;
  degree?: string;
}

export interface ImportantPoint {
  name: string;
  nameHi: string;
  sign: string;
  signId: number;
  house: number;
  degree?: string;
  description: string;
}

export interface DailyPanchangResponse {
  date: string;
  location: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  tithi: { name: string; endTime: string };
  nakshatra: { name: string; endTime: string };
  yoga: { name: string; endTime: string };
  karana: { name: string; endTime: string };
  rahuKalam: string;
  yamaganda: string;
  abhijitMuhurat: string;
}

export interface KundaliResponse {
  basicDetails: {
    ascendant: string;
    ascendantSignId: number;
    moonSign: string;
    sunSign: string;
    nakshatra: string;
    name?: string;
  };
  panchang: any;
  charts: {
    planetaryPositions: PlanetaryPosition[];
    navamshaPositions: PlanetaryPosition[];
    navamshaAscendantSignId: number;
    d1ChartSvg?: string;
    d9ChartSvg?: string;
    importantPoints?: ImportantPoint[];
  };
  planetAnalysis?: any[];
  dasha: {
    currentMahadasha: string;
    mahadashaStartDate?: string;
    mahadashaEndDate?: string;
    mahadashaDuration?: string;
    mahadashaElapsed?: string;
    mahadashaRemaining?: string;
    antardasha: string;
    antardashaStartDate?: string;
    antardashaEndDate?: string;
    antardashaDuration?: string;
    antardashaElapsed?: string;
    antardashaRemaining?: string;
    sookshmDasha?: string;
    sookshmStartDate?: string;
    sookshmEndDate?: string;
    sookshmDuration?: string;
    sookshmElapsed?: string;
    sookshmRemaining?: string;
    endsAt: string;
    analysis?: string;
  };
  predictions: {
    general: string;
    career: string;
    love: string;
    health: string;
    finance?: string;
    education?: string;
    family?: string;
    spirituality?: string;
  };
}

export interface MatchMakingInput {
    name: string;
    date: string;
    time: string;
    location: string;
}

export interface MatchMakingResponse {
    ashtakoot_score: any;
    conclusion: {
        status: boolean;
        report: string;
    };
}

export interface NumerologyResponse {
  lifePath: { number: number; description: string };
  destiny: { number: number; description: string };
  soulUrge: { number: number; description: string };
  personality: { number: number; description: string };
  birthday: { number: number; description: string };
  dailyForecast: string;
}

export interface NumerologyInput {
  name: string;
  dob: string;
}

export interface MuhuratItem {
    activity: string;
    status: 'Excellent' | 'Good' | 'Average' | 'Avoid';
    timeRange: string;
    reason: string;
}

export interface TransitResponse {
    currentPositions: PlanetaryPosition[];
    personalImpact: {
        planet: string;
        house: number;
        sign: string;
        meaning: string;
    }[];
}

export interface PalmPrediction {
  line: string;
  meaning: string;
}
