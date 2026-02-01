
import React, { useState, useRef } from 'react';
import { useTranslation } from '../utils/translations';
import { Language } from '../types';
import { generateMysticReading } from '../services/geminiService';
import AdBanner from './AdBanner';
import RichText from './RichText';

interface MysticLensProps {
  language: Language;
}

const MysticLens: React.FC<MysticLensProps> = ({ language }) => {
  const t = useTranslation(language);
  const [mode, setMode] = useState<'face' | 'object'>('face');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [reading, setReading] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreviewUrl(URL.createObjectURL(file));
      setReading(null);
      setError(null);
      
      setLoading(true);
      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          const base64 = (reader.result as string).split(',')[1];
          const result = await generateMysticReading(base64, ["Facial Features", "Gaze", "Archetype"], mode, language);
          setReading(result);
          setLoading(false);
        };
      } catch (err) {
        setError("Optical deciphering failed.");
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-20 animate-fade-in-up">
      <div className="bg-slate-800/80 border border-purple-500/30 rounded-2xl p-8 shadow-2xl relative">
        <h2 className="text-3xl font-serif text-purple-200 text-center mb-2">{t.mysticTitle}</h2>
        <p className="text-slate-400 text-center text-sm mb-10">Reveal the hidden vibration in faces and matter</p>

        <div className="flex justify-center gap-4 mb-8">
            <button onClick={() => setMode('face')} className={`px-6 py-2 rounded-full text-xs font-bold transition-all border ${mode === 'face' ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>Face Reading</button>
            <button onClick={() => setMode('object')} className={`px-6 py-2 rounded-full text-xs font-bold transition-all border ${mode === 'object' ? 'bg-amber-600 border-amber-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>Object Reading</button>
        </div>

        <div className="flex flex-col items-center gap-8">
          {!previewUrl ? (
            <label className="w-full h-64 border-2 border-slate-700 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-slate-900/50 group">
              <span className="text-4xl mb-2">👁️</span>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest group-hover:text-purple-400 transition-colors">Capture or Upload Image</p>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          ) : (
            <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-slate-700 shadow-2xl relative">
                <img src={previewUrl} alt="Lens" className="w-full h-auto" />
                {loading && <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center"><div className="w-10 h-10 border-2 border-purple-500 border-t-transparent animate-spin rounded-full"></div></div>}
                <button onClick={() => setPreviewUrl(null)} className="absolute top-2 right-2 bg-slate-900/80 p-2 rounded-full text-white">×</button>
            </div>
          )}
        </div>

        {reading && (
          <div className="mt-12 animate-fade-in space-y-6">
             <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-purple-500/30 p-8 rounded-2xl shadow-inner">
                <h3 className="text-xl font-serif text-purple-200 mb-4">Esoteric Synthesis</h3>
                <RichText text={reading} />
             </div>
             <AdBanner variant="leaderboard" />
          </div>
        )}
      </div>
    </div>
  );
};

export default MysticLens;
