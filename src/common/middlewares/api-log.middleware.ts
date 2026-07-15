import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../db.config';
import { verifyAccessToken } from '../../auth.config';

function extractUserId(authorization: string | undefined): string | null {
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!token) return null;

  try {
    return verifyAccessToken(token).userId;
  } catch {
    return null;
  }
}

export function apiLogMiddleware(req: Request, res: Response, next: NextFunction): void {
  res.on('finish', () => {
    prisma.apiLog
      .create({
        data: {
          userId: extractUserId(req.headers.authorization),
          method: req.method,
          path: req.originalUrl,
          ipAddress: req.ip ?? '',
          statusCode: res.statusCode,
        },
      })
      .catch((err: unknown) => {
        console.error('[apiLogMiddleware] failed to write log:', err);
      });
  });

  next();
}