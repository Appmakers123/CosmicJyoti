import React, { useState, useMemo, useEffect } from 'react';
import { Language } from '../types';
import Logo from './Logo';
import { BackButton } from './common';
import { openExternalLink, getExternalLinkProps, isCapacitor } from '../utils/linkHandler';
import { PLAY_STORE_URL } from '../constants';
import AdBanner from './AdBanner';

const WHATSAPP_NUMBER = '919326715739';
const WHATSAPP_URL_MAX_LEN = 2000; // Approx limit for wa.me?text=

const SERVICES = [
  { id: 'kundali', en: 'Kundali / Birth Chart', hi: 'कुंडली / जन्म कुंडली' },
  { id: 'compatibility', en: 'Compatibility / Matchmaking', hi: 'कुंडली मिलान' },
  { id: 'numerology', en: 'Numerology', hi: 'अंक ज्योतिष' },
  { id: 'tarot', en: 'Tarot Reading', hi: 'टैरो पाठ' },
  { id: 'palmistry', en: 'Palmistry', hi: 'हस्तरेखा' },
  { id: 'vastu', en: 'Vastu Consultation', hi: 'वास्तु परामर्श' },
  { id: 'cosmic-health', en: 'Cosmic Health', hi: 'कॉस्मिक हेल्थ' },
  { id: 'combo2', en: 'Combo (Any 2 Services)', hi: 'कॉम्बो (कोई 2 सेवाएं)' },
  { id: 'combo3', en: 'Combo (Any 3 Services)', hi: 'कॉम्बो (कोई 3 सेवाएं)' },
];

const DURATIONS = [
  { mins: 30, en: '30 min', hi: '30 मिनट' },
  { mins: 45, en: '45 min', hi: '45 मिनट' },
  { mins: 60, en: '60 min', hi: '60 मिनट' },
];

// Base: 30 min = $10 or ₹1000
const BASE_USD = 10;
const BASE_INR = 1000;

function getPrice(mins: number, isIndia: boolean): { amount: number; currency: string } {
  const multiplier = mins / 30;
  if (isIndia) {
    return { amount: Math.round(BASE_INR * multiplier), currency: '₹' };
  }
  return { amount: Math.round(BASE_USD * multiplier), currency: '$' };
}

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 9; h <= 18; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 18 && m > 0) break;
      slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  }
  return slots;
}

const ALL_TIME_SLOTS = generateTimeSlots();

/** Filter out past slots when date is today */
function getAvailableSlots(dateStr: string): string[] {
  if (!dateStr) return ALL_TIME_SLOTS;
  const today = new Date();
  const selected = new Date(dateStr);
  if (selected.toDateString() !== today.toDateString()) return ALL_TIME_SLOTS;
  const now = today.getHours() * 60 + today.getMinutes();
  return ALL_TIME_SLOTS.filter((slot) => {
    const [h, m] = slot.split(':').map(Number);
    return h * 60 + m > now + 15; // 15 min buffer
  });
}

interface BookAppointmentProps {
  language: Language;
  onBack: () => void;
}

const BookAppointment: React.FC<BookAppointmentProps> = ({ language, onBack }) => {
  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    region: 'india' as 'india' | 'outside',
    service: '',
    date: '',
    timeSlot: '',
    duration: 30,
  });

  const price = useMemo(() => {
    const mins = DURATIONS.some((d) => d.mins === form.duration) ? form.duration : 30;
    return getPrice(mins, form.region === 'india');
  }, [form.duration, form.region]);
  const minDate = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);
  const availableSlots = useMemo(() => getAvailableSlots(form.date), [form.date]);

  // Reset timeSlot when it's no longer available (e.g. user switched to today)
  useEffect(() => {
    if (form.timeSlot && availableSlots.length > 0 && !availableSlots.includes(form.timeSlot)) {
      setForm((prev) => ({ ...prev, timeSlot: '' }));
    }
  }, [availableSlots, form.timeSlot]);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isValidPhone = (phone: string) => (phone.replace(/\D/g, '').length >= 10 && phone.length <= 25);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name?.trim();
    const email = form.email?.trim();
    const phone = form.phone?.trim();
    if (!name || !email || !phone || !form.service || !form.date || !form.timeSlot) {
      alert(language === 'hi' ? 'कृपया सभी आवश्यक फ़ील्ड भरें' : 'Please fill all required fields');
      return;
    }
    if (!isValidEmail(email)) {
      alert(language === 'hi' ? 'कृपया मान्य ईमेल दर्ज करें' : 'Please enter a valid email address');
      return;
    }
    if (!isValidPhone(phone)) {
      alert(language === 'hi' ? 'कृपया मान्य फ़ोन नंबर दर्ज करें (कम से कम 10 अंक)' : 'Please enter a valid phone number (at least 10 digits)');
      return;
    }
    const dateObj = new Date(form.date);
    if (isNaN(dateObj.getTime())) {
      alert(language === 'hi' ? 'कृपया मान्य तारीख चुनें' : 'Please select a valid date');
      return;
    }
    if (dateObj < new Date(new Date().setHours(0, 0, 0, 0))) {
      alert(language === 'hi' ? 'पिछली तारीख चुन नहीं सकते' : 'Cannot select a past date');
      return;
    }
    if (!availableSlots.includes(form.timeSlot)) {
      alert(language === 'hi' ? 'यह समय स्लॉट उपलब्ध नहीं है। कृपया कोई अन्य समय चुनें।' : 'This time slot is no longer available. Please select another time.');
      return;
    }
    setStep('confirm');
  };

  const getWhatsAppMessage = () => {
    const serviceLabel = SERVICES.find((s) => s.id === form.service);
    const serviceName = (language === 'hi' ? serviceLabel?.hi : serviceLabel?.en) || form.service;
    const durationLabel = DURATIONS.find((d) => d.mins === form.duration);
    const durationStr = (language === 'hi' ? durationLabel?.hi : durationLabel?.en) || `${form.duration} min`;
    let dateStr = form.date;
    try {
      const d = new Date(form.date);
      if (!isNaN(d.getTime())) {
        dateStr = d.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    } catch {
      // keep raw form.date
    }
    return [
      '*New Appointment Booking*',
      '',
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone}`,
      `Service: ${serviceName}`,
      `Date: ${dateStr}`,
      `Time: ${form.timeSlot}`,
      `Duration: ${durationStr}`,
      `Amount: ${price.currency}${price.amount} (pay during session)`,
      '',
      language === 'hi' ? 'कृपया पुष्टि करें और Google Meet लिंक साझा करें।' : 'Please confirm and share Google Meet link.',
    ].join('\n');
  };

  const handleSendWhatsApp = () => {
    let msg = getWhatsAppMessage();
    const encoded = encodeURIComponent(msg);
    if (encoded.length > WHATSAPP_URL_MAX_LEN - 50) {
      msg = msg.substring(0, Math.floor((WHATSAPP_URL_MAX_LEN - 100) / 4));
    }
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    openExternalLink(url, language);
  };

  if (step === 'confirm') {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8 animate-fade-in-up">
        <BackButton onClick={() => setStep('form')} label={language === 'hi' ? 'संपादित करें' : 'Edit'} />
        <div className="mt-6 bg-slate-800/80 border-2 border-amber-500/40 rounded-2xl p-6 md:p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">📅</div>
            <h2 className="text-2xl font-serif font-bold text-amber-300 mb-2">
              {language === 'hi' ? 'बुकिंग सारांश' : 'Booking Summary'}
            </h2>
            <p className="text-slate-400 text-sm">
              {language === 'hi'
                ? 'नीचे दिए गए बटन से अपनी बुकिंग विवरण हमें WhatsApp पर भेजें।'
                : 'Send your booking details to us via WhatsApp using the button below.'}
            </p>
          </div>
          <div className="space-y-3 mb-6 text-sm">
            <p><span className="text-slate-500">{language === 'hi' ? 'नाम:' : 'Name:'}</span> <span className="text-white">{form.name}</span></p>
            <p><span className="text-slate-500">{language === 'hi' ? 'ईमेल:' : 'Email:'}</span> <span className="text-white">{form.email}</span></p>
            <p><span className="text-slate-500">{language === 'hi' ? 'फ़ोन:' : 'Phone:'}</span> <span className="text-white">{form.phone}</span></p>
            <p><span className="text-slate-500">{language === 'hi' ? 'सेवा:' : 'Service:'}</span> <span className="text-white">{SERVICES.find((s) => s.id === form.service)?.[language === 'hi' ? 'hi' : 'en']}</span></p>
            <p><span className="text-slate-500">{language === 'hi' ? 'तारीख:' : 'Date:'}</span> <span className="text-white">{new Date(form.date).toLocaleDateString()}</span></p>
            <p><span className="text-slate-500">{language === 'hi' ? 'समय:' : 'Time:'}</span> <span className="text-white">{form.timeSlot}</span></p>
            <p><span className="text-slate-500">{language === 'hi' ? 'अवधि:' : 'Duration:'}</span> <span className="text-white">{DURATIONS.find((d) => d.mins === form.duration)?.[language === 'hi' ? 'hi' : 'en']}</span></p>
            <p><span className="text-slate-500">{language === 'hi' ? 'राशि:' : 'Amount:'}</span> <span className="text-amber-400 font-bold">{price.currency}{price.amount}</span> <span className="text-slate-500 text-xs">({language === 'hi' ? 'सत्र के दौरान भुगतान' : 'pay during session'})</span></p>
          </div>
          <button
            onClick={handleSendWhatsApp}
            className="w-full py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            {language === 'hi' ? 'WhatsApp पर भेजें' : 'Send via WhatsApp'}
          </button>
          <p className="text-xs text-slate-500 text-center mt-4">
            {language === 'hi' ? 'WhatsApp खोलेगा। संदेश भेजें ताकि हम आपकी बुकिंग की पुष्टि कर सकें और Google Meet लिंक साझा कर सकें।' : 'WhatsApp will open. Send the message so we can confirm your booking and share the Google Meet link.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 animate-fade-in-up">
      <BackButton onClick={onBack} label={language === 'hi' ? 'वापस' : 'Back'} />
      <div className="mt-6 text-center mb-8">
        <Logo className="w-14 h-14 mx-auto mb-4" />
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
          {language === 'hi' ? 'अपॉइंटमेंट बुक करें' : 'Book an Appointment'}
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          {language === 'hi' ? 'Google Meet पर विशेषज्ञ से मिलें। सत्र के दौरान भुगतान।' : 'Meet our expert via Google Meet. Pay during the session.'}
        </p>
        {!isCapacitor() && (
          <a
            {...getExternalLinkProps(PLAY_STORE_URL, language)}
            className="inline-flex items-center gap-2 mt-3 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
          >
            <span>📱</span>
            {language === 'hi' ? 'ऐप में भी उपलब्ध' : 'Also available in our app'}
          </a>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 space-y-5">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
            {language === 'hi' ? 'आपकी जानकारी' : 'Your Details'}
          </h3>
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">{language === 'hi' ? 'नाम *' : 'Name *'}</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-amber-500 outline-none"
              placeholder={language === 'hi' ? 'आपका नाम' : 'Your name'}
              required
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">{language === 'hi' ? 'ईमेल *' : 'Email *'}</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-amber-500 outline-none"
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">{language === 'hi' ? 'फ़ोन नंबर *' : 'Phone *'}</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-amber-500 outline-none"
              placeholder="+91 9876543210"
              required
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">{language === 'hi' ? 'क्षेत्र' : 'Region'}</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, region: 'india' })}
                className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${form.region === 'india' ? 'bg-amber-600 text-slate-900' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
              >
                {language === 'hi' ? 'भारत (₹)' : 'India (₹)'}
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, region: 'outside' })}
                className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${form.region === 'outside' ? 'bg-amber-600 text-slate-900' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
              >
                {language === 'hi' ? 'अंतर्राष्ट्रीय ($)' : 'International ($)'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 space-y-5">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
            {language === 'hi' ? 'सेवा और समय' : 'Service & Time'}
          </h3>
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">{language === 'hi' ? 'सेवा चुनें *' : 'Select Service *'}</label>
            <select
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-amber-500 outline-none"
              required
            >
              <option value="">{language === 'hi' ? '-- सेवा चुनें --' : '-- Select service --'}</option>
              {SERVICES.map((s) => (
                <option key={s.id} value={s.id}>{language === 'hi' ? s.hi : s.en}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">{language === 'hi' ? 'अवधि *' : 'Duration *'}</label>
            <div className="flex gap-2 flex-wrap">
              {DURATIONS.map((d) => {
                const p = getPrice(d.mins, form.region === 'india');
                return (
                  <button
                    key={d.mins}
                    type="button"
                    onClick={() => setForm({ ...form, duration: d.mins })}
                    className={`px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${form.duration === d.mins ? 'bg-amber-600 text-slate-900' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                  >
                    {language === 'hi' ? d.hi : d.en} — {p.currency}{p.amount}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">{language === 'hi' ? 'तारीख *' : 'Date *'}</label>
              <input
                type="date"
                value={form.date}
                min={minDate}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-amber-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">{language === 'hi' ? 'समय स्लॉट *' : 'Time Slot *'}</label>
              <select
                value={availableSlots.includes(form.timeSlot) ? form.timeSlot : ''}
                onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-amber-500 outline-none"
                required
              >
                <option value="">{language === 'hi' ? '-- समय चुनें --' : '-- Select time --'}</option>
                {availableSlots.length === 0 ? (
                  <option value="" disabled>{language === 'hi' ? 'आज के लिए कोई स्लॉट उपलब्ध नहीं' : 'No slots available for today'}</option>
                ) : (
                  availableSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))
                )}
              </select>
            </div>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-sm text-amber-200">
              {language === 'hi' ? 'कुल राशि:' : 'Total:'} <span className="font-bold">{price.currency}{price.amount}</span> ({language === 'hi' ? 'सत्र के दौरान भुगतान' : 'pay during session'})
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-900 font-bold rounded-xl transition-all shadow-lg"
        >
          {language === 'hi' ? 'बुक करें' : 'Book Appointment'}
        </button>
      </form>
      <AdBanner variant="display" className="mt-8" />
    </div>
  );
};

export default BookAppointment;
