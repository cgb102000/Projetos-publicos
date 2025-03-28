import { useState, useEffect } from 'react';
import { authService } from '../services/api';
import { Card } from '../components/Card';
import { Footer } from '../components/Footer';

export function Favoritos() {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFavoritos = async () => {
      try {
        setLoading(true);
        const data = await authService.getFavorites();
        setFavoritos(data);
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
        setError('Erro ao carregar seus favoritos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    loadFavoritos();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="content-section pt-20 flex-grow">
        <h1 className="section-title">Meus Favoritos</h1>
        
        {favoritos.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8">
            <p className="text-xl text-light mb-4">Você ainda não tem favoritos.</p>
            <p className="text-light">Explore o catálogo e adicione itens aos favoritos!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {favoritos.map(item => (
              <Card 
                key={item._id} 
                item={item}
              />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
