/**
 * Touch Handler - Ensures single-finger scrolling works on all devices
 * Prevents default touch behaviors that interfere with scrolling
 */

/**
 * Initialize touch event handlers to ensure single-finger scrolling works
 * This prevents issues where two-finger scrolling is required
 */
export function initTouchHandlers(): void {
  if (typeof window === 'undefined') return;

  // Prevent default touch behaviors that might interfere with scrolling
  let touchStartX = 0;
  let touchStartY = 0;
  let isScrolling = false;

  // Handle touch start
  document.addEventListener('touchstart', (e: TouchEvent) => {
    if (e.touches.length === 1) {
      // Single touch - allow scrolling
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      isScrolling = false;
    } else if (e.touches.length > 1) {
      // Multi-touch - prevent default to avoid zoom/other gestures
      // But don't prevent if user is clearly trying to scroll
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      // If touches are far apart, likely pinch zoom - allow it
      if (distance > 50) {
        return; // Allow pinch zoom
      }
    }
  }, { passive: true });

  // Handle touch move - detect scrolling
  document.addEventListener('touchmove', (e: TouchEvent) => {
    if (e.touches.length === 1 && touchStartX !== 0 && touchStartY !== 0) {
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - touchStartX);
      const deltaY = Math.abs(touch.clientY - touchStartY);
      
      // If movement is primarily vertical or horizontal, it's scrolling
      if (deltaY > 10 || deltaX > 10) {
        isScrolling = true;
      }
    }
  }, { passive: true });

  // Handle touch end
  document.addEventListener('touchend', () => {
    touchStartX = 0;
    touchStartY = 0;
    isScrolling = false;
  }, { passive: true });

  // Ensure CSS touch-action is applied to all elements
  // This is a fallback in case CSS doesn't load properly
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
      /* Force touch-action for all elements */
      * {
        touch-action: pan-y pan-x !important;
      }
      a, button, input, select, textarea {
        touch-action: manipulation !important;
      }
      /* Scrollable containers */
      [class*="overflow"], .overflow-auto, .overflow-y-auto, .custom-scrollbar {
        touch-action: pan-y pan-x !important;
        -webkit-overflow-scrolling: touch !important;
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Apply touch-action styles to dynamically created elements
 */
export function applyTouchStyles(element: HTMLElement): void {
  if (!element) return;
  
  // Apply touch-action to the element
  element.style.touchAction = 'pan-y pan-x';
  // Apply webkit overflow scrolling (TypeScript doesn't recognize this property)
  (element.style as any).webkitOverflowScrolling = 'touch';
  
  // Apply to all children
  const children = element.querySelectorAll('*');
  children.forEach((child) => {
    if (child instanceof HTMLElement) {
      // Check if it's an interactive element
      const tagName = child.tagName.toLowerCase();
      if (['a', 'button', 'input', 'select', 'textarea'].includes(tagName)) {
        child.style.touchAction = 'manipulation';
      } else {
        child.style.touchAction = 'pan-y pan-x';
      }
    }
  });
}
