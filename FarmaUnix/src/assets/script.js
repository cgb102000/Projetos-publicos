const ENDERECO_LOJA = 'Rua Dr. Nelson Luiz Proença Fernandes, 121 - São José do Rio Preto';
const COORDENADAS_LOJA = [-20.7816959, -49.4042847];
const CIDADE_PADRAO = 'São José do Rio Preto, SP';
const WHATSAPP = '17992255791';

const PRODUTOS = [
  { id: 'dipirona', nome: 'Dipirona', preco: 10, cor: '#e53935',
    descricao: 'Analgésico e antitérmico: alivia dores e reduz a febre.' },
  { id: 'dorflex', nome: 'Dorflex', preco: 15, cor: '#1e88e5',
    descricao: 'Analgésico e relaxante muscular, indicado para dores ligadas a contraturas, como a dor de cabeça tensional.' },
  { id: 'benegrip', nome: 'Benegrip', preco: 20, cor: '#fb8c00',
    descricao: 'Alivia sintomas de gripe e resfriado, como febre, dor de cabeça, congestão nasal e coriza. Para maiores de 12 anos.' },
  { id: 'buscopan', nome: 'Buscopan', preco: 25, cor: '#43a047',
    descricao: 'Atua nas dores abdominais e cólicas, com alívio rápido e prolongado.' },
  { id: 'engov', nome: 'Engov', preco: 30, cor: '#8e24aa',
    descricao: 'Combinação de analgésico e antialérgico usada para aliviar dor de cabeça e mal-estar.' },
  { id: 'doril', nome: 'Doril', preco: 35, cor: '#00897b',
    descricao: 'Alívio de dores leves a moderadas: dor de cabeça, resfriado, dores musculares e dor de dente.' },
  { id: 'amoxicilina', nome: 'Amoxicilina', preco: 40, cor: '#3949ab', receita: true,
    descricao: 'Antibiótico de amplo espectro para infecções bacterianas causadas por germes sensíveis.' },
  { id: 'zolpidem', nome: 'Zolpidem', preco: 45, cor: '#5e35b1', receita: true,
    descricao: 'Age nos centros do sono no cérebro e é prescrito para o tratamento da insônia.' },
  { id: 'rivotril', nome: 'Rivotril', preco: 50, cor: '#6d4c41', receita: true,
    descricao: 'Clonazepam, usado em distúrbios de ansiedade, crises epilépticas e distúrbios do equilíbrio.' },
  { id: 'astro', nome: 'Astro', preco: 55, cor: '#c0ca33', receita: true,
    descricao: 'Azitromicina, antibiótico para infecções respiratórias como sinusite, bronquite e faringite.' },
];

const TAXAS = [
  { ate: 5000, valor: 10 },
  { ate: 10000, valor: 15 },
  { ate: 15000, valor: 20 },
];

const moeda = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const $ = (id) => document.getElementById(id);

let carrinho = carregarCarrinho();
let entrega = null; // { distancia, taxa } ou { foraDaArea: true }

// ---------- Produtos ----------
function renderProdutos() {
  $('produtos').innerHTML = PRODUTOS.map((p) => `
    <article class="produto" data-nome="${p.nome.toLowerCase()}">
      <div class="embalagem" style="--cor:${p.cor}" aria-hidden="true">
        <span class="pilula">💊</span>
        <span class="embalagem-nome">${p.nome}</span>
      </div>
      <h3>${p.nome}</h3>
      ${p.receita ? '<span class="selo-receita">Venda sob prescrição</span>' : ''}
      <p>${p.descricao}</p>
      <div class="produto-rodape">
        <strong>${moeda(p.preco)}</strong>
        <button type="button" data-adicionar="${p.id}">Adicionar</button>
      </div>
    </article>`).join('');
}

$('produtos').addEventListener('click', (e) => {
  const id = e.target.dataset.adicionar;
  if (!id) return;
  alterarQuantidade(id, 1);
  e.target.textContent = 'Adicionado ✓';
  setTimeout(() => (e.target.textContent = 'Adicionar'), 1000);
});

$('filtro').addEventListener('input', (e) => {
  const termo = e.target.value.trim().toLowerCase();
  let visiveis = 0;
  document.querySelectorAll('.produto').forEach((card) => {
    const mostra = card.dataset.nome.includes(termo);
    card.hidden = !mostra;
    if (mostra) visiveis++;
  });
  $('sem-resultados').hidden = visiveis > 0;
});

// ---------- Carrinho ----------
function carregarCarrinho() {
  try {
    const salvo = JSON.parse(localStorage.getItem('farmaunix-carrinho'));
    return salvo && typeof salvo === 'object' ? salvo : {};
  } catch {
    return {};
  }
}

function salvarCarrinho() {
  try {
    localStorage.setItem('farmaunix-carrinho', JSON.stringify(carrinho));
  } catch { /* navegação privada: segue só em memória */ }
}

function alterarQuantidade(id, delta) {
  const nova = (carrinho[id] || 0) + delta;
  if (nova <= 0) delete carrinho[id];
  else carrinho[id] = nova;
  salvarCarrinho();
  renderCarrinho();
}

function itensDoCarrinho() {
  return Object.entries(carrinho)
    .map(([id, qtd]) => ({ ...PRODUTOS.find((p) => p.id === id), qtd }))
    .filter((item) => item.nome);
}

function subtotal() {
  return itensDoCarrinho().reduce((soma, item) => soma + item.preco * item.qtd, 0);
}

function renderCarrinho() {
  const itens = itensDoCarrinho();
  const quantidade = itens.reduce((s, i) => s + i.qtd, 0);

  $('contador').textContent = quantidade;
  $('carrinho-vazio').hidden = itens.length > 0;
  $('itens').innerHTML = itens.map((item) => `
    <li>
      <div>
        <strong>${item.nome}</strong>
        <span>${moeda(item.preco)} cada</span>
      </div>
      <div class="quantidade">
        <button type="button" data-delta="-1" data-id="${item.id}" aria-label="Diminuir ${item.nome}">−</button>
        <span>${item.qtd}</span>
        <button type="button" data-delta="1" data-id="${item.id}" aria-label="Aumentar ${item.nome}">+</button>
      </div>
      <strong class="preco-item">${moeda(item.preco * item.qtd)}</strong>
    </li>`).join('');

  const sub = subtotal();
  $('subtotal').textContent = moeda(sub);

  if (!entrega) {
    $('taxa').textContent = 'calcule acima';
    $('total').textContent = moeda(sub);
  } else if (entrega.foraDaArea) {
    $('taxa').textContent = 'fora da área';
    $('total').textContent = moeda(sub);
  } else {
    $('taxa').textContent = moeda(entrega.taxa);
    $('total').textContent = moeda(sub + entrega.taxa);
  }

  $('finalizar').disabled = !itens.length || !entrega || entrega.foraDaArea;
}

$('itens').addEventListener('click', (e) => {
  const { id, delta } = e.target.dataset;
  if (id) alterarQuantidade(id, Number(delta));
});

$('limpar').addEventListener('click', () => {
  carrinho = {};
  salvarCarrinho();
  renderCarrinho();
});

function abrirCarrinho(abrir) {
  $('carrinho').classList.toggle('aberto', abrir);
  $('carrinho').setAttribute('aria-hidden', String(!abrir));
  $('abrir-carrinho').setAttribute('aria-expanded', String(abrir));
  $('fundo').hidden = !abrir;
  if (abrir) $('fechar-carrinho').focus();
}

$('abrir-carrinho').addEventListener('click', () => abrirCarrinho(true));
$('fechar-carrinho').addEventListener('click', () => abrirCarrinho(false));
$('fundo').addEventListener('click', () => abrirCarrinho(false));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') abrirCarrinho(false);
});

// ---------- Entrega (OpenStreetMap + OSRM, sem chave de API) ----------
let mapa;
let camadaRota;

function calcularTaxa(distancia) {
  const faixa = TAXAS.find((t) => distancia <= t.ate);
  return faixa ? faixa.valor : null;
}

async function geocodificar(endereco) {
  // "Rua, número" sem cidade: assume a cidade da loja
  const consulta = endereco.split(',').length >= 3 ? endereco : `${endereco}, ${CIDADE_PADRAO}`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(consulta)}`;
  const resposta = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } });
  if (!resposta.ok) throw new Error('servico');
  const [lugar] = await resposta.json();
  if (!lugar) throw new Error('nao-encontrado');
  return [Number(lugar.lat), Number(lugar.lon)];
}

async function rota(origem, destino) {
  const pontos = `${origem[1]},${origem[0]};${destino[1]},${destino[0]}`;
  const resposta = await fetch(`https://router.project-osrm.org/route/v1/driving/${pontos}?overview=full&geometries=geojson`);
  const dados = await resposta.json();
  if (dados.code !== 'Ok' || !dados.routes?.length) throw new Error('sem-rota');
  return dados.routes[0];
}

function desenharMapa(rotaCalculada, origem, destino) {
  $('mapa').hidden = false;
  if (!window.L) return;

  if (!mapa) {
    mapa = L.map('mapa', { zoomControl: false, attributionControl: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(mapa);
  }
  if (camadaRota) camadaRota.remove();

  camadaRota = L.layerGroup([
    L.geoJSON(rotaCalculada.geometry, { style: { color: '#e30613', weight: 5 } }),
    L.circleMarker(origem, { radius: 7, color: '#e30613', fillOpacity: 1 }).bindTooltip('Farma Unix'),
    L.circleMarker(destino, { radius: 7, color: '#1f2933', fillOpacity: 1 }).bindTooltip('Você'),
  ]).addTo(mapa);

  mapa.invalidateSize();
  mapa.fitBounds(L.geoJSON(rotaCalculada.geometry).getBounds(), { padding: [20, 20] });
}

async function calcularEntrega() {
  const endereco = $('endereco').value.trim();
  const info = $('info-entrega');

  if (!endereco) {
    info.textContent = 'Digite seu endereço para calcular a entrega.';
    return;
  }

  info.textContent = 'Calculando...';
  $('calcular').disabled = true;

  try {
    const destino = await geocodificar(endereco);
    const rotaCalculada = await rota(COORDENADAS_LOJA, destino);

    const distancia = rotaCalculada.distance;
    const taxa = calcularTaxa(distancia);
    const km = (distancia / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 });

    entrega = taxa === null ? { foraDaArea: true, distancia } : { distancia, taxa };
    info.textContent = taxa === null
      ? `Distância: ${km} km. Infelizmente não entregamos acima de 15 km.`
      : `Distância: ${km} km. Taxa de entrega: ${moeda(taxa)}.`;

    desenharMapa(rotaCalculada, COORDENADAS_LOJA, destino);
  } catch (erro) {
    entrega = null;
    info.textContent = erro.message === 'nao-encontrado'
      ? 'Endereço não encontrado. Inclua rua, número e cidade.'
      : 'Não foi possível calcular a entrega agora. Tente novamente em instantes.';
  } finally {
    $('calcular').disabled = false;
    renderCarrinho();
  }
}

$('calcular').addEventListener('click', calcularEntrega);
$('endereco').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') calcularEntrega();
});
$('endereco').addEventListener('input', () => {
  if (entrega) {
    entrega = null;
    renderCarrinho();
  }
});

// ---------- Pedido ----------
$('finalizar').addEventListener('click', () => {
  const linhas = itensDoCarrinho().map((i) => `• ${i.qtd}x ${i.nome} - ${moeda(i.preco * i.qtd)}`);
  const mensagem = [
    'Olá, gostaria de fazer um pedido:',
    '',
    ...linhas,
    '',
    `Subtotal: ${moeda(subtotal())}`,
    `Entrega: ${moeda(entrega.taxa)}`,
    `Total: ${moeda(subtotal() + entrega.taxa)}`,
    '',
    `Endereço: ${$('endereco').value.trim()}`,
  ].join('\n');

  window.open(`https://wa.me/55${WHATSAPP}?text=${encodeURIComponent(mensagem)}`, '_blank', 'noopener');
});

$('endereco-loja').textContent = ENDERECO_LOJA;
renderProdutos();
renderCarrinho();
