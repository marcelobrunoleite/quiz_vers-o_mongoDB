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

// Configuração do CORS para produção e desenvolvimento
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.VERCEL_URL, 'https://quiz-v4-vercel.vercel.app']
    : ['http://localhost:4000', 'http://127.0.0.1:5503', 'http://127.0.0.1:5500'];

// Middlewares
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('combined'));
}

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../../public')));
app.use('/assets', express.static(path.join(__dirname, '../../assets')));
app.use('/src/frontend', express.static(path.join(__dirname, '../frontend')));

// Configuração do Prisma com retry
const prisma = new PrismaClient({
    log: ['error', 'warn'],
    errorFormat: 'pretty',
});

// Função para testar conexão com retry
async function connectWithRetry(retries = 5, delay = 5000) {
    for (let i = 0; i < retries; i++) {
        try {
            await prisma.$connect();
            logger.info('✅ Conectado ao banco de dados com sucesso!');
            return true;
        } catch (error) {
            logger.error(`Tentativa ${i + 1} de ${retries} falhou:`, error);
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    return false;
}

// Middleware para verificar conexão com o banco
app.use(async (req, res, next) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        next();
    } catch (error) {
        logger.error('Erro na conexão com o banco:', error);
        res.status(503).json({ 
            error: 'Serviço temporariamente indisponível',
            message: 'Erro de conexão com o banco de dados'
        });
    }
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/users', userRoutes);

// Rota de teste/health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV
    });
});

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

// Log de todas as requisições
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
});

// Tratamento de erros
app.use(errorHandler);

// Middleware de erro
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Erro não tratado:', err);
    res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Inicialização do servidor
const PORT = process.env.PORT || 4000;

async function startServer() {
    try {
        if (await connectWithRetry()) {
            const server = app.listen(PORT, () => {
                logger.info(`🚀 Servidor rodando na porta ${PORT}`);
            });

            server.on('error', (error: NodeJS.ErrnoException) => {
                logger.error('❌ Erro no servidor:', error);
            });
        } else {
            throw new Error('Não foi possível conectar ao banco de dados após várias tentativas');
        }
    } catch (error) {
        logger.error('❌ Erro fatal ao iniciar o servidor:', error);
        process.exit(1);
    }
}

// Iniciar o servidor
startServer();

// Tratamento de encerramento gracioso
process.on('SIGTERM', async () => {
    logger.info('Recebido SIGTERM. Encerrando...');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('Recebido SIGINT. Encerrando...');
    await prisma.$disconnect();
    process.exit(0);
});

export default app; 