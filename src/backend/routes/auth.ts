import express from 'express';
import { Request, Response } from 'express-serve-static-core';
import { authController } from '../controllers/auth';
import { authenticate } from '../middlewares/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// Rotas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Rotas protegidas
router.post('/refresh-token', authenticate, authController.refreshToken);

router.get('/validate', authenticate, async (req: express.Request, res: express.Response) => {
  try {
    // O middleware authenticate já verificou o token
    // Se chegou aqui, o token é válido
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ valid: false, message: 'Usuário não encontrado' });
    }

    return res.json({
      valid: true,
      user
    });
  } catch (error) {
    console.error('Erro ao validar token:', error);
    return res.status(500).json({ valid: false, message: 'Erro interno do servidor' });
  }
});

export default router; 