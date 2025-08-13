import { Request, Response, NextFunction } from 'express';
import { sanitizeRequestData } from '../utils/sanitize';
import { SENSITIVE_FIELDS } from '../constants/sensitiveFields';

export const sanitizeRequest = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeRequestData(req.body, SENSITIVE_FIELDS);
    }
    next();
  } catch (error) {
    console.error('Error in comprehensive request sanitization:', error);
    next(error);
  }
};
