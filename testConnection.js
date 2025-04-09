const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
    try {
        await prisma.$connect();
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
        
        const userCount = await prisma.user.count();
        console.log(`Total de usuários no banco: ${userCount}`);
        
    } catch (error) {
        console.error('❌ Erro ao conectar ao banco de dados:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection(); 