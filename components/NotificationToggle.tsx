import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { startNotificationScheduler, stopNotificationScheduler, getNotificationScheduleCopy } from '../utils/notificationScheduler';

interface NotificationToggleProps {
  language: Language;
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({ language }) => {
  const [enabled, setEnabled] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!('Notification' in window)) {
      setIsSupported(false);
      return;
    }

    const storedPref = localStorage.getItem('cosmic_notifications');
    if (Notification.permission === 'granted' && storedPref === 'true') {
      setEnabled(true);
      startNotificationScheduler(language);
    } else {
      if (storedPref === 'true' && Notification.permission !== 'granted') {
        setEnabled(false);
        localStorage.setItem('cosmic_notifications', 'false');
      }
      stopNotificationScheduler();
    }
    return () => { stopNotificationScheduler(); };
  }, [language]);

  const toggle = async () => {
    if (!isSupported) {
      alert(language === 'hi' ? 'इस ब्राउज़र में सूचनाएं समर्थित नहीं हैं।' : 'Notifications are not supported in this browser.');
      return;
    }

    if (enabled) {
      setEnabled(false);
      localStorage.setItem('cosmic_notifications', 'false');
      stopNotificationScheduler();
    } else {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setEnabled(true);
        localStorage.setItem('cosmic_notifications', 'true');
        startNotificationScheduler(language);
        const { title, body } = getNotificationScheduleCopy(language);
        try {
          new Notification(title, { body, icon: '/favicon.ico' });
        } catch (e) {
          console.warn('Welcome notification failed', e);
        }
      } else {
        alert(language === 'hi' ? 'कृपया ब्राउज़र सेटिंग में सूचनाओं की अनुमति दें।' : 'Please allow notifications in your browser settings.');
      }
    }
  };

  if (!isSupported) return null;

  return (
    <button 
      onClick={toggle}
      className={`relative p-2 rounded-full border transition-all duration-300 group ${
        enabled 
          ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
          : 'bg-slate-800/60 border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700'
      }`}
      title={enabled ? (language === 'hi' ? "राशिफल 8 बजे, लेख 12 बजे (आपके समय)" : "Horoscope 8 AM, articles 12 PM (your time)") : (language === 'hi' ? "सुबह 8 बजे राशिफल, दोपहर 12 बजे लेख की याद" : "Get horoscope at 8 AM & reads at 12 PM")}
    >
      {enabled ? (
        <div className="relative">
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
            </svg>
        </div>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )}
    </button>
  );
};

export default NotificationToggle;
