import { memo } from 'react';
import { Link } from 'react-router-dom';

export const Card = memo(({ item }) => {
  if (!item) return null;

  const collection = item.collection || 
    (item.tipo === 'anime' || item.categoria?.toLowerCase().includes('anime')) 
      ? 'animes' 
      : 'filmes';

  return (
    <div className="card-container h-[400px] w-[260px]">
      <Link 
        to={`/detalhes/${collection}/${item._id}`}
        className="block w-full h-full"
      >
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden group">
          <img 
            loading="lazy"
            src={item.img_url} 
            alt={item.titulo}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent 
                          opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 
                           opacity-0 group-hover:opacity-100 transform group-hover:translate-y-0 
                           transition-all duration-300 translate-y-4">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  if (item.url) {
                    window.open(item.url, '_blank', 'noopener,noreferrer');
                  }
                }}
                className="primary-button"
              >
                <span>Assistir Agora</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                </svg>
              </button>
            </div>
            
            <div className="absolute bottom-0 w-full p-4">
              <h3 className="text-white font-bold text-lg truncate group-hover:text-primary transition-colors">
                {item.titulo}
              </h3>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
});

Card.displayName = 'Card';
