import { createContext, useReducer, useEffect } from 'react';

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload.user }
      };
    default:
      return state;
  }
}

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const user = JSON.parse(localStorage.getItem('user'));
      dispatch({ 
        type: 'LOGIN', 
        payload: { user, token }
      });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const updateUserData = (userData) => {
    dispatch({ 
      type: 'UPDATE_USER', 
      payload: { 
        user: { ...state.user, ...userData },
        token: state.token 
      } 
    });
    // Atualizar também no localStorage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({ ...currentUser, ...userData }));
  };

  return (
    <AuthContext.Provider value={{ 
      ...state, 
      dispatch,
      updateUserData,
      isAuthenticated: !!state.token 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
