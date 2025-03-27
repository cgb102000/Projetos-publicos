const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();

// Configuração CORS para permitir todas as origens durante o desenvolvimento
app.use(cors({
  origin: '*', // Permitir todas as origens
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Adicionar rota de health check
app.get('/api/health', (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }
    res.json({ status: 'ok', dbStatus: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'error', message: error.message });
  }
});

// Log para debug
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// Middleware de tratamento de erros global
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ 
    message: err.message || 'Erro interno do servidor',
    path: req.path
  });
});

// Conexão com o MongoDB
const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // Remova as opções deprecadas
    });
    console.log('Conectado ao MongoDB - Banco de dados:', mongoose.connection.name);
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error.message);
    process.exit(1); // Encerra o processo se a conexão falhar
  }
};

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Aumentar timeout do servidor
app.timeout = 30000; // 30 segundos

// Modificar a rota /api/recent para ser mais robusta
app.get('/api/recent', async (req, res) => {
  try {
    // Verificar conexão com o banco
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    const recentItems = await mongoose.connection.db
      .collection('animes')
      .find()
      .limit(20)
      .toArray();

    res.json(recentItems || []);
  } catch (error) {
    console.error('Erro em /api/recent:', error);
    res.status(500).json({ message: 'Erro ao buscar itens recentes' });
  }
});

// Iniciar o servidor após a conexão com o banco de dados
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado ao MongoDB');

    const port = process.env.PORT || 3001;
    app.listen(port, '0.0.0.0', () => {
      console.log(`Servidor rodando em http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();
