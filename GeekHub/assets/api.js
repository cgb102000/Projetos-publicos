// Acesso à API do GeekCore. Todas as funções devolvem dados já tratados.
const API = (() => {
  const base = window.GEEKHUB_CONFIG.API_URL.replace(/\/$/, '');

  async function get(caminho, { vazioEm404 = false } = {}) {
    let resposta;
    try {
      resposta = await fetch(base + caminho);
    } catch {
      throw new Error('Não foi possível conectar à API. Ela pode estar desligada ou "acordando" (aguarde alguns segundos e tente de novo).');
    }
    // A API responde 404 quando uma busca ou categoria não tem resultados
    if (resposta.status === 404 && vazioEm404) return [];
    if (!resposta.ok) throw new Error(`A API respondeu com erro ${resposta.status}.`);
    return resposta.json();
  }

  return {
    recentes: () => get('/api/recent'),
    aleatorios: () => get('/api/random'),
    categorias: () => get('/api/categories', { vazioEm404: true }),
    buscar: (termo) => get(`/api/search?q=${encodeURIComponent(termo)}`, { vazioEm404: true }),
    porCategoria: (cat) => get(`/api/category/${encodeURIComponent(cat)}`, { vazioEm404: true }),
    item: (id) => get(`/api/item/${encodeURIComponent(id)}`),
    imagem(caminho) {
      if (!caminho) return 'assets/sem-capa.svg';
      return /^https?:\/\//.test(caminho) ? caminho : base + (caminho.startsWith('/') ? '' : '/') + caminho;
    },
  };
})();

// Escapa texto vindo da API antes de inserir no HTML
function esc(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function cardHTML(item) {
  const generos = (item.generos || []).slice(0, 2).join(' · ');
  return `
    <a class="card" href="detalhes.html?id=${encodeURIComponent(item._id)}">
      <img src="${esc(API.imagem(item.img_url))}" alt="" loading="lazy" onerror="this.src='assets/sem-capa.svg'">
      <div class="card-info">
        <h3>${esc(item.titulo)}</h3>
        <p>${esc([item.categoria, generos].filter(Boolean).join(' · '))}</p>
      </div>
    </a>`;
}

function mostrarErro(el, erro) {
  el.innerHTML = `<p class="aviso erro">${esc(erro.message)}</p>`;
}
