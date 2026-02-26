import { Request, Response, NextFunction } from 'express';
import { verifyConvexToken } from '../../infrastructure/convex/convex.auth';
import { UserRepository } from '../../infrastructure/database/user.repository';
import { UnauthorizedError, ForbiddenError } from '../../shared/errors';
import { logger } from '../../shared/logger';

// Extend Express Request to carry authenticated user context
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      convexUserId?: string;
      userRole?: string;
      sessionId?: string;
    }
  }
}

const userRepo = new UserRepository();

/**
 * Validates a Convex JWT from the Authorization header.
 * Maps the Convex sub claim to an internal PostgreSQL user record.
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authorization token is required');
    }

    const token = authHeader.slice(7);
    const payload = await verifyConvexToken(token);

    // Payload email may be used to map to internal user
    if (!payload.email) {
      throw new UnauthorizedError('Token missing email claim');
    }

    const user = await userRepo.findByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedError('User not found for this token');
    }

    req.userId = user.id;
    req.convexUserId = payload.sub;
    req.userRole = user.role;

    next();
  } catch (error) {
    logger.warn('Authentication failed', {
      error: error instanceof Error ? error.message : error,
      path: req.path,
    });
    next(error);
  }
}

/**
 * Requires the authenticated user to have ADMIN role.
 */
export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (req.userRole !== 'ADMIN') {
    return next(new ForbiddenError('Admin access required'));
  }
  next();
}
