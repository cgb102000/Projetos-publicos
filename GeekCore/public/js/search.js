document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');

  if (query) {
    searchContent(query);
  } else {
    document.getElementById('content').innerHTML = '<p>Nenhum termo de busca fornecido.</p>';
  }

  // Aguarda o carregamento do header antes de adicionar eventos
  const checkHeaderInterval = setInterval(() => {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    if (searchBtn && searchInput) {
      clearInterval(checkHeaderInterval);

      searchBtn.addEventListener('click', () => {
        const query = searchInput.value;
        if (query) {
          window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        }
      });

      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const query = searchInput.value;
          if (query) {
            window.location.href = `search.html?q=${encodeURIComponent(query)}`;
          }
        }
      });
    }
  }, 100); // Verifica a cada 100ms
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
      displayResults(data);
    })
    .catch(error => {
      console.error('Erro:', error);
      document.getElementById('content').innerHTML = '<p style="color: red; font-weight: bold;">Houve um erro ao buscar os dados. Tente novamente mais tarde.</p>';
    });
}

function displayResults(data) {
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = ''; // Limpar resultados anteriores

  if (!Array.isArray(data) || data.length === 0) {
    contentDiv.innerHTML = '<p style="color: red; font-weight: bold;">Nenhum resultado encontrado.</p>';
    return;
  }

  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';

    const title = item.titulo || 'Título não disponível';
    const coverImage = item.img_url || 'https://via.placeholder.com/150';
    const collection = item.collection || 'animes';

    card.innerHTML = `
      <img src="${coverImage}" alt="${title}">
      <h3>${title}</h3>
      <a href="detalhes.html?id=${item._id}&collection=${collection}">Assistir</a>
    `;
    contentDiv.appendChild(card);
  });
}
