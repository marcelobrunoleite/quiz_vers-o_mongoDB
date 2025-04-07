const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');
const { logger } = require('../app/config/logger');

const prisma = new PrismaClient();

async function migrateQuestions() {
  try {
    // Ler arquivo JSON
    const jsonData = await fs.readFile(path.join(__dirname, '../transito.json'), 'utf8');
    const questions = JSON.parse(jsonData);

    logger.info(`Iniciando migração de ${questions.length} questões para MongoDB`);

    // Limpar coleção existente
    await prisma.question.deleteMany({});

    // Migrar questões em lotes de 100
    const batchSize = 100;
    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize).map(question => ({
        tema: question.tema,
        pergunta: question.pergunta,
        alternativas: question.alternativas,
        resposta_correta: question.resposta_correta,
        explicacao: question.explicacao,
        dificuldade: question.dificuldade
      }));

      await prisma.question.createMany({
        data: batch,
        skipDuplicates: true
      });

      logger.info(`Migrado lote ${i/batchSize + 1} de ${Math.ceil(questions.length/batchSize)}`);
    }

    const totalMigrated = await prisma.question.count();
    logger.info(`Migração concluída! Total de ${totalMigrated} questões migradas.`);

  } catch (error) {
    logger.error('Erro durante a migração:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar migração
if (require.main === module) {
  migrateQuestions()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Erro na migração:', error);
      process.exit(1);
    });
} 