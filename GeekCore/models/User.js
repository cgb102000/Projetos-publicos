const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const favoritoSchema = new mongoose.Schema({
  conteudo_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    validate: {
      validator: mongoose.Types.ObjectId.isValid,
      message: 'ID do conteúdo inválido'
    }
  },
  tipo: {
    type: String,
    enum: ['anime', 'filme', 'serie', 'video'], // Adicionando 'serie' como opção válida
    required: true
  },
  adicionado_em: {
    type: Date,
    default: Date.now
  }
});

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
  descricao: { 
    type: String, 
    default: '' 
  },
  foto: { 
    type: String, 
    default: '' 
  },
  favoritos: [favoritoSchema],
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
  try {
    return await bcrypt.compare(senhaInformada, this.senha);
  } catch (error) {
    console.error('Erro ao verificar senha:', error);
    return false;
  }
};

module.exports = mongoose.model('User', userSchema);
