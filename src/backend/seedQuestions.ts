import { PrismaClient } from '@prisma/client';
import { logger } from './utils/logger';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface Questao {
  id: string;
  tema: string;
  pergunta: string;
  alternativas: {
    a: string;
    b: string;
    c: string;
    d: string;
    e: string;
  };
  resposta_correta: string;
  explicacao: string;
  dificuldade: string;
}

async function seedQuestions() {
  try {
    // Ler o arquivo de questões
    const questoesJson = fs.readFileSync(
      path.join(process.cwd(), 'transito.json'),
      'utf-8'
    );
    const questoes: Questao[] = JSON.parse(questoesJson);

    // Limpar questões existentes
    await prisma.testResult.deleteMany({}); // Primeiro remove os resultados de teste
    await prisma.question.deleteMany({}); // Depois remove as questões
    logger.info('Banco de dados limpo');

    // Inserir novas questões
    let questoesInseridas = 0;
    for (const questao of questoes) {
      await prisma.question.create({
        data: {
          tema: questao.tema,
          pergunta: questao.pergunta,
          alternativas: questao.alternativas,
          resposta_correta: questao.resposta_correta,
          explicacao: questao.explicacao,
          dificuldade: questao.dificuldade.toLowerCase()
        }
      });
      questoesInseridas++;
    }

    logger.info(`✅ ${questoesInseridas} questões inseridas com sucesso`);

    // Verificar questões inseridas
    const questoesNoBanco = await prisma.question.findMany();
    logger.info(`Total de questões no banco: ${questoesNoBanco.length}`);
    
    // Mostrar distribuição por tema
    const temas = questoesNoBanco.reduce((acc, q) => {
      acc[q.tema] = (acc[q.tema] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    logger.info('Distribuição de questões por tema:');
    Object.entries(temas).forEach(([tema, quantidade]) => {
      logger.info(`${tema}: ${quantidade} questões`);
    });

  } catch (error) {
    logger.error('❌ Erro ao inserir questões:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedQuestions(); 