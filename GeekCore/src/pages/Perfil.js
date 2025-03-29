import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { EditarPerfil } from '../components/EditarPerfil';
import { AbasAmigos } from '../components/AbasAmigos';
import { Footer } from '../components/Footer';

export function Perfil() {
  const [activeTab, setActiveTab] = useState('perfil');
  const { user } = useContext(AuthContext);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="content-section pt-20 animate-fadeIn flex-grow">
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-4xl mx-auto">
            {/* Abas de navegação */}
            <div className="flex border-b border-gray-700 mb-8">
              <button
                className={`px-6 py-3 font-medium ${
                  activeTab === 'perfil'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('perfil')}
              >
                Meu Perfil
              </button>
              <button
                className={`px-6 py-3 font-medium ${
                  activeTab === 'amigos'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('amigos')}
              >
                Amigos
              </button>
            </div>

            {/* Conteúdo das abas */}
            <div className="mt-6">
              {activeTab === 'perfil' && (
                <EditarPerfil usuario={user} />
              )}
              {activeTab === 'amigos' && (
                <AbasAmigos />
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
