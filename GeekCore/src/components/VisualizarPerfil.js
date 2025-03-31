import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';

export function VisualizarPerfil({ usuario }) {
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
    <div className="bg-darker rounded-lg p-6 max-w-4xl mx-auto">
      {/* Seção do Perfil */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex flex-col items-center space-y-4 md:w-1/3">
          <div 
            className="w-40 h-40 rounded-full overflow-hidden border-4 transition-colors duration-300" 
            style={{ borderColor: usuario.tema_cor }}
          >
            <img
              src={usuario.foto || '/images/default-avatar.png'}
              alt={usuario.nome}
              className="w-full h-full object-cover"
            />
          </div>
          
          <h1 className="text-2xl font-bold text-white text-center">{usuario.nome}</h1>
          
          <div className="flex items-center space-x-4 text-gray-400 text-sm">
            <span>Membro desde: {new Date(usuario.data_criacao).toLocaleDateString()}</span>
            <span>•</span>
            <span>{usuario.amigos?.length || 0} amigos</span>
          </div>

          {/* Mostrar cor favorita apenas se existir */}
          {usuario.tema_cor && (
            <div className="flex items-center space-x-2 text-sm bg-darker rounded-lg p-2">
              <span className="text-gray-400">Cor favorita:</span>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-6 h-6 rounded-full border border-gray-600 transition-colors duration-300"
                  style={{ backgroundColor: usuario.tema_cor }}
                  title="Cor personalizada"
                />
                <span className="text-gray-300">{usuario.tema_cor}</span>
              </div>
            </div>
          )}
        </div>

        <div className="md:w-2/3 space-y-6">
          {usuario.descricao && (
            <div className="bg-dark p-4 rounded-lg">
              <h2 
                className="text-lg font-semibold mb-2" 
                style={{ color: usuario.tema_cor }}
              >
                Sobre
              </h2>
              <p className="text-gray-300">{usuario.descricao}</p>
            </div>
          )}
        </div>
      </div>

      {/* Seção de Favoritos */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 
            className="text-xl font-semibold"
            style={{ color: usuario.tema_cor }}
          >
            Favoritos
          </h2>
          {favoritos.length > 5 && (
            <Link
              to="/favoritos"
              className="text-sm hover:opacity-80 transition-colors duration-300 flex items-center"
              style={{ color: usuario.tema_cor }}
            >
              Ver todos
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div 
              className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
              style={{ borderColor: usuario.tema_cor }}
            />
          </div>
        ) : favoritos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {favoritos.slice(0, 5).map(item => (
              <Link
                key={item._id}
                to={`/detalhes/${item.tipo}/${item._id}`}
                className="block group"
              >
                <div className="bg-dark rounded-lg overflow-hidden transition-transform duration-300 transform hover:scale-105">
                  <div className="relative aspect-[2/3]">
                    <img
                      src={item.img_url || process.env.PUBLIC_URL + '/images/placeholder.jpg'}
                      alt={item.titulo}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = process.env.PUBLIC_URL + '/images/placeholder.jpg';
                      }}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        Ver Detalhes
                      </span>
                    </div>
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
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            Nenhum item favorito encontrado
          </div>
        )}
      </div>
    </div>
  );
}
