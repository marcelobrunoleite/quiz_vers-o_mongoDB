const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.get('/api/test', (req, res) => {
    res.json({ message: 'Servidor funcionando!' });
});

app.post('/api/auth/login', async (req, res) => {
    try {
        console.log('Requisição de login recebida:', req.body);
        
        const { email, password } = req.body;

        // Validar campos obrigatórios
        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                error: 'Email e senha são obrigatórios' 
            });
        }

        // Buscar usuário no banco
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        // Verificar se usuário existe
        if (!user) {
            return res.status(401).json({ 
                success: false,
                error: 'Email ou senha incorretos' 
            });
        }

        // Verificar senha
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ 
                success: false,
                error: 'Email ou senha incorretos' 
            });
        }

        // Gerar token JWT
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Remover senha do objeto do usuário
        const userWithoutPassword = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        // Retornar resposta de sucesso
        res.json({
            success: true,
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor' 
        });
    }
});

// Rota de registro
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validar campos obrigatórios
        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false,
                error: 'Nome, email e senha são obrigatórios' 
            });
        }

        // Verificar se usuário já existe
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                error: 'Email já cadastrado' 
            });
        }

        // Criar hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Criar usuário
        const user = await prisma.user.create({
            data: {
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                role: 'user'
            }
        });

        // Gerar token
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Remover senha do objeto do usuário
        const userWithoutPassword = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        // Retornar resposta de sucesso
        res.status(201).json({
            success: true,
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor' 
        });
    }
});

// Inicializar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
}); 