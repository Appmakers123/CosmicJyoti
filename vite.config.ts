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
  if (mode === 'development' && process.env.DEBUG_VITE_ENV === '1') {
    console.log('Loading environment variables. Gemini API_KEY present:', !!env.API_KEY);
  }
  return {
    plugins: [react(), capacitorPluginsPlugin()],
    optimizeDeps: {
      exclude: ['@capacitor/app', '@capacitor/browser'], // Exclude from pre-bundling in dev mode
    },
    // Base URL: use VITE_BASE_URL if set (e.g. /cosmicsutra/ for GitHub Pages project site).
    // Leave empty or '/' for root (user site or custom domain). CI can set process.env.VITE_BASE_URL.
    base: (env.VITE_BASE_URL || (process as any).env?.VITE_BASE_URL || env.BASE_URL || '/').replace(/\/*$/, '/') || '/', 
    define: {
      // Gemini API keys (single or comma-separated for rotation)
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.GEMINI_API_KEY || ''),
      'process.env.API_KEYS': JSON.stringify(env.API_KEYS || env.GEMINI_API_KEYS || ''),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.API_KEY || ''),
      'process.env.GEMINI_API_KEYS': JSON.stringify(env.GEMINI_API_KEYS || env.API_KEYS || ''),
      // Perplexity API keys (comma-separated for rotation)
      'process.env.PERPLEXITY_API_KEY': JSON.stringify(env.PERPLEXITY_API_KEY || ''),
      'process.env.PERPLEXITY_API_KEYS': JSON.stringify(env.PERPLEXITY_API_KEYS || env.PERPLEXITY_API_KEY || ''),
      // Google Maps API key for geocoding
      'import.meta.env.VITE_GOOGLE_API_KEY': JSON.stringify(env.VITE_GOOGLE_API_KEY || ''),
      // Free Astrology API keys (comma-separated) - multiple keys for redundancy
      'import.meta.env.VITE_ASTROLOGY_API_KEYS': JSON.stringify(env.ASTROLOGY_API_KEYS || env.VITE_ASTROLOGY_API_KEYS || ''),
      'import.meta.env.VITE_PROFILE_SUBMIT_URL': JSON.stringify(env.VITE_PROFILE_SUBMIT_URL || ''),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL || ''),
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(env.VITE_FIREBASE_API_KEY || ''),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(env.VITE_FIREBASE_PROJECT_ID || ''),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN || '')
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