import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { contentService, authService } from '../services/api';
import { Carousel } from '../components/Carousel';

export function Detalhes() {
  const { collection, id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    const loadContent = async () => {
      if (!id || !collection) {
        setError('ID ou coleção inválidos');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Validar formato do ID antes de fazer a requisição
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
          throw new Error('ID inválido');
        }

        // Carregar favoritos junto com os dados do item
        const [itemData, recommendationsData, favoritosData] = await Promise.all([
          contentService.getItem(collection, id),
          contentService.getRecommendations(collection),
          isAuthenticated ? authService.getFavorites() : []
        ]);

        if (!itemData) {
          throw new Error('Item não encontrado');
        }

        // Verificar se o item está nos favoritos
        const isFavorited = favoritosData.some(fav => 
          fav._id === id || fav.conteudo_id === id
        );

        setItem({
          ...itemData,
          isFavorited
        });

        setRecommendations(
          recommendationsData
            .filter(rec => rec._id !== id)
            .slice(0, 6)
        );
      } catch (error) {
        console.error('Erro ao carregar conteúdo:', error);
        setError(
          error.message === 'Item não encontrado' 
            ? 'Conteúdo não encontrado'
            : 'Erro ao carregar conteúdo. Tente novamente mais tarde.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [id, collection, isAuthenticated]); // Adicionar isAuthenticated como dependência

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const tipo = collection === 'animes' ? 'anime' : 'filme';
      const response = await authService.toggleFavorite(id, tipo);
      
      setItem(prev => ({
        ...prev,
        isFavorited: response.isFavorited
      }));
      
      // Mostrar toast
      const action = response.isFavorited ? 'adicionado aos' : 'removido dos';
      setToast({
        show: true,
        message: `${item.titulo} foi ${action} favoritos!`,
        type: response.isFavorited ? 'success' : 'info'
      });

      // Esconder toast após 3 segundos
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    } catch (error) {
      setToast({
        show: true,
        message: 'Erro ao atualizar favoritos',
        type: 'error'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darker animate-fadeIn relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 animate-fade-in-down max-w-md ${
          toast.type === 'success' ? 'bg-green-500' :
          toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        } text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3`}>
          {toast.type === 'success' && (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      <div className="content-section pt-20"> {/* Adicionado pt-20 para espaçamento do navbar */}
        {error ? (
          <div className="text-center text-red-500 p-4">
            {error}
          </div>
        ) : item ? (
          <>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-t from-darker to-transparent"></div>
              <div className="flex flex-col md:flex-row gap-8 relative z-10">
                <div className="w-full md:w-1/3 netflix-card relative">
                  <img 
                    src={item.img_url} 
                    alt={item.titulo}
                    className="w-full rounded-lg shadow-2xl"
                  />
                </div>
                
                <div className="flex-1 text-light">
                  <div className="flex flex-col gap-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-primary">{item.titulo}</h1>
                    
                    <div className="flex items-center gap-4">
                      {item.categoria && (
                        <span className="bg-primary text-white px-4 py-2 rounded-full text-sm font-bold">
                          {item.categoria}
                        </span>
                      )}
                      {isAuthenticated && (
                        <button 
                          onClick={handleFavorite}
                          className={`inline-flex items-center justify-center p-2 rounded-full
                            ${item.isFavorited 
                              ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20' 
                              : 'text-gray-400 hover:text-red-500 bg-gray-500/10 hover:bg-red-500/10'
                            } transition-all duration-300 hover:scale-110`}
                          aria-label={item.isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                        >
                          {item.isFavorited ? (
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                          ) : (
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                            </svg>
                          )}
                        </button>
                      )}
                      {/* Espaço para futuras opções */}
                    </div>
                    
                    {item.descricao && (
                      <p className="text-light text-lg mb-8 leading-relaxed">
                        {item.descricao}
                      </p>
                    )}
                    
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-primary text-white px-8 py-4 rounded-lg hover:bg-hover transition-all transform hover:scale-105 inline-flex items-center gap-2 font-bold text-lg"
                    >
                      <span>Assistir Agora</span>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0118 0z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <Carousel 
              items={recommendations} 
              title="Assista Também"
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
