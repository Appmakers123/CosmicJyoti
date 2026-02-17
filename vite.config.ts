import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Plugin to handle @capacitor/app and @capacitor/browser dynamic imports
const capacitorPluginsPlugin = () => ({
  name: 'capacitor-plugins-external',
  resolveId(id: string) {
    // Tell Vite to treat Capacitor plugins as external
    if (id === '@capacitor/app' || id === '@capacitor/browser') {
      return { id, external: true };
    }
    return null;
  }
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  // In CI (GitHub Actions) there is no .env file; workflow sets process.env. Merge so secrets are used.
  const p = (process as any).env || {};
  const e = (key: string) => (env[key] ?? p[key] ?? '') as string;
  if (mode === 'development' && process.env.DEBUG_VITE_ENV === '1') {
    console.log('Loading environment variables. Gemini API_KEY present:', !!(e('API_KEY') || e('GEMINI_API_KEY')));
  }
  return {
    plugins: [react(), capacitorPluginsPlugin()],
    optimizeDeps: {
      exclude: ['@capacitor/app', '@capacitor/browser'], // Exclude from pre-bundling in dev mode
    },
    // Base: './' = relative (works at any path). '/' = site root. CI sets VITE_BASE_URL=./ for GitHub Pages.
    base: (() => {
      const b = env.VITE_BASE_URL ?? p.VITE_BASE_URL ?? env.BASE_URL ?? '/';
      if (b === './' || b === '.') return './';
      return (b.replace(/\/*$/, '/') || '/');
    })(),
    define: {
      // Gemini API keys — from .env or process.env (CI secrets)
      'process.env.API_KEY': JSON.stringify(e('API_KEY') || e('GEMINI_API_KEY') || ''),
      'process.env.API_KEYS': JSON.stringify(e('API_KEYS') || e('GEMINI_API_KEYS') || ''),
      'process.env.GEMINI_API_KEY': JSON.stringify(e('GEMINI_API_KEY') || e('API_KEY') || ''),
      'process.env.GEMINI_API_KEYS': JSON.stringify(e('GEMINI_API_KEYS') || e('API_KEYS') || ''),
      // Perplexity API keys
      'process.env.PERPLEXITY_API_KEY': JSON.stringify(e('PERPLEXITY_API_KEY') || ''),
      'process.env.PERPLEXITY_API_KEYS': JSON.stringify(e('PERPLEXITY_API_KEYS') || e('PERPLEXITY_API_KEY') || ''),
      // VITE_* and others for client
      'import.meta.env.VITE_GOOGLE_API_KEY': JSON.stringify(e('VITE_GOOGLE_API_KEY') || ''),
      'import.meta.env.VITE_ASTROLOGY_API_KEYS': JSON.stringify(e('ASTROLOGY_API_KEYS') || e('VITE_ASTROLOGY_API_KEYS') || ''),
      'import.meta.env.VITE_PROFILE_SUBMIT_URL': JSON.stringify(e('VITE_PROFILE_SUBMIT_URL') || ''),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(e('VITE_API_BASE_URL') || ''),
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(e('VITE_FIREBASE_API_KEY') || ''),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(e('VITE_FIREBASE_PROJECT_ID') || ''),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(e('VITE_FIREBASE_AUTH_DOMAIN') || '')
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: 'esbuild',
      chunkSizeWarningLimit: 600, // Warn if chunks exceed 600KB (main app chunk is large due to many features)
      cssCodeSplit: true, // Split CSS for better caching
      rollupOptions: {
        external: (id) => {
          // Externalize Capacitor plugins to prevent build-time resolution errors
          // They will be loaded dynamically at runtime only in Capacitor environment
          return id === '@capacitor/app' || id === '@capacitor/browser';
        },
        output: {
          // Optimize chunk names for better caching
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          manualChunks: (id) => {
            // Split node_modules into separate chunks for better caching
            if (id.includes('node_modules')) {
              // React and React DOM (most critical, load first)
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor';
              }
              // Google GenAI (large, separate chunk)
              if (id.includes('@google/genai')) {
                return 'google-vendor';
              }
              // Capacitor (only needed for mobile)
              if (id.includes('@capacitor')) {
                return 'capacitor-vendor';
              }
              // Other large vendor libraries
              if (id.includes('axios') || id.includes('swiper')) {
                return 'utils-vendor';
              }
              // All other node_modules
              return 'vendor';
            }
            // Split large components into separate chunks
            if (id.includes('components/') && (id.includes('LearningCenter') || id.includes('KundaliResult'))) {
              return 'components-large';
            }
          }
        }
      }
    }
  };
});