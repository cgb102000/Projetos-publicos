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
  },
  amigos: [{
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    adicionado_em: {
      type: Date,
      default: Date.now
    }
  }],
  solicitacoes_amizade: [{
    de: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pendente', 'aceito', 'rejeitado'],
      default: 'pendente'
    },
    data: {
      type: Date,
      default: Date.now
    }
  }],
  bloqueados: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  bloqueadoPor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
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

// Método para verificar se já são amigos
userSchema.methods.isAmigo = function(userId) {
  return this.amigos.some(amigo => amigo.usuario.toString() === userId.toString());
};

// Método para verificar se já existe solicitação pendente
userSchema.methods.temSolicitacaoPendente = function(userId) {
  return this.solicitacoes_amizade.some(
    sol => sol.de.toString() === userId.toString() && sol.status === 'pendente'
  );
};

// Método para limpar amigos deletados
userSchema.methods.limparAmigosDeletedos = async function() {
  // Filtrar amigos que ainda existem
  const amigosValidos = [];
  for (const amigo of this.amigos) {
    const usuarioExiste = await mongoose.model('User').findById(amigo.usuario);
    if (usuarioExiste) {
      amigosValidos.push(amigo);
    }
  }
  this.amigos = amigosValidos;

  // Filtrar solicitações de usuários que ainda existem
  const solicitacoesValidas = [];
  for (const solicitacao of this.solicitacoes_amizade) {
    const usuarioExiste = await mongoose.model('User').findById(solicitacao.de);
    if (usuarioExiste) {
      solicitacoesValidas.push(solicitacao);
    }
  }
  this.solicitacoes_amizade = solicitacoesValidas;

  return this.save();
};

// Método para atualizar informações do perfil
userSchema.methods.atualizarPerfil = async function(dados) {
  const camposPermitidos = ['nome', 'descricao', 'foto'];
  Object.keys(dados).forEach(key => {
    if (camposPermitidos.includes(key)) {
      this[key] = dados[key];
    }
  });
  return this.save();
};

// Método para obter informações públicas do perfil
userSchema.methods.getPerfilPublico = function() {
  return {
    id: this._id,
    nome: this.nome,
    descricao: this.descricao,
    foto: this.foto,
    amigos: this.amigos.length
  };
};

module.exports = mongoose.model('User', userSchema);
