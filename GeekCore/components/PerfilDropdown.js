import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PerfilDropdown = ({ usuario, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="perfil-dropdown">
      <button onClick={() => setIsOpen(!isOpen)} className="perfil-botao">
        <img src={usuario.foto || '/default-avatar.png'} alt="Perfil" />
      </button>
      
      {isOpen && (
        <div className="dropdown-menu">
          <Link to={`/perfil/${usuario.id}`}>Meu Perfil</Link>
          <Link to="/editar-perfil">Editar Perfil</Link>
          <button onClick={onLogout}>Sair</button>
        </div>
      )}
    </div>
  );
};

export default PerfilDropdown;
