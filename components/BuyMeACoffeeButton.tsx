import React from 'react';
import { BUY_ME_A_COFFEE_URL, BUY_ME_A_COFFEE_SLUG } from '../constants';
import { Language } from '../types';
import { openExternalLink, getExternalLinkProps } from '../utils/linkHandler';

interface BuyMeACoffeeButtonProps {
  language?: Language;
  className?: string;
  variant?: 'default' | 'compact' | 'pill' | 'banner';
  customText?: string;
  onClick?: () => void;
}

export const BuyMeACoffeeButton: React.FC<BuyMeACoffeeButtonProps> = ({
  language = 'en',
  className = '',
  variant = 'default',
  customText,
  onClick,
}) => {
  const isHindi = language === 'hi';

  const defaultText = customText || (isHindi ? 'Buy me a coffee' : 'Buy me a coffee');

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    }
    // open via openExternalLink to handle in-app browser/Capacitor/new tab smoothly
    openExternalLink(BUY_ME_A_COFFEE_URL, language);
  };

  // Coffee cup icon
  const CoffeeIcon = () => (
    <span className="inline-flex items-center justify-center shrink-0" aria-hidden="true">
      <svg
        className="w-5 h-5 sm:w-6 sm:h-6"
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{ color: '#000000' }}
      >
        <path d="M20.216 6.415l-.132-.666c-.119-.597-.388-1.156-.78-1.618a3.784 3.784 0 0 0-2.025-1.168 11.238 11.238 0 0 0-3.376-.328C11.95.27 9.878.27 7.925.635 6.07.98 4.417 1.764 3.167 2.923 1.905 4.093 1.158 5.617 1.05 7.273c-.112 1.737.42 3.42 1.498 4.745 1.055 1.295 2.535 2.19 4.195 2.536.56.117 1.13.19 1.705.22-.047.46-.076.92-.086 1.383-.044 1.954.512 3.86 1.583 5.426C11.002 23.13 12.63 24 14.54 24c1.908 0 3.536-.87 4.594-2.417 1.07-1.567 1.627-3.472 1.583-5.426a27.17 27.17 0 0 0-.087-1.383 10.66 10.66 0 0 0 1.97-.478 5.257 5.257 0 0 0 2.29-1.638 5.373 5.373 0 0 0 .97-3.138c.03-.996-.23-1.97-.744-2.825a5.535 5.535 0 0 0-2.89-2.28zm.974 4.54c-.116.643-.43 1.237-.9 1.703a3.52 3.52 0 0 1-1.58.915c-.21.056-.425.097-.643.123.473-1.745.69-3.553.645-5.367.652.12 1.26.435 1.747.904.475.46.772 1.07.831 1.722h-1e-3z"/>
      </svg>
    </span>
  );

  if (variant === 'compact') {
    return (
      <a
        {...getExternalLinkProps(BUY_ME_A_COFFEE_URL, language)}
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all text-slate-950 active:scale-95 shadow-[0_2px_10px_rgba(255,221,0,0.3)] hover:shadow-[0_2px_15px_rgba(255,221,0,0.5)] border border-black/30 cursor-pointer ${className}`}
        style={{ backgroundColor: '#FFDD00' }}
        title={`Support @${BUY_ME_A_COFFEE_SLUG} on Buy Me a Coffee`}
      >
        <CoffeeIcon />
        <span 
          style={{ fontFamily: "'Cookie', cursive, sans-serif" }} 
          className="text-lg leading-none tracking-wide pt-0.5 text-black"
        >
          {defaultText}
        </span>
      </a>
    );
  }

  if (variant === 'pill') {
    return (
      <a
        {...getExternalLinkProps(BUY_ME_A_COFFEE_URL, language)}
        onClick={handleClick}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all text-slate-950 active:scale-95 shadow-[0_3px_15px_rgba(255,221,0,0.35)] hover:shadow-[0_4px_20px_rgba(255,221,0,0.55)] border border-black/20 cursor-pointer min-h-[44px] ${className}`}
        style={{ backgroundColor: '#FFDD00' }}
        title={`Support @${BUY_ME_A_COFFEE_SLUG} on Buy Me a Coffee`}
      >
        <CoffeeIcon />
        <span 
          style={{ fontFamily: "'Cookie', cursive, sans-serif" }} 
          className="text-xl sm:text-2xl leading-none tracking-wide text-black pt-0.5"
        >
          {defaultText}
        </span>
      </a>
    );
  }

  if (variant === 'banner') {
    return (
      <a
        {...getExternalLinkProps(BUY_ME_A_COFFEE_URL, language)}
        onClick={handleClick}
        className={`w-full flex items-center justify-center gap-3 px-5 py-3 rounded-2xl font-bold transition-all text-slate-950 active:scale-[0.99] shadow-[0_4px_20px_rgba(255,221,0,0.4)] hover:shadow-[0_6px_25px_rgba(255,221,0,0.6)] border-2 border-black/40 cursor-pointer ${className}`}
        style={{ backgroundColor: '#FFDD00' }}
        title={`Support @${BUY_ME_A_COFFEE_SLUG} on Buy Me a Coffee`}
      >
        <CoffeeIcon />
        <span 
          style={{ fontFamily: "'Cookie', cursive, sans-serif" }} 
          className="text-2xl sm:text-3xl leading-none tracking-wide text-black pt-0.5"
        >
          {defaultText}
        </span>
      </a>
    );
  }

  // Default button matching official Buy Me a Coffee button specs
  return (
    <a
      {...getExternalLinkProps(BUY_ME_A_COFFEE_URL, language)}
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl font-bold transition-all text-slate-950 active:scale-95 shadow-[0_3px_15px_rgba(255,221,0,0.35)] hover:shadow-[0_4px_22px_rgba(255,221,0,0.55)] border border-black/30 cursor-pointer min-h-[44px] ${className}`}
      style={{ backgroundColor: '#FFDD00' }}
      title={`Support @${BUY_ME_A_COFFEE_SLUG} on Buy Me a Coffee`}
    >
      <CoffeeIcon />
      <span 
        style={{ fontFamily: "'Cookie', cursive, sans-serif" }} 
        className="text-xl sm:text-2xl leading-none tracking-wide text-black pt-0.5"
      >
        {defaultText}
      </span>
    </a>
  );
};

export default BuyMeACoffeeButton;
