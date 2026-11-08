import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';
import { Card } from './Card';

const AVATAR_VAZIO = process.env.PUBLIC_URL + '/images/default-avatar.svg';

function formatarData(data) {
  if (!data) return null;
  const d = new Date(data);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

export function VisualizarPerfil({ usuario: usuarioSalvo, onEditar }) {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [atual, setAtual] = useState(null);
  // Os dados salvos no login ficam desatualizados; busca o perfil atual na API
  const usuario = { ...usuarioSalvo, ...atual };
  const cor = usuario?.tema_cor || 'var(--color-primary)';
  const totalAmigos = atual?.total_amigos ?? usuarioSalvo?.amigos?.length ?? 0;

  useEffect(() => {
    authService.getUserProfile().then(setAtual).catch(() => {});
  }, []);

  useEffect(() => {
    authService.getFavorites()
      .then((data) => setFavoritos(Array.isArray(data) ? data : []))
      .catch(() => setFavoritos([]))
      .finally(() => setLoading(false));
  }, []);

  if (!usuarioSalvo && !atual) return null;
  const membroDesde = formatarData(usuario.data_criacao);

  return (
    <div className="gc-perfil">
      <section className="gc-perfil-card">
        <div className="gc-perfil-capa" style={{ '--cor-perfil': cor }} />
        <div className="gc-perfil-topo">
          <img
            className="gc-perfil-avatar"
            src={usuario.foto || AVATAR_VAZIO}
            alt={`Foto de ${usuario.nome}`}
            style={{ borderColor: cor }}
            onError={(e) => { e.target.onerror = null; e.target.src = AVATAR_VAZIO; }}
          />
          <div className="gc-perfil-id">
            <h1>{usuario.nome}</h1>
            {membroDesde && <p>Membro desde {membroDesde}</p>}
          </div>
          {onEditar && (
            <button type="button" className="gc-btn gc-btn-ghost" onClick={onEditar}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Editar perfil
            </button>
          )}
        </div>

        <div className="gc-perfil-stats">
          <div><strong>{favoritos.length}</strong><span>{favoritos.length === 1 ? 'Favorito' : 'Favoritos'}</span></div>
          <div><strong>{totalAmigos}</strong><span>{totalAmigos === 1 ? 'Amigo' : 'Amigos'}</span></div>
          <div>
            <strong><span className="gc-perfil-cor" style={{ background: cor }} /></strong>
            <span>Cor do tema</span>
          </div>
        </div>

        <div className="gc-perfil-sobre">
          <h2>Sobre</h2>
          {usuario.descricao ? (
            <p>{usuario.descricao}</p>
          ) : (
            <p className="vazio">
              Você ainda não escreveu nada sobre você.
              {onEditar && <> <button type="button" className="gc-link" onClick={onEditar}>Adicionar uma descrição</button></>}
            </p>
          )}
        </div>
      </section>

      <section className="gc-section">
        <div className="gc-row-cabecalho">
          <h2 className="gc-section-title">Meus favoritos</h2>
          {favoritos.length > 0 && <Link to="/favoritos" className="gc-ver-tudo">Ver todos <span aria-hidden="true">→</span></Link>}
        </div>
        {loading ? (
          <div className="gc-grid">
            {Array.from({ length: 5 }, (_, i) => <div key={i} className="gc-skel" style={{ aspectRatio: '2 / 3' }} />)}
          </div>
        ) : favoritos.length > 0 ? (
          <div className="gc-grid">
            {favoritos.slice(0, 10).map((item) => <Card key={item._id} item={item} />)}
          </div>
        ) : (
          <div className="gc-panel gc-vazio">
            <p className="titulo">Nenhum favorito ainda</p>
            <p>Abra um título e toque em “Favoritar” para guardar aqui.</p>
            <Link to="/explorar" className="gc-btn">Explorar o catálogo</Link>
          </div>
        )}
      </section>
    </div>
  );
}
