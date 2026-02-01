declare module '@capacitor/browser' {
  export interface BrowserOpenOptions {
    url: string;
    windowName?: string;
    toolbarColor?: string;
    presentationStyle?: 'fullscreen' | 'popover';
  }

  export interface BrowserPlugin {
    open(options: BrowserOpenOptions): Promise<void>;
    close(): Promise<void>;
  }

  export const Browser: BrowserPlugin;
}
