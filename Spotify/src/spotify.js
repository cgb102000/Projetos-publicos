// Função para consumir dados do Spotify.
const fetchSpotifyData = async (token, url) => {
    // Faz a requisição para a URL especificada com o token de acesso.
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    // Converte a resposta para formato JSON.
    const data = await response.json();

    // Verifica se houve erro na resposta.
    if (!response.ok) {
        throw new Error(`Erro ao buscar dados do Spotify: ${data.error ? data.error.message : response.statusText}`);
    }

    // Retorna os dados obtidos.
    return data;
};

// Exporta a função `fetchSpotifyData` como exportação padrão.
export default fetchSpotifyData;
