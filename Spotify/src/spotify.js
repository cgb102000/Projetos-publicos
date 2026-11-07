// Faz uma requisição GET autenticada na Web API do Spotify.
const fetchSpotifyData = async (token, url) => {
    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(`Erro ao buscar dados do Spotify: ${data.error?.message || response.statusText}`);
    }

    return data;
};

export default fetchSpotifyData;
