import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middlewares/auth';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Rota para obter perfil do usuário
router.get('/profile', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const userId = req.user.userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        whatsapp: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }

    res.json(user);
  } catch (error) {
    logger.error('Erro ao obter perfil:', error);
    res.status(500).json({ message: 'Erro ao obter perfil' });
  }
});

// Rota para atualizar perfil do usuário
router.put('/profile', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const userId = req.user.userId;
    const { name, phone, whatsapp } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
        whatsapp
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        whatsapp: true,
        role: true
      }
    });

    res.json(user);
  } catch (error) {
    logger.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro ao atualizar perfil' });
  }
});

// Rota para alterar senha
router.put('/change-password', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);

    if (!validPassword) {
      res.status(401).json({ message: 'Senha atual incorreta' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    logger.error('Erro ao alterar senha:', error);
    res.status(500).json({ message: 'Erro ao alterar senha' });
  }
});

export default router; 