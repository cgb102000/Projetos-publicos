import React, { useState, useContext } from 'react';
import { Alert } from './Alert';
import { AuthContext } from '../contexts/AuthContext';
import { authService } from '../services/api'; // Corrigido o caminho de importação
import { useAlert } from '../contexts/AlertContext';

export function EditarPerfil({ usuario }) {
  const [perfil, setPerfil] = useState({
    nome: usuario?.nome || '',
    descricao: usuario?.descricao || '',
    foto: usuario?.foto || ''
  });
  const [loading, setLoading] = useState(false);
  const { updateUserData } = useContext(AuthContext);
  const { showAlert } = useAlert();

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await authService.updateUserProfile(perfil);
      updateUserData(response.user);
      showAlert('Perfil atualizado com sucesso!', 'success');
    } catch (error) {
      showAlert(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-darker rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Informações do Perfil</h2>
        <div className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img
                src={perfil.foto || '/images/default-avatar.png'}
                alt="Foto de perfil"
                className="w-32 h-32 rounded-full object-cover border-4 border-primary"
              />
              <label
                htmlFor="foto"
                className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-hover"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </label>
              <input
                type="file"
                id="foto"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setPerfil(prev => ({ ...prev, foto: reader.result }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome</label>
              <input
                type="text"
                value={perfil.nome}
                onChange={(e) => setPerfil({ ...perfil, nome: e.target.value })}
                className="w-full p-3 rounded bg-dark text-light"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descrição</label>
              <textarea
                value={perfil.descricao}
                onChange={(e) => setPerfil({ ...perfil, descricao: e.target.value })}
                className="w-full p-3 rounded bg-dark text-light h-32"
                placeholder="Conte um pouco sobre você..."
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded hover:bg-hover"
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}
