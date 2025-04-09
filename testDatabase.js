require('dotenv').config();
const { MongoClient } = require('mongodb');

async function testDatabase() {
    const uri = process.env.DATABASE_URL;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ Conectado ao MongoDB com sucesso!');

        const db = client.db('quiz_db');
        const questions = db.collection('Question');

        // 1. Verificar se a coleção existe
        const collections = await db.listCollections().toArray();
        const collectionExists = collections.some(col => col.name === 'Question');
        console.log('\n📦 Coleção Question existe:', collectionExists);

        // 2. Contar documentos na coleção
        const count = await questions.countDocuments();
        console.log('\n📊 Total de questões:', count);

        // 3. Buscar algumas questões
        const sampleQuestions = await questions.find().limit(3).toArray();
        console.log('\n📝 Exemplo de questões:');
        sampleQuestions.forEach((q, i) => {
            console.log(`\nQuestão ${i + 1}:`);
            console.log(`- Tema: ${q.tema}`);
            console.log(`- Pergunta: ${q.pergunta.substring(0, 50)}...`);
            console.log(`- Dificuldade: ${q.dificuldade}`);
        });

        // 4. Testar inserção de uma nova questão
        const newQuestion = {
            tema: "Legislação de Trânsito",
            pergunta: "Qual é a distância mínima que deve ser mantida entre veículos em movimento?",
            alternativas: {
                a: "2 metros",
                b: "3 metros",
                c: "1 metro",
                d: "4 metros",
                e: "5 metros"
            },
            resposta_correta: "a",
            explicacao: "A distância mínima entre veículos em movimento deve ser de 2 metros para garantir a segurança.",
            dificuldade: "media"
        };

        const result = await questions.insertOne(newQuestion);
        console.log('\n➕ Nova questão inserida com ID:', result.insertedId);

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await client.close();
    }
}

testDatabase(); 