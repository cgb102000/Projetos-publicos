const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true
  },
  descricao: String,
  url: String,
  img_url: String,
  img_capa_url: String,
  categoria: String,
  generos: [String],
  data_adicao: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Video', videoSchema);
