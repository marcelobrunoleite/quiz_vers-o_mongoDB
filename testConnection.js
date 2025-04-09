require('dotenv').config();
const { MongoClient } = require('mongodb');

async function testConnection() {
    const uri = process.env.DATABASE_URL;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ Conexão com o MongoDB estabelecida com sucesso!');
        
        // Listar os bancos de dados disponíveis
        const databases = await client.db().admin().listDatabases();
        console.log('\n📦 Bancos de dados disponíveis:');
        databases.databases.forEach(db => console.log(`- ${db.name}`));
        
    } catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB:', error.message);
    } finally {
        await client.close();
    }
}

testConnection(); 