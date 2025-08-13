import { sanitizeObject, sanitizeString } from '../xssGuard';

export const sanitizeValue = (value: string): string => sanitizeString(value);

export const sanitizeValues = (values: string[]): string[] =>
  values.map(sanitizeString);

export const sanitizeFields = <T extends Record<string, any>>(
  data: T,
  fields?: (keyof T)[]
): T => {
  const keysToSanitize = fields || Object.keys(data);

  return Object.keys(data).reduce((result, key) => {
    const value = data[key];
    if (keysToSanitize.includes(key as keyof T) && typeof value === 'string') {
      return { ...result, [key]: sanitizeString(value) };
    }
    return { ...result, [key]: value };
  }, {} as T);
};

export const sanitizeRequestData = <T extends object>(
  data: T,
  sensitiveKeys: readonly string[]
): T => {
  const { extractSensitiveValues, removeSensitiveFields, restoreSensitiveValues } = require('../utils/sensitive');
  const sensitiveValues = extractSensitiveValues(data, sensitiveKeys);
  const preparedData = removeSensitiveFields(data, sensitiveKeys);
  const sanitizedData = sanitizeObject(preparedData) as T;
  return restoreSensitiveValues(sanitizedData, sensitiveValues);
};
