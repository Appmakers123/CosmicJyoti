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
  // In CI there are no .env files; workflow sets process.env. Fallback so secrets are used in build.
  const p = (process as any).env || {};
  const get = (key: string) => (env[key] ?? p[key] ?? '') as string;
  // Never log API key presence in production; only in dev when explicitly requested
  if (mode === 'development' && process.env.DEBUG_VITE_ENV === '1') {
    console.log('Loading environment variables. Gemini API_KEY present:', !!(get('API_KEY') || get('GEMINI_API_KEY')));
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
      // Gemini API keys (from .env or process.env in CI)
      'process.env.API_KEY': JSON.stringify(get('API_KEY') || get('GEMINI_API_KEY') || ''),
      'process.env.API_KEYS': JSON.stringify(get('API_KEYS') || get('GEMINI_API_KEYS') || ''),
      'process.env.GEMINI_API_KEY': JSON.stringify(get('GEMINI_API_KEY') || get('API_KEY') || ''),
      'process.env.GEMINI_API_KEYS': JSON.stringify(get('GEMINI_API_KEYS') || get('API_KEYS') || ''),
      // Perplexity API keys
      'process.env.PERPLEXITY_API_KEY': JSON.stringify(get('PERPLEXITY_API_KEY') || ''),
      'process.env.PERPLEXITY_API_KEYS': JSON.stringify(get('PERPLEXITY_API_KEYS') || get('PERPLEXITY_API_KEY') || ''),
      // VITE_* and others
      'import.meta.env.VITE_GOOGLE_API_KEY': JSON.stringify(get('VITE_GOOGLE_API_KEY') || ''),
      'import.meta.env.VITE_ASTROLOGY_API_KEYS': JSON.stringify(get('ASTROLOGY_API_KEYS') || get('VITE_ASTROLOGY_API_KEYS') || ''),
      'import.meta.env.VITE_PROFILE_SUBMIT_URL': JSON.stringify(get('VITE_PROFILE_SUBMIT_URL') || ''),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(get('VITE_API_BASE_URL') || ''),
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(get('VITE_FIREBASE_API_KEY') || ''),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(get('VITE_FIREBASE_PROJECT_ID') || ''),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(get('VITE_FIREBASE_AUTH_DOMAIN') || '')
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: 'esbuild',
      chunkSizeWarningLimit: 800, // Warn if chunks exceed 800KB; route components are code-split via manualChunks
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
            // Split large / route components into separate chunks to keep main bundle under 600KB
            if (id.includes('components/')) {
              if (id.includes('LearningCenter') || id.includes('KundaliResult') || id.includes('NumerologyGuide') || id.includes('PalmistryGuide') || id.includes('KundaliBasics') || id.includes('PlanetsHouses') || id.includes('ZodiacSignsGuide') || id.includes('NakshatraLibrary') || id.includes('StarLegends')) {
                return 'chunk-learning';
              }
              if (id.includes('MantraLab') || id.includes('YantraLab') || id.includes('CosmicHealthAI') || id.includes('RudrakshLab') || id.includes('VastuLab') || id.includes('GemstoneLab')) {
                return 'chunk-labs';
              }
              if (id.includes('TarotReading') || id.includes('PalmReading') || id.includes('FaceReading') || id.includes('DreamInterpreter') || id.includes('Numerology') || id.includes('MatchMaking') || id.includes('CompatibilityTab')) {
                return 'chunk-readings';
              }
              if (id.includes('MuhuratLab') || id.includes('Varshphal') || id.includes('NameSuggestions') || id.includes('UpayRemedies') || id.includes('Disha') || id.includes('BirthstoneByDob') || id.includes('LalKitab') || id.includes('SadesatiDashaCalculator') || id.includes('PrashnaKundali') || id.includes('MobileNumerology')) {
                return 'chunk-tools';
              }
              if (id.includes('LoshuGrid') || id.includes('IChing') || id.includes('Runes') || id.includes('SignatureAnalysis') || id.includes('AshtaSiddhis') || id.includes('RasaShastra') || id.includes('AstroGames') || id.includes('BookAppointment')) {
                return 'chunk-other';
              }
            }
          }
        }
      }
    }
  };
});