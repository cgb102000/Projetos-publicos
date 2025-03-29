import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { authService } from '../services/api';
import { VisualizarPerfil } from '../components/VisualizarPerfil';
import { Footer } from '../components/Footer';
import { useAlert } from '../contexts/AlertContext';

export function PerfilAmigo() {
  const { id } = useParams();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  useEffect(() => {
    const carregarPerfil = async () => {
      try {
        setLoading(true);
        const data = await authService.getPublicProfile(id);
        setUsuario(data);
      } catch (error) {
        showAlert('Erro ao carregar perfil do usuário', 'error');
      } finally {
        setLoading(false);
      }
    };

    carregarPerfil();
  }, [id, showAlert]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="content-section pt-20 animate-fadeIn flex-grow">
        <div className="container mx-auto px-4 pt-24 pb-12">
          {usuario ? (
            <VisualizarPerfil usuario={usuario} />
          ) : (
            <div className="text-center text-gray-400">
              Usuário não encontrado
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
