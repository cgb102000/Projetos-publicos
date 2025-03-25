const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Para analisar o corpo das requisições como JSON

// Definir os modelos de filme e anime
const Filme = mongoose.model('Filme', new mongoose.Schema({
  titulo: String,
  img_url: String,
  url: String
}, { collection: 'filmes' }));

const Anime = mongoose.model('Anime', new mongoose.Schema({
  titulo: String,
  img_url: String,
  url: String
}, { collection: 'animes' }));

// Rota para buscar itens específicos pelo ID e coleção
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

    // Verificação e log para depuração
    if (item) {
      console.log(`Item encontrado na coleção ${collection}:`, item);
      res.json(item);  // Retorna os dados do item
    } else {
      console.log('Item não encontrado');
      res.status(404).json({ message: 'Item não encontrado' });
    }
  } catch (err) {
    console.error('Erro ao buscar item:', err);
    res.status(500).json({ message: 'Erro ao buscar item. Tente novamente mais tarde.' });
  }
});

// Porta para o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
