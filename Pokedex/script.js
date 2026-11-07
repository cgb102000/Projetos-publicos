const API = 'https://pokeapi.co/api/v2/pokemon/';
const TOTAL_POKEMON = 1025;

const form = document.getElementById('searchForm');
const input = document.getElementById('pokemonName');
const randomButton = document.getElementById('random');
const status = document.getElementById('status');
const card = document.getElementById('pokemonCard');

const TIPOS = {
  normal: { nome: 'Normal', cor: '#9fa19f' },
  fire: { nome: 'Fogo', cor: '#e62829' },
  water: { nome: 'Água', cor: '#2980ef' },
  electric: { nome: 'Elétrico', cor: '#d4a800' },
  grass: { nome: 'Planta', cor: '#3fa129' },
  ice: { nome: 'Gelo', cor: '#3dcef3' },
  fighting: { nome: 'Lutador', cor: '#ff8000' },
  poison: { nome: 'Venenoso', cor: '#9141cb' },
  ground: { nome: 'Terrestre', cor: '#915121' },
  flying: { nome: 'Voador', cor: '#81b9ef' },
  psychic: { nome: 'Psíquico', cor: '#ef4179' },
  bug: { nome: 'Inseto', cor: '#91a119' },
  rock: { nome: 'Pedra', cor: '#afa981' },
  ghost: { nome: 'Fantasma', cor: '#704170' },
  dragon: { nome: 'Dragão', cor: '#5060e1' },
  dark: { nome: 'Sombrio', cor: '#624d4e' },
  steel: { nome: 'Aço', cor: '#60a1b8' },
  fairy: { nome: 'Fada', cor: '#ef70ef' },
};

const STATS = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'Ataque esp.',
  'special-defense': 'Defesa esp.',
  speed: 'Velocidade',
};

form.addEventListener('submit', (event) => {
  event.preventDefault();
  buscar(input.value);
});

randomButton.addEventListener('click', () => {
  const numero = Math.floor(Math.random() * TOTAL_POKEMON) + 1;
  input.value = numero;
  buscar(numero);
});

async function buscar(valor) {
  const termo = String(valor).trim().toLowerCase().replace(/\s+/g, '-').replace(/^#/, '');
  if (!termo) return;

  status.textContent = 'Buscando...';
  status.classList.remove('erro');
  form.querySelectorAll('button').forEach((b) => (b.disabled = true));

  try {
    const resposta = await fetch(API + encodeURIComponent(termo));
    if (resposta.status === 404) throw new Error(`Nenhum Pokémon encontrado para "${valor}".`);
    if (!resposta.ok) throw new Error('A PokéAPI não respondeu. Tente novamente em instantes.');

    const pokemon = await resposta.json();
    mostrarPokemon(pokemon);
    status.textContent = '';
  } catch (erro) {
    card.innerHTML = '';
    status.textContent = erro instanceof TypeError
      ? 'Sem conexão com a PokéAPI. Verifique sua internet.'
      : erro.message;
    status.classList.add('erro');
  } finally {
    form.querySelectorAll('button').forEach((b) => (b.disabled = false));
  }
}

function capitalizar(texto) {
  return texto.split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

function mostrarPokemon(pokemon) {
  const imagem = pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default;
  const tipoPrincipal = TIPOS[pokemon.types[0].type.name] || { cor: '#777' };

  const tipos = pokemon.types.map(({ type }) => {
    const tipo = TIPOS[type.name] || { nome: capitalizar(type.name), cor: '#777' };
    return `<li style="background:${tipo.cor}">${tipo.nome}</li>`;
  }).join('');

  const stats = pokemon.stats.map(({ base_stat, stat }) => `
    <li>
      <span>${STATS[stat.name] || stat.name}</span>
      <strong>${base_stat}</strong>
      <div class="barra"><div style="width:${Math.min(100, (base_stat / 180) * 100)}%"></div></div>
    </li>`).join('');

  card.innerHTML = `
    <article class="card" style="--cor-tipo:${tipoPrincipal.cor}">
      <div class="card-imagem">
        ${imagem ? `<img src="${imagem}" alt="${capitalizar(pokemon.name)}" width="240" height="240">` : ''}
      </div>
      <div class="card-corpo">
        <p class="numero">#${String(pokemon.id).padStart(4, '0')}</p>
        <h2>${capitalizar(pokemon.name)}</h2>
        <ul class="tipos">${tipos}</ul>
        <dl class="medidas">
          <div><dt>Altura</dt><dd>${(pokemon.height / 10).toLocaleString('pt-BR')} m</dd></div>
          <div><dt>Peso</dt><dd>${(pokemon.weight / 10).toLocaleString('pt-BR')} kg</dd></div>
        </dl>
        <ul class="stats">${stats}</ul>
      </div>
    </article>`;
}
