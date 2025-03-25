document.getElementById('searchBtn').addEventListener('click', () => {
    const query = document.getElementById('searchInput').value;
    searchContent(query);
});

document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = document.getElementById('searchInput').value;
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
        console.log(data);  // Inspeciona os dados retornados
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

            // Aqui, estamos incluindo o parâmetro `collection` na URL para o link
            card.innerHTML = `
                <img src="${coverImage}" alt="${title}">
                <h3>${title}</h3>
                <a href="detalhes.html?id=${item._id}&collection=${collection}">Assistir</a> <!-- Passando o ID e a collection -->
            `;
            contentDiv.appendChild(card);
        });
    }
}
