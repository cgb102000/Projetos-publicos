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
        console.warn('Dados recebidos:', { conteudoId, tipo });
        throw new Error('ID do conteúdo e tipo são obrigatórios');
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      // Log para debug
      console.log('Enviando requisição de favorito:', {
        conteudo_id: conteudoId,
        tipo,
        collection: tipo === 'anime' ? 'animes' : 'filmes'
      });

      const { data } = await api.post('/api/auth/favoritos', {
        conteudo_id: conteudoId,
        tipo: tipo.toLowerCase(),
        collection: tipo.toLowerCase() === 'anime' ? 'animes' : 'filmes'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      return data;
    } catch (error) {
      console.error('Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.response?.status === 401) {
        throw new Error('Faça login para favoritar');
      }
      if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Dados inválidos');
      }
      throw new Error('Erro ao favoritar. Tente novamente.');
    }
  },

  async getFavorites() {
    const { data } = await api.get('/api/auth/favoritos');
    return data;
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
      console.log(`Requisitando recomendações para: ${collection}`);
      const { data } = await api.get(`/api/random/${collection}`);
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
