import axios from 'axios';

const getBaseUrl = () => {
  const hostname = window.location.hostname;
  return process.env.REACT_APP_API_URL || `http://${hostname}:3001`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 3000, // Reduzido de 5000 para 3000ms
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  retry: 1, // Reduzido de 3 para 1 retry
  retryDelay: (retryCount) => retryCount * 500 // Reduzido delay entre retries
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

    // Preservar cor do tema ao recarregar estado
    const temaAtual = document.documentElement.style.getPropertyValue('--color-primary');
    if (temaAtual) {
      localStorage.setItem('tema_cor', temaAtual);
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
      console.log('Tentando login com:', { email });

      const response = await api.post('/api/auth/login', { 
        email: email.toLowerCase().trim(),
        senha: senha
      });

      const { data } = response;
      console.log('Resposta do servidor:', data);

      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
      }
      
      throw new Error(data.message || 'Erro ao fazer login');
    } catch (error) {
      console.error('Erro de login:', error.response?.data || error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Email ou senha inválidos'
      );
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

      // Atualizar o localStorage com o novo estado
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      if (data.isFavorito) {
        favorites.push(conteudoId);
      } else {
        const index = favorites.indexOf(conteudoId);
        if (index > -1) favorites.splice(index, 1);
      }
      localStorage.setItem('favorites', JSON.stringify(favorites));

      return {
        ...data,
        isFavorito: data.isFavorito,
        message: data.isFavorito 
          ? 'Item adicionado aos favoritos!' 
          : 'Item removido dos favoritos!'
      };
    } catch (error) {
      console.error('Detalhes do erro:', error.response?.data || error.message);
      throw error;
    }
  },

  async getFavorites() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return [];

      const { data } = await api.get('/api/auth/favoritos');
      
      // Garantir que todos os itens retornados tenham a propriedade isFavorited como true
      return Array.isArray(data) ? data.map(fav => ({
        ...fav,
        isFavorited: true
      })) : [];
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      return [];
    }
  },

  async getUserProfile() {
    const { data } = await api.get('/api/auth/perfil');
    
    // Salvar a cor do tema no localStorage para uso global
    if (data.tema_cor) {
      localStorage.setItem('tema_cor', data.tema_cor);
    }
    
    return data;
  },

  async getPublicProfile(userId) {
    try {
      const [profileData, favoritosData] = await Promise.all([
        api.get(`/api/auth/perfil/${userId}`),
        api.get(`/api/auth/favoritos/${userId}`)
      ]);

      return {
        ...profileData.data,
        favoritos: Array.isArray(favoritosData.data) ? favoritosData.data : []
      };
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return {
        ...profileData.data,
        favoritos: []
      };
    }
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

  async getItem(id) {
    try {
      if (!id) {
        throw new Error('ID inválido');
      }

      const { data } = await api.get(`/api/item/${id}`);
      if (!data) {
        throw new Error('Item não encontrado');
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar item:', error.message);
      throw error;
    }
  },

  async getRecommendations() {
    try {
      const { data } = await api.get('/api/random');
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar recomendações:', error.message);
      return [];
    }
  },

  async getRecentContent() {
    try {
      const { data } = await api.get('/api/recent');
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar conteúdo recente:', error.message);
      return [];
    }
  },

  async searchContent(query) {
    try {
      const { data } = await api.get(`/api/search?q=${encodeURIComponent(query)}`);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar conteúdo:', error.message);
      return [];
    }
  }
};

export const amigoService = {
  async enviarSolicitacao(email) {
    try {
      console.log('Tentando enviar solicitação para:', email);
      const response = await api.post('/api/auth/amizade/solicitar', { email }, {
        timeout: 2000 // Timeout específico para esta requisição
      });
      
      console.log('Resposta do servidor:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao enviar solicitação');
      }
      
      return response.data;
    } catch (error) {
      console.error('Erro detalhado:', error.response?.data || error);
      
      // Melhorar tratamento de erro
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(errorMessage);
    }
  },

  async responderSolicitacao(solicitacaoId, aceitar) {
    try {
      const { data } = await api.post('/api/auth/amizade/responder', { 
        solicitacaoId, 
        aceitar 
      });
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Erro ao responder solicitação';
    }
  },

  async listarAmigos() {
    try {
      const { data } = await api.get('/api/auth/amigos');
      return data;
    } catch (error) {
      console.error('Erro ao listar amigos:', error);
      return [];
    }
  },

  async listarSolicitacoes() {
    try {
      const { data } = await api.get('/api/auth/amizade/solicitacoes');
      return data;
    } catch (error) {
      console.error('Erro ao listar solicitações:', error);
      return [];
    }
  }
};

export default api;
