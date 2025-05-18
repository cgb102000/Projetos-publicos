import { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { authService } from '../services/api';

export function Callback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dispatch } = useContext(AuthContext);

  useEffect(() => {
    const processAuth = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');
        
        if (code) {
          const response = await authService.handleAuthCallback(code);
          if (response.token && response.user) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            dispatch({ type: 'LOGIN', payload: response });
          }
        }
        navigate('/');
      } catch (error) {
        console.error('Erro no callback:', error);
        navigate('/login');
      }
    };

    processAuth();
  }, [location, dispatch, navigate]);

  return <div>Processando autenticação...</div>;
}
