import React from 'react';
import { Link } from 'react-router-dom';
import { nomeCategoria, TIPOS } from '../utils/catalogo';

const SEM_CAPA = process.env.PUBLIC_URL + '/images/sem-capa.svg';

// Card de pôster com título e categoria visíveis (também no celular, onde não há hover)
export function Card({ item }) {
  return (
    <Link to={`/detalhes/videos/${item._id}`} className="gc-card" title={item.titulo}>
      <div className="gc-card-img">
        <img
          src={item.img_url || SEM_CAPA}
          onError={(e) => { e.target.onerror = null; e.target.src = SEM_CAPA; }}
          alt={item.titulo}
          loading="lazy"
        />
        <span className="gc-card-play" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        </span>
      </div>
      <h3 className="gc-card-title">{item.titulo}</h3>
      {(item.tipo || item.categoria) && (
        <p className="gc-card-meta">
          {[TIPOS.find((t) => t.id === item.tipo)?.nome.replace(/s$/, ''), item.categoria && nomeCategoria(item.categoria)].filter(Boolean).join(' · ')}
        </p>
      )}
    </Link>
  );
}
