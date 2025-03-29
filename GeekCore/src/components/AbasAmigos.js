import React, { useState, useEffect } from 'react';
import { amigoService } from '../services/api';
import { Alert } from './Alert';
import { Link } from 'react-router-dom';

export function AbasAmigos() {
  const [amigos, setAmigos] = useState([]);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [emailAmigo, setEmailAmigo] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [amigosData, solicitacoesData] = await Promise.all([
        amigoService.listarAmigos(),
        amigoService.listarSolicitacoes()
      ]);
      setAmigos(amigosData.filter(amigo => amigo?.usuario)); // Filtrar amigos válidos
      setSolicitacoes(solicitacoesData);
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Erro ao carregar amigos'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResponderSolicitacao = async (solicitacaoId, aceitar) => {
    try {
      await amigoService.responderSolicitacao(solicitacaoId, aceitar);
      await carregarDados();
      setAlert({
        type: 'success',
        message: aceitar ? 'Amigo adicionado!' : 'Solicitação rejeitada'
      });
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.message
      });
    }
  };

  const handleEnviarSolicitacao = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await amigoService.enviarSolicitacao(emailAmigo);
      setShowAddFriend(false);
      setEmailAmigo('');
      setAlert({
        type: 'success',
        message: 'Solicitação enviada com sucesso!'
      });
      await carregarDados();
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.message || 'Erro ao enviar solicitação'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-4">Carregando...</div>;

  return (
    <div className="space-y-6">
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Amigos</h2>
        <button
          onClick={() => setShowAddFriend(true)}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-hover transition-all flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Adicionar Amigo</span>
        </button>
      </div>

      {/* Modal Adicionar Amigo */}
      {showAddFriend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark p-6 rounded-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Adicionar Amigo</h3>
              <button 
                onClick={() => setShowAddFriend(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleEnviarSolicitacao} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={emailAmigo}
                  onChange={(e) => setEmailAmigo(e.target.value)}
                  placeholder="Email do amigo"
                  className="w-full p-3 rounded bg-darker text-light border border-gray-700 focus:border-primary"
                  required
                />
                <p className="text-sm text-gray-400 mt-1">
                  Digite o email do usuário que deseja adicionar
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddFriend(false)}
                  className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded bg-primary text-white hover:bg-hover flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <span>Enviar Solicitação</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Solicitações */}
      {solicitacoes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Solicitações Pendentes</h3>
          {solicitacoes.map(sol => (
            <div key={sol._id} className="flex justify-between items-center bg-darker p-4 rounded">
              <div className="flex items-center space-x-4">
                <img
                  src={sol.de.foto || '/images/default-avatar.png'}
                  alt={sol.de.nome}
                  className="w-10 h-10 rounded-full"
                />
                <span>{sol.de.nome}</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleResponderSolicitacao(sol._id, true)}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Aceitar
                </button>
                <button
                  onClick={() => handleResponderSolicitacao(sol._id, false)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Rejeitar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lista de Amigos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {amigos.length > 0 ? (
          amigos.map(amigo => (
            <Link
              to={`/perfil/${amigo.usuario._id}`}
              key={amigo.usuario._id}
              className="bg-darker p-4 rounded text-center transform hover:scale-105 transition-all hover:shadow-lg"
            >
              <div className="relative w-20 h-20 mx-auto mb-2">
                <img
                  src={amigo.usuario.foto || '/images/default-avatar.png'}
                  alt={amigo.usuario.nome}
                  className="w-full h-full rounded-full object-cover"
                />
                <div className="absolute inset-0 rounded-full border-2 border-primary opacity-0 hover:opacity-100 transition-opacity" />
              </div>
              <h4 className="font-medium text-white hover:text-primary transition-colors">
                {amigo.usuario.nome}
              </h4>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-400 py-8">
            Você ainda não tem amigos adicionados
          </div>
        )}
      </div>
    </div>
  );
}
