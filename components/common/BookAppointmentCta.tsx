import React from 'react';
import { Language } from '../../types';

interface BookAppointmentCtaProps {
  language: Language;
  className?: string;
  variant?: 'button' | 'link';
}

/**
 * CTA shown when AI fails - offers user option to book a consultation.
 * Links to /?mode=appointment so App opens Book Appointment module.
 */
const BookAppointmentCta: React.FC<BookAppointmentCtaProps> = ({
  language,
  className = '',
  variant = 'button',
}) => {
  const text =
    language === 'hi'
      ? 'विशेषज्ञ से परामर्श बुक करें'
      : 'Book a consultation with an expert';
  const href = '/?mode=appointment';

  if (variant === 'link') {
    return (
      <a
        href={href}
        className={`text-amber-400 hover:text-amber-300 hover:underline text-sm font-medium transition-colors ${className}`}
      >
        📅 {text}
      </a>
    );
  }

  return (
    <a
      href={href}
      className={`inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] ${className}`}
    >
      <span>📅</span>
      {text}
    </a>
  );
};

export default BookAppointmentCta;
