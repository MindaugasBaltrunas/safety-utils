import { Request, Response, NextFunction } from 'express';
import { sanitizeHtml } from '../utils/html';

export const sanitizeHtmlContent = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (req.body?.htmlContent) {
      req.body.htmlContent = sanitizeHtml(req.body.htmlContent);
    }
    next();
  } catch (error) {
    console.error('Error sanitizing HTML content:', error);
    next(error);
  }
};
