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

// Configuração do Winston para logs
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});

// Inicialização do Prisma com retry e logs
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

// Função para conectar ao banco de dados com retry
async function connectDB(retries = 5) {
    while (retries > 0) {
        try {
            console.log('Tentando conectar ao banco de dados...');
            console.log('DATABASE_URL está definida:', !!process.env.DATABASE_URL);
            
            await prisma.$connect();
            console.log('✅ Conectado ao banco de dados com sucesso!');
            return true;
        } catch (error) {
            retries--;
            console.error(`❌ Erro ao conectar ao banco de dados. Tentativas restantes: ${retries}`, error);
            
            if (retries === 0) {
                throw error;
            }
            // Esperar 5 segundos antes de tentar novamente
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    return false;
}

const app = express();

// Middleware de segurança
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// Configuração do CORS
app.use(cors({
    origin: '*',  // Permitir todas as origens temporariamente para debug
    credentials: true
}));

// Middleware para verificar a conexão com o banco antes de cada requisição
app.use(async (req, res, next) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        next();
    } catch (error) {
        console.error('Erro na conexão com o banco:', {
            error: error.message,
            stack: error.stack,
            databaseUrl: process.env.DATABASE_URL ? 'Configurada' : 'Não configurada'
        });
        
        try {
            await connectDB();
            next();
        } catch (reconnectError) {
            console.error('Falha na reconexão:', reconnectError);
            res.status(500).json({ 
                error: 'Erro de conexão com o banco de dados',
                details: process.env.NODE_ENV === 'development' ? reconnectError.message : undefined
            });
        }
    }
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
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('combined'));
}

// Middleware para parsear JSON
app.use(express.json());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/dist', express.static(path.join(__dirname, 'dist')));

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = user;
        next();
    });
};

// Rotas da API
app.post('/api/register', async (req, res) => {
    try {
        console.log('Recebida requisição de registro:', req.body);
        
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'user'
            }
        });

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Usuário criado com sucesso:', { id: user.id, email: user.email });

        res.status(201).json({
            message: 'Usuário criado com sucesso',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ 
            error: 'Erro ao criar usuário',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email }
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

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        logger.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro ao fazer login' });
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

app.get('/api/questions', async (req, res) => {
    try {
        const questions = await prisma.question.findMany();
        res.json(questions);
    } catch (error) {
        logger.error('Erro ao buscar questões:', error);
        res.status(500).json({ error: 'Erro ao buscar questões' });
    }
});

// Rota para servir o arquivo HTML principal
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Tratamento de erros melhorado
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
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Um erro ocorreu no servidor',
        code: err.code
    });
});

// Cleanup do Prisma quando o servidor for fechado
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (error) => {
    console.error('Erro não tratado (Promise):', error);
});

process.on('uncaughtException', (error) => {
    console.error('Erro não tratado:', error);
    process.exit(1);
});

// Inicialização do servidor
const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        console.log('Iniciando servidor...');
        console.log('Ambiente:', process.env.NODE_ENV);
        
        await connectDB();
        
        app.listen(PORT, () => {
            console.log(`✅ Servidor rodando na porta ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Erro fatal ao iniciar servidor:', error);
        process.exit(1);
    }
}

startServer(); 