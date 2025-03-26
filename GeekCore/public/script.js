async function fetchAPI(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Erro ao acessar ${endpoint}:`, error);
    throw error;
  }
}

// Realiza a busca automaticamente se o parâmetro 'q' estiver presente na URL
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');
  if (query) {
    searchContent(query);
  }
});

async function searchContent(query) {
  try {
    const data = await fetchAPI(`/api/search?q=${query}`);
    console.log(data); // Inspeciona os dados retornados
    displayResults(data);
  } catch (error) {
    console.error('Erro:', error);
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '<p style="color: red; font-weight: bold;">Houve um erro ao buscar os dados. Tente novamente mais tarde.</p>';
  }
}

function displayResults(data) {
  const contentDiv = document.getElementById('recentItems');
  if (!contentDiv) return;
  
  contentDiv.innerHTML = '';

  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    const coverImage = item.img_url || '/images/placeholder.jpg';
    const collection = item.collection || 'animes';
    
    card.innerHTML = `
      <img src="${coverImage}" alt="${item.titulo}" class="absolute inset-0 w-full h-full object-cover">
      <a href="/detalhes.html?id=${item._id}&collection=${collection}" 
         class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 opacity-0 hover:opacity-100 transition-all duration-300">
        <span class="transform hover:scale-110 transition-transform duration-300 bg-primary hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl flex items-center space-x-2">
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

// Atualizar funções existentes
async function loadRecentItems() {
  try {
    const items = await fetchAPI('/api/recent');
    const recentItemsDiv = document.getElementById('recentItems');
    if (recentItemsDiv) {
      recentItemsDiv.innerHTML = items.map(item => `
        <div class="card">
          <img src="${item.img_url || 'https://via.placeholder.com/150'}" alt="${item.titulo}" class="absolute inset-0 w-full h-full object-cover">
          <a href="detalhes.html?id=${item._id}&collection=${item.collection}" 
             class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 opacity-0 hover:opacity-100 transition-all duration-300">
            <span class="watch-button">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Assistir</span>
            </span>
          </a>
        </div>
      `).join('');
    }
  } catch (error) {
    console.warn('Erro ao carregar itens recentes:', error);
  }
}

// Carregar banner dinamicamente
function loadBanner() {
  const banner = document.getElementById('banner');
  if (banner) {
    banner.style.backgroundImage = "url('images/banner.jpg')";
  }
}

// Inicializar funções
document.addEventListener('DOMContentLoaded', () => {
  loadRecentItems();
  loadBanner();
});
