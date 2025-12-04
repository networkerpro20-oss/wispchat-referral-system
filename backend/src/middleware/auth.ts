import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User } from '../types/express';

export interface JWTPayload {
  userId: string;
  email: string;
  rol: string;  // WispChat usa "rol" (sin "e")
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

    // Agregar usuario al request (convertir rol → role)
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.rol,  // ← Leer "rol" del token, asignar como "role"
      tenantId: decoded.tenantId,
      tenantDomain: decoded.tenantDomain,
    } as User;  // ← Cast explícito para evitar error TS

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
