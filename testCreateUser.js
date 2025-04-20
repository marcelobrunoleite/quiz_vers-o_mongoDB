const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Dados do usuário de teste
    const userData = {
      name: "Usuário Teste",
      email: "teste@teste.com",
      password: await bcrypt.hash("senha123", 10),
      phone: "(67) 99999-9999",
      whatsapp: "(67) 99999-9999",
      role: "user"
    };

    // Criando o usuário
    const newUser = await prisma.user.create({
      data: userData
    });

    console.log('✅ Usuário criado com sucesso:', {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      whatsapp: newUser.whatsapp,
      role: newUser.role,
      createdAt: newUser.createdAt
    });

    // Verificando total de usuários
    const userCount = await prisma.user.count();
    console.log(`📊 Total de usuários no banco: ${userCount}`);

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser(); 