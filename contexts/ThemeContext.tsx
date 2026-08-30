import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type Theme = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'cosmicjyoti_theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light' || saved === 'system') {
      return saved;
    }
  } catch (e) {
    // Ignore storage errors
  }
  return 'system';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    const initialTheme = getStoredTheme();
    return initialTheme === 'system' ? getSystemTheme() : initialTheme;
  });

  const applyThemeToDom = useCallback((resolved: ResolvedTheme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    if (resolved === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    root.setAttribute('data-theme', resolved);
    root.style.colorScheme = resolved;

    // Update meta theme-color for browser tab bar / mobile status bar
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const colorValue = resolved === 'dark' ? '#020617' : '#f8fafc';
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', colorValue);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = colorValue;
      document.head.appendChild(meta);
    }

    // Dispatch event for canvas or external listeners
    window.dispatchEvent(new CustomEvent('cosmicjyoti_theme_changed', { detail: { resolved, theme } }));
  }, [theme]);

  // Handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (theme === 'system') {
        const newResolved = mediaQuery.matches ? 'dark' : 'light';
        setResolvedTheme(newResolved);
        applyThemeToDom(newResolved);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if ('addListener' in mediaQuery) {
      // Fallback for older browsers
      (mediaQuery as any).addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else if ('removeListener' in mediaQuery) {
        (mediaQuery as any).removeListener(handleChange);
      }
    };
  }, [theme, applyThemeToDom]);

  // Handle theme changes
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch (e) {
      // Ignore storage errors
    }

    const newResolved = newTheme === 'system' ? getSystemTheme() : newTheme;
    setResolvedTheme(newResolved);
    applyThemeToDom(newResolved);
  }, [applyThemeToDom]);

  const toggleTheme = useCallback(() => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  }, [theme, setTheme]);

  // Initial sync with DOM
  useEffect(() => {
    const currentResolved = theme === 'system' ? getSystemTheme() : theme;
    setResolvedTheme(currentResolved);
    applyThemeToDom(currentResolved);
  }, [theme, applyThemeToDom]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
