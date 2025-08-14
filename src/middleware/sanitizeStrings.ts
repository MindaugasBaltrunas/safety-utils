import { Request, Response, NextFunction } from 'express';
import { SENSITIVE_FIELDS } from '../types/sanitization';

export const sanitizeStrings = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    if (req.body) {
      for (const [key, value] of Object.entries(req.body)) {
        if (typeof value === 'string' && !SENSITIVE_FIELDS.includes(key as any)) {
          req.body[key] = value.replace(/[<>]/g, '').trim();
        }
      }
    }
    next();
  } catch (err) {
    console.error('Error sanitizing string fields:', err);
    next(err);
  }
};
