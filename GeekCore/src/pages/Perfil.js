import { useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Alert } from '../components/Alert';
import imageCompression from 'browser-image-compression'; // Adicione esta importação
import { Footer } from '../components/Footer';

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

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 800,
      useWebWorker: true
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('Erro ao comprimir imagem:', error);
      throw error;
    }
  };

  const handleFotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setLoading(true);
        const compressedFile = await compressImage(file);
        
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewFoto(reader.result);
          setUserData(prev => ({ ...prev, foto: reader.result }));
        };
        reader.readAsDataURL(compressedFile);
      } catch (err) {
        setError('Erro ao processar imagem.');
        console.error('Erro no processamento da imagem:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setThemeColor(newColor); // Atualiza o contexto
    setUserData(prev => ({ ...prev, tema_cor: newColor })); // Prepara para salvar no banco
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
    <div className="flex flex-col min-h-screen">
      <div className="content-section pt-20 animate-fadeIn flex-grow">
        <div className="main-content">
          <div className="container px-4 pt-24 pb-12">
            {showAlert && (
              <Alert 
                message={showAlert.message} 
                type={showAlert.type}
                onClose={() => setShowAlert(null)}
              />
            )}

            <div className="max-w-4xl mx-auto bg-darker rounded-2xl p-8 shadow-xl">
              <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 profile-avatar-border transition-colors">
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
                    className="absolute bottom-2 right-2 nav-button bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-hover transition-colors"
                    title="Alterar foto de perfil"
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
                    onChange={handleFotoChange}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  JPG ou PNG, max 2MB
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <label className="profile-label block mb-2 text-sm font-medium">Nome</label>
                    <input
                      type="text"
                      name="nome"
                      value={userData.nome}
                      onChange={handleInputChange}
                      className="profile-input w-full px-4 py-3 rounded-lg text-base"
                      placeholder="Seu nome"
                    />
                  </div>

                  <div>
                    <label className="profile-label block mb-2 text-sm font-medium">Email</label>
                    <input
                      type="email"
                      value={userData.email}
                      disabled
                      className="profile-input w-full px-4 py-3 rounded-lg text-base bg-opacity-50 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="profile-label block mb-2 text-sm font-medium">Descrição</label>
                    <textarea
                      name="descricao"
                      value={userData.descricao}
                      onChange={handleInputChange}
                      className="profile-input w-full px-4 py-3 rounded-lg text-base min-h-[120px]"
                      placeholder="Conte um pouco sobre você..."
                    />
                  </div>

                  <div>
                    <label className="profile-label block mb-2 text-sm font-medium">Cor do Tema</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="color"
                        value={themeColor}
                        onChange={handleColorChange}
                        className="w-16 h-10 rounded cursor-pointer"
                      />
                      <span className="profile-text text-sm">
                        Escolha a cor do seu tema
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 pt-6 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className="px-6 py-2.5 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors w-full sm:w-auto"
                >
                  Alterar Senha
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-lg bg-primary text-white hover:bg-hover transition-colors w-full sm:w-auto disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </div>

            {showPasswordModal && <PasswordChangeModal />}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
