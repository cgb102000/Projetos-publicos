import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { authService } from '../services/api';
import { EditarPerfil } from '../components/EditarPerfil';
import { AbasAmigos } from '../components/AbasAmigos';
import { VisualizarPerfil } from '../components/VisualizarPerfil';
import { Link } from 'react-router-dom';
import { Container } from '../components/Container';
import { Card } from '../components/Card';

export function Perfil() {
  const [activeTab, setActiveTab] = useState('ver');
  const { user } = useContext(AuthContext);
  const [favoritos, setFavoritos] = useState([]);
  const [loadingFavoritos, setLoadingFavoritos] = useState(false);

  useEffect(() => {
    if (activeTab === 'favoritos') {
      carregarFavoritos();
    }
  }, [activeTab]);

  const carregarFavoritos = async () => {
    try {
      setLoadingFavoritos(true);
      const data = await authService.getFavorites();
      setFavoritos(data);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    } finally {
      setLoadingFavoritos(false);
    }
  };

  const abas = [
    { id: 'ver', nome: 'Meu perfil' },
    { id: 'editar', nome: 'Editar perfil' },
    { id: 'amigos', nome: 'Amigos' },
    { id: 'favoritos', nome: 'Favoritos' },
  ];
  const loading = loadingFavoritos;

  return (
    <Container>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div className="gc-tabs" role="tablist" style={{ marginBottom: 28 }}>
          {abas.map((aba) => (
            <button
              key={aba.id}
              type="button"
              role="tab"
              aria-selected={activeTab === aba.id}
              className={activeTab === aba.id ? 'ativo' : ''}
              onClick={() => setActiveTab(aba.id)}
            >
              {aba.nome}
            </button>
          ))}
        </div>

        {activeTab === 'ver' && <VisualizarPerfil usuario={user} />}
        {activeTab === 'editar' && <EditarPerfil usuario={user} />}
        {activeTab === 'amigos' && <AbasAmigos />}
        {activeTab === 'favoritos' && (
          <>
            <h2 className="gc-section-title">Meus favoritos</h2>
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
          </>
        )}
      </div>
    </Container>
  );
}
