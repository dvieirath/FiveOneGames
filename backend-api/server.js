// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors'); // <--- NOVO: Importa o middleware CORS

const app = express();
const PORT = 3000;

// Configuração do CORS
// O cors() sem argumentos permite que *qualquer* origem (seu app) acesse o backend.
// Se você souber a porta exata do seu app (ex: 8081 ou o IP do celular), pode restringir para maior segurança.
app.use(cors()); // <--- NOVO: Adiciona o middleware CORS

// Middleware para processar JSON nas requisições
app.use(express.json());

// ====================================================================
// CONFIGURAÇÃO DO BANCO DE DADOS POSTGRESQL (MANTIDA)
// ====================================================================

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

// A senha secreta para assinar os Tokens JWT
const JWT_SECRET = process.env.JWT_SECRET || 'uma_chave_secreta_forte_e_aleatoria';

// ====================================================================
// ENDPOINT 1: CADASTRO (/api/register)
// ====================================================================
app.post('/api/register', async (req, res) => {
    const { cpf, email, password, dateOfBirth } = req.body;

    // 1. Validação básica (deveria ser mais robusta, mas usa a lógica do frontend)
    if (!cpf || !email || !password || !dateOfBirth) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }
    
    // 2. Garante que a senha atende ao requisito mínimo (simulado do frontend)
    if (password.length < 5) {
        return res.status(400).json({ message: 'A senha deve ter no mínimo 5 caracteres.' });
    }

    try {
        // 3. Criptografia da Senha (SALT de 10 é o padrão seguro)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 4. Inserção no banco de dados
        const result = await pool.query(
            `INSERT INTO users (cpf, email, password_hash, date_of_birth) 
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [cpf, email, passwordHash, dateOfBirth]
        );

        // 5. Retorna sucesso
        res.status(201).json({ 
            message: 'Usuário cadastrado com sucesso!', 
            userId: result.rows[0].id 
        });

    } catch (error) {
        // Trata erro de CPF ou Email já cadastrado (UNIQUE constraint)
        if (error.code === '23505') { 
            return res.status(409).json({ message: 'CPF ou Email já registrados.' });
        }
        console.error('Erro no cadastro:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// ====================================================================
// ENDPOINT 2: LOGIN (/api/login)
// ====================================================================
app.post('/api/login', async (req, res) => {
    const { cpf, password } = req.body;

    try {
        // 1. Busca o usuário pelo CPF
        const result = await pool.query('SELECT * FROM users WHERE cpf = $1', [cpf]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'CPF ou Senha inválidos.' });
        }

        // 2. Compara a senha fornecida com o hash salvo no banco
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'CPF ou Senha inválidos.' });
        }

        // 3. Gera o Token JWT (Payload inclui o ID e CPF do usuário)
        const token = jwt.sign(
            { id: user.id, cpf: user.cpf }, 
            JWT_SECRET, 
            { expiresIn: '1d' } // Token expira em 1 dia
        );

        // 4. Retorna o token para o aplicativo
        res.json({ 
            message: 'Login bem-sucedido', 
            token: token,
            // Omitir o hash da senha por segurança
            user: { id: user.id, cpf: user.cpf, email: user.email } 
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// Inicializa o servidor
app.listen(PORT, () => {
    console.log(`Backend API rodando na porta http://localhost:${PORT}`);
});