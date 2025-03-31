import React from 'react';
import { Link } from 'react-router-dom';

export function Card({ item }) {
  return (
    <Link 
      to={`/detalhes/videos/${item._id}`}
      className="card"
    >
      <img 
        src={item.img_url} 
        alt={item.titulo}
        className="w-full h-full object-cover"
      />
      <div className="card-overlay">
        <h3 className="card-title mb-3">{item.titulo}</h3>
        <div className="watch-button">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
          </svg>
          <span>Assistir</span>
        </div>
      </div>
    </Link>
  );
}
