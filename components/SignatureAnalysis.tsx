import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { generateSignatureAnalysis } from '../services/geminiService';
import { setErrorSafely } from '../utils/errorHandler';
import { getCachedAI, setCachedAI } from '../utils/aiCacheService';
import { requestScrollToMain } from '../utils/scrollToMain';
import RichText from './RichText';
import AdBanner from './AdBanner';
import { ModuleIntro } from './common';

type InputMode = 'draw' | 'upload';

interface SignatureAnalysisProps {
  language: Language;
}

const SignatureAnalysis: React.FC<SignatureAnalysisProps> = ({ language }) => {
  const [inputMode, setInputMode] = useState<InputMode>('draw');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [reading, setReading] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drewSomething, setDrewSomething] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  const isHi = language === 'hi';

  // Canvas drawing
  const getCanvas = () => canvasRef.current;
  const getCtx = () => getCanvas()?.getContext('2d');

  useEffect(() => {
    const canvas = getCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [inputMode]);

  useEffect(() => {
    if (reading) requestScrollToMain();
  }, [reading]);

  const toCanvasCoords = (clientX: number, clientY: number): [number, number] => {
    const canvas = getCanvas();
    if (!canvas) return [0, 0];
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    return [x, y];
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = getCanvas();
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    isDrawing.current = true;
    const [x, y] = toCanvasCoords(e.clientX, e.clientY);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = getCanvas();
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    const [x, y] = toCanvasCoords(e.clientX, e.clientY);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleCanvasMouseUp = () => { if (isDrawing.current) setDrewSomething(true); isDrawing.current = false; };
  const handleCanvasMouseLeave = () => { isDrawing.current = false; };

  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = getCanvas();
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    isDrawing.current = true;
    const t = e.touches[0];
    const [x, y] = toCanvasCoords(t.clientX, t.clientY);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = getCanvas();
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    const t = e.touches[0];
    const [x, y] = toCanvasCoords(t.clientX, t.clientY);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleCanvasTouchEnd = () => { if (isDrawing.current) setDrewSomething(true); isDrawing.current = false; };

  const clearCanvas = () => {
    const canvas = getCanvas();
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setDrewSomething(false);
    setReading(null);
    setError(null);
  };

  const getCanvasBase64 = (): string | null => {
    const canvas = getCanvas();
    if (!canvas) return null;
    const dataUrl = canvas.toDataURL('image/png');
    const base64 = dataUrl.split(',')[1];
    return base64 || null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setError(isHi ? 'कृपया एक छवि चुनें।' : 'Please choose an image file.');
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setReading(null);
      setError(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve((dataUrl.split(',')[1]) || '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const getMimeType = (file: File): 'image/jpeg' | 'image/png' | 'image/webp' => {
    const t = file.type.toLowerCase();
    if (t === 'image/png') return 'image/png';
    if (t === 'image/webp') return 'image/webp';
    return 'image/jpeg';
  };

  const hasDrawContent = () => {
    const canvas = getCanvas();
    if (!canvas) return false;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (r !== 30 || g !== 41 || b !== 59) return true; // not just background
    }
    return false;
  };

  const canAnalyze = inputMode === 'draw' ? drewSomething : !!imageFile;

  const handleAnalyze = async () => {
    setError(null);
    let base64: string;
    let mime: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/png';

    if (inputMode === 'draw') {
      if (!drewSomething || !hasDrawContent()) {
        setError(isHi ? 'पहले हस्ताक्षर बनाएं या छवि अपलोड करें।' : 'Please draw a signature or upload an image first.');
        return;
      }
      const b = getCanvasBase64();
      if (!b) {
        setError(isHi ? 'छवि तैयार नहीं हो पाई।' : 'Could not get image.');
        return;
      }
      base64 = b;
    } else {
      if (!imageFile) {
        setError(isHi ? 'पहले हस्ताक्षर की छवि अपलोड करें।' : 'Please upload a signature image first.');
        return;
      }
      base64 = await fileToBase64(imageFile);
      mime = getMimeType(imageFile);
    }

    const cacheKey = inputMode === 'draw' ? `sig-draw-${base64.slice(0, 50)}-${language}` : `sig-upload-${imageFile!.name}-${imageFile!.size}-${language}`;
    const cached = getCachedAI<string>('signature', { key: cacheKey });
    if (cached) {
      setReading(cached);
      return;
    }

    setLoading(true);
    try {
      const interpretation = await generateSignatureAnalysis(base64, mime, language);
      setCachedAI('signature', { key: cacheKey }, interpretation);
      setReading(interpretation);
    } catch (err) {
      setErrorSafely(setError, err, language, 'SignatureAnalysis');
    } finally {
      setLoading(false);
    }
  };

  const resetForMode = () => {
    setReading(null);
    setError(null);
    setDrewSomething(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setImageFile(null);
    if (inputMode === 'draw') clearCanvas();
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 animate-fade-in-up pb-12">
      <div className="bg-slate-900/80 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 md:p-8 shadow-2xl">
        <ModuleIntro
          language={language}
          subtitleEn="Signature analysis – graphology; what your signature may say about personality and confidence."
          subtitleHi="हस्ताक्षर विश्लेषण – ग्राफोलॉजी; हस्ताक्षर से व्यक्तित्व और आत्मविश्वास के बारे में।"
          descriptionEn="Draw or upload your signature for an AI-based graphology-style reading. For entertainment and self-reflection only."
          descriptionHi="हस्ताक्षर बनाएं या अपलोड करें – AI आधारित ग्राफोलॉजी रीडिंग। मनोरंजन और आत्म-चिंतन।"
        />
        <div className="text-center mb-6">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold block mb-2">
            {isHi ? 'हस्ताक्षर विश्लेषण' : 'Signature Analysis'}
          </span>
          <h1 className="text-3xl md:text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-br from-amber-100 via-amber-200 to-orange-300">
            {isHi ? 'आपके हस्ताक्षर का अर्थ' : 'Meaning of Your Signature'}
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-lg mx-auto">
            {isHi
              ? 'ग्राफोलॉजी के अनुसार हस्ताक्षर व्यक्तित्व, आत्मविश्वास और स्वभाव को दर्शाता है। नीचे हस्ताक्षर बनाएं या अपलोड करें और AI विश्लेषण पाएं।'
              : 'In graphology, your signature reflects personality, confidence, and temperament. Draw or upload your signature below and get an AI analysis.'}
          </p>
        </div>

        {/* What signature analysis means - short intro */}
        <div className="mb-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
          <h3 className="text-amber-200 font-serif text-sm mb-2">{isHi ? 'हस्ताक्षर अध्ययन क्या है?' : 'What is signature analysis?'}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            {isHi
              ? 'ग्राफोलॉजी (हस्तलेखन विज्ञान) में हस्ताक्षर के आकार, झुकाव, दबाव और प्रवाह से व्यक्तित्व के बारे में जाना जाता है। यह केवल मनोरंजन और आत्म-जागरूकता के लिए है।'
              : 'Graphology (handwriting analysis) uses the size, slant, pressure, and flow of a signature to infer personality traits. This is for entertainment and self-reflection only.'}
          </p>
        </div>

        {/* Draw | Upload tabs */}
        <div className="flex rounded-lg bg-slate-800/60 border border-slate-700 p-1 mb-6">
          <button
            type="button"
            onClick={() => { setInputMode('draw'); resetForMode(); }}
            className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${inputMode === 'draw' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {isHi ? '✏️ हस्ताक्षर बनाएं' : '✏️ Draw'}
          </button>
          <button
            type="button"
            onClick={() => { setInputMode('upload'); resetForMode(); }}
            className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${inputMode === 'upload' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {isHi ? '📤 छवि अपलोड' : '📤 Upload'}
          </button>
        </div>

        {inputMode === 'draw' && (
          <div className="space-y-3 mb-6">
            <p className="text-slate-500 text-xs">{isHi ? 'नीचे बॉक्स में अपना हस्ताक्षर बनाएं' : 'Draw your signature in the box below'}</p>
            <div className="relative rounded-xl overflow-hidden border-2 border-slate-600 bg-slate-800 touch-none">
              <canvas
                ref={canvasRef}
                width={400}
                height={180}
                className="w-full max-w-full h-auto block"
                style={{ touchAction: 'none' }}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseLeave}
                onTouchStart={handleCanvasTouchStart}
                onTouchMove={handleCanvasTouchMove}
                onTouchEnd={handleCanvasTouchEnd}
                onTouchCancel={handleCanvasTouchEnd}
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={clearCanvas} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium">
                {isHi ? 'साफ करें' : 'Clear'}
              </button>
            </div>
          </div>
        )}

        {inputMode === 'upload' && (
          <div className="space-y-3 mb-6">
            <label className="block">
              <span className="text-slate-500 text-xs block mb-2">{isHi ? 'हस्ताक्षर की तस्वीर चुनें' : 'Choose a photo of your signature'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-amber-600 file:text-white file:font-medium file:cursor-pointer hover:file:bg-amber-500"
              />
            </label>
            {previewUrl && (
              <div className="rounded-xl overflow-hidden border border-slate-600 max-h-48">
                <img src={previewUrl} alt="User signature for graphology and handwriting analysis" className="w-full h-auto object-contain max-h-48 bg-slate-800" />
              </div>
            )}
          </div>
        )}

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={loading || !canAnalyze}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-all"
        >
          {loading ? (isHi ? 'विश्लेषण हो रहा है...' : 'Analyzing...') : (isHi ? 'AI विश्लेषण पाएं' : 'Get AI analysis')}
        </button>

        {reading && (
          <div className="mt-6 p-5 rounded-xl bg-slate-800/50 border border-slate-700">
            <h3 className="text-amber-200 font-serif text-lg mb-3">{isHi ? 'आपके हस्ताक्षर का विश्लेषण' : 'Your signature analysis'}</h3>
            <RichText text={reading} className="text-slate-300 text-sm leading-relaxed" />
          </div>
        )}

        <AdBanner variant="box" />
      </div>
    </div>
  );
};

export default SignatureAnalysis;
