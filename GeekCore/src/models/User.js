const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  senha: {
    type: String,
    required: true
  },
  descricao: {
    type: String,
    default: ''
  },
  foto: {
    type: String,
    default: ''
  },
  favoritos: [
    {
      conteudo_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      tipo: {
        type: String,
        required: true
      },
      adicionado_em: {
        type: Date,
        default: Date.now
      }
    }
  ],
  tema_cor: {
    type: String,
    default: '#ef4444'
  }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) return next();
  const salt = await bcrypt.genSalt(10);
  this.senha = await bcrypt.hash(this.senha, salt);
  next();
});

userSchema.methods.verificarSenha = async function (senha) {
  return bcrypt.compare(senha, this.senha);
};

module.exports = mongoose.model('User', userSchema);