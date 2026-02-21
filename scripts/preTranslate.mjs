#!/usr/bin/env node
/**
 * Pre-translate UI strings for selected languages (Sarvam → Shunya → Gemini).
 * Run after export-en-locale. Writes public/locales/{lang}.json so the app
 * can load them without calling translate APIs at runtime.
 *
 * Requires: public/locales/en.json (run: npx tsx scripts/exportEnLocale.ts)
 * Env: .env.local with VITE_SARVAM_API_KEY, VITE_SHUNYA_API_KEY, and/or
 *      GEMINI_API_KEY (or VITE_GEMINI_API_KEY) for fallback.
 *
 * Usage: node scripts/preTranslate.mjs [lang1] [lang2] ...
 *   If no args: translates bn, gu, kn, mr, ta, te (en and hi come from export-en-locale)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function loadEnv(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    raw.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
    });
  } catch (_) {}
}
loadEnv(path.join(ROOT, '.env.local'));
loadEnv(path.join(ROOT, '.env'));

const SARVAM_URL = 'https://api.sarvam.ai/translate';
const SHUNYA_URL = 'https://tb.shunyalabs.ai/v1/translate';
const GEMINI_URL = (model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const APP_LANG_TO_SARVAM = {
  en: 'en-IN', hi: 'hi-IN', bn: 'bn-IN', ta: 'ta-IN', te: 'te-IN',
  kn: 'kn-IN', ml: 'ml-IN', mr: 'mr-IN', gu: 'gu-IN', pa: 'pa-IN', od: 'od-IN',
};

const DEFAULT_LANGS = ['hi', 'bn', 'gu', 'kn', 'mr', 'ta', 'te'];
const DELAY_MS = 1200;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function getKey(name) {
  return (process.env[name] || process.env[name.replace('VITE_', '')] || '').trim();
}

async function sarvamTranslate(text, targetCode) {
  const key = getKey('VITE_SARVAM_API_KEY');
  if (!key || !APP_LANG_TO_SARVAM[targetCode]) return null;
  try {
    const res = await fetch(SARVAM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-subscription-key': key },
      body: JSON.stringify({
        input: text.trim(),
        source_language_code: 'en-IN',
        target_language_code: APP_LANG_TO_SARVAM[targetCode],
        mode: 'formal',
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.translated_text?.trim() ?? null;
  } catch (_) {
    return null;
  }
}

async function shunyaTranslate(text, targetLang) {
  const key = getKey('VITE_SHUNYA_API_KEY');
  if (!key) return null;
  try {
    const res = await fetch(SHUNYA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': key },
      body: JSON.stringify({ text: text.trim(), source_lang: 'en', target_lang: targetLang }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.translated_text?.trim() ?? null;
  } catch (_) {
    return null;
  }
}

async function geminiTranslate(text, langName) {
  const key = getKey('GEMINI_API_KEY') || getKey('VITE_GEMINI_API_KEY') || getKey('API_KEY');
  if (!key) return null;
  try {
    const res = await fetch(GEMINI_URL('gemini-2.0-flash'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `Translate the following text into ${langName}. Preserve meaning and tone. Output ONLY the translated text, no explanation, no quotes, no preamble.\n\nText:\n${text.trim()}` }] }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const out = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return out || null;
  } catch (_) {
    return null;
  }
}

const LANG_LABELS = { en: 'English', hi: 'Hindi', bn: 'Bengali', ta: 'Tamil', te: 'Telugu', kn: 'Kannada', mr: 'Marathi', gu: 'Gujarati' };
function langName(code) {
  return LANG_LABELS[code] || code;
}

async function translateOne(text, targetLang) {
  let out = await sarvamTranslate(text, targetLang);
  if (out) return out;
  out = await shunyaTranslate(text, targetLang);
  if (out) return out;
  out = await geminiTranslate(text, langName(targetLang));
  return out || text;
}

async function main() {
  const localesDir = path.join(ROOT, 'public', 'locales');
  const enPath = path.join(localesDir, 'en.json');
  if (!fs.existsSync(enPath)) {
    console.error('Run first: npx tsx scripts/exportEnLocale.ts');
    process.exit(1);
  }
  const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const keys = Object.keys(en);
  const langs = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_LANGS;

  for (const lang of langs) {
    if (lang === 'en') continue;
    const outPath = path.join(localesDir, `${lang}.json`);
    console.log(`\nPre-translating ${lang} (${keys.length} keys) -> ${outPath}`);
    const result = {};
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      result[key] = await translateOne(en[key], lang);
      if ((i + 1) % 10 === 0) console.log(`  ${i + 1}/${keys.length}`);
      await delay(DELAY_MS);
    }
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
    console.log(`  Wrote ${outPath}`);
  }
  console.log('\nDone. Commit public/locales/*.json so the app uses them at runtime.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
