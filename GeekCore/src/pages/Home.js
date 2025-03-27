import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { contentService, authService } from '../services/api';
import { Card } from '../components/Card';

export function Home() {
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    loadRecentItems();
  }, []);

  async function loadRecentItems() {
    try {
      setLoading(true);
      const items = await contentService.getRecentContent();
      const processedItems = items.map(item => {
        const isAnime = item.tipo === 'anime' || item.categoria?.toLowerCase().includes('anime');
        return {
          ...item,
          tipo: isAnime ? 'anime' : 'filme',
          collection: isAnime ? 'animes' : 'filmes'
        };
      });
      console.log('Itens processados:', processedItems);
      setRecentItems(processedItems);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleFavorite = async (item) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await authService.toggleFavorite(item._id, item.collection);
      // Adicionar feedback visual aqui
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
    <div className="content-section pt-20 animate-fadeIn">
      {/* Hero Section */}
      <section className="mb-16">
        <h2 className="section-title">Destaques</h2>
        <div className="relative h-[70vh] rounded-lg overflow-hidden mb-12">
          {recentItems[0] && (
            <>
              <img 
                src={recentItems[0].img_url} 
                alt={recentItems[0].titulo}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-darker via-transparent to-transparent">
                <div className="absolute bottom-0 left-0 p-8">
                  <h1 className="text-5xl font-bold text-white mb-4">{recentItems[0].titulo}</h1>
                  <a href={recentItems[0].url} className="netflix-button">
                    <span>Assistir Agora</span>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="section-title">Conteúdo Recente</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {recentItems.map(item => (
            <Card 
              key={item._id} 
              item={item}
              isAuthenticated={isAuthenticated}
              onFavorite={handleFavorite}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
