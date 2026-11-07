// Endereço da API do GeekCore (Express + MongoDB).
// Rodando localmente, usa http://localhost:3001.
// Publicado, troque API_PRODUCAO pela URL onde a API estiver hospedada (Vercel).
const API_PRODUCAO = 'https://geekcore.vercel.app';

const rodandoLocal = ['localhost', '127.0.0.1', ''].includes(window.location.hostname);

window.GEEKHUB_CONFIG = {
  API_URL: rodandoLocal ? 'http://localhost:3001' : API_PRODUCAO,
};
