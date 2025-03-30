import React, { useState, useEffect } from 'react';
import { amigoService } from '../services/api';
import { Alert } from './Alert';

export function ListaBloqueados() {
  const [bloqueados, setBloqueados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    carregarBloqueados();
  }, []);

  const carregarBloqueados = async () => {
    try {
      setLoading(true);
      const data = await amigoService.listarBloqueados();
      setBloqueados(data);
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Erro ao carregar usuários bloqueados'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDesbloquear = async (userId) => {
    try {
      await amigoService.desbloquearUsuario(userId);
      setAlert({
        type: 'success',
        message: 'Usuário desbloqueado com sucesso'
      });
      await carregarBloqueados();
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.message || 'Erro ao desbloquear usuário'
      });
    }
  };

  if (loading) {
    return <div className="text-center py-4">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <h2 className="text-2xl font-bold mb-6">Usuários Bloqueados</h2>

      {bloqueados.length === 0 ? (
        <p className="text-center text-gray-400 py-8">
          Você não possui usuários bloqueados
        </p>
      ) : (
        <div className="grid gap-4">
          {bloqueados.map(usuario => (
            <div
              key={usuario._id}
              className="bg-darker p-4 rounded-lg flex items-center justify-between group hover:bg-opacity-70 transition-all"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={usuario.foto || '/images/default-avatar.png'}
                  alt={usuario.nome}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-medium text-white">{usuario.nome}</h3>
                  <p className="text-sm text-gray-400">{usuario.email}</p>
                </div>
              </div>
              
              <button
                onClick={() => handleDesbloquear(usuario._id)}
                className="px-4 py-2 bg-primary text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-hover flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>Desbloquear</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
