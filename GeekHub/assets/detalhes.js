const detalhe = document.getElementById('detalhe');
const id = new URLSearchParams(window.location.search).get('id');

async function carregarDetalhe() {
  if (!id) {
    detalhe.innerHTML = '<p class="aviso">Nenhum título selecionado. <a href="index.html">Voltar ao catálogo</a></p>';
    return;
  }
  try {
    const item = await API.item(id);
    document.title = `${item.titulo} · GeekHub`;
    const generos = (item.generos || []).map((g) => `<span class="tag">${esc(g)}</span>`).join('');
    const link = /^https?:\/\//.test(item.url || '')
      ? `<a class="botao" href="${esc(item.url)}" target="_blank" rel="noopener">Assistir</a>`
      : '';
    detalhe.innerHTML = `
      <img class="capa" src="${esc(API.imagem(item.img_url))}" alt="Capa de ${esc(item.titulo)}" onerror="this.src='assets/sem-capa.svg'">
      <div class="info">
        <p class="categoria">${esc(item.categoria || '')}</p>
        <h1>${esc(item.titulo)}</h1>
        <div class="tags">${generos}</div>
        <p>${esc(item.descricao || 'Sem descrição.')}</p>
        ${link}
      </div>`;
  } catch (erro) {
    mostrarErro(detalhe, erro.message.includes('404') ? new Error('Título não encontrado.') : erro);
  }
}

async function carregarSugestoes() {
  try {
    const itens = (await API.aleatorios()).filter((i) => i._id !== id);
    if (!itens.length) return;
    document.getElementById('sugestoes').innerHTML = itens.slice(0, 5).map(cardHTML).join('');
    document.getElementById('secao-sugestoes').hidden = false;
  } catch {
    // Sugestões são opcionais: se falhar, a seção fica escondida
  }
}

carregarDetalhe();
carregarSugestoes();
