const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

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

// Gerenciar favoritos
router.post('/favoritos', auth, async (req, res) => {
  try {
    const { conteudo_id, tipo } = req.body;
    const user = req.user;

    const jaFavoritado = user.favoritos.find(f => 
      f.conteudo_id.toString() === conteudo_id && f.tipo === tipo
    );

    if (jaFavoritado) {
      user.favoritos = user.favoritos.filter(f => 
        f.conteudo_id.toString() !== conteudo_id || f.tipo !== tipo
      );
    } else {
      user.favoritos.push({ conteudo_id, tipo });
    }

    await user.save();
    res.json(user.favoritos);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Listar favoritos
router.get('/favoritos', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const favoritosDetalhados = await Promise.all(user.favoritos.map(async fav => {
      const collection = fav.tipo === 'anime' ? 'animes' : 'filmes';
      const item = await mongoose.connection.db.collection(collection)
        .findOne({ _id: fav.conteudo_id });
      return { ...item, tipo: fav.tipo };
    }));

    res.json(favoritosDetalhados);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
