import getToken from './src/auth.js';
import fetchSpotifyData from './src/spotify.js';

const form = document.getElementById('searchForm');
const input = document.getElementById('searchInput');
const status = document.getElementById('status');
const content = document.getElementById('content');

const escapar = (texto = '') => {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
};

const formatarDuracao = (ms) => {
    const total = Math.round(ms / 1000);
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

const formatarNumero = (n) => n.toLocaleString('pt-BR');

const imagem = (images, alt, redonda = false) => {
    const url = images?.[1]?.url || images?.[0]?.url;
    return url
        ? `<img src="${url}" alt="${escapar(alt)}" loading="lazy" class="${redonda ? 'redonda' : ''}">`
        : `<div class="sem-imagem ${redonda ? 'redonda' : ''}" aria-hidden="true">♪</div>`;
};

const renderMusicas = (tracks) => tracks.map((track) => `
    <li class="musica">
        ${imagem(track.album.images, track.album.name)}
        <div class="musica-info">
            <strong>${escapar(track.name)}</strong>
            <span>${escapar(track.artists.map((a) => a.name).join(', '))} · ${escapar(track.album.name)}</span>
        </div>
        <span class="duracao">${formatarDuracao(track.duration_ms)}</span>
        <a href="${track.external_urls.spotify}" target="_blank" rel="noopener" aria-label="Ouvir ${escapar(track.name)} no Spotify">Ouvir</a>
    </li>`).join('');

const renderCards = (itens, tipo) => itens.map((item) => `
    <a class="card" href="${item.external_urls.spotify}" target="_blank" rel="noopener">
        ${imagem(item.images, item.name, tipo === 'artista')}
        <strong>${escapar(item.name)}</strong>
        <span>${tipo === 'artista'
            ? (item.followers ? `${formatarNumero(item.followers.total)} seguidores` : 'Artista')
            : `${escapar(item.artists.map((a) => a.name).join(', '))} · ${(item.release_date || '').slice(0, 4)}`}</span>
    </a>`).join('');

const secao = (titulo, html, classe) => html
    ? `<section class="resultado"><h2>${titulo}</h2><div class="${classe}">${html}</div></section>`
    : '';

const mostrarResultados = ({ tracks, artists, albums }) => {
    const musicas = (tracks?.items || []).filter(Boolean);
    const artistas = (artists?.items || []).filter(Boolean);
    const albuns = (albums?.items || []).filter(Boolean);

    if (!musicas.length && !artistas.length && !albuns.length) {
        content.innerHTML = '';
        status.textContent = 'Nenhum resultado encontrado. Tente outro termo.';
        return;
    }

    status.textContent = '';
    content.innerHTML =
        secao('Músicas', musicas.length ? `<ol class="lista-musicas">${renderMusicas(musicas)}</ol>` : '', '') +
        secao('Artistas', renderCards(artistas, 'artista'), 'grade') +
        secao('Álbuns', renderCards(albuns, 'album'), 'grade');
};

const buscar = async (termo) => {
    const query = termo.trim();
    if (!query) return;

    status.textContent = 'Buscando...';
    status.classList.remove('erro');
    form.querySelector('button').disabled = true;

    try {
        const token = await getToken();
        const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,artist,album&limit=8&market=BR`;
        const resultados = await fetchSpotifyData(token, url);
        mostrarResultados(resultados);
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        content.innerHTML = '';
        status.textContent = 'Não foi possível buscar agora. Tente novamente em instantes.';
        status.classList.add('erro');
    } finally {
        form.querySelector('button').disabled = false;
    }
};

form.addEventListener('submit', (event) => {
    event.preventDefault();
    buscar(input.value);
});

document.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
        input.value = chip.textContent;
        buscar(chip.textContent);
    });
});
