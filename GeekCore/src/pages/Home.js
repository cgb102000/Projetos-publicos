import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { contentService, authService } from '../services/api';
import { Card } from '../components/Card';
import { Alert } from '../components/Alert'; // Certifique-se de importar o componente Alert
import { Footer } from '../components/Footer';

export function Home() {
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [featuredItem, setFeaturedItem] = useState(null);

  useEffect(() => {
    loadRecentItems();
    loadFeaturedItem();
  }, []);

  async function loadRecentItems() {
    try {
      setLoading(true);
      setError(null);

      const items = await contentService.getRecentContent();
      setRecentItems(items);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      setError(error.message || 'Erro ao carregar itens. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }

  async function loadFeaturedItem() {
    try {
      const items = await contentService.getRecommendations();
      const itemsWithCover = items.filter(item => item.img_capa_url);

      if (itemsWithCover.length > 0) {
        const randomIndex = Math.floor(Math.random() * itemsWithCover.length);
        setFeaturedItem(itemsWithCover[randomIndex]);
      }
    } catch (error) {
      console.error('Erro ao carregar destaque:', error);
    }
  }

  const handleFavorite = async (item) => {
    try {
      // Salvar tema atual
      const temaAtual = document.documentElement.style.getPropertyValue('--color-primary');
      
      const response = await authService.toggleFavorite(item._id, item.collection);

      if (response.success) {
        // Recarregar itens preservando o tema
        await loadRecentItems();
        
        // Reaplicar tema após atualização
        if (temaAtual) {
          document.documentElement.style.setProperty('--color-primary', temaAtual);
          document.documentElement.style.setProperty('--color-hover', temaAtual);
        }
        
        setAlert({
          show: true,
          message: response.isFavorito 
            ? '❤️ Adicionado aos favoritos'
            : '💔 Removido dos favoritos',
          type: response.isFavorito ? 'info' : 'warning'
        });

        setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
      }
    } catch (error) {
      setAlert({
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
    <div className="flex flex-col min-h-screen">
      <div className="content-section pt-20 animate-fadeIn flex-grow">
        {alert.show && (
          <Alert
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert({ show: false, message: '', type: '' })}
          />
        )}
        {error ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                loadRecentItems();
              }}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-hover"
            >
              Tentar Novamente
            </button>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <section className="mb-16">
              <h2 className="section-title"></h2>
              <div className="relative h-[70vh] rounded-lg overflow-hidden mb-12">
                {featuredItem && featuredItem.img_capa_url && (
                  <Link 
                    to={`/detalhes/${featuredItem.collection}/${featuredItem._id}`}
                    className="block w-full h-full group"
                  >
                    <img 
                      src={featuredItem.img_capa_url} // Usar apenas img_capa_url
                      alt={featuredItem.titulo}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-darker via-transparent to-transparent">
                      <div className="absolute bottom-0 left-0 p-8">
                        <h1 className="text-5xl font-bold text-white mb-4">{featuredItem.titulo}</h1>
                        <div className="flex items-center space-x-2 nav-button bg-primary text-white px-6 py-3 rounded-full hover:bg-hover transition-all duration-300 w-fit">
                          <span>Assistir Agora</span>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          </svg>
                        </div>
                        {featuredItem.descricao && (
                          <p className="text-white mt-4 max-w-2xl line-clamp-2">
                            {featuredItem.descricao}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            </section>

            <section className="mb-16">
              <h2 className="section-title">Conteúdo Recente</h2>
              {recentItems.length === 0 ? (
                <p className="text-center text-gray-500">Nenhum item recente encontrado.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {recentItems.map(item => (
                    <Card 
                      key={item._id} 
                      item={item}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
