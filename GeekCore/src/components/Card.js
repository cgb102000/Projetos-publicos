import React from 'react';
import { Link } from 'react-router-dom';

export function Card({ item }) {
  return (
    <div className="relative group">
      <Link to={`/detalhes/${item.collection}/${item._id}`} className="block">
        <img
          src={item.img_url || '/images/placeholder.jpg'}
          alt={item.titulo}
          className="w-full h-full object-cover rounded-lg"
        />
      </Link>
    </div>
  );
}
