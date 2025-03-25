const express = require('express');
const mongoose = require('mongoose');

// Defina os modelos para Filme e Anime
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

const router = express.Router();

// Rota de busca
router.get('/search', async (req, res) => {
  const { q } = req.query;

  try {
    // Buscando em ambas as coleções: 'filmes' e 'animes'
    const filmes = await Filme.find({ titulo: { $regex: q, $options: 'i' } });
    const animes = await Anime.find({ titulo: { $regex: q, $options: 'i' } });

    // Concatenando os resultados de ambas as coleções
    const results = [...filmes, ...animes];

    // Se houver resultados, retorna a lista de itens encontrados
    if (results.length > 0) {
      res.json(results);
    } else {
      res.json([]); // Retorna um array vazio se nenhum resultado for encontrado
    }
  } catch (err) {
    console.error('Erro ao buscar:', err);
    res.status(500).send('Erro ao buscar conteúdo');
  }
});

module.exports = router;
