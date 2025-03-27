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
    const user = await User.findOne({ email });
    
    if (!user || !(await user.verificarSenha(senha))) {
      throw new Error('Email ou senha inválidos');
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({ user, token });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

// Rota para favoritar/desfavoritar
router.post('/favoritos', auth, async (req, res) => {
  try {
    const { conteudo_id, tipo } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const favoritoIndex = user.favoritos.findIndex(
      f => f.conteudo_id.toString() === conteudo_id && f.tipo === tipo
    );

    if (favoritoIndex > -1) {
      user.favoritos.splice(favoritoIndex, 1);
    } else {
      user.favoritos.push({ conteudo_id, tipo });
    }

    await user.save();
    
    res.json({
      message: 'Favoritos atualizados com sucesso',
      favoritos: user.favoritos,
      isFavorited: favoritoIndex === -1
    });
  } catch (error) {
    console.error('Erro ao atualizar favoritos:', error);
    res.status(500).json({ message: error.message });
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
        const collection = fav.tipo === 'anime' ? 'animes' : 'filmes';
        const item = await mongoose.connection.db.collection(collection)
          .findOne({ _id: new mongoose.Types.ObjectId(fav.conteudo_id) });
          
        if (item) {
          return {
            ...item,
            tipo: fav.tipo,
            collection,
            favorito_em: fav.adicionado_em
          };
        }
        return null;
      })
    );

    // Filtrar itens nulos (não encontrados)
    const validFavoritos = favoritos.filter(f => f !== null);
    res.json(validFavoritos);
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
