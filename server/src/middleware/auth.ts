import type { NextFunction, Request, Response } from 'express';
import { AuthService, type AuthenticatedUser } from '../services/auth.ts';

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : undefined;

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const user = await AuthService.getUserFromToken(token);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  req.user = user;
  next();
}
