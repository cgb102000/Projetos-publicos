const lista = document.getElementById('lista');
const titulo = document.getElementById('titulo-secao');
const navCategorias = document.getElementById('categorias');
const campoBusca = document.getElementById('campo-busca');

function renderizar(itens, mensagemVazia) {
  lista.innerHTML = itens.length
    ? itens.map(cardHTML).join('')
    : `<p class="aviso">${esc(mensagemVazia)}</p>`;
}

async function carregar(tituloSecao, buscarItens, mensagemVazia) {
  titulo.textContent = tituloSecao;
  lista.innerHTML = '<p class="aviso">Carregando…</p>';
  try {
    renderizar(await buscarItens(), mensagemVazia);
  } catch (erro) {
    mostrarErro(lista, erro);
  }
}

function marcarCategoria(nome) {
  navCategorias.querySelectorAll('button').forEach((b) => {
    b.classList.toggle('ativa', b.dataset.categoria === nome);
  });
}

function mostrarRecentes() {
  marcarCategoria('');
  carregar('Adicionados recentemente', API.recentes, 'O catálogo ainda está vazio.');
}

async function montarCategorias() {
  try {
    const categorias = await API.categorias();
    navCategorias.innerHTML = ['', ...categorias].map((c) =>
      `<button type="button" data-categoria="${esc(c)}">${esc(c || 'Recentes')}</button>`).join('');
    marcarCategoria('');
  } catch {
    navCategorias.innerHTML = '';
  }
}

navCategorias.addEventListener('click', (e) => {
  const botao = e.target.closest('button');
  if (!botao) return;
  const cat = botao.dataset.categoria;
  if (!cat) return mostrarRecentes();
  marcarCategoria(cat);
  carregar(cat, () => API.porCategoria(cat), 'Nada nesta categoria ainda.');
});

document.getElementById('form-busca').addEventListener('submit', (e) => {
  e.preventDefault();
  const termo = campoBusca.value.trim();
  if (!termo) return mostrarRecentes();
  marcarCategoria(null);
  carregar(`Resultados para "${termo}"`, () => API.buscar(termo), 'Nenhum filme ou anime encontrado.');
});

montarCategorias();
mostrarRecentes();
