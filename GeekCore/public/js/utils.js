// Função para validar URLs
window.utils = {
  isValidUrl(url) {
    try {
      const regex = /^(https?:\/\/)/;
      return regex.test(url);
    } catch {
      return false;
    }
  },

  getUrlParams() {
    return new URLSearchParams(window.location.search);
  },

  handleImageError(img) {
    img.onerror = null;
    img.src = '/images/placeholder.jpg';
  },

  formatTitle(title, maxLength = 50) {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  },

  createCard(item) {
    const card = document.createElement('div');
    card.className = 'card';
    const coverImage = item.img_url || '/images/placeholder.jpg';
    const collection = item.collection || 'animes';
    const title = window.utils.formatTitle(item.titulo || 'Sem título');

    card.innerHTML = `
      <img src="${coverImage}" alt="${title}" onerror="window.utils.handleImageError(this)">
      <a href="/detalhes.html?id=${item._id}&collection=${collection}" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 opacity-0 hover:opacity-100 transition-opacity">
        <span class="bg-primary text-white px-4 py-2 rounded hover:bg-hover transition-transform transform hover:scale-110">
          Assistir
        </span>
      </a>
    `;
    return card;
  }
};
