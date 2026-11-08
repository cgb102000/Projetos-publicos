import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { contentService } from '../services/api';
import { TIPOS, nomeCategoria, linkExplorar } from '../utils/catalogo';

let cacheCategorias = null;

function useCategorias() {
  const [categorias, setCategorias] = useState(cacheCategorias || []);
  useEffect(() => {
    if (cacheCategorias) return;
    contentService.getCategories().then((c) => { cacheCategorias = c; setCategorias(c); });
  }, []);
  return categorias;
}

function ConteudoMenu({ onEscolher }) {
  const categorias = useCategorias();
  return (
    <div className="gc-mega">
      <div>
        <p className="gc-mega-titulo">Tipo</p>
        <div className="gc-mega-tipos">
          {TIPOS.map((t) => (
            <Link key={t.id} to={linkExplorar({ tipo: t.id })} className="gc-mega-tipo" onClick={onEscolher}>
              <span aria-hidden="true">{t.icone}</span>
              {t.nome}
            </Link>
          ))}
          <Link to={linkExplorar()} className="gc-mega-tipo" onClick={onEscolher}>
            <span aria-hidden="true">✨</span>
            Tudo
          </Link>
        </div>
      </div>
      <div>
        <p className="gc-mega-titulo">Categorias</p>
        <div className="gc-mega-cats">
          {categorias.map((c) => (
            <Link key={c} to={linkExplorar({ categoria: c })} className="gc-chip-filtro" onClick={onEscolher}>
              {nomeCategoria(c)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// Botão "Explorar" do cabeçalho com painel de tipos e categorias (desktop)
export function MenuExplorar() {
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);
  const { pathname, search } = useLocation();

  useEffect(() => { setAberto(false); }, [pathname, search]);

  useEffect(() => {
    if (!aberto) return undefined;
    const fora = (e) => { if (ref.current && !ref.current.contains(e.target)) setAberto(false); };
    const esc = (e) => { if (e.key === 'Escape') setAberto(false); };
    document.addEventListener('mousedown', fora);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', fora); document.removeEventListener('keydown', esc); };
  }, [aberto]);

  return (
    <div className="gc-explorar" ref={ref}>
      <button
        type="button"
        className={`gc-nav-link${aberto || pathname === '/explorar' ? ' ativo' : ''}`}
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-haspopup="true"
        style={{ border: 0, background: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
      >
        Explorar
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ transform: aberto ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}><path d="M19 9l-7 7-7-7" /></svg>
      </button>
      {aberto && (
        <div className="gc-explorar-painel">
          <ConteudoMenu onEscolher={() => setAberto(false)} />
        </div>
      )}
    </div>
  );
}

// Gaveta lateral para o celular, com navegação e o mesmo conteúdo do Explorar
export function MenuMobile({ aberto, onFechar, isAuthenticated }) {
  const { pathname, search } = useLocation();
  useEffect(() => { onFechar(); }, [pathname, search]);

  useEffect(() => {
    document.body.style.overflow = aberto ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [aberto]);

  if (!aberto) return null;
  // Portal no body: o desfoque do cabeçalho prenderia um elemento "fixed" dentro dele
  return createPortal(
    <div className="gc-drawer-fundo" onClick={onFechar}>
      <aside className="gc-drawer" onClick={(e) => e.stopPropagation()} aria-label="Menu">
        <div className="gc-drawer-topo">
          <span className="gc-logo">Geek<span>Core</span></span>
          <button type="button" className="gc-icon-btn" onClick={onFechar} aria-label="Fechar menu">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="gc-drawer-links">
          <Link to="/">Início</Link>
          <Link to="/explorar">Explorar catálogo</Link>
          {isAuthenticated ? (
            <>
              <Link to="/favoritos">Meus favoritos</Link>
              <Link to="/perfil">Meu perfil</Link>
            </>
          ) : (
            <>
              <Link to="/login">Entrar</Link>
              <Link to="/register">Criar conta</Link>
            </>
          )}
        </nav>
        <ConteudoMenu onEscolher={onFechar} />
      </aside>
    </div>,
    document.body
  );
}
