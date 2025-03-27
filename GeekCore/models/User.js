const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true
  },
  senha: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: 6
  },
  favoritos: [{
    conteudo_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    tipo: {
      type: String,
      enum: ['anime', 'filme'],
      required: true
    }
  }],
  data_criacao: {
    type: Date,
    default: Date.now
  }
});

// Hash da senha antes de salvar
userSchema.pre('save', async function(next) {
  if (!this.isModified('senha')) return next();
  this.senha = await bcrypt.hash(this.senha, 12);
  next();
});

// Método para verificar senha
userSchema.methods.verificarSenha = async function(senhaInformada) {
  return await bcrypt.compare(senhaInformada, this.senha);
};

module.exports = mongoose.model('User', userSchema);
