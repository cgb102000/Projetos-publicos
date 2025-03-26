function fetchRandomItems(collection) {
  return fetch(`http://localhost:3000/api/random/${collection}?limit=12`)
    .then(response => response.json())
    .then(data => {
      const carousel = document.getElementById('carousel');
      carousel.innerHTML = '';

      if (data.length > 0) {
        data.forEach(item => {
          const card = document.createElement('div');
          card.className = 'snap-start flex-shrink-0 w-48 bg-card-bg rounded-lg overflow-hidden shadow-md';
          const coverImage = item.img_url || 'https://via.placeholder.com/150';

          card.innerHTML = `
            <img src="${coverImage}" alt="Capa" class="w-full h-64 object-cover">
            <div class="p-4">
              <a href="detalhes.html?id=${item._id}&collection=${collection}" 
                 class="block bg-primary-color text-center text-white py-2 rounded hover:bg-hover-color transition">
                Assistir
              </a>
            </div>
          `;
          carousel.appendChild(card);
        });
      }
    })
    .catch(error => console.error('Erro ao carregar sugestões:', error));
}

function loadCategories() {
  console.warn('Dropdown de categorias removido.');
}