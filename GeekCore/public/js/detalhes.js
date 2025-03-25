import { isValidUrl, getUrlParams } from './utils.js';

const params = getUrlParams();
const itemId = params.get('id');
const collection = params.get('collection');

if (itemId && collection) {
  fetchItemDetails(collection, itemId);
} else {
  document.getElementById('details').innerHTML = '<p>Item ou coleção não fornecidos na URL.</p>';
}

function fetchItemDetails(collection, id) {
  const url = `http://localhost:3000/api/item/${collection}/${id}`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
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

      fetchRandomItems(collection);
    })
    .catch(() => {
      document.getElementById('details').innerHTML = '<p>Não foi possível carregar os detalhes do item.</p>';
    });
}

function fetchRandomItems(collection) {
  fetch(`http://localhost:3000/api/random/${collection}?limit=100`)
    .then(response => response.json())
    .then(data => {
      const carouselContainer = document.getElementById('carousel');
      carouselContainer.innerHTML = '';

      if (data.length > 0) {
        data.forEach(item => {
          const card = document.createElement('div');
          card.className = 'card';
          const title = item.titulo || 'Título não disponível';
          const coverImage = item.img_url || 'https://via.placeholder.com/150';

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
