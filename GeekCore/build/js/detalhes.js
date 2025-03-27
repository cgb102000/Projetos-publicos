document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const itemId = params.get('id');
  const collection = params.get('collection');

  if (itemId && collection) {
    fetchItemDetails(collection, itemId);
  }
});

function fetchItemDetails(collection, id) {
  fetch(`${APP_CONFIG.API_BASE_URL}/api/item/${collection}/${id}`)
    .then(response => {
      if (!response.ok) throw new Error('Erro ao carregar os detalhes');
      return response.json();
    })
    .then(data => {
      document.getElementById('title').textContent = data.titulo || 'Título não disponível';
      const imageUrl = data.img_url || APP_CONFIG.PLACEHOLDER_IMAGE;
      const image = document.getElementById('image');
      image.src = imageUrl;
      image.onerror = () => { image.src = APP_CONFIG.PLACEHOLDER_IMAGE; };
      
      document.getElementById('description').textContent = data.descricao || 'Descrição não disponível';
      
      const categoryElement = document.getElementById('category');
      categoryElement.textContent = data.categoria ? `Categoria: ${data.categoria}` : '';
      categoryElement.style.display = data.categoria ? 'block' : 'none';

      const downloadLink = document.getElementById('downloadLink');
      downloadLink.href = data.url || '#';
      downloadLink.textContent = data.url ? 'Assistir Agora' : 'Indisponível';

      fetchRecommendations(collection);
    })
    .catch(error => {
      console.error('Erro:', error);
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.innerHTML = `
          <div class="container mx-auto px-4 pt-24">
            <p class="text-red-500 text-center text-xl">Erro ao carregar detalhes. Tente novamente mais tarde.</p>
          </div>
        `;
      }
    });
}

function fetchRecommendations(collection) {
  const carouselTrack = document.querySelector('.carousel-track');
  if (!carouselTrack) return;

  fetch(`${APP_CONFIG.API_BASE_URL}/api/random/${collection}?limit=12`)
    .then(response => response.json())
    .then(data => {
      carouselTrack.innerHTML = '';

      data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        const imageUrl = item.img_url || APP_CONFIG.PLACEHOLDER_IMAGE;

        card.innerHTML = `
          <img src="${imageUrl}" alt="${item.titulo}" onerror="this.src='${APP_CONFIG.PLACEHOLDER_IMAGE}'">
          <a href="detalhes.html?id=${item._id}&collection=${collection}">
            <span class="bg-primary hover:bg-hover text-white px-4 py-2 rounded transition-colors">
              Assistir
            </span>
          </a>
        `;
        carouselTrack.appendChild(card);
      });

      initializeCarousel();
    })
    .catch(error => console.error('Erro ao carregar recomendações:', error));
}

function initializeCarousel() {
  const container = document.querySelector('.carousel-container');
  const track = document.querySelector('.carousel-track');
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  
  if (!container || !track || !prevBtn || !nextBtn) return;

  let scrollAmount = 0;
  const cardWidth = 220; // Largura do card + gap

  prevBtn.addEventListener('click', () => {
    scrollAmount = Math.max(scrollAmount - cardWidth * 4, 0);
    track.style.transform = `translateX(-${scrollAmount}px)`;
    updateButtons();
  });

  nextBtn.addEventListener('click', () => {
    const maxScroll = track.scrollWidth - container.clientWidth;
    scrollAmount = Math.min(scrollAmount + cardWidth * 4, maxScroll);
    track.style.transform = `translateX(-${scrollAmount}px)`;
    updateButtons();
  });

  function updateButtons() {
    prevBtn.style.display = scrollAmount <= 0 ? 'none' : 'flex';
    nextBtn.style.display = scrollAmount >= track.scrollWidth - container.clientWidth ? 'none' : 'flex';
  }

  // Inicializa o estado dos botões
  updateButtons();
}
