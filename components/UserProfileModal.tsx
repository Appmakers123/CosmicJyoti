import React, { useState, useEffect } from 'react';
import { User, Language, KundaliFormData } from '../types';
import { useTranslation } from '../utils/translations';
import Logo from './Logo';
import { BirthForm, FieldRow } from './profile';
import { getGlobalProfile, saveGlobalProfile } from '../utils/profileStorageService';
import { submitProfileWithConsent } from '../services/profileSubmissionService';

const emptySelf: KundaliFormData = {
  name: '',
  date: '',
  time: '12:00',
  location: 'New Delhi, India',
  gender: undefined,
  observationPoint: 'topocentric',
  ayanamsha: 'lahiri',
  language: 'en',
};

interface UserProfileModalProps {
  user: User | null;
  onSave: (user: User) => void;
  onClose: () => void;
  onLogout: () => void;
  language: Language;
  onProfileSaved?: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onSave, onClose, onLogout, language, onProfileSaved }) => {
  const t = useTranslation(language);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [showPartner, setShowPartner] = useState(false);

  const [self, setSelf] = useState<KundaliFormData>(emptySelf);
  const [partner, setPartner] = useState<KundaliFormData>({ ...emptySelf, name: '', location: 'New Delhi, India' });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    const profile = getGlobalProfile();
    if (profile?.self) setSelf({ ...emptySelf, ...profile.self });
    if (profile?.partner) {
      setPartner({ ...emptySelf, ...profile.partner });
      setShowPartner(true);
    }
  }, []);

  const handleSave = async () => {
    if (!consentGiven) {
      alert(language === 'hi' 
        ? 'कृपया सहमति दें कि आप अपनी जानकारी साझा करने के लिए सहमत हैं।'
        : 'Please provide consent that you agree to share your information.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const updatedUser: User = {
        id: user?.id || `user_${Date.now()}`,
        name: name.trim() || 'Guest',
        email: email.trim() || '',
        isGuest: !name.trim() && !email.trim(),
      };
      onSave(updatedUser);

      const profileData = {
        self: { ...self, language },
        partner: showPartner && partner.name ? { ...partner, language } : undefined,
      };
      saveGlobalProfile(profileData);
      try {
        localStorage.setItem('cosmicjyoti_profile_consent', 'granted');
      } catch {}
      const submitted = await submitProfileWithConsent(profileData, updatedUser.name, updatedUser.email);
      if (!submitted && import.meta.env.DEV) {
        console.warn('[ProfileModal] Data was not sent to the sheet. Add VITE_PROFILE_SUBMIT_URL to .env.local and restart. See PROFILE_SHEET_SETUP.md');
      }
      onProfileSaved?.();
      onClose();
    } catch (e) {
      console.warn('[ProfileModal] Save error:', e);
      alert(language === 'hi' ? 'सहेजने में त्रुटि। पुनः प्रयास करें।' : 'Error saving. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    if (confirm(language === 'hi' 
      ? 'क्या आप अपनी जानकारी हटाना चाहते हैं?'
      : 'Do you want to clear your information?'
    )) {
      onLogout();
      onClose();
    }
  };

  React.useEffect(() => {
    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.paddingRight = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-800 border-2 border-amber-500/30 rounded-[2.5rem] shadow-2xl w-full max-w-lg p-6 md:p-8 relative overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Logo className="w-14 h-14" />
          </div>
          <h2 className="text-xl font-serif text-white mb-1">
            {language === 'hi' ? 'आपकी प्रोफ़ाइल' : 'Your Profile'}
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            {language === 'hi' ? 'सभी मॉड्यूल में ऑटो-भरने के लिए' : 'Auto-fills forms across all modules'}
          </p>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-left">
            <p className="text-emerald-200/90 text-xs flex items-start gap-2">
              <span className="shrink-0" aria-hidden="true">💡</span>
              <span>{language === 'hi' ? 'एक बार सेव करें—कुंडली, संगतता, राशिफल में दोबारा लिखने की ज़रूरत नहीं।' : 'Save once—no need to re-enter in Kundali, Compatibility, Horoscope & more.'}</span>
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-bold text-amber-400/90 uppercase tracking-wider mb-3">
              {language === 'hi' ? 'खाता (वैकल्पिक)' : 'Account (Optional)'}
            </h3>
            <div className="space-y-3">
              <FieldRow label={language === 'hi' ? 'नाम' : 'Name'}>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={language === 'hi' ? 'आपका नाम' : 'Your name'}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-amber-500 outline-none" />
              </FieldRow>
              <FieldRow label={language === 'hi' ? 'ईमेल' : 'Email'}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-amber-500 outline-none" />
              </FieldRow>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-amber-400/90 uppercase tracking-wider mb-3">
              {language === 'hi' ? 'आपकी जन्म जानकारी (कुंडली, राशिफल, संगतता आदि)' : 'Your Birth Details (Kundali, Horoscope, Compatibility, etc.)'}
            </h3>
            <BirthForm data={self} setData={setSelf} prefix="self" language={language} />
          </div>

          <div>
            <button type="button" onClick={() => setShowPartner(!showPartner)}
              className="text-sm font-bold text-amber-400/80 hover:text-amber-400 flex items-center gap-2 mb-2">
              {showPartner ? '−' : '+'} {language === 'hi' ? 'साथी जोड़ें (संगतता के लिए)' : 'Add Partner (for Compatibility)'}
            </button>
            {showPartner && <BirthForm data={partner} setData={setPartner} prefix="partner" language={language} />}
          </div>

          <div className="bg-slate-900/50 border border-amber-500/20 rounded-xl p-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={consentGiven} onChange={e => setConsentGiven(e.target.checked)}
                className="mt-1 w-4 h-4 text-amber-500 bg-slate-800 border-slate-700 rounded focus:ring-amber-500" />
              <span className="text-[11px] text-slate-300 leading-relaxed">
                {language === 'hi' 
                  ? 'मैं अपनी जानकारी साझा करने के लिए सहमत हूं। (सहेजने के लिए आवश्यक)'
                  : 'I consent to sharing my information. (Required to save)'}
              </span>
            </label>
          </div>

          <div className="space-y-2">
            <button onClick={handleSave} disabled={isLoading || !consentGiven}
              className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-95">
              {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full mx-auto"></div> : (language === 'hi' ? 'सहेजें' : 'Save')}
            </button>
            {user && !user.isGuest && (
              <button onClick={handleClear}
                className="w-full bg-red-600/80 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                {language === 'hi' ? 'लॉगआउट' : 'Logout'}
              </button>
            )}
          </div>
        </div>

        <p className="mt-6 text-[9px] text-center text-slate-600 uppercase tracking-widest leading-relaxed">
          {language === 'hi' ? 'जानकारी डिवाइस पर सुरक्षित रखी जाती है।' : 'Information is stored securely on your device.'}
        </p>
      </div>
    </div>
  );
};

export default UserProfileModal;
