
document.getElementById('searchForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const pokemonName = document.getElementById('pokemonName').value.toLowerCase();

  try {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    const pokemon = response.data;

    // Capitaliza a primeira letra do nome do Pokémon
    const capitalizedPokemonName = capitalizeFirstLetter(pokemon.name);

    const pokemonCards = document.getElementById('pokemonCards');
    const cardTemplate = `
      <div class="card mb-3" style="max-width: 25em;">
        <div class="row g-0">
          <div class="col-md-4">
            <img src="${pokemon.sprites.front_default}" class="img-fluid rounded-start" alt="${pokemon.name}">
          </div>
          <div class="col-md-8">
            <div class="card-body">
              <h5 class="card-title">${capitalizedPokemonName}</h5>
              <p class="card-text">Altura: ${pokemon.height}</p>
              <p class="card-text">Peso: ${pokemon.weight}</p>
              <p class="card-text">Tipo: ${pokemon.types.map(type => `<i class="fas fa-${getIconForType(type.type.name)} ${getTypeClass(type.type.name)}"></i> ${type.type.name}`).join(', ')}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    pokemonCards.innerHTML = cardTemplate;
  } catch (error) {
    console.error('Error fetching Pokémon:', error);
  }
});

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getIconForType(type) {
  // Mapeie cada tipo de Pokémon a um ícone correspondente do Font Awesome
  switch (type) {
    case 'electric':
      return 'bolt';
    case 'normal':
      return 'circle';
    case 'water':
      return 'tint';
    case 'fire':
      return 'fire';
    // Adicione mais casos conforme necessário
    default:
      return 'question-circle'; // Ícone padrão
  }
}

function getTypeClass(type) {
  // Mapeie cada tipo de Pokémon a uma classe de cor
  switch (type) {
    case 'electric':
      return 'text-warning'; // Amarelo
    case 'normal':
      return 'text-secondary'; // Cinza
    case 'water':
      return 'text-primary'; // Azul
    case 'fire':
      return 'text-danger'; // Vermelho
    // Adicione mais casos para outros tipos, se necessário
    default:
      return 'text-dark'; // Cor padrão
  }
}
