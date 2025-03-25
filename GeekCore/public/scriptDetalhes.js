const params = new URLSearchParams(window.location.search);
const itemId = params.get('id');
const collection = params.get('collection');

function fetchItemDetails(collection, id) {
  if (!collection || !id) {
    document.getElementById('details').innerHTML = '<p>Item ou coleção não fornecidos na URL.</p>';
    return;
  }

  const url = `http://localhost:3000/api/item/${collection}/${id}`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        console.error(`Erro ao carregar detalhes: ${response.status}`);
        throw new Error('Erro ao carregar os detalhes');
      }
      return response.json();
    })
    .then(data => {
      document.getElementById('title').textContent = data.titulo || 'Título não disponível';
      const imageUrl = data.img_url && isValidUrl(data.img_url) ? data.img_url : 'https://via.placeholder.com/150';
      document.getElementById('image').src = imageUrl;
      document.getElementById('description').textContent = data.descricao || 'Descrição não disponível';

      const categoryElement = document.getElementById('category');
      if (data.categoria) {
        categoryElement.textContent = `Categoria: ${data.categoria}`;
      } else {
        categoryElement.style.display = 'none';
      }

      const downloadLink = document.getElementById('downloadLink');
      let downloadUrl = data.link;
      if (downloadUrl && !downloadUrl.startsWith('http://') && !downloadUrl.startsWith('https://')) {
        downloadUrl = 'http://' + downloadUrl;
      }

      if (isValidUrl(downloadUrl)) {
        downloadLink.href = downloadUrl;
      } else {
        downloadLink.href = '#';
        downloadLink.textContent = 'Link não disponível';
      }

      // Carregar sugestões (até 100 itens, por exemplo)
      fetchRandomItems(collection).then(() => setupCarousel());
    })
    .catch(() => {
      document.getElementById('details').innerHTML = '<p>Não foi possível carregar os detalhes do item.</p>';
    });
}

function isValidUrl(url) {
  try {
    const regex = /^(https?:\/\/)/;
    return regex.test(url);
  } catch {
    return false;
  }
}

function fetchRandomItems(collection) {
  return fetch(`http://localhost:3000/api/random/${collection}?limit=100`) // Ajustado para buscar até 100 itens
    .then(response => response.json())
    .then(data => {
      const carouselContainer = document.getElementById('carousel');
      carouselContainer.innerHTML = ''; // Limpa os itens anteriores

      if (data.length > 0) {
        // Criar os cards para cada item
        data.forEach(item => {
          const card = document.createElement('div');
          card.className = 'card';
          const title = item.titulo || 'Título não disponível';
          const coverImage = item.img_url || 'https://via.placeholder.com/150';

          // Estrutura original do card
          card.innerHTML = `
            <img src="${coverImage}" alt="${title}">
            <h3>${title}</h3>
            <a href="detalhes.html?id=${item._id}&collection=${collection}">Assistir</a>
          `;
          carouselContainer.appendChild(card);
        });
      } else {
        const noItemsMessage = document.createElement('p');
        noItemsMessage.textContent = 'Nenhum item disponível para exibição.';
        carouselContainer.appendChild(noItemsMessage);
      }
    })
    .catch(error => console.error('Erro ao carregar sugestões:', error));
}

function setupCarousel() {
  const carousel = document.querySelector('.carousel');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  let scrollPosition = 0;

  const updateButtons = () => {
    const cardWidth = carousel.querySelector('.card').offsetWidth + 20; // Largura do card + margem
    const maxScroll = carousel.scrollWidth - carousel.offsetWidth;

    prevBtn.disabled = scrollPosition === 0;
    nextBtn.disabled = scrollPosition >= maxScroll;
  };

  prevBtn.addEventListener('click', () => {
    const cardWidth = carousel.querySelector('.card').offsetWidth + 20;
    scrollPosition = Math.max(scrollPosition - cardWidth, 0);
    carousel.style.transform = `translateX(-${scrollPosition}px)`;
    updateButtons();
  });

  nextBtn.addEventListener('click', () => {
    const cardWidth = carousel.querySelector('.card').offsetWidth + 20;
    const maxScroll = carousel.scrollWidth - carousel.offsetWidth;
    scrollPosition = Math.min(scrollPosition + cardWidth, maxScroll);
    carousel.style.transform = `translateX(-${scrollPosition}px)`;
    updateButtons();
  });

  updateButtons();
}

if (itemId && collection) {
  fetchItemDetails(collection, itemId);
} else {
  console.error('Parâmetros inválidos na URL: id ou collection ausentes.');
  document.getElementById('details').innerHTML = '<p>Item ou coleção não fornecidos na URL.</p>';
}

// Adiciona funcionalidade ao botão de busca, se os elementos existirem
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');

if (searchBtn && searchInput) {
  searchBtn.addEventListener('click', () => {
    const query = searchInput.value;
    if (query) {
      window.location.href = `index.html?q=${encodeURIComponent(query)}`;
    }
  });

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value;
      if (query) {
        window.location.href = `index.html?q=${encodeURIComponent(query)}`;
      }
    }
  });
} else {
  console.warn('Elementos de busca não encontrados na página.');
}
