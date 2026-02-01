/**
 * Firebase Cloud Functions - Ask Rishi proxy (fixes CORS)
 * Uses VITE_FIREBASE_* env vars. When set, geminiService calls this instead of direct Gemini.
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFunctions, httpsCallable, Functions } from 'firebase/functions';

let app: FirebaseApp | null = null;
let functions: Functions | null = null;

function getFirebaseConfig() {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  if (!apiKey || !projectId) return null;
  return {
    apiKey,
    projectId,
    authDomain: authDomain || `${projectId}.firebaseapp.com`,
  };
}

function initFirebase(): { app: FirebaseApp; functions: Functions } | null {
  const config = getFirebaseConfig();
  if (!config) return null;
  if (getApps().length > 0) {
    app = getApps()[0] as FirebaseApp;
  } else {
    app = initializeApp(config);
  }
  functions = getFunctions(app);
  return app && functions ? { app, functions } : null;
}

export function hasFirebaseConfig(): boolean {
  return !!getFirebaseConfig();
}

export async function askRishiFromFirebase(
  prompt: string,
  language: string = 'en',
  context?: string,
  persona: string = 'general'
): Promise<{ text: string; sources: { title: string; uri: string }[] }> {
  const fb = initFirebase();
  if (!fb || !fb.functions) {
    throw new Error('Firebase not configured');
  }
  const askRishi = httpsCallable<{ prompt: string; language: string; context?: string; persona: string }, { text: string; sources: unknown[] }>(
    fb.functions,
    'askRishi'
  );
  const result = await askRishi({ prompt, language, context, persona });
  const data = result.data;
  return {
    text: data?.text || 'The cosmic library is currently undergoing maintenance.',
    sources: (data?.sources || []).map((s: any) => ({ title: s?.title || 'Source', uri: s?.uri || '#' })),
  };
}
