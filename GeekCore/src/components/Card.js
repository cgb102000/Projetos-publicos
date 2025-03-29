import React from 'react';
import { Link } from 'react-router-dom';

export function Card({ item }) {
  return (
    <div className="card group transform transition-all duration-300 hover:scale-110 hover:z-20">
      <Link to={`/detalhes/${item.collection}/${item._id}`} className="block w-full h-full relative">
        <img
          src={item.img_url || '/images/placeholder.jpg'}
          alt={item.titulo}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/placeholder.jpg';
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transform scale-95 group-hover:scale-110 transition-all duration-300 bg-primary text-white px-6 py-3 rounded-lg hover:bg-hover flex items-center gap-2 shadow-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
            Assistir
          </span>
        </div>
      </Link>
    </div>
  );
}
