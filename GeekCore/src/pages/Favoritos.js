import { useState, useEffect } from 'react';
import { authService } from '../services/api';
import { Card } from '../components/Card';

export function Favoritos() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    try {
      const data = await authService.getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveFavorite(id, tipo) {
    try {
      await authService.toggleFavorite(id, tipo);
      setFavorites(favorites.filter(item => item._id !== id));
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="content-section pt-20 animate-fadeIn">
      <h1 className="section-title">Meus Favoritos</h1>
      {favorites.length === 0 ? (
        <p className="text-light text-center text-lg">Você ainda não tem favoritos.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {favorites.map(item => (
            <Card 
              key={item._id} 
              item={item}
              isAuthenticated={true}
              onFavorite={() => handleRemoveFavorite(item._id, item.tipo)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
