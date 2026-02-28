/**
 * Request the app to scroll to the main content (top of scroll container).
 * Use when a module shows new main content (e.g. form → result) so the user sees the content, not the footer.
 */
export function requestScrollToMain(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('cosmicjyoti-scroll-to-top'));
}
