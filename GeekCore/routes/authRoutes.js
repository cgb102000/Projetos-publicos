const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    const user = new User({ nome, email, senha });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    console.log('Tentativa de login:', { email }); // Log para debug

    if (!email || !senha) {
      return res.status(400).json({ 
        success: false,
        message: 'Email e senha são obrigatórios' 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    console.log('Usuário encontrado:', !!user); // Log para debug

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Email ou senha inválidos' 
      });
    }

    const senhaValida = await user.verificarSenha(senha);
    console.log('Senha válida:', senhaValida); // Log para debug

    if (!senhaValida) {
      return res.status(401).json({ 
        success: false,
        message: 'Email ou senha inválidos' 
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    const userResponse = user.toObject();
    delete userResponse.senha;

    res.json({
      success: true,
      user: userResponse,
      token,
      message: 'Login realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro interno no servidor' 
    });
  }
});

// Rota para favoritar/desfavoritar
router.post('/favoritos', auth, async (req, res) => {
  try {
    const { conteudo_id, tipo } = req.body;
    
    if (!conteudo_id || !tipo) {
      return res.status(400).json({ 
        success: false,
        message: 'Dados incompletos' 
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Usuário não encontrado' 
      });
    }

    // Verifica se o item já está nos favoritos
    const itemIndex = user.favoritos.findIndex(
      fav => fav.conteudo_id.toString() === conteudo_id && fav.tipo === tipo
    );

    let status = false;
    let message = '';

    if (itemIndex !== -1) {
      // Remove o item
      user.favoritos.splice(itemIndex, 1);
      status = false;
      message = '❌ Item removido dos favoritos';
    } else {
      // Adiciona o item
      user.favoritos.push({ conteudo_id, tipo });
      status = true;
      message = '❤️ Item adicionado aos favoritos';
    }

    await user.save();

    res.status(200).json({
      success: true,
      isFavorito: status,
      message: message,
      favoritos: user.favoritos
    });

  } catch (error) {
    console.error('Erro ao atualizar favoritos:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao atualizar favoritos',
      error: error.message 
    });
  }
});

// Rota para listar favoritos
router.get('/favoritos', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const favoritos = await Promise.all(
      user.favoritos.map(async (fav) => {
        try {
          const item = await mongoose.connection.db.collection('videos')
            .findOne({ _id: new mongoose.Types.ObjectId(fav.conteudo_id) });
            
          if (item) {
            return {
              ...item,
              tipo: fav.tipo,
              favorito_em: fav.adicionado_em,
              isFavorito: true
            };
          }
        } catch (err) {
          console.error(`Erro ao buscar item ${fav.conteudo_id}:`, err);
        }
        return null;
      })
    );

    const validFavoritos = favoritos.filter(f => f !== null);
    res.json(validFavoritos);
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    res.status(500).json({ message: error.message });
  }
});

// Obter perfil do usuário
router.get('/perfil', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    res.json({
      nome: user.nome,
      email: user.email,
      descricao: user.descricao || '',
      foto: user.foto || '',
      tema_cor: user.tema_cor || '#ef4444'
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar perfil do usuário' });
  }
});

// Atualizar perfil do usuário
router.put('/perfil', auth, async (req, res) => {
  try {
    const { nome, descricao, foto, tema_cor } = req.body;
    
    // Validar tamanho da foto
    if (foto && foto.length > 2 * 1024 * 1024) { // 2MB
      return res.status(413).json({ 
        message: 'Imagem muito grande. Máximo permitido: 2MB' 
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Atualizar campos
    if (nome) user.nome = nome;
    if (descricao !== undefined) user.descricao = descricao;
    if (tema_cor) user.tema_cor = tema_cor;
    if (foto && foto.startsWith('data:image')) {
      user.foto = foto;
    }

    await user.save();
    
    res.json({
      message: 'Perfil atualizado com sucesso',
      user: {
        nome: user.nome,
        email: user.email,
        descricao: user.descricao,
        foto: user.foto,
        tema_cor: user.tema_cor
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro ao atualizar perfil do usuário' });
  }
});

// Nova rota para alteração de senha
router.post('/change-password', auth, async (req, res) => {
  try {
    const { senha_atual, nova_senha } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const senhaValida = await user.verificarSenha(senha_atual);
    if (!senhaValida) {
      return res.status(400).json({ message: 'Senha atual incorreta' });
    }

    user.senha = nova_senha;
    await user.save();

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ message: 'Erro ao alterar senha' });
  }
});

module.exports = router;
