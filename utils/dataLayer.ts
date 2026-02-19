/**
 * GTM / GA4 dataLayer helpers. Push events for tool opens, share, remind, article read.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function pushDataLayer(event: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !window.dataLayer) return;
  window.dataLayer.push({ event, ...params });
}

export function trackToolOpen(tool: string): void {
  pushDataLayer('tool_open', { tool });
}

export function trackShare(contentType: string, method?: string): void {
  pushDataLayer('share', { content_type: contentType, share_method: method });
}

export function trackRemind(feature: string, when?: string): void {
  pushDataLayer('remind_click', { feature, when });
}

export function trackArticleRead(articleId: string, title?: string): void {
  pushDataLayer('article_read', { article_id: articleId, article_title: title });
}

export function trackReviewPromptShown(source: string): void {
  pushDataLayer('review_prompt_shown', { source });
}

export function trackReviewPromptDismissed(): void {
  pushDataLayer('review_prompt_dismissed', {});
}
