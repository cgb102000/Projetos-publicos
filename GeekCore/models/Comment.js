const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  conteudo: {
    type: String,
    required: [true, 'Comentário não pode estar vazio'],
    maxlength: 1000
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  respostas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  data_criacao: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Comment', commentSchema);
