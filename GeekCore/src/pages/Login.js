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
      const { user, token, success } = await authService.login(email, senha);
      
      if (success && token) {
        dispatch({ type: 'LOGIN', payload: { user, token } });
        navigate('/');
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
    } catch (err) {
      setError(err.message || 'Email ou senha inválidos');
      console.error('Erro de login:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="gc-auth">
      <div className="gc-panel">
        <h1>Entrar</h1>
        <p className="sub">Bem-vindo de volta ao GeekCore.</p>

        {error && <div className="gc-erro" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <div>
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="gc-input"
              required
            />
          </div>
          <div>
            <label htmlFor="login-senha">Senha</label>
            <input
              id="login-senha"
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              className="gc-input"
              required
              minLength={6}
            />
          </div>
          <button type="submit" disabled={loading} className="gc-btn" style={{ width: '100%', marginTop: 4 }}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="sub" style={{ margin: '20px 0 0', textAlign: 'center' }}>
          Não tem uma conta?{' '}
          <Link to="/register" className="text-primary" style={{ fontWeight: 700 }}>Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}
