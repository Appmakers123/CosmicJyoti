#!/usr/bin/env node
/**
 * Generate one short AI video per time slot using Google Veo via the Gemini API.
 * After generation, adds Hindi voiceover (TTS) and burned-in subtitles when available.
 *
 * Slots (run with slot argument; schedule via cron or GitHub Actions):
 * 2am, 7am, 11am, 2pm, 5pm, 7pm, 10pm, 12am — 8 videos per day, ~8 seconds each
 *
 * Requires: GEMINI_API_KEY (or API_KEY).
 * Optional for audio: npm optional dependency text2wav (Hindi TTS).
 * Optional for watermark/audio/subs: ffmpeg in PATH (install from ffmpeg.org or winget install ffmpeg).
 *
 * Usage:
 *   node scripts/generate-daily-video.mjs [slot]     — generate video for slot (default 2am)
 *   node scripts/generate-daily-video.mjs postprocess <date> <slot>  — add audio+subs+watermark to existing video (e.g. postprocess 2026-03-11 7am)
 *
 * Output: public/blog/videos/{date}-{slot}.mp4 and appends to public/blog/daily-videos.json
 *
 * @see https://ai.google.dev/gemini-api/docs/video (Veo video generation)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { execFile } from 'child_process';
import { promisify } from 'util';

const require = createRequire(import.meta.url);
const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function isFfmpegAvailable() {
  try {
    require('child_process').execFileSync('ffmpeg', ['-version'], { stdio: 'ignore', windowsHide: true });
    return true;
  } catch {
    return false;
  }
}
const ROOT_DIR = path.resolve(__dirname, '..');

function loadEnvFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    raw.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eq = trimmed.indexOf('=');
        if (eq > 0) {
          const key = trimmed.slice(0, eq).trim();
          let value = trimmed.slice(eq + 1).trim();
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
            value = value.slice(1, -1);
          else {
            const hashIdx = value.indexOf(' #');
            if (hashIdx !== -1) value = value.slice(0, hashIdx).trim();
          }
          if (!process.env[key]) process.env[key] = value;
        }
      }
    });
  } catch (_) {}
}

loadEnvFile(path.join(ROOT_DIR, '.env'));
loadEnvFile(path.join(ROOT_DIR, '.env.local'));

const VIDEO_SLOTS = ['2am', '7am', '11am', '2pm', '5pm', '7pm', '10pm', '12am'];
const VEO_MODEL = process.env.VEO_VIDEO_MODEL || 'veo-2.0-generate-001';

const BLOG_DIR = path.join(ROOT_DIR, 'public', 'blog');
const VIDEOS_DIR = path.join(BLOG_DIR, 'videos');
const MANIFEST_PATH = path.join(BLOG_DIR, 'daily-videos.json');
const VIDEO_DURATION_SEC = 8;
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
/** Watermark: SVG only. We convert to a temp PNG for ffmpeg (it cannot overlay SVG). */
const LOGO_SVG_CANDIDATES = [
  path.join(PUBLIC_DIR, 'cosmicjyoti-logo-rectangular.svg'),
  path.join(PUBLIC_DIR, 'cosmicjyoti-logo.svg'),
];
const WATERMARK_LOGO_PNG = path.join(VIDEOS_DIR, '_watermark-logo.png');
/** Fallback text watermark when SVG/sharp unavailable. */
const WATERMARK_TEXT_FILTER = "drawtext=text='CosmicJyoti':fontsize=22:fontcolor=white@0.7:x=w-tw-12:y=h-th-12";

/** Generate watermark PNG from SVG only (ffmpeg cannot use SVG). Returns path or null. */
async function ensureLogoPngFromSvg() {
  const svgPath = LOGO_SVG_CANDIDATES.find((p) => fs.existsSync(p));
  if (!svgPath) return null;
  try {
    const sharp = (await import('sharp')).default;
    const svg = fs.readFileSync(svgPath);
    if (!fs.existsSync(VIDEOS_DIR)) fs.mkdirSync(VIDEOS_DIR, { recursive: true });
    await sharp(svg).png().resize(120).toFile(WATERMARK_LOGO_PNG);
    return WATERMARK_LOGO_PNG;
  } catch (_) {
    return null;
  }
}

/** Narration for TTS and subtitles: title + short description. */
function getNarrationText(topic) {
  const title = (topic.titleHi || '').trim();
  const desc = (topic.descriptionHi || '').trim();
  const firstSentence = desc.split(/[।.]/)[0]?.trim() || '';
  if (firstSentence) return `${title}. ${firstSentence}.`;
  return title ? `${title}.` : 'ज्योतिष और ग्रहों की कहानी।';
}

/** Split text into roughly equal lines for subtitles (by sentence or ~40 chars). */
function splitLinesForSubtitles(text, numLines = 3) {
  const trimmed = (text || '').trim();
  if (!trimmed) return ['ज्योतिष'];
  const sentences = trimmed.split(/(?<=[।.])/).map((s) => s.trim()).filter(Boolean);
  if (sentences.length <= numLines) return sentences.length ? sentences : [trimmed];
  const lines = [];
  const chunkSize = Math.ceil(sentences.length / numLines);
  for (let i = 0; i < sentences.length; i += chunkSize) {
    lines.push(sentences.slice(i, i + chunkSize).join(' ').trim());
  }
  return lines.slice(0, numLines).filter(Boolean);
}

/** Write SRT file. Timings spread over VIDEO_DURATION_SEC. */
function writeSrt(lines, srtPath) {
  const len = Math.max(1, lines.length);
  const step = VIDEO_DURATION_SEC / len;
  const blocks = lines.map((line, i) => {
    const start = i * step;
    const end = (i + 1) * step;
    const ts = (s) => {
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},000`;
    };
    return `${i + 1}\n${ts(start)} --> ${ts(end)}\n${line}\n`;
  });
  fs.writeFileSync(srtPath, blocks.join('\n'), 'utf8');
}

/** Generate Hindi TTS to WAV using text2wav (optional dependency). Returns true if saved. Suppresses WASM "fetch failed" / "falling back to ArrayBuffer" noise from text2wav. */
async function generateAudioAsync(text, audioPath) {
  const origStderrWrite = process.stderr.write.bind(process.stderr);
  const restore = () => { process.stderr.write = origStderrWrite; };
  process.stderr.write = function (chunk, enc, cb) {
    const s = typeof chunk === 'string' ? chunk : (chunk && chunk.toString ? chunk.toString() : '');
    if (s && (s.includes('wasm streaming') || s.includes('falling back to ArrayBuffer') || s.includes('fetch failed'))) {
      if (typeof enc === 'function') enc(); else if (typeof cb === 'function') cb();
      return true;
    }
    return origStderrWrite.apply(process.stderr, arguments);
  };
  try {
    const mod = await import('text2wav');
    const text2wav = mod.default ?? mod;
    // Slower speed (140 WPM) for clearer, less harsh Hindi TTS; pitch/amplitude if supported
    const opts = { voice: 'hi', speed: 140 };
    let wav;
    try {
      wav = await text2wav(text, { ...opts, pitch: 45, amplitude: 100 });
    } catch (_) {
      wav = await text2wav(text, opts);
    }
    if (wav && (wav.buffer || wav.length)) {
      fs.writeFileSync(audioPath, Buffer.from(wav.buffer ?? wav));
      return true;
    }
    return false;
  } catch (e) {
    console.warn('TTS skipped (install optional text2wav for audio):', e.message || e);
    return false;
  } finally {
    restore();
  }
}

/** Mux audio, burn subtitles, and add logo (or text) watermark using ffmpeg. Replaces videoPath. */
async function addAudioAndSubtitlesToVideo(videoPath, audioPath, srtPath) {
  const hasAudio = audioPath && fs.existsSync(audioPath);
  const hasSrt = srtPath && fs.existsSync(srtPath);
  const dir = path.dirname(videoPath);
  const tempOut = path.join(dir, `temp-${path.basename(videoPath)}`);
  const srtNorm = srtPath && hasSrt ? path.resolve(srtPath).replace(/\\/g, '/') : '';
  const logoPath = await ensureLogoPngFromSvg();

  const buildVfText = () => {
    const parts = [];
    if (hasSrt && srtNorm) parts.push(`subtitles='${srtNorm.replace(/'/g, "'\\''")}'`);
    parts.push(WATERMARK_TEXT_FILTER);
    return parts.join(',');
  };

  const buildFilterComplexLogo = () => {
    const subEsc = srtNorm.replace(/\\/g, '/').replace(/'/g, "'\\''");
    const logoOverlay = '[1:v]scale=80:-1,format=rgba,colorchannelmixer=aa=0.75[logo];';
    if (hasSrt && srtNorm) {
      return `[0:v]subtitles='${subEsc}'[v1];${logoOverlay}[v1][logo]overlay=W-w-12:H-h-12[vout]`;
    }
    return `${logoOverlay}[0:v][logo]overlay=W-w-12:H-h-12[vout]`;
  };

  try {
    if (logoPath) {
      const args = ['-y', '-i', videoPath, '-i', logoPath];
      if (hasAudio) args.push('-i', audioPath);
      args.push('-filter_complex', buildFilterComplexLogo(), '-map', '[vout]');
      if (hasAudio) args.push('-map', '2:a', '-c:a', 'aac', '-shortest');
      else args.push('-map', '0:a?', '-c:a', 'copy');
      args.push(tempOut);
      await execFileAsync('ffmpeg', args);
    } else {
      if (!hasAudio && !hasSrt) {
        await execFileAsync('ffmpeg', ['-y', '-i', videoPath, '-vf', WATERMARK_TEXT_FILTER, '-c:a', 'copy', tempOut]);
      } else if (hasAudio && !hasSrt) {
        await execFileAsync('ffmpeg', [
          '-y', '-i', videoPath, '-i', audioPath, '-vf', WATERMARK_TEXT_FILTER, '-c:a', 'aac', '-shortest', tempOut,
        ]);
      } else if (!hasAudio && hasSrt) {
        await execFileAsync('ffmpeg', ['-y', '-i', videoPath, '-vf', buildVfText(), '-c:a', 'copy', tempOut]);
      } else {
        await execFileAsync('ffmpeg', [
          '-y', '-i', videoPath, '-i', audioPath, '-vf', buildVfText(), '-c:a', 'aac', '-shortest', tempOut,
        ]);
      }
    }
    fs.renameSync(tempOut, videoPath);
    if (hasAudio) console.log('Audio added.');
    if (hasSrt) console.log('Subtitles burned in.');
    console.log(logoPath ? 'Watermark added (logo).' : 'Watermark added (text).');
  } catch (e) {
    if (fs.existsSync(tempOut)) try { fs.unlinkSync(tempOut); } catch (_) {}
    console.warn('ffmpeg skipped (install ffmpeg for watermark/audio/subtitles):', e.message || e);
  }
}

/**
 * Dashboard-aligned topics: one topic per run, rotates daily for variety.
 * Each has: Veo prompt (engaging story visual), Hindi title and description for the app.
 */
const VIDEO_TOPICS = [
  {
    prompt: 'Cinematic short story: nine planets of Vedic astrology slowly orbiting in cosmic space, warm amber and gold light, mystical and awe-inspiring, no text on screen, 8 seconds, engaging and shareable.',
    titleHi: 'नवग्रह: ज्योतिष में नौ ग्रहों की कहानी',
    descriptionHi: 'वैदिक ज्योतिष में सूर्य, चंद्र, मंगल, बुध, गुरु, शुक्र, शनि, राहु और केतु की महत्ता। इन ग्रहों का जीवन पर प्रभाव।',
    titleHinglish: 'Navgrah: Jyotish mein nau grahon ki kahani',
    descriptionHinglish: 'Vedic jyotish mein Surya, Chandra, Mangal, Budh, Guru, Shukra, Shani, Rahu aur Ketu ki mahatta. In grahon ka jeevan par prabhav.',
    appMode: 'planets-houses',
  },
  {
    prompt: 'Engaging visual story: 27 nakshatras as soft glowing stars in a night sky, gentle movement, deep blue and silver, calming and mystical, no text, 8 seconds, likable and engaging.',
    titleHi: '27 नक्षत्र: चंद्र की राशियों की कहानी',
    descriptionHi: 'ज्योतिष में 27 नक्षत्रों का महत्व। चंद्रमा एक राशि से दूसरी में गति करता है। जन्म नक्षत्र से व्यक्तित्व और भाग्य का संबंध।',
    titleHinglish: '27 Nakshatra: Chandra ki rashiyon ki kahani',
    descriptionHinglish: 'Jyotish mein 27 nakshatron ka mahatva. Janam nakshatra se vyaktitva aur bhagya ka sambandh.',
    appMode: 'nakshatra-library',
  },
  {
    prompt: 'Warm romantic story: two silhouettes under stars, compatibility and love theme, soft pink and gold light, heartwarming and engaging, no text, 8 seconds.',
    titleHi: 'कुंडली मिलान और प्रेम संगतता',
    descriptionHi: 'गुण मिलान और अष्टकूट से वैवाहिक संगतता। कैसे कुंडली मिलान आपके रिश्ते की ताकत बताता है।',
    titleHinglish: 'Kundali milan aur prem sangatata',
    descriptionHinglish: 'Gun milan aur Ashtakoot se vaivahik sangatata. Kundali milan aapke rishte ki taakat batata hai.',
    appMode: 'matchmaking',
  },
  {
    prompt: 'Mystical story: birth chart or kundali wheel with zodiac symbols, rotating slowly, amber and saffron tones, ancient wisdom vibe, no text, 8 seconds, captivating.',
    titleHi: 'कुंडली: जन्म कुंडली का रहस्य',
    descriptionHi: 'जन्म के समय आकाश की स्थिति से बनने वाली कुंडली। 12 भाव और ग्रहों की स्थिति जीवन का नक्शा बताती है।',
    titleHinglish: 'Kundali: Janam kundali ka rahasya',
    descriptionHinglish: 'Janam ke samay aakash ki stithi se bannne wali kundali. 12 bhav aur grahon ki stithi jeevan ka naksha batati hai.',
    appMode: 'kundali',
  },
  {
    prompt: 'Auspicious moment story: golden sunrise, temple bells, traditional Indian wedding or ceremony vibe, blessed and sacred feeling, no text, 8 seconds, uplifting.',
    titleHi: 'शुभ मुहूर्त: शुभ समय का चुनाव',
    descriptionHi: 'विवाह, गृहप्रवेश, व्यापार शुरुआत जैसे कार्यों के लिए शुभ मुहूर्त। पंचांग और तिथि के अनुसार सही समय।',
    titleHinglish: 'Shubh Muhurat: Shubh samay ka chunav',
    descriptionHinglish: 'Vivah, grihapravesh, vyapar shuruat ke liye shubh muhurat. Panchang aur tithi ke anusar sahi samay.',
    appMode: 'muhurat',
  },
  {
    prompt: 'Ancient almanac story: panchang calendar pages turning, tithi and nakshatra symbols, warm parchment and gold, wisdom and tradition, no text, 8 seconds.',
    titleHi: 'पंचांग: वैदिक पंचांग की जानकारी',
    descriptionHi: 'तिथि, वार, नक्षत्र, योग और करण। रोज़ के शुभ-अशुभ समय। पंचांग से दिन की योजना कैसे बनाएं।',
    titleHinglish: 'Panchang: Vedic panchang ki jankari',
    descriptionHinglish: 'Tithi, vaar, nakshatra, yog aur karan. Roz ke shubh-ashubh samay. Panchang se din ki yojna kaise banayein.',
    appMode: 'panchang',
  },
  {
    prompt: 'Mystical tarot story: tarot cards floating in soft light, mysterious and intriguing, purple and gold, no text, 8 seconds, engaging.',
    titleHi: 'टैरो कार्ड: भविष्य की झलक',
    descriptionHi: 'टैरो पढ़ने से मार्गदर्शन। कार्ड्स के माध्यम से जीवन के प्रश्नों के उत्तर। टैरो और ज्योतिष का संगम।',
    titleHinglish: 'Tarot card: Bhavishya ki jhalak',
    descriptionHinglish: 'Tarot padhne se margdarshan. Cards ke madhyam se jeevan ke prashnon ke uttar. Tarot aur jyotish ka sangam.',
    appMode: 'tarot',
  },
  {
    prompt: 'Palm reading story: close-up of hands with soft light, life line and heart line visible, warm and personal, no text, 8 seconds, intimate and engaging.',
    titleHi: 'हस्तरेखा: हाथ की रेखाओं का विज्ञान',
    descriptionHi: 'हस्तरेखा शास्त्र से जीवन, स्वास्थ्य और भाग्य का विश्लेषण। जीवन रेखा, हृदय रेखा और भाग्य रेखा का अर्थ।',
    titleHinglish: 'Hastarekha: Haath ki rekhaon ka vigyan',
    descriptionHinglish: 'Hastarekha shastra se jeevan, swasthya aur bhagya ka vishleshan. Jeevan rekha, hriday rekha aur bhagya rekha ka arth.',
    appMode: 'palm-reading',
  },
  {
    prompt: 'Daily horoscope story: zodiac wheel with sun and moon, morning energy, hopeful and bright, no text, 8 seconds, uplifting and shareable.',
    titleHi: 'राशिफल: आज का दैनिक राशिफल',
    descriptionHi: '12 राशियों के लिए दैनिक भविष्यफल। ग्रहों की चाल और आपके दिन पर प्रभाव। सकारात्मक सुझाव।',
    titleHinglish: 'Rashifal: Aaj ka daily rashifal',
    descriptionHinglish: '12 rashiyon ke liye daily bhavishyafal. Grahon ki chaal aur aapke din par prabhav. Sakaratmak sujhav.',
    appMode: 'daily',
  },
  {
    prompt: 'Sacred mantra story: peaceful meditation scene, soft chanting vibe, saffron and white light, spiritual and calming, no text, 8 seconds.',
    titleHi: 'मंत्र: मंत्र जाप का महत्व',
    descriptionHi: 'ग्रह शांति और सकारात्मक ऊर्जा के लिए मंत्र। नवग्रह मंत्र और उनके लाभ। नियमित जाप से जीवन में सुख।',
    titleHinglish: 'Mantra: Mantra jaap ka mahatva',
    descriptionHinglish: 'Graha shanti aur sakaratmak urja ke liye mantra. Navgrah mantra aur unke labh. Niyamit jaap se jeevan mein sukh.',
    appMode: 'mantra',
  },
  {
    prompt: 'Rudraksha beads story: sacred beads in soft light, spiritual and earthy tones, meditation vibe, no text, 8 seconds, serene.',
    titleHi: 'रुद्राक्ष: रुद्राक्ष धारण के फायदे',
    descriptionHi: 'रुद्राक्ष माला और ग्रहों से रक्षा। मुखी के अनुसार अलग-अलग प्रभाव। धारण करने का सही तरीका।',
    titleHinglish: 'Rudraksh: Rudraksh dharan ke fayde',
    descriptionHinglish: 'Rudraksh mala aur grahon se raksha. Mukhi ke anusar alag-alag prabhav. Dharan karne ka sahi tarika.',
    appMode: 'rudraksh',
  },
  {
    prompt: 'Cosmic story: universe with stars and galaxies, journey through space, deep blue and violet, inspiring and vast, no text, 8 seconds.',
    titleHi: 'ज्योतिष: आकाश और जीवन का संबंध',
    descriptionHi: 'वैदिक ज्योतिष में ग्रह, राशि और भाव। कैसे तारे आपके जीवन को प्रभावित करते हैं। ज्योतिष की मूल बातें।',
    titleHinglish: 'Jyotish: Aakash aur jeevan ka sambandh',
    descriptionHinglish: 'Vedic jyotish mein grah, rashi aur bhav. Kaise taare aapke jeevan ko prabhavit karte hain. Jyotish ki mool baatein.',
    appMode: 'kundali-basics',
  },
];

/** Pick topic for this run: rotate by date + slot so every day gets different topics. */
function getTopicForRun(date, slot) {
  const slotIndex = VIDEO_SLOTS.indexOf(slot);
  const dateNum = parseInt(date.replace(/-/g, ''), 10) || 0;
  const index = (dateNum + slotIndex) % VIDEO_TOPICS.length;
  return VIDEO_TOPICS[index];
}

function getGeminiKey() {
  const raw = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  const keys = raw.split(',').map((k) => k.trim()).filter(Boolean);
  return keys[0] || '';
}

function parseSlot(slotArg) {
  const arg = (slotArg || '2am').toLowerCase().trim();
  if (VIDEO_SLOTS.includes(arg)) return arg;
  const map = { '2': '2am', '7': '7am', '11': '11am', '14': '2pm', '17': '5pm', '19': '7pm', '22': '10pm', '0': '12am' };
  return map[arg] || '2am';
}

/** Post-process an existing video: add audio (TTS), subtitles, and watermark. Usage: node script postprocess <date> <slot> e.g. postprocess 2026-03-11 7am */
async function runPostprocess(date, slot) {
  const basename = `${date}-${slot}.mp4`;
  const outPath = path.join(VIDEOS_DIR, basename);
  if (!fs.existsSync(outPath)) {
    console.error(`Video not found: ${outPath}. Run generate first or use correct date/slot.`);
    process.exit(1);
  }
  if (!isFfmpegAvailable()) {
    console.error('FFmpeg is required for post-process. Install it and add to PATH.');
    process.exit(1);
  }
  if (!fs.existsSync(VIDEOS_DIR)) fs.mkdirSync(VIDEOS_DIR, { recursive: true });
  const topic = getTopicForRun(date, slot);
  const narration = getNarrationText(topic);
  const audioPath = path.join(VIDEOS_DIR, `_temp-${date}-${slot}.wav`);
  const srtPath = path.join(VIDEOS_DIR, `_temp-${date}-${slot}.srt`);
  console.log(`Post-processing ${basename} (topic: ${topic.titleHi})...`);
  try {
    const hasAudio = await generateAudioAsync(narration, audioPath);
    if (hasAudio) console.log('TTS: audio generated.');
    const lines = splitLinesForSubtitles(narration);
    writeSrt(lines, srtPath);
    console.log('Subtitles: SRT written.');
    await addAudioAndSubtitlesToVideo(outPath, audioPath, srtPath);
    console.log('Done. Video now has audio, subtitles, and watermark.');
  } finally {
    if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    if (fs.existsSync(srtPath)) fs.unlinkSync(srtPath);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateOneVideo(slot, date, prompt) {
  const { GoogleGenAI } = await import('@google/genai');
  const apiKey = getGeminiKey();
  if (!apiKey) throw new Error('GEMINI_API_KEY or API_KEY required for video generation.');
  const ai = new GoogleGenAI({ apiKey });

  console.log(`Starting Veo generation for ${date} ${slot}...`);
  let operation = await ai.models.generateVideos({
    model: VEO_MODEL,
    source: { prompt },
    config: { numberOfVideos: 1 },
  });

  const pollIntervalMs = 15000;
  const maxWaitMs = 600000; // 10 min
  const start = Date.now();
  while (!operation.done && Date.now() - start < maxWaitMs) {
    await sleep(pollIntervalMs);
    operation = await ai.operations.getVideosOperation({ operation });
    console.log('  Polling...', operation.done ? 'done' : 'in progress');
  }

  if (!operation.done) throw new Error('Video generation timed out.');
  if (operation.error) throw new Error(JSON.stringify(operation.error));

  const video = operation.response?.generatedVideos?.[0]?.video;
  if (!video) throw new Error('No video in response.');

  return video;
}

async function saveVideoToFile(video, outPath, apiKey) {
  if (video.videoBytes) {
    const buf = Buffer.from(video.videoBytes, 'base64');
    fs.writeFileSync(outPath, buf);
    return;
  }
  if (video.uri) {
    // Video URI from Gemini/Veo requires auth; use API key as query param or header
    const url = video.uri.includes('?') ? `${video.uri}&key=${apiKey}` : `${video.uri}?key=${apiKey}`;
    const res = await fetch(url, {
      headers: apiKey ? { 'x-goog-api-key': apiKey } : undefined,
    });
    if (!res.ok) throw new Error(`Failed to download video: ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(outPath, buf);
    return;
  }
  throw new Error('Video has no videoBytes or uri.');
}

async function main() {
  const arg1 = (process.argv[2] || '').toLowerCase().trim();
  if (arg1 === 'postprocess') {
    const date = process.argv[3] || new Date().toISOString().split('T')[0];
    const slot = parseSlot(process.argv[4]);
    await runPostprocess(date, slot);
    return;
  }

  const slot = parseSlot(arg1 || '2am');
  const date = new Date().toISOString().split('T')[0];
  const topic = getTopicForRun(date, slot);
  const prompt = topic.prompt;

  if (!getGeminiKey()) {
    console.error('Set GEMINI_API_KEY or API_KEY in .env or .env.local');
    process.exit(1);
  }

  if (!fs.existsSync(VIDEOS_DIR)) fs.mkdirSync(VIDEOS_DIR, { recursive: true });

  const basename = `${date}-${slot}.mp4`;
  const outPath = path.join(VIDEOS_DIR, basename);

  console.log(`Topic: ${topic.titleHi}`);
  if (!isFfmpegAvailable()) {
    console.warn('FFmpeg not in PATH — watermark, audio mux, and subtitles will be skipped. Install from ffmpeg.org (Windows: add bin folder to PATH; Linux: apt install ffmpeg; macOS: brew install ffmpeg).');
  }

  const apiKey = getGeminiKey();
  try {
    const video = await generateOneVideo(slot, date, prompt);
    await saveVideoToFile(video, outPath, apiKey);
    console.log(`Saved: ${outPath}`);
  } catch (e) {
    console.error('Video generation failed:', e.message || e);
    process.exit(1);
  }

  // Update manifest immediately so the video is always "added" even if post-process fails (e.g. in CI)
  const videoUrl = `/blog/videos/${basename}`;
  const entry = {
    id: `${date}-${slot}`,
    date,
    slot,
    title: topic.titleHinglish || topic.titleHi,
    titleHi: topic.titleHi,
    titleHinglish: topic.titleHinglish,
    descriptionHi: topic.descriptionHi,
    descriptionHinglish: topic.descriptionHinglish,
    appMode: topic.appMode || null,
    videoUrl,
    generatedAt: new Date().toISOString(),
  };
  let manifest = { lastUpdated: date, videos: [] };
  try {
    const raw = fs.readFileSync(MANIFEST_PATH, 'utf8');
    manifest = JSON.parse(raw);
  } catch (_) {}
  if (!Array.isArray(manifest.videos)) manifest.videos = [];
  manifest.videos = manifest.videos.filter((v) => !(v.date === date && v.slot === slot));
  manifest.videos.unshift(entry);
  manifest.lastUpdated = date;
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`Updated ${MANIFEST_PATH}`);

  // Optional: add Hindi audio (TTS), burned-in subtitles, and logo watermark. Do not fail the run if this errors.
  const narration = getNarrationText(topic);
  const audioPath = path.join(VIDEOS_DIR, `_temp-${date}-${slot}.wav`);
  const srtPath = path.join(VIDEOS_DIR, `_temp-${date}-${slot}.srt`);
  try {
    const hasAudio = await generateAudioAsync(narration, audioPath);
    if (hasAudio) console.log('TTS: audio generated.');
    const lines = splitLinesForSubtitles(narration);
    writeSrt(lines, srtPath);
    await addAudioAndSubtitlesToVideo(outPath, audioPath, srtPath);
  } catch (e) {
    console.warn('Post-process (audio/subs/watermark) skipped:', e.message || e);
  } finally {
    if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    if (fs.existsSync(srtPath)) fs.unlinkSync(srtPath);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
