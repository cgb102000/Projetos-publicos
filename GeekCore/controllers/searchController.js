const Movie = require('../models/Movie');
const escapeRegex = require('../utils/escapeRegex');
const Anime = require('../models/Anime');

async function searchContent(req, res) {
  const query = req.query.q;  // Recebe a query da URL
  try {
    const movieResults = await Movie.find({
      $or: [
        { title: { $regex: escapeRegex(query), $options: 'i' } }
      ]
    }).select('title category coverImage');  // Selecione apenas os campos necessários

    const animeResults = await Anime.find({
      $or: [
        { title: { $regex: escapeRegex(query), $options: 'i' } }
      ]
    }).select('title category coverImage');  // Selecione apenas os campos necessários

    res.json([...movieResults, ...animeResults]);  // Retorna resultados de ambas as collections
  } catch (error) {
    res.status(500).json({ error: 'Erro ao realizar busca' });
  }
}

module.exports = { searchContent };
