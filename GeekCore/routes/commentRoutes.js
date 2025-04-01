const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

// Listar comentários de um vídeo
router.get('/video/:videoId', async (req, res) => {
  try {
    const comments = await Comment.find({
      video: req.params.videoId,
      parentComment: null
    })
    .populate('usuario', 'nome foto')
    .populate({
      path: 'respostas',
      populate: {
        path: 'usuario',
        select: 'nome foto'
      }
    })
    .sort('-data_criacao');

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Adicionar comentário
router.post('/', auth, async (req, res) => {
  try {
    const { conteudo, videoId, parentCommentId } = req.body;

    const comment = new Comment({
      conteudo,
      usuario: req.user.id,
      video: videoId,
      parentComment: parentCommentId || null
    });

    await comment.save();

    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $push: { respostas: comment._id }
      });
    }

    const populatedComment = await Comment.findById(comment._id)
      .populate('usuario', 'nome foto');

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Curtir/descurtir comentário
router.post('/:id/like', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    const userIndex = comment.likes.indexOf(req.user.id);

    if (userIndex === -1) {
      comment.likes.push(req.user.id);
    } else {
      comment.likes.splice(userIndex, 1);
    }

    await comment.save();
    res.json({ likes: comment.likes.length });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Excluir comentário
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comentário não encontrado' });
    }

    // Verificar se o usuário é o autor do comentário
    if (comment.usuario.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    // Se for um comentário pai, remover todas as respostas
    if (!comment.parentComment) {
      await Comment.deleteMany({ parentComment: comment._id });
    } else {
      // Se for uma resposta, remover da lista de respostas do pai
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { respostas: comment._id }
      });
    }

    await Comment.findByIdAndDelete(comment._id);
    res.json({ message: 'Comentário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir comentário:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
