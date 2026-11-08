import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="gc-footer">
      <div className="gc-container inner">
        <div>
          <Link to="/" className="gc-logo">Geek<span>Core</span></Link>
          <p>Filmes, séries e animes para descobrir e compartilhar com os amigos.</p>
        </div>
        <nav aria-label="Rodapé">
          <Link to="/">Início</Link>
          <Link to="/favoritos">Favoritos</Link>
          <Link to="/perfil">Meu perfil</Link>
          <a href="https://github.com/cgb102000/Projetos-publicos/tree/main/GeekCore" target="_blank" rel="noopener noreferrer">Código no GitHub</a>
        </nav>
        <p style={{ width: '100%' }}>&copy; {new Date().getFullYear()} GeekCore · criado por Caio Gabriel</p>
      </div>
    </footer>
  );
}
