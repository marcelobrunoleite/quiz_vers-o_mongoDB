import { PrismaClient } from '@prisma/client';
import { logger } from './utils/logger';

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    // Teste de conexão
    await prisma.$connect();
    logger.info('✅ Conexão com o banco de dados estabelecida');

    // Listar todos os usuários
    const users = await prisma.user.findMany();
    logger.info(`Total de usuários: ${users.length}`);
    users.forEach(user => {
      logger.info(`Usuário: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
    });

    // Listar todas as questões
    const questions = await prisma.question.findMany();
    logger.info(`Total de questões: ${questions.length}`);

    // Listar todos os resultados de testes
    const testResults = await prisma.testResult.findMany({
      include: {
        user: true,
        question: true
      }
    });
    logger.info(`Total de resultados de testes: ${testResults.length}`);

  } catch (error) {
    logger.error('❌ Erro ao testar banco de dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase(); 