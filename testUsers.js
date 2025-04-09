require('dotenv').config();
const { MongoClient } = require('mongodb');

async function testUsers() {
    const uri = process.env.DATABASE_URL;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ Conectado ao MongoDB com sucesso!');

        const db = client.db('quiz_db');
        const users = db.collection('User');

        // 1. Verificar se a coleção existe
        const collections = await db.listCollections().toArray();
        const collectionExists = collections.some(col => col.name === 'User');
        console.log('\n📦 Coleção User existe:', collectionExists);

        // 2. Contar usuários na coleção
        const count = await users.countDocuments();
        console.log('\n📊 Total de usuários:', count);

        // 3. Buscar alguns usuários
        const sampleUsers = await users.find().limit(3).toArray();
        console.log('\n👤 Exemplo de usuários:');
        sampleUsers.forEach((user, i) => {
            console.log(`\nUsuário ${i + 1}:`);
            console.log(`- Nome: ${user.name}`);
            console.log(`- Email: ${user.email}`);
            console.log(`- Role: ${user.role}`);
            console.log(`- Criado em: ${user.createdAt}`);
        });

        // 4. Testar inserção de um novo usuário
        const newUser = {
            name: "Usuário Teste",
            email: "teste@example.com",
            password: "senha123",
            role: "user",
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await users.insertOne(newUser);
        console.log('\n➕ Novo usuário inserido com ID:', result.insertedId);

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await client.close();
    }
}

testUsers(); 