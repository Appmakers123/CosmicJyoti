#!/usr/bin/env node
/**
 * Export English UI strings to public/locales/en.json.
 * Hindi is already in-app (translations.hi). Run: npm run export-en-locale
 * Then: npm run pre-translate to generate bn, gu, kn, mr, ta, te.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { englishTranslations } from '../utils/translationsData';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'public', 'locales');

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, 'en.json'),
  JSON.stringify(englishTranslations, null, 2),
  'utf8'
);
console.log('Wrote public/locales/en.json');
