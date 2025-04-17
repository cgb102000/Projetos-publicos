const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const auth = require('./middleware/auth'); // Adicione esta linha
const User = require('./models/User'); // Importar o modelo User
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json()); // Para analisar o corpo das requisições como JSON

// Servir arquivos estáticos (front-end)
app.use(express.static('public'));

// Servir arquivos estáticos do React build
app.use(express.static(path.join(__dirname, 'build')));

// Middleware de log para debug
const logMiddleware = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
};

app.use(logMiddleware);

// Importar rotas de autenticação
const authRoutes = require('./routes/authRoutes');

// Registrar apenas as rotas de autenticação
app.use('/api/auth', authRoutes);

// Remover importação e uso das rotas de comentários
// const commentRoutes = require('./routes/commentRoutes');
// app.use('/api/comments', commentRoutes);

// Função para conectar ao MongoDB com tentativas de reconexão
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI não definida no arquivo .env');
    }

    const connection = await mongoose.connect(process.env.MONGO_URI); // Conexão com o MongoDB
    console.log('Conectado ao MongoDB - Banco de dados:', connection.connection.db.databaseName);
  } catch (err) {
    console.error('Erro ao conectar no MongoDB:', err.message);
    setTimeout(connectDB, 5000);
  }
};

// Conectar ao MongoDB
connectDB();

// Middleware para validar ObjectId
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  try {
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'ID inválido ou não fornecido' });
    }

    // Tenta converter para ObjectId
    try {
      new mongoose.Types.ObjectId(id);
    } catch (err) {
      return res.status(400).json({ 
        message: 'Formato de ID inválido',
        details: 'O ID deve ser um ObjectId válido do MongoDB'
      });
    }

    next();
  } catch (error) {
    console.error('Erro ao validar ObjectId:', error);
    res.status(400).json({ message: 'ID inválido' });
  }
};

// Adicionar rota de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Mover rota inicial para antes das outras rotas
app.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo ao servidor de Filmes e Animes!' });
});

// Rota para buscar itens com base no parâmetro de pesquisa
app.get('/api/search', async (req, res) => {
  const query = req.query.q;

  if (!query || query.trim() === '') {
    return res.status(400).json({ message: 'Termo de pesquisa inválido.' });
  }

  try {
    const results = await mongoose.connection.db.collection('videos')
      .find({ titulo: { $regex: query, $options: 'i' } })
      .toArray();

    if (results.length > 0) {
      res.json(results);
    } else {
      res.status(404).json({ message: 'Nenhum item encontrado para o termo de pesquisa.' });
    }
  } catch (err) {
    console.error('Erro ao buscar itens:', err.message);
    res.status(500).json({ message: 'Erro ao buscar itens. Tente novamente mais tarde.' });
  }
});

// Corrigir rota de busca de item específico
app.get('/api/item/:id', validateObjectId, async (req, res) => {
  const { id } = req.params;

  try {
    const objectId = new mongoose.Types.ObjectId(id);
    const item = await mongoose.connection.db.collection('videos').findOne({ _id: objectId });

    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado.' });
    }

    res.json(item);
  } catch (err) {
    console.error('Erro ao buscar item:', err);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para pegar recomendações
app.get('/api/random', async (req, res) => {
  try {
    const items = await mongoose.connection.db.collection('videos')
      .aggregate([{ $sample: { size: 6 } }])
      .toArray();

    res.json(items);
  } catch (err) {
    console.error('Erro ao buscar recomendações:', err);
    res.status(500).json({ message: 'Erro ao buscar recomendações' });
  }
});

// Rota para buscar itens recentes
app.get('/api/recent', async (req, res) => {
  try {
    const recentItems = await mongoose.connection.db.collection('videos')
      .find()
      .sort({ _id: -1 })
      .limit(20)
      .toArray();

    res.json(recentItems);
  } catch (error) {
    console.error('Erro ao buscar itens recentes:', error.message);
    res.status(500).json({ message: 'Erro ao buscar itens recentes' });
  }
});

// Rota para buscar categorias disponíveis
app.get('/api/categories', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Conexão com o banco de dados não estabelecida');
    }

    const categories = await db.collection('videos').distinct('categoria');

    if (!categories.length) {
      return res.status(404).json({ message: 'Nenhuma categoria encontrada' });
    }

    res.json(categories);
  } catch (err) {
    console.error('Erro ao buscar categorias:', err.message);
    res.status(500).json({ message: 'Erro ao buscar categorias', error: err.message });
  }
});

// Rota para buscar itens por categoria
app.get('/api/category/:category', async (req, res) => {
  const { category } = req.params;

  try {
    const results = await mongoose.connection.db.collection('videos')
      .find({ categoria: { $regex: new RegExp(category, 'i') } })
      .toArray();

    if (results.length > 0) {
      res.json(results);
    } else {
      res.status(404).json({ message: 'Nenhum item encontrado nesta categoria.' });
    }
  } catch (err) {
    console.error('Erro ao buscar por categoria:', err);
    res.status(500).json({ message: 'Erro ao buscar itens por categoria.' });
  }
});

// Todas as outras requisições GET não tratadas retornarão nosso app React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Tratamento de erro para rotas não encontradas (404)
app.use((req, res) => {
  res.status(404).send('Página não encontrada!');
});

// Middleware global para tratar erros
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ 
    message: err.message || 'Erro interno do servidor',
    path: req.path
  });
});

// Função para encontrar uma porta disponível
function findAvailablePort(startPort) {
  return new Promise((resolve, reject) => {
    const server = require('net').createServer();
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });

    server.listen(startPort, () => {
      server.once('close', () => {
        resolve(startPort);
      });
      server.close();
    });
  });
}

// Função para matar processo em uma porta específica (Windows)
async function killProcessOnPort(port) {
  return new Promise((resolve, reject) => {
    const exec = require('child_process').exec;
    exec(`taskkill /F /PID ${port}`, (err, stdout, stderr) => {
      if (err) {
        console.log(`Nenhum processo precisou ser finalizado na porta ${port}`);
      }
      resolve();
    });
  });
}

// Função para iniciar o servidor
const startServer = async () => {
  try {
    await connectDB(); // Garantir que o MongoDB está conectado antes de iniciar o servidor
    
    const port = process.env.PORT || 3001;
    
    const server = app.listen(port, () => {
      console.log(`Servidor rodando em http://localhost:${port}`);
    });

    server.on('error', (err) => {
      console.error('Erro no servidor:', err);
      process.exit(1);
    });
  } catch (err) {
    console.error('Erro ao iniciar aplicação:', err);
    process.exit(1);
  }
};

startServer();
