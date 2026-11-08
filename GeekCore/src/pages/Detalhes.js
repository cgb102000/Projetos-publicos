import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { contentService, authService, amigoService } from '../services/api';
import { Row } from '../components/Row';
import { Alert } from '../components/Alert';
import { Footer } from '../components/Footer';
import { Comments } from '../components/Comments';

export function Detalhes() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const { isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareAlert, setShareAlert] = useState({ show: false, message: '', type: '' });
  const [amigos, setAmigos] = useState([]);

  // Corrige a cor do tema ao carregar a página
  useEffect(() => {
    if (isAuthenticated && user?.tema_cor) {
      document.documentElement.style.setProperty('--color-primary', user.tema_cor);
      document.documentElement.style.setProperty('--color-hover', user.tema_cor);
    }
  }, [isAuthenticated, user?.tema_cor]);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Carregar item e favoritos simultaneamente
        const [itemData, favoritesData] = await Promise.all([
          contentService.getItem(id),
          authService.getFavorites()
        ]);

        // Verificar se o item está nos favoritos
        const isFavorited = favoritesData.some(fav => fav._id === id);
        setItem({ ...itemData, isFavorited });

        const recommendationsData = await contentService.getRecommendations();
        setRecommendations(recommendationsData.filter(rec => rec._id !== id).slice(0, 12));
      } catch (error) {
        console.error('Erro ao carregar conteúdo:', error);
        setError('Erro ao carregar conteúdo. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [id]);

  // Buscar amigos ao abrir o modal de compartilhar
  useEffect(() => {
    if (showShareModal && isAuthenticated) {
      setShareLoading(true);
      amigoService.listarAmigos()
        .then(data => setAmigos(data.filter(a => a.usuario)))
        .catch(() => setAmigos([]))
        .finally(() => setShareLoading(false));
    }
  }, [showShareModal, isAuthenticated]);

  const handleFavorite = async () => {
    try {
      // Salvar tema atual
      const temaAtual = document.documentElement.style.getPropertyValue('--color-primary');
      
      const response = await authService.toggleFavorite(id, 'video');

      if (response.success) {
        // Atualizar estado preservando o tema
        setItem(prev => ({
          ...prev,
          isFavorited: response.isFavorito
        }));
        
        // Reaplicar tema após atualização
        if (temaAtual) {
          document.documentElement.style.setProperty('--color-primary', temaAtual);
          document.documentElement.style.setProperty('--color-hover', temaAtual);
        }

        setAlert({
          show: true,
          message: response.isFavorito 
            ? '❤️ Item adicionado aos favoritos' 
            : '💔 Item removido dos favoritos',
          type: response.isFavorito ? 'info' : 'warning'
        });

        setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
      }
    } catch (error) {
      console.error('Erro ao atualizar favoritos:', error);
      setAlert({
        show: true,
        message: 'Erro ao atualizar favoritos',
        type: 'error'
      });
    }
  };

  const handleShareWithFriend = async (amigoId) => {
    setShareLoading(true);
    setShareAlert({ show: false, message: '', type: '' });
    try {
      // Chama o endpoint real para criar notificação
      await amigoService.compartilharComAmigo(amigoId, id);
      setShareAlert({ show: true, message: 'Compartilhado com sucesso!', type: 'success' });
      setTimeout(() => setShowShareModal(false), 1200);
    } catch (err) {
      setShareAlert({ show: true, message: 'Erro ao compartilhar', type: 'error' });
    } finally {
      setShareLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const linkAssistir = [item?.url, item?.link].find((l) => /^https?:\/\//.test(l || ''));
  const generos = Array.isArray(item?.generos) ? item.generos : [];

  return (
    <div className="gc-page">
      <main className="animate-fadeIn">
        {alert.show && (
          <Alert
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert({ show: false, message: '', type: '' })}
          />
        )}
        {toast.show && (
          <Alert
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ show: false, message: '', type: '' })}
          />
        )}

          {error ? (
            <div className="gc-container" style={{ paddingTop: 140, textAlign: 'center' }}>
              <p className="gc-section-sub">{error}</p>
            </div>
          ) : item ? (
            <>
              <div className="gc-det-hero" aria-hidden="true">
                <img
                  src={item.img_capa_url || item.img_url}
                  alt=""
                  className={item.img_capa_url ? '' : 'desfocado'}
                  onError={(e) => { e.target.onerror = null; e.target.src = item.img_url; e.target.classList.add('desfocado'); }}
                />
              </div>

              <div className="gc-container">
                <div className="gc-det-body">
                  <img
                    src={item.img_url || process.env.PUBLIC_URL + '/images/sem-capa.svg'}
                    alt={`Pôster de ${item.titulo}`}
                    className="gc-det-poster"
                    onError={(e) => { e.target.onerror = null; e.target.src = process.env.PUBLIC_URL + '/images/sem-capa.svg'; }}
                  />

                  <div className="gc-det-info">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {item.categoria && <span className="gc-chip gc-chip-primary">{item.categoria}</span>}
                      {generos.map((g) => <span key={g} className="gc-chip">{g}</span>)}
                    </div>
                    <h1>{item.titulo}</h1>
                    {item.descricao && <p className="gc-det-desc">{item.descricao}</p>}

                    <div className="gc-det-acoes">
                      {linkAssistir && (
                        <a href={linkAssistir} target="_blank" rel="noopener noreferrer" className="gc-btn">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                          Assistir
                        </a>
                      )}
                      {isAuthenticated ? (
                        <>
                          <button
                            type="button"
                            onClick={handleFavorite}
                            className={`gc-btn ${item.isFavorited ? 'favoritado' : 'gc-btn-ghost'}`}
                            aria-pressed={item.isFavorited}
                          >
                            <svg className={item.isFavorited ? 'heart-beat' : ''} width="18" height="18" viewBox="0 0 24 24" fill={item.isFavorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                            {item.isFavorited ? 'Nos favoritos' : 'Favoritar'}
                          </button>
                          <button type="button" onClick={() => setShowShareModal(true)} className="gc-btn gc-btn-ghost">
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                            Compartilhar
                          </button>
                        </>
                      ) : (
                        <button type="button" onClick={() => navigate('/login')} className="gc-btn gc-btn-ghost">
                          Entre para favoritar
                        </button>
                      )}
                    </div>
                  </div>
                </div>

              {/* Modal Compartilhar com amigos */}
              {showShareModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                  <div className="bg-dark p-6 rounded-lg w-96 relative">
                    <button
                      onClick={() => setShowShareModal(false)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <h3 className="text-xl font-bold mb-4">Compartilhar com um amigo</h3>
                    {shareLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      </div>
                    ) : (
                      <>
                        {amigos.length === 0 ? (
                          <div className="text-gray-400 text-center py-6">Você não possui amigos para compartilhar.</div>
                        ) : (
                          <ul className="space-y-2 max-h-60 overflow-y-auto">
                            {amigos.map(amigo => (
                              <li key={amigo.usuario._id}>
                                <button
                                  onClick={() => handleShareWithFriend(amigo.usuario._id)}
                                  className="w-full flex items-center gap-3 px-4 py-2 rounded hover:bg-primary/80 transition-colors bg-darker text-light"
                                  disabled={shareLoading}
                                  style={{
                                    // Aplica a cor do tema do usuário logado no hover via CSS custom property
                                    '--user-theme-hover': user?.tema_cor || '#ef4444'
                                  }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.backgroundColor = user?.tema_cor || '#ef4444';
                                    e.currentTarget.style.color = '#fff';
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.backgroundColor = '';
                                    e.currentTarget.style.color = '';
                                  }}
                                >
                                  <img
                                    src={amigo.usuario.foto || process.env.PUBLIC_URL + '/images/default-avatar.svg'}
                                    alt={amigo.usuario.nome}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                  <span className="flex-1 text-left">{amigo.usuario.nome}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                        {shareAlert.show && (
                          <div className={`mt-4 text-center text-sm ${shareAlert.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                            {shareAlert.message}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

                {recommendations.length > 0 && (
                  <Row title="Você também pode gostar" items={recommendations} />
                )}

                <section className="gc-section">
                  <Comments videoId={id} />
                </section>
              </div>
            </>
          ) : null}
      </main>
      <Footer />
    </div>
  );
}
