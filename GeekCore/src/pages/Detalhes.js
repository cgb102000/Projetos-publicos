import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { contentService, authService } from '../services/api';
import { Carousel } from '../components/Carousel';
import { Alert } from '../components/Alert';

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
      try {
        setLoading(true);
        setError(null);
        
        // Carregar favoritos do usuário junto com os dados do item
        const [itemData, recommendationsData, favoritos] = await Promise.all([
          contentService.getItem(collection, id),
          contentService.getRecommendations(collection),
          authService.getFavorites()
        ]);

        // Verificar se o item atual está nos favoritos
        const isFavorited = favoritos.some(
          fav => fav.conteudo_id === id || fav._id === id
        );

        // Atualizar o item com o estado de favorito
        setItem({
          ...itemData,
          isFavorited
        });

        setRecommendations(recommendationsData.filter(rec => rec._id !== id).slice(0, 6));
      } catch (error) {
        console.error('Erro ao carregar conteúdo:', error);
        setError('Erro ao carregar conteúdo. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadContent();
    } else {
      // Se não estiver autenticado, carrega sem verificar favoritos
      loadContent();
    }
  }, [id, collection, isAuthenticated]);

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const tipo = collection === 'animes' ? 'anime' : 'filme';
      const response = await authService.toggleFavorite(id, tipo);
      
      // Atualizar o estado com base no isFavorito retornado pela API
      setItem(prev => ({
        ...prev,
        isFavorited: response.isFavorito // Usar a propriedade correta da API
      }));

      // Atualizar toast com base no status retornado
      setToast({
        show: true,
        message: response.message, // Usar a mensagem retornada pela API
        type: response.isFavorito ? 'success' : 'info'
      });

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
      {/* Alert Component */}
      {toast.show && (
        <Alert
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: '' })}
        />
      )}

      <div className="content-section pt-20">
        {error ? (
          <div className="text-center text-red-500 p-4">{error}</div>
        ) : item ? (
          <>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3 netflix-card">
                <img 
                  src={item.img_url} 
                  alt={item.titulo}
                  className="w-full rounded-lg shadow-2xl"
                />
              </div>
              
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-primary mb-4">{item.titulo}</h1>
                {item.categoria && (
                  <span className="bg-primary text-white px-4 py-2 rounded-full text-sm font-bold mb-4 inline-block">
                    {item.categoria}
                  </span>
                )}
                {item.descricao && (
                  <p className="text-light text-lg mb-8 mt-4">{item.descricao}</p>
                )}
                
                {/* Área principal de ações */}
                <div className="flex items-center gap-4 mb-6">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-button bg-primary text-white px-6 py-3 rounded hover:bg-hover transition-all inline-flex items-center gap-2"
                  >
                    <span>Assistir Agora</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                    </svg>
                  </a>
                </div>

                {/* Nova área de ações secundárias */}
                <div className="flex items-center gap-6 mt-4">
                  {isAuthenticated && (
                    <button
                      onClick={handleFavorite}
                      className={`group flex flex-col items-center transition-all duration-300`}
                      title={item.isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    >
                      <div className={`p-3 rounded-full border-2 transition-all duration-300 ${
                        item.isFavorited
                          ? 'bg-primary text-white border-primary hover:bg-hover hover:border-hover'
                          : 'bg-transparent border-primary text-primary hover:bg-primary hover:text-white'
                      }`}>
                        <svg
                          className={`w-6 h-6 transition-transform duration-300 group-hover:scale-110 ${
                            item.isFavorited ? 'heart-beat' : ''
                          }`}
                          fill={item.isFavorited ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </div>
                      <span className="text-sm mt-1 text-gray-300">
                        {item.isFavorited ? 'Favoritado' : 'Favoritar'}
                      </span>
                    </button>
                  )}
                  {/* Espaço reservado para futuros ícones de ação */}
                  {/* Exemplo de estrutura para futuros botões:
                  <button className="flex flex-col items-center">
                    <div className="p-3 rounded-full border-2 border-primary">
                      <svg className="w-6 h-6">...</svg>
                    </div>
                    <span className="text-sm mt-1 text-gray-300">Ação</span>
                  </button>
                  */}
                </div>
              </div>
            </div>

            {recommendations.length > 0 && (
              <div className="mt-12">
                <Carousel items={recommendations} title="Recomendações" />
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
