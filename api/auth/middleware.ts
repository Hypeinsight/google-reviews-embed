import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    tenantId: string;
    email: string;
    role: string;
  };
}

/**
 * Verify JWT token from cookie or Authorization header
 */
export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    // Try to get token from cookie first, then Authorization header
    let token = req.cookies?.auth_token;

    if (!token) {
      const authHeader = req.headers['authorization'];
      token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET not configured');
      res.status(500).json({
        success: false,
        error: 'Server configuration error',
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret) as {
      userId: number;
      tenantId: string;
      email: string;
      role: string;
    };

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(403).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
}

/**
 * Generate JWT token
 */
export function generateToken(payload: {
  userId: number;
  tenantId: string;
  email: string;
  role: string;
}): string {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET not configured');
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(payload, jwtSecret, { expiresIn });
}

/**
 * Optional: Middleware to check if user is tenant owner
 */
export function requireOwner(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
    return;
  }

  if (req.user.role !== 'owner') {
    res.status(403).json({
      success: false,
      error: 'Owner privileges required',
    });
    return;
  }

  next();
}
