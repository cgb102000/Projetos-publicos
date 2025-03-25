document.addEventListener('DOMContentLoaded', () => {
  const headerContainer = document.createElement('div');
  headerContainer.id = 'header-container';
  document.body.prepend(headerContainer);

  fetch('components/header.html')
    .then(response => response.text())
    .then(data => {
      headerContainer.innerHTML = data;

      // Adiciona funcionalidade ao botão de busca
      const searchBtn = document.getElementById('searchBtn');
      const searchInput = document.getElementById('searchInput');

      if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
          const query = searchInput.value;
          if (query) {
            window.location.href = `search.html?q=${encodeURIComponent(query)}`;
          }
        });

        // Permite buscar ao pressionar Enter
        searchInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            const query = searchInput.value;
            if (query) {
              window.location.href = `search.html?q=${encodeURIComponent(query)}`;
            }
          }
        });
      }
    })
    .catch(err => console.error('Erro ao carregar o header:', err));
});
