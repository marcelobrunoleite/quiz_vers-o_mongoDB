const { MongoClient } = require('mongodb');

// URL de conexão do MongoDB (substitua com sua URL real)
const uri = process.env.DATABASE_URL;

async function main() {
    // Criar uma nova instância do cliente MongoDB
    const client = new MongoClient(uri);

    try {
        // Conectar ao servidor MongoDB
        await client.connect();
        console.log('Conectado ao MongoDB com sucesso!');

        // Selecionar o banco de dados
        const database = client.db('quiz');

        // Selecionar a coleção
        const questions = database.collection('Question');

        // Exemplo 1: Buscar todas as questões
        const allQuestions = await questions.find({}).toArray();
        console.log('Total de questões:', allQuestions.length);

        // Exemplo 2: Buscar questões por dificuldade
        const easyQuestions = await questions.find({ dificuldade: 'facil' }).toArray();
        console.log('Questões fáceis:', easyQuestions.length);

        // Exemplo 3: Inserir uma nova questão
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
        console.log('Nova questão inserida com ID:', result.insertedId);

    } catch (error) {
        console.error('Erro ao conectar ao MongoDB:', error);
    } finally {
        // Fechar a conexão
        await client.close();
    }
}

main().catch(console.error); 