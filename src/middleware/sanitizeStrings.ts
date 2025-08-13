import { Request, Response, NextFunction } from 'express';
import { SENSITIVE_FIELDS } from '../constants/sensitiveFields';

export const sanitizeStrings = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (req.body) {
      Object.entries(req.body).forEach(([key, value]) => {
        if (typeof value === 'string' && !SENSITIVE_FIELDS.includes(key as any)) {
          req.body[key] = value.replace(/[<>]/g, '').trim();
        }
      });
    }
    next();
  } catch (error) {
    console.error('Error sanitizing string fields:', error);
    next(error);
  }
};
