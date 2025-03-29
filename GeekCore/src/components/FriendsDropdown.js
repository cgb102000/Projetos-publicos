import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

export function FriendsDropdown({ onClose }) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div 
      ref={dropdownRef}
      className="absolute left-0 w-64 mt-2 bg-darker border border-gray-700 rounded-lg shadow-xl z-50"
      style={{ top: '100%' }}
    >
      {/* Seta decorativa */}
      <div className="absolute -top-2 left-4 w-4 h-4 bg-darker border-l border-t border-gray-700 transform rotate-45"></div>

      {/* Menu simplificado */}
      <div className="p-2 relative bg-darker rounded-md">
        <Link
          to="/amigos"
          onClick={onClose}
          className="block w-full text-left px-3 py-2 text-sm text-light hover:bg-hover rounded transition-all"
        >
          Ver Todos os Amigos
        </Link>
        <Link
          to="/amigos/adicionar"
          onClick={onClose}
          className="block w-full text-left px-3 py-2 text-sm text-light hover:bg-hover rounded transition-all"
        >
          Adicionar Amigos
        </Link>
      </div>
    </div>
  );
}
