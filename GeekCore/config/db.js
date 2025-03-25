const mongoose = require('mongoose');
const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        dbName: 'conteudo',
      });
      console.log('Conectado ao MongoDB - Banco de dados: conteudo');
    } catch (err) {
      console.error('Erro ao conectar no MongoDB:', err);
      setTimeout(connectDB, 5000); // Tenta reconectar após 5 segundos
    }
  };
  

module.exports = connectDB;
