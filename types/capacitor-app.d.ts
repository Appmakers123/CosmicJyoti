// Type declaration for optional @capacitor/app module
// This allows TypeScript to compile even when the package is not installed
declare module '@capacitor/app' {
  export interface OpenUrlOptions {
    url: string;
  }
  
  export interface OpenUrlResult {
    completed: boolean;
  }

  export interface AppPlugin {
    exitApp(): Promise<void>;
    addListener(event: string, handler: () => void): Promise<{ remove: () => Promise<void> }>;
    openUrl(options: OpenUrlOptions): Promise<OpenUrlResult>;
  }
  export const App: AppPlugin;
}
