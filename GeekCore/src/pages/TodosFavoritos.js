import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';
import { Footer } from '../components/Footer';

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
    <div className="flex flex-col min-h-screen">
      <div className="content-section pt-20 animate-fadeIn flex-grow">
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-white">Todos os Favoritos</h1>
              <Link
                to="/perfil"
                className="text-primary hover:text-hover transition-colors duration-300 flex items-center"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Perfil
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {favoritos.map(item => (
                  <Link
                    key={item._id}
                    to={`/detalhes/videos/${item._id}`}
                    className="block group"
                  >
                    <div className="bg-dark rounded-lg overflow-hidden transition-transform duration-300 transform hover:scale-105">
                      <div className="relative aspect-[2/3]">
                        <img
                          src={item.img_url || '/images/placeholder.jpg'}
                          alt={item.titulo}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/images/placeholder.jpg';
                          }}
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
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
