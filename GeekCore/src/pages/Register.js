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

  return (
    <div className="min-h-screen flex items-center justify-center bg-darker">
      <div className="bg-dark p-8 rounded-lg shadow-xl w-96">
        <h1 className="text-2xl font-bold text-light mb-6">Criar Conta</h1>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="nome"
            placeholder="Nome"
            value={formData.nome}
            onChange={handleChange}
            className="w-full p-3 rounded bg-darker text-light"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 rounded bg-darker text-light"
            required
          />

          <input
            type="password"
            name="senha"
            placeholder="Senha"
            value={formData.senha}
            onChange={handleChange}
            className="w-full p-3 rounded bg-darker text-light"
            required
            minLength={6}
          />

          <input
            type="password"
            name="confirmSenha"
            placeholder="Confirmar Senha"
            value={formData.confirmSenha}
            onChange={handleChange}
            className="w-full p-3 rounded bg-darker text-light"
            required
            minLength={6}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white p-3 rounded hover:bg-hover transition-colors disabled:opacity-50"
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>

          <p className="text-light text-center mt-4">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary hover:text-hover">
              Fazer login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
