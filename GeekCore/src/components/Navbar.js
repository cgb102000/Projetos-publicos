import { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { FriendsDropdown } from './FriendsDropdown';

export function Navbar() {
  const { isAuthenticated, user, dispatch } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showFriendsList, setShowFriendsList] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode, setIsDarkMode } = useTheme();
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-darker bg-opacity-95 z-50 py-4">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <Link to="/" className="text-primary text-2xl font-bold title-hover shrink-0">
          GeekCore
        </Link>

        <div className="flex-1 flex justify-center px-2 md:px-4 max-w-xl mx-auto">
          <form onSubmit={handleSearch} className="flex w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar filmes ou animes..."
              className="w-full py-2 px-3 md:px-4 rounded-l-full bg-dark text-light border border-gray-700 focus:outline-none focus:border-primary hover:border-hover transition-all text-sm md:text-base"
            />
            <button
              type="submit"
              className="button-base rounded-r-full px-4 md:px-6 py-2 text-sm md:text-base shrink-0"
            >
              Buscar
            </button>
          </form>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-gray-700 transition-all"
            title={isDarkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          >
            {isDarkMode ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 3v1m0 16v1m8-8h1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
              </svg>
            )}
          </button>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  ref={buttonRef}
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="nav-link flex items-center space-x-2 text-light group"
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 profile-avatar-border transition-colors">
                    {user?.foto ? (
                      <img
                        src={user.foto}
                        alt={user.nome}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/default-avatar.png';
                        }}
                        loading="eager"
                      />
                    ) : (
                      <img
                        src="/images/default-avatar.png"
                        alt="Avatar padrão"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <span className="hidden md:inline">Meu Perfil</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isProfileOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isProfileOpen && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-darker border border-gray-700 z-50 animate-fadeInDown"
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
                <Link to="/login" className="nav-link text-light">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="nav-button bg-primary text-white px-4 py-2 rounded transition-colors"
                >
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
