const mongoose = require('mongoose');

const connectOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'conteudo'
};

module.exports = {
  connect: async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI, connectOptions);
      console.log('MongoDB conectado com sucesso');
      
      // Criar índices para melhor performance
      const db = mongoose.connection.db;
      await Promise.all([
        db.collection('animes').createIndex({ titulo: 1 }),
        db.collection('filmes').createIndex({ titulo: 1 }),
        db.collection('animes').createIndex({ categoria: 1 }),
        db.collection('filmes').createIndex({ categoria: 1 }),
        db.collection('comments').createIndex({ video: 1 }),
        db.collection('comments').createIndex({ usuario: 1 }),
        db.collection('comments').createIndex({ parentComment: 1 })
      ]);
    } catch (err) {
      console.error('Erro na conexão com MongoDB:', err);
      process.exit(1);
    }
  }
};
