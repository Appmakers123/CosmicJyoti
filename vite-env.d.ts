/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_API_KEY?: string;
  readonly VITE_PROFILE_SUBMIT_URL?: string;
  readonly API_KEY?: string;
  readonly PERPLEXITY_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

