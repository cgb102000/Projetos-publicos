import axios from 'axios';

const getBaseUrl = () => {
  const hostname = window.location.hostname;
  return process.env.REACT_APP_API_URL || `http://${hostname}:3001`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  retry: 3,
  retryDelay: (retryCount) => retryCount * 1000
});

// Adicionar interceptor de retry
api.interceptors.response.use(null, async (error) => {
  const { config } = error;
  if (!config || !config.retry) {
    return Promise.reject(error);
  }
  
  config.retryCount = config.retryCount || 0;
  
  if (config.retryCount >= config.retry) {
    return Promise.reject(error);
  }
  
  config.retryCount += 1;
  await new Promise(resolve => setTimeout(resolve, config.retryDelay(config.retryCount)));
  return api(config);
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
  async error => {
    if (!error.response) {
      console.error('Erro de rede:', error.message);
      throw new Error('Servidor indisponível. Verifique sua conexão.');
    }

    if (error.response.status === 503) {
      console.error('Servidor em manutenção');
      throw new Error('Servidor em manutenção. Tente novamente em alguns instantes.');
    }

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
    try {
      console.log('Tentando login com:', { email }); // Log para debug

      const { data } = await api.post('/api/auth/login', { 
        email: email.toLowerCase().trim(),
        senha: senha
      });

      console.log('Resposta do servidor:', data); // Log para debug

      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
      }
      
      throw new Error(data.message || 'Erro ao fazer login');
    } catch (error) {
      console.error('Erro de login:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Erro ao fazer login');
    }
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

      // Corrigir o nome da propriedade para corresponder ao backend
      return {
        ...data,
        isFavorited: data.isFavorito // Aqui estava o problema
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
        conteudo_id: fav.conteudo_id || fav._id,
        _id: fav._id || fav.conteudo_id,
        isFavorito: true
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
      // Verifica o tamanho da string base64 da foto
      if (profileData.foto && profileData.foto.length > 2 * 1024 * 1024) { // 2MB em caracteres base64
        throw new Error('Imagem muito grande. Máximo: 2MB');
      }

      const { data } = await api.put('/api/auth/perfil', profileData);
      
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return data;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error.response?.data?.message || error.message || 'Erro ao atualizar perfil';
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
    try {
      // Verificar status do servidor primeiro
      await api.get('/api/health');
      
      const { data } = await api.get('/api/recent');
      if (data.length === 0) {
        console.info('Nenhum item recente encontrado.'); // Ajuste para log informativo
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Erro ao buscar conteúdo recente:', error);
      throw error;
    }
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

      const { data } = await api.get(`/api/item/${collection}/${id}`);
      if (!data) {
        throw new Error('Item não encontrado');
      }

      return {
        ...data,
        collection: collection,
        tipo: collection === 'animes' ? 'anime' : 'filme'
      };
    } catch (error) {
      console.error('Erro ao buscar item:', error.message);
      throw error;
    }
  },

  async getRecommendations(collection) {
    try {
      const { data } = await api.get(`/api/random/${collection}`);
      if (!data || !Array.isArray(data)) {
        console.warn('Dados de recomendação inválidos.');
        return [];
      }

      return data.map(item => ({
        ...item,
        collection: collection,
        tipo: collection === 'animes' ? 'anime' : 'filme'
      }));
    } catch (error) {
      console.error('Erro ao buscar recomendações:', error.message);
      return [];
    }
  }
};

export default api;
