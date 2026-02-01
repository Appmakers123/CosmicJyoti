// TypeScript declarations for ExternalLink plugin
declare module '@capacitor/core' {
  interface PluginRegistry {
    ExternalLink: {
      openUrl(options: { url: string }): Promise<{ success: boolean }>;
    };
  }
}
