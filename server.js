const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const winston = require('winston');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();

// Configuração de logs
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// Middleware de segurança
app.use(helmet());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 'https://seu-dominio.com' : '*',
    credentials: true
}));

// Limite de requisições
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // limite de 100 requisições por IP
});
app.use(limiter);

// Compressão de resposta
app.use(compression());

// Logs de acesso
app.use(morgan('combined', {
    stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
}));

// Middleware para parsear JSON
app.use(express.json());

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
        const { name, email, password, phone, whatsapp } = req.body;
        
        // Validações
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
        }

        // Verificar se o email já existe
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        // Criptografar senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Criar usuário
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone,
                whatsapp: whatsapp || phone,
                role: 'user'
            }
        });

        // Gerar token JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Usuário criado com sucesso',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        logger.error('Erro no registro:', error);
        res.status(500).json({ error: 'Erro ao criar usuário' });
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

// Tratamento de erros
app.use((err, req, res, next) => {
    logger.error('Erro não tratado:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Servidor rodando na porta ${PORT}`);
}); 