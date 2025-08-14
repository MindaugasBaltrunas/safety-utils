import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { logger } from '../logger';
import {
  SENSITIVE_FIELDS,
  SensitiveKey,
  SanitizationConfig,
  SanitizationResult,
} from '../types/sanitization';
import { BASE_CONFIG as DEFAULT_CONFIG } from '../config/sanitizationConfigs';

const { window } = new JSDOM('');
const DOMPurify = createDOMPurify(window);

export const looksLikeHtml = (value: string): boolean =>
  /<\/?[a-z][\s\S]*>/i.test(value.trim());

export const isDangerous = (value: string): boolean => {
  const patterns = [
    /javascript:/i,
    /on\w+\s*=/i,
    /<script/i,
    /eval\s*\(/i,
    /expression\s*\(/i,
  ];
  return patterns.some(p => p.test(value));
};

export const sanitizeString = (
  value: string,
  config: SanitizationConfig = DEFAULT_CONFIG
): string => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return '';

  if (looksLikeHtml(trimmed)) {
    const allowedAttrs = Object.values(config.allowedAttributes || {}).flat();
    const sanitized = DOMPurify.sanitize(trimmed, {
      ALLOWED_TAGS: config.allowedTags,
      ALLOWED_ATTR: allowedAttrs,
    });
    if (sanitized !== trimmed) {
      logger.debug('HTML content sanitized', {
        dangerous_content_removed: isDangerous(trimmed),
      });
    }
    return sanitized;
  }

  return trimmed
    .replace(/[<>]/g, '')
    .replace(/\0/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
};

export const extractSensitiveValues = <T extends Record<string, any>>(data: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(data).filter(([k]) => SENSITIVE_FIELDS.includes(k as SensitiveKey))
  ) as Partial<T>;

export const removeSensitiveFields = <T extends Record<string, any>>(data: T): T =>
  Object.fromEntries(
    Object.entries(data).map(([k, v]) =>
      SENSITIVE_FIELDS.includes(k as SensitiveKey) ? [k, ''] : [k, v]
    )
  ) as T;

export const restoreSensitiveValues = <T extends Record<string, any>>(
  sanitizedData: T,
  sensitiveValues: Partial<T>
): T => ({ ...sanitizedData, ...sensitiveValues });

export const sanitizeObject = <T>(
  input: T,
  config: SanitizationConfig = DEFAULT_CONFIG
): SanitizationResult<T> => {
  let sanitized = false;
  const warnings: string[] = [];

  const sanitizeValue = (val: any, path = ''): any => {
    if (val === null || val === undefined) return val;
    if (typeof val === 'string') {
      const cleaned = sanitizeString(val, config);
      if (val !== cleaned) {
        sanitized = true;
        if (isDangerous(val)) warnings.push(`Dangerous content removed from: ${path}`);
      }
      return cleaned;
    }
    if (Array.isArray(val)) return val.map((v, i) => sanitizeValue(v, `${path}[${i}]`));
    if (typeof val === 'object' && !(val instanceof Date || val instanceof RegExp)) {
      return Object.fromEntries(
        Object.entries(val).map(([k, v]) =>
          SENSITIVE_FIELDS.includes(k as SensitiveKey)
            ? [k, v]
            : [k, sanitizeValue(v, path ? `${path}.${k}` : k)]
        )
      );
    }
    return val;
  };

  return { data: sanitizeValue(input), sanitized, warnings };
};

export const sanitizeRequestData = <T extends Record<string, any>>(
  data: T,
  config?: SanitizationConfig
): SanitizationResult<T> => {
  const sensitiveValues = extractSensitiveValues(data);
  const withoutSensitive = removeSensitiveFields(data);
  const result = sanitizeObject(withoutSensitive, config);
  return { data: restoreSensitiveValues(result.data, sensitiveValues), sanitized: result.sanitized, warnings: result.warnings };
};

export const quickSanitize = <T extends Record<string, any>>(data: T): T =>
  sanitizeRequestData(data).data;
