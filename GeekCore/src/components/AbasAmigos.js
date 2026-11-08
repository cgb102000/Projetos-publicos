import React, { useState, useEffect } from 'react';
import { amigoService } from '../services/api';
import { Alert } from './Alert';
import { Link } from 'react-router-dom';

const AVATAR_VAZIO = process.env.PUBLIC_URL + '/images/default-avatar.svg';
const avatarErro = (e) => { e.target.onerror = null; e.target.src = AVATAR_VAZIO; };

export function AbasAmigos() {
  const [amigos, setAmigos] = useState([]);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [emailAmigo, setEmailAmigo] = useState('');
  const [menuAbertoId, setMenuAbertoId] = useState(null);

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

  const handleAmigoAction = async (amigoId, action, nome = 'este amigo') => {
    const pergunta = action === 'excluir'
      ? `Remover ${nome} da sua lista de amigos?`
      : `Bloquear ${nome}? Vocês deixam de ser amigos.`;
    if (!window.confirm(pergunta)) return;
    try {
      switch (action) {
        case 'excluir':
          await amigoService.removerAmigo(amigoId);
          setAlert({
            type: 'success',
            message: 'Amigo removido com sucesso'
          });
          break;
        case 'bloquear':
          await amigoService.bloquearAmigo(amigoId);
          setAlert({
            type: 'success',
            message: 'Usuário bloqueado com sucesso'
          });
          break;
        default:
          break;
      }
      await carregarDados();
      setMenuAbertoId(null);
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.message
      });
    }
  };

  const handleOpenMenu = (e, amigoId) => {
    e.stopPropagation();
    setMenuAbertoId(menuAbertoId === amigoId ? null : amigoId);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuAbertoId && !e.target.closest('.menu-amigo')) {
        setMenuAbertoId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuAbertoId]);

  if (loading && !amigos.length && !solicitacoes.length) {
    return (
      <div className="gc-amigos-grade">
        {Array.from({ length: 4 }, (_, i) => <div key={i} className="gc-skel" style={{ height: 180 }} />)}
      </div>
    );
  }

  return (
    <div className="gc-amigos">
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="gc-row-cabecalho" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="gc-section-title" style={{ marginBottom: 4 }}>Amigos</h2>
          <p className="gc-section-sub" style={{ margin: 0 }}>
            {amigos.length === 1 ? '1 amigo' : `${amigos.length} amigos`}
            {solicitacoes.length > 0 && ` · ${solicitacoes.length} ${solicitacoes.length === 1 ? 'solicitação pendente' : 'solicitações pendentes'}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/bloqueados" className="gc-btn gc-btn-ghost">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
            Bloqueados
          </Link>
          <button type="button" onClick={() => setShowAddFriend((v) => !v)} className="gc-btn" aria-expanded={showAddFriend}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
            Adicionar amigo
          </button>
        </div>
      </div>

      {showAddFriend && (
        <form onSubmit={handleEnviarSolicitacao} className="gc-panel gc-add-amigo">
          <label htmlFor="email-amigo">Email do amigo</label>
          <div className="linha">
            <input
              id="email-amigo"
              type="email"
              value={emailAmigo}
              onChange={(e) => setEmailAmigo(e.target.value)}
              placeholder="nome@exemplo.com"
              className="gc-input"
              autoFocus
              required
            />
            <button type="submit" disabled={loading} className="gc-btn">
              {loading ? 'Enviando…' : 'Enviar convite'}
            </button>
            <button type="button" onClick={() => setShowAddFriend(false)} className="gc-btn gc-btn-ghost">Cancelar</button>
          </div>
          <p className="gc-section-sub" style={{ margin: '8px 0 0' }}>A pessoa precisa ter uma conta no GeekCore.</p>
        </form>
      )}

      {solicitacoes.length > 0 && (
        <section className="gc-section" style={{ marginTop: 24 }}>
          <h3 className="gc-subtitulo">Solicitações pendentes</h3>
          <div className="gc-lista">
            {solicitacoes.map(sol => (
              <div key={sol._id} className="gc-lista-item">
                <img src={sol.de.foto || AVATAR_VAZIO} alt="" onError={avatarErro} />
                <div className="nome">
                  <strong>{sol.de.nome}</strong>
                  <span>quer ser seu amigo</span>
                </div>
                <div className="acoes">
                  <button type="button" onClick={() => handleResponderSolicitacao(sol._id, true)} className="gc-btn" style={{ padding: '8px 14px' }}>Aceitar</button>
                  <button type="button" onClick={() => handleResponderSolicitacao(sol._id, false)} className="gc-btn gc-btn-ghost" style={{ padding: '8px 14px' }}>Recusar</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="gc-section" style={{ marginTop: 24 }}>
        {amigos.length > 0 ? (
          <div className="gc-amigos-grade">
            {amigos.map(amigo => (
              <div key={amigo.usuario._id} className="gc-amigo menu-amigo">
                <img src={amigo.usuario.foto || AVATAR_VAZIO} alt="" onError={avatarErro} />
                <strong title={amigo.usuario.nome}>{amigo.usuario.nome}</strong>
                <div className="acoes">
                  <Link to={`/perfil/${amigo.usuario._id}`} className="gc-btn gc-btn-ghost" style={{ padding: '7px 12px', fontSize: '0.85rem' }}>Ver perfil</Link>
                  <button
                    type="button"
                    onClick={(e) => handleOpenMenu(e, amigo.usuario._id)}
                    className="gc-icon-btn"
                    aria-label={`Mais opções para ${amigo.usuario.nome}`}
                    aria-expanded={menuAbertoId === amigo.usuario._id}
                  >
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
                  </button>
                </div>

                {menuAbertoId === amigo.usuario._id && (
                  <div className="gc-menu-flutuante" role="menu">
                    <button type="button" onClick={() => handleAmigoAction(amigo.usuario._id, 'bloquear', amigo.usuario.nome)}>Bloquear</button>
                    <button type="button" className="perigo" onClick={() => handleAmigoAction(amigo.usuario._id, 'excluir', amigo.usuario.nome)}>Remover amigo</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="gc-panel gc-vazio">
            <p className="titulo">Nenhum amigo ainda</p>
            <p>Adicione amigos pelo email para compartilhar títulos com eles.</p>
            <button type="button" className="gc-btn" onClick={() => setShowAddFriend(true)}>Adicionar amigo</button>
          </div>
        )}
      </section>
    </div>
  );
}
