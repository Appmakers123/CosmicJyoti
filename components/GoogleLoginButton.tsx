import React, { useEffect, useRef } from 'react';
import { userFromGoogleCredential } from '../utils/googleAuth';
import type { User } from '../types';

/** Google Identity Services (GSI) - loaded from https://accounts.google.com/gsi/client */
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (res: { credential: string }) => void }) => void;
          renderButton: (el: HTMLElement, options: { theme?: string; size?: string; text?: string; locale?: string; shape?: string }) => void;
        };
      };
    };
  }
}

const GSI_SCRIPT = 'https://accounts.google.com/gsi/client';

interface GoogleLoginButtonProps {
  onSuccess: (user: User) => void;
  onError?: () => void;
  language: string;
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  className?: string;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
}

/**
 * Renders Google Sign-In button using GSI script (no npm package).
 * Requires VITE_GOOGLE_CLIENT_ID to be set.
 */
const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
  language,
  theme = 'outline',
  size = 'large',
  className = '',
  text = 'signin_with',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!clientId || !containerRef.current) return;

    const render = () => {
      if (!window.google?.accounts?.id || !containerRef.current) return;
      containerRef.current.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: { credential: string }) => {
          if (!response.credential) {
            onErrorRef.current?.();
            return;
          }
          const user = userFromGoogleCredential(response.credential);
          onSuccessRef.current(user);
        },
      });
      window.google.accounts.id.renderButton(containerRef.current, {
        theme,
        size,
        text,
        locale: language === 'hi' ? 'hi' : 'en',
        shape: 'rectangular',
      });
    };

    if (window.google?.accounts?.id) {
      render();
      return;
    }

    const script = document.createElement('script');
    script.src = GSI_SCRIPT;
    script.async = true;
    script.onload = render;
    document.head.appendChild(script);
    return () => {
      script.remove();
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [clientId, language, theme, size, text]);

  if (!clientId) return null;

  return <div ref={containerRef} className={className} />;
};

export default GoogleLoginButton;
