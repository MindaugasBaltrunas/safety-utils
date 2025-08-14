export const SENSITIVE_FIELDS = [
  'password',
  'confirmPassword',
  'passwordConfirm',
  'adminPassword',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secret',
  'privateKey',
] as const;

export type SensitiveKey = typeof SENSITIVE_FIELDS[number];

export interface SanitizationConfig {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  stripIgnoreTag?: boolean;
  stripIgnoreTagBody?: boolean;
}

export interface SanitizationResult<T> {
  data: T;
  sanitized: boolean;
  warnings: string[];
}

export type SanitizableValue = string | number | boolean | null | undefined | Date | RegExp;
export type SanitizableObject = Record<string, any>;
export type SanitizableInput = SanitizableValue | SanitizableObject | Array<any>;
