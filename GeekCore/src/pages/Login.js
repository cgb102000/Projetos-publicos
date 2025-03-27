import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { authService } from '../services/api';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { user, token } = await authService.login(email, senha);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({ type: 'LOGIN', payload: { user, token } });
      navigate('/');  // Alterado de /home para /
    } catch (err) {
      setError('Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-darker">
      <div className="bg-dark p-8 rounded-lg shadow-xl w-96">
        <h1 className="text-2xl font-bold text-light mb-6">Login</h1>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 rounded bg-darker text-light"
              required
            />
          </div>

          <div className="mb-6">
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              className="w-full p-3 rounded bg-darker text-light"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white p-3 rounded hover:bg-hover transition-colors disabled:opacity-50"
          >
            {loading ? 'Carregando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-light text-center mt-4">
          Não tem uma conta?{' '}
          <Link to="/register" className="text-primary hover:text-hover">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
