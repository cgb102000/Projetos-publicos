import { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import api from '../services/api';

export function Search() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const query = searchParams.get('q');
  const { isAuthenticated, handleFavorite } = useContext(AuthContext);

  useEffect(() => {
    if (query) {
      searchContent();
    }
  }, [query]);

  async function searchContent() {
    try {
      setLoading(true);
      setError(null);
      
      // Primeiro verifica se o servidor está online
      try {
        await api.get('/api/health');
      } catch (err) {
        throw new Error('Servidor indisponível. Tente novamente em alguns instantes.');
      }

      const response = await api.get(`/api/search?q=${encodeURIComponent(query)}`);
      
      if (!response.data) {
        throw new Error('Nenhum resultado encontrado');
      }

      const processedResults = (Array.isArray(response.data) ? response.data : [])
        .map(item => ({
          ...item,
          _id: item._id?.toString(),
          collection: item.collection || (item.tipo === 'anime' ? 'animes' : 'filmes')
        }));

      setResults(processedResults);
    } catch (error) {
      console.error('Erro na busca:', error);
      setError(error.message || 'Erro ao realizar a busca. Tente novamente.');
    } finally {
      setLoading(false);
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
      <h1 className="section-title">
        Resultados para: {query}
      </h1>
      
      {error && <p className="text-red-500 text-center text-lg">{error}</p>}

      {results.length === 0 ? (
        <p className="text-light text-center text-lg">Nenhum resultado encontrado.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {results.map(item => (
            <Card 
              key={item._id} 
              item={item} 
              isAuthenticated={isAuthenticated}
              onFavorite={handleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
