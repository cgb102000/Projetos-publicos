import { useContext, useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { FriendsDropdown } from './FriendsDropdown';
import { adjustBrightness } from '../utils/themeUtils';
import { amigoService } from '../services/api';

export function Navbar() {
  const { isAuthenticated, user, dispatch } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showFriendsList, setShowFriendsList] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [buscaAberta, setBuscaAberta] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode, setIsDarkMode, resetToDefaultTheme } = useTheme();
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
        setShowFriendsList(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Buscar notificações ao autenticar e periodicamente
  useEffect(() => {
    let interval;
    async function fetchNotifications() {
      if (isAuthenticated) {
        try {
          const data = await amigoService.listarNotificacoes?.();
          setNotifications(data || []);
          setUnreadCount((data || []).filter(n => !n.lida).length);
        } catch {
          setNotifications([]);
          setUnreadCount(0);
        }
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    }
    fetchNotifications();
    if (isAuthenticated) {
      interval = setInterval(fetchNotifications, 15000); // Atualiza a cada 15s
    }
    return () => interval && clearInterval(interval);
  }, [isAuthenticated]);

  // Buscar notificações ao abrir o dropdown (mantém para garantir atualização instantânea)
  useEffect(() => {
    if (showNotifications && isAuthenticated) {
      setLoadingNotifications(true);
      amigoService.listarNotificacoes?.()
        .then(data => {
          setNotifications(data || []);
          setUnreadCount((data || []).filter(n => !n.lida).length);
        })
        .catch(() => setNotifications([]))
        .finally(() => setLoadingNotifications(false));
    }
  }, [showNotifications, isAuthenticated]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNotifications]);

  const handleLogout = () => {
    // Primeiro limpar dados do usuário
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userThemeColor');
    localStorage.removeItem('tema_cor');
    
    // Resetar para cor padrão
    resetToDefaultTheme();
    
    // Despachar ação de logout
    dispatch({ type: 'LOGOUT' });
    
    // Navegar para home
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setBuscaAberta(false);
    }
  };

  const handleThemeToggle = () => {
    // Preservar a cor atual antes de mudar o modo
    const currentColor = document.documentElement.style.getPropertyValue('--color-primary');
    setIsDarkMode(!isDarkMode);
    
    // Reaplica a cor após a mudança de modo
    setTimeout(() => {
      document.documentElement.style.setProperty('--color-primary', currentColor);
      document.documentElement.style.setProperty('--color-hover', adjustBrightness(currentColor, -15));
      localStorage.setItem('userThemeColor', currentColor);
    }, 0);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await amigoService.marcarNotificacaoComoLida?.(notificationId);
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, lida: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  // Função para deletar uma notificação individual
  const handleDeleteNotification = async (notificationId) => {
    try {
      await amigoService.deletarNotificacao?.(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  // Função para limpar todas as notificações
  const handleClearAllNotifications = async () => {
    try {
      await amigoService.limparNotificacoes?.();
      setNotifications([]);
      setUnreadCount(0);
    } catch {}
  };

  const linkClasse = ({ isActive }) => `gc-nav-link${isActive ? ' ativo' : ''}`;

  return (
    <nav className="gc-nav">
      <div className="gc-container gc-nav-inner">
        <Link to="/" className="gc-logo" aria-label="GeekCore, página inicial">Geek<span>Core</span></Link>

        <div className="gc-nav-links">
          <NavLink to="/" end className={linkClasse}>Início</NavLink>
          {isAuthenticated && <NavLink to="/favoritos" className={linkClasse}>Favoritos</NavLink>}
          {isAuthenticated && <NavLink to="/perfil" className={linkClasse}>Perfil</NavLink>}
        </div>

        <form onSubmit={handleSearch} className="gc-search desktop" role="search">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar filmes, séries e animes"
              aria-label="Buscar"
              className="gc-input"
            />
          </form>

        <div className="gc-nav-actions">
          <button
            type="button"
            className="gc-icon-btn gc-only-mobile"
            onClick={() => setBuscaAberta((v) => !v)}
            aria-label="Abrir busca"
            aria-expanded={buscaAberta}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          </button>
          {isAuthenticated && (
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications(v => !v)}
                className="gc-icon-btn"
                title="Notificações"
                aria-label="Notificações"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-24px)] rounded-xl shadow-2xl bg-darker border border-gray-700 overflow-hidden z-50 animate-fadeInDown">
                  <div className="p-4 border-b border-gray-700 font-bold text-light flex items-center justify-between">
                    <span>Notificações</span>
                    {notifications.length > 0 && (
                      <button
                        onClick={handleClearAllNotifications}
                        className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                        title="Limpar todas as notificações"
                      >
                        Limpar tudo
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="p-4 text-center text-gray-400">Carregando...</div>
                    ) : notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-400">Nenhuma notificação</div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n._id}
                          className={`p-4 border-b border-gray-800 flex items-start gap-3 ${n.lida ? 'opacity-60' : ''} group`}
                        >
                          <div className="flex-shrink-0">
                            <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="text-light text-sm">{n.mensagem}</div>
                            <div className="text-xs text-gray-400 mt-1">{new Date(n.data).toLocaleString()}</div>
                            <div className="flex gap-2 mt-2">
                              {!n.lida && (
                                <button
                                  onClick={() => handleMarkAsRead(n._id)}
                                  className="text-xs text-primary hover:underline"
                                >
                                  Marcar como lida
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteNotification(n._id)}
                                className="text-xs text-light rounded-full p-1 transition-colors hover:bg-hover hover:text-white ml-2"
                                title="Excluir notificação"
                                style={{ lineHeight: 0 }}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={handleThemeToggle}
            className="gc-icon-btn"
            title={isDarkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            aria-label={isDarkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m8-8h1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" /></svg>
            )}
          </button>

          {isAuthenticated ? (
            <div className="relative flex items-center gap-1">
              <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-1 pl-1 text-light group"
                aria-label="Menu do perfil"
                aria-expanded={isProfileOpen}
              >
                <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 profile-avatar-border">
                  <img
                    src={user?.foto || process.env.PUBLIC_URL + '/images/default-avatar.svg'}
                    alt={user?.nome || 'Meu perfil'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = process.env.PUBLIC_URL + '/images/default-avatar.svg';
                    }}
                  />
                </div>
                <svg className={`w-4 h-4 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <button type="button" onClick={handleLogout} className="gc-icon-btn" title="Sair" aria-label="Sair">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
                {isProfileOpen && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-2xl py-1 bg-darker border border-gray-700 z-50 animate-fadeInDown"
                  >
                    <div className="absolute -top-2 right-4 w-4 h-4 bg-darker border-l border-t border-gray-700 transform rotate-45"></div>

                    <div className="relative bg-darker rounded-md">
                      <Link
                        to="/perfil"
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-4 py-2 text-sm text-light hover:bg-hover transition-all"
                      >
                        Ver Perfil
                      </Link>
                      <Link
                        to="/favoritos"
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-4 py-2 text-sm text-light hover:bg-hover transition-all"
                      >
                        Meus Favoritos
                      </Link>
                      <div className="relative">
                        <button
                          onClick={() => setShowFriendsList(!showFriendsList)}
                          className="w-full text-left px-4 py-2 text-sm text-light hover:bg-hover transition-all flex items-center justify-between"
                        >
                          <span>Meus Amigos</span>
                          <svg
                            className={`w-4 h-4 transition-transform ${
                              showFriendsList ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <div className="relative">
                          {showFriendsList && <FriendsDropdown onClose={() => setShowFriendsList(false)} />}
                        </div>
                      </div>
                      <button
                        className="md:hidden w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-hover transition-all border-t border-gray-700"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Fechar menu
                      </button>
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <>
              <Link to="/login" className="gc-nav-link">Entrar</Link>
              <Link to="/register" className="gc-btn gc-nav-cta" style={{ padding: '8px 16px' }}>Criar conta</Link>
            </>
          )}
        </div>
      </div>

      <div className={`gc-search-mobile${buscaAberta ? ' aberto' : ''}`}>
        <div className="gc-container">
          <form onSubmit={handleSearch} className="gc-search" role="search">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar filmes, séries e animes"
              aria-label="Buscar"
              className="gc-input"
            />
          </form>
        </div>
      </div>
    </nav>
  );
}
