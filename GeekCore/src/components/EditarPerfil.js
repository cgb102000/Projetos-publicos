import React, { useState, useContext } from 'react';
import { Alert } from './Alert';
import { AuthContext } from '../contexts/AuthContext';
import { authService } from '../services/api'; // Corrigido o caminho de importação
import { useAlert } from '../contexts/AlertContext';
import { useTheme } from '../contexts/ThemeContext';

export function EditarPerfil({ usuario }) {
  const defaultProfile = {
    nome: '',
    descricao: '',
    foto: null,
    tema_cor: '#ef4444',
    id: usuario?.id
  };

  const [perfil, setPerfil] = useState(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      nome: savedUser.nome || usuario?.nome || '',
      descricao: savedUser.descricao || usuario?.descricao || '',
      foto: savedUser.foto || usuario?.foto || null,
      tema_cor: savedUser.tema_cor || usuario?.tema_cor || '#ef4444'
    };
  });

  const [loading, setLoading] = useState(false);
  const { updateUserData } = useContext(AuthContext);
  const { showAlert } = useAlert();
  const { setThemeColor } = useTheme();

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await authService.updateUserProfile(perfil);
      
      const updatedUser = {
        ...usuario,
        ...response.user,
        foto: perfil.foto,
        tema_cor: perfil.tema_cor // Garantir que a cor do tema seja incluída
      };

      // Atualizar localStorage e estado global
      updateUserData(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('userThemeColor', perfil.tema_cor); // Salvar em ambos os locais
      setThemeColor(perfil.tema_cor);

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

            <div>
              <label className="block text-sm font-medium mb-2">Cor do Tema</label>
              <input
                type="color"
                value={perfil.tema_cor}
                onChange={(e) => {
                  setPerfil({ ...perfil, tema_cor: e.target.value });
                  setThemeColor(e.target.value); // Atualizar cor em tempo real
                }}
                className="w-full h-12 p-1 rounded bg-dark cursor-pointer"
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
