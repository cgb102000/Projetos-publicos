const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
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

// Corrigir o caminho base das rotas de autenticação
app.use('/api/auth', authRoutes);

// Função para conectar ao MongoDB com tentativas de reconexão
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI não definida no arquivo .env');
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conectado ao MongoDB - Banco de dados: conteudo');
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

// Middleware para validar coleção
const validateCollection = (req, res, next) => {
  const { collection } = req.params;
  const validCollections = ['animes', 'filmes'];
  
  if (!validCollections.includes(collection)) {
    return res.status(400).json({ message: 'Coleção inválida' });
  }
  next();
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

  // Verificar se o termo de pesquisa é válido
  if (!query) {
    return res.status(400).json({ message: 'Termo de pesquisa inválido.' });
  }

  // Buscando nas coleções 'animes' e 'filmes'
  const validCollections = ['animes', 'filmes'];

  try {
    // Usando Promise.all para buscar nas duas coleções de forma paralela
    const results = await Promise.all(validCollections.map(collection => {
      return mongoose.connection.db.collection(collection)
        .find({ titulo: { $regex: query, $options: 'i' } })
        .toArray();
    }));

    // Concatenando os resultados das duas coleções
    const allResults = [].concat(...results);

    if (allResults.length > 0) {
      res.json(allResults); // Envia os resultados encontrados
    } else {
      res.status(404).json({ message: 'Nenhum item encontrado.' });
    }
  } catch (err) {
    console.error('Erro ao buscar itens:', err);
    res.status(500).json({ message: 'Erro ao buscar itens. Tente novamente mais tarde.' });
  }
});

// Corrigir rota de busca de item específico
app.get('/api/item/:collection/:id', validateCollection, validateObjectId, async (req, res) => {
  const { collection, id } = req.params;
  
  try {
    const db = mongoose.connection.db;
    let item;

    try {
      const objectId = new mongoose.Types.ObjectId(id);
      item = await db.collection(collection).findOne({ _id: objectId });
    } catch (err) {
      // Tenta buscar usando o ID como string se a conversão falhar
      item = await db.collection(collection).findOne({ _id: id });
    }

    if (!item) {
      return res.status(404).json({
        message: `Item não encontrado na coleção ${collection}`,
        details: { collection, id }
      });
    }

    const response = {
      ...item,
      tipo: collection === 'animes' ? 'anime' : 'filme',
      collection
    };

    res.json(response);
  } catch (err) {
    console.error('Erro ao buscar item:', err);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para pegar recomendações
app.get('/api/random/:collection', validateCollection, async (req, res) => {
  const { collection } = req.params;
  console.log(`Buscando recomendações para: ${collection}`);

  try {
    const db = mongoose.connection.db;
    const items = await db.collection(collection)
      .aggregate([
        { $sample: { size: 6 } },
        { 
          $addFields: {
            tipo: collection === 'animes' ? 'anime' : 'filme',
            collection: collection
          }
        }
      ]).toArray();

    console.log(`Encontrados ${items.length} itens para recomendação`);
    res.json(items);
  } catch (err) {
    console.error('Erro ao buscar recomendações:', err);
    res.status(500).json({ message: 'Erro ao buscar recomendações' });
  }
});

// Rota para buscar categorias disponíveis
app.get('/api/categories', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Conexão com o banco de dados não estabelecida');
    }

    const [movieCategories, animeCategories] = await Promise.all([
      db.collection('filmes').distinct('categoria'),
      db.collection('animes').distinct('categoria')
    ]);

    const allCategories = [...new Set([...movieCategories, ...animeCategories])];
    
    if (!allCategories.length) {
      return res.status(404).json({ message: 'Nenhuma categoria encontrada' });
    }

    res.json(allCategories);
  } catch (err) {
    console.error('Erro ao buscar categorias:', err.message);
    res.status(500).json({ message: 'Erro ao buscar categorias', error: err.message });
  }
});

// Rota para buscar itens enviados recentemente
app.get('/api/recent', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    
    if (!db) {
      throw new Error('Conexão com o banco de dados não estabelecida');
    }

    const [recentMovies, recentAnimes] = await Promise.all([
      db.collection('filmes')
        .find()
        .sort({ _id: -1 })
        .limit(50)
        .toArray(),
      db.collection('animes')
        .find()
        .sort({ _id: -1 })
        .limit(50)
        .toArray()
    ]);

    const allRecentItems = [...recentMovies.map(item => ({
      ...item,
      collection: 'filmes'
    })), ...recentAnimes.map(item => ({
      ...item,
      collection: 'animes'
    }))].sort((a, b) => {
      // Usar ObjectId para ordenação por data de criação
      return b._id.getTimestamp() - a._id.getTimestamp();
    }).slice(0, 50);

    res.json(allRecentItems);
  } catch (error) {
    console.error('Erro ao buscar itens recentes:', error);
    res.status(500).json({ message: 'Erro ao buscar itens recentes.' });
  }
});

// Rota para buscar itens por categoria
app.get('/api/category/:category', async (req, res) => {
  const { category } = req.params;

  try {
    const results = await Promise.all([
      mongoose.connection.db.collection('filmes')
        .find({ categoria: { $regex: new RegExp(category, 'i') } })
        .toArray(),
      mongoose.connection.db.collection('animes')
        .find({ categoria: { $regex: new RegExp(category, 'i') } })
        .toArray()
    ]);

    const allResults = results.flat().map(item => ({
      ...item,
      collection: item.categoria.toLowerCase().includes('anime') ? 'animes' : 'filmes'
    }));

    if (allResults.length > 0) {
      res.json(allResults);
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
