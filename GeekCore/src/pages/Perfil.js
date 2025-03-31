import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { authService } from '../services/api';
import { EditarPerfil } from '../components/EditarPerfil';
import { AbasAmigos } from '../components/AbasAmigos';
import { VisualizarPerfil } from '../components/VisualizarPerfil';
import { Footer } from '../components/Footer';

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

  return (
    <div className="flex flex-col min-h-screen">
      <div className="content-section pt-20 animate-fadeIn flex-grow">
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-4xl mx-auto">
            {/* Abas de navegação */}
            <div className="flex border-b border-gray-700 mb-8">
              <button
                className={`px-6 py-3 font-medium ${
                  activeTab === 'ver'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('ver')}
              >
                Ver Perfil
              </button>
              <button
                className={`px-6 py-3 font-medium ${
                  activeTab === 'editar'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('editar')}
              >
                Editar Perfil
              </button>
              <button
                className={`px-6 py-3 font-medium ${
                  activeTab === 'amigos'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('amigos')}
              >
                Amigos
              </button>
              <button
                className={`px-6 py-3 font-medium ${
                  activeTab === 'favoritos'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('favoritos')}
              >
                Favoritos
              </button>
            </div>

            {/* Conteúdo das abas */}
            <div className="mt-6">
              {activeTab === 'ver' && (
                <VisualizarPerfil usuario={user} />
              )}
              {activeTab === 'editar' && (
                <EditarPerfil usuario={user} />
              )}
              {activeTab === 'amigos' && (
                <AbasAmigos />
              )}
              {activeTab === 'favoritos' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Meus Favoritos</h2>
                  {loadingFavoritos ? (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {favoritos.length > 0 ? (
                        favoritos.map(item => (
                          <a
                            key={item._id}
                            href={`/detalhes/${item.tipo}/${item._id}`}
                            className="transform hover:scale-105 transition-all duration-300"
                          >
                            <div className="bg-darker rounded-lg overflow-hidden">
                              <div className="aspect-[2/3] relative">
                                <img
                                  src={item.img_url || '/images/placeholder.jpg'}
                                  alt={item.titulo}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                              <div className="p-3">
                                <h3 className="text-sm font-medium text-gray-200 line-clamp-2">
                                  {item.titulo}
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">
                                  {item.tipo?.charAt(0).toUpperCase() + item.tipo?.slice(1)}
                                </p>
                              </div>
                            </div>
                          </a>
                        ))
                      ) : (
                        <div className="col-span-full text-center text-gray-400 py-8">
                          Você ainda não tem itens favoritos
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
