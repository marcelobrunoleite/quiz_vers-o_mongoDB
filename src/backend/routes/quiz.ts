import { Router, Request, Response } from 'express';
import { PrismaClient, QuizResult } from '@prisma/client';
import { logger } from '../utils/logger';
import { authenticate } from '../middlewares/auth';

const router = Router();
const prisma = new PrismaClient();

// Rota para obter todas as questões
router.get('/questoes', async (req: Request, res: Response): Promise<void> => {
  try {
    const questoes = await prisma.question.findMany();
    res.json(questoes);
  } catch (error) {
    logger.error('Erro ao buscar questões:', error);
    res.status(500).json({ error: 'Erro ao buscar questões' });
  }
});

// Rota para obter uma questão específica
router.get('/questoes/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const questao = await prisma.question.findUnique({
      where: { id }
    });

    if (!questao) {
      res.status(404).json({ error: 'Questão não encontrada' });
      return;
    }

    res.json(questao);
  } catch (error) {
    logger.error('Erro ao buscar questão:', error);
    res.status(500).json({ error: 'Erro ao buscar questão' });
  }
});

// Rota para salvar resultado do quiz
router.post('/resultado', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { score, totalQuestions, correctAnswers, mode, timeSpent } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const result = await prisma.quizResult.create({
      data: {
        userId,
        score,
        totalQuestions,
        correctAnswers,
        mode,
        timeSpent,
        date: new Date()
      }
    });

    res.status(201).json(result);
  } catch (error) {
    logger.error('Erro ao salvar resultado:', error);
    res.status(500).json({ error: 'Erro ao salvar resultado' });
  }
});

// Rota para obter ranking geral
router.get('/ranking', async (req: Request, res: Response): Promise<void> => {
  try {
    const results = await prisma.quizResult.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        score: 'desc'
      },
      take: 10
    });

    const ranking = results.map((result: QuizResult & { user: { name: string; email: string } }) => ({
      userId: result.userId,
      name: result.user.name,
      score: result.score,
      mode: result.mode,
      date: result.date
    }));

    res.json(ranking);
  } catch (error) {
    logger.error('Erro ao buscar ranking:', error);
    res.status(500).json({ error: 'Erro ao buscar ranking' });
  }
});

// Rota para obter estatísticas do usuário
router.get('/estatisticas', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const results = await prisma.quizResult.findMany({
      where: {
        userId
      },
      orderBy: {
        date: 'desc'
      }
    });

    const stats = {
      totalQuizzes: results.length,
      averageScore: results.reduce((acc: number, curr: QuizResult) => acc + curr.score, 0) / results.length || 0,
      bestScore: Math.max(...results.map((r: QuizResult) => r.score), 0),
      recentResults: results.slice(0, 6)
    };

    res.json(stats);
  } catch (error) {
    logger.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

export default router; 