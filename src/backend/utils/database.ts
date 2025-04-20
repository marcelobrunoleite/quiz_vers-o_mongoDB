import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

export async function connectDB(prisma: PrismaClient, retries = 5): Promise<void> {
  while (retries > 0) {
    try {
      logger.info('Tentando conectar ao banco de dados...');
      await prisma.$connect();
      logger.info('✅ Conectado ao banco de dados com sucesso!');
      return;
    } catch (error) {
      retries--;
      logger.error(`❌ Erro ao conectar ao banco de dados. Tentativas restantes: ${retries}`, error);
      
      if (retries === 0) {
        throw error;
      }
      
      // Esperar 5 segundos antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
} 