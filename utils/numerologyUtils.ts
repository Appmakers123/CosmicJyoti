
// Helper utility to calculate Numerology numbers

const LETTER_MAP: {[key: string]: number} = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8
};

const VOWELS = ['a', 'e', 'i', 'o', 'u'];

// Reduce a number to a single digit or Master Number (11, 22, 33)
const reduceNumber = (num: number): number => {
  if (num === 11 || num === 22 || num === 33) return num;
  if (num < 10) return num;
  
  const sum = num.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  return reduceNumber(sum);
};

export const calculateLifePath = (dob: string): number => {
  // DOB format: YYYY-MM-DD
  // Strategy: Reduce Year, Reduce Month, Reduce Day, then Sum and Reduce
  if (!dob) return 0;
  
  const [yearStr, monthStr, dayStr] = dob.split('-');
  
  const reducePart = (str: string) => {
    let val = parseInt(str);
    return reduceNumber(val);
  };

  const y = reducePart(yearStr);
  const m = reducePart(monthStr);
  const d = reducePart(dayStr);

  return reduceNumber(y + m + d);
};

export const calculateDestiny = (name: string): number => {
  // Destiny / Expression: Sum of all letters
  if (!name) return 0;
  
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
  let sum = 0;
  
  for (const char of cleanName) {
    sum += LETTER_MAP[char] || 0;
  }
  
  return reduceNumber(sum);
};

export const calculateSoulUrge = (name: string): number => {
  // Soul Urge / Heart's Desire: Sum of vowels
  if (!name) return 0;

  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
  let sum = 0;

  for (const char of cleanName) {
    if (VOWELS.includes(char)) {
      sum += LETTER_MAP[char] || 0;
    }
  }

  return reduceNumber(sum);
};

export const calculatePersonality = (name: string): number => {
  // Personality: Sum of consonants
  if (!name) return 0;
  
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
  let sum = 0;
  
  for (const char of cleanName) {
    if (!VOWELS.includes(char)) {
      sum += LETTER_MAP[char] || 0;
    }
  }
  
  return reduceNumber(sum);
};

export const calculateBirthday = (dob: string): number => {
    // Birthday: Day of the month reduced
    if (!dob) return 0;
    const day = parseInt(dob.split('-')[2]);
    return reduceNumber(day);
};

/** Personal Year: life path + reduced (month + day + year) for the given date. */
export const calculatePersonalYear = (dob: string, forDate: Date): number => {
  if (!dob) return 0;
  const lifePath = calculateLifePath(dob);
  const y = forDate.getFullYear();
  const m = forDate.getMonth() + 1;
  const d = forDate.getDate();
  const yearReduced = reduceNumber(y);
  const monthReduced = reduceNumber(m);
  const dayReduced = reduceNumber(d);
  return reduceNumber(lifePath + yearReduced + monthReduced + dayReduced);
};

/** Personal Month: personal year + current month (1–12) reduced. */
export const calculatePersonalMonth = (dob: string, forDate: Date): number => {
  if (!dob) return 0;
  const py = calculatePersonalYear(dob, forDate);
  const m = forDate.getMonth() + 1;
  return reduceNumber(py + reduceNumber(m));
};

/** Personal Day: personal month + current day reduced. */
export const calculatePersonalDay = (dob: string, forDate: Date): number => {
  if (!dob) return 0;
  const pm = calculatePersonalMonth(dob, forDate);
  const d = forDate.getDate();
  return reduceNumber(pm + reduceNumber(d));
};

export const getSunSign = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.getMonth() + 1; // 1-12

  if ((month == 1 && day <= 19) || (month == 12 && day >= 22)) return "Capricorn";
  if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) return "Aquarius";
  if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) return "Pisces";
  if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return "Aries";
  if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return "Taurus";
  if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return "Gemini";
  if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return "Cancer";
  if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return "Leo";
  if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return "Virgo";
  if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return "Libra";
  if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return "Scorpio";
  if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return "Sagittarius";
  
  return "Aries";
};
