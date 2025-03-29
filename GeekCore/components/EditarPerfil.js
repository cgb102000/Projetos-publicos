import React, { useState } from 'react';

const EditarPerfil = ({ usuario, onSalvar }) => {
  const [perfil, setPerfil] = useState({
    nome: usuario.nome,
    descricao: usuario.descricao,
    foto: usuario.foto
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSalvar(perfil);
  };

  return (
    <form onSubmit={handleSubmit} className="editar-perfil-form">
      <input
        type="text"
        value={perfil.nome}
        onChange={(e) => setPerfil({...perfil, nome: e.target.value})}
        placeholder="Nome"
      />
      <textarea
        value={perfil.descricao}
        onChange={(e) => setPerfil({...perfil, descricao: e.target.value})}
        placeholder="Descrição"
      />
      <input
        type="file"
        onChange={(e) => setPerfil({...perfil, foto: e.target.files[0]})}
        accept="image/*"
      />
      <button type="submit">Salvar Alterações</button>
    </form>
  );
};

export default EditarPerfil;
