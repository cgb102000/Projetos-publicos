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
    await mongoose.connect(process.env.MONGO_URI, { dbName: 'conteudo' });
    console.log('Conectado ao MongoDB - Banco de dados: conteudo');
  } catch (err) {
    console.error('Erro ao conectar no MongoDB:', err);
    setTimeout(connectDB, 5000); // Tenta reconectar após 5 segundos
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
    const movieCategories = await mongoose.connection.db.collection('filmes').distinct('categoria');
    const animeCategories = await mongoose.connection.db.collection('animes').distinct('categoria');
    const allCategories = [...new Set([...movieCategories, ...animeCategories])]; // Remove duplicatas
    res.json(allCategories);
  } catch (err) {
    console.error('Erro ao buscar categorias:', err);
    res.status(500).json({ message: 'Erro ao buscar categorias.' });
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

// Rota inicial para verificar se o servidor está funcionando
app.get('/', (req, res) => {
  res.send('Bem-vindo ao servidor de Filmes e Animes!');
});

// Tratamento de erro para rotas não encontradas (404)
app.use((req, res) => {
  res.status(404).send('Página não encontrada!');
});

// Porta para o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
