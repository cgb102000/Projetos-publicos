// Realiza a busca automaticamente se o parâmetro 'q' estiver presente na URL
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');
  if (query) {
    searchContent(query);
  }
});

function searchContent(query) {
  fetch(`http://localhost:3000/api/search?q=${query}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro na resposta da API');
      }
      return response.json();
    })
    .then(data => {
      console.log(data); // Inspeciona os dados retornados
      displayResults(data);
    })
    .catch(error => {
      console.error('Erro:', error);
      const contentDiv = document.getElementById('content');
      contentDiv.innerHTML = '<p style="color: red; font-weight: bold;">Houve um erro ao buscar os dados. Tente novamente mais tarde.</p>';
    });
}

function displayResults(data) {
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = ''; // Limpar resultados anteriores
  
  // Verifica se data é um array antes de usar forEach
  if (!Array.isArray(data)) {
    contentDiv.innerHTML = '<p style="color: red; font-weight: bold;">Houve um erro ao processar os dados. Tente novamente.</p>';
    return;
  }

  if (data.length === 0) {
    contentDiv.innerHTML = '<p style="color: red; font-weight: bold;">Infelizmente, não encontramos nada. Tente digitar novamente e verifique os dados.</p>';
  } else {
    data.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';

      // Verificação para garantir que os campos existam
      const title = item.titulo || 'Título não disponível';
      const coverImage = item.img_url || 'https://via.placeholder.com/150';  // URL de fallback
      const collection = item.collection || 'animes';  // Adiciona o valor de collection aqui

      // Estrutura original do card
      card.innerHTML = `
        <img src="${coverImage}" alt="${title}">
        <h3>${title}</h3>
        <a href="detalhes.html?id=${item._id}&collection=${collection}">Assistir</a>
      `;
      contentDiv.appendChild(card);
    });
  }
}

// Carregar categorias dinamicamente
function loadCategories() {
  fetch('http://localhost:3000/api/categories')
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao carregar categorias');
      }
      return response.json();
    })
    .then(categories => {
      const dropdown = document.getElementById('categoriesDropdown');
      if (dropdown) {
        dropdown.innerHTML = categories.map(category => `<li><a href="index.html?category=${category}">${category}</a></li>`).join('');
      } else {
        console.warn('Dropdown de categorias não encontrado.');
      }
    })
    .catch(err => console.error('Erro ao carregar categorias:', err));
}

// Carregar itens recentes dinamicamente
function loadRecentItems() {
  fetch('http://localhost:3000/api/recent')
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao carregar itens recentes');
      }
      return response.json();
    })
    .then(items => {
      const recentItemsDiv = document.getElementById('recentItems');
      if (recentItemsDiv) {
        recentItemsDiv.innerHTML = items.map(item => `
          <div class="card">
            <img src="${item.img_url || 'https://via.placeholder.com/150'}" alt="${item.titulo}">
            <h3>${item.titulo}</h3>
            <a href="detalhes.html?id=${item._id}&collection=${item.collection}">Assistir</a>
          </div>
        `).join('');
      } else {
        console.warn('Div de itens recentes não encontrada.');
      }
    })
    .catch(err => console.error('Erro ao carregar itens recentes:', err));
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
  loadCategories();
  loadRecentItems();
  loadBanner();
});
