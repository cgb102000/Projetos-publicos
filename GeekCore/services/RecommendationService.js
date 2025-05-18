const mongoose = require('mongoose');
const Video = require('../models/Video');

class RecommendationService {
  // Calcula similaridade entre itens baseado em gêneros
  static calculateSimilarity(item1, item2) {
    if (!item1.generos || !item2.generos) return 0;
    
    const intersection = item1.generos.filter(g => item2.generos.includes(g));
    const union = [...new Set([...item1.generos, ...item2.generos])];
    
    return intersection.length / union.length;
  }

  // Encontra itens similares baseado em gêneros
  static async getSimilarItems(itemId, limit = 6) {
    try {
      const sourceItem = await Video.findById(itemId);
      if (!sourceItem) return [];

      const allItems = await Video.find({ _id: { $ne: sourceItem._id } });

      const similarItems = allItems
        .map(item => ({
          ...item.toObject(),
          similarity: this.calculateSimilarity(sourceItem, item)
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      return similarItems;
    } catch (error) {
      console.error('Erro ao buscar itens similares:', error);
      return [];
    }
  }

  // Gera recomendações personalizadas para o usuário
  static async getUserRecommendations(userId, limit = 10) {
    try {
      const user = await mongoose.model('User').findById(userId)
        .populate('historico.item')
        .populate('avaliacoes.item');

      if (!user) return [];

      // Calcular preferências do usuário
      const preferences = this.calculateUserPreferences(user);
      
      // Buscar todos os itens não vistos
      const watchedIds = user.historico.map(h => h.item?._id).filter(Boolean);
      const unwatchedItems = await Video.find({ _id: { $nin: watchedIds } });

      // Pontuar itens baseado nas preferências
      const scoredItems = unwatchedItems.map(item => ({
        ...item.toObject(),
        score: this.calculateItemScore(item, preferences)
      }));

      // Retornar os itens mais bem pontuados
      return scoredItems
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Erro ao gerar recomendações:', error);
      return [];
    }
  }

  // Calcula preferências do usuário baseado no histórico e avaliações
  static calculateUserPreferences(user) {
    const preferences = {
      generos: {},
      avaliacaoMedia: 0,
      totalAvaliacoes: 0
    };

    // Processar histórico
    user.historico.forEach(({ item }) => {
      if (item.generos) {
        item.generos.forEach(genero => {
          preferences.generos[genero] = (preferences.generos[genero] || 0) + 1;
        });
      }
    });

    // Processar avaliações
    if (user.avaliacoes?.length > 0) {
      user.avaliacoes.forEach(({ item, nota }) => {
        if (item.generos) {
          item.generos.forEach(genero => {
            preferences.generos[genero] = (preferences.generos[genero] || 0) + (nota / 5);
          });
        }
        preferences.avaliacaoMedia += nota;
        preferences.totalAvaliacoes++;
      });
      preferences.avaliacaoMedia /= preferences.totalAvaliacoes;
    }

    return preferences;
  }

  // Calcula pontuação de um item baseado nas preferências do usuário
  static calculateItemScore(item, preferences) {
    if (!item.generos) return 0;
    
    let score = 0;
    item.generos.forEach(genero => {
      score += preferences.generos[genero] || 0;
    });
    
    return score / item.generos.length;
  }
}

module.exports = RecommendationService;
