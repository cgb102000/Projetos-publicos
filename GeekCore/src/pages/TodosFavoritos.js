import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';
import { Container } from '../components/Container';
import { Card } from '../components/Card';

export function TodosFavoritos() {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarFavoritos = async () => {
      try {
        setLoading(true);
        const data = await authService.getFavorites();
        setFavoritos(data);
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarFavoritos();
  }, []);

  return (
    <Container>
      <h1 className="gc-section-title">Meus favoritos</h1>
      {loading ? (
        <div className="gc-grid">
          {Array.from({ length: 6 }, (_, i) => <div key={i} className="gc-skel" style={{ aspectRatio: '2 / 3' }} />)}
        </div>
      ) : favoritos.length > 0 ? (
        <div className="gc-grid">
          {favoritos.map(item => <Card key={item._id} item={item} />)}
        </div>
      ) : (
        <div className="gc-panel" style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontWeight: 700 }}>Você ainda não tem favoritos.</p>
          <p className="gc-section-sub" style={{ margin: '6px 0 16px' }}>Abra um título e toque em “Favoritar” para guardar aqui.</p>
          <Link to="/" className="gc-btn">Explorar o catálogo</Link>
        </div>
      )}
    </Container>
  );
}
