import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export function Navbar() {
  const { isAuthenticated, user, dispatch } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { isDarkMode, setIsDarkMode } = useTheme();

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
      <div className="container mx-auto px-4 flex flex-wrap items-center justify-between">
        <Link to="/" className="text-primary text-2xl font-bold">GeekCore</Link>

        <div className="flex-1 flex justify-center px-4 max-w-xl mx-auto">
          <form onSubmit={handleSearch} className="flex w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar filmes ou animes..."
              className="w-full py-2 px-4 rounded-l-full bg-dark text-light border border-gray-700 focus:outline-none focus:border-primary"
            />
            <button 
              type="submit"
              className="bg-primary text-white px-6 py-2 rounded-r-full hover:bg-hover transition-colors"
            >
              Buscar
            </button>
          </form>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-gray-700"
            title={isDarkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
          >
            {isDarkMode ? (
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          {isAuthenticated ? (
            <>
              <Link to="/favoritos" className="text-light hover:text-primary transition-colors">
                Favoritos
              </Link>
              <div className="flex items-center space-x-3">
                <Link 
                  to="/perfil" 
                  className="flex items-center space-x-2 text-light hover:text-primary transition-colors group"
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-primary group-hover:border-hover transition-colors">
                    {user?.foto ? (
                      <img
                        src={user.foto}
                        alt={user.nome}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null; // Previne loop infinito
                          e.target.src = '/images/default-avatar.png';
                        }}
                        loading="eager" // Carregamento prioritário
                      />
                    ) : (
                      <img
                        src="/images/default-avatar.png"
                        alt="Avatar padrão"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <span>Meu Perfil</span>
                </Link>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-hover transition-colors"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-light hover:text-primary transition-colors">
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-primary text-white px-4 py-2 rounded hover:bg-hover transition-colors"
              >
                Cadastrar
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
