// Use variáveis de ambiente para `clientId` e `clientSecret` para segurança.
const clientId = '11e84b174d2646ce8ee7a9bed8d4cabc';
const clientSecret = 'd961b8ffd2ff48cb80618e0b12755e09';

// Função para obter o token de acesso usando `clientId` e `clientSecret`.
const getToken = async () => {
    try {
        // Realizando uma solicitação POST à URL da API de token do Spotify.
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
            },
            // O corpo da solicitação especifica que o `grant_type` é 'client_credentials'.
            body: 'grant_type=client_credentials'
        });

        // Converte a resposta para formato JSON.
        const data = await response.json();

        // Verifica se a resposta foi bem-sucedida.
        if (!response.ok) {
            throw new Error(`Erro ao obter o token de acesso: ${data.error_description}`);
        }

        // Retorna o token de acesso.
        return data.access_token;
    } catch (error) {
        console.error('Erro ao obter o token de acesso:', error);
        throw error;
    }
};

// Exporta a função `getToken` como exportação padrão.
export default getToken;
