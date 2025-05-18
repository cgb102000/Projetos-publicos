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
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        
        if (code) {
          const { user, token } = await authService.processCallback(code);
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          dispatch({ 
            type: 'LOGIN',
            payload: { user, token }
          });
          
          navigate('/');
        }
      } catch (error) {
        console.error('Erro no login com Google:', error);
        navigate('/login?error=google_auth_failed');
      }
    };

    processAuth();
  }, [location, navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-darker">
      <div className="text-white text-xl">Processando autenticação...</div>
    </div>
  );
}
