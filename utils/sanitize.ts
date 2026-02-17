/**
 * XSS mitigation: sanitize HTML/SVG before using dangerouslySetInnerHTML.
 * Uses DOMPurify to allow safe tags and attributes while stripping script/event handlers.
 */

import DOMPurify from 'dompurify';

/** Sanitize HTML for article/blog content (headings, paragraphs, lists, links, etc.) */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'b', 'i', 'u', 'h1', 'h2', 'h3', 'h4',
      'ul', 'ol', 'li', 'a', 'blockquote', 'span', 'div',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ADD_ATTR: ['target', 'rel'],
  });
}

/** Sanitize SVG (e.g. chart markup from backend). Allows SVG elements and safe attributes. */
export function sanitizeSvg(svg: string): string {
  if (!svg || typeof svg !== 'string') return '';
  return DOMPurify.sanitize(svg, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ALLOWED_ATTR: ['viewBox', 'width', 'height', 'x', 'y', 'transform', 'd', 'fill', 'stroke', 'class', 'xmlns', 'style'],
  });
}
