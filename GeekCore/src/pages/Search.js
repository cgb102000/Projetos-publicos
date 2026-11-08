import { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import api from '../services/api';
import { Container } from '../components/Container';

export function Search() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const query = searchParams.get('q');
  const { isAuthenticated, handleFavorite } = useContext(AuthContext);

  useEffect(() => {
    if (query) {
      searchContent(query);
    }
  }, [query]);

  async function searchContent(query) {
    try {
      setLoading(true);
      setError(null);
      
      // Primeiro verifica se o servidor está online
      try {
        await api.get('/api/health');
      } catch (err) {
        throw new Error('Servidor indisponível. Tente novamente em alguns instantes.');
      }

      let response;
      try {
        response = await api.get(`/api/search?q=${encodeURIComponent(query)}`);
      } catch (err) {
        // A API responde 404 quando a busca não encontra nada
        if (err.response?.status === 404) {
          setResults([]);
          return;
        }
        throw err;
      }
      
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

  return (
    <Container>
      <h1 className="gc-section-title">Resultados para “{query}”</h1>
      {loading ? (
        <div className="gc-grid">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i}>
              <div className="gc-skel" style={{ aspectRatio: '2 / 3' }} />
              <div className="gc-skel" style={{ height: 14, marginTop: 10, width: '80%' }} />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="gc-section-sub" style={{ marginTop: 0 }}>{error}</p>
      ) : results.length === 0 ? (
        <div className="gc-panel" style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontWeight: 700 }}>Nada encontrado para “{query}”.</p>
          <p className="gc-section-sub" style={{ margin: '6px 0 0' }}>Confira a grafia ou tente outro título.</p>
        </div>
      ) : (
        <>
          <p className="gc-section-sub">{results.length} {results.length === 1 ? 'título encontrado' : 'títulos encontrados'}</p>
          <div className="gc-grid">
            {results.map(item => (
              <Card key={item._id} item={item} />
            ))}
          </div>
        </>
      )}
    </Container>
  );
}
