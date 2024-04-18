// Importando funções de outros módulos
import getToken from './src/auth.js';
import fetchSpotifyData from './src/spotify.js';

// Função para criar card para os resultados
const createCard = (imageUrl, title, text, linkUrl, linkText) => `
    <div class="col-md-4 mb-4">
        <div class="card">
            <img src="${imageUrl}" class="card-img-top" alt="${title}">
            <div class="card-body">
                <h5 class="card-title">${title}</h5>
                <p class="card-text">${text}</p>
                <a href="${linkUrl}" class="btn btn-primary" target="_blank">${linkText}</a>
            </div>
        </div>
    </div>
`;

// Função para exibir os resultados de busca
const displaySearchResults = (content, searchResults) => {
    // Adiciona o título dos resultados
    content.innerHTML = '<h2 class="result-title text-center mb-4">Resultados da busca</h2>';

    // Exibe os resultados de tracks
    if (searchResults.tracks) {
        searchResults.tracks.items.forEach(track => {
            const imageUrl = track.album.images?.[0]?.url || '';
            const cardContent = createCard(
                imageUrl,
                track.name,
                `Artista: ${track.artists[0].name}`,
                track.external_urls.spotify,
                'Ouça no Spotify'
            );
            content.innerHTML += cardContent;
        });
    }

    // Exibe os resultados de artistas
    if (searchResults.artists) {
        searchResults.artists.items.forEach(artist => {
            const imageUrl = artist.images?.[0]?.url || '';
            const cardContent = createCard(
                imageUrl,
                artist.name,
                `Popularidade: ${artist.popularity}`,
                artist.external_urls.spotify,
                'Veja no Spotify'
            );
            content.innerHTML += cardContent;
        });
    }

    // Exibe os resultados de álbuns
    if (searchResults.albums) {
        searchResults.albums.items.forEach(album => {
            const imageUrl = album.images?.[0]?.url || '';
            const cardContent = createCard(
                imageUrl,
                album.name,
                `Artista: ${album.artists[0].name}`,
                album.external_urls.spotify,
                'Veja no Spotify'
            );
            content.innerHTML += cardContent;
        });
    }
};

// Função para lidar com o envio do formulário de busca
const handleSearch = async (event, token, content) => {
    event.preventDefault();
    const query = document.getElementById('searchInput').value.trim();

    if (!query) {
        content.innerHTML = '<p>Por favor, insira um termo de busca.</p>';
        return;
    }

    try {
        const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,artist,album&limit=5`;
        const searchResults = await fetchSpotifyData(token, searchUrl);
        displaySearchResults(content, searchResults);
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        content.innerHTML = '<p>Erro ao buscar dados. Tente novamente.</p>';
    }
};

// Função principal
const main = async () => {
    try {
        const token = await getToken();
        const content = document.getElementById('content');

        // Verifique se os elementos DOM foram encontrados com sucesso
        if (!content) {
            console.error('Elemento de conteúdo não foi encontrado.');
            return;
        }

        // Adiciona evento de envio ao formulário
        const form = document.getElementById('searchForm');
        form.addEventListener('submit', (event) => handleSearch(event, token, content));
    } catch (error) {
        console.error('Erro:', error);
    }
};

// Aguarda o carregamento do DOM para executar a função main
document.addEventListener('DOMContentLoaded', main);
