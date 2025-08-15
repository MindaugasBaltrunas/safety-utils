import DOMPurify from 'dompurify';

/**
 * Strip all HTML tags from a string.
 */
export const sanitizeString = (value: string): string => {
  if (!value) return '';

  try {
    return DOMPurify.sanitize(value, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  } catch (error) {
    console.error('XSS sanitize error:', error);
    return value.replace(/<[^>]*>/g, '');
  }
};

/**
 * Sanitize HTML while allowing a configurable set of tags and attributes.
 */
export const sanitizeHTML = (
  html: string,
  allowedTags: string[] = ['b', 'i', 'u', 'p', 'span', 'br']
): string => {
  if (!html) return '';

  try {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: ['class', 'style']
    });
  } catch (error) {
    console.error('HTML sanitize error:', error);
    return sanitizeString(html);
  }
};

/**
 * Recursively sanitize strings in objects or arrays.
 */
export const sanitizeObject = <T>(obj: T): T => {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => {
      if (typeof item === 'string') {
        // Apply the same sanitization to array elements
        if (/<script\b[^>]*>(.*?)<\/script>/gi.test(item)) {
          return '';
        }
        return item.replace(/<[^>]*>/g, '');
      }
      if (item && typeof item === 'object') {
        return sanitizeObject(item);
      }
      return item;
    }) as unknown as T;
  }

  return Object.fromEntries(
    Object.entries(obj as Record<string, any>).map(([key, value]) => {
      if (typeof value === 'string') {
        if (/<script\b[^>]*>(.*?)<\/script>/gi.test(value)) {
          return [key, ''];
        }
        return [key, value.replace(/<[^>]*>/g, '')];
      }
      if (value && typeof value === 'object') {
        return [key, sanitizeObject(value)];
      }
      return [key, value];
    })
  ) as T;
};


/**
 * Escape HTML entities in a string.
 */
export const escapeHTML = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Sanitize URLs to allow only http, https, or mailto. Default to '#' if invalid.
 */
export const sanitizeUrl = (url: string): string => {
  if (!url) return '#';

  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) {
    return url;
  }

  // Simple domain pattern fallback
  if (/^[\w.-]+\.[\w\.-]+/.test(url)) {
    return `https://${url}`;
  }

  return '#';
};

export const xssGuard = {
  sanitizeString,
  sanitizeHTML,
  sanitizeObject,
  escapeHTML,
  sanitizeUrl
};
