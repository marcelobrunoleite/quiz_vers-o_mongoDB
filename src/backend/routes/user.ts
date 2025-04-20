import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';
import { authenticateToken } from '../middlewares/auth';
import bcrypt from 'bcryptjs';

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Obter perfil do usuário
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    logger.error('Erro ao obter perfil:', error);
    res.status(500).json({ error: 'Erro ao obter perfil do usuário' });
  }
});

// Atualizar perfil do usuário
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const { name } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.json(user);
  } catch (error) {
    logger.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil do usuário' });
  }
});

// Alterar senha
router.put('/change-password', async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const { currentPassword, newPassword } = req.body;

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar senha atual
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    logger.error('Erro ao alterar senha:', error);
    res.status(500).json({ error: 'Erro ao alterar senha' });
  }
});

export default router; 