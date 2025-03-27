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

        const [itemData, recommendationsData] = await Promise.all([
          contentService.getItem(collection, id),
          contentService.getRecommendations(collection)
        ]);

        if (!itemData) {
          throw new Error('Item não encontrado');
        }

        setItem(itemData);
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
  }, [id, collection]);

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await authService.toggleFavorite(id, collection);
      // Adicionar feedback visual
    } catch (error) {
      console.error('Erro ao favoritar:', error);
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
    <div className="min-h-screen bg-darker animate-fadeIn">
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
                <div className="w-full md:w-1/3 netflix-card">
                  <img 
                    src={item.img_url} 
                    alt={item.titulo}
                    className="w-full rounded-lg shadow-2xl"
                  />
                </div>
                
                <div className="flex-1 text-light">
                  <div className="flex justify-between items-start">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">{item.titulo}</h1>
                    {isAuthenticated && (
                      <button 
                        onClick={handleFavorite}
                        className="text-4xl hover:text-primary transition-transform hover:scale-110"
                      >
                        ❤️
                      </button>
                    )}
                  </div>
                  
                  {item.categoria && (
                    <div className="mb-6">
                      <span className="bg-primary text-white px-4 py-2 rounded-full text-sm font-bold">
                        {item.categoria}
                      </span>
                    </div>
                  )}
                  
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </a>
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
