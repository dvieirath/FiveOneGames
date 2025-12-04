require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3000;
// Certifique-se de que JWT_SECRET tenha um valor definido no seu arquivo .env
const jwtSecret = process.env.JWT_SECRET; 

// SOLUÇÃO PARA O ERRO DE CORS: Permite requisições de qualquer origem
app.use(cors());

// Middleware para analisar o corpo das requisições JSON
app.use(express.json());

// ----------------------------------------------------
// Configuração do Banco de Dados PostgreSQL
// ----------------------------------------------------
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

// Teste de conexão com o banco
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Erro ao adquirir cliente do pool. Verifique o PostgreSQL e as credenciais no .env', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      return console.error('Erro ao executar query de teste. Verifique o nome do DB e o PGDATABASE no .env', err.stack);
    }
    console.log('PostgreSQL conectado com sucesso:', result.rows[0].now);
  });
});

// ----------------------------------------------------
// ROTAS DE AUTENTICAÇÃO (/api/auth)
// ----------------------------------------------------
const authRouter = express.Router();
app.use('/api/auth', authRouter);

// Rota de Cadastro de Usuário (POST)
authRouter.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const MIN_PASSWORD_LENGTH = 5;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({ message: `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.` });
  }

  try {
    // 1. Verifica se o usuário ou e-mail já existem (usando LOWER para ser case-insensitive)
    const existingUser = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($2)', [email, username]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'Usuário ou e-mail já cadastrado.' });
    }

    // 2. Cria o hash seguro da senha
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Insere o novo usuário no banco de dados
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
      [username, email, passwordHash]
    );

    // 4. Gera o token de autenticação (IMPORTANTE: o frontend espera este 'token')
    const token = jwt.sign({ id: newUser.rows[0].id }, jwtSecret, { expiresIn: '1d' });

    // O status 201 é retornado com sucesso.
    res.status(201).json({ 
        message: 'Usuário cadastrado com sucesso!', 
        token 
    });

  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota de Login (POST)
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
  }

  try {
    // 1. Busca o usuário no banco pelo e-mail (CORRIGIDO: usando LOWER para ser case-insensitive)
    const userResult = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    const user = userResult.rows[0];

    if (!user) {
      // Retorna 401 Credenciais Inválidas
      return res.status(401).json({ message: 'Credenciais Inválidas.' });
    }

    // 2. Compara o hash da senha armazenada com a senha fornecida
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      // Retorna 401 Credenciais Inválidas
      return res.status(401).json({ message: 'Credenciais Inválidas.' });
    }

    // 3. Gera o token de autenticação
    const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '1d' });

    // Retorna 200 OK por padrão com o token
    res.json({ 
        message: 'Login efetuado com sucesso!', 
        token 
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
  console.log(`Acesse a API: http://192.168.56.1:${port}/api/auth`);
});