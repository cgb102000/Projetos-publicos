import React from 'react';
import { Link } from 'react-router-dom';

export function VisualizarPerfil({ usuario }) {
  return (
    <div className="bg-darker rounded-lg p-6 max-w-4xl mx-auto">
      {/* Seção do Perfil */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex flex-col items-center space-y-4 md:w-1/3">
          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary">
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
        </div>

        <div className="md:w-2/3 space-y-6">
          {usuario.descricao && (
            <div className="bg-dark p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-primary">Sobre</h2>
              <p className="text-gray-300">{usuario.descricao}</p>
            </div>
          )}
        </div>
      </div>

      {/* Seção de Favoritos */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-primary">Favoritos</h2>
        {Array.isArray(usuario.favoritos) && usuario.favoritos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {usuario.favoritos.map(item => (
              <Link
                key={item._id}
                to={`/detalhes/${item.tipo}/${item._id}`}
                className="transform hover:scale-105 transition-all duration-300 block"
              >
                <div className="bg-dark rounded-lg overflow-hidden h-full">
                  <div className="relative pb-[150%]"> {/* Proporção fixa 2:3 */}
                    <img
                      src={item.img_url || '/images/placeholder.jpg'}
                      alt={item.titulo}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-200 line-clamp-2 h-10">
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
          <div className="text-center py-8 text-gray-400">
            Este usuário ainda não tem favoritos
          </div>
        )}
      </div>
    </div>
  );
}
