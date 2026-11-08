import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';

export function Register() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmSenha: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.senha !== formData.confirmSenha) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.register(formData.nome, formData.email, formData.senha);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  const campos = [
    { name: 'nome', label: 'Nome', type: 'text', autoComplete: 'name' },
    { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
    { name: 'senha', label: 'Senha', type: 'password', autoComplete: 'new-password', minLength: 6 },
    { name: 'confirmSenha', label: 'Confirmar senha', type: 'password', autoComplete: 'new-password', minLength: 6 },
  ];

  return (
    <div className="gc-auth">
      <div className="gc-panel">
        <h1>Criar conta</h1>
        <p className="sub">Salve favoritos, adicione amigos e compartilhe títulos.</p>

        {error && <div className="gc-erro" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          {campos.map((c) => (
            <div key={c.name}>
              <label htmlFor={`reg-${c.name}`}>{c.label}</label>
              <input
                id={`reg-${c.name}`}
                name={c.name}
                type={c.type}
                autoComplete={c.autoComplete}
                minLength={c.minLength}
                value={formData[c.name]}
                onChange={handleChange}
                className="gc-input"
                required
              />
            </div>
          ))}
          <button type="submit" disabled={loading} className="gc-btn" style={{ width: '100%', marginTop: 4 }}>
            {loading ? 'Criando conta…' : 'Criar conta'}
          </button>
        </form>

        <p className="sub" style={{ margin: '20px 0 0', textAlign: 'center' }}>
          Já tem uma conta?{' '}
          <Link to="/login" className="text-primary" style={{ fontWeight: 700 }}>Entrar</Link>
        </p>
      </div>
    </div>
  );
}
