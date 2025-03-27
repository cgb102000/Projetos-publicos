import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export function Navbar() {
  const { isAuthenticated, user, dispatch } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

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
          {isAuthenticated ? (
            <>
              <Link to="/favoritos" className="text-light hover:text-primary transition-colors">
                Favoritos
              </Link>
              <span className="text-light">Olá, {user?.nome}</span>
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
