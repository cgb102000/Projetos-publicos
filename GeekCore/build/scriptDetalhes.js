document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const itemId = params.get('id');
  const collection = params.get('collection');

  if (itemId && collection) {
    fetchItemDetails(collection, itemId);
  } else {
    document.getElementById('details').innerHTML = '<p>Item ou coleção não fornecidos na URL.</p>';
  }
});

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
      fetchRandomItems(collection);
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
  return fetch(`http://localhost:3000/api/random/${collection}?limit=12`)
    .then(response => response.json())
    .then(data => {
      const carousel = document.getElementById('carousel');
      carousel.innerHTML = '';

      if (data.length > 0) {
        data.forEach(item => {
          const card = document.createElement('div');
          card.className = 'card';
          const coverImage = item.img_url || 'https://via.placeholder.com/150';

          card.innerHTML = `
            <img src="${coverImage}" alt="Capa">
            <a href="detalhes.html?id=${item._id}&collection=${collection}">
              <span>Assistir</span>
            </a>
          `;
          carousel.appendChild(card);
        });
      }
    })
    .catch(error => console.error('Erro ao carregar sugestões:', error));
}

function initSwiper() {
  const progressCircle = document.querySelector(".autoplay-progress svg");
  const progressContent = document.querySelector(".autoplay-progress span");

  const swiperEl = document.querySelector("swiper-container");
  swiperEl.addEventListener("autoplaytimeleft", (e) => {
    const [swiper, time, progress] = e.detail;
    progressCircle.style.setProperty("--progress", 1 - progress);
    progressContent.textContent = `${Math.ceil(time / 1000)}s`;
  });
}
