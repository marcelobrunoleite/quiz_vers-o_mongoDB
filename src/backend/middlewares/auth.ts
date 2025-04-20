import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { AUTH_CONFIG } from '../config/auth';

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  exp?: number;
  iat?: number;
}

interface AuthenticatedRequest extends Request {
  user?: DecodedToken;
}

// Estendendo o tipo Request para incluir o user
declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = req.cookies?.[AUTH_CONFIG.COOKIE_NAME] || 
                 (authHeader && authHeader.startsWith(AUTH_CONFIG.TOKEN_PREFIX) ? 
                  authHeader.split(' ')[1] : null);
    
    if (!token) {
      res.status(401).json({ message: 'Token não fornecido' });
      return;
    }

    try {
      const decoded = jwt.verify(token, AUTH_CONFIG.JWT_SECRET) as DecodedToken;

      req.user = decoded;
      
      // Renovar o token se estiver próximo de expirar
      const tokenData = jwt.decode(token) as DecodedToken;
      const now = Math.floor(Date.now() / 1000);
      
      if (tokenData.exp && tokenData.exp - now < 3600) { // Se faltar menos de 1 hora para expirar
        const newToken = jwt.sign(
          { 
            userId: decoded.userId, 
            email: decoded.email, 
            role: decoded.role 
          },
          AUTH_CONFIG.JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        res.cookie(AUTH_CONFIG.COOKIE_NAME, newToken, AUTH_CONFIG.COOKIE_OPTIONS);
        res.setHeader('New-Token', newToken);
      }

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ message: 'Token expirado' });
      } else {
        res.status(401).json({ message: 'Token inválido' });
      }
      return;
    }
  } catch (error) {
    logger.error('Erro na autenticação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Não autorizado' });
      return;
    }

    if (roles.length && !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Acesso negado' });
      return;
    }

    next();
  };
}; 