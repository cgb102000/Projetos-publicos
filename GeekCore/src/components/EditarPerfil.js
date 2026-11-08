import React, { useState, useContext } from 'react';
import imageCompression from 'browser-image-compression';
import { Alert } from './Alert';
import { AuthContext } from '../contexts/AuthContext';
import { authService } from '../services/api'; // Corrigido o caminho de importação
import { useAlert } from '../contexts/AlertContext';
import { useTheme } from '../contexts/ThemeContext';

// Avatares padrão (public/images/avatars). O caminho relativo é o que fica salvo no banco.
const AVATARES = Array.from({ length: 8 }, (_, i) => `images/avatars/avatar-${i + 1}.svg`);
const AVATAR_VAZIO = process.env.PUBLIC_URL + '/images/default-avatar.svg';

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
  const [processandoFoto, setProcessandoFoto] = useState(false);
  const { updateUserData } = useContext(AuthContext);
  const { showAlert } = useAlert();
  const { setThemeColor } = useTheme();

  // Reduz a foto para no máximo 512px e ~300 KB antes de enviar (fotos de celular têm vários MB)
  const handleFoto = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showAlert('Escolha um arquivo de imagem.', 'error');
      return;
    }
    try {
      setProcessandoFoto(true);
      const comprimida = await imageCompression(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 512,
        useWebWorker: true,
        fileType: 'image/webp'
      });
      const dataUrl = await imageCompression.getDataUrlFromFile(comprimida);
      setPerfil(prev => ({ ...prev, foto: dataUrl }));
    } catch (error) {
      showAlert('Não foi possível processar a imagem. Tente outra.', 'error');
    } finally {
      setProcessandoFoto(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await authService.updateUserProfile({ ...perfil, foto: perfil.foto || '' });
      
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
                src={perfil.foto || AVATAR_VAZIO}
                onError={(e) => { e.target.onerror = null; e.target.src = AVATAR_VAZIO; }}
                alt="Foto de perfil"
                className="w-32 h-32 rounded-full object-cover border-4 border-primary"
              />
              <label
                htmlFor="foto"
                title="Enviar uma foto"
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
                onChange={handleFoto}
              />
            </div>
          </div>

          {processandoFoto && <p className="text-center text-sm text-gray-400">Preparando a foto…</p>}

          <div>
            <p className="block text-sm font-medium mb-2">Ou escolha um avatar</p>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {AVATARES.map((avatar, i) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setPerfil(prev => ({ ...prev, foto: avatar }))}
                  aria-label={`Usar avatar ${i + 1}`}
                  aria-pressed={perfil.foto === avatar}
                  className={`rounded-full overflow-hidden border-4 transition-transform hover:scale-105 ${perfil.foto === avatar ? 'border-primary' : 'border-transparent'}`}
                >
                  <img src={avatar} alt="" className="w-full aspect-square" />
                </button>
              ))}
            </div>
            {perfil.foto && (
              <button
                type="button"
                onClick={() => setPerfil(prev => ({ ...prev, foto: '' }))}
                className="mt-3 text-sm text-gray-400 hover:text-light underline"
              >
                Remover foto
              </button>
            )}
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
            disabled={loading || processandoFoto}
            className="w-full py-3 bg-primary text-white rounded hover:bg-hover"
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}
