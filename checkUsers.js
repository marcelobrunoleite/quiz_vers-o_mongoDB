const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('Usuários cadastrados:', JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 