
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../utils/translations';
import { Language } from '../types';
import { generateAstroQuiz, generateAstroRiddles } from '../services/geminiService';
import { getCachedAI, setCachedAI } from '../utils/aiCacheService';
import { ZODIAC_SIGNS, PLANETS_INFO } from '../constants';

interface AstroGamesProps {
  language: Language;
}

type GameMode = 'trivia' | 'riddles' | 'harmony';

const AstroGames: React.FC<AstroGamesProps> = ({ language }) => {
  const t = useTranslation(language);
  const [activeGame, setActiveGame] = useState<GameMode | null>(null);
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'result'>('lobby');
  const [questions, setQuestions] = useState<any[]>([]);
  const [riddles, setRiddles] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [userRiddleAnswer, setUserRiddleAnswer] = useState("");
  const [showRiddleSolution, setShowRiddleSolution] = useState(false);

  // Elemental Harmony State
  const [harmonyTarget, setHarmonyTarget] = useState<any>(null);
  const [harmonyOptions, setHarmonyOptions] = useState<string[]>([]);
  const [harmonyFeedback, setHarmonyFeedback] = useState<'correct' | 'wrong' | null>(null);

  const startTrivia = async () => {
    const cacheInput = { type: 'trivia', lang: language };
    const cached = getCachedAI<any[]>('games_trivia', cacheInput);
    if (cached) {
      setQuestions(Array.isArray(cached) ? cached : []);
      setActiveGame('trivia');
      setGameState('playing');
      setCurrentIdx(0);
      setScore(0);
      setSelectedOption(null);
      setShowExplanation(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
        const q = await generateAstroQuiz(language);
        setCachedAI('games_trivia', cacheInput, Array.isArray(q) ? q : []);
        setQuestions(Array.isArray(q) ? q : []);
        setActiveGame('trivia');
        setGameState('playing');
        setCurrentIdx(0);
        setScore(0);
        setSelectedOption(null);
        setShowExplanation(false);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const startRiddles = async () => {
    const cacheInput = { type: 'riddles', lang: language };
    const cached = getCachedAI<any[]>('games_riddles', cacheInput);
    if (cached) {
      setRiddles(cached);
      setActiveGame('riddles');
      setGameState('playing');
      setCurrentIdx(0);
      setScore(0);
      setUserRiddleAnswer('');
      setShowRiddleSolution(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
        const r = await generateAstroRiddles(language);
        setCachedAI('games_riddles', cacheInput, r);
        setRiddles(r);
        setActiveGame('riddles');
        setGameState('playing');
        setCurrentIdx(0);
        setScore(0);
        setUserRiddleAnswer("");
        setShowRiddleSolution(false);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const startHarmony = () => {
    setActiveGame('harmony');
    setGameState('playing');
    setCurrentIdx(0);
    setScore(0);
    generateHarmonyRound();
  };

  const generateHarmonyRound = () => {
    const isZodiac = Math.random() > 0.5;
    if (isZodiac) {
        const randomSign = ZODIAC_SIGNS[Math.floor(Math.random() * ZODIAC_SIGNS.length)];
        setHarmonyTarget({ ...randomSign, type: 'sign' });
        setHarmonyOptions(['Fire', 'Earth', 'Air', 'Water'].sort(() => Math.random() - 0.5));
    } else {
        const randomPlanet = PLANETS_INFO[Math.floor(Math.random() * PLANETS_INFO.length)];
        setHarmonyTarget({ ...randomPlanet, type: 'planet' });
        setHarmonyOptions(PLANETS_INFO.map(p => p.name).sort(() => Math.random() - 0.5).slice(0, 4));
        // Ensure correct answer is in there
        setHarmonyOptions(prev => {
            if (prev.includes(randomPlanet.name)) return prev;
            const next = [...prev];
            next[0] = randomPlanet.name;
            return next.sort(() => Math.random() - 0.5);
        });
    }
    setHarmonyFeedback(null);
  };

  const handleHarmonyAnswer = (ans: string) => {
    if (harmonyFeedback) return;
    const isCorrect = harmonyTarget.type === 'sign' ? harmonyTarget.element === ans : harmonyTarget.name === ans;
    if (isCorrect) {
        setHarmonyFeedback('correct');
        setScore(s => s + 1);
    } else {
        setHarmonyFeedback('wrong');
    }

    setTimeout(() => {
        if (currentIdx < 9) {
            setCurrentIdx(c => c + 1);
            generateHarmonyRound();
        } else {
            setGameState('result');
        }
    }, 1500);
  };

  const handleTriviaAnswer = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    if (idx === questions[currentIdx]?.correctIndex) {
        setScore(s => s + 1);
    }
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (activeGame === 'trivia') {
        if (currentIdx < questions.length - 1) {
            setCurrentIdx(c => c + 1);
            setSelectedOption(null);
            setShowExplanation(false);
        } else {
            setGameState('result');
        }
    } else if (activeGame === 'riddles') {
        if (currentIdx < riddles.length - 1) {
            setCurrentIdx(c => c + 1);
            setUserRiddleAnswer("");
            setShowRiddleSolution(false);
        } else {
            setGameState('result');
        }
    }
  };

  const handleRiddleSolve = () => {
      setShowRiddleSolution(true);
      setScore(s => s + 1); 
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-12 animate-fade-in-up min-h-[60vh]">
      <div className="bg-slate-800/80 backdrop-blur-md border border-indigo-500/30 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 text-9xl">🎲</div>
        
        <div className="text-center mb-10 relative z-10">
          <h2 className="text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-indigo-200 mb-2">
            {t.games}
          </h2>
          <p className="text-slate-400 text-sm italic tracking-widest uppercase">Fun & Esoteric Challenges</p>
        </div>

        {gameState === 'lobby' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 animate-fade-in">
                <button 
                    onClick={startTrivia}
                    disabled={loading}
                    className="group flex flex-col items-center p-8 bg-slate-950 border border-slate-800 rounded-3xl hover:border-indigo-500/50 hover:bg-slate-900 transition-all text-center"
                >
                    <span className="text-5xl mb-6 group-hover:scale-110 transition-transform">🧠</span>
                    <h3 className="text-lg font-serif text-white mb-2">Celestial Trivia</h3>
                    <p className="text-[10px] text-slate-500 mb-6 leading-relaxed">Test your depth of Vedic knowledge.</p>
                    <div className="mt-auto px-6 py-2 bg-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-lg">Play</div>
                </button>

                <button 
                    onClick={startRiddles}
                    disabled={loading}
                    className="group flex flex-col items-center p-8 bg-slate-950 border border-slate-800 rounded-3xl hover:border-amber-500/50 hover:bg-slate-900 transition-all text-center"
                >
                    <span className="text-5xl mb-6 group-hover:scale-110 transition-transform">🗝️</span>
                    <h3 className="text-lg font-serif text-white mb-2">Mystical Riddles</h3>
                    <p className="text-[10px] text-slate-500 mb-6 leading-relaxed">Decipher cryptic whispers of Sages.</p>
                    <div className="mt-auto px-6 py-2 bg-amber-600 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-lg">Reveal</div>
                </button>

                <button 
                    onClick={startHarmony}
                    disabled={loading}
                    className="group flex flex-col items-center p-8 bg-slate-950 border border-slate-800 rounded-3xl hover:border-emerald-500/50 hover:bg-slate-900 transition-all text-center"
                >
                    <span className="text-5xl mb-6 group-hover:scale-110 transition-transform">⚖️</span>
                    <h3 className="text-lg font-serif text-white mb-2">Elemental Harmony</h3>
                    <p className="text-[10px] text-slate-500 mb-6 leading-relaxed">Match cosmic entities to their elements.</p>
                    <div className="mt-auto px-6 py-2 bg-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-lg">Sync</div>
                </button>
                
                {loading && (
                    <div className="col-span-full py-10 flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent animate-spin rounded-full mb-4"></div>
                        <p className="text-indigo-300 font-serif uppercase tracking-widest text-xs animate-pulse">Summoning the Oracle...</p>
                    </div>
                )}
            </div>
        )}

        {gameState === 'playing' && activeGame === 'trivia' && questions.length > 0 && (
            <div className="space-y-8 animate-fade-in relative z-10">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <span className="bg-slate-950 px-4 py-1.5 rounded-full border border-slate-800">Question {currentIdx + 1}/{questions.length}</span>
                    <span className="text-indigo-400">Karma: {score}</span>
                </div>
                
                <h3 className="text-2xl md:text-3xl text-white font-serif leading-tight text-center px-4">{questions[currentIdx]?.question}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(questions[currentIdx]?.options || []).map((opt: string, i: number) => {
                        let btnClass = "bg-slate-950 border-slate-800 text-slate-300 hover:border-indigo-500/50";
                        if (selectedOption !== null) {
                            if (i === questions[currentIdx].correctIndex) btnClass = "bg-green-900/30 border-green-500 text-green-300";
                            else if (i === selectedOption) btnClass = "bg-red-900/30 border-red-500 text-red-300";
                            else btnClass = "bg-slate-950 border-slate-900 text-slate-600 opacity-40";
                        }

                        return (
                            <button
                                key={i}
                                onClick={() => handleTriviaAnswer(i)}
                                disabled={selectedOption !== null}
                                className={`p-6 border rounded-2xl text-left transition-all ${btnClass} font-medium group relative overflow-hidden`}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${selectedOption === i ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}>{String.fromCharCode(65 + i)}</span>
                                    <span className="text-sm md:text-base">{opt}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {showExplanation && (
                    <div className="animate-fade-in-up bg-indigo-900/10 border border-indigo-500/20 p-8 rounded-3xl">
                        <div className="flex items-start gap-4 mb-6">
                            <span className="text-2xl">📜</span>
                            <p className="text-sm text-indigo-200 leading-relaxed italic">"{questions[currentIdx]?.explanation}"</p>
                        </div>
                        <button 
                            onClick={nextQuestion}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-xl active:scale-95"
                        >
                            {currentIdx < questions.length - 1 ? "Next Revelation" : "See Final Score"}
                        </button>
                    </div>
                )}
            </div>
        )}

        {gameState === 'playing' && activeGame === 'riddles' && riddles.length > 0 && (
            <div className="space-y-10 animate-fade-in relative z-10 text-center">
                 <div className="flex justify-center">
                    <span className="bg-amber-900/20 px-6 py-2 rounded-full border border-amber-500/30 text-[10px] font-bold uppercase tracking-widest text-amber-400">Riddle {currentIdx + 1} of {riddles.length}</span>
                 </div>
                 
                 <div className="bg-slate-950/60 p-10 rounded-[3rem] border border-amber-500/20 relative group">
                    <div className="absolute top-4 left-6 text-6xl text-amber-500/10 font-serif">"</div>
                    <p className="text-xl md:text-2xl text-amber-100 font-serif leading-relaxed italic">{riddles[currentIdx]?.riddle}</p>
                 </div>

                 {!showRiddleSolution ? (
                    <div className="max-w-md mx-auto space-y-4">
                        <input 
                            type="text" 
                            value={userRiddleAnswer}
                            onChange={(e) => setUserRiddleAnswer(e.target.value)}
                            placeholder="Type your guess..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-5 text-white outline-none focus:border-amber-500 text-center"
                        />
                        <div className="flex gap-4">
                            <button 
                                onClick={() => alert(`Clue: ${riddles[currentIdx].clue}`)}
                                className="flex-1 py-4 border border-slate-700 text-slate-500 rounded-2xl text-xs uppercase font-bold tracking-widest hover:text-amber-400 transition-colors"
                            >
                                Clue
                            </button>
                            <button 
                                onClick={handleRiddleSolve}
                                className="flex-[2] py-4 bg-amber-600 text-white rounded-2xl font-bold shadow-xl hover:bg-amber-500 active:scale-95"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                 ) : (
                    <div className="animate-fade-in-up bg-amber-900/10 border border-amber-500/20 p-8 rounded-3xl max-w-xl mx-auto">
                        <p className="text-[10px] uppercase font-bold text-amber-500 mb-2">The Oracle Answers</p>
                        <h4 className="text-3xl font-serif text-white mb-6 uppercase tracking-widest">{riddles[currentIdx]?.answer}</h4>
                        <button 
                            onClick={nextQuestion}
                            className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold"
                        >
                            {currentIdx < riddles.length - 1 ? "Next Riddle" : "Finish Portal"}
                        </button>
                    </div>
                 )}
            </div>
        )}

        {gameState === 'playing' && activeGame === 'harmony' && harmonyTarget && (
            <div className="space-y-12 animate-fade-in relative z-10 text-center">
                <div className="flex justify-between items-center px-4">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Round {currentIdx + 1}/10</span>
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Score: {score}</span>
                </div>

                <div className="flex flex-col items-center">
                    <div className={`w-32 h-32 rounded-full bg-slate-900 border-2 flex items-center justify-center text-5xl mb-6 shadow-2xl transition-all ${harmonyFeedback === 'correct' ? 'border-emerald-500 text-emerald-500 scale-110' : harmonyFeedback === 'wrong' ? 'border-red-500 text-red-500 shake' : 'border-slate-700 text-white'}`}>
                        {harmonyTarget.type === 'sign' ? harmonyTarget.symbol : '🪐'}
                    </div>
                    <h3 className="text-3xl font-serif text-white mb-2">{language === 'hi' && harmonyTarget.hindiName ? harmonyTarget.hindiName : harmonyTarget.name}</h3>
                    <p className="text-slate-500 text-sm uppercase tracking-[0.3em]">Find the matching {harmonyTarget.type === 'sign' ? 'Element' : 'Planetary Realm'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                    {harmonyOptions.map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => handleHarmonyAnswer(opt)}
                            className={`p-5 rounded-2xl border font-bold uppercase tracking-widest text-xs transition-all ${harmonyFeedback ? (
                                (harmonyTarget.type === 'sign' ? harmonyTarget.element === opt : harmonyTarget.name === opt) ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-700'
                            ) : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-emerald-500/50'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {harmonyFeedback === 'correct' && <div className="text-emerald-400 font-bold animate-bounce">✨ Celestial Harmony Achieved!</div>}
                {harmonyFeedback === 'wrong' && <div className="text-red-500 font-bold">The stars shift... incorrect.</div>}
            </div>
        )}

        {gameState === 'result' && (
            <div className="flex flex-col items-center py-10 space-y-8 animate-fade-in relative z-10">
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl animate-pulse"></div>
                    <div className="text-8xl relative z-10">🎊</div>
                </div>
                <div className="text-center">
                    <h3 className="text-3xl md:text-5xl font-serif text-white mb-2">Journey Complete</h3>
                    <p className="text-slate-500 italic">The cosmos remembers your wisdom.</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 px-12 py-8 rounded-[2.5rem] text-center shadow-inner">
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-2 font-bold">Divine Wisdom Level</p>
                    <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-amber-300">{score}</div>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setGameState('lobby')} className="px-8 py-3 border border-slate-700 text-slate-400 rounded-full text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">Return</button>
                    <button onClick={() => {
                        if (activeGame === 'trivia') startTrivia();
                        else if (activeGame === 'riddles') startRiddles();
                        else startHarmony();
                    }} className="px-10 py-3 bg-indigo-600 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-indigo-500 shadow-xl transition-all active:scale-95">Replay</button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AstroGames;
