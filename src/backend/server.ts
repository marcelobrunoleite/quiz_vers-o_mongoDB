import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { PrismaClient } from '@prisma/client';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/auth';
import quizRoutes from './routes/quiz';
import userRoutes from './routes/users';
import { logger } from './utils/logger';
import path from 'path';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Middlewares
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://seu-dominio.com'] 
        : ['http://localhost:4000', 'http://127.0.0.1:5503', 'http://127.0.0.1:5500'],
    credentials: true
}));
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(morgan('combined'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../../public')));
app.use('/assets', express.static(path.join(__dirname, '../../assets')));
app.use('/src/frontend', express.static(path.join(__dirname, '../frontend')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/users', userRoutes);

// Rota principal e outras rotas do frontend
const sendIndex = (req: express.Request, res: express.Response) => {
    res.sendFile(path.join(__dirname, '../../index.html'));
};

app.get('/', sendIndex);
app.get('/login', sendIndex);
app.get('/quiz', sendIndex);
app.get('/ranking', sendIndex);
app.get('/perfil', sendIndex);
app.get('/resultados', sendIndex);

// Rota de teste
app.get('/api/test', (req, res) => {
    res.json({ message: 'API funcionando!' });
});

// Log de todas as requisições
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path} - Body:`, req.body);
    next();
});

// Tratamento de erros
app.use(errorHandler);

// Middleware de erro
app.use((err: Error, req: express.Request, res: express.Response) => {
    logger.error('Erro não tratado:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

// Inicialização do servidor
const PORT = process.env.PORT || 4000;
const prisma = new PrismaClient();

async function startServer() {
    try {
        // Testar conexão com o banco de dados
        await prisma.$connect();
        logger.info('✅ Conectado ao banco de dados com sucesso!');
        
        const server = app.listen(PORT, () => {
            logger.info(`🚀 Servidor rodando em http://localhost:${PORT}`);
        });

        // Tratamento de erros do servidor
        server.on('error', (error: NodeJS.ErrnoException) => {
            if (error.code === 'EADDRINUSE') {
                logger.error(`❌ Porta ${PORT} já está em uso`);
                process.exit(1);
            }
            logger.error('❌ Erro no servidor:', error);
        });

    } catch (error) {
        logger.error('❌ Erro ao iniciar o servidor:', error);
        process.exit(1);
    }
}

startServer();

// Tratamento de encerramento gracioso
process.on('SIGTERM', async () => {
    logger.info('Recebido SIGTERM. Encerrando servidor...');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('Recebido SIGINT. Encerrando servidor...');
    await prisma.$disconnect();
    process.exit(0);
}); 