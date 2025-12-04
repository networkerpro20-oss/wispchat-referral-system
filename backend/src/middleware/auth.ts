import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface JWTPayload {
  userId: string;
  email: string;
  rol: string;  // ← CAMBIO: "rol" (sin "e") como en WispChat
  tenantId: string;
  tenantDomain: string;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const token = authHeader.substring(7);

    // Verificar token
    const decoded = jwt.verify(token, config.wispchatJwtSecret) as JWTPayload;

    // Agregar usuario al request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.rol,  // ← CAMBIO: usar "rol" del token pero mantener "role" en req.user
      tenantId: decoded.tenantId,
      tenantDomain: decoded.tenantDomain,
    };

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message,
    });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({
      success: false,
      message: 'Insufficient permissions',
    });
  }

  next();
};
