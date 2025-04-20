import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

prisma.$on('query', (e) => {
  logger.debug('Query:', e);
});

prisma.$on('error', (e) => {
  logger.error('Prisma Error:', e);
});

prisma.$on('info', (e) => {
  logger.info('Prisma Info:', e);
});

prisma.$on('warn', (e) => {
  logger.warn('Prisma Warning:', e);
});

export { prisma }; 