const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const data = require('./transito.json');

async function main() {
  console.log('Iniciando migração dos dados...');

  for (const question of data) {
    try {
      await prisma.question.create({
        data: {
          tema: question.tema,
          pergunta: question.pergunta,
          alternativas: question.alternativas,
          resposta_correta: question.resposta_correta,
          explicacao: question.explicacao,
          dificuldade: question.dificuldade
        }
      });
      console.log(`Questão "${question.pergunta.substring(0, 30)}..." importada com sucesso.`);
    } catch (error) {
      console.error(`Erro ao importar questão: ${error.message}`);
    }
  }

  console.log('Migração concluída!');
}

main()
  .catch((e) => {
    console.error('Erro durante a migração:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 