const API_BASE_URL = 'http://localhost:3001';

document.addEventListener('DOMContentLoaded', () => {
  const headerContainer = document.getElementById('header-container');
  if (!headerContainer) return;

  fetch('/components/header.html')
    .then(response => response.text())
    .then(data => {
      headerContainer.innerHTML = data;
      setupSearch();
    })
    .catch(err => console.error('Erro ao carregar o header:', err));
});

function setupSearch() {
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');

  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') performSearch();
    });
  }
}

function performSearch() {
  const searchInput = document.getElementById('searchInput');
  const query = searchInput.value.trim();
  if (query) {
    window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
  }
}

function loadCategories() {
  fetch(`${API_BASE_URL}/api/categories`)
    .then(response => response.json())
    .then(categories => {
      const dropdown = document.getElementById('categoriesDropdown');
      if (dropdown && categories.length > 0) {
        const categoryLinks = categories.map(category => 
          `<li><a href="search.html?category=${encodeURIComponent(category)}">${category}</a></li>`
        ).join('');
        dropdown.innerHTML = categoryLinks;
      }
    })
    .catch(err => console.error('Erro ao carregar categorias:', err));
}

function setupDropdownBehavior() {
  const dropdown = document.querySelector('.dropdown');
  if (dropdown) {
    const menu = dropdown.querySelector('.dropdown-menu');
    dropdown.addEventListener('mouseenter', () => {
      menu.style.display = 'block';
    });
    dropdown.addEventListener('mouseleave', () => {
      menu.style.display = 'none';
    });
  }
}
