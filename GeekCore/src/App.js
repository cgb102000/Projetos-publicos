import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { PrivateRoute } from './components/PrivateRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Favoritos } from './pages/Favoritos';
import { Detalhes } from './pages/Detalhes';
import { Perfil } from './pages/Perfil';
import { ThemeProvider } from './contexts/ThemeContext';
import { Amigos } from './pages/Amigos';
import { AlertProvider } from './contexts/AlertContext';
import { PerfilAmigo } from './pages/PerfilAmigo';
import { ListaBloqueados } from './pages/ListaBloqueados';
import { TodosFavoritos } from './pages/TodosFavoritos';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter future={{ 
        v7_startTransition: true,
        v7_relativeSplatPath: true 
      }}>
        <AuthProvider>
          <AlertProvider>
            <div className="min-h-screen bg-darker">
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/favoritos" 
                  element={
                    <PrivateRoute>
                      <TodosFavoritos />
                    </PrivateRoute>
                  } 
                />
                <Route path="/detalhes/videos/:id" element={<Detalhes />} />
                <Route 
                  path="/perfil" 
                  element={
                    <PrivateRoute>
                      <Perfil />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/amigos" 
                  element={
                    <PrivateRoute>
                      <Amigos />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/amigos/adicionar" 
                  element={
                    <PrivateRoute>
                      <Amigos mode="adicionar" />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/perfil/:id" 
                  element={
                    <PrivateRoute>
                      <PerfilAmigo />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/bloqueados" 
                  element={
                    <PrivateRoute>
                      <ListaBloqueados />
                    </PrivateRoute>
                  } 
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </AlertProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
