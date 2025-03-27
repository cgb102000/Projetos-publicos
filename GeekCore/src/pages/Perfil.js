import { useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Alert } from '../components/Alert';

export function Perfil() {
  const [userData, setUserData] = useState({ nome: '', email: '', descricao: '', foto: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewFoto, setPreviewFoto] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const { updateUserData } = useContext(AuthContext);
  const { themeColor, setThemeColor } = useTheme();
  const [showAlert, setShowAlert] = useState(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);
        const data = await authService.getUserProfile();
        setUserData(data);
        setPreviewFoto(data.foto);
      } catch (err) {
        setError('Erro ao carregar dados do perfil.');
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError('Arquivo muito grande. Máximo: 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setPreviewFoto(reader.result);
        setUserData(prev => ({ ...prev, foto: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setThemeColor(newColor);
    setUserData(prev => ({ ...prev, tema_cor: newColor }));
  };

  const showAlertMessage = (message, type) => {
    setShowAlert({ message, type });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await authService.updateUserProfile({
        ...userData,
        tema_cor: themeColor
      });
      
      updateUserData({
        nome: userData.nome,
        foto: userData.foto,
        descricao: userData.descricao,
        tema_cor: themeColor
      });

      showAlertMessage('Perfil atualizado com sucesso!', 'success');
    } catch (err) {
      showAlertMessage(err.response?.data?.message || 'Erro ao atualizar perfil.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const PasswordChangeModal = () => {
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [modalError, setModalError] = useState('');
    const [modalLoading, setModalLoading] = useState(false);

    const handlePasswordChange = async (e) => {
      e.preventDefault();
      if (passwords.new !== passwords.confirm) {
        setModalError('As senhas não coincidem');
        return;
      }

      setModalLoading(true);
      try {
        await authService.changePassword(passwords.current, passwords.new);
        setShowPasswordModal(false);
        showAlertMessage('Senha alterada com sucesso!', 'success');
      } catch (err) {
        setModalError(err.response?.data?.message || 'Erro ao alterar senha');
      } finally {
        setModalLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-dark p-6 rounded-lg w-96">
          <h3 className="text-xl font-bold mb-4 text-light">Alterar Senha</h3>
          {modalError && (
            <div className="bg-red-500 text-white p-2 rounded mb-4">
              {modalError}
            </div>
          )}
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <input
              type="password"
              placeholder="Senha Atual"
              value={passwords.current}
              onChange={e => setPasswords({...passwords, current: e.target.value})}
              className="w-full p-2 rounded bg-darker text-light"
              required
            />
            <input
              type="password"
              placeholder="Nova Senha"
              value={passwords.new}
              onChange={e => setPasswords({...passwords, new: e.target.value})}
              className="w-full p-2 rounded bg-darker text-light"
              required
              minLength={6}
            />
            <input
              type="password"
              placeholder="Confirmar Nova Senha"
              value={passwords.confirm}
              onChange={e => setPasswords({...passwords, confirm: e.target.value})}
              className="w-full p-2 rounded bg-darker text-light"
              required
              minLength={6}
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={modalLoading}
                className="px-4 py-2 rounded bg-primary text-white hover:bg-hover disabled:opacity-50"
              >
                {modalLoading ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="container mx-auto px-4 py-8 bg-darker text-white rounded-lg shadow-lg">
      {showAlert && (
        <Alert 
          message={showAlert.message} 
          type={showAlert.type}
          onClose={() => setShowAlert(null)}
        />
      )}

      <h1 className="text-3xl font-bold mb-6 text-center">Editar Perfil</h1>
      <div className="flex flex-col items-center gap-6">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary group-hover:border-hover transition-colors">
            <img
              src={previewFoto || '/images/default-avatar.png'}
              alt="Foto de Perfil"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/default-avatar.png';
              }}
            />
          </div>
          <label
            htmlFor="foto"
            className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-hover transition-colors group-hover:bg-hover"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </label>
          <input
            type="file"
            id="foto"
            accept="image/*"
            className="hidden"
            onChange={handleFotoChange}
          />
        </div>
        <div className="w-full max-w-md">
          <label className="block mb-2 font-semibold">Nome:</label>
          <input
            type="text"
            name="nome"
            value={userData.nome}
            onChange={handleInputChange}
            className="w-full p-3 rounded bg-dark text-white border border-gray-700 focus:outline-none focus:border-primary"
          />
        </div>
        <div className="w-full max-w-md">
          <label className="block mb-2 font-semibold">Email:</label>
          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleInputChange}
            className="w-full p-3 rounded bg-dark text-white border border-gray-700 focus:outline-none focus:border-primary"
            disabled
          />
        </div>
        <div className="w-full max-w-md">
          <label className="block mb-2 font-semibold">Descrição:</label>
          <textarea
            name="descricao"
            value={userData.descricao}
            onChange={handleInputChange}
            className="w-full p-3 rounded bg-dark text-white border border-gray-700 focus:outline-none focus:border-primary"
          />
        </div>
        <div className="w-full max-w-md">
          <label className="block mb-2 font-semibold">Cor do Tema:</label>
          <input
            type="color"
            value={themeColor}
            onChange={handleColorChange}
            className="w-full h-12 p-1 rounded bg-dark border border-gray-700 cursor-pointer"
          />
        </div>
        <button
          onClick={handleSave}
          className="bg-primary text-white px-6 py-3 rounded hover:bg-hover transition-colors w-full max-w-md"
        >
          Salvar Alterações
        </button>
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => setShowPasswordModal(true)}
          className="bg-gray-600 text-white px-6 py-3 rounded hover:bg-gray-700 transition-colors"
        >
          Alterar Senha
        </button>
      </div>

      {showPasswordModal && <PasswordChangeModal />}
    </div>
  );
}
