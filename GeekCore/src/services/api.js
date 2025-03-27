import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  timeout: 10000,
  withCredentials: true
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Melhorar o interceptor de erro
api.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Erro de conexão - Servidor está rodando?');
      // Tentar reconectar
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(api(error.config));
        }, 3000);
      });
    }
    
    console.error('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url
    });
    
    return Promise.reject(error);
  }
);

export const authService = {
  async login(email, senha) {
    const { data } = await api.post('/api/auth/login', { email, senha });
    return data;
  },

  async register(nome, email, senha) {
    const { data } = await api.post('/api/auth/register', { nome, email, senha });
    return data;
  },

  async toggleFavorite(conteudoId, tipo) {
    try {
      if (!conteudoId || !tipo) {
        throw new Error('ID do conteúdo e tipo são obrigatórios');
      }

      const { data } = await api.post('/api/auth/favoritos', {
        conteudo_id: conteudoId,
        tipo: tipo.toLowerCase().replace('s', '')
      });

      // Garantir que temos o status do favorito na resposta
      return {
        ...data,
        isFavorited: data.isFavorited ?? false
      };
    } catch (error) {
      console.error('Detalhes do erro:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Erro ao favoritar. Tente novamente.');
    }
  },

  async getFavorites() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return [];

      const { data } = await api.get('/api/auth/favoritos');
      return Array.isArray(data) ? data.map(fav => ({
        ...fav,
        _id: fav._id || fav.conteudo_id
      })) : [];
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      return [];
    }
  },

  async getUserProfile() {
    const { data } = await api.get('/api/auth/perfil');
    return data;
  },

  async updateUserProfile(profileData) {
    try {
      const { data } = await api.put('/api/auth/perfil', profileData);
      
      // Atualizar o usuário no localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return data;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  },

  async changePassword(senhaAtual, novaSenha) {
    try {
      const { data } = await api.post('/api/auth/change-password', {
        senha_atual: senhaAtual,
        nova_senha: novaSenha
      });
      return data;
    } catch (error) {
      throw error;
    }
  }
};

export const contentService = {
  // Cache para armazenar resultados recentes
  _cache: new Map(),
  _cacheTimeout: 5 * 60 * 1000, // 5 minutos

  async getFromCacheOrFetch(key, fetchFn) {
    const cached = this._cache.get(key);
    if (cached && Date.now() - cached.timestamp < this._cacheTimeout) {
      return cached.data;
    }
    const data = await fetchFn();
    this._cache.set(key, { data, timestamp: Date.now() });
    return data;
  },

  async getRecentContent() {
    return this.getFromCacheOrFetch('recent', async () => {
      const { data } = await api.get('/api/recent');
      return data;
    });
  },

  async searchContent(query) {
    const { data } = await api.get(`/api/search?q=${encodeURIComponent(query)}`);
    return data;
  },

  async getItem(collection, id) {
    try {
      if (!id || !collection) {
        throw new Error('ID ou collection inválidos');
      }

      // Log para debug
      console.log('Requisição getItem:', { collection, id });

      const { data } = await api.get(`/api/item/${collection}/${id}`);
      
      if (!data) {
        throw new Error('Item não encontrado');
      }

      // Log do dado recebido
      console.log('Dados recebidos:', data);

      return {
        ...data,
        collection: collection,
        tipo: collection === 'animes' ? 'anime' : 'filme'
      };
    } catch (error) {
      // Melhor tratamento de erro
      const errorMessage = error.response?.data?.message || error.message;
      console.error('Erro ao buscar item:', {
        error: errorMessage,
        collection,
        id,
        status: error.response?.status
      });
      throw new Error(errorMessage);
    }
  },

  async getRecommendations(collection) {
    try {
      console.log(`Buscando recomendações para: ${collection}`);
      const { data } = await api.get(`/api/random/${collection}`);
      
      if (!data || !Array.isArray(data)) {
        console.warn('Dados de recomendação inválidos:', data);
        return [];
      }

      return data.map(item => ({
        ...item,
        collection: collection,
        tipo: collection === 'animes' ? 'anime' : 'filme'
      }));
    } catch (error) {
      console.error('Erro ao buscar recomendações:', error);
      return [];
    }
  }
};

export default api;
