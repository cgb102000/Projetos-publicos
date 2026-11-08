require('./utils/compatNode');
const express = require('express');
const escapeRegex = require('./utils/escapeRegex');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const auth = require('./middleware/auth'); // Adicione esta linha
const User = require('./models/User'); // Importar o modelo User
require('dotenv').config();

if (!process.env.JWT_SECRET || /^sua_chave/i.test(process.env.JWT_SECRET)) {
  console.warn('Aviso: defina um JWT_SECRET forte no .env (veja .env.example). O valor atual permite forjar logins.');
}

const app = express();

// Middlewares
// Origens liberadas: front-ends locais, o GeekHub no GitHub Pages e as listadas em CORS_ORIGINS (separadas por vírgula)
const origensPermitidas = [
  'https://cgb102000.github.io',
  ...(process.env.CORS_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean)
];
app.use(cors({
  origin: (origin, callback) => {
    const local = !origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    callback(null, local || origensPermitidas.includes(origin));
  },
  credentials: true
}));
// Limite de 3 MB: a foto de perfil vai em base64 no JSON (o padrão de 100 KB recusava qualquer foto)
app.use(express.json({ limit: '3mb' }));

// Servir o React build primeiro: o public/index.html é só o template, sem os scripts
app.use(express.static(path.join(__dirname, 'build')));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de log para debug
const logMiddleware = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
};

app.use(logMiddleware);

// Garante a conexão com o MongoDB antes das rotas da API (necessário no modo serverless da Vercel)
app.use('/api', async (req, res, next) => {
  if (req.path === '/health') return next();
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ message: 'Banco de dados indisponível. Tente novamente em instantes.' });
  }
});

// Importar rotas de autenticação
const authRoutes = require('./routes/authRoutes');

// Registrar apenas as rotas de autenticação
app.use('/api/auth', authRoutes);

// Remover importação e uso das rotas de comentários
// const commentRoutes = require('./routes/commentRoutes');
// app.use('/api/comments', commentRoutes);

// Conexão com o MongoDB reaproveitada entre requisições; se falhar, a próxima requisição tenta de novo
let conexao = null;
const connectDB = () => {
  if (!process.env.MONGO_URI) {
    return Promise.reject(new Error('MONGO_URI não definida no arquivo .env'));
  }
  if (!conexao) {
    conexao = mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
      .then((c) => {
        console.log('Conectado ao MongoDB - Banco de dados:', c.connection.db.databaseName);
        return c;
      })
      .catch((err) => {
        console.error('Erro ao conectar no MongoDB:', err.message);
        conexao = null;
        throw err;
      });
  }
  return conexao;
};

// Middleware para validar ObjectId
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  try {
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'ID inválido ou não fornecido' });
    }

    // Tenta converter para ObjectId
    try {
      new mongoose.Types.ObjectId(id);
    } catch (err) {
      return res.status(400).json({ 
        message: 'Formato de ID inválido',
        details: 'O ID deve ser um ObjectId válido do MongoDB'
      });
    }

    next();
  } catch (error) {
    console.error('Erro ao validar ObjectId:', error);
    res.status(400).json({ message: 'ID inválido' });
  }
};

// Adicionar rota de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Mover rota inicial para antes das outras rotas
app.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo ao servidor de Filmes e Animes!' });
});

// Rota para buscar itens com base no parâmetro de pesquisa
app.get('/api/search', async (req, res) => {
  const query = req.query.q;

  if (!query || query.trim() === '') {
    return res.status(400).json({ message: 'Termo de pesquisa inválido.' });
  }

  try {
    const results = await mongoose.connection.db.collection('videos')
      .find({ titulo: { $regex: escapeRegex(query.trim()), $options: 'i' } })
      .toArray();

    if (results.length > 0) {
      res.json(results);
    } else {
      res.status(404).json({ message: 'Nenhum item encontrado para o termo de pesquisa.' });
    }
  } catch (err) {
    console.error('Erro ao buscar itens:', err.message);
    res.status(500).json({ message: 'Erro ao buscar itens. Tente novamente mais tarde.' });
  }
});

// Corrigir rota de busca de item específico
app.get('/api/item/:id', validateObjectId, async (req, res) => {
  const { id } = req.params;

  try {
    const objectId = new mongoose.Types.ObjectId(id);
    const item = await mongoose.connection.db.collection('videos').findOne({ _id: objectId });

    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado.' });
    }

    res.json(item);
  } catch (err) {
    console.error('Erro ao buscar item:', err);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para pegar recomendações
app.get('/api/random', async (req, res) => {
  try {
    const items = await mongoose.connection.db.collection('videos')
      .aggregate([{ $sample: { size: 6 } }])
      .toArray();

    res.json(items);
  } catch (err) {
    console.error('Erro ao buscar recomendações:', err);
    res.status(500).json({ message: 'Erro ao buscar recomendações' });
  }
});

// Rota para buscar itens recentes
app.get('/api/recent', async (req, res) => {
  try {
    const recentItems = await mongoose.connection.db.collection('videos')
      .find()
      .sort({ _id: -1 })
      .limit(20)
      .toArray();

    res.json(recentItems);
  } catch (error) {
    console.error('Erro ao buscar itens recentes:', error.message);
    res.status(500).json({ message: 'Erro ao buscar itens recentes' });
  }
});

// Rota para buscar categorias disponíveis
app.get('/api/categories', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Conexão com o banco de dados não estabelecida');
    }

    const categories = await db.collection('videos').distinct('categoria');

    if (!categories.length) {
      return res.status(404).json({ message: 'Nenhuma categoria encontrada' });
    }

    res.json(categories);
  } catch (err) {
    console.error('Erro ao buscar categorias:', err.message);
    res.status(500).json({ message: 'Erro ao buscar categorias', error: err.message });
  }
});

// Rota para buscar itens por categoria
app.get('/api/category/:category', async (req, res) => {
  const { category } = req.params;

  try {
    const results = await mongoose.connection.db.collection('videos')
      // Categoria exata: "ação" não pode casar com "animação"
      .find({ categoria: { $regex: `^${escapeRegex(category)}$`, $options: 'i' } })
      .toArray();

    if (results.length > 0) {
      res.json(results);
    } else {
      res.status(404).json({ message: 'Nenhum item encontrado nesta categoria.' });
    }
  } catch (err) {
    console.error('Erro ao buscar por categoria:', err);
    res.status(500).json({ message: 'Erro ao buscar itens por categoria.' });
  }
});

// Todas as outras requisições GET não tratadas retornarão nosso app React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'), (err) => {
    if (err) res.status(404).json({ message: 'Rota não encontrada' });
  });
});

// Tratamento de erro para rotas não encontradas (404)
app.use((req, res) => {
  res.status(404).send('Página não encontrada!');
});

// Middleware global para tratar erros
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Imagem muito grande. Máximo permitido: 2MB' });
  }
  res.status(err.status || 500).json({ 
    message: err.message || 'Erro interno do servidor',
    path: req.path
  });
});

// Inicia o servidor local (npm run api / npm run dev). Na Vercel o app é exportado e não chama listen.
const startServer = () => {
  const port = process.env.PORT || 3001;
  const server = app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
  server.on('error', (err) => {
    console.error('Erro no servidor:', err);
    process.exit(1);
  });
  connectDB().catch(() => {});
};

if (require.main === module) {
  startServer();
}

module.exports = app;
