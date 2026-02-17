/**
 * Sanitize HTML/SVG before using with dangerouslySetInnerHTML to prevent XSS.
 * - Strips script tags, event handlers (on*), and javascript:/data: in hrefs.
 */

const SCRIPT_REG = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const ON_EVENT_REG = /\s+on\w+\s*=\s*["'][^"']*["']/gi;
const HREF_JS_REG = /(\s)(href|xlink:href)\s*=\s*["']?\s*javascript:[^"'\s]*/gi;
const DATA_REG = /(\s)(href|xlink:href)\s*=\s*["']?\s*data:\s*[^"'\s]*/gi;

/**
 * Sanitize SVG string (e.g. chart SVGs from API) by removing scripts and event handlers.
 */
export function sanitizeSvg(svg: string | null | undefined): string {
  if (svg == null || typeof svg !== 'string') return '';
  let out = svg
    .replace(SCRIPT_REG, '')
    .replace(ON_EVENT_REG, '')
    .replace(HREF_JS_REG, '$1$2=""')
    .replace(DATA_REG, '$1$2=""');
  return out;
}

/**
 * Sanitize HTML content (e.g. blog post body). Removes script, event handlers, and dangerous URLs.
 * Keeps safe tags like p, strong, em, ul, ol, li, a (with safe href), br, h2, h3.
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (html == null || typeof html !== 'string') return '';
  let out = html
    .replace(SCRIPT_REG, '')
    .replace(ON_EVENT_REG, '')
    .replace(HREF_JS_REG, '$1$2=""')
    .replace(DATA_REG, '$1$2=""');
  // Optional: use DOMPurify when available for stricter sanitization
  try {
    const DOMPurify = (window as any).DOMPurify;
    if (typeof DOMPurify?.sanitize === 'function') {
      out = DOMPurify.sanitize(out, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'b', 'i', 'u', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'a', 'span', 'div'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
      });
    }
  } catch {
    // ignore
  }
  return out;
}
