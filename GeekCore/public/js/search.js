document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');
  
  if (query) {
    const resultsTitle = document.getElementById('results-title');
    if (resultsTitle) {
      resultsTitle.textContent = `Resultados para: ${query}`;
    }
    searchContent(query);
  }
});

async function searchContent(query) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Erro na resposta da API');
    const data = await response.json();
    displayResults(data);
  } catch (error) {
    console.error('Erro:', error);
    const contentDiv = document.getElementById('content');
    if (contentDiv) {
      contentDiv.innerHTML = '<p class="text-red-500 font-bold">Erro ao buscar dados. Tente novamente.</p>';
    }
  }
}

function displayResults(data) {
  const contentDiv = document.getElementById('content');
  if (!contentDiv) return;
  
  contentDiv.innerHTML = '';

  if (!Array.isArray(data) || data.length === 0) {
    contentDiv.innerHTML = '<p class="text-center text-gray-400 mt-8">Nenhum resultado encontrado.</p>';
    return;
  }

  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    const coverImage = item.img_url || '/images/placeholder.jpg';
    const collection = item.collection || 'animes';

    card.innerHTML = `
      <img src="${coverImage}" alt="${item.titulo}" class="absolute inset-0 w-full h-full object-cover">
      <a href="detalhes.html?id=${item._id}&collection=${collection}" 
         class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 opacity-0 hover:opacity-100 transition-all duration-300">
        <span class="watch-button">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>Assistir</span>
        </span>
      </a>
    `;
    contentDiv.appendChild(card);
  });
}
