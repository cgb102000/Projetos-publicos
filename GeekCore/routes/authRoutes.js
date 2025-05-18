const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

// Rotas públicas (sem auth)
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

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    console.log('Tentativa de login:', { email });

    if (!email || !senha) {
      return res.status(400).json({ 
        success: false,
        message: 'Email e senha são obrigatórios' 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    console.log('Usuário encontrado:', !!user);

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Email ou senha inválidos' 
      });
    }

    const senhaValida = await user.verificarSenha(senha);
    console.log('Senha válida:', senhaValida);

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

// Rotas protegidas (com auth)
// Adicionar middleware auth apenas nas rotas que precisam de autenticação
router.use(auth); // Aplica auth em todas as rotas abaixo

// Rota para favoritar/desfavoritar
router.post('/favoritos', async (req, res) => {
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
router.get('/favoritos', async (req, res) => {
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
            // Garantir que a URL da imagem seja absoluta
            const img_url = item.img_url?.startsWith('http') 
              ? item.img_url 
              : `${process.env.API_URL}${item.img_url}`;

            return {
              ...item,
              img_url,
              tipo: fav.tipo,
              favorito_em: fav.adicionado_em,
              isFavorito: true
            };
          }
          return null;
        } catch (err) {
          console.error(`Erro ao buscar item ${fav.conteudo_id}:`, err);
          return null;
        }
      })
    );

    // Filtrar itens nulos e retornar array
    res.json(favoritos.filter(f => f !== null));
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    res.status(500).json({ message: 'Erro ao buscar favoritos' });
  }
});

// Obter perfil do usuário
router.get('/perfil', async (req, res) => {
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

// Obter perfil público do usuário
router.get('/perfil/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('nome email descricao foto data_criacao amigos favoritos tema_cor')
      .populate('amigos.usuario', 'nome foto');

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({
      id: user._id,
      nome: user.nome,
      descricao: user.descricao,
      foto: user.foto,
      data_criacao: user.data_criacao,
      amigos: user.amigos,
      favoritos: user.favoritos,
      tema_cor: user.tema_cor || '#ef4444'
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar perfil do usuário' });
  }
});

// Atualizar perfil do usuário
router.put('/perfil', async (req, res) => {
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
router.post('/change-password', async (req, res) => {
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

// Enviar solicitação de amizade
router.post('/amizade/solicitar', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email é obrigatório' 
      });
    }

    // Usando lean() para busca mais rápida
    const usuarioDestino = await User.findOne({ email: email.toLowerCase() }).lean();
    const usuarioOrigem = await User.findById(req.user.id).lean();

    if (!usuarioDestino) {
      return res.status(404).json({ 
        success: false,
        message: 'Usuário não encontrado' 
      });
    }

    if (usuarioDestino._id.toString() === req.user.id) {
      return res.status(400).json({ 
        success: false,
        message: 'Você não pode adicionar a si mesmo' 
      });
    }

    // Otimizando a verificação de amizade
    const jaAmigos = await User.exists({
      _id: usuarioDestino._id,
      'amigos.usuario': req.user.id
    });

    if (jaAmigos) {
      return res.status(400).json({ 
        success: false,
        message: 'Vocês já são amigos' 
      });
    }

    // Otimizando verificação de solicitação pendente
    const solicitacaoExiste = await User.exists({
      _id: usuarioDestino._id,
      'solicitacoes_amizade': {
        $elemMatch: {
          de: req.user.id,
          status: 'pendente'
        }
      }
    });

    if (solicitacaoExiste) {
      return res.status(400).json({ 
        success: false,
        message: 'Já existe uma solicitação pendente' 
      });
    }

    // Atualizando diretamente sem carregar todo o documento
    await User.updateOne(
      { _id: usuarioDestino._id },
      {
        $push: {
          solicitacoes_amizade: {
            de: req.user.id,
            status: 'pendente'
          }
        }
      }
    );

    res.json({
      success: true,
      message: 'Solicitação enviada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao processar solicitação:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao processar solicitação'
    });
  }
});

// Responder solicitação de amizade
router.post('/amizade/responder', async (req, res) => {
  try {
    const { solicitacaoId, aceitar } = req.body;
    const usuario = await User.findById(req.user.id);
    
    const solicitacao = usuario.solicitacoes_amizade.id(solicitacaoId);
    if (!solicitacao) {
      return res.status(404).json({ message: 'Solicitação não encontrada' });
    }

    solicitacao.status = aceitar ? 'aceito' : 'rejeitado';

    if (aceitar) {
      // Adicionar amizade para ambos os usuários
      const outroUsuario = await User.findById(solicitacao.de);
      
      usuario.amigos.push({ usuario: solicitacao.de });
      outroUsuario.amigos.push({ usuario: usuario._id });
      
      await Promise.all([usuario.save(), outroUsuario.save()]);
    } else {
      await usuario.save();
    }

    res.json({ 
      message: aceitar ? 'Solicitação aceita' : 'Solicitação rejeitada',
      status: solicitacao.status
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao responder solicitação' });
  }
});

// Listar amigos
router.get('/amigos', async (req, res) => {
  try {
    const usuario = await User.findById(req.user.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Limpar amigos deletados antes de retornar
    await usuario.limparAmigosDeletedos();
    
    // Buscar dados atualizados dos amigos
    await usuario.populate('amigos.usuario', 'nome email foto');
    
    // Filtrar apenas amigos válidos
    const amigosValidos = usuario.amigos.filter(amigo => amigo.usuario);
    
    res.json(amigosValidos);
  } catch (error) {
    console.error('Erro ao listar amigos:', error);
    res.status(500).json({ message: 'Erro ao listar amigos' });
  }
});

// Listar solicitações pendentes
router.get('/amizade/solicitacoes', async (req, res) => {
  try {
    const usuario = await User.findById(req.user.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Limpar solicitações de usuários deletados
    await usuario.limparAmigosDeletedos();
    
    await usuario.populate('solicitacoes_amizade.de', 'nome email foto');
    
    const solicitacoesPendentes = usuario.solicitacoes_amizade
      .filter(s => s.status === 'pendente' && s.de);
    
    res.json(solicitacoesPendentes);
  } catch (error) {
    console.error('Erro ao listar solicitações:', error);
    res.status(500).json({ message: 'Erro ao listar solicitações' });
  }
});

// Obter favoritos de um usuário específico
router.get('/favoritos/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Garantir que favoritos existe e é um array
    const favoritosArray = user.favoritos || [];

    const favoritos = await Promise.all(
      favoritosArray.map(async (fav) => {
        try {
          const item = await mongoose.connection.db
            .collection('videos')
            .findOne({ _id: new mongoose.Types.ObjectId(fav.conteudo_id) });
          
          if (item) {
            return {
              ...item,
              tipo: fav.tipo,
              favorito_em: fav.adicionado_em
            };
          }
        } catch (err) {
          console.error(`Erro ao buscar item ${fav.conteudo_id}:`, err);
        }
        return null;
      })
    );

    // Filtrar itens nulos e retornar array vazio se não houver favoritos
    res.json(favoritos.filter(f => f !== null) || []);
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    // Retornar array vazio em caso de erro
    res.json([]);
  }
});

// Rota para remover amigo
router.delete('/amizade/remover/:id', auth, async (req, res) => {
  try {
    const usuario = await User.findById(req.user.id);
    const amigoId = req.params.id;

    usuario.amigos = usuario.amigos.filter(
      amigo => amigo.usuario.toString() !== amigoId
    );

    // Remover amizade do outro usuário também
    await User.updateOne(
      { _id: amigoId },
      { $pull: { amigos: { usuario: req.user.id } } }
    );

    await usuario.save();
    
    res.json({ 
      success: true,
      message: 'Amigo removido com sucesso'
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover amigo' });
  }
});

// Rota para bloquear usuário
router.post('/amizade/bloquear/:id', auth, async (req, res) => {
  try {
    const usuario = await User.findById(req.user.id);
    const usuarioParaBloquear = req.params.id;

    // Remover amizade
    usuario.amigos = usuario.amigos.filter(
      amigo => amigo.usuario.toString() !== usuarioParaBloquear
    );

    // Adicionar à lista de bloqueados
    if (!usuario.bloqueados) {
      usuario.bloqueados = [];
    }
    usuario.bloqueados.push(usuarioParaBloquear);

    // Remover amizade do outro usuário também
    await User.updateOne(
      { _id: usuarioParaBloquear },
      { 
        $pull: { amigos: { usuario: req.user.id } },
        $push: { bloqueadoPor: req.user.id }
      }
    );

    await usuario.save();
    
    res.json({
      success: true,
      message: 'Usuário bloqueado com sucesso'
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao bloquear usuário' });
  }
});

// Rota para listar bloqueados
router.get('/bloqueados', auth, async (req, res) => {
  try {
    const usuario = await User.findById(req.user.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Buscar dados dos usuários bloqueados
    const bloqueados = await User.find(
      { _id: { $in: usuario.bloqueados } },
      'nome email foto'
    );

    res.json(bloqueados);
  } catch (error) {
    console.error('Erro ao listar bloqueados:', error);
    res.status(500).json({ message: 'Erro ao listar bloqueados' });
  }
});

// Rota para desbloquear usuário
router.post('/amizade/desbloquear/:id', auth, async (req, res) => {
  try {
    const usuario = await User.findById(req.user.id);
    const usuarioParaDesbloquear = req.params.id;

    // Remover da lista de bloqueados
    usuario.bloqueados = usuario.bloqueados.filter(
      id => id.toString() !== usuarioParaDesbloquear
    );

    // Remover da lista de bloqueadoPor do outro usuário
    await User.updateOne(
      { _id: usuarioParaDesbloquear },
      { $pull: { bloqueadoPor: req.user.id } }
    );

    await usuario.save();
    
    res.json({
      success: true,
      message: 'Usuário desbloqueado com sucesso'
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao desbloquear usuário' });
  }
});

// Notificações: listar
router.get('/notificacoes', async (req, res) => {
  try {
    const usuario = await User.findById(req.user.id);
    if (!usuario) return res.status(404).json([]);
    // Garante que notificacoes é array
    const notificacoes = Array.isArray(usuario.notificacoes) ? usuario.notificacoes : [];
    // Adiciona _id se não existir (para notificações antigas)
    notificacoes.forEach(n => {
      if (!n._id) n._id = new mongoose.Types.ObjectId();
    });
    // Ordenar por data decrescente
    notificacoes.sort((a, b) => new Date(b.data) - new Date(a.data));
    res.json(notificacoes);
  } catch (error) {
    res.status(500).json([]);
  }
});

// Notificações: marcar como lida
router.post('/notificacoes/:id/ler', async (req, res) => {
  try {
    const usuario = await User.findById(req.user.id);
    if (!usuario) return res.status(404).json({ success: false });

    // Corrige busca pelo _id da notificação
    const noti = (usuario.notificacoes || []).find(n => n._id?.toString() === req.params.id);
    if (noti) {
      noti.lida = true;
      await usuario.save();
      return res.json({ success: true });
    }
    res.status(404).json({ success: false });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// Deletar notificação individual
router.delete('/notificacoes/:id', async (req, res) => {
  try {
    const usuario = await User.findById(req.user.id);
    if (!usuario) return res.status(404).json({ success: false });

    usuario.notificacoes = (usuario.notificacoes || []).filter(n => n._id?.toString() !== req.params.id);
    await usuario.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// Limpar todas as notificações
router.delete('/notificacoes', async (req, res) => {
  try {
    const usuario = await User.findById(req.user.id);
    if (!usuario) return res.status(404).json({ success: false });

    usuario.notificacoes = [];
    await usuario.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// Compartilhamento: criar notificação para o amigo
router.post('/share', async (req, res) => {
  try {
    const { amigoId, itemId } = req.body;
    const usuarioOrigem = await User.findById(req.user.id);
    const usuarioDestino = await User.findById(amigoId);
    if (!usuarioDestino) return res.status(404).json({ success: false, message: 'Amigo não encontrado' });

    // Adicionar notificação ao amigo
    usuarioDestino.notificacoes = usuarioDestino.notificacoes || [];
    usuarioDestino.notificacoes.push({
      _id: new mongoose.Types.ObjectId(),
      mensagem: `${usuarioOrigem.nome} compartilhou um conteúdo com você!`,
      data: new Date(),
      lida: false,
      itemId: itemId || null
    });
    await usuarioDestino.save();

    res.json({ success: true, message: 'Compartilhado com sucesso!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao compartilhar' });
  }
});

module.exports = router;
