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

  // Verificando a coleção
  if (!validCollections.includes(collection)) {
    return res.status(400).json({ message: 'Coleção inválida. Use "animes" ou "filmes".' });
  }

  // Verificar se o ID é um ObjectId válido
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID inválido.' });
  }

  try {
    // Acessando a coleção no MongoDB dinamicamente
    const item = await mongoose.connection.db.collection(collection).findOne({ _id: new mongoose.Types.ObjectId(id) });
    
    if (item) {
      console.log(`Item encontrado na coleção ${collection}:`, item); // Log para depuração
      res.json(item);  // Retorna os dados do item
    } else {
      console.log('Item não encontrado'); // Log para depuração
      res.status(404).json({ message: 'Item não encontrado' });
    }
  } catch (err) {
    console.error('Erro ao buscar item:', err);
    res.status(500).json({ message: 'Erro ao buscar item. Tente novamente mais tarde.' });
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
