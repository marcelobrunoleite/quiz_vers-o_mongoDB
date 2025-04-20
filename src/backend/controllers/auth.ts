import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { compare, hash } from 'bcryptjs';
import { sign, SignOptions } from 'jsonwebtoken';
import { AppError } from '../middlewares/errorHandler';
import { logger } from '../utils/logger';
import { AUTH_CONFIG } from '../config/auth';

const signToken = (payload: object): string => {
  return sign(
    payload,
    AUTH_CONFIG.JWT_SECRET,
    { expiresIn: '24h' } // Definindo diretamente aqui
  );
};

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { name, email, password, phone, whatsapp } = req.body;

      if (!name || !email || !password) {
        throw new AppError(400, 'Campos obrigatórios não preenchidos');
      }

      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new AppError(400, 'Formato de email inválido');
      }

      // Validar força da senha
      if (password.length < 8) {
        throw new AppError(400, 'A senha deve ter no mínimo 8 caracteres');
      }

      // Verificar se o usuário já existe
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        throw new AppError(400, 'Email já cadastrado');
      }

      // Criptografar senha
      const hashedPassword = await hash(password, AUTH_CONFIG.SALT_ROUNDS);

      // Criar usuário
      const user = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          phone,
          whatsapp,
          role: 'user'
        }
      });

      // Gerar token JWT
      const token = signToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // Remover senha dos dados do usuário
      const { password: _, ...userWithoutPassword } = user;

      logger.info('Usuário registrado com sucesso:', { userId: user.id });

      // Configurar cookie de autenticação
      res.cookie(AUTH_CONFIG.COOKIE_NAME, token, AUTH_CONFIG.COOKIE_OPTIONS);

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      logger.error('Erro no registro:', error);
      throw error;
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError(400, 'Email e senha são obrigatórios');
      }

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        throw new AppError(401, 'Email ou senha incorretos');
      }

      // Verificar senha
      const validPassword = await compare(password, user.password);
      if (!validPassword) {
        throw new AppError(401, 'Email ou senha incorretos');
      }

      // Gerar token JWT
      const token = signToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // Remover senha dos dados do usuário
      const { password: _, ...userWithoutPassword } = user;

      logger.info('Usuário logado com sucesso:', { userId: user.id });

      // Configurar cookie de autenticação
      res.cookie(AUTH_CONFIG.COOKIE_NAME, token, AUTH_CONFIG.COOKIE_OPTIONS);

      res.json({
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      logger.error('Erro no login:', error);
      throw error;
    }
  },

  async logout(req: Request, res: Response) {
    try {
      res.clearCookie(AUTH_CONFIG.COOKIE_NAME);
      res.json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
      logger.error('Erro no logout:', error);
      throw error;
    }
  },

  async refreshToken(req: Request, res: Response) {
    try {
      const user = req.user;
      
      if (!user) {
        throw new AppError(401, 'Usuário não autenticado');
      }

      const token = signToken({
        userId: user.userId,
        email: user.email,
        role: user.role
      });

      res.cookie(AUTH_CONFIG.COOKIE_NAME, token, AUTH_CONFIG.COOKIE_OPTIONS);

      res.json({ token });
    } catch (error) {
      logger.error('Erro ao renovar token:', error);
      throw error;
    }
  }
}; 