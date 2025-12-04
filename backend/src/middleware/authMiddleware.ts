import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Middleware de autenticación para sistema de referidos
 * Valida tokens JWT de WispChat
 */

interface JWTPayload {
  id: string;
  email: string;
  rol: string;
  tenantId: string;
  numeroCliente?: string;
  iat?: number;
  exp?: number;
}

// Extender Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'wispchat-secret-key-2024';

/**
 * Middleware que valida el token JWT de WispChat
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Obtener token del header o query param
    const authHeader = req.headers.authorization;
    const tokenFromQuery = req.query.token as string;
    
    const token = authHeader?.replace('Bearer ', '') || tokenFromQuery;

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Token de autenticación requerido'
        }
      });
      return;
    }

    // 2. Verificar y decodificar el token
    let decoded: JWTPayload;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error: any) {
      console.error('[AUTH] Error verificando token:', error.message);
      
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token inválido o expirado'
        }
      });
      return;
    }

    // 3. Verificar que el usuario tenga rol de admin o supervisor
    if (!['admin', 'supervisor'].includes(decoded.rol)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Acceso denegado. Solo administradores y supervisores.'
        }
      });
      return;
    }

    // 4. Agregar user al request
    req.user = decoded;

    console.log('[AUTH] ✅ Usuario autenticado:', {
      email: decoded.email,
      rol: decoded.rol,
      id: decoded.id
    });

    next();
  } catch (error: any) {
    console.error('[AUTH] Error en middleware:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Error en autenticación'
      }
    });
  }
};

/**
 * Middleware específico para admin (solo admin, no supervisor)
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.rol !== 'admin') {
    res.status(403).json({
      success: false,
      error: {
        code: 'ADMIN_ONLY',
        message: 'Esta acción requiere permisos de administrador'
      }
    });
    return;
  }
  
  next();
};

export default { authenticateToken, requireAdmin };
