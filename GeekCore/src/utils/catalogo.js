// Nomes usados no menu, na página Explorar e nas fileiras da Home
export const TIPOS = [
  { id: 'filme', nome: 'Filmes', icone: '🎬' },
  { id: 'série', nome: 'Séries', icone: '📺' },
  { id: 'anime', nome: 'Animes', icone: '🍥' },
];

const NOMES_CATEGORIA = {
  shonen: 'Shonen',
  'ação': 'Ação',
  drama: 'Drama',
  fantasia: 'Fantasia',
  suspense: 'Suspense',
  'ficção científica': 'Ficção científica',
  terror: 'Terror',
  'comédia': 'Comédia',
  'animação': 'Animação',
  romance: 'Romance',
};

export function nomeCategoria(categoria = '') {
  return NOMES_CATEGORIA[categoria.toLowerCase()] || categoria.charAt(0).toUpperCase() + categoria.slice(1);
}

export function nomeTipo(tipo) {
  return TIPOS.find((t) => t.id === tipo)?.nome || 'Tudo';
}

export function linkExplorar({ tipo, categoria } = {}) {
  const params = new URLSearchParams();
  if (tipo) params.set('tipo', tipo);
  if (categoria) params.set('categoria', categoria);
  const qs = params.toString();
  return `/explorar${qs ? `?${qs}` : ''}`;
}
