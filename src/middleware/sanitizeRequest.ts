import { Request, Response, NextFunction } from 'express';
import { sanitizeRequestData } from '../utils/sanitizer';

export const sanitizeRequest = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    if (req.body && typeof req.body === 'object') {
      const { data, sanitized, warnings } = sanitizeRequestData(req.body);
      req.body = data;
      // Optionally expose metadata to downstream handlers for logging/alerts
      if (sanitized) {
        (req as any)._sanitization = { sanitized, warnings };
      }
    }
    next();
  } catch (err) {
    next(err);
  }
};
