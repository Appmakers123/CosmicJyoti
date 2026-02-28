#!/usr/bin/env node
/**
 * Exports public/cosmicjyoti-logo-rectangular.svg to PNG (400px wide)
 * for Google Publisher Center rectangular logo.
 * Run: node scripts/export-rectangular-logo.mjs
 */

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const svgPath = join(root, 'public', 'cosmicjyoti-logo-rectangular.svg');
const pngPath = join(root, 'public', 'cosmicjyoti-logo-rectangular.png');

const svg = readFileSync(svgPath);

try {
  const info = await sharp(svg).png().toFile(pngPath);
  console.log('Created:', pngPath);
  console.log('Dimensions:', info.width, 'x', info.height);
} catch (err) {
  console.error('Export failed:', err.message);
  process.exit(1);
}
