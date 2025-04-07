const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const questions = await prisma.question.findMany();
    console.log('Total de questões no banco:', questions.length);
    
    if (questions.length > 0) {
      console.log('\nPrimeira questão como exemplo:');
      console.log(JSON.stringify(questions[0], null, 2));
    }
  } catch (error) {
    console.error('Erro ao consultar dados:', error);
  }
}

main()
  .catch((e) => {
    console.error('Erro não tratado:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 