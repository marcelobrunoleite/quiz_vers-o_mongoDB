require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const winston = require('winston');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./src/backend/middlewares/auth');

// Configurações das variáveis de ambiente
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.NODE_ENV === 'production'
    ? process.env.VERCEL_URL
    : ['http://localhost:3000', 'http://localhost:4000', 'http://127.0.0.1:5500', 'http://127.0.0.1:5503'];
const NODE_ENV = process.env.NODE_ENV || 'development';

// Configuração do logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

if (NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// Inicialização do Prisma com retry e logs
const prisma = new PrismaClient({
    log: ['error', 'warn'],
    errorFormat: 'pretty',
});

// Função para testar a conexão com o banco
async function testDatabaseConnection() {
    try {
        await prisma.user.findFirst();
        logger.info('Conexão com o banco de dados testada com sucesso');
        return true;
    } catch (error) {
        logger.error('Erro ao testar conexão com o banco:', error);
        return false;
    }
}

const app = express();

// Middleware de segurança
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// Configuração do CORS
app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Middleware para verificar a conexão com o banco
app.use(async (req, res, next) => {
    if (!await testDatabaseConnection()) {
        return res.status(503).json({ 
            error: 'Serviço temporariamente indisponível',
            message: 'Erro de conexão com o banco de dados. Por favor, tente novamente em alguns instantes.'
        });
    }
    next();
});

// Limite de requisições
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

// Compressão de resposta
app.use(compression());

// Logs de acesso
if (NODE_ENV !== 'production') {
    app.use(morgan('combined'));
}

// Middleware para parsear JSON
app.use(express.json());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/dist', express.static(path.join(__dirname, 'dist')));

// Rotas da API
app.post('/api/register', async (req, res) => {
    try {
        console.log('Recebida requisição de registro:', req.body);
        
        const { name, email, password, phone, whatsapp } = req.body;
        
        if (!name || !email || !password) {
            console.log('Campos obrigatórios faltando:', { name, email, password });
            return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
        }

        console.log('Verificando usuário existente...');
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            console.log('Email já cadastrado:', email);
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        console.log('Gerando hash da senha...');
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log('Criando usuário...');
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone: phone || null,
                whatsapp: whatsapp || null,
                role: 'user'
            }
        });

        console.log('Usuário criado com sucesso:', { id: user.id, email: user.email });

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Remove a senha antes de enviar
        const userWithoutPassword = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            whatsapp: user.whatsapp,
            role: user.role
        };

        res.status(201).json({
            message: 'Usuário criado com sucesso',
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Erro detalhado no registro:', error);
        logger.error('Erro no registro:', {
            error: error.message,
            stack: error.stack,
            body: req.body
        });
        res.status(500).json({ 
            error: 'Erro ao criar usuário',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        console.log('Requisição de login recebida:', req.body);
        
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            return res.status(401).json({ error: 'Email ou senha incorretos' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Email ou senha incorretos' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Remove a senha antes de enviar
        const userWithoutPassword = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        console.log('Login bem-sucedido para:', email);
        
        res.json({
            success: true,
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ 
            error: 'Erro ao fazer login',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Rota protegida de exemplo
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                whatsapp: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json(user);
    } catch (error) {
        logger.error('Erro ao buscar perfil:', error);
        res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
});

app.get('/api/questions', authenticateToken, async (req, res) => {
    try {
        const questions = await prisma.question.findMany();
        res.json(questions);
    } catch (error) {
        logger.error('Erro ao buscar questões:', error);
        res.status(500).json({ error: 'Erro ao buscar questões' });
    }
});

// Rota para salvar resultado do quiz
app.post('/api/quiz/result', authenticateToken, async (req, res) => {
    try {
        const { score, correctAnswers, wrongAnswers, timeSpent } = req.body;
        const userId = req.user.id;

        const result = await prisma.quizResult.create({
            data: {
                userId,
                score,
                correctAnswers,
                wrongAnswers,
                timeSpent,
                completedAt: new Date()
            }
        });

        logger.info(`Novo resultado de quiz salvo para usuário ${userId}`);
        res.json(result);
    } catch (error) {
        logger.error('Erro ao salvar resultado do quiz:', error);
        res.status(500).json({ error: 'Erro ao salvar resultado do quiz' });
    }
});

// Rota para obter ranking geral
app.get('/api/ranking', async (req, res) => {
    try {
        const ranking = await prisma.quizResult.findMany({
            take: 10,
            orderBy: {
                score: 'desc'
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        res.json(ranking);
    } catch (error) {
        logger.error('Erro ao buscar ranking:', error);
        res.status(500).json({ error: 'Erro ao buscar ranking' });
    }
});

// Rota para obter estatísticas do usuário
app.get('/api/user/stats', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const results = await prisma.quizResult.findMany({
            where: { userId },
            orderBy: { completedAt: 'desc' }
        });

        const stats = {
            totalQuizzes: results.length,
            averageScore: results.reduce((acc, curr) => acc + curr.score, 0) / results.length || 0,
            bestScore: Math.max(...results.map(r => r.score), 0),
            recentResults: results.slice(0, 5)
        };

        res.json(stats);
    } catch (error) {
        logger.error('Erro ao buscar estatísticas do usuário:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas do usuário' });
    }
});

// Rota para validar token
app.get('/api/auth/validate', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                valid: false,
                message: 'Token não fornecido'
            });
        }

        try {
            // Verificar o token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Verificar se o usuário ainda existe
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId }
            });

            if (!user) {
                return res.status(401).json({ 
                    valid: false,
                    message: 'Usuário não encontrado'
                });
            }

            // Token válido e usuário existe
            res.json({ 
                valid: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Erro na verificação do token:', error);
            return res.status(401).json({ 
                valid: false,
                message: 'Token inválido ou expirado'
            });
        }
    } catch (error) {
        console.error('Erro na validação:', error);
        res.status(500).json({ 
            valid: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Rota para servir o arquivo HTML principal
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Middleware de tratamento de erros global
app.use((err, req, res, next) => {
    logger.error('Erro não tratado:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        query: req.query,
        body: req.body
    });

    res.status(500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Erro interno do servidor' 
            : err.message
    });
});

// Função para iniciar o servidor
async function startServer() {
    try {
        // Testa a conexão com o banco antes de iniciar o servidor
        if (!await testDatabaseConnection()) {
            throw new Error('Não foi possível estabelecer conexão com o banco de dados');
        }

        // Verifica se a porta está em uso
        const server = app.listen(PORT, () => {
            logger.info(`Servidor rodando na porta ${PORT} em modo ${NODE_ENV}`);
        });

        // Tratamento de erros do servidor
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                logger.error(`Porta ${PORT} já está em uso. Tentando outra porta...`);
                server.close();
                // Tenta a próxima porta
                app.listen(PORT + 1);
            } else {
                logger.error('Erro no servidor:', error);
                process.exit(1);
            }
        });

        // Tratamento de desligamento gracioso
        process.on('SIGTERM', () => {
            logger.info('Recebido sinal SIGTERM. Fechando servidor...');
            server.close(async () => {
                await prisma.$disconnect();
                process.exit(0);
            });
        });

    } catch (error) {
        logger.error('Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

// Inicia o servidor
startServer(); 