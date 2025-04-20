const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
    try {
        // Tenta fazer uma consulta simples
        const userCount = await prisma.user.count();
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
        console.log(`📊 Total de usuários no banco: ${userCount}`);
        return true;
    } catch (error) {
        console.error('❌ Erro ao conectar com o banco de dados:', error);
        return false;
    } finally {
        await prisma.$disconnect();
    }
}

testConnection(); 