const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Para analisar o corpo das requisições como JSON

// Servir arquivos estáticos (front-end)
app.use(express.static('public'));

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

// Rota para obter detalhes de um item específico
app.get('/api/item/:collection/:id', async (req, res) => {
  const { collection, id } = req.params;

  // Verificar se a coleção é válida
  const validCollections = ['animes', 'filmes'];

  if (!validCollections.includes(collection)) {
    return res.status(400).json({ message: 'Coleção inválida. Use "animes" ou "filmes".' });
  }

  // Verificar se o ID é um ObjectId válido
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID inválido.' });
  }

  try {
    const item = await mongoose.connection.db.collection(collection)
      .findOne({ _id: new mongoose.Types.ObjectId(id) });

    if (item) {
      console.log(`Item encontrado na coleção ${collection}:`, item);
      res.json(item);
    } else {
      console.log('Item não encontrado');
      res.status(404).json({ message: 'Item não encontrado' });
    }
  } catch (err) {
    console.error('Erro ao buscar item:', err);
    res.status(500).json({ message: 'Erro ao buscar item. Tente novamente mais tarde.' });
  }
});

// Rota para pegar filmes e animes aleatórios
app.get('/api/random/:collection', async (req, res) => {
  const { collection } = req.params;
  const validCollections = ['animes', 'filmes'];

  if (!validCollections.includes(collection)) {
    return res.status(400).json({ message: 'Coleção inválida.' });
  }

  try {
    // Alterado para retornar 50 itens aleatórios
    const randomItems = await mongoose.connection.db.collection(collection).aggregate([
      { $sample: { size: 16 } }  // Ajuste para retornar 50 itens
    ]).toArray();

    if (randomItems.length > 0) {
      res.json(randomItems);
    } else {
      res.status(404).json({ message: 'Nenhum item encontrado.' });
    }
  } catch (err) {
    console.error('Erro ao buscar itens aleatórios:', err);
    res.status(500).json({ message: 'Erro ao buscar itens aleatórios. Tente novamente mais tarde.' });
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
    const recentMovies = await mongoose.connection.db.collection('filmes').find().sort({ createdAt: -1 }).limit(50).toArray();
    const recentAnimes = await mongoose.connection.db.collection('animes').find().sort({ createdAt: -1 }).limit(50).toArray();

    // Adicionar o campo 'collection' para diferenciar os itens
    const moviesWithCollection = recentMovies.map(item => ({ ...item, collection: 'filmes' }));
    const animesWithCollection = recentAnimes.map(item => ({ ...item, collection: 'animes' }));

    const allRecentItems = [...moviesWithCollection, ...animesWithCollection].slice(0, 50); // Limita a 50 itens no total
    res.json(allRecentItems);
  } catch (err) {
    console.error('Erro ao buscar itens recentes:', err);
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

// Rota inicial para verificar se o servidor está funcionando
app.get('/', (req, res) => {
  res.send('Bem-vindo ao servidor de Filmes e Animes!');
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
    const desiredPort = parseInt(process.env.PORT) || 3001;
    let port = desiredPort;

    const server = app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });

    server.on('error', async (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Porta ${port} em uso, tentando próxima porta...`);
        port++;
        server.close();
        app.listen(port, () => {
          console.log(`Servidor rodando na porta ${port}`);
        });
      } else {
        console.error('Erro ao iniciar o servidor:', err);
        process.exit(1);
      }
    });
  } catch (err) {
    console.error('Erro ao iniciar o servidor:', err);
    process.exit(1);
  }
};

startServer();
