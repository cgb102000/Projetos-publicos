const mongoose = require('mongoose');

const animeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String },
  coverImage: { type: String },
  // outros campos que você precisar
});

module.exports = mongoose.model('Anime', animeSchema);
