import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { useTranslation } from '../utils/translations';

interface Yantra {
  id: string;
  name: string;
  nameHi: string;
  purpose: string;
  purposeHi: string;
  deity: string;
  deityHi: string;
  benefits: string;
  benefitsHi: string;
  icon: string;
  color: string;
}

const YANTRA_LIBRARY: Yantra[] = [
  {
    id: 'sri-yantra',
    name: 'Sri Yantra',
    nameHi: 'श्री यंत्र',
    purpose: 'Supreme manifestation of cosmic energy',
    purposeHi: 'ब्रह्मांडीय ऊर्जा की सर्वोच्च अभिव्यक्ति',
    deity: 'Goddess Lakshmi',
    deityHi: 'देवी लक्ष्मी',
    benefits: 'Wealth, prosperity, abundance, and spiritual growth',
    benefitsHi: 'धन, समृद्धि, प्रचुरता और आध्यात्मिक विकास',
    icon: '🕉️',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'ganesh-yantra',
    name: 'Ganesh Yantra',
    nameHi: 'गणेश यंत्र',
    purpose: 'Removal of obstacles and new beginnings',
    purposeHi: 'बाधाओं को दूर करना और नई शुरुआत',
    deity: 'Lord Ganesha',
    deityHi: 'भगवान गणेश',
    benefits: 'Success, wisdom, and protection from obstacles',
    benefitsHi: 'सफलता, ज्ञान और बाधाओं से सुरक्षा',
    icon: '🐘',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'shiva-yantra',
    name: 'Shiva Yantra',
    nameHi: 'शिव यंत्र',
    purpose: 'Transformation and spiritual liberation',
    purposeHi: 'परिवर्तन और आध्यात्मिक मुक्ति',
    deity: 'Lord Shiva',
    deityHi: 'भगवान शिव',
    benefits: 'Inner peace, meditation, and spiritual awakening',
    benefitsHi: 'आंतरिक शांति, ध्यान और आध्यात्मिक जागृति',
    icon: '🔱',
    color: 'from-blue-500 to-indigo-500'
  },
  {
    id: 'durga-yantra',
    name: 'Durga Yantra',
    nameHi: 'दुर्गा यंत्र',
    purpose: 'Protection and strength',
    purposeHi: 'सुरक्षा और शक्ति',
    deity: 'Goddess Durga',
    deityHi: 'देवी दुर्गा',
    benefits: 'Courage, protection from negative energies, and victory',
    benefitsHi: 'साहस, नकारात्मक ऊर्जा से सुरक्षा और विजय',
    icon: '⚔️',
    color: 'from-red-500 to-pink-500'
  },
  {
    id: 'saraswati-yantra',
    name: 'Saraswati Yantra',
    nameHi: 'सरस्वती यंत्र',
    purpose: 'Knowledge and wisdom',
    purposeHi: 'ज्ञान और बुद्धि',
    deity: 'Goddess Saraswati',
    deityHi: 'देवी सरस्वती',
    benefits: 'Education, creativity, and intellectual growth',
    benefitsHi: 'शिक्षा, रचनात्मकता और बौद्धिक विकास',
    icon: '📚',
    color: 'from-white to-slate-300'
  },
  {
    id: 'vishnu-yantra',
    name: 'Vishnu Yantra',
    nameHi: 'विष्णु यंत्र',
    purpose: 'Preservation and protection',
    purposeHi: 'संरक्षण और सुरक्षा',
    deity: 'Lord Vishnu',
    deityHi: 'भगवान विष्णु',
    benefits: 'Stability, protection, and divine grace',
    benefitsHi: 'स्थिरता, सुरक्षा और दिव्य कृपा',
    icon: '🪐',
    color: 'from-blue-400 to-cyan-500'
  },
  {
    id: 'hanuman-yantra',
    name: 'Hanuman Yantra',
    nameHi: 'हनुमान यंत्र',
    purpose: 'Strength and devotion',
    purposeHi: 'शक्ति और भक्ति',
    deity: 'Lord Hanuman',
    deityHi: 'भगवान हनुमान',
    benefits: 'Physical strength, courage, and removal of fear',
    benefitsHi: 'शारीरिक शक्ति, साहस और भय को दूर करना',
    icon: '💪',
    color: 'from-orange-600 to-red-600'
  },
  {
    id: 'kali-yantra',
    name: 'Kali Yantra',
    nameHi: 'काली यंत्र',
    purpose: 'Destruction of negativity',
    purposeHi: 'नकारात्मकता का विनाश',
    deity: 'Goddess Kali',
    deityHi: 'देवी काली',
    benefits: 'Removal of obstacles, protection, and transformation',
    benefitsHi: 'बाधाओं को दूर करना, सुरक्षा और परिवर्तन',
    icon: '⚫',
    color: 'from-black to-gray-800'
  }
];

const YantraLab: React.FC<{ language: Language }> = ({ language }) => {
  const t = useTranslation(language);
  const [selectedYantra, setSelectedYantra] = useState<Yantra>(YANTRA_LIBRARY[0]);
  const [isRadiating, setIsRadiating] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playFrequency = () => {
    try {
      if (isRadiating) {
        // Stop the frequency
        if (oscillatorRef.current) {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
          oscillatorRef.current = null;
        }
        if (gainNodeRef.current) {
          gainNodeRef.current.disconnect();
          gainNodeRef.current = null;
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        setIsRadiating(false);
      } else {
        // Start the frequency
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const context = new AudioContext();
        audioContextRef.current = context;

        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        // Set frequency to 432 Hz (sacred frequency) or 528 Hz (healing frequency)
        oscillator.frequency.value = 432;
        oscillator.type = 'sine';

        // Set volume (0.1 = 10% volume to avoid being too loud)
        gainNode.gain.value = 0.1;

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.start();
        oscillatorRef.current = oscillator;
        gainNodeRef.current = gainNode;

        setIsRadiating(true);

        // Auto-stop after 30 seconds
        setTimeout(() => {
          if (oscillatorRef.current) {
            oscillatorRef.current.stop();
            oscillatorRef.current.disconnect();
            oscillatorRef.current = null;
          }
          if (gainNodeRef.current) {
            gainNodeRef.current.disconnect();
            gainNodeRef.current = null;
          }
          if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
          }
          setIsRadiating(false);
        }, 30000);
      }
    } catch (error) {
      console.error('Error playing frequency:', error);
      setIsRadiating(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-24 animate-fade-in-up">
      <div className="bg-slate-900/80 backdrop-blur-3xl border border-purple-500/30 rounded-3xl sm:rounded-[4rem] p-6 sm:p-8 md:p-16 shadow-2xl">
        
        <div className="text-center mb-8 sm:mb-12">
          <span className="text-[10px] sm:text-xs uppercase font-bold tracking-[1em] sm:tracking-[1.5em] text-purple-400 mb-3 sm:mb-4 block">
            {language === 'hi' ? 'पवित्र ज्यामिति' : 'Sacred Geometry'}
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-white via-purple-100 to-purple-500 drop-shadow-sm">
            {language === 'hi' ? 'यंत्र लैब' : 'Yantra Lab'}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm italic mt-4 sm:mt-6 tracking-[0.3em] sm:tracking-[0.5em] uppercase px-4">
            {language === 'hi' ? 'दिव्य ऊर्जा के ज्यामितीय पोर्टल' : 'Geometric Portals of Divine Energy'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">
          
          {/* Yantra List */}
          <div className="lg:col-span-4 space-y-3 sm:space-y-4 max-h-[500px] sm:max-h-[600px] overflow-y-auto pr-2 sm:pr-4 custom-scrollbar">
            {YANTRA_LIBRARY.map(yantra => (
              <button
                key={yantra.id}
                onClick={() => setSelectedYantra(yantra)}
                className={`w-full p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border transition-all duration-300 text-left relative group overflow-hidden ${
                  selectedYantra.id === yantra.id
                    ? 'bg-purple-500/20 border-purple-400 shadow-[0_10px_30px_rgba(168,85,247,0.3)] scale-[1.02]'
                    : 'bg-slate-950/40 border-white/5 hover:border-purple-500/30 hover:bg-slate-950/60'
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-2xl sm:text-3xl flex-shrink-0">{yantra.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className={`text-base sm:text-lg font-serif mb-1 transition-colors truncate ${
                      selectedYantra.id === yantra.id ? 'text-purple-200' : 'text-slate-300'
                    }`}>
                      {language === 'hi' ? yantra.nameHi : yantra.name}
                    </div>
                    <div className={`text-[9px] sm:text-[10px] uppercase tracking-wider transition-colors truncate ${
                      selectedYantra.id === yantra.id ? 'text-purple-400' : 'text-slate-500'
                    }`}>
                      {language === 'hi' ? yantra.deityHi : yantra.deity}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Yantra Details */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-8">
            
            {/* Yantra Visualization */}
            <div className="bg-black/40 backdrop-blur-md p-6 sm:p-8 md:p-12 rounded-3xl sm:rounded-[4rem] border border-white/10 relative group shadow-2xl overflow-hidden min-h-[300px] sm:min-h-[400px] flex flex-col items-center justify-center gap-6">
              <div className={`absolute inset-0 bg-gradient-to-br ${selectedYantra.color} opacity-10 transition-all duration-1000 ${isRadiating ? 'animate-pulse' : ''}`}></div>
              
              {/* Yantra Pattern - Simplified geometric representation */}
              <div className={`relative z-10 transition-all duration-1000 ${isRadiating ? 'scale-110' : ''}`}>
                <div className={`w-48 h-48 sm:w-64 sm:h-64 border-4 rounded-full relative transition-all duration-1000 border-purple-400/50 ${isRadiating ? 'border-purple-300 shadow-[0_0_40px_rgba(168,85,247,0.6)]' : ''}`}>
                  <div className={`absolute inset-4 border-2 rounded-full transition-all duration-1000 border-purple-300/40 animate-spin-slow ${isRadiating ? 'border-purple-200' : ''}`} style={{ animationDuration: '20s' }}></div>
                  <div className={`absolute inset-8 border rounded-full transition-all duration-1000 border-purple-200/30 animate-spin-slow ${isRadiating ? 'border-purple-100' : ''}`} style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 border-2 rounded-lg transition-all duration-1000 bg-purple-500/20 border-purple-400 rotate-45 ${isRadiating ? 'bg-purple-400/40 border-purple-300' : ''}`}></div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full transition-all duration-1000 bg-purple-400/40 ${isRadiating ? 'bg-purple-300/60 animate-pulse' : ''}`}></div>
                  </div>
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl sm:text-4xl">
                    {selectedYantra.icon}
                  </span>
                </div>
              </div>

              {/* Frequency Button */}
              <button
                onClick={playFrequency}
                className={`relative z-20 flex items-center justify-center gap-3 sm:gap-4 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl sm:rounded-[2rem] border-2 transition-all duration-500 font-serif font-bold text-base sm:text-lg ${
                  isRadiating
                    ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_30px_rgba(168,85,247,0.6)] scale-105'
                    : 'bg-slate-950/60 border-purple-500/30 text-purple-300 hover:border-purple-400 hover:bg-slate-950/80 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                }`}
              >
                <span className={`text-xl sm:text-2xl transition-transform ${isRadiating ? 'animate-spin' : ''}`}>
                  {isRadiating ? '🔊' : '🔇'}
                </span>
                <span>
                  {isRadiating 
                    ? (language === 'hi' ? 'आवृत्ति रोकें' : 'STOP FREQUENCY')
                    : (language === 'hi' ? 'आवृत्ति प्रसारित करें' : 'RADIATE FREQUENCY')
                  }
                </span>
                {isRadiating && (
                  <div className="absolute inset-0 rounded-2xl sm:rounded-[2rem] bg-purple-500/20 animate-ping"></div>
                )}
              </button>
            </div>

            {/* Yantra Information */}
            <div className="space-y-4 sm:space-y-6">
              <div className="inline-block px-4 sm:px-5 py-1.5 bg-purple-900/20 border border-purple-500/20 rounded-full text-[9px] sm:text-[10px] uppercase font-bold text-purple-400 tracking-wider sm:tracking-widest">
                {language === 'hi' ? 'यंत्र शक्ति' : selectedYantra.name + ' Yantra'}
              </div>
              
              <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-purple-200 drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                {language === 'hi' ? selectedYantra.nameHi : selectedYantra.name}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="p-4 sm:p-6 bg-white/5 rounded-2xl sm:rounded-[2rem] border border-white/5 group hover:border-purple-500/30 transition-colors">
                  <h4 className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold mb-2 sm:mb-3 tracking-[0.2em] sm:tracking-[0.3em]">
                    {language === 'hi' ? 'उद्देश्य' : 'Purpose'}
                  </h4>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed italic">
                    "{language === 'hi' ? selectedYantra.purposeHi : selectedYantra.purpose}"
                  </p>
                </div>
                
                <div className="p-4 sm:p-6 bg-white/5 rounded-2xl sm:rounded-[2rem] border border-white/5 group hover:border-purple-500/30 transition-colors">
                  <h4 className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold mb-2 sm:mb-3 tracking-[0.2em] sm:tracking-[0.3em]">
                    {language === 'hi' ? 'लाभ' : 'Benefits'}
                  </h4>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    {language === 'hi' ? selectedYantra.benefitsHi : selectedYantra.benefits}
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-6 bg-purple-900/20 rounded-2xl sm:rounded-[2rem] border border-purple-500/20">
                <h4 className="text-[9px] sm:text-[10px] text-purple-400 uppercase font-bold mb-2 sm:mb-3 tracking-[0.2em] sm:tracking-[0.3em]">
                  {language === 'hi' ? 'संबंधित देवता' : 'Associated Deity'}
                </h4>
                <p className="text-lg sm:text-xl text-purple-200 font-serif">
                  {language === 'hi' ? selectedYantra.deityHi : selectedYantra.deity}
                </p>
              </div>

              {/* Meditation guidance - Always visible */}
              <div className="p-4 sm:p-6 bg-slate-800/40 border border-slate-700/50 rounded-2xl sm:rounded-[2rem]">
                <h4 className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold mb-3 tracking-[0.2em] sm:tracking-[0.3em] text-center">
                  {language === 'hi' ? 'ध्यान मार्गदर्शन' : 'MEDITATION GUIDANCE'}
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1 flex-shrink-0">•</span>
                    <span>{language === 'hi' ? 'आंखें बंद करें और यंत्र पर ध्यान केंद्रित करें' : 'Close your eyes and focus on the Yantra'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1 flex-shrink-0">•</span>
                    <span>{language === 'hi' ? 'गहरी सांस लें और इसकी ऊर्जा को महसूस करें' : 'Take deep breaths and feel its energy'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1 flex-shrink-0">•</span>
                    <span>{language === 'hi' ? 'यंत्र की ज्यामिति को अपने मन में देखें' : 'Visualize the Yantra\'s geometry in your mind'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1 flex-shrink-0">•</span>
                    <span>{language === 'hi' ? 'इसकी शक्ति को अपने अंदर प्रवाहित होने दें' : 'Allow its power to flow through you'}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 sm:mt-20 pt-6 sm:pt-10 border-t border-white/5 w-full text-center">
          <p className="text-[9px] sm:text-[10px] text-slate-700 uppercase tracking-[0.8em] sm:tracking-[1em] leading-relaxed px-4">
            {language === 'hi' ? 'दिव्य ज्यामिति • ऊर्जा पोर्टल' : 'Sacred Geometry • Energy Portals'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default YantraLab;

